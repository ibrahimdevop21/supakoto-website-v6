#!/usr/bin/env node
// Mobile burger-menu audit: every route × {top, scrolled}, iPhone viewport.
// BASE=http://localhost:3000 node scripts/e2e-mobile-nav.mjs
import { chromium, devices } from "playwright";
const BASE = process.env.BASE ?? "http://localhost:3111";
const ROUTES = ["/", "/about", "/authentic", "/faq", "/services", "/services/ppf", "/services/building-heat-isolation", "/services/building-heat-isolation/quote", "/gallery", "/booking", "/warranty", "/warranty/claim", "/franchise", "/business", "/branches", "/contact", "/careers", "/privacy", "/terms"];
let pass = 0, fail = 0;
const ok = (c, l) => { c ? pass++ : fail++; console.log(`${c ? "PASS" : "FAIL"}  ${l}`); };
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices["iPhone 13"] });
const page = await ctx.newPage();
page.on("pageerror", (e) => console.log("PAGEERROR", e.message));
for (const loc of ["/en", ""]) for (const r of ROUTES) {
  const url = BASE + (loc + r === "" ? "/" : loc + (r === "/" && loc ? "" : r));
  for (const scrolled of [false, true]) {
    await page.goto(url, { waitUntil: "load", timeout: 120000 });
    await page.waitForTimeout(600);
    if (scrolled) { await page.evaluate(() => window.scrollTo(0, 400)); await page.waitForTimeout(500); }
    const burger = page.locator('header button[aria-label]').first();
    await burger.click({ force: true });
    await page.waitForTimeout(500);
    const info = await page.evaluate(() => {
      const d = document.getElementById("mobile-drawer");
      if (!d) return null;
      const r = d.getBoundingClientRect();
      const link = d.querySelector("nav a");
      const lr = link?.getBoundingClientRect();
      const hit = lr ? document.elementFromPoint(lr.left + 5, lr.top + 5) : null;
      return { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top), links: d.querySelectorAll("nav a").length, firstLinkVisible: !!lr && lr.height > 0 && lr.top >= 0 && lr.top < innerHeight, hitIsLink: !!hit && (hit === link || link.contains(hit)) };
    });
    const vh = await page.evaluate(() => innerHeight);
    const good = info && info.h >= vh && info.top === 0 && info.firstLinkVisible && info.hitIsLink && info.links === 6;
    ok(good, `${url} ${scrolled ? "scrolled" : "top"} → ${info ? `drawer ${info.w}×${info.h}@${info.top} links=${info.links} firstVisible=${info.firstLinkVisible} clickable=${info.hitIsLink}` : "no drawer"}`);
    // Escape closes; focus returned to the burger
    await page.keyboard.press("Escape");
    await page.waitForTimeout(400);
    ok((await page.locator("#mobile-drawer").count()) === 0 && (await page.evaluate(() => document.activeElement?.getAttribute("aria-controls"))) === "mobile-drawer", `${url} ${scrolled ? "scrolled" : "top"} → Escape closes, focus back on burger`);
  }
}
// Interaction flow: open → expand group → tap child → navigates and drawer closes → burger works again; same-page link closes too; scroll lock
{
  await page.goto(BASE + "/en/contact", { waitUntil: "load", timeout: 120000 });
  await page.waitForTimeout(800);
  await page.evaluate(() => window.scrollTo(0, 300));
  await page.waitForTimeout(400);
  await page.locator('header button[aria-controls="mobile-drawer"]').click();
  await page.waitForTimeout(600);
  ok((await page.evaluate(() => document.body.style.overflow)) === "hidden", "body scroll locked while open");
  ok((await page.evaluate(() => document.activeElement?.getAttribute("aria-label"))) !== null && (await page.evaluate(() => document.activeElement?.closest("#mobile-drawer") !== null)), "focus moves into the drawer (Close button)");
  await page.locator('#mobile-drawer button[aria-expanded]').first().click(); // About group
  await page.locator('#mobile-drawer button[aria-expanded="true"]').waitFor();
  await page.waitForTimeout(500);
  await page.locator('#mobile-drawer a[href="/en/faq"]').click({ force: true });
  await page.waitForURL("**/en/faq", { timeout: 120000 });
  await page.waitForTimeout(500);
  ok((await page.locator("#mobile-drawer").count()) === 0 && (await page.evaluate(() => document.body.style.overflow)) === "", "child link navigates, drawer closes, scroll unlocked");
  await page.locator('header button[aria-controls="mobile-drawer"]').click();
  await page.waitForTimeout(400);
  ok((await page.locator("#mobile-drawer").count()) === 1, "burger works again after client-side navigation");
  await page.locator('#mobile-drawer button[aria-expanded]').first().click();
  await page.locator('#mobile-drawer button[aria-expanded="true"]').waitFor();
  await page.waitForTimeout(500);
  await page.locator('#mobile-drawer a[href="/en/faq"]').click({ force: true }); // same page
  await page.waitForTimeout(400);
  ok((await page.locator("#mobile-drawer").count()) === 0, "same-page link still closes the drawer");
}
await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
