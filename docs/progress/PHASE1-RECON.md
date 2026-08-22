# PHASE 1 RECON — V6 current state (read-only)

*2026-08-22. Nothing modified, nothing committed — this file is the only
artifact. Every finding is marked **VERIFIED** (directly observed: file
read, command output, or live HTTP response), **INFERRED**, or
**UNKNOWN**. Working tree at time of recon: branch
`feat/phase-22-privacy-truth` (b9d5321); production = `main` (bd57ddf).*

**Headline observation (VERIFIED):** `https://supakoto.com` is serving
**V6** today — Next.js markers (`_next/static`, `__next`) and the Arabic
V6 title at the root, `/ar/` answering 308. The domain cutover has
happened. All live checks below were run against the production domain or
`supakoto-website-v6.vercel.app` (same deployment).

---

## 1. URL structure and redirects

### V6 routes (VERIFIED — `app/[locale]/**/page.tsx` + live sitemap)

Locale pattern: **Arabic at `/`, English at `/en`** (`localePrefix:
"as-needed"`, `i18n/routing.ts`). 20 page files → each route serves both
locales:

| Route (ar / en) |
|---|
| `/` · `/en` |
| `/about` · `/en/about` |
| `/authentic` · `/en/authentic` |
| `/booking` · `/en/booking` |
| `/branches` · `/en/branches` |
| `/business` · `/en/business` |
| `/careers` · `/en/careers` |
| `/contact` · `/en/contact` |
| `/faq` · `/en/faq` |
| `/franchise` · `/en/franchise` |
| `/gallery` · `/en/gallery` |
| `/privacy` · `/en/privacy` |
| `/services` · `/en/services` |
| `/services/[slug]` ×6: ppf, heat-isolation, colour-change, nano-ceramic, marine-ppf, surface-protection (dynamic) |
| `/services/building-heat-isolation` · `/en/…` (static page) |
| `/services/building-heat-isolation/quote` · `/en/…` |
| `/terms` · `/en/terms` |
| `/warranty` · `/en/warranty` |
| `/warranty/claim` · `/en/warranty/claim` |
| `/dev/kitchen-sink` (both locales; robots-disallowed, not in sitemap) |

Plus `/robots.txt`, `/sitemap.xml`, per-route `opengraph-image` routes.

### V2 Astro site (VERIFIED — found at `~/Desktop/supakoto-Website_V2_Prod`)

A git repo (Astro; `src/pages/` + built `dist/client/` with its emitted
sitemap). **V2 locale pattern is the inverse of V6: English at `/`,
Arabic under `/ar`** (`astro.config`: `defaultLocale: 'en'`,
locales `['en','ar']`). V2's emitted sitemap (25 URLs, all with trailing
slashes — VERIFIED from `dist/client/sitemap-0.xml`):

EN: `/` `/about/` `/business/` `/contact/` `/faq/` `/gallery/`
`/locations/` `/offers/` `/privacy/` `/services/` `/terms/` `/test-chat/`
`/thank-you/`
AR: `/ar/` `/ar/about/` `/ar/business/` `/ar/contact/` `/ar/faq/`
`/ar/gallery/` `/ar/locations/` `/ar/offers/` `/ar/privacy/`
`/ar/services/` `/ar/terms/` `/ar/thank-you/`
API (POST endpoints, robots-disallowed on V2): `/api/contact`
`/api/business-contact` `/api/lead`

### Redirect rules (VERIFIED — full dump)

- **`middleware.ts`:** 8 lines, next-intl locale middleware only. No
  redirect rules.
- **`vercel.json`:** does not exist.
- **`next.config.ts` `redirects()`** — all `permanent: true` (308):

| Source | Destination |
|---|---|
| `/ar` | `/` |
| `/ar/about` | `/about` |
| `/ar/services` | `/services` |
| `/ar/gallery` | `/gallery` |
| `/ar/locations` | `/branches` |
| `/ar/business` | `/business` |
| `/ar/contact` | `/contact` |
| `/ar/faq` | `/faq` |
| `/ar/privacy` | `/privacy` |
| `/ar/terms` | `/terms` |
| `/ar/offers` | `/services` |
| `/ar/thank-you` | `/` |
| `/services/polishing` | `/services` |
| `/en/services/polishing` | `/en/services` |
| `/locations` | `/en/branches` |
| `/offers` | `/en/services` |
| `/thank-you` | `/en` |

### V2 route → V6 redirect matrix

Live-probed on the deployment (VERIFIED where marked; the rest share the
identical config mechanism — INFERRED from the verified table above):

| V2 URL | Outcome | Status |
|---|---|---|
| `/ar/` + all 11 `/ar/*` pages | 308 (slash-normalise) → 308 → correct Arabic V6 page | VERIFIED live for `/ar/`, `/ar/about/`, `/ar/gallery`, `/ar/locations/`, `/ar/offers/`, `/ar/thank-you/`; rest INFERRED (same config) |
| `/locations/` → `/en/branches`, `/offers/` → `/en/services`, `/thank-you/` → `/en` | works | VERIFIED live |
| `/`, `/about/`, `/business/`, `/contact/`, `/faq/`, `/gallery/`, `/privacy/`, `/services/`, `/terms/` | **path collision — no redirect possible.** These V2 *English* URLs now serve the *Arabic* V6 page at the same path. Deliberate 2026-08-05 decision ("collision case"): the URL survives with full hreflang pointing Google at `/en/*`, but a V2 English visitor/bookmark lands on Arabic. | VERIFIED (config comment + live `/about/` → `/about` serving ar) |
| `/test-chat/` | **404 — no redirect.** The only unredirected V2 HTML route. | VERIFIED live |
| `/api/contact`, `/api/business-contact`, `/api/lead` | 404 (V2 POST endpoints; nothing in V6 answers them) | VERIFIED live for `/api/lead`; others INFERRED |

Note (VERIFIED): every V2 URL redirect is a **2-hop chain** — Vercel first
strips the V2 trailing slash (308), then the configured redirect fires
(308). Functional, costs one extra hop for crawlers processing legacy
URLs.

### The old /services anchor URLs (VERIFIED)

These were V6's own Phase-14 URLs (live only 2026-08-14 → 16; V2 never
had them): `/services#ppf`, `/services#heat-isolation`, etc. **No
redirects exist and none are possible** — fragments are never sent to the
server (stated in the config comment). What actually happens: the URL
loads the services *index* fine, but the index page renders **zero `id=`
anchors** (VERIFIED against live `/en/services`), so the fragment scrolls
nowhere — visitor lands at the top of the index, not on the named
service, and per-slug mapping does not occur. The six slugs' real pages
exist at `/services/<slug>`; only the fragment hop is lost.

---

## 2. Indexing hygiene

- **robots.txt** (VERIFIED live): `Allow: /`, `Disallow: /dev/` +
  `/en/dev/`, `Sitemap: https://supakoto.com/sitemap.xml`. Source:
  `app/robots.ts`.
- **Sitemap** (VERIFIED live): 44 URLs from `app/sitemap.ts`, **both
  locales as independent entries** (22 ar + 22 en), no trailing slashes,
  absolute on `supakoto.com`. Excluded: marine-ppf, surface-protection
  (both locales), `/dev/*`. Everything else from §1 is present.
- **noindex** (VERIFIED live): `<meta name="robots" content="noindex,
  follow">` present on `/en/services/marine-ppf` and
  `/en/services/surface-protection`; absent on `/en/services/ppf`
  (spot-checked — no robots meta at all, i.e. indexable). Driven by
  `NOINDEX_SERVICE_IDS` in `content/services.ts` through
  `pageMetadata({ noindex })`. Other routes carry no noindex (INFERRED
  from code path: only the two service ids set the flag; crawl suite
  passes with that assumption).
- **hreflang** (VERIFIED live on `/en/about`): three alternates per page —
  `ar` → the `/` path, `en` → the `/en` path, `x-default` → the Arabic
  URL. Emitted by `lib/metadata.ts` on every page using `pageMetadata`.
- **Canonicals** (VERIFIED): self-referencing per locale
  (`/en/about` canonicalises to `https://supakoto.com/en/about`), built
  from `SITE_URL` = `NEXT_PUBLIC_SITE_URL ?? "https://supakoto.com"` —
  the deployment emits `supakoto.com` canonicals (observed live), so the
  env var is set (or the fallback is doing the same job).

---

## 3. Forms

Seven forms total. **None sends data to any server owned by us — V6 has
zero API routes.** Two hand off to WhatsApp; five discard.

| # | Form | File | Route | Fields | On submit | Events fired |
|---|---|---|---|---|---|---|
| 1 | Booking wizard (3 flows) | `components/forms/BookingWizard.tsx` | `/booking` ×2 locales | service, region, then per flow — vehicle: branch, make, model, date, time; building: propertyType, area, measure mode + glazing/windows, floors, glassType, problem; marine/interior: details; all: name, phone | Generates `SK-XXXXXX` ref → `window.open(wa.me/<regional>?text=…)` with the full message; entry appended to localStorage intent log. **No HTTP submit.** | booking_start / quote_start / enquiry_start (service pick), booking_step ×N, booking_complete / quote_complete / enquiry_complete (+ Lead w/ eventID=ref), whatsapp_click |
| 2 | Building quote page | `components/forms/BuildingQuoteForm.tsx` (+ shared `forms/building/*`) | `/services/building-heat-isolation/quote` | same building fieldset + name, phone | identical WhatsApp handoff + intent log; no HTTP | quote_start(page) on mount, quote_complete(page), whatsapp_click |
| 3 | Contact | `components/forms/ContactForm.tsx` | `/contact` | name, phone, email, subject, message | **DISCARDED** | form_submit(contact) — GA4 only |
| 4 | Careers | `components/forms/CareersForm.tsx` | `/careers` | name, phone, email, role, cv (file), message | **DISCARDED** | form_submit(careers) — GA4 only |
| 5 | Franchise | `components/forms/FranchiseForm.tsx` | `/franchise` | name, phone, email, city, budget, message | **DISCARDED** | form_submit(franchise) — GA4 only |
| 6 | Business | `components/forms/BusinessForm.tsx` | `/business` | name, phone, email, company, type, size, message | **DISCARDED** | form_submit(business) — GA4 only |
| 7 | Warranty claim | `components/forms/ClaimForm.tsx` | `/warranty/claim` | branch, plate, invoiceDate, issue, photos (file) | **DISCARDED** | form_submit(warranty_claim) — GA4 only |

**Evidence for "discarded" (VERIFIED):** forms 3–7 all wrap
`components/forms/StubForm.tsx`, whose submit handler is
`e.preventDefault(); track("form_submit", …); setSubmitted(true)` — no
fetch, no action attribute, nothing leaves the page. The UI itself prints
"[Submission activates with system integration — this form is a stub for
now]". The GA4-only event scope is the Phase-21 fix (`lib/analytics.ts`
`form_submit` case), verified by e2e (143/143: zero Meta/TikTok beacons
on all five submits).

---

## 4. Analytics module (`lib/analytics.ts`, post-Phase-21 — VERIFIED, code + prod e2e)

### Event → platform map

| Event | GA4 (name) | Meta (name / kind) | TikTok (name / kind) | Google Ads |
|---|---|---|---|---|
| page_view | `page_view` (auto pageview off; send_to GA4+AW) | `PageView` — standard | `ttq.page()` → `Pageview` — standard | `page_view` (base tag, send_to AW) |
| service_view | `view_item` | `ViewContent` — standard | `ViewContent` — standard | — |
| booking_start | `booking_start` (custom) | `trackCustom booking_start` — custom | `booking_start` — **custom** | — |
| quote_start | `quote_start` (custom) | `trackCustom` — custom | **custom** | — |
| enquiry_start | `enquiry_start` (custom) | `trackCustom` — custom | **custom** | — |
| booking_step | `booking_step` (custom) | `trackCustom` — custom | **custom** | — |
| booking_complete | `booking_complete` + `generate_lead` (transaction_id=ref) | `Lead` — standard, **eventID=ref** | `SubmitForm` — standard, event_id=ref (TikTok's wire merges it into its `Lead`) | — |
| quote_complete | ditto | `Lead` — standard, eventID=ref | `SubmitForm` — standard | — |
| enquiry_complete | ditto | `Lead` — standard, eventID=ref | `SubmitForm` — standard | — |
| whatsapp_click | `whatsapp_click` (custom) | `Contact` — standard | `Contact` — standard | — |
| call_click | `call_click` (custom) | `Contact` — standard | `Contact` — standard | — |
| branch_view | `branch_view` (custom) | `trackCustom` — custom | **custom** | — |
| form_submit | `form_submit` | — (removed Phase 21) | — (removed Phase 21) | — |

TikTok standard events in use: `Pageview` (via `page()`), `ViewContent`,
`Contact`, `SubmitForm`. TikTok custom events: `booking_start`,
`quote_start`, `enquiry_start`, `booking_step`, `branch_view`.

- **Conversion value / currency: none, anywhere** (VERIFIED — no `value`
  or `currency` key exists in `lib/analytics.ts` or any `track()` call).
- **Google Ads** receives only `page_view` via the base tag (`AW-…`
  config with `send_page_view: false`, our page_view has `send_to` both).
  No conversion actions (deliberate, Phase 18).

### Attribution cookie (VERIFIED — `lib/attribution.ts`, post-Phase-21)

- Name: `sk-attribution` (URI-encoded JSON, first-party).
- Fields: `landed_at` (ISO), `landing_page` (path+query), `referrer`,
  `utm_source/medium/campaign/term/content/id`, `fbclid`, `gclid`,
  `gbraid`, `wbraid`, `ttclid` (only params present are stored).
- `Max-Age=2592000` (30 days), `Path=/`, `SameSite=Lax`, `Secure` when
  https.
- **Overwrite logic on repeat visits: none.** `captureAttribution()`
  returns the existing cookie untouched if one exists — first touch wins
  unconditionally, even when the new visit carries fresh UTMs/click-ids.
  A new first touch begins only after the cookie expires. (This is the
  Phase-21 change; live production behavior e2e-asserted.)

### Vercel Analytics / Speed Insights (VERIFIED)

**Not installed and not mounted.** Neither `@vercel/analytics` nor
`@vercel/speed-insights` appears in `package.json`, and no layout mounts
them.

---

## 5. Privacy page copy — in full

Component: `app/[locale]/privacy/page.tsx`. Copy: `messages/en.json` /
`messages/ar.json`, namespace `privacy`.

⚠️ **Deployment split (VERIFIED):** production (`main` bd57ddf) still
serves the OLD copy below; the REWRITTEN copy exists on the unmerged
branch `feat/phase-22-privacy-truth`.

### Currently LIVE on production (old — factually false)

EN sections: What we collect — "The contact details you enter in booking
and contact forms: name, phone number, email, and the car details you
share with us." · How we use it — "Confirming bookings, answering
enquiries, warranty follow-up, and improving our service. We do not sell
your data to any third party." · Cookies — **"We use a single cookie to
remember your region choice (Egypt / UAE). No advertising trackers."** ·
Privacy questions — "Any question about your data? Reach us through the
contact page and we'll answer."

AR sections: «بيانات التواصل التي تدخلها في نماذج الحجز والتواصل: الاسم
ورقم الهاتف والبريد الإلكتروني وبيانات السيارة التي تشاركها معنا.» ·
«تأكيد الحجوزات، والرد على الاستفسارات، ومتابعة الضمان، وتحسين خدمتنا. لا
نبيع بياناتك لأي طرف ثالث.» · **«نستخدم ملف كوكيز واحدا لحفظ اختيارك
للمنطقة (مصر / الإمارات). بدون أي تتبع إعلاني.»** · «أي سؤال عن بياناتك؟
راسلنا من صفحة التواصل وسنرد عليك.»

### On branch `feat/phase-22-privacy-truth` (awaiting merge)

Seven sections per locale (collect · use · cookies · thirdParties ·
retention · rights · contact): full cookie table with measured lifetimes
(sk-region 1y, sk-attribution 30d, NEXT_LOCALE session, Google `_ga`/
`_ga_*` 13mo + `_gcl_au` 3mo, Meta `_fbp` 3mo, TikTok `_ttp`/
`_tt_enable_cookie`/`ttcsid` 13mo, plus the on-device request log);
Google, Meta and TikTok each named with what they receive; explicit
"analytics and advertising tracking runs" statement; TikTok hashed-phone
capture disclosed; retention; PDPL rights (Egypt 151/2020, UAE 45/2021).
Full text: `messages/{en,ar}.json` → `privacy` (committed in `da35a02`);
guarded by `scripts/check-privacy-claims.mjs`.

---

## UNKNOWN

1. Whether anything external (old integrations, saved clients) still
   POSTs to V2's `/api/contact`, `/api/business-contact`, `/api/lead` —
   they now 404. V2 source shows the handlers existed; their downstream
   destination (webhook/email service) was not investigated.
2. Platform-side toggle states — cannot be read from the site: TikTok
   Automatic Advanced Matching (observed ACTIVE on 2026-08-22 via a
   captured `EnrichAM` beacon; whether Ibrahim has since disabled it),
   Meta Automatic Advanced Matching, GA4 enhanced-measurement toggles.
3. When exactly supakoto.com DNS was cut over to V6, and whether the old
   V2 deployment is still reachable at any URL (its repo contains
   `.vercel/output`, so a stale `*.vercel.app` deployment may exist).
4. Whether `www.supakoto.com` and any other host variants redirect
   correctly (not probed).
5. Google Search Console state post-cutover (index coverage for the 9
   collision URLs where V2-English paths now serve Arabic) — external
   system, not inspectable from here.
