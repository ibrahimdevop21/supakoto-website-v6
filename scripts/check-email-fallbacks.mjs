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
 *  2. FORMS_FROM_EMAIL is on send.supakoto.org (the SPF-authorised subdomain;
 *     the root domain runs cPanel mail and must not send).
 *  3. No "@supakoto.com" literal in the sending code (app/api, lib/forms). The
 *     PUBLIC contact address shown in the footer/contact page is a separate
 *     decision and is not checked here.
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
if (!/@send\.supakoto\.org$/.test(addr(env.FORMS_FROM_EMAIL ?? "")))
  failures.push(`FORMS_FROM_EMAIL must be on send.supakoto.org (SPF-authorised), got "${env.FORMS_FROM_EMAIL}"`);

const SCAN_DIRS = ["app/api", "lib/forms"];
const EXT = new Set([".ts", ".tsx", ".json"]);
function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) yield* walk(full);
    else if (EXT.has(path.extname(full))) yield full;
  }
}
for (const dir of SCAN_DIRS) {
  for (const file of walk(path.join(ROOT, dir))) {
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, i) => {
      if (/@supakoto\.com\b/.test(line))
        failures.push(`${path.relative(ROOT, file)}:${i + 1}: supakoto.com mailbox literal — use the .org env defaults`);
    });
  }
}

if (failures.length) {
  console.error("check-email-fallbacks: FAIL");
  for (const f of failures) console.error("  " + f);
  process.exit(1);
}
console.log(`check-email-fallbacks: OK (to=${fallbackTo}, from=${addr(fallbackFrom)})`);
