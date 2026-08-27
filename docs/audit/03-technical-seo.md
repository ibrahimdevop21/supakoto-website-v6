# 03 — Technical SEO

Read-only audit of https://supakoto.com, 2026-08-25. Sources: `docs/audit/data/nojs/*.html`
(JS-disabled capture of the 44 sitemap URLs + 2 noindex service pages + `/dev/kitchen-sink`),
live `curl` against production (Googlebot UA), and the repo at `feat/phase-23-forms-destination`.
No source was changed; the only write is this file.

## Score: 6/10

**Passes (measured):** self-canonical on 46/46 real pages, absolute https, no trailing-slash
mismatch; reciprocal `ar`/`en`/`x-default` hreflang in `<head>`, in the `Link:` header and in the
sitemap for all 44 URLs; `x-default` → Arabic root everywhere; `<html lang dir>` correct on all 47
pages; http→https and www→apex 308; trailing slash 308 to no-slash; unknown paths return a real 404
status; robots.txt references the sitemap; titles/descriptions unique on all 44 URLs and in the
right language; OG + Twitter tags present and locale-correct; every page has exactly one H1
(except the dev page); zero images without an `alt` attribute; no "lifetime" wording in any
title, description or JSON-LD block; V2 `/ar/*` and renamed EN paths 308 correctly.

**Fails (measured):** FAQ answers are not in the HTML at all on 14 pages that emit `FAQPage`
schema; self-serving `Review` markup on `Organization` on 12 pages; ~1,400 words of testimonial
text duplicated on 6 pages (65–93% sentence overlap between service pages); 13 of 44 sitemap URLs
have <130 words of real body copy; every EN page links to a redirecting `/ar/*` URL (307);
noindex pages linked from home and `/services`; `/dev/kitchen-sink` indexable; sitemap `lastmod`
is the build timestamp for all 44 URLs; footer carries no service links; 242 gallery images with
`alt=""`; `AutomotiveBusiness` nodes missing hours/locality/parent `@id`; H1→H3 skips on
`/services` and `/business`; unbranded default Next 404 page.

## Findings table

| # | Impact | Effort (h) | Finding | Evidence |
|---|---|---|---|---|
| 1 | H | 2 | FAQ answers exist only in React state; `FAQPage` JSON-LD names 15/6/4–6 Q&As whose answers are absent from the DOM until clicked. Schema/content mismatch on 14 pages (`/faq`, `/authentic`, 5 service pages × 2 locales). | `docs/audit/data/nojs/faq.html` `<main>` = 90 words, only questions; `components/ui/Accordion.tsx` renders the panel inside `AnimatePresence` only when `open`. |
| 2 | H | 3 | `Review` nodes (29 reviews) on `Organization` on the site's own pages = self-serving reviews; Google's review-snippet policy excludes them and the block is 12 × ~9 KB of duplicated markup. No `aggregateRating` either, so no rich-result upside at all. | `components/sections/Testimonials.tsx:46-60`; home, `/about`, 4 car-service pages, both locales. |
| 3 | H | 4 | Testimonials carousel injects ~1,400 words of identical review text into home, `/about` and 4 service pages. Service pages are 65–93% identical sentence-for-sentence; unique copy is 200–600 words. | Jaccard on ≥6-word sentences: `colour-change` ~ `nano-ceramic` 93%, `heat-isolation` ~ `nano-ceramic` 87%, `ppf` ~ home 65%. |
| 4 | H | 2 | Every EN page's locale switcher links to `/ar/<path>`, which 307s (not 308) to the un-prefixed URL. 22 redirecting internal links, most temporary. | `en__about.html` → `href="/ar/about"`; live: `/ar/authentic [307] → /authentic`; `/ar/about [308]` only because `next.config.ts` lists it. |
| 5 | H | 1 | `/services` (hub for all commercial pages) has 75 words of body copy; `/booking` 75, `/branches` 129, `/business` 86, `/contact` 75, `/careers` 66, `/gallery` 31, `/warranty/claim` 48, `/terms` 105, building `/quote` 126. | main-only word counts, header/footer/scripts stripped. |
| 6 | M | 1 | Footer links only `/authentic`, `/privacy`, `/terms`. Nav has a single `/services` link. Service pages get 4–6 inbound sources vs 23–25 for nav pages; `/services/building-heat-isolation/quote` has 1 (AR) / 2 (EN). | `components/chrome/Footer.tsx:90-107`, `lib/nav.ts` (comment says dropdown "died with the detail pages" — but the pages came back in Phase 17). |
| 7 | M | 1 | noindex `marine-ppf` / `surface-protection` are linked from home, `/services` and each other (3 inbound each) and carry full hreflang pairs. `noindex, follow` + links = equity leak, and hreflang on noindex pages is contradictory. | `root.html`, `services.html` → `href="/services/marine-ppf"`; `<meta name="robots" content="noindex, follow">` + `<link rel="alternate" hreflang=…>` on both. |
| 8 | M | 0.5 | `/dev/kitchen-sink` and `/en/dev/kitchen-sink` are 200, no `noindex`, no canonical, two H1s, blocked only by `Disallow:` (Google may still index the URL from links). | live 200; `dev__kitchen-sink.html` `robots=None canon=None H1x2`. |
| 9 | M | 0.5 | Sitemap `lastmod` is `new Date()` at build → every deploy stamps all 44 URLs with the same timestamp. Google discounts untrustworthy lastmod. | `app/sitemap.ts:14`; live sitemap: all `<lastmod>2026-08-22T13:09:15.202Z`. |
| 10 | M | 2 | Gallery: 242 of 243 images have `alt=""`; page has 31 words. Alt strings exist in both message files (243 each) but only reach the current stage image. | `gallery.html` imgs=255 empty=243; `GalleryViewer.tsx:240,274` `alt=""`, `:262` `aria-label` on the button. |
| 11 | M | 2 | `AutomotiveBusiness` ×6: no `openingHoursSpecification`, `address` lacks `addressLocality`/`addressRegion`, `parentOrganization` is a bare name (not `@id: …/#organization`), no `sameAs`/`image`, `telephone` has spaces (not strict E.164), `url` is the shared `/branches`. | `branches.html` JSON-LD; `app/[locale]/branches/page.tsx:43-57`. |
| 12 | M | 1 | Home emits two `Organization` blocks with the same `@id` (core + reviews); `/authentic` emits a third `Organization` with no `@id`; `Service.provider` is a fresh `Organization` object instead of a `#organization` reference. No `WebSite` node anywhere. | `root.html` 2 blocks; `authentic.html` block 2; `[slug]/page.tsx:82`. |
| 13 | M | 0.5 | Heading skips: `/services` and `/business` go H1 → H3 (no H2) in both locales. | `services.html`: `h1 … > h3 أفلام حماية الطلاء`; `business.html`: `h1 > h3 الأساطيل`. |
| 14 | L | 0.5 | 9 titles exceed 60 chars (max 64: `/en/services`, `/en/authentic`, `/booking`); 8 descriptions exceed 165 (`/en/privacy` 203, `/privacy` 185, `/gallery` 171). Truncation risk in SERP. | table in §2. |
| 15 | L | 1 | Unknown URLs return the bare Next.js 404 (`<title>404: This page could not be found.`, `<html>` without `lang`/`dir`, no nav) — the localized `not-found.tsx` is never reached because there is no `[locale]/[...rest]` catch-all. | live `/does-not-exist`, `/en/does-not-exist`. |
| 16 | L | 0.5 | `http://www.supakoto.com/en` → `https://www…` → `https://supakoto.com/en`: 2 hops. `/ar/` → `/ar` → `/`: 2 hops. | live curl chains. |
| 17 | L | 0.5 | Case variants serve 200 (`/Services` = full page with canonical → `/services`). Not harmful thanks to canonical; note only. | live `/Services` 200. |
| 18 | L | 0.5 | Payment-method logos carry English brand alts on Arabic pages (9 per page). Brand names — acceptable, but inconsistent with the "alt language matches locale" rule. | every AR page `wrongLang=9`. |
| 19 | L | 2 | The entire messages bundle (incl. FAQ answers, all 243 gallery alts) is shipped in every page's RSC payload: `/terms` is 131 KB HTML, 92 KB of it script; home is 321 KB. Crawl-budget/render cost, not a ranking factor. | `_index.json` htmlBytes; `NextIntlClientProvider` without a `messages` subset in `app/[locale]/layout.tsx`. |

## 1. Crawl

Method: extracted every internal `<a href>` from the 47 nojs pages (71 unique internal URLs),
then GET each on production with a Googlebot UA, following redirects.

- **404s:** none among linked URLs. Forms endpoint `/api/forms` GET → 404 (fine, POST-only).
- **Redirect chains >1 hop:** `http://www.supakoto.com/en` (2 hops, http→https on www, then
  www→apex); `/ar/` (2 hops: slash strip then locale strip). Neither is linked internally.
- **3xx with wrong locale:** none. But **22 internal links redirect**: each EN page's locale
  switcher emits `/ar/<path>`. `next-intl` with `localePrefix: "as-needed"` always prefixes a link
  to the default locale from a non-default page, then the middleware 307s it. Only the 12 paths
  hard-coded in `next.config.ts` get a 308; `/ar/authentic`, `/ar/booking`, `/ar/branches`,
  `/ar/careers`, `/ar/franchise`, `/ar/warranty`, `/ar/warranty/claim`, all `/ar/services/*` get a
  **307**. Fix at the switcher (compute the AR href without prefix) — not by adding more redirects.
- **Links to non-canonical forms:** none (no `?`, `#`, trailing-slash or mixed-case hrefs found).
  `/booking?service=` variants are **not** linked anywhere in SSR HTML; the wizard sets the
  service client-side. Nothing to canonicalize.
- **Orphans (in sitemap, zero inbound):** none.
- **<3 inbound sources:** `/services/building-heat-isolation/quote` (1: its parent page),
  `/en/services/building-heat-isolation/quote` (2). Everything else ≥4. Service pages sit at 4–6
  sources (home, `/services`, 2–3 related-service blocks, `/business` for building) versus 23–25
  for every nav/footer page — see §4.
- **noindex pages:** `/services/marine-ppf` and `/services/surface-protection` are linked from
  home (services grid), `/services`, and from each other's "related services"; the EN versions
  from `/en`, `/en/services` and cross-links. 3 inbound sources each, both locales.
- **Dev page:** `/dev/kitchen-sink` links only to `/en/dev/kitchen-sink` (switcher). Not linked
  from any production page.

## 2. Titles and meta descriptions

All 44 titles unique; all 44 descriptions unique; locale of both matches `<html lang>` on every
page; primary keyword present in all titles (PPF / حماية / heat isolation / etc.). Length flags:

| URL | Title (chars) | Desc (chars) | Flag |
|---|---|---|---|
| `/` | 59 | 162 | ok |
| `/en` | 63 | 159 | title >60 |
| `/about` | 49 | 161 | ok |
| `/en/about` | 60 | 165 | desc borderline |
| `/authentic` | 59 | 158 | ok |
| `/en/authentic` | 64 | 165 | title >60 |
| `/faq` | 57 | 157 | ok |
| `/en/faq` | 57 | 164 | ok |
| `/gallery` | 52 | 171 | desc >165 |
| `/en/gallery` | 59 | 156 | ok |
| `/booking` | 64 | 137 | title >60 |
| `/en/booking` | 61 | 138 | title >60 |
| `/warranty` | 54 | 151 | ok |
| `/en/warranty` | 59 | 162 | ok |
| `/warranty/claim` | 38 | 154 | ok |
| `/en/warranty/claim` | 48 | 156 | ok |
| `/franchise` | 56 | 146 | ok |
| `/en/franchise` | 60 | 165 | ok |
| `/business` | 58 | 157 | ok |
| `/en/business` | 63 | 158 | title >60 |
| `/branches` | 56 | 158 | ok |
| `/en/branches` | 63 | 161 | title >60 |
| `/contact` | 51 | 157 | ok |
| `/en/contact` | 48 | 165 | ok |
| `/careers` | 31 | 153 | title short (no keyword beyond brand) |
| `/en/careers` | 28 | 147 | title short |
| `/services` | 61 | 157 | title >60 |
| `/en/services` | 64 | 163 | title >60 |
| `/services/ppf` | 56 | 162 | ok |
| `/en/services/ppf` | 59 | 161 | ok |
| `/services/heat-isolation` | 50 | 157 | ok |
| `/en/services/heat-isolation` | 57 | 158 | ok |
| `/services/colour-change` | 57 | 149 | ok |
| `/en/services/colour-change` | 60 | 163 | ok |
| `/services/nano-ceramic` | 54 | 151 | ok |
| `/en/services/nano-ceramic` | 61 | 158 | title >60 |
| `/services/building-heat-isolation` | 57 | 159 | ok |
| `/en/services/building-heat-isolation` | 55 | 155 | ok |
| `…/building-heat-isolation/quote` | 50 | 147 | ok |
| `/en/…/building-heat-isolation/quote` | 56 | 155 | ok |
| `/privacy` | 25 | 185 | desc >165 |
| `/en/privacy` | 25 | 203 | desc >165 |
| `/terms` | 26 | 151 | ok |
| `/en/terms` | 29 | 154 | ok |

Arabic titles at 59–64 chars are usually narrower in pixels than Latin, so the AR overruns are
low risk; the EN ones (`/en`, `/en/authentic`, `/en/services`, `/en/branches`, `/en/business`)
will truncate at "| SupaKoto". Noindex pages: descriptions are 84/108 chars and literally say
"product line pending confirmation" — fine while noindex, must be rewritten before indexing.

## 3. Heading hierarchy

Exactly one H1 on 46/46 real pages. Violations:

- `/services`, `/en/services`: H1 → H3 (`أفلام حماية الطلاء` / `Paint Protection Film`) — the
  service grid cards are H3 with no H2 above them.
- `/business`, `/en/business`: H1 → H3 (`الأساطيل` / `Fleets`).
- `/dev/kitchen-sink`: two H1s (`مطبخ المكونات`, `عنوان من الدرجة الأولى`) — dev page, moot if #8 fixed.
- Footer injects `H2 تواصل معنا` and `H2 طرق الدفع` on every page, so `/gallery`, `/booking`,
  `/warranty/claim`, both `/quote` pages have an H1 and no body H2 at all — the only H2s are
  footer chrome. Not a violation, but it means those pages have no topical heading structure.
- Marine/surface: `h2 الحل > h3 المواصفات` is fine structurally but the H3 is a labelled TODO.

## 4. Internal linking equity

- **Footer:** `/authentic`, `/privacy`, `/terms`, socials, phone/WhatsApp/email. No services, no
  `/booking`, no `/branches`, no `/faq`, no `/warranty`. Every one of those is a top commercial or
  trust page.
- **Nav (`lib/nav.ts`):** `/services` is a single leaf; the comment says the per-service dropdown
  "died with the detail pages" — Phase 17 brought the pages back but the nav was not updated.
  `/booking` and `/branches` are in the nav (good).
- **Inbound sources:** `/services/ppf` 6, `/services/nano-ceramic` 5, `/services/heat-isolation`
  4, `/services/colour-change` 4, `/services/building-heat-isolation` 5, `/booking` 25,
  `/branches` 25. So the four car-service pages — the pages that should rank — are the
  least-linked indexable pages on the site after the quote form.
- **Contextual body linking:** service pages link to `/booking`, 2–3 related services, and
  (PPF only) `/authentic`. **None** link to `/warranty`, `/faq`, `/gallery` or `/branches`.
  `/faq` body links: none in the DOM (the `e.link` anchors live inside collapsed answers).
  `/warranty` → `/warranty/claim` only. `/gallery`, `/branches`, `/booking` → nothing. The
  gallery's per-category filter is not a link, so no gallery→service link exists either.
- Net: trust pages and commercial pages are two islands joined only through the header.

## 5. Image alt

- Attribute missing: 0 on all pages. Empty `alt=""`: home 4 (branch photo `tagamoa.webp` and 3
  gallery photos in the hero carousel), `/about` 1 (`flag-japan.webp`, decorative — fine),
  `/gallery` 243.
- Alt language matches locale on all content images; the 9 mismatches per AR page are payment
  logos (`Visa`, `Mastercard`, `valU`, `Banque Misr`, `CIB`, `National Bank of Egypt`…) —
  Latin brand names, acceptable.
- **Gallery (`content/gallery.ts` + `messages/*.json` `gallery.items.*.alt`):** 243 alts in
  both `en` and `ar`, bilingual, specific and well written (e.g. "White electric SUV after
  protection film installation outside the SupaKoto workshop"). But `GalleryViewer.tsx` puts
  `alt=""` on every thumbnail and on the preload image, and the alt on a `<button aria-label>`
  is not image alt. So 242 good alt strings never reach an `<img>`. The gallery page is the
  site's largest image asset and has ~zero Google Images footprint.
- Hero carousel on home: 3 gallery photos with `alt=""` — those are content, not decoration.

## 6. Canonicals

Every real route: `<link rel="canonical">` absolute, https, apex, no trailing slash, equals the
served URL (AR at root, EN under `/en`). Noindex pages self-canonicalize (correct). Case-variant
`/Services` serves 200 with canonical → `/services` (harmless). `/dev/kitchen-sink`: no canonical.
`lib/metadata.ts` is the single source and it is right.

## 7. hreflang

All 44 sitemap URLs: `ar`, `en`, `x-default` in `<head>`, in the HTTP `Link:` header, and in the
sitemap (`xhtml:link`, 132 entries = 44 × 3). Reciprocal in both directions on every pair.
`x-default` → Arabic URL everywhere. Codes valid. Nothing missing.

Two issues: (a) the noindex pages also emit the full triplet and their EN twins exist and are
noindex — hreflang sets should not include noindex URLs; (b) `og:locale` is `ar_EG` for Arabic
while the site targets EG and AE equally — cosmetic.

## 8. JSON-LD

Per page (both locales identical in structure):

- `/`: `Organization#organization` (name, url, logo, description, email, sameAs ×5,
  foundingDate, areaServed EG/AE, `brand: TAKAI → manufacturer: Nippon Takai…Tokyo`,
  mainEntityOfPage → `/authentic`) **plus a second** `Organization` with the same `@id` carrying
  29 `Review` nodes.
- `/about`, 4 car-service pages: the 29-review `Organization` only.
- `/authentic`: `FAQPage` (6) + a **third** `Organization` variant (no `@id`).
- `/faq`: `FAQPage` (15). Service pages: `Service` + `BreadcrumbList` + `FAQPage` (4–6).
  Building: `Service` + `BreadcrumbList` + `FAQPage`. `/warranty/claim`, `/quote`: `BreadcrumbList`.
- `/services`: `ItemList` of 7 (includes the two noindex URLs).
- `/branches`: 6 × `AutomotiveBusiness`.
- Absent everywhere: `WebSite`. `/booking`, `/warranty`, `/gallery`, `/contact`, `/franchise`,
  `/business`, `/careers`, `/privacy`, `/terms`: no schema (acceptable).

Checks:

- **Required fields:** `AutomotiveBusiness` has name, address(streetAddress + country only),
  telephone (`+20 10 12747478` — spaces; E.164 is `+201012747478`), url (shared `/branches`, not a
  per-branch URL), geo. Missing: `openingHoursSpecification` (content/branches.ts has `hours`
  typed but unconfirmed), `addressLocality`, `image`, `priceRange`, `sameAs` (Google Maps
  listing URL), and `parentOrganization` should be `{"@id": "https://supakoto.com/#organization"}`.
- **Duplicated `@id`:** `#organization` appears 14 times across pages (fine — same entity) but
  twice on the same page (home) as two separate blocks, and once more without `@id` on
  `/authentic`. Merge into one `@graph` or reference by `@id`.
- **Mismatch with visible content:** every `FAQPage` — answers are not in the DOM (see #1).
  Google's guideline is that the FAQ content be visible on the page; collapsed-but-present is
  fine, absent is not. Since Aug 2023 FAQ rich results are limited to government/health sites
  anyway, so the markup carries risk and no reward: remove it, or render the answers server-side.
- **Self-serving reviews:** `Review` on `Organization` on the entity's own site violates the
  review-snippet content guidelines ("self-serving reviews aren't allowed for LocalBusiness and
  Organization"). The code comment in `Testimonials.tsx` correctly avoided `aggregateRating` but
  kept the `Review` nodes, which are the same class of problem. Remove the JSON-LD, keep the
  visible cards.
- **Organization ↔ TAKAI:** expressed as `brand: {Brand TAKAI, manufacturer: Nippon Takai…}` on
  Organization and `brand: TAKAI` on each Service/AutomotiveBusiness. That is a defensible
  model for "authorized distributor". Nothing says *exclusive* in schema (no property exists);
  fine.
- **Lifetime leakage:** none in any title, description, `og:*` or JSON-LD `description`. The
  7–8 raw string hits on every page are inside the embedded messages payload (see #19), not in
  rendered content or metadata — that payload does include the Premium Plus strings on every
  page, but Google reads rendered DOM, not RSC JSON.

## 9. Thin content

Body words after stripping header/footer/scripts (index `textWords` includes ~58 words of
chrome): `/gallery` 31, `/warranty/claim` 48, `/careers` 66, `/services` 75, `/booking` 75,
`/contact` 75, `/business` 86, `/faq` 90 (questions only), `/terms` 105, `/quote` 126,
`/branches` 129, `/franchise` 158, `/services/building-heat-isolation` 259 (EN 316),
`/warranty` 292 (EN 338), marine 84, surface 87. Form pages being thin is expected; `/services`,
`/faq`, `/branches` and `/gallery` are the ones that matter — they are hubs with nothing on them.

## 10. Near-duplicate content across service pages

Sentence-level (≥6 words) overlap: 94 sentences (~1,395 words) are identical across all four
car-service pages, home and `/about` — the full text of 29 testimonials rendered inline by
`<Testimonials>`. Unique copy: PPF ~611 words, heat-isolation ~267, colour-change ~206,
nano-ceramic ~209, building ~240, marine/surface ~70 each. Pairwise: colour-change ~
nano-ceramic 93% shared, heat-isolation ~ nano-ceramic 87%, heat-isolation ~ colour-change 85%,
ppf ~ others 67–69%. Section skeleton is identical (Problem → Solution → Specs → Packages →
FAQ → Related → Testimonials → CTA), which is fine; the boilerplate ratio is not.

Query competition: `heat-isolation` (car) vs `building-heat-isolation` share "عزل حراري" /
"heat isolation" as head term; titles disambiguate (للسيارات / للمباني) and the building page
targets "facade / window film". Low risk. `nano-ceramic` vs `ppf`: nano-ceramic's specs say
"over PPF" and PPF's related block promotes nano — they reinforce, not compete. `colour-change`
uses "تغليف/wrap" — distinct. Real competition risk is home vs `/services/ppf`: home title is
"حماية طلاء السيارات PPF — تاكاي في مصر والإمارات" and PPF is "أفلام حماية الطلاء PPF تاكاي في
مصر والإمارات" — near-identical intent. Home should own the brand/"TAKAI Egypt UAE" query;
PPF should own the product query.

## 11. noindex decision: marine-ppf, surface-protection

Content: 84/87 body words, no specs (labelled TODOs), no packages, no FAQ, description says
"product line pending confirmation". Keeping them **noindex is right** — indexing would expose a
placeholder page under the brand. But the current state leaks: they are linked from the home
grid, the `/services` grid, the `ItemList` schema, and the related-services block of building
(`RELATED_SERVICES["building-heat-isolation"]` includes `surface-protection`), so ~3 inbound
sources per locale feed PageRank into pages that return nothing. Recommendation: while noindex,
(a) keep them out of `RELATED_SERVICES` and the `ItemList`, (b) render the grid cards as
non-links or `rel="nofollow"` with a "coming soon" label, (c) drop hreflang alternates for them
(`pageMetadata` could skip `alternates.languages` when `noindex`). When TAKAI confirms a product,
delete the ids from `NOINDEX_SERVICE_IDS` (the mechanism is well built) and restore the links.

## 12. Misc

- `/dev/kitchen-sink`: 200 in both locales, no `noindex`, no canonical, indexable via any
  external link despite `Disallow:`. Add `robots: noindex` in its metadata, or gate the route on
  `NODE_ENV !== "production"`. Disallow alone is the wrong tool for "never index".
- robots.txt: `Allow: /`, `Disallow: /dev/`, `/en/dev/`, sitemap line. Correct.
- 404: real 404 status for unknown paths in both locales, but the page is Next's default
  (`<html>` with no `lang`/`dir`, title "404: This page could not be found."). The localized
  `app/[locale]/not-found.tsx` only fires for `notFound()` calls; add `app/[locale]/[...rest]/page.tsx`
  calling `notFound()` so the branded page renders.
- www→apex 308; http→https 308; both correct, one 2-hop chain on `http://www`.
- Trailing slash: 308 to no-slash consistently. Sitemap/canonicals/hreflang all no-slash. Consistent.
- OG/Twitter: `og:title`, `og:description`, `og:url`, `og:image`, `og:locale`
  (`ar_EG`/`en_US`), `og:locale:alternate`, `twitter:card` on all pages. `/authentic` uses
  `summary` while the rest use `summary_large_image` — inconsistent, not wrong.
- `<html lang="ar" dir="rtl">` / `lang="en" dir="ltr">` on all 47 captured pages.
- `Link:` header duplicates hreflang — harmless.

## Sitemap/discovery blockers found in the codebase

For the manual GSC fix. What the code does and does not do:

- **Sitemap referenced in robots:** yes (`app/robots.ts`). **Location:** `/sitemap.xml`, 44 URLs,
  one entry per locale, `xhtml:link` alternates with `x-default`. Structure is correct.
- **lastmod:** present but fake — `new Date()` at build for every URL. Google will learn to
  ignore it. Use a per-route constant or git-derived date, or omit it.
- **Legacy sitemaps:** `content.php?sitemap-23.xml` and `comment.php?sitemap-32.xml` → 404 (not
  410). Both should be deleted from GSC; a 404 is acceptable for Google to drop them, a 410 is
  faster. No code change needed unless you want `410` via a redirect/rewrite.
- **`*.php`, `/index.php`, `wp-login.php`:** 404. No catch-all for PHP paths; fine.
- **V2 `/ar/*`:** 12 explicit 308s in `next.config.ts`; every other `/ar/*` path is rescued by
  the next-intl middleware with a 307. If any V2 `/ar/<page>` not in the list was indexed, it
  now 307s — functional, but temporary. Consider a single `/ar/:path*` → `/:path*` 308 rule.
- **V2 EN root collisions** (`/services`, `/about`, `/gallery`, `/faq`, `/contact`, `/business`,
  `/privacy`, `/terms`) now serve Arabic. Documented and accepted in `docs/REDIRECTS.md`. GSC
  will show these as "language mismatch"-style soft signals for old EN backlinks; hreflang covers
  it going forward.
- **Nothing else in code hinders discovery** — the sitemap was simply never submitted.

## What is already good (do not touch)

- `lib/metadata.ts` + `lib/site.ts`: one function drives canonical, hreflang, OG for every route;
  sitemap derives from the same `ROUTES`. Zero drift found between head, header, and sitemap.
- `NOINDEX_SERVICE_IDS` as the single switch for noindex + sitemap exclusion.
- Locale/dir on `<html>`, Arabic at root, no Accept-Language redirect (`localeDetection: false`)
  — stable canonicals.
- Redirect map (`docs/REDIRECTS.md` ↔ `next.config.ts`) is honest about collisions.
- Titles and descriptions: hand-written, unique, keyworded, warranty wording tier-scoped,
  no "lifetime" in metadata anywhere.
- Organization schema with `brand → manufacturer` chain and real `sameAs` handles.
- `BreadcrumbList` on nested routes with localized names.
- 100% of images have an `alt` attribute; gallery alt copy in both languages is genuinely good.
- 404 status codes are real, no soft-404s.

## Open questions for the owner

1. Are per-branch opening hours confirmed yet (`content/branches.ts` `hours`)? Without them
   `AutomotiveBusiness` cannot carry `openingHoursSpecification`, which is the field local packs
   use most.
2. Do the branches have Google Business Profile URLs to put in `sameAs`? That is the strongest
   entity link for local SEO and was not in the codebase.
3. Is the testimonials block required on every service page for conversion? If yes, the SEO fix
   is to render it lazily (client-only after interaction) so the review text is not in the
   crawlable HTML of six pages; if no, keep it on home and `/about` only.
4. Do you want the FAQ answers indexable? If yes, the Accordion must render the panel in the DOM
   (hidden, not conditional). If no, drop the `FAQPage` blocks — they currently claim content the
   page does not have.
5. Should `/en/services/marine-ppf` and `/en/services/surface-protection` exist at all before
   TAKAI confirmation, or should the pages 404 in production until then?
6. `/careers` titles ("التوظيف — اعمل معنا في سوباكوتو", "Careers — Work with SupaKoto") carry no
   location or role keyword — intentional?
