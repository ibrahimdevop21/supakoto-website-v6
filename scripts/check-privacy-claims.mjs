#!/usr/bin/env node
/**
 * Build guard (Phase 22): the privacy policy may never contradict the
 * tracking that actually runs. The live site claimed "a single cookie, no
 * advertising trackers" while GA4 / Meta / TikTok / Ads pixels were
 * armed — this guard makes that class of lie a build failure.
 *
 * When ANY pixel env var is set (process.env first, .env.local /
 * .env.example fallback so it also fails on dev machines):
 *  1. privacy copy (sections + SEO, both locales) must not claim
 *     no-advertising-tracking or a single cookie;
 *  2. privacy copy must name Google, Meta and TikTok in each locale.
 */
import { readFileSync, existsSync } from "node:fs";

const PIXEL_VARS = [
  "NEXT_PUBLIC_GA4_ID",
  "NEXT_PUBLIC_META_PIXEL_ID",
  "NEXT_PUBLIC_TIKTOK_PIXEL_ID",
  "NEXT_PUBLIC_GOOGLE_ADS_ID",
];

function envValue(name) {
  if (process.env[name]) return process.env[name];
  for (const file of [".env.local", ".env.example"]) {
    if (!existsSync(file)) continue;
    const m = readFileSync(file, "utf8").match(new RegExp(`^${name}=(.+)$`, "m"));
    if (m && m[1].trim()) return m[1].trim();
  }
  return "";
}

const armed = PIXEL_VARS.filter((v) => envValue(v));
if (armed.length === 0) {
  console.log("✓ privacy-claims guard: no pixel env vars set — nothing to contradict");
  process.exit(0);
}

const FORBIDDEN = [
  /no advertising track/i,
  /No advertising trackers/i,
  /a single cookie/i,
  /(only|just) one cookie/i,
  /بدون أي تتبع/,
  /بدون تتبع/,
  /لا تتبع إعلاني/,
  /ملف كوكيز واحد/,
  /كوكيز واحدا/,
];
const REQUIRED = {
  en: [/Google/, /Meta/, /TikTok/],
  ar: [/جوجل/, /ميتا/, /تيك توك/],
};

const failures = [];
for (const locale of ["en", "ar"]) {
  const messages = JSON.parse(readFileSync(`messages/${locale}.json`, "utf8"));
  const privacy = JSON.stringify(messages.privacy ?? {});
  for (const p of FORBIDDEN) {
    if (p.test(privacy))
      failures.push(`messages/${locale}.json privacy copy matches forbidden claim ${p} while pixels are set (${armed.join(", ")})`);
  }
  for (const r of REQUIRED[locale]) {
    if (!r.test(privacy))
      failures.push(`messages/${locale}.json privacy copy does not name ${r} — every platform receiving data must be named`);
  }
}

if (failures.length) {
  console.error("✗ check-privacy-claims: the privacy policy contradicts the configured tracking\n");
  for (const f of failures) console.error("  - " + f);
  process.exit(1);
}
console.log(`✓ privacy-claims guard: pixels armed (${armed.length} ids) and the privacy copy discloses them in both locales`);
