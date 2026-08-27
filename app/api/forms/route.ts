import { NextRequest, NextResponse } from "next/server";
import { isRef } from "@/lib/ref";
import { FORM_SPECS, FIELD_LABELS, ATTRIBUTION_KEYS, type FormKey } from "@/lib/forms/spec";
import en from "@/messages/en.json";

export const runtime = "nodejs";

/**
 * The single destination for everything the site collects (master prompt
 * 2026-08-25): nine surfaces — five standalone forms, three booking-wizard
 * flows, the building quote page — POST here → Resend → info@supakoto.org.
 * One recipient, no per-form routing. Subject is sortable by hand:
 *   <emoji> [TAG] — <service EN> — <name> — <SK-ref>
 * Body is plain text: ref first, every field, then the attribution the
 * sk-attribution cookie carried (appended client-side — this route never
 * touches the tracking layer). Reply-To = visitor email where collected.
 *
 * Never fakes success: no key → 503, Resend rejects → 502, Resend accepts
 * without an id → 502. Spam gates: same-site Origin, honeypot ("website"),
 * per-IP in-memory rate limit (per warm instance — a gate, not a fortress).
 */

// Env fallbacks MUST match .env.example — scripts/check-email-fallbacks.mjs
// fails the build otherwise. A missing env var must never route mail to a
// dead address again (that is how nine leads were lost in August 2026).
const FALLBACK_TO = "info@supakoto.org";
const FALLBACK_FROM = "SupaKoto Website <noreply@supakoto.org>";

// Vercel caps a Node function's request body at 4.5 MB — anything larger 413s
// before this code runs. Keep the whole multipart under that: 4 MB of files
// total, and ClaimForm enforces the same total client-side with a clear message.
const MAX_FILE_BYTES = 4 * 1024 * 1024;
const MAX_TOTAL_FILE_BYTES = 4 * 1024 * 1024;
const ALLOWED_FILE_TYPES =
  /^(image\/(jpeg|png|webp|heic|heif)|application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document)$/;
const MAX_FIELD_CHARS = 4000;
const MAX_FIELDS = 40;
const RESERVED = new Set(["form", "ref", "locale", "website"]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Idempotency by SK-ref (per warm instance): a client whose 15 s timeout
 * fired while Resend was still accepting would otherwise resend the same
 * request and the inbox would get two emails with one ref. A repeat of a
 * ref this instance already delivered answers with the original id.
 */
const sentRefs = new Map<string, string>();

/** Per-IP: max 5 REAL attempts per 10 minutes (per warm instance) — counted
 * only once a request has passed validation, so a 400/503 never burns it. */
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;
const hits = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear(); // unbounded-growth backstop
  return list.length > RATE_MAX;
}

/**
 * Same-site check: the Origin (or Referer) host must be the request's own
 * host. Covers supakoto.com, every Vercel preview URL, and localhost alike
 * without a hard-coded allow-list. Requests with neither header are
 * rejected — browsers always send Origin on a same-site or cross-site POST.
 */
function sameSite(req: NextRequest): boolean {
  const own = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "";
  const source = req.headers.get("origin") ?? req.headers.get("referer") ?? "";
  if (!own || !source) return false;
  try {
    return new URL(source).host === own;
  } catch {
    return false;
  }
}

/** One line, no control characters — a name must not inject headers. */
function clean(value: string): string {
  return value.replace(/[\u0000-\u001f\u007f]+/g, " ").trim();
}

const EN = en as {
  services: { items: Record<string, { name: string }> };
  branches: { items: Record<string, { name: string }> };
  buildingQuote: { governorates: Record<string, string>; emirates: Record<string, string> };
};

/** English display value for the fields whose raw value is an id. */
function display(key: string, value: string): string {
  switch (key) {
    case "service":
      return EN.services.items[value]?.name ?? value;
    case "branch":
      return EN.branches.items[value]?.name ?? value;
    case "region":
      return value === "egypt" ? "Egypt" : value === "uae" ? "UAE" : value;
    case "area":
      return EN.buildingQuote.governorates[value] ?? EN.buildingQuote.emirates[value] ?? value;
    default:
      return value;
  }
}

/** The "<service>" slot of the subject, per form spec. */
function serviceSlot(spec: (typeof FORM_SPECS)[FormKey], fields: Map<string, string>): string {
  if (spec.serviceFrom === null) return spec.serviceLabel;
  const raw = fields.get(spec.serviceFrom) ?? "";
  const named = raw
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean)
    .map((v) => spec.serviceMap?.[v] ?? display("service", v));
  return named.length ? named.join(", ") : spec.serviceLabel;
}

export async function POST(req: NextRequest) {
  if (!sameSite(req)) {
    // Logged: a proxy rewriting Host, or a browser stripping Origin, would
    // otherwise be a silent whole-site lead outage.
    console.error("[forms] origin rejected", {
      host: req.headers.get("x-forwarded-host") ?? req.headers.get("host"),
      origin: req.headers.get("origin"),
      referer: req.headers.get("referer"),
    });
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  let data: FormData;
  try {
    data = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  const form = String(data.get("form") ?? "") as FormKey;
  const ref = String(data.get("ref") ?? "");
  const locale = String(data.get("locale") ?? "");
  const spec = FORM_SPECS[form];
  if (!spec || !isRef(ref)) {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  // Honeypot: bots fill it; humans never see it. Answer with an ERROR, not a
  // fake success: a password manager that autofills the hidden field would
  // otherwise show a real visitor a success screen for a lead that never
  // sent. The error state offers the WhatsApp fallback, so nothing is lost.
  if (String(data.get("website") ?? "") !== "") {
    return NextResponse.json({ ok: false, error: "rejected" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[forms] RESEND_API_KEY unset — refusing to fake success", { ref, form });
    return NextResponse.json({ ok: false, error: "email_unconfigured" }, { status: 503 });
  }

  // Collect fields + files. Attribution keys are split out into their own block.
  const fields = new Map<string, string>();
  const attribution = new Map<string, string>();
  const attachments: Array<{ filename: string; content: string }> = [];
  let fieldCount = 0;
  let totalFileBytes = 0;
  for (const [key, value] of data.entries()) {
    if (RESERVED.has(key)) continue;
    if (typeof value === "string") {
      if (++fieldCount > MAX_FIELDS) break;
      const v = clean(value.slice(0, MAX_FIELD_CHARS));
      if (key.startsWith("attr_")) {
        const attrKey = key.slice(5);
        if ((ATTRIBUTION_KEYS as readonly string[]).includes(attrKey) && v) attribution.set(attrKey, v);
      } else {
        fields.set(key, v);
      }
    } else {
      if (value.size === 0) continue;
      if (attachments.length >= spec.maxFiles) continue;
      totalFileBytes += value.size;
      if (value.size > MAX_FILE_BYTES || totalFileBytes > MAX_TOTAL_FILE_BYTES || !ALLOWED_FILE_TYPES.test(value.type)) {
        return NextResponse.json({ ok: false, error: "bad_file" }, { status: 400 });
      }
      attachments.push({
        filename: clean(value.name) || `${key}-${attachments.length + 1}`,
        content: Buffer.from(await value.arrayBuffer()).toString("base64"),
      });
    }
  }

  // Validation passed: this is a real attempt — now it counts against the limit.
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }
  const already = sentRefs.get(ref);
  if (already) {
    return NextResponse.json({ ok: true, id: already });
  }

  // Subject slot for the name: short, so the SK-ref at the end never folds off.
  const name = (fields.get("name") || fields.get("company") || fields.get("plate") || "").slice(0, 60);
  const visitorEmail = fields.get("email") ?? "";
  const replyTo = EMAIL_RE.test(visitorEmail) ? visitorEmail : "";

  const subject = [`${spec.emoji} [${spec.tag}]`, serviceSlot(spec, fields), name || null, ref]
    .filter(Boolean)
    .join(" — ");

  // Body: ref first, then fields in the spec's order (unknown extras last),
  // then attribution. Plain and scannable.
  const ordered = [
    ...spec.fields.filter((k) => fields.has(k)),
    ...[...fields.keys()].filter((k) => !spec.fields.includes(k)),
  ];
  const lines = ordered.map((k) => `${FIELD_LABELS[k] ?? k}: ${display(k, fields.get(k) ?? "")}`);
  const attributionLines = attribution.size
    ? [...attribution.entries()].map(([k, v]) => `${k}: ${v}`)
    : ["(none — direct visit or cookies blocked)"];
  const text = [
    `Ref: ${ref}`,
    `Form: ${spec.tag} (${form}) · Locale: ${locale || "?"} · ${new Date().toISOString()}`,
    "",
    ...lines,
    "",
    "Attribution",
    ...attributionLines,
    "",
  ].join("\n");

  const to = process.env.FORMS_TO_EMAIL ?? FALLBACK_TO;
  const from = process.env.FORMS_FROM_EMAIL ?? FALLBACK_FROM;

  let res: Response;
  try {
    res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        text,
        ...(replyTo ? { reply_to: [replyTo] } : {}),
        ...(attachments.length ? { attachments } : {}),
      }),
    });
  } catch (error: unknown) {
    console.error("[forms] resend unreachable", {
      ref,
      form,
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ ok: false, error: "send_failed" }, { status: 502 });
  }

  if (!res.ok) {
    console.error("[forms] resend error", { ref, form, status: res.status, body: (await res.text()).slice(0, 300) });
    return NextResponse.json({ ok: false, error: "send_failed" }, { status: 502 });
  }
  const { id } = (await res.json().catch(() => ({}))) as { id?: string };
  if (!id) {
    // 2xx without an id is not a confirmed accept — treat as failure rather than guess.
    console.error("[forms] resend accepted without id", { ref, form });
    return NextResponse.json({ ok: false, error: "send_failed" }, { status: 502 });
  }
  sentRefs.set(ref, id);
  if (sentRefs.size > 5000) sentRefs.clear(); // unbounded-growth backstop
  return NextResponse.json({ ok: true, id });
}
