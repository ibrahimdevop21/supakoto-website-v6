# supakoto.com V6 — Full Site Audit Summary

Date: 2026-08-25. Read-only. Nothing in `app/`, `components/`, `lib/`, `content/`, `messages/` was touched; `git status` shows only `docs/audit/`.
Live target: production (`main` @ c4bee0a). Local tree: `feat/phase-23-forms-destination` @ 64924d5.

Detail reports: [01-performance](01-performance.md) · [02-ai-crawlability](02-ai-crawlability.md) · [03-technical-seo](03-technical-seo.md) · [04-content-quality](04-content-quality.md) · [05-ui-ux-a11y](05-ui-ux-a11y.md) · [06-security](06-security.md). Raw data (Lighthouse JSON ×30, JS-off HTML ×47, CDP probes, 30 screenshots, ~31 MB): `docs/audit/data/`.

---

## 1. Measured scores

| Area | Score | How measured |
|---|---|---|
| Performance | **mobile perf 48–71 by route; TBT medians: `/` 776 ms · `/services/ppf` 1860 · `/booking` 2461 · `/branches` 1605 · `/en` 2282 · `/gallery` 5115 ms** | Lighthouse 13.4.1, live prod, 3 mobile runs/route, median. Desktop TBT `/` 341 ms. |
| AI crawlability | **5/10** | JS-off fetch of all 47 URLs; robots + 8 bot UAs curl-verified 200; schema extraction; FAQ extractability 0/15 pass |
| Technical SEO | **6/10** | Full internal-link crawl, per-URL title/meta/H-tree/canonical/hreflang/JSON-LD tables |
| Content quality | **6/10** | Every string in `messages/*.json` + `content/*.ts` read against CLAUDE.md rules; key parity 1256/1256 |
| UI / UX / a11y | **Lighthouse a11y 96 (all sampled routes); axe: color-contrast ×9–33/page, region ×1/page; UX 6/10** | axe-core on 14 route×viewport combos; wizard walked ×3 flows ×2 locales at 390 px |
| Security | **5/10** | Live header probes, bundle secret grep, `pnpm audit`, route/cookie review |

**On the baseline gap:** my machine reads `/` mobile perf 71 vs your 50, desktop TBT 341 vs your 470. Same Lighthouse version and config. Lighthouse `simulate` throttling runs an unthrottled trace on the host first and multiplies it, so a faster host produces a better score — a host artefact, not a methodology error. The *attribution* (which script, which component) is the transferable finding; the absolute numbers are not. Use `--throttling-method=devtools` or CrUX for cross-machine comparable numbers.

**One thing dominates every other area: production is running `main`, i.e. pre-Phase-23.** Every form on the live site is a `StubForm` that fakes success and renders a bracketed developer note publicly ("[يفعل الإرسال مع ربط الأنظمة — النموذج شكلي حاليا]" / "[Claim submissions activate with system link — this form is temporary]"). A warranty claim filed today goes nowhere. You know Phase 23 is gated on Resend env + mapping approval; what the audit adds is that this is visible to customers and crawlers *now*, and it is the single highest-impact item in five of the six reports.

---

## 2. PERFORMANCE FIRST — ranked by ms recovered per hour

Where the milliseconds go (mobile medians, from `mainthread-work-breakdown` + `bootup-time` + `third-parties-insight`):

- **The four pixels are 22–39 % of TBT on every route**: home 301 ms, service 472, booking 756, branches 508, `/en` 513, gallery 1207 ms. GTM/gtag (GA4 + Ads, 335 KB) is the largest, then Meta (176 KB), then TikTok (161 KB). Block-and-diff on home: 776 → ~429 ms TBT, **≈347 ms measured ceiling** from removing all four. They already load async post-hydration (hand-rolled `lazyOnload` equivalent in `lib/analytics.ts`) — there is no `next/script` strategy to flip. Further gain must come from *when* `initAnalytics()` runs (idle / first interaction) or from consent gating. **Report only — tracking branch.**
- **framer-motion is the largest first-party cost**: shared chunk `5672-*.js` (129 KB, 55 % unused) ships on every route and accounts for **2873 ms of bootup-time on home** — more than any single pixel. Driver: `components/ui/Reveal.tsx` (`useInView` + `AnimatePresence`) instantiated 30+ times on home, each triggering style/layout work (styleLayout 1388 ms on `/`).
- **Gallery is the worst page by 2×** (5115 ms TBT): `GalleryViewer.tsx:256` mounts all 236 thumbnails unvirtualised → scriptEvaluation 6824 ms. Network is fine (native lazy-load requests only 53 images); it is DOM/component mount cost.
- **Booking**: `react-day-picker` + `date-fns` are correctly code-split to `/booking` only (chunk `8648`, 81 KB) but imported statically in `BookingWizard.tsx:13`, so 76 % is unused on first paint and 100 % unused for the building/enquiry flows.
- **INP 321 ms (CrUX)**: six real interaction probes (Pixel 7, 4× CPU) all measured < 250 ms for app handlers. The CrUX figure is most likely taps colliding with pixel long tasks at t≈7–13 s, not slow handlers. Consistent with the pixel finding.
- **`/en` is 3× worse than `/`** (2282 vs 776 ms) on byte-identical code with a *smaller* DOM. Root cause not isolated within budget (fonts, DOM, bundle diffs ruled out). Needs a trace diff before anyone spends fix hours.
- Not TBT items (corrected false leads): JSON-LD size (inert, not parsed as JS); fonts (self-hosted, `swap`, 0 ms); Leaflet (already dynamic-imported); `date-fns` locales (only `ar` + `enUS`).

| Rank | Fix | File / component | Routes | ms recovered (mobile) | Confidence | Hours | ms/h |
|---|---|---|---|---|---|---|---|
| 1 | `next/dynamic(ssr:false)` the `DatePicker` | `components/forms/BookingWizard.tsx:13` | `/booking` | 150–300 | est. from 76 % unused chunk | 1 | 150–300 |
| 2 | Virtualise the thumbnail strip (~15 visible) | `components/sections/GalleryViewer.tsx:256` | `/gallery` | 1500–3000 | est. | 4–6 | 250–500 |
| 3 | `LazyMotion` + `domAnimation`, `motion.*` → `m.*` | `lib/motion.ts` + ~19 call sites | all | 300–600 per route | est. | 8–12 | 30–60 |
| 4 | Batch/lazy-init `Reveal` observers below the fold | `components/ui/Reveal.tsx` | home, service pages | contributes to 1388–2182 ms styleLayout; unquantified | low | 3 | needs trace |
| 5 | Trace-diff `/en` vs `/` | diagnostic | `/en` | up to 1506 ms if cause found | — | 2 | — |
| — | *Report only:* idle-gate / interaction-gate `initAnalytics()` | `lib/analytics.ts`, `components/providers/Analytics.tsx` | all | ≤ 347 measured ceiling; idle-gate delta smaller since they already fire late | measured ceiling | other branch | — |
| — | *Report only:* `lib/analytics.ts` + `lib/attribution.ts` duplicated into chunk `860-*.js` on 7 form routes | | 7 routes | ~9.5 KB, negligible | measured | other branch | — |

Doing only #1 and #2 fixes the two worst routes for ≤ 7 hours. #3 is the only fix that moves *every* route and it is a full regression surface.

---

## 3. Everything else — ranked by impact ÷ effort

| # | Area | Impact | Effort | Finding | Where |
|---|---|---|---|---|---|
| 1 | Content / UX / SEO | CRITICAL | deploy | Live forms are stubs with a visible dev note; leads, claims, careers, B2B all dead-end | `main:components/forms/StubForm.tsx` |
| 2 | Content | HIGH | 0.5 h | Testimonials render all 29 harvested reviews incl. "great discount", "Ramadan deal", "prices lower than other companies", and a flat "10 years warranty" — brand-rule violations on home, about, 4 service pages | `content/testimonials.ts` ids 7, 9, 16, 26, 28; `Testimonials.tsx` never reads `note` |
| 3 | Content | HIGH | 0.5 h | TAKAI attributed to marine/surface/colour-change where `content/services.ts:90` says no confirmed TAKAI product exists | `home.services.sub`, `services.index.seoDescription`, 2 gallery alts |
| 4 | Content / AI | HIGH | 0.5 h + owner | Literal placeholders live: `[To be confirmed]` in heat-isolation + nano-ceramic spec tables; `[Investment ranges — to be supplied by Ibrahim]` on `/franchise`, both locales | `messages/*.json` |
| 5 | AI / SEO | HIGH | 2–3 h | `Accordion.tsx` conditionally mounts answers → FAQ text absent from DOM on 14 pages while `FAQPage` JSON-LD claims it. 0/15 FAQ answers crawlable. One component fix | `components/ui/Accordion.tsx:79-93` |
| 6 | Security | HIGH | 2 h | Zero security headers (no CSP, XFO, XCTO, Referrer-Policy, Permissions-Policy); HSTS lacks `includeSubDomains`/`preload` | `next.config.ts` has no `headers()` |
| 7 | Security | HIGH | 2 h | `/api/forms` (Phase 23 branch): no Origin/Referer check → open relay through your Resend quota; in-memory rate limiter resets per cold start | `app/api/forms/route.ts` |
| 8 | UX | HIGH | 1 h | Booking wizard on a phone: Next button at y≈1353 px (below fold); on step change scroll is kept so the new heading sits at y≈−370 px and focus drops to `<body>` | `BookingWizard.tsx` |
| 9 | UX | HIGH | 1 h | Wizard has no validation messages; phone accepts "abcdefghij"; measurements accept −5 m² / 0 floors; refresh wipes progress; browser Back exits the wizard | `BookingWizard.tsx` `canContinue` |
| 10 | AI / Content | HIGH | 4 h | UAE product line (SILVER / MATT / MATT PLUS / ULTIMATE GLOSS / STEELPLUS) never in crawlable HTML — `RegionProvider` SSRs Egypt always | `content/regions.ts:46`, `TierBreakdown`, `TakaiComparison` |
| 11 | SEO | HIGH | 2 h | EN locale switcher links to `/ar/<path>` → 307 on 22 internal links | `en__*.html`; only 12 paths get a 308 from `next.config.ts` |
| 12 | Content | HIGH | 0.1 h | Egyptian dialect on `/authentic`: "إزاي أعرف إن فيلم الحماية أصلي؟" (white-Arabic version exists at `faq.items.genuine.q`) | `authentic.faq.1.q` |
| 13 | SEO | HIGH | 3 h | Self-serving `Review` schema (29 reviews on `Organization`) on 12 pages — violates review-snippet policy, no upside, ~9 KB × 12 | `Testimonials.tsx:46-60` |
| 14 | SEO | HIGH | 4 h | Service pages 65–93 % identical because the testimonials carousel injects ~1,400 words on 6 pages; unique copy 200–600 words | Jaccard in 03 §10 |
| 15 | a11y | MED | 1.5 h | The 4 missing Lighthouse points = one audit, `color-contrast`, from two tokens: `--color-fg-subtle #6b6b70` (3.27–3.73:1) and `--color-sk-red` as 14 px text (2.95–3.24:1). Includes the mandatory lifetime qualifier at 12 px / 3.73:1 | `app/globals.css` tokens |
| 16 | a11y | HIGH | 2 h | Lightbox, RegionPicker, testimonial modal are `aria-modal` but Tab escapes; desktop nav dropdown ignores Escape once inside; no skip link | `Lightbox.tsx`, `RegionPicker`, nav |
| 17 | Security | MED | 2 h | Upload type check trusts client `Content-Type`, no magic bytes, forwarded as attachment to staff inbox | `route.ts:93` |
| 18 | Security | MED | 1 h | `lib/intent.ts` writes full PII drafts to `console.info` + unencrypted `localStorage`, no TTL | `lib/intent.ts:41-46` — **tracking-adjacent, report only** |
| 19 | SEO / AI | MED | 2 h | Gallery: 242/243 images `alt=""` though 243 bilingual alts exist in messages; page has 31 words; no image schema | `GalleryViewer.tsx:240,274` |
| 20 | SEO | MED | 1 h | noindex marine/surface pages are linked from home, `/services`, each other, and carry hreflang — equity leak. Keep noindex, cut links + hreflang | 03 #7 |
| 21 | SEO | MED | 1 h | Footer links only authentic/privacy/terms; nav has one `/services` leaf; commercial pages 4–6 inbound vs 23–25 for nav pages; no service→warranty/faq/gallery/branches links | `Footer.tsx:90-107`, `lib/nav.ts` |
| 22 | SEO / Security | MED | 0.5 h | `/dev/kitchen-sink` live, 200, no noindex, 2 H1s | `app/[locale]/dev/` |
| 23 | Content | MED | 2 h | Service "Book this service" → bare `/booking`; no `?service=` preselect exists | `ServiceDetailBody.tsx:193` |
| 24 | Content | MED | owner | Three conflicting opening-hours statements (`/branches` "contact branch", `/booking` 10–20, `/contact` Sat–Thu 10–18) | 04 #9 |
| 25 | Content | MED | 0.5 h | Superlatives the guard misses: "Egypt's largest", "highest standard", "first name that comes to mind", "strongest combination", "flagship" | `check-claims.mjs` regex gaps |
| 26 | Content | MED | 1 h | "Exclusive agent" vs "sole authorized distributor" drift (footer, about vs authentic, meta); AR الوكيل الحصري vs الموزع المعتمد الوحيد | 04 #12 |
| 27 | SEO | MED | 0.5 h | Sitemap `lastmod = new Date()` at build — all 44 URLs same timestamp every deploy | `app/sitemap.ts:14` |
| 28 | SEO | MED | 1 h | Two `Organization` blocks with same `@id` on home; third without `@id` on `/authentic`; `Service.provider` is a fresh object; no `WebSite` node; `AutomotiveBusiness` ×6 lack hours/locality/`@id` parent | `lib/jsonld.ts`, `branches/page.tsx` |
| 29 | a11y | MED | 1 h | Leaflet pins: 6 × `role=button` with no accessible name, 18 px; zoom 30 px; English labels on Arabic pages | `/branches` |
| 30 | Security | MED | 1 h | `pnpm audit --prod`: 4 high / 2 moderate, all transitive via `next` (`sharp`, `postcss`, `nanoid`) — bump `next` | 06 #10–11 |
| 31 | UX | MED | 0.5 h | Hero dots 16×4 px; header controls 36 px; nothing meets 44 px on mobile (all ≥ 24 so AA passes) | 05 F11, F13 |
| 32 | UX | MED | 0.5 h | Wizard summary + WhatsApp message show raw ISO date `2026-08-26` | `slotLabel` |
| 33 | SEO | LOW | 1 h | Bare Next 404 (no `lang`/`dir`/nav) — no `[locale]/[...rest]` catch-all | 03 #15 |
| 34 | SEO | LOW | 0.5 h | 9 titles > 60 chars, 8 descriptions > 165; `/services`, `/business` skip H1→H3 | 03 #13–14 |
| 35 | Content | LOW | 0.5 h | AR/EN fact mismatch "chemical rain" vs "الأمطار الحمضية"; "3.5 مل" reads as millilitres; 7 gallery alts missing hamza; TAKAI/تاكاي mixed in one hero block | 04 #11, 13, 14 |
| 36 | Security | LOW | 0.5 h | `NEXT_LOCALE`, `sk-region` cookies lack `Secure`; `reply_to` unvalidated; subject not stripped of control chars | 06 #6, 7, 9 |
| 37 | AI | LOW | 0.5 h | No `llms.txt` — Anthropic + Perplexity consume it, Google explicitly doesn't. Worth 30 min, low leverage | 02 §2 |

Sitemap / GSC note: the codebase is fine for discovery — robots references the sitemap, hreflang alternates are in it, V2 `/ar/*` redirects exist, old `.php` sitemaps 404 (a 410 would drop faster). The only discovery blocker was the unsubmitted sitemap, which you are fixing. `lastmod` (#27) is the one code-side thing worth changing.

---

## 4. What is blocking AI citability, specifically

1. **FAQ answers don't exist in the DOM** until clicked (`Accordion.tsx`). 14 pages, 0/15 FAQ answers extractable, while JSON-LD claims them. Single highest-leverage fix on the site for AI.
2. **The UAE product line is invisible to every crawler** — `DEFAULT_REGION = "egypt"` at SSR, switch is client-side. Nothing to cite for TAKAI SILVER/MATT/STEELPLUS.
3. **Literal `[To be confirmed]` placeholders** in spec tables on two indexed pages — a crawler reads that as the spec.
4. **Gallery has ~90 words for 238 photos**, thumbnails `alt=""`, no image schema.
5. **Entity graph is homepage-only**: the strong `Organization` → `brand: TAKAI` → `manufacturer` node fires on `/` only; `/about` and service pages emit a thinner node with the *same* `@id`; TAKAI manufacturer has no `url`/`@id`.
6. Secondary: no `dateModified` on warranty/service/FAQ pages; phone numbers not strict E.164 in visible text/JSON-LD; addresses lack `addressLocality`; hero renders slide 1 of 5 only.

Not blocking: robots.txt (fully permissive, all 8 AI UAs verified 200, no Vercel firewall), `/about` + `/authentic` prose (server-rendered, one-sentence "sole authorized distributor" statement in both locales matching JSON-LD verbatim — best pages on the site for this).

---

## 5. Already good — do not touch

- **Pixel loading strategy** in `lib/analytics.ts`: async, post-hydration, env-gated per platform, one `track()` fan-out, no hard-coded IDs. Already the `lazyOnload` equivalent. (Tracking branch anyway.)
- **Code-splitting discipline**: Leaflet `await import` in `useEffect`; day-picker only on `/booking`; `date-fns` locales scoped to `ar` + `enUS`; client boundary pushed to leaf components (`PageHero`, `CtaBand`, `FeatureGrid`, `ServicesSection`, `ServiceDetailBody`, `ServicesGrid`, `Testimonials` stay server components).
- **Fonts**: self-hosted, `display: swap`/`optional`, 0 ms wasted. **Images**: `next/image` lazy-load works (53 of 236 gallery thumbs requested).
- **RTL**: 0 physical Tailwind direction classes; carousel, lightbox, testimonials, calendar all travel toward reading direction with mirrored chevrons; calendar Saturday-first with Arabic names; phones LTR everywhere. No horizontal overflow at 390 px on any of 14 pages.
- **Warranty discipline**: zero bare "lifetime" strings; qualifier co-rendered every time; nothing leaks into metadata or JSON-LD. i18n key parity 1256/1256; no tashkeel; no banned classical constructions or MSA clichés in `ar.json`.
- **SEO foundations**: canonicals, hreflang (head + header + sitemap, x-default → AR), `lang`/`dir`, https/www/trailing-slash 308s, unique keyworded titles, V2 `/ar/*` redirects, `noindex,follow` on marine/surface with deliberately empty specs.
- **Security**: no secrets in source or bundle; Supabase confirmed not integrated; no PII sent to any pixel; forms route never fakes success on missing `RESEND_API_KEY`; i18n routing has no open-redirect surface; honeypot + size limits present.
- **a11y structure**: one `<main>` / one `<h1>` per page; every form control labelled; heading order clean; reduced-motion honoured (except gallery autoplay video); dialogs restore focus (except RegionPicker).
- **Entity clarity** on `/about` and `/authentic`.

---

## 6. Open questions needing your decision

1. **Deploy Phase 23 now?** It removes the CRITICAL stub-forms finding and the public dev note. Blocking items are yours (Resend env, mapping approval). Security items #7 and #17 above are on that branch and should be fixed before or immediately after.
2. **Gallery virtualisation** — biggest perf win on the site, but a real UX change to a component with documented design intent (`docs/progress/20-gallery-viewer.md`). Own phase, or fold into a perf pass?
3. **`LazyMotion` migration** — touches ~19 files, every animated interaction. Own phase with review, or bundled?
4. **`/en` 3× TBT anomaly** — authorise a 2 h trace-diff before any fix hours?
5. **Pixels** — the ≈347 ms ceiling is the number for the tracking branch. Idle-gate `initAnalytics()`? Consent-gate (recovers it for non-consenting visitors as a side effect)? Your call there, not mine.
6. **Testimonials** — filter by `note`/allow-list (drops 5 reviews including the "discount" ones), and drop the `Review` schema? Also: consent for named reviewers, AstraZeneca, Hustle Drip, and the 27-logo "partners" strip (Ferrari/Rolls-Royce/Lamborghini as "partners" is a trademark question).
7. **AI bots** — keep `*` (training + retrieval both allowed) or add per-bot groups to block training crawlers (GPTBot, ClaudeBot, CCBot, Bytespider, Google-Extended…) while keeping citation bots?
8. **Region-gated content** — render both regions' product tables server-side with a toggle, so UAE tiers are crawlable?
9. **Placeholders** — supply heat-isolation heat/UV %, nano-ceramic hardness, franchise investment ranges; or remove those rows until confirmed?
10. **Opening hours** — which of the three statements is true?
11. **Accordion** — approve the "always in DOM, toggle visibility" change (one component, 14 pages) before any FAQ content work?
12. **`?service=` preselect** on `/booking` — build it? (3 reports flag it independently.)
13. **Contrast tokens** — approve new values for `--color-fg-subtle` (≥ `#8a8a90`) and a rule that `--color-sk-red` is never used as text on dark?
14. **Wizard persistence + validation policy** — `sessionStorage` + history entries; inline error messages per country phone format?
15. **`docs/audit/data/` (31 MB)** — commit it, or gitignore and keep the six reports only?

Nothing has been fixed. Stopping here as instructed.
