#!/usr/bin/env node
/**
 * Build guard (Phase 18): every analytics call goes through lib/analytics.ts.
 * Direct gtag / fbq / ttq / dataLayer usage anywhere else in runtime code
 * fails the build — one call site fans out to every platform so no
 * conversion silently misses one (the V2 failure mode).
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SCAN_DIRS = ["app", "components", "lib", "i18n", "content"];
const ALLOWED = new Set(["lib/analytics.ts"]);
const EXT = new Set([".ts", ".tsx", ".js", ".mjs"]);
const PATTERNS = [
  /\bgtag\s*\(/,
  /\bwindow\.gtag\b/,
  /\bfbq\s*\(/,
  /\bwindow\.fbq\b/,
  /\bttq\s*\.\s*(track|page|load|identify)\s*\(/,
  /\bwindow\.ttq\b/,
  /\bdataLayer\b/,
  /googletagmanager\.com|connect\.facebook\.net|analytics\.tiktok\.com/,
];

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) yield* walk(full);
    else if (EXT.has(path.extname(full))) yield full;
  }
}
const strip = (src) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");

const violations = [];
for (const dir of SCAN_DIRS) {
  for (const file of walk(path.join(ROOT, dir))) {
    const rel = path.relative(ROOT, file);
    if (ALLOWED.has(rel)) continue;
    strip(readFileSync(file, "utf8")).split("\n").forEach((line, i) => {
      for (const p of PATTERNS) if (p.test(line)) violations.push(`${rel}:${i + 1}  ${line.trim().slice(0, 100)}`);
    });
  }
}
// Completeness: any runtime file that renders a tel: or wa.me link must
// also track it (Phase 18 item 7 — "no tel:/wa.me link anywhere is untracked").
const LINK = /href=\{?[`"']tel:|wa\.me\//;
for (const dir of ["app", "components"]) {
  for (const file of walk(path.join(ROOT, dir))) {
    const rel = path.relative(ROOT, file);
    const src = strip(readFileSync(file, "utf8"));
    if (LINK.test(src) && !/\btrack\(/.test(src) && !/data-track/.test(src))
      violations.push(`${rel}  renders a tel:/wa.me link but never calls track()`);
  }
}

if (violations.length) {
  console.error("✗ Direct analytics call outside lib/analytics.ts (or an untracked tel:/wa.me link):");
  for (const v of violations) console.error("  " + v);
  console.error("Use track() from @/lib/analytics — the single fan-out point.");
  process.exit(1);
}
console.log("✓ analytics-call guard: every platform call goes through lib/analytics.ts");
