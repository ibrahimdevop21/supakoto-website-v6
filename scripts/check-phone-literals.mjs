#!/usr/bin/env node
/**
 * Build guard (ops decision 2026-08-06): no phone-number literals anywhere
 * in runtime code or copy. Every number rendered at runtime must resolve
 * from content/regions.ts or content/branches.ts — the only two files
 * allowed to carry phone digits. Build fails otherwise.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SCAN_DIRS = ["app", "components", "lib", "i18n", "messages", "content"];
const ALLOWED = new Set(["content/regions.ts", "content/branches.ts"]);
const EXTENSIONS = new Set([".ts", ".tsx", ".json"]);

// Egyptian mobiles (local + E.164), UAE numbers (spaced or bare).
const PHONE_PATTERNS = [
  /\b01\d{9}\b/,
  /\b201\d{9}\b/,
  /\+20[\d\s]{9,14}\d/,
  /\b971\d{8,9}\b/,
  /\+971[\d\s]{8,13}\d/,
];

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) yield* walk(full);
    else if (EXTENSIONS.has(path.extname(full))) yield full;
  }
}

const violations = [];
for (const dir of SCAN_DIRS) {
  for (const file of walk(path.join(ROOT, dir))) {
    const rel = path.relative(ROOT, file);
    if (ALLOWED.has(rel)) continue;
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, i) => {
      for (const pattern of PHONE_PATTERNS) {
        const match = line.match(pattern);
        if (match) violations.push(`${rel}:${i + 1}  ${match[0]}`);
      }
    });
  }
}

if (violations.length > 0) {
  console.error(
    "✗ Phone literals outside content/regions.ts and content/branches.ts:",
  );
  for (const v of violations) console.error("  " + v);
  console.error(
    "Runtime numbers must resolve from the content files (ops rule, 2026-08-06).",
  );
  process.exit(1);
}
console.log("✓ phone-literal guard: clean");
