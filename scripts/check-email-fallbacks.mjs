#!/usr/bin/env node
/**
 * Build guard (Ibrahim, 2026-08-25): the code fallbacks for the forms
 * recipient/sender must equal the documented env defaults, and no
 * supakoto.com mailbox may appear anywhere in runtime code. Nine leads were
 * lost in August 2026 when mail routed to an address whose domain had
 * silently expired — a missing env var must never route to a dead address.
 *
 * Checks:
 *  1. FALLBACK_TO / FALLBACK_FROM in app/api/forms/route.ts == FORMS_TO_EMAIL /
 *     FORMS_FROM_EMAIL in .env.example (the FROM comparison is on the
 *     address inside <…>).
 *  2. FORMS_FROM_EMAIL is exactly noreply@supakoto.org — the Resend API key
 *     is domain-scoped to supakoto.org and 403s on any other FROM domain
 *     (measured 2026-08-27: "This API key is not authorized to send emails
 *     from send.supakoto.org"). Via check 1 this pins the code fallback too.
 *  3. No "<anything>@supakoto.com" mail address ANYWHERE in the codebase
 *     (Ibrahim, 2026-08-25: no mailbox exists on the .com domain — the
 *     address the site displayed bounced publicly). supakoto.com is correct as a URL and wrong as a mail
 *     domain — the regex requires a local part so URLs never trip it.
 *     Historical docs under docs/ are not scanned.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const read = (p) => readFileSync(path.join(ROOT, p), "utf8");
const failures = [];

const env = Object.fromEntries(
  read(".env.example")
    .split("\n")
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1).trim().replace(/^"(.*)"$/, "$1")];
    }),
);
const route = read("app/api/forms/route.ts");
const addr = (s) => (s.match(/<([^>]+)>/) ?? [null, s])[1].trim();
const constant = (name) => (route.match(new RegExp(`const ${name} = "([^"]+)"`)) ?? [])[1];

const fallbackTo = constant("FALLBACK_TO");
const fallbackFrom = constant("FALLBACK_FROM");
if (!fallbackTo || !fallbackFrom) failures.push("route.ts: FALLBACK_TO / FALLBACK_FROM constants not found");
if (fallbackTo && fallbackTo !== env.FORMS_TO_EMAIL)
  failures.push(`FALLBACK_TO "${fallbackTo}" != .env.example FORMS_TO_EMAIL "${env.FORMS_TO_EMAIL}"`);
if (fallbackFrom && addr(fallbackFrom) !== addr(env.FORMS_FROM_EMAIL ?? ""))
  failures.push(`FALLBACK_FROM "${addr(fallbackFrom)}" != .env.example FORMS_FROM_EMAIL "${addr(env.FORMS_FROM_EMAIL ?? "")}"`);
const AUTHORIZED_FROM = "noreply@supakoto.org"; // Resend key's domain scope
if (addr(env.FORMS_FROM_EMAIL ?? "") !== AUTHORIZED_FROM)
  failures.push(`FORMS_FROM_EMAIL must be ${AUTHORIZED_FROM} (Resend key is scoped to supakoto.org), got "${env.FORMS_FROM_EMAIL}"`);
if (fallbackFrom && addr(fallbackFrom) !== AUTHORIZED_FROM)
  failures.push(`FALLBACK_FROM must be ${AUTHORIZED_FROM} (Resend key is scoped to supakoto.org), got "${addr(fallbackFrom)}"`);

const SCAN_DIRS = ["app", "components", "lib", "content", "messages", "i18n", "scripts"];
const SCAN_FILES = [".env.example", "next.config.ts", "middleware.ts", "CHECKPOINT.md"];
const EXT = new Set([".ts", ".tsx", ".json", ".mjs", ".md"]);
const MAIL_RE = /[A-Za-z0-9._%+-]+@supakoto\.com\b/;
function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) yield* walk(full);
    else if (EXT.has(path.extname(full))) yield full;
  }
}
const { existsSync } = await import("node:fs");
const targets = [
  ...SCAN_DIRS.filter((d) => existsSync(path.join(ROOT, d))).flatMap((d) => [...walk(path.join(ROOT, d))]),
  ...SCAN_FILES.map((f) => path.join(ROOT, f)).filter((f) => existsSync(f)),
];
for (const file of targets) {
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    const m = line.match(MAIL_RE);
    if (m) failures.push(`${path.relative(ROOT, file)}:${i + 1}: "${m[0]}" — no mailbox exists on supakoto.com; use @supakoto.org`);
  });
}

if (failures.length) {
  console.error("check-email-fallbacks: FAIL");
  for (const f of failures) console.error("  " + f);
  process.exit(1);
}
console.log(`check-email-fallbacks: OK (to=${fallbackTo}, from=${addr(fallbackFrom)})`);
