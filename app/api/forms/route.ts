import { NextRequest, NextResponse } from "next/server";
import { isRef } from "@/lib/ref";

export const runtime = "nodejs";

/**
 * The five site forms' destination (Phase 23): one route → Resend →
 * info@supakoto.com with a per-form subject tag (recipient/from
 * overridable via env when per-team inboxes exist). SK-ref in the
 * subject, reply-to the visitor. Spam gates: honeypot field ("website")
 * and a per-IP in-memory rate limit — per serverless instance, a basic
 * gate rather than a fortress; the honeypot does most of the work.
 * Without RESEND_API_KEY the route answers 503 and the form shows its
 * error state — it never fakes success (LD-2).
 */

const FORMS: Record<string, { tag: string; maxFiles: number }> = {
  contact: { tag: "Contact", maxFiles: 0 },
  careers: { tag: "Careers", maxFiles: 1 },
  franchise: { tag: "Franchise", maxFiles: 0 },
  business: { tag: "Business", maxFiles: 0 },
  warranty_claim: { tag: "Warranty claim", maxFiles: 4 },
};

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES =
  /^(image\/(jpeg|png|webp|heic|heif)|application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document)$/;
const MAX_FIELD_CHARS = 4000;
const MAX_FIELDS = 24;

/** Per-IP: max 5 submissions per 10 minutes (per warm instance). */
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

export async function POST(req: NextRequest) {
  let data: FormData;
  try {
    data = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  const form = String(data.get("form") ?? "");
  const ref = String(data.get("ref") ?? "");
  const locale = String(data.get("locale") ?? "");
  const spec = FORMS[form];
  if (!spec || !isRef(ref)) {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  // Honeypot: bots fill it; humans never see it. Answer ok so the bot moves on.
  if (String(data.get("website") ?? "") !== "") {
    return NextResponse.json({ ok: true, id: "accepted" });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[forms] RESEND_API_KEY unset — refusing to fake success");
    return NextResponse.json({ ok: false, error: "email_unconfigured" }, { status: 503 });
  }

  // Collect fields + files.
  const lines: string[] = [];
  const attachments: Array<{ filename: string; content: string }> = [];
  let visitorEmail = "";
  let subjectName = "";
  let fieldCount = 0;
  for (const [key, value] of data.entries()) {
    if (["form", "ref", "locale", "website"].includes(key)) continue;
    if (typeof value === "string") {
      if (++fieldCount > MAX_FIELDS) break;
      const v = value.slice(0, MAX_FIELD_CHARS);
      if (key === "email") visitorEmail = v;
      if (key === "name" || (form === "warranty_claim" && key === "plate" && !subjectName)) subjectName = v;
      lines.push(`${key}: ${v}`);
    } else {
      if (value.size === 0) continue;
      if (attachments.length >= spec.maxFiles) continue;
      if (value.size > MAX_FILE_BYTES || !ALLOWED_FILE_TYPES.test(value.type)) {
        return NextResponse.json({ ok: false, error: "bad_file" }, { status: 400 });
      }
      attachments.push({
        filename: value.name || `${key}-${attachments.length + 1}`,
        content: Buffer.from(await value.arrayBuffer()).toString("base64"),
      });
    }
  }

  const to = process.env.FORMS_TO_EMAIL ?? "info@supakoto.com";
  const from = process.env.FORMS_FROM_EMAIL ?? "SupaKoto Website <forms@supakoto.com>";
  const subject = `[${spec.tag}] ${ref}${subjectName ? ` — ${subjectName}` : ""}`;
  const text =
    `${spec.tag} form submission from supakoto.com\n` +
    `Ref: ${ref}\nLocale: ${locale || "?"}\n\n${lines.join("\n")}\n`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text,
      ...(visitorEmail ? { reply_to: [visitorEmail] } : {}),
      ...(attachments.length ? { attachments } : {}),
    }),
  });

  if (!res.ok) {
    console.error("[forms] resend error", res.status, (await res.text()).slice(0, 300));
    return NextResponse.json({ ok: false, error: "send_failed" }, { status: 502 });
  }
  const { id } = (await res.json()) as { id?: string };
  return NextResponse.json({ ok: true, id: id ?? "sent" });
}
