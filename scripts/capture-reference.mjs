#!/usr/bin/env node
/**
 * Captures the reference site's LAYOUT for structural study only.
 * Screenshots are working reference — they go in .gitignore and never ship.
 *
 *   fish> npm i -D playwright
 *   fish> npx playwright install chromium
 *   fish> node scripts/capture-reference.mjs
 */

import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE = "https://dettaglioauto.sa";
const OUT = path.resolve("reference/capture");

const ROUTES = [
  "/",
  "/about",
  "/faqs",
  "/photo-gallery",
  "/video-gallery",
  "/booking",
  "/warranty",
  "/franchise",
  "/business-contracts",
  "/branches",
  "/contact-us",
  "/careers",
  "/information/products",
  "/information/polishing",
];

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844, isMobile: true },
  { name: "tablet", width: 768, height: 1024, isMobile: false },
  { name: "desktop", width: 1440, height: 900, isMobile: false },
];

const slug = (r) => (r === "/" ? "home" : r.replace(/^\//, "").replace(/\//g, "-"));

/** Section-level outline: what blocks exist, in what order, how tall. */
async function outline(page) {
  return page.evaluate(() => {
    const blocks = [...document.querySelectorAll("body section, body > div > div > section, main > *")];
    return blocks.slice(0, 40).map((el, i) => {
      const r = el.getBoundingClientRect();
      const heading = el.querySelector("h1, h2, h3");
      return {
        index: i,
        tag: el.tagName.toLowerCase(),
        heading: heading ? heading.textContent.trim().slice(0, 90) : null,
        height: Math.round(r.height),
        classes: (el.className || "").toString().slice(0, 120),
        imgCount: el.querySelectorAll("img").length,
      };
    });
  });
}

/** Computed values we care about — read as numbers, then discard the source. */
async function tokens(page) {
  return page.evaluate(() => {
    const read = (sel, props) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const cs = getComputedStyle(el);
      return Object.fromEntries(props.map((p) => [p, cs.getPropertyValue(p)]));
    };
    const box = ["font-family", "font-size", "font-weight", "line-height", "letter-spacing", "color"];
    return {
      body: read("body", [...box, "background-color", "direction"]),
      h1: read("h1", box),
      h2: read("h2", box),
      h3: read("h3", box),
      link: read("a", box),
      button: read("button, .btn, [class*=button]", [
        ...box, "background-color", "border-radius", "padding", "border",
      ]),
      containerWidth: (() => {
        const c = document.querySelector("main > *, .container, [class*=container]");
        return c ? Math.round(c.getBoundingClientRect().width) : null;
      })(),
    };
  });
}

async function run() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  const report = {};

  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.isMobile,
      deviceScaleFactor: 2,
      locale: "ar-SA",
    });
    const page = await ctx.newPage();
    await mkdir(path.join(OUT, vp.name), { recursive: true });

    for (const route of ROUTES) {
      const name = slug(route);
      try {
        // "networkidle" never fires on this Nuxt site (persistent analytics
        // traffic) — wait for load, then let hydration settle.
        await page.goto(BASE + route, { waitUntil: "load", timeout: 45000 });
        await page.waitForTimeout(1500);
        // let lazy sections and entrance animations settle
        await page.evaluate(async () => {
          await new Promise((res) => {
            let y = 0;
            const step = () => {
              window.scrollBy(0, 600);
              y += 600;
              if (y < document.body.scrollHeight) setTimeout(step, 90);
              else { window.scrollTo(0, 0); setTimeout(res, 700); }
            };
            step();
          });
        });

        await page.screenshot({
          path: path.join(OUT, vp.name, `${name}.png`),
          fullPage: true,
        });

        report[name] ??= {};
        report[name][vp.name] = {
          outline: await outline(page),
          ...(vp.name === "desktop" ? { tokens: await tokens(page) } : {}),
        };
        console.log(`  ✓ ${vp.name.padEnd(7)} ${route}`);
      } catch (err) {
        console.log(`  ✗ ${vp.name.padEnd(7)} ${route} — ${err.message.split("\n")[0]}`);
        report[name] ??= {};
        report[name][vp.name] = { error: err.message.split("\n")[0] };
      }
    }
    await ctx.close();
  }

  await browser.close();
  await writeFile(path.join(OUT, "outline.json"), JSON.stringify(report, null, 2));
  console.log(`\nDone → ${OUT}`);
  console.log("Read outline.json for section order + measured type/spacing values.");
  console.log("Screenshots are reference only. Do not commit, do not ship.");
}

run();
