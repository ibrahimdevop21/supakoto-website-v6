#!/usr/bin/env node
// Run: pnpm build && PORT=3111 pnpm start &  then  node scripts/e2e-testimonials.mjs
// Carousel behaviour (Phase 18 rev. 2): all reviews present, per-card
// language/dir, equal heights, read-more → modal, keyboard, autoplay rules,
// real Google aggregate, no AggregateRating markup.
import { chromium } from "playwright";
const BASE = process.env.BASE ?? "http://localhost:3111";
let pass = 0, fail = 0;
const ok = (c, l) => { c ? pass++ : fail++; console.log(`${c ? "PASS" : "FAIL"}  ${l}`); };
const browser = await chromium.launch();
for (const [path, locale] of [["/en", "en"], ["/", "ar"], ["/en/services/ppf", "en"], ["/en/about", "en"]]) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + path, { waitUntil: "load" });
  await page.waitForTimeout(1500);
  const html = await page.content();
  ok(/4\.8 (out of 5|من 5) · 1,570/.test(html), `[${path}] aggregate shows 4.8 · 1,570 Google reviews`);
  ok(!/"aggregateRating"/.test(html), `[${path}] no AggregateRating markup`);
  ok(!/Translated from|مترجم من/.test(html), `[${path}] no translation labels`);
  const cards = page.locator("ul[aria-label] > li");
  ok((await cards.count()) === 29, `[${path}] all 29 reviews in the carousel (${await cards.count()})`);
  const dirs = await page.$$eval("ul[aria-label] blockquote", (els) => els.map((e) => [e.getAttribute("lang"), e.getAttribute("dir")]));
  ok(dirs.every(([l, d]) => (l === "ar" && d === "rtl") || (l === "en" && d === "ltr")) && dirs.some(([l]) => l === "ar") && dirs.some(([l]) => l === "en"), `[${path}] per-card lang/dir, both languages present`);
  const heights = await page.$$eval("ul[aria-label] > li article", (els) => els.map((e) => Math.round(e.getBoundingClientRect().height)));
  ok(new Set(heights).size === 1, `[${path}] every card the same height (${heights[0]}px)`);
  const reviews = JSON.parse([...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]).find((j) => j.includes('"review"')) ?? "{}");
  ok(Array.isArray(reviews.review) && reviews.review.length === 29 && reviews.review.every((r) => r.inLanguage === "ar" || r.inLanguage === "en"), `[${path}] Review JSON-LD covers exactly the 29 displayed, original language`);
  if (path === "/en") {
    if (locale === "en" && path === "/en") {
      // service page ordering check elsewhere; here: keyboard + modal
      const first = page.locator("ul[aria-label] li button").first();
      await first.focus();
      await page.keyboard.press("ArrowRight");
      const focusedIdx = await page.evaluate(() => [...document.querySelectorAll("ul[aria-label] li button")].indexOf(document.activeElement));
      ok(focusedIdx === 1, "ArrowRight moves focus to the next card");
      await page.keyboard.press("Enter");
      await page.waitForTimeout(400);
      ok(await page.locator('[role="dialog"]').isVisible(), "Enter opens the full-text dialog");
      const dlgText = await page.locator('[role="dialog"] blockquote').innerText();
      const cardText = (await page.locator("ul[aria-label] li").nth(1).locator("blockquote").innerText()).slice(0, 40);
      ok(dlgText.startsWith(cardText.slice(0, 20)), "dialog shows that card's full text");
      await page.keyboard.press("Escape");
      await page.waitForTimeout(400);
      ok((await page.locator('[role="dialog"]').count()) === 0, "Escape closes the dialog");
      const back = await page.evaluate(() => [...document.querySelectorAll("ul[aria-label] li button")].indexOf(document.activeElement));
      ok(back === 1, "focus returns to the card that opened the dialog");
      // read-more only where text overflows
      const longCount = await page.locator("ul[aria-label] li button:has-text('Read more')").count();
      ok(longCount > 0 && longCount < 29, `read more shown only on overflowing cards (${longCount}/29)`);
      // click a read-more
      await page.locator("ul[aria-label] li button:has-text('Read more')").first().click();
      ok(await page.locator('[role="dialog"]').isVisible(), "click on read more opens dialog");
      await page.locator('[role="dialog"] button').click();
      // autoplay: advances when idle, not after interaction
      const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 900 } });
      const p2 = await ctx2.newPage();
      await p2.goto(BASE + "/en", { waitUntil: "load" });
      await p2.waitForTimeout(1500);
      await p2.locator("ul[aria-label]").scrollIntoViewIfNeeded();
      await p2.mouse.move(0, 0);
      const s0 = await p2.evaluate(() => document.querySelector("ul[aria-label]").scrollLeft);
      await p2.waitForTimeout(7000);
      const s1 = await p2.evaluate(() => document.querySelector("ul[aria-label]").scrollLeft);
      ok(s1 > s0, `autoplay advances when idle (${s0}→${s1})`);
      await ctx2.close();
      const ctx3 = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
      const p3 = await ctx3.newPage();
      await p3.goto(BASE + "/en", { waitUntil: "load" });
      await p3.waitForTimeout(1500);
      await p3.locator("ul[aria-label]").scrollIntoViewIfNeeded();
      await p3.mouse.move(0, 0);
      await p3.waitForTimeout(7000);
      ok((await p3.evaluate(() => document.querySelector("ul[aria-label]").scrollLeft)) === 0, "no autoplay under prefers-reduced-motion");
      await ctx3.close();
    }
  }
  if (path === "/en/services/ppf") {
    const firstLang = await page.$$eval("ul[aria-label] li", (els) => els.slice(0, 2).map((e) => e.querySelector("figcaption span").textContent));
    ok(firstLang[0] === "nithin premnath" && firstLang[1] === "Mohamed Taha", `PPF-tagged reviews lead on the PPF page (${firstLang.join(", ")})`);
  }
  await ctx.close();
}
await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
