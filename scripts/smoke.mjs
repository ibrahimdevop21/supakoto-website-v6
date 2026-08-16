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

const ROUTES = ["/", "/authentic", "/services", "/services/building-heat-isolation", "/services/building-heat-isolation/quote", "/warranty", "/warranty/claim", "/booking", "/branches", "/about", "/franchise", "/business", "/gallery", "/faq", "/contact", "/careers"];
for (const r of ROUTES) {
  const ar = await get(r, "follow"); const en = await get("/en" + r, "follow");
  ok(ar.status === 200 && /<html[^>]*dir="rtl"/.test(ar.html), `200 + rtl  ${r}`);
  ok(en.status === 200 && /<html[^>]*dir="ltr"/.test(en.html), `200 + ltr  /en${r}`);
}
// Phase 17: the seven service pages are real routes again (no anchor redirects).
const SLUGS = ["ppf", "heat-isolation", "colour-change", "nano-ceramic", "building-heat-isolation", "marine-ppf", "surface-protection"];
const NOINDEX = new Set(["marine-ppf", "surface-protection"]);
for (const slug of SLUGS) for (const loc of ["", "/en"]) {
  const r = await get(`${loc}/services/${slug}`, "follow"); const v = visible(r.html);
  ok(r.status === 200, `200 ${loc}/services/${slug}`);
  ok(/"@type":"Service"/.test(r.html) && /"@type":"BreadcrumbList"/.test(r.html), `Service + BreadcrumbList JSON-LD ${loc}/services/${slug}`);
  const robotsNoindex = /<meta name="robots" content="noindex, follow"/.test(r.html);
  ok(NOINDEX.has(slug) ? robotsNoindex : !robotsNoindex, `${NOINDEX.has(slug) ? "noindex,follow" : "indexable"} ${loc}/services/${slug}`);
  ok(!/href="[^"]*\/services#/.test(r.html), `no anchor-form links on ${loc}/services/${slug}`);
}
const smx = await (await fetch(BASE + "/sitemap.xml")).text();
ok(!/marine-ppf|surface-protection/.test(smx), "sitemap excludes noindex services");
ok(/\/services\/ppf<\/loc>/.test(smx) && /\/en\/services\/ppf/.test(smx) && /x-default/.test(smx), "sitemap has /services/ppf both locales + x-default");
// anchors + claim checks on /services (both locales)
for (const loc of ["", "/en"]) {
  const s = visible((await get(loc + "/services", "follow")).html);
  ok(SLUGS.every((slug) => s.includes(`href="${loc}/services/${slug}"`)), `7 service cards link to pages ${loc}/services`);
  ok(!/SK-BLD/.test(s), `no SK-BLD ${loc}/services`);
  const b = visible((await get(loc + "/services/building-heat-isolation", "follow")).html);
  ok(/TK-7099-IR/.test(b), `TK-7099-IR present ${loc}/services/building-heat-isolation`);
  ok(!/SK-BLD/.test(b), `no SK-BLD ${loc}/services/building-heat-isolation`);
  ok(!/lifetime warranty|ضمان مدى الحياة/i.test(s), `no lifetime on the services INDEX ${loc}/services`);
  const ppf = visible((await get(loc + "/services/ppf", "follow")).html);
  ok(/lifetime|مدى الحياة/i.test(ppf) && /مدى حياة السيارة|lifetime of the vehicle/i.test(ppf), `lifetime scoped with qualifier ${loc}/services/ppf`);
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
// /authentic — genuine TAKAI page (Phase 16)
for (const loc of ["", "/en"]) {
  const raw = (await get(loc + "/authentic", "follow")).html;
  const s = visible(raw);
  ok(/"@type":"FAQPage"/.test(raw) && /"@type":"Organization"/.test(raw) && /"@type":"Brand","name":"TAKAI"/.test(raw), `JSON-LD FAQPage + Organization/Brand ${loc}/authentic`);
  ok(/الموزع المعتمد الوحيد|sole authorized distributor/i.test(s), `citable distributor line ${loc}/authentic`);
  ok(/متاحة عند الطلب|متاحان عند الطلب|available on request/i.test(s) && !/تسلم تلقائيا مع|handed over automatically with/i.test(s), `documentation 'on request' ${loc}/authentic`);
  ok(!/\b3M\b|xpel|suntek|llumar|\bstek\b|garware/i.test(s), `no competitor names ${loc}/authentic`);
  for (const [page, needle] of [["/", "/authentic"], ["/about", "/authentic"], ["/services/ppf", "/authentic"], ["/faq", "/authentic"]]) {
    const h = visible((await get(loc + page, "follow")).html);
    ok(h.includes(`href="${loc}/authentic"`), `link to /authentic from ${loc}${page}`);
  }
}
for (const p of ["/", "/en", "/services", "/en/services", "/warranty", "/en/warranty"]) {
  const h = (await get(p, "follow")).html;
  ok(!/href="[^"]*\/services#/.test(h), `no anchor-form links on ${p}`);
}
const titles = new Map();
for (const p of ["/", "/services", "/services/ppf", "/services/heat-isolation", "/services/colour-change", "/services/nano-ceramic", "/services/building-heat-isolation", "/authentic", "/warranty", "/branches", "/about", "/faq", "/booking"]) {
  const h = (await get(p, "follow")).html; const t = h.match(/<title>([^<]*)<\/title>/)?.[1] ?? "";
  ok(t.length >= 30 && !titles.has(t), `unique keyword title ${p} (${t.length})`); titles.set(t, p);
  ok(/<link rel="canonical" href="https:\/\/supakoto\.com/.test(h) && /hreflang="x-default"/i.test(h) && /hreflang="en"/i.test(h) && /hreflang="ar"/i.test(h), `canonical + hreflang ar/en/x-default ${p}`);
}
// TAKAI table on home + region hint
const home = visible((await get("/", "follow")).html);
ok(/TAKAI PREMIUM PLUS/.test(home) && /TAKAI 5\b/.test(home), "home TAKAI table (Egypt default) renders");
console.log(`\n${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
