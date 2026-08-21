#!/usr/bin/env node
/**
 * Build guard (Phase 19): every public asset path referenced in runtime
 * code or messages must exist under public/. Phase 15 committed the Japan
 * flag at the repo root while /about already pointed at
 * /images/brand/flag-japan.webp — a broken image that reached production.
 *
 * Two kinds of reference:
 *  - literal  "/images/…"  → the file must exist (a literal with no
 *    extension, e.g. "/videos/showreel", must match at least one
 *    "<name>.<ext>" in its directory — HeroCarousel appends the codec);
 *  - template `/images/services/${id}.webp` → expanded through the
 *    EXPANSIONS table below against the ids in the content file that owns
 *    the directory. An unknown template FAILS the build: add an expansion
 *    rather than letting a dynamic path bypass the check.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const PUBLIC = path.join(ROOT, "public");
const SCAN_DIRS = ["app", "components", "content", "lib", "i18n", "messages"];
const EXT = new Set([".ts", ".tsx", ".js", ".mjs", ".json"]);
const PREFIXES = "(?:images|videos|brand|payment|fonts)";
const LITERAL = new RegExp(`["'\`](/${PREFIXES}/[^"'\`\\s)]*)["'\`]`, "g");
const TEMPLATE = new RegExp(`\`(/${PREFIXES}/[^\`]*\\$\\{[^\`]*)\``, "g");

const read = (rel) => readFileSync(path.join(ROOT, rel), "utf8");
const matchAll = (text, re) => [...text.matchAll(re)].map((m) => m[1]);

/** Template → the ids it may be rendered with (by content file). */
const EXPANSIONS = {
  "/images/services/${id}.webp": () =>
    matchAll(read("content/services.ts"), /\bid:\s*"([^"]+)"/g).map((id) => `/images/services/${id}.webp`),
  "/images/partners/${id}.webp": () =>
    matchAll(read("content/partners.ts"), /\bbrand\(\s*"([^"]+)"/g).map((id) => `/images/partners/${id}.webp`),
  "/images/gallery/sk-${num}.webp": () =>
    matchAll(read("content/gallery.ts"), /\bimg\(\s*"([^"]+)"/g).map((n) => `/images/gallery/sk-${n}.webp`),
  // Service detail "project photos" — any gallery item id the catalogue
  // knows, plus every quoted sk-/building-/surface- id in the consumer.
  "/images/gallery/${id}.webp": () => {
    const gallery = read("content/gallery.ts");
    const serviceIds = new Set(matchAll(read("content/services.ts"), /\bid:\s*"([^"]+)"/g));
    const ids = [
      ...matchAll(gallery, /\bimg\(\s*"([^"]+)"/g).map((n) => `sk-${n}`),
      ...matchAll(gallery, /\bid:\s*"([^"]+)"/g),
      ...matchAll(read("components/sections/services/ServiceDetailBody.tsx"), /"((?:sk|building|surface)-[a-z0-9-]+)"/g),
    ].filter((id) => id !== "showreel" && !serviceIds.has(id)); // map keys are service ids
    return [...new Set(ids)].map((id) => `/images/gallery/${id}.webp`);
  },
};

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) yield* walk(full);
    else if (EXT.has(path.extname(full))) yield full;
  }
}

function exists(p) {
  const abs = path.join(PUBLIC, p);
  if (existsSync(abs)) return true;
  if (path.extname(p)) return false;
  // extension-less prefix ("/videos/showreel" + ".webm" | ".mp4")
  const dir = path.join(PUBLIC, path.dirname(p));
  const base = path.basename(p);
  return existsSync(dir) && readdirSync(dir).some((f) => f.startsWith(base + "."));
}

const failures = [];
let literals = 0;
let expanded = 0;
const seenTemplates = new Set();

for (const dir of SCAN_DIRS) {
  const abs = path.join(ROOT, dir);
  if (!existsSync(abs)) continue;
  for (const file of walk(abs)) {
    const rel = path.relative(ROOT, file);
    const text = readFileSync(file, "utf8");
    for (const p of matchAll(text, LITERAL)) {
      if (p.includes("${")) continue; // template — handled below
      literals++;
      if (!exists(p)) failures.push(`${rel}: "${p}" has no file under public/`);
    }
    for (const t of matchAll(text, TEMPLATE)) {
      seenTemplates.add(t);
      const expand = EXPANSIONS[t];
      if (!expand) {
        failures.push(`${rel}: dynamic path \`${t}\` has no expansion in scripts/check-image-refs.mjs`);
        continue;
      }
      for (const p of expand()) {
        expanded++;
        if (!exists(p)) failures.push(`${rel}: \`${t}\` → "${p}" has no file under public/`);
      }
    }
  }
}

if (failures.length) {
  console.error("✖ check-image-refs: referenced assets missing from public/\n");
  for (const f of failures) console.error("  - " + f);
  process.exit(1);
}
console.log(
  `✔ check-image-refs: ${literals} literal paths + ${expanded} expanded paths (${seenTemplates.size} templates) all resolve under public/`,
);
