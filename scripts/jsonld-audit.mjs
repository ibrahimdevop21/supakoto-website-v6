#!/usr/bin/env node
/**
 * Fetch every route × locale, parse every <script type="application/ld+json">,
 * check required fields per @type. Usage: BASE=... node scripts/jsonld-audit.mjs
 */
const BASE = (process.env.BASE ?? "http://localhost:3111").replace(/\/$/, "");
const sm = await (await fetch(BASE + "/sitemap.xml")).text();
const arPaths = [...new Set([...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname))];
const paths = arPaths.flatMap((p) => [p, p === "/" ? "/en" : "/en" + p]);
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
  }
  const counts = types.reduce((a, t) => ((a[t] = (a[t] ?? 0) + 1), a), {});
  summary[p] = Object.entries(counts).map(([t, n]) => (n > 1 ? `${t}×${n}` : t)).join(" + ") || "—";
}
for (const [p, s] of Object.entries(summary)) console.log(`${p.padEnd(48)} ${s}`);
console.log(fails ? `JSON-LD PROBLEMS: ${fails}` : "JSON-LD CLEAN");
process.exit(fails ? 1 : 0);
