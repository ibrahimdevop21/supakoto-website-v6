#!/usr/bin/env node
/**
 * Route/claim smoke against a running build (default http://localhost:3111).
 * Recreates the Phase-14 combined smoke (routes + dir, Phase-14 redirects,
 * section anchors, lifetime scoping + qualifier adjacency, TAKAI table,
 * pending-product guard, TK-7099-IR) and adds the VP-review checks
 * (no Silver/TAKAI 5 alias, no manufacturer framing, no emoji flags,
 * new phone numbers, retired numbers absent).
 *
 *   pnpm build && PORT=3111 pnpm start &   then   node scripts/smoke.mjs
 */
const BASE = process.env.BASE ?? "http://localhost:3111";
let pass = 0, fail = 0;
const ok = (cond, label) => { cond ? pass++ : fail++; console.log(`${cond ? "PASS" : "FAIL"}  ${label}`); };
const get = async (path, redirect = "manual") => {
  const r = await fetch(BASE + path, { redirect });
  return { status: r.status, location: r.headers.get("location"), html: redirect === "manual" ? "" : await r.text() };
};
const visible = (html) => html.replace(/<script[\s\S]*?<\/script>/g, "");

const ROUTES = ["/", "/services", "/services/building-heat-isolation", "/services/building-heat-isolation/quote", "/warranty", "/warranty/claim", "/booking", "/branches", "/about", "/franchise", "/business", "/gallery", "/faq", "/contact", "/careers"];
for (const r of ROUTES) {
  const ar = await get(r, "follow"); const en = await get("/en" + r, "follow");
  ok(ar.status === 200 && /<html[^>]*dir="rtl"/.test(ar.html), `200 + rtl  ${r}`);
  ok(en.status === 200 && /<html[^>]*dir="ltr"/.test(en.html), `200 + ltr  /en${r}`);
}
// Phase 14 redirects
const IDS = ["ppf", "heat-isolation", "colour-change", "nano-ceramic", "marine-ppf", "surface-protection"];
for (const id of IDS) {
  const a = await get(`/services/${id}`); const e = await get(`/en/services/${id}`);
  ok([301, 308].includes(a.status) && a.location?.endsWith(`/services#${id}`), `redirect /services/${id} → /services#${id}`);
  ok([301, 308].includes(e.status) && e.location?.endsWith(`/en/services#${id}`), `redirect /en/services/${id} → /en/services#${id}`);
}
// anchors + claim checks on /services (both locales)
for (const loc of ["", "/en"]) {
  const s = visible((await get(loc + "/services", "follow")).html);
  ok(["ppf", "heat-isolation", "colour-change", "nano-ceramic", "building-heat-isolation", "marine-ppf", "surface-protection"].every((id) => s.includes(`id="${id}"`)), `7 anchors ${loc}/services`);
  ok(!/SK-BLD/.test(s), `no SK-BLD ${loc}/services`);
  const b = visible((await get(loc + "/services/building-heat-isolation", "follow")).html);
  ok(/TK-7099-IR/.test(b), `TK-7099-IR present ${loc}/services/building-heat-isolation`);
  ok(!/SK-BLD/.test(b), `no SK-BLD ${loc}/services/building-heat-isolation`);
  const lifetimeHits = (s.match(/lifetime|مدى الحياة/gi) || []).length;
  ok(lifetimeHits > 0 && /warranty\.qualifier|مدى حياة السيارة|lifetime of the vehicle/i.test(s), `lifetime scoped with qualifier ${loc}/services`);
}
// lifetime must NOT be visible on these
for (const p of ["/", "/about", "/branches", "/faq", "/en", "/en/about", "/en/faq"]) {
  const s = visible((await get(p, "follow")).html);
  ok(!/lifetime warranty|ضمان مدى الحياة/i.test(s), `no bare lifetime on ${p}`);
}
// VP review claims
for (const p of ["/", "/en", "/warranty", "/en/warranty", "/about", "/en/about", "/faq", "/en/faq", "/franchise", "/en/franchise"]) {
  const s = visible((await get(p, "follow")).html);
  ok(!/\(TAKAI 5\)|SILVER[^<]{0,40}TAKAI 5|TAKAI 5[^<]{0,40}SILVER/i.test(s), `no Silver/TAKAI 5 alias on ${p}`);
  ok(!/made (exclusively )?for us|for us alone|specifications we set|لنا حصريا|خصيصا لنا|تصنع في اليابان لنا|نحددها نحن/i.test(s), `no manufacturer framing on ${p}`);
  ok(!/[\u{1F1E6}-\u{1F1FF}]/u.test(s), `no emoji flag on ${p}`);
}
// phones
const br = (await get("/branches", "follow")).html;
for (const n of ["201012747478", "201103670059", "201100512230", "201044202946", "201126978186", "971552054478"]) ok(br.includes(`wa.me/${n}`), `branch wa.me ${n}`);
ok(!/50 626 5404|506265404|01220080189|01156608134|01127232340/.test(br), "retired numbers absent on /branches");
// TAKAI table on home + region hint
const home = visible((await get("/", "follow")).html);
ok(/TAKAI PREMIUM PLUS/.test(home) && /TAKAI 5\b/.test(home), "home TAKAI table (Egypt default) renders");
console.log(`\n${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
