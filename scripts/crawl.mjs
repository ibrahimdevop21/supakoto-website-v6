#!/usr/bin/env node
/**
 * Internal crawl of a running build: every same-origin link on every page is
 * followed; reports 404s, redirect chains (>1 hop) and orphan routes (in the
 * sitemap but linked from nowhere). Usage: BASE=http://localhost:3111 node scripts/crawl.mjs
 */
const BASE = (process.env.BASE ?? "http://localhost:3111").replace(/\/$/, "");
const origin = new URL(BASE).origin;
const seen = new Map(); // path -> {status, hops, from}
const linkedFrom = new Map();
const queue = ["/", "/en"];
const CANON = "https://supakoto.com"; // canonical origin used in hrefs pre-cutover
const norm = (href, from) => {
  try {
    let u = new URL(href, BASE + from);
    if (u.origin === CANON) u = new URL(u.pathname + u.search + u.hash, BASE);
    if (u.origin !== origin) return null;
    let p = u.pathname.replace(/\/$/, "") || "/";
    if (/\.(png|jpg|jpeg|webp|svg|ico|xml|txt|mp4|webm|pdf)$/i.test(p) || p.startsWith("/_next")) return null;
    return p;
  } catch { return null; }
};
async function fetchManual(path) {
  const hops = [];
  let cur = path;
  for (let i = 0; i < 6; i++) {
    const r = await fetch(BASE + cur, { redirect: "manual" });
    if ([301, 302, 307, 308].includes(r.status)) {
      const loc = r.headers.get("location") ?? "";
      const next = norm(loc, cur) ?? loc;
      hops.push(`${r.status}→${next}`);
      cur = next.startsWith("/") ? next : cur;
      if (!next.startsWith("/")) return { status: r.status, hops, html: "" };
      continue;
    }
    return { status: r.status, hops, html: r.status === 200 ? await r.text() : "", final: cur };
  }
  return { status: 508, hops, html: "" };
}
while (queue.length) {
  const path = queue.shift();
  if (seen.has(path)) continue;
  const res = await fetchManual(path);
  seen.set(path, { status: res.status, hops: res.hops });
  if (res.hops.length && res.final && !seen.has(res.final)) queue.push(res.final);
  for (const m of res.html.matchAll(/href="([^"#]+)(#[^"]*)?"/g)) {
    const p = norm(m[1], path);
    if (!p) continue;
    if (!linkedFrom.has(p)) linkedFrom.set(p, new Set());
    linkedFrom.get(p).add(path);
    if (!seen.has(p)) queue.push(p);
  }
}
const problems = [];
for (const [p, r] of seen) {
  if (r.status >= 400) problems.push(`404/ERR ${r.status} ${p}  ← ${[...(linkedFrom.get(p) ?? [])].slice(0, 3).join(", ")}`);
  if (r.hops.length > 1) problems.push(`CHAIN ${p}: ${r.hops.join(" ")}`);
}
// orphans: sitemap routes never linked
const sm = await (await fetch(BASE + "/sitemap.xml")).text();
const smPaths = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => norm(m[1], "/")).filter(Boolean);
const orphans = [...new Set(smPaths)].filter((p) => !linkedFrom.has(p) && p !== "/" && p !== "/en");
for (const o of orphans) problems.push(`ORPHAN (in sitemap, unlinked) ${o}`);
const anchorLinks = [...linkedFrom.keys()].filter((p) => p.includes("/services#"));
console.log(`crawled ${seen.size} URLs, sitemap ${smPaths.length} entries, ${linkedFrom.size} linked paths`);
for (const p of problems) console.log("  " + p);
console.log(problems.length ? `PROBLEMS: ${problems.length}` : "CRAWL CLEAN — no 404s, no chains, no orphans");
process.exit(problems.length ? 1 : 0);
