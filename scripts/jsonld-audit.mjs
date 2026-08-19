#!/usr/bin/env node
/**
 * Fetch every route × locale, parse every <script type="application/ld+json">,
 * check required fields per @type. Usage: BASE=... node scripts/jsonld-audit.mjs
 */
const BASE = (process.env.BASE ?? "http://localhost:3111").replace(/\/$/, "");
const sm = await (await fetch(BASE + "/sitemap.xml")).text();
const paths = [...new Set([...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname))];
paths.push("/services/marine-ppf", "/en/services/marine-ppf", "/services/surface-protection", "/en/services/surface-protection");
const REQUIRED = {
  Organization: ["name", "url"],
  Service: ["name", "provider", "areaServed", "url"],
  ItemList: ["itemListElement"],
  FAQPage: ["mainEntity"],
  BreadcrumbList: ["itemListElement"],
  AutomotiveBusiness: ["name", "address", "telephone", "geo"],
  LocalBusiness: ["name", "address", "telephone"],
};
let fails = 0; const summary = {};
for (const p of paths.sort()) {
  const html = await (await fetch(BASE + p)).text();
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const types = [];
  for (const b of blocks) {
    let j; try { j = JSON.parse(b); } catch (e) { fails++; console.log(`PARSE FAIL ${p}: ${e.message}`); continue; }
    const t = j["@type"]; types.push(t);
    const req = REQUIRED[t];
    if (!req) continue;
    const missing = req.filter((k) => j[k] === undefined || j[k] === "" || (Array.isArray(j[k]) && j[k].length === 0));
    if (missing.length) { fails++; console.log(`MISSING ${p} ${t}: ${missing.join(",")}`); }
    if (t === "FAQPage" && !j.mainEntity.every((q) => q.name && q.acceptedAnswer?.text)) { fails++; console.log(`FAQ incomplete ${p}`); }
    if (t === "BreadcrumbList" && !j.itemListElement.every((i) => i.name && i.item && i.position)) { fails++; console.log(`Breadcrumb incomplete ${p}`); }
    if (t === "AutomotiveBusiness" && !/^\+?\d[\d ]{8,}$/.test(String(j.telephone))) { fails++; console.log(`Bad telephone ${p}: ${j.telephone}`); }
    // Phase 18: Review + AggregateRating nodes (testimonials) — only the displayed reviews, complete fields
    if (j.aggregateRating) {
      const a = j.aggregateRating;
      if (a["@type"] !== "AggregateRating" || !(a.ratingValue > 0) || !(a.reviewCount > 0)) { fails++; console.log(`AggregateRating incomplete ${p}`); }
      if (!Array.isArray(j.review) || j.review.length !== a.reviewCount) { fails++; console.log(`reviewCount ≠ reviews listed ${p}`); }
      if (!(j.review ?? []).every((r) => r["@type"] === "Review" && r.author?.name && r.reviewRating?.ratingValue && r.reviewBody)) { fails++; console.log(`Review incomplete ${p}`); }
      if (!j.sameAs) { /* sameAs lives on the site-wide node (home) */ }
      types[types.length - 1] = `${t}(reviews×${j.review?.length ?? 0})`;
    }
    if (t === "Organization" && j.sameAs && !(Array.isArray(j.sameAs) && j.sameAs.length === 5)) { fails++; console.log(`Organization sameAs should list the 5 social profiles ${p}`); }
  }
  const counts = types.reduce((a, t) => ((a[t] = (a[t] ?? 0) + 1), a), {});
  summary[p] = Object.entries(counts).map(([t, n]) => (n > 1 ? `${t}×${n}` : t)).join(" + ") || "—";
}
for (const [p, s] of Object.entries(summary)) console.log(`${p.padEnd(48)} ${s}`);
console.log(fails ? `JSON-LD PROBLEMS: ${fails}` : "JSON-LD CLEAN");
process.exit(fails ? 1 : 0);
