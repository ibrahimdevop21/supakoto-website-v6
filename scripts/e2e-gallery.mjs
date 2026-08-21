#!/usr/bin/env node
/**
 * Gallery viewer e2e (Phase 20). Needs a running server (BASE, default
 * :3111). Verifies, in BOTH locales at 1440 and 390:
 *  - the filter row renders every catalogue service (+ all, video);
 *  - marine (no photography) shows the labelled empty state, zero images;
 *  - DIRECTION OF TRAVEL: "next" moves the active thumbnail leftward in
 *    Arabic and rightward in English (positions measured, not icons);
 *  - keyboard physical→logical mapping (ArrowLeft = next in RTL);
 *  - fullscreen opens on stage click and Escape closes it;
 *  - the session-seeded shuffle: stable across reload + filter toggles
 *    within a session, different in a fresh session;
 *  - first-load transferred bytes stay bounded (no full-library fetch).
 */
import { chromium } from "playwright";

const BASE = process.env.BASE ?? "http://localhost:3111";
let pass = 0;
let fail = 0;
const ok = (cond, label) => {
  console.log(`${cond ? "PASS" : "FAIL"}  ${label}`);
  cond ? pass++ : fail++;
};

const browser = await chromium.launch();

async function fresh({ locale, width = 1440, height = 900, track = false }) {
  const ctx = await browser.newContext({ viewport: { width, height } });
  const page = await ctx.newPage();
  let bytes = 0;
  if (track)
    page.on("response", async (r) => {
      try {
        bytes += (await r.body()).length;
      } catch {
        /* opaque/aborted */
      }
    });
  await page.goto(`${BASE}${locale === "en" ? "/en" : ""}/gallery`, {
    waitUntil: "domcontentloaded",
  });
  await page.waitForSelector("[data-thumb]");
  return { ctx, page, bytes: () => bytes };
}

const thumbOrder = (page) =>
  page.$$eval("[data-thumb]", (els) => els.map((e) => e.dataset.thumb));

for (const locale of ["ar", "en"]) {
  const rtl = locale === "ar";
  const { ctx, page } = await fresh({ locale });

  // Filter row covers the catalogue.
  const filterButtons = page.locator("div[role='group']").first().locator("button");
  ok((await filterButtons.count()) === 9, `[${locale}] filter row has 9 entries (all + 7 services + video)`);

  // Direction of travel — measure positions in a settled frame, don't
  // trust icons. "Next" must activate the thumbnail that sits on the LEFT
  // of the current one in RTL (right in LTR), i.e. the strip lays out and
  // advances in the reading direction.
  await page.waitForTimeout(900); // post-shuffle scrollIntoView settles
  const ids = await thumbOrder(page);
  const xOf = (id) =>
    page
      .locator(`[data-thumb="${id}"]`)
      .evaluate((el) => el.getBoundingClientRect().x);
  const xCurrent = await xOf(ids[0]);
  const xSuccessor = await xOf(ids[1]);
  ok(
    rtl ? xSuccessor < xCurrent : xSuccessor > xCurrent,
    `[${locale}] successor thumb sits to the ${rtl ? "LEFT" : "RIGHT"} (${xCurrent.toFixed(0)} → ${xSuccessor.toFixed(0)})`,
  );
  const counter0 = await page.locator("span[dir=ltr]").first().innerText();
  await page.locator('div[aria-roledescription="carousel"] button').last().click(); // end-side arrow = next
  await page.waitForTimeout(600);
  const activeId = await page
    .locator('[aria-current="true"][data-thumb]')
    .getAttribute("data-thumb");
  const counter1 = await page.locator("span[dir=ltr]").first().innerText();
  ok(counter0.startsWith("1/") && counter1.startsWith("2/"), `[${locale}] end-side arrow advances 1→2`);
  ok(activeId === ids[1], `[${locale}] "next" lands on the ${rtl ? "left" : "right"}-side successor (${activeId})`);

  // Keyboard: physical arrows map to visual direction.
  await page.locator('div[aria-roledescription="carousel"]').focus();
  await page.keyboard.press(rtl ? "ArrowLeft" : "ArrowRight");
  const counter2 = await page.locator("span[dir=ltr]").first().innerText();
  ok(counter2.startsWith("3/"), `[${locale}] ${rtl ? "ArrowLeft" : "ArrowRight"} = next (2→3)`);
  await page.keyboard.press(rtl ? "ArrowRight" : "ArrowLeft");
  ok((await page.locator("span[dir=ltr]").first().innerText()).startsWith("2/"), `[${locale}] opposite arrow = prev (3→2)`);

  // Fullscreen: open on stage click, Escape closes.
  await page.locator('div[aria-roledescription="carousel"] button').first().click();
  ok(await page.locator('[role="dialog"]').isVisible(), `[${locale}] stage click opens fullscreen`);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);
  ok((await page.locator('[role="dialog"]').count()) === 0, `[${locale}] Escape exits fullscreen`);

  // Marine: filter present, empty state, zero images.
  const buttons = await filterButtons.allInnerTexts();
  const marineName = locale === "ar" ? buttons.find((b) => b.includes("القوارب") || b.includes("مارين") || b.includes("بحري")) : buttons.find((b) => /marine|boat/i.test(b));
  ok(Boolean(marineName), `[${locale}] marine filter present ("${marineName ?? "?"}")`);
  if (marineName) {
    await filterButtons.filter({ hasText: marineName }).first().click();
    await page.waitForTimeout(300);
    ok((await page.locator("[data-thumb]").count()) === 0, `[${locale}] marine shows no images`);
    ok((await page.locator('div[aria-roledescription="carousel"]').count()) === 0, `[${locale}] marine hides the stage`);
    const empty = await page.locator("main").innerText();
    ok(/قريبا|coming soon/i.test(empty), `[${locale}] marine empty state is labelled`);
  }

  // Shuffle: same session order survives reload + filter toggle; fresh session differs.
  await filterButtons.first().click();
  await page.waitForTimeout(300);
  const order1 = await thumbOrder(page);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector("[data-thumb]");
  const order2 = await thumbOrder(page);
  ok(order1.join() === order2.join(), `[${locale}] reload keeps the session order`);
  await page.locator("div[role='group']").first().locator("button").last().click();
  await page.waitForTimeout(200);
  await page.locator("div[role='group']").first().locator("button").first().click();
  await page.waitForTimeout(200);
  const order3 = await thumbOrder(page);
  ok(order2.join() === order3.join(), `[${locale}] filter toggle keeps the order`);
  const { ctx: ctx2, page: page2 } = await fresh({ locale });
  const orderFresh = await thumbOrder(page2);
  ok(order1.join() !== orderFresh.join(), `[${locale}] fresh session gets a different order`);
  await ctx2.close();
  await ctx.close();
}

// First-load transfer, mobile + desktop, both locales.
for (const locale of ["ar", "en"]) {
  for (const [w, h, label] of [[390, 844, "390"], [1440, 900, "1440"]]) {
    const { ctx, page, bytes } = await fresh({ locale, width: w, height: h, track: true });
    await page.waitForTimeout(2500); // let lazy/eager loading settle
    const kb = Math.round(bytes() / 1024);
    console.log(`INFO  [${locale}] first-load transfer at ${label}px: ${kb} KB`);
    ok(kb < 6000, `[${locale}] ${label}px first load under 6 MB (${kb} KB)`);
    await ctx.close();
  }
}

// 390px usability: stage, arrows, strip visible and inside viewport.
for (const locale of ["ar", "en"]) {
  const { ctx, page } = await fresh({ locale, width: 390, height: 844 });
  const stage = page.locator('div[aria-roledescription="carousel"]');
  await stage.scrollIntoViewIfNeeded();
  const box = await stage.boundingBox();
  ok(box !== null && box.width <= 390 && box.width > 300, `[${locale}] 390px stage fits (${box?.width}px wide)`);
  const arrows = stage.locator("button:has(svg)");
  const a = await arrows.last().boundingBox();
  ok(a !== null && a.x >= 0 && a.x + a.width <= 390, `[${locale}] 390px arrows inside viewport`);
  const strip = await page.locator('[data-thumb]').first().boundingBox();
  ok(strip !== null, `[${locale}] 390px thumbnail strip present`);
  const hasHScroll = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  ok(!hasHScroll, `[${locale}] 390px no horizontal page scroll`);
  await ctx.close();
}

await browser.close();
console.log(`\n${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
