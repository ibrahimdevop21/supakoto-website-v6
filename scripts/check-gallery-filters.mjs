#!/usr/bin/env node
/**
 * Build guard (Phase 20): the gallery filter row covers EVERY service in
 * content/services.ts. Marine was missing from a hardcoded filter list —
 * the same defect class the wizard had before Phase 19. Enforced:
 *
 *  1. content/gallery.ts derives galleryCategories by spreading
 *     `serviceIds` — a hardcoded category list fails the build;
 *  2. every gallery item's category is a catalogue service id or "video"
 *     (an item can never hide behind a filter that does not exist, and a
 *     category can never point at a service the catalogue dropped);
 *  3. GalleryViewer renders from the imported `galleryCategories`, not a
 *     local list.
 */
import { readFileSync } from "node:fs";

const services = readFileSync("content/services.ts", "utf8");
const gallery = readFileSync("content/gallery.ts", "utf8");
const viewer = readFileSync("components/sections/GalleryViewer.tsx", "utf8");

const serviceIds = [...services.matchAll(/^\s*id:\s*"([^"]+)"/gm)].map((m) => m[1]);
const failures = [];
if (serviceIds.length === 0) failures.push("no services parsed from content/services.ts");

const categoriesBlock = gallery.match(/galleryCategories[^=]*=\s*\[([\s\S]*?)\]/);
if (!categoriesBlock) {
  failures.push("content/gallery.ts: galleryCategories array not found");
} else if (!/\.\.\.serviceIds/.test(categoriesBlock[1])) {
  failures.push(
    "content/gallery.ts: galleryCategories must spread ...serviceIds (derived from the catalogue), not list categories by hand",
  );
}

const itemCategories = [
  ...[...gallery.matchAll(/\bimg\(\s*"[^"]+",\s*"([^"]+)"/g)].map((m) => m[1]),
  ...[...gallery.matchAll(/\bcategory:\s*"([^"]+)"/g)].map((m) => m[1]),
];
const allowed = new Set([...serviceIds, "video"]);
for (const c of new Set(itemCategories)) {
  if (!allowed.has(c)) failures.push(`gallery item category "${c}" is not a catalogue service id (or "video")`);
}

if (!/import\s*\{[^}]*\bgalleryCategories\b[^}]*\}\s*from\s*"@\/content\/gallery"/.test(viewer))
  failures.push("GalleryViewer.tsx must import galleryCategories from @/content/gallery");
if (!/galleryCategories\.map\(/.test(viewer))
  failures.push("GalleryViewer.tsx must render the filter row from galleryCategories.map(…)");

if (failures.length) {
  console.error("✖ check-gallery-filters: gallery filters do not cover the service catalogue\n");
  for (const f of failures) console.error("  - " + f);
  process.exit(1);
}
console.log(
  `✔ check-gallery-filters: ${serviceIds.length} services all in the filter row (+ all, video); ${itemCategories.length} items in valid categories`,
);
