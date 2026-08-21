#!/usr/bin/env node
// Run: pnpm build && PORT=3111 pnpm start &  then  node scripts/e2e-analytics.mjs
// Real-browser verification of the Phase-18 event taxonomy: every tracked
// element is exercised in headless Chromium; we assert on (a) the in-page
// event log `window.__skAnalytics.log` and (b) the actual network beacons
// to GA4 / Meta / TikTok. Needs the NEXT_PUBLIC_* IDs baked into the build.
import { chromium } from "playwright";

const BASE = process.env.BASE ?? "http://localhost:3111";
let pass = 0, fail = 0;
const ok = (c, label) => { c ? pass++ : fail++; console.log(`${c ? "PASS" : "FAIL"}  ${label}`); };

const browser = await chromium.launch();

async function fresh(path, { region = "egypt", locale = "en" } = {}) {
  const ctx = await browser.newContext({ locale: locale === "ar" ? "ar-EG" : "en-US" });
  await ctx.addCookies([{ name: "sk-region", value: region, url: BASE }]);
  const beacons = [];
  // Let the pixel SDKs load for real; swallow the outbound beacons + wa.me / tel
  await ctx.route("**/*", (route) => {
    const u = route.request().url();
    if (/analytics\.google\.com\/g\/collect|google-analytics\.com\/g\/collect|googleads\.g\.doubleclick\.net|google\.com\/pagead|facebook\.com\/tr|analytics\.tiktok\.com\/api\/v2\/pixel|wa\.me/.test(u)) {
      beacons.push({ url: u, method: route.request().method(), body: route.request().postData() ?? "" });
      return route.fulfill({ status: 204, body: "" });
    }
    return route.continue();
  });
  await ctx.addInitScript(() => {
    window.__opened = [];
    window.open = (u) => { window.__opened.push(String(u)); return null; };
    // Meta's pixel refuses to beacon when it detects automation ("Bot traffic
    // detected and blocked") — hide the webdriver flag so fbevents.js sends
    // its real /tr requests, and ALSO spy on every fbq() call as ground truth.
    Object.defineProperty(navigator, "webdriver", { get: () => false });
    window.__fbqCalls = [];
    let real;
    Object.defineProperty(window, "fbq", {
      configurable: true,
      get() { return real; },
      set(fn) {
        real = fn;
        if (typeof fn === "function" && !fn.__spied) {
          const spy = function (...args) { window.__fbqCalls.push(args); return fn.apply(this, args); };
          Object.assign(spy, fn); spy.__spied = true; spy.callMethod = fn.callMethod; spy.queue = fn.queue;
          real = new Proxy(fn, { apply: (t, th, args) => { window.__fbqCalls.push(args); return t.apply(th, args); } });
        }
      },
    });
  });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.log("PAGEERROR", e.message));
  await page.goto(BASE + path, { waitUntil: "load" });
  await page.waitForTimeout(1500);
  return { ctx, page, beacons };
}
const log = (page) => page.evaluate(() => (window.__skAnalytics?.log ?? []).map((e) => ({ event: e.event, ...e.params })));
const has = (events, name, pred = () => true) => events.some((e) => e.event === name && pred(e));
// GA4 ships events via navigator.sendBeacon — the POST body is invisible to
// request interception, so ground truth for *which* events were issued is
// the gtag command queue (window.dataLayer), and the network proof is that
// /g/collect requests keep flowing.
const gaCalls = (page) => page.evaluate(() => (window.dataLayer ?? []).filter((a) => a && a[0] === "event").map((a) => `en=${a[1]}&` + Object.entries(a[2] ?? {}).map(([k, v]) => `${k}=${Array.isArray(v) ? v.join(",") : typeof v === "object" && v ? JSON.stringify(v) : v}`).join("&")));
const gaNet = (b) => b.filter((x) => /analytics\.google\.com\/g\/collect|google-analytics\.com\/g\/collect/.test(x.url));
const fbBeacons = (b) => b.filter((x) => /facebook\.com\/tr/.test(x.url)).map((x) => decodeURIComponent(x.url));
// fbq() call spy → "ev=Lead&eid=SK-…"-style strings so the same regexes apply
const fbCalls = (page) => page.evaluate(() => (window.__fbqCalls ?? []).map((a) => {
  const [m, ev, params, opts] = a;
  return `call=${m}&ev=${ev}${params ? "&" + Object.entries(params).map(([k, v]) => `${k}=${v}`).join("&") : ""}${opts?.eventID ? `&eid=${opts.eventID}` : ""}`;
}));
const ttBeacons = (b) => b.filter((x) => /analytics\.tiktok\.com\/api\/v2\/pixel/.test(x.url)).map((x) => x.body);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/* 1. Hard load + SDKs + first page_view on all three + client-side navigation */
{
  const { ctx, page, beacons } = await fresh("/en?utm_source=e2e&utm_medium=test&fbclid=FB123&gclid=GC456");
  await wait(1500);
  const scripts = await page.evaluate(() => [...document.scripts].map((s) => s.src).filter(Boolean));
  ok(scripts.some((s) => s.includes("googletagmanager.com/gtag/js?id=G-")), "gtag.js loaded (GA4 id)");
  ok(scripts.some((s) => s.includes("connect.facebook.net/en_US/fbevents.js")), "fbevents.js loaded");
  ok(scripts.some((s) => s.includes("analytics.tiktok.com/i18n/pixel/events.js")), "TikTok events.js loaded");
  ok(scripts.filter((s) => /gtag\/js\?id=G-/.test(s)).length === 1, "gtag.js (GA4) loaded exactly once (Ads destination script is loaded by gtag itself)");
  ok(await page.evaluate(() => window.__skAnalytics?.inited === true), "init flag set once");
  let ev = await log(page);
  ok(has(ev, "page_view", (e) => e.path === "/en"), "page_view on hard load (/en)");
  ok((await gaCalls(page)).some((b) => /^en=page_view&/.test(b) && /send_to=G-/.test(b)), "GA4: page_view issued (gtag queue, send_to GA4+Ads)");
  ok(gaNet(beacons).length >= 1, `GA4: /g/collect network beacon sent (${gaNet(beacons).length})`);
  const fbNet = fbBeacons(beacons);
  ok(fbNet.some((b) => /ev=PageView/.test(b) && /id=\d{15,16}/.test(b)) || (await fbCalls(page)).some((b) => /ev=PageView/.test(b)), `Meta: PageView (${fbNet.length ? "network beacon" : "fbq call"})`);
  ok(ttBeacons(beacons).some((b) => /"event":"Pageview"/.test(b) || /Pageview|page/i.test(b)), "TikTok beacon: page");
  const attr = await page.evaluate(() => JSON.parse(sessionStorage.getItem("sk-attribution") ?? "null"));
  ok(attr && attr.utm_source === "e2e" && attr.fbclid === "FB123" && attr.gclid === "GC456" && attr.landing_page.startsWith("/en"), "attribution captured (utm/fbclid/gclid/landing)");
  // client-side navigation via header link
  beacons.length = 0;
  await page.click('header a[href="/en/services"]');
  await page.waitForURL("**/en/services");
  await wait(1200);
  ev = await log(page);
  ok(has(ev, "page_view", (e) => e.path === "/en/services"), "page_view on client-side route change (/en/services)");
  ok(ev.filter((e) => e.event === "page_view").length === 2, `exactly 2 page_views after one navigation (${ev.filter((e) => e.event === "page_view").length})`);
  ok((await gaCalls(page)).filter((b) => /^en=page_view&/.test(b)).length === 2 && (await gaCalls(page)).some((b) => /^en=page_view&/.test(b) && /page_path=\/en\/services/.test(b)), "GA4: second page_view issued for /en/services after SPA nav");
  ok(gaNet(beacons).length >= 1, "GA4: /g/collect beacon sent after SPA nav");
  // Meta reports the in-page PageView count too (one per route)
  ok((await fbCalls(page)).filter((b) => /ev=PageView/.test(b)).length === 2, "Meta: exactly 2 PageView calls after one navigation");
  ok(fbBeacons(beacons).some((b) => /ev=PageView/.test(b)) || (await fbCalls(page)).filter((b) => /ev=PageView/.test(b)).length >= 2, "Meta: PageView after SPA nav");
  const scripts2 = await page.evaluate(() => [...document.scripts].map((s) => s.src).filter((s) => /gtag\/js\?id=G-/.test(s)).length);
  ok(scripts2 === 1, "no duplicate gtag.js after navigation");
  // FAB
  await page.click('a[data-track="whatsapp:fab"]');
  await wait(500);
  ev = await log(page);
  ok(has(ev, "whatsapp_click", (e) => e.source === "fab" && e.region === "egypt"), "whatsapp_click(fab)");
  ok(fbBeacons(beacons).some((b) => /ev=Contact/.test(b)) || (await fbCalls(page)).some((b) => /ev=Contact/.test(b)), "Meta: Contact for whatsapp_click");
  // footer
  await page.locator('a[data-track="call:footer"]').click();
  await page.locator('a[data-track="whatsapp:footer"]').click();
  await wait(400);
  ev = await log(page);
  ok(has(ev, "call_click", (e) => e.branch === "egypt-regional" && e.source === "footer"), "call_click(footer, egypt-regional)");
  ok(has(ev, "whatsapp_click", (e) => e.source === "footer"), "whatsapp_click(footer)");
  await ctx.close();
}

/* 2. Service pages: service_view + pending-service CTA */
for (const slug of ["ppf", "marine-ppf", "building-heat-isolation"]) {
  const { ctx, page, beacons } = await fresh(`/en/services/${slug}`);
  await wait(1500);
  const ev = await log(page);
  ok(has(ev, "service_view", (e) => e.service === slug), `service_view(${slug})`);
  ok(fbBeacons(beacons).some((b) => /ev=ViewContent/.test(b)) || (await fbCalls(page)).some((b) => /ev=ViewContent/.test(b) && new RegExp(`content_name=${slug}`).test(b)), `Meta: ViewContent (${slug})`);
  if (slug === "marine-ppf") {
    await page.locator('a[href*="wa.me"]').first().click();
    await wait(400);
    ok(has(await log(page), "whatsapp_click", (e) => e.source === "service_page"), "whatsapp_click(service_page) on pending CTA");
  }
  await ctx.close();
}

/* 3. Branches: cards + map */
{
  const { ctx, page } = await fresh("/en/branches");
  await wait(800);
  // force: the Reveal entrance animation can leave the card image over the link for a moment
  await page.locator('a[data-track="call:branch_card"]').first().click({ force: true });
  await page.locator('a[data-track="whatsapp:branch_card"]').first().click({ force: true });
  await page.locator('a[data-track="directions:branch_card"]').first().click({ force: true });
  await wait(400);
  let ev = await log(page);
  ok(has(ev, "call_click", (e) => e.source === "branch_card" && e.branch), "call_click(branch_card)");
  ok(has(ev, "whatsapp_click", (e) => e.source === "branch_card" && e.branch), "whatsapp_click(branch_card)");
  ok(has(ev, "branch_view", (e) => e.action === "call") && has(ev, "branch_view", (e) => e.action === "whatsapp") && has(ev, "branch_view", (e) => e.action === "directions"), "branch_view(call/whatsapp/directions)");
  // map pin → popup → links
  const pins = page.locator(".sk-map-pin");
  await pins.first().scrollIntoViewIfNeeded();
  await wait(800);
  await pins.first().click({ force: true });
  await wait(600);
  ev = await log(page);
  ok(has(ev, "branch_view", (e) => e.action === "map_popup"), "branch_view(map_popup) on pin click");
  const popupWa = page.locator('.leaflet-popup a[data-track="whatsapp:branch_map"]');
  if (await popupWa.count()) {
    await popupWa.first().click();
    await page.locator('.leaflet-popup a[data-track="call:branch_map"]').first().click();
    await wait(400);
    ev = await log(page);
    ok(has(ev, "whatsapp_click", (e) => e.source === "branch_map" && e.branch), "whatsapp_click(branch_map) from popup");
    ok(has(ev, "call_click", (e) => e.source === "branch_map"), "call_click(branch_map) from popup");
  } else {
    ok(false, "map popup rendered with tracked links");
  }
  await ctx.close();
}

/* 4. Booking wizard end-to-end — vehicle flow: start / steps / complete / ref / whatsapp / intent log */
const WIZ = {
  en: { next: "Next", egypt: "Egypt", confirm: "Confirm booking", confirmQuote: "Send quote request", confirmEnquiry: "Send enquiry", refLabel: "Request ref", building: "Building heat isolation", marine: "Marine PPF", residential: "Residential", heat: "Heat", quoteTitle: "Quotation request — building heat isolation", enquiryTitle: "Enquiry — Marine PPF" },
  ar: { next: "التالي", egypt: "مصر", confirm: "أكد الحجز", confirmQuote: "أرسل طلب عرض السعر", confirmEnquiry: "أرسل الاستفسار", refLabel: "رقم الطلب", building: "عزل حراري للمباني", marine: "حماية القوارب", residential: "سكني", heat: "الحرارة", quoteTitle: "طلب عرض سعر — عزل حراري للمباني", enquiryTitle: "استفسار — حماية القوارب" },
};
for (const locale of ["en", "ar"]) {
  const L = WIZ[locale];
  const { ctx, page, beacons } = await fresh(`${locale === "en" ? "/en" : ""}/booking?utm_source=meta&utm_campaign=summer&fbclid=XYZ`, { locale });
  const clickText = (txt) => page.locator(`main button:text-is("${txt}")`).first().click();
  let ev = await log(page);
  ok(!has(ev, "booking_start") && !has(ev, "quote_start") && !has(ev, "enquiry_start"), `[${locale}] no funnel-top event before a service is picked`);
  await page.locator("main button[aria-pressed]").first().click(); // first card = PPF (cars group first)
  await wait(200);
  ev = await log(page);
  ok(has(ev, "booking_start", (e) => e.region === "egypt" && e.service === "ppf"), `[${locale}] booking_start on picking a vehicle service`);
  await clickText(L.next);
  await clickText(L.egypt); await clickText(L.next);
  await page.locator("main button[aria-pressed]").first().click(); await clickText(L.next);
  await page.fill("#bk-make", "Toyota"); await page.fill("#bk-model", "Prado"); await clickText(L.next);
  await page.locator("main button.sk-day:not([disabled])").first().click(); await clickText(L.next); // first selectable day = tomorrow
  await page.locator("main button[aria-pressed]").first().click(); await clickText(L.next);
  await page.fill("#bk-name", "E2E Tester"); await page.fill("#bk-phone", "0100000000"); await clickText(L.next);
  await page.locator('button[data-track="booking:confirm"]').click();
  await wait(2500);
  ev = await log(page);
  ok(ev.filter((e) => e.event === "booking_start").length === 1, `[${locale}] booking_start fired exactly once`);
  const steps = ev.filter((e) => e.event === "booking_step").map((e) => `${e.step}:${e.step_name}${e.flow ? "/" + e.flow : ""}`);
  ok(steps.join(",") === "1:service,2:region/vehicle,3:branch/vehicle,4:car/vehicle,5:date/vehicle,6:time/vehicle,7:contact/vehicle,8:confirm/vehicle", `[${locale}] booking_step ×8 in order with flow (${steps.join(",")})`);
  const done = ev.find((e) => e.event === "booking_complete");
  ok(done && /^SK-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/.test(done.ref) && done.region === "egypt" && done.branch && done.service === "ppf", `[${locale}] booking_complete with SK-ref (${done?.ref})`);
  ok(has(ev, "whatsapp_click", (e) => e.source === "booking" && e.ref === done?.ref), `[${locale}] whatsapp_click(booking) carries the same ref`);
  const opened = await page.evaluate(() => window.__opened);
  const msg = decodeURIComponent((opened[0] ?? "").split("text=")[1] ?? "");
  ok(opened.length === 1 && /wa\.me\/201103402446/.test(opened[0]), `[${locale}] window.open → wa.me egypt regional line`);
  ok(msg.split("\n")[1] === `${L.refLabel}: ${done?.ref}`, `[${locale}] ref is line 2 of the WhatsApp message, labelled «${L.refLabel}»`);
  ok(!/Quotation|عرض سعر|Enquiry|استفسار/.test(msg.split("\n")[0]), `[${locale}] vehicle message is a booking, not a quote/enquiry`);
  ok(fbBeacons(beacons).some((b) => /ev=Lead/.test(b) && new RegExp(`eid=${done?.ref}`).test(b)) || (await fbCalls(page)).some((b) => /ev=Lead/.test(b) && new RegExp(`eid=${done?.ref}`).test(b)), `[${locale}] Meta: Lead with eventID=ref`);
  const gaq = await gaCalls(page);
  ok(gaq.some((b) => /^en=booking_complete&/.test(b) && new RegExp(`ref=${done?.ref}`).test(b)) && gaq.some((b) => /^en=generate_lead&/.test(b) && new RegExp(`transaction_id=${done?.ref}`).test(b)), `[${locale}] GA4: booking_complete + generate_lead issued with ref`);
  // TikTok's SDK sends our SubmitForm on the wire as "Lead" (its merged lead event); event_id must be the ref
  ok(ttBeacons(beacons).some((b) => /"event":"(SubmitForm|Lead)"/.test(b) && new RegExp(`"event_id":"${done?.ref}"`).test(b)), `[${locale}] TikTok beacon: SubmitForm/Lead with event_id=ref`);
  const intents = await page.evaluate(() => JSON.parse(localStorage.getItem("sk-booking-intents") ?? "[]"));
  const last = intents[intents.length - 1];
  ok(last && last.ref === done?.ref && last.kind === "booking" && last.region === "egypt" && last.branch && last.service && last.at && last.attribution?.utm_source === "meta" && last.attribution?.fbclid === "XYZ" && last.attribution?.utm_campaign === "summer", `[${locale}] intent log: ref + region/branch/service + attribution (utm/fbclid)`);
  // success-screen "open again" link fires whatsapp_click(booking) with the ref
  await page.locator('a[data-track="whatsapp:booking"]').click();
  await wait(300);
  ok((await log(page)).filter((e) => e.event === "whatsapp_click" && e.source === "booking" && e.ref === done?.ref).length === 2, `[${locale}] reopen link fires whatsapp_click(booking) with ref`);
  const shown = await page.locator("main").innerText();
  ok(shown.includes(done?.ref ?? "x"), `[${locale}] ref shown on the success screen`);
  await ctx.close();
}

/* 4b. Wizard — building flow: quote_start(wizard) → measurements → quote_complete(wizard), same WhatsApp shape as the quote page */
for (const locale of ["en", "ar"]) {
  const L = WIZ[locale];
  const { ctx, page, beacons } = await fresh(`${locale === "en" ? "/en" : ""}/booking`, { locale });
  const clickText = (txt) => page.locator(`main button:text-is("${txt}")`).first().click();
  await page.locator(`main button[aria-pressed]:has-text("${L.building}")`).first().click();
  await wait(200);
  let ev = await log(page);
  ok(has(ev, "quote_start", (e) => e.region === "egypt" && e.service === "building-heat-isolation" && e.source === "wizard") && !has(ev, "booking_start"), `[${locale}] quote_start(wizard) on picking the building service, no booking_start`);
  await clickText(L.next);
  await clickText(L.egypt); await clickText(L.next);
  await clickText(L.residential); await clickText(L.next);
  await page.selectOption("#bk-area", { index: 1 }); await clickText(L.next);
  await page.fill("#bk-glazing", "120"); await page.fill("#bk-floors", "3"); await clickText(L.next);
  await clickText(L.heat); await clickText(L.next);
  await page.fill("#bk-name", "E2E Tester"); await page.fill("#bk-phone", "0100000000"); await clickText(L.next);
  ok(await page.locator('button[data-track="quote:confirm"]').innerText() === L.confirmQuote, `[${locale}] building CTA reads «${L.confirmQuote}»`);
  await page.locator('button[data-track="quote:confirm"]').click();
  await wait(2000);
  ev = await log(page);
  const steps = ev.filter((e) => e.event === "booking_step").map((e) => e.step_name);
  ok(steps.join(",") === "service,region,property,location,measurements,problem,contact,confirm", `[${locale}] building steps in order, no branch/car/date/time (${steps.join(",")})`);
  const done = ev.find((e) => e.event === "quote_complete");
  ok(done && /^SK-[A-Z2-9]{6}$/.test(done.ref) && done.region === "egypt" && done.property_type === "residential" && done.service === "building-heat-isolation" && done.source === "wizard", `[${locale}] quote_complete(wizard) with SK-ref (${done?.ref})`);
  ok(!has(ev, "booking_complete") && !has(ev, "enquiry_complete"), `[${locale}] building flow fires only quote_complete`);
  ok(has(ev, "whatsapp_click", (e) => e.source === "quote" && e.ref === done?.ref && !e.branch), `[${locale}] whatsapp_click(quote) with ref, no branch`);
  const opened = await page.evaluate(() => window.__opened);
  const lines = decodeURIComponent((opened[0] ?? "").split("text=")[1] ?? "").split("\n");
  ok(lines[0] === L.quoteTitle, `[${locale}] WhatsApp first line is the quote marker «${lines[0]}»`);
  ok(lines[1] === `${L.refLabel}: ${done?.ref}`, `[${locale}] ref is line 2`);
  ok(/120 m²/.test(lines[2]) && !/Toyota|Prado|2026-09-01/.test(lines.join(" ")), `[${locale}] measurements follow, no car/date fields`);
  ok(fbBeacons(beacons).some((b) => /ev=Lead/.test(b) && new RegExp(`eid=${done?.ref}`).test(b)) || (await fbCalls(page)).some((b) => /ev=Lead/.test(b) && new RegExp(`eid=${done?.ref}`).test(b)), `[${locale}] Meta: Lead with eventID=ref (quote via wizard)`);
  const intents = await page.evaluate(() => JSON.parse(localStorage.getItem("sk-building-quote-intents") ?? "[]"));
  const last = intents[intents.length - 1];
  ok(last && last.ref === done?.ref && last.kind === "quote" && last.branch === null && last.service === "building-heat-isolation", `[${locale}] intent log (quote key): ref, kind quote, no branch`);
  await ctx.close();
}

/* 4c. Wizard — enquiry flow (marine): enquiry_start → details → enquiry_complete as a primary conversion */
for (const locale of ["en", "ar"]) {
  const L = WIZ[locale];
  const { ctx, page, beacons } = await fresh(`${locale === "en" ? "/en" : ""}/booking`, { locale });
  const clickText = (txt) => page.locator(`main button:text-is("${txt}")`).first().click();
  await page.locator(`main button[aria-pressed]:has-text("${L.marine}")`).first().click();
  await wait(200);
  let ev = await log(page);
  ok(has(ev, "enquiry_start", (e) => e.region === "egypt" && e.service === "marine-ppf") && !has(ev, "booking_start") && !has(ev, "quote_start"), `[${locale}] enquiry_start on picking marine, no booking/quote start`);
  await clickText(L.next);
  await clickText(L.egypt); await clickText(L.next);
  await page.fill("#bk-details", "12m yacht, hull sides"); await clickText(L.next);
  await page.fill("#bk-name", "E2E Tester"); await page.fill("#bk-phone", "0100000000"); await clickText(L.next);
  ok(await page.locator('button[data-track="enquiry:confirm"]').innerText() === L.confirmEnquiry, `[${locale}] enquiry CTA reads «${L.confirmEnquiry}»`);
  await page.locator('button[data-track="enquiry:confirm"]').click();
  await wait(2000);
  ev = await log(page);
  const steps = ev.filter((e) => e.event === "booking_step").map((e) => e.step_name);
  ok(steps.join(",") === "service,region,details,contact,confirm", `[${locale}] enquiry steps: service,region,details,contact,confirm (${steps.join(",")})`);
  const done = ev.find((e) => e.event === "enquiry_complete");
  ok(done && /^SK-[A-Z2-9]{6}$/.test(done.ref) && done.region === "egypt" && done.service === "marine-ppf", `[${locale}] enquiry_complete with SK-ref (${done?.ref})`);
  ok(has(ev, "whatsapp_click", (e) => e.source === "enquiry" && e.ref === done?.ref), `[${locale}] whatsapp_click(enquiry) with ref`);
  const opened = await page.evaluate(() => window.__opened);
  const lines = decodeURIComponent((opened[0] ?? "").split("text=")[1] ?? "").split("\n");
  ok(lines[0] === L.enquiryTitle && lines[1] === `${L.refLabel}: ${done?.ref}` && lines.some((l) => /12m yacht/.test(l)), `[${locale}] enquiry message: «${lines[0]}», ref line 2, details present`);
  const gaq = await gaCalls(page);
  ok(gaq.some((b) => /^en=enquiry_complete&/.test(b)) && gaq.some((b) => /^en=generate_lead&/.test(b) && new RegExp(`transaction_id=${done?.ref}`).test(b)), `[${locale}] GA4: enquiry_complete + generate_lead (primary conversion)`);
  ok(fbBeacons(beacons).some((b) => /ev=Lead/.test(b) && new RegExp(`eid=${done?.ref}`).test(b)) || (await fbCalls(page)).some((b) => /ev=Lead/.test(b) && new RegExp(`eid=${done?.ref}`).test(b)), `[${locale}] Meta: Lead with eventID=ref (enquiry)`);
  const intents = await page.evaluate(() => JSON.parse(localStorage.getItem("sk-enquiry-intents") ?? "[]"));
  const last = intents[intents.length - 1];
  ok(last && last.ref === done?.ref && last.kind === "enquiry" && last.service === "marine-ppf", `[${locale}] intent log (enquiry key)`);
  await ctx.close();
}

/* 5. Building quote end-to-end */
{
  const { ctx, page, beacons } = await fresh("/en/services/building-heat-isolation/quote?gclid=GQ1");
  await wait(500);
  let ev = await log(page);
  ok(has(ev, "quote_start", (e) => e.source === "page" && e.service === "building-heat-isolation"), "quote_start(page) on mount");
  ok(has(ev, "service_view") === false, "quote page does not fire service_view (not a service page)");
  const clickText = (txt) => page.locator(`main button:text-is("${txt}")`).first().click();
  await clickText("Residential");
  await page.selectOption("select", { index: 1 });
  await page.locator('main input[type="text"], main input:not([type])').first().fill("40");
  // fill every remaining required text input generically
  const inputs = page.locator("main input");
  const n = await inputs.count();
  for (let i = 0; i < n; i++) {
    const el = inputs.nth(i);
    const type = await el.getAttribute("type");
    if (type && !["text", "tel", "number"].includes(type)) continue;
    if ((await el.inputValue()) === "") await el.fill(type === "tel" ? "0100000000" : "3");
  }
  await page.locator('main button:has-text("Heat")').first().click().catch(() => {});
  await page.locator('main button[type="submit"]').click();
  await wait(2500);
  ev = await log(page);
  const done = ev.find((e) => e.event === "quote_complete");
  ok(done && /^SK-[A-Z2-9]{6}$/.test(done.ref) && done.region === "egypt" && done.property_type === "residential" && done.source === "page", `quote_complete(page) with SK-ref (${done?.ref})`);
  ok(has(ev, "whatsapp_click", (e) => e.source === "quote" && e.ref === done?.ref), "whatsapp_click(quote) carries ref");
  const opened = await page.evaluate(() => window.__opened);
  const msg = decodeURIComponent((opened[0] ?? "").split("text=")[1] ?? "");
  ok(msg.split("\n")[1] === `Request ref: ${done?.ref}`, "quote: ref is line 2 of the WhatsApp message");
  ok(fbBeacons(beacons).some((b) => /ev=Lead/.test(b) && new RegExp(`eid=${done?.ref}`).test(b)) || (await fbCalls(page)).some((b) => /ev=Lead/.test(b) && new RegExp(`eid=${done?.ref}`).test(b)), "quote: Meta Lead with eventID=ref");
  const intents = await page.evaluate(() => JSON.parse(localStorage.getItem("sk-building-quote-intents") ?? "[]"));
  const last = intents[intents.length - 1];
  ok(last && last.ref === done?.ref && last.kind === "quote" && last.attribution?.gclid === "GQ1", "quote intent log: ref + attribution(gclid)");
  await ctx.close();
}

/* 6. Stub forms + contact info */
for (const [path, form] of [["/en/contact", "contact"], ["/en/careers", "careers"], ["/en/franchise", "franchise"], ["/en/business", "business"], ["/en/warranty/claim", "warranty_claim"]]) {
  const { ctx, page, beacons } = await fresh(path);
  // fill required fields generically
  for (const sel of ["input[required]", "textarea[required]", "select[required]"]) {
    const els = page.locator(`form[data-track="form:${form}"] ${sel}`);
    const n = await els.count();
    for (let i = 0; i < n; i++) {
      const el = els.nth(i);
      const tag = await el.evaluate((e) => e.tagName.toLowerCase());
      const type = await el.getAttribute("type");
      if (tag === "select") { await el.selectOption({ index: 1 }).catch(() => {}); continue; }
      if (type === "checkbox" || type === "radio") { await el.check().catch(() => {}); continue; }
      if (type === "file") continue;
      await el.fill(type === "email" ? "e2e@example.com" : type === "tel" ? "0100000000" : type === "number" ? "3" : type === "date" ? "2026-09-01" : "E2E").catch(() => {});
    }
  }
  await page.locator(`form[data-track="form:${form}"] button[type="submit"]`).click();
  await wait(500);
  const ev = await log(page);
  ok(has(ev, "form_submit", (e) => e.form === form), `form_submit(${form}) on ${path}`);
  ok([...fbBeacons(beacons), ...(await fbCalls(page))].some((b) => form === "careers" ? /ev=SubmitApplication/.test(b) : /ev=Lead/.test(b)), `Meta ${form === "careers" ? "SubmitApplication" : "Lead"} for form_submit(${form})`);
  if (form === "contact") {
    await page.locator('a[data-track="call:contact"]').click();
    await page.locator('a[data-track="whatsapp:contact"]').click();
    await wait(300);
    const ev2 = await log(page);
    ok(has(ev2, "call_click", (e) => e.source === "contact") && has(ev2, "whatsapp_click", (e) => e.source === "contact"), "contact info call_click + whatsapp_click");
  }
  await ctx.close();
}

/* 7. Every tel:/wa.me anchor on key pages carries data-track (static completeness) */
for (const path of ["/en", "/en/contact", "/en/branches", "/en/services/ppf", "/en/services/marine-ppf", "/en/booking", "/"]) {
  const { ctx, page } = await fresh(path);
  const untracked = await page.evaluate(() =>
    [...document.querySelectorAll('a[href^="tel:"], a[href*="wa.me"]')]
      .filter((a) => !a.hasAttribute("data-track") && !a.closest("[data-track]"))
      .map((a) => a.getAttribute("href")),
  );
  ok(untracked.length === 0, `no untracked tel:/wa.me anchors on ${path} ${untracked.length ? JSON.stringify(untracked) : ""}`);
  await ctx.close();
}

await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
