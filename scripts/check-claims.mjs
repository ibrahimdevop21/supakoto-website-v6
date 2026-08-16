#!/usr/bin/env node
/**
 * Claims guard — build fails on any regression of the claim corrections
 * from Dr. Amer's review (2026-08-16). Same mechanism as the phone-literal
 * guard: static scan of copy + runtime code, exit 1 with a file:line list.
 *
 *  1. HEAT-IN-PPF   PPF / Premium Plus is body-panel paint protection. No
 *                   heat-isolation, IR/UV-rejection or cabin-temperature
 *                   language in a PPF, Premium Plus, TAKAI-tier or vehicle
 *                   warranty context. Self-healing "heals with heat" is
 *                   physically correct and whitelisted by key. The automotive
 *                   and building heat-isolation surfaces are out of scope.
 *  2. SILVER≠5      TAKAI SILVER (UAE) and TAKAI 5 (Egypt) are never named
 *                   together, aliased, or described as the same film.
 *  3. DISTRIBUTOR   SupaKoto is TAKAI's exclusive DISTRIBUTOR. Never "made
 *                   for us / exclusively for us / to our spec / our own
 *                   formulation" about the film.
 *  4. NO EMOJI FLAG No regional-indicator emoji anywhere (Windows renders
 *                   them as letters). Use image assets.
 *  5. LIFETIME      "lifetime" only under the allowed message namespaces
 *                   (/warranty, PPF section, tier card, TAKAI term label).
 *  6. SUPERLATIVE   No unsubstantiated "best / finest / number one / أفضل /
 *                   الأفضل / الأول" attached to the brand, film, material,
 *                   protection, installation, quality or price (STRUCTURE-SPEC
 *                   §1 traceability). Comparatives in advice ("better than
 *                   automatic brushes") and "first day/first shipment" are fine.
 *
 *  7. COMPETITOR    No competitor brand name anywhere in messages, content, app
 *                   or components (3M, XPEL, SunTek, Llumar, STEK, Garware).
 *                   Counterfeit film is a category problem, never a named
 *                   company — legal exposure, not style.
 *
 * Comments in .ts/.tsx are stripped before scanning so the rules can be
 * documented in code without tripping the guard.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CODE_DIRS = ["app", "components", "lib", "i18n", "content"];
const CODE_EXT = new Set([".ts", ".tsx"]);
const violations = [];
const fail = (file, where, rule, text) =>
  violations.push(`${file}:${where}  [${rule}]  ${String(text).trim().slice(0, 140)}`);

/* ---------- helpers ---------- */
function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) yield* walk(full);
    else if (CODE_EXT.has(path.extname(full))) yield full;
  }
}
function flatten(obj, prefix = "", out = {}) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object") flatten(v, key, out);
    else out[key] = String(v);
  }
  return out;
}
const stripComments = (src) =>
  src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");

/* ---------- rules ---------- */
const HEAT = /heat|thermal|infrared|\bIR\b|\bUV\b|ultraviolet|cabin temperature|حرار|عزل|عازل|الأشعة تحت الحمراء|فوق البنفسجية/i;
const PPF_CONTEXT = /^(services\.items\.ppf\.|takai\.|warranty\.(?!buildings)|home\.takai\.|home\.features\.takai\.)/;
const HEAT_ALLOW_KEYS = new Set([
  "services.items.ppf.solutions.b1", // self-healing with heat
  "warranty.rows.selfHealing.value", // self-healing with heat
]);
const SILVER = /\bSILVER\b|سيلفر/i;
const TAKAI5 = /TAKAI\s*5\b|تاكاي\s*5/i;
const ALTNAME = /\baltName\b/;
const MADE_FOR_US =
  /made\s+(exclusively\s+)?for\s+us|made\s+in\s+japan\s+for\s+us|for\s+us\s+alone|spec(ification)?s?\s+(that\s+)?we\s+(set|define|specify)|exclusively\s+for\s+(us|supakoto)|(made|produced|manufactured)\s+for\s+supakoto|our\s+own\s+formulation|to\s+our\s+(own\s+)?spec(ification)?s?\b.*(film|takai)|(film|takai).*to\s+our\s+(own\s+)?spec|لنا حصريا|حصريا لنا|خصيصا لنا|تصنع لنا|تصنع\s+في\s+اليابان\s+لنا|نحددها\s+نحن|بمواصفات\s+نحددها|صنعت من أجلنا|مصنوع(ة)? لنا|(فيلم|خامة|takai).*بمواصفاتنا|بمواصفاتنا.*(فيلم|خامة|takai)/i;
const EMOJI_FLAG = /[\u{1F1E6}-\u{1F1FF}]/u;
const LIFETIME = /lifetime|مدى الحياة/i;
const LIFETIME_ALLOW = /^(warranty\.|services\.items\.ppf\.|takai\.terms\.lifetime$)/;
const COMPETITOR = /\b3M\b|\b(xpel|suntek|llumar|stek|garware)\b/i;
const SUPERLATIVE =
  /\b(the\s+)?(best|finest|number\s*one|no\.\s*1|#1)\s+(japanese\s+)?(film|films|material|materials|protection|installation|quality|price|prices|brand|ppf|choice|in\s+(egypt|the\s+uae|the\s+middle\s+east|the\s+market))|(^|\s)(أفضل|الأفضل)\s+(خامة|فيلم|أفلام|حماية|منتج|علامة|تركيب|جودة|سعر|أسعار|اختيار)|(الاسم|العلامة|الشركة|الوكيل|المركز)\s+الأول(ى)?\b|الأول(ى)?\s+في\s+(مصر|الإمارات|الشرق\s+الأوسط|السوق)/i;

/* ---------- messages ---------- */
for (const loc of ["en", "ar"]) {
  const file = `messages/${loc}.json`;
  const flat = flatten(JSON.parse(readFileSync(path.join(ROOT, file), "utf8")));
  for (const [key, val] of Object.entries(flat)) {
    if (PPF_CONTEXT.test(key) && !HEAT_ALLOW_KEYS.has(key) && HEAT.test(val))
      fail(file, key, "heat-in-ppf", val);
    if (SILVER.test(val) && TAKAI5.test(val)) fail(file, key, "silver≠takai5", val);
    if (MADE_FOR_US.test(val)) fail(file, key, "distributor-not-manufacturer", val);
    if (EMOJI_FLAG.test(val)) fail(file, key, "emoji-flag", val);
    if (LIFETIME.test(val) && !LIFETIME_ALLOW.test(key)) fail(file, key, "lifetime-scope", val);
    if (SUPERLATIVE.test(val)) fail(file, key, "superlative", val);
    if (COMPETITOR.test(val)) fail(file, key, "competitor-name", val);
  }
}

/* ---------- code ---------- */
for (const dir of CODE_DIRS) {
  for (const file of walk(path.join(ROOT, dir))) {
    const rel = path.relative(ROOT, file);
    const lines = stripComments(readFileSync(file, "utf8")).split("\n");
    lines.forEach((line, i) => {
      const where = i + 1;
      if (SILVER.test(line) && TAKAI5.test(line)) fail(rel, where, "silver≠takai5", line);
      if (ALTNAME.test(line)) fail(rel, where, "silver≠takai5 (altName alias)", line);
      if (MADE_FOR_US.test(line)) fail(rel, where, "distributor-not-manufacturer", line);
      if (EMOJI_FLAG.test(line)) fail(rel, where, "emoji-flag", line);
      if (SUPERLATIVE.test(line)) fail(rel, where, "superlative", line);
      if (COMPETITOR.test(line)) fail(rel, where, "competitor-name", line);
    });
    // Heat language inside the PPF/TAKAI data files (not the services
    // catalogue, which legitimately lists the heat-isolation services).
    if (/^content\/(takai|warranty)\.ts$/.test(rel)) {
      lines.forEach((line, i) => {
        if (HEAT.test(line)) fail(rel, i + 1, "heat-in-ppf", line);
      });
    }
  }
}

if (violations.length) {
  console.error("\n✗ Claims guard failed:\n");
  for (const v of violations) console.error("  " + v);
  console.error(
    "\nRules: docs/STRUCTURE-SPEC.md → “Claim discipline”. PPF never claims heat; " +
      "SILVER and TAKAI 5 are never equated; SupaKoto distributes, TAKAI manufactures; " +
      "no emoji flags; lifetime stays scoped; no best/finest/أفضل superlatives on brand or product; no competitor brand names.\n",
  );
  process.exit(1);
}
console.log("✓ Claims guard: no heat-in-PPF, Silver/TAKAI 5, manufacturer-framing, emoji-flag, lifetime-scope, superlative or competitor-name violations.");
