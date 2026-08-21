// Run: pnpm build && PORT=3111 pnpm start &  then  node scripts/e2e-whatsapp-routing.mjs (needs playwright chromium)
// E2E: booking wizard (vehicle / building / enquiry flows) + standalone
// building quote form → wa.me target per locale/region, including
// form-choice overriding the RegionPicker cookie.
import { chromium } from "playwright";

const BASE = process.env.BASE ?? "http://localhost:3111";
const EXPECT = { egypt: "201103402446", uae: "971552054478" };
const LABEL = {
  en: { egypt: "Egypt", uae: "UAE", heat: "Heat", confirm: "Confirm booking", next: "Next", building: "Building heat isolation", marine: "Marine PPF", residential: "Residential", confirmQuote: "Send quote request", confirmEnquiry: "Send enquiry", quoteTitle: "Quotation request — building heat isolation" },
  ar: { egypt: "مصر", uae: "الإمارات", heat: "الحرارة", confirm: "أكد الحجز", next: "التالي", building: "عزل حراري للمباني", marine: "حماية القوارب", residential: "سكني", confirmQuote: "أرسل طلب عرض السعر", confirmEnquiry: "أرسل الاستفسار", quoteTitle: "طلب عرض سعر — عزل حراري للمباني" },
};
const results = [];
const browser = await chromium.launch();

async function fresh(cookieRegion, locale) {
  const ctx = await browser.newContext({ locale: locale === "ar" ? "ar-EG" : "en-US" });
  await ctx.addCookies([{ name: "sk-region", value: cookieRegion, url: BASE }]);
  await ctx.addInitScript(() => {
    window.__wa = null;
    window.open = (u) => { window.__wa = String(u); return null; };
  });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.log("PAGEERROR", e.message));
  return { ctx, page };
}
const waNumber = (u) => (u ?? "").match(/wa\.me\/(\d+)/)?.[1] ?? null;
const clickText = async (page, txt) =>
  page.locator(`main button:text-is("${txt}")`).first().click();

async function booking(locale, cookieRegion, formRegion) {
  const { ctx, page } = await fresh(cookieRegion, locale);
  const L = LABEL[locale];
  await page.goto(`${BASE}${locale === "en" ? "/en" : ""}/booking`, { waitUntil: "networkidle" });
  // step 1 service: first card = PPF (cars group first)
  await page.locator("main button[aria-pressed]").first().click();
  await clickText(page, L.next);
  await clickText(page, L[formRegion]);
  await clickText(page, L.next);
  // branch: first branch button
  await page.locator("main button[aria-pressed]").first().click();
  await clickText(page, L.next);
  await page.fill("#bk-make", "Toyota"); await page.fill("#bk-model", "Prado");
  await clickText(page, L.next);
  await page.locator("main button.sk-day:not([disabled])").first().click(); // first selectable day = tomorrow
  await clickText(page, L.next);
  await page.locator("main button[aria-pressed]").first().click(); // time
  await clickText(page, L.next);
  await page.fill("#bk-name", "Test User"); await page.fill("#bk-phone", "0100000000");
  await clickText(page, L.next);
  await clickText(page, L.confirm);
  await page.waitForFunction(() => window.__wa !== null);
  const url = await page.evaluate(() => window.__wa);
  const reopen = await page.locator('a[href^="https://wa.me/"]').first().getAttribute("href");
  results.push({ form: "booking", locale, cookieRegion, formRegion, got: waNumber(url), reopen: waNumber(reopen), expect: EXPECT[formRegion] });
  await ctx.close();
}

/** Building quote through the wizard — must land on the property's regional line with the quote marker first. */
async function wizardQuote(locale, cookieRegion, formRegion) {
  const { ctx, page } = await fresh(cookieRegion, locale);
  const L = LABEL[locale];
  await page.goto(`${BASE}${locale === "en" ? "/en" : ""}/booking`, { waitUntil: "networkidle" });
  await page.locator(`main button[aria-pressed]:has-text("${L.building}")`).first().click();
  await clickText(page, L.next);
  await clickText(page, L[formRegion]); await clickText(page, L.next);
  await clickText(page, L.residential); await clickText(page, L.next);
  await page.selectOption("#bk-area", { index: 1 }); await clickText(page, L.next);
  await page.fill("#bk-glazing", "120"); await page.fill("#bk-floors", "3"); await clickText(page, L.next);
  await clickText(page, L.heat); await clickText(page, L.next);
  await page.fill("#bk-name", "Test User"); await page.fill("#bk-phone", "0100000000"); await clickText(page, L.next);
  await clickText(page, L.confirmQuote);
  await page.waitForFunction(() => window.__wa !== null);
  const url = await page.evaluate(() => window.__wa);
  const firstLine = decodeURIComponent((url ?? "").split("text=")[1] ?? "").split("\n")[0];
  const reopen = await page.locator('a[href^="https://wa.me/"]').first().getAttribute("href");
  results.push({ form: "wizquote", locale, cookieRegion, formRegion, got: waNumber(url), reopen: waNumber(reopen), expect: EXPECT[formRegion], error: firstLine === L.quoteTitle ? undefined : `first line «${firstLine}»` });
  await ctx.close();
}

/** Marine enquiry through the wizard. */
async function enquiry(locale, cookieRegion, formRegion) {
  const { ctx, page } = await fresh(cookieRegion, locale);
  const L = LABEL[locale];
  await page.goto(`${BASE}${locale === "en" ? "/en" : ""}/booking`, { waitUntil: "networkidle" });
  await page.locator(`main button[aria-pressed]:has-text("${L.marine}")`).first().click();
  await clickText(page, L.next);
  await clickText(page, L[formRegion]); await clickText(page, L.next);
  await clickText(page, L.next); // details optional
  await page.fill("#bk-name", "Test User"); await page.fill("#bk-phone", "0100000000"); await clickText(page, L.next);
  await clickText(page, L.confirmEnquiry);
  await page.waitForFunction(() => window.__wa !== null);
  const url = await page.evaluate(() => window.__wa);
  const reopen = await page.locator('a[href^="https://wa.me/"]').first().getAttribute("href");
  results.push({ form: "enquiry", locale, cookieRegion, formRegion, got: waNumber(url), reopen: waNumber(reopen), expect: EXPECT[formRegion] });
  await ctx.close();
}

async function quote(locale, cookieRegion, formRegion) {
  const { ctx, page } = await fresh(cookieRegion, locale);
  const L = LABEL[locale];
  await page.goto(`${BASE}${locale === "en" ? "/en" : ""}/services/building-heat-isolation/quote`, { waitUntil: "networkidle" });
  const groups = page.locator("form fieldset");
  await groups.nth(0).locator("button[aria-pressed]").first().click(); // property type
  await page.locator(`form button:text-is("${L[formRegion]}")`).first().click();
  await page.selectOption("#bq-area", { index: 1 });
  await page.fill("#bq-glazing", "120");
  await page.fill("#bq-floors", "3");
  await page.locator(`form button:text-is("${L.heat}")`).first().click();
  await page.fill("#bq-name", "Test User"); await page.fill("#bq-phone", "0100000000");
  await page.locator('form button[type="submit"]').click();
  await page.waitForFunction(() => window.__wa !== null);
  const url = await page.evaluate(() => window.__wa);
  const reopen = await page.locator('a[href^="https://wa.me/"]').first().getAttribute("href");
  results.push({ form: "quote", locale, cookieRegion, formRegion, got: waNumber(url), reopen: waNumber(reopen), expect: EXPECT[formRegion] });
  await ctx.close();
}

for (const locale of ["ar", "en"])
  for (const cookie of ["egypt", "uae"])
    for (const form of ["egypt", "uae"]) {
      try { await booking(locale, cookie, form); } catch (e) { results.push({ form: "booking", locale, cookieRegion: cookie, formRegion: form, error: e.message.split("\n")[0] }); }
      try { await quote(locale, cookie, form); } catch (e) { results.push({ form: "quote", locale, cookieRegion: cookie, formRegion: form, error: e.message.split("\n")[0] }); }
      try { await wizardQuote(locale, cookie, form); } catch (e) { results.push({ form: "wizquote", locale, cookieRegion: cookie, formRegion: form, error: e.message.split("\n")[0] }); }
      try { await enquiry(locale, cookie, form); } catch (e) { results.push({ form: "enquiry", locale, cookieRegion: cookie, formRegion: form, error: e.message.split("\n")[0] }); }
    }
await browser.close();
let fails = 0;
for (const r of results) {
  const ok = !r.error && r.got === r.expect && r.reopen === r.expect;
  if (!ok) fails++;
  console.log(`${ok ? "PASS" : "FAIL"} ${r.form.padEnd(8)} ${r.locale} cookie=${r.cookieRegion.padEnd(5)} form=${r.formRegion.padEnd(5)} → ${r.got ?? "-"} (reopen ${r.reopen ?? "-"}) expect ${r.expect ?? ""} ${r.error ?? ""}`);
}
console.log(`\n${results.length - fails}/${results.length} passed`);
process.exit(fails ? 1 : 0);
