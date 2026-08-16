# Phase 17 — Technical SEO round, pre-cutover (2026-08-16)

Status: EXECUTING autonomously (Ibrahim: no gates, commit per item, one report).

═══ BRIEF technical-seo ═══
READ FIRST: STRUCTURE-SPEC (`/services`, Claim discipline, `/authentic`), lib/site.ts,
lib/metadata.ts, next.config.ts redirects, scripts/check-claims.mjs, scripts/smoke.mjs.
SCOPE: (1) split /services into seven detail pages + index; (2) keyword titles/metas
+ H1s; (3) sitemap/robots/hreflang/JSON-LD audit incl. BreadcrumbList, Organization on
home, LocalBusiness phones; (4) footer "#" links, canonical/OG cutover readiness,
CUTOVER.md, full crawl.
NOT IN SCOPE: new facts/claims; marine/surface product content; pushing (Ibrahim's word).
LOCKED DECISIONS:
1. Detail template = the approved Phase-14 section body (image + extras, problem/
   solution, spec, Premium Plus card, CTAs) + FAQ + packages + related services +
   Service/BreadcrumbList JSON-LD. Building keeps its own page/template.
2. Marine + surface pages exist but `robots: noindex, follow` and are excluded from the
   sitemap via a single `NOINDEX_SERVICE_IDS` set in content/services.ts (one-line flip).
3. Phase-14 `/services/<slug> → /services#<slug>` redirects are REMOVED (they would
   redirect the new pages away). No anchor-form internal link remains anywhere.
4. Titles: primary keyword first, brand last, 50–60 chars target; metas 150–160;
   unique per route; H1s keep the white-Arabic voice, contain the primary keyword,
   never car-only on multi-substrate pages. Home H1 (hero slide 1) rewritten.
5. Canonical/OG base = `NEXT_PUBLIC_SITE_URL` (single env var; default supakoto.com).
   Cutover = env change + DNS, documented in docs/progress/CUTOVER.md.
6. Footer social icons with no URL are removed (not "#"); missing URLs logged.
SMOKE: every route × 2 locales 200 + dir; no anchor links; sitemap = routes − noindex;
JSON-LD parses with required fields; crawl: no 404 / chains / orphans; guards green.

## Execution log

### Item 1 — /services split into seven pages
- New `app/[locale]/services/[slug]/page.tsx` (+ `opengraph-image.tsx`) for ppf,
  heat-isolation, colour-change, nano-ceramic, marine-ppf, surface-protection;
  building keeps its static route. Body = `components/sections/services/
  ServiceDetailBody.tsx` (the approved Phase-14 section content + packages + FAQ +
  related services). `ServiceShowcase.tsx` deleted; `/services` = index with the
  shared wrapping grid; cards link to `servicePath(s)`.
- `content/services.ts`: `NOINDEX_SERVICE_IDS` (marine, surface — one-line flip,
  TODO left), `RELATED_SERVICES`, `servicePath()`. `lib/metadata.ts`: `noindex`
  option → `robots: index=false, follow=true`. `lib/site.ts`: `ROUTES` now derived
  (`SERVICE_ROUTES` minus noindex) — sitemap never hand-maintained.
- Internal links: home services rail → detail pages; TAKAI table CTA → /services/ppf;
  each detail page → 2–3 related + /booking or the quote funnel; PPF page → /authentic;
  zero `/services#` links remain (smoke asserts). Phase-14 anchor redirects removed
  from next.config.ts (REDIRECTS.md updated).

### Item 2 — titles, meta descriptions, H1s
- Every route now uses `seoTitle` / `seoDescription` (home: `home.seoTitle` /
  `home.metaDescription`); Arabic primary keyword first, brand last; unique per route
  (smoke asserts uniqueness + length ≥ 30). AR titles 49–65 chars on the keyword
  pages (legal pages shorter by nature); AR descriptions 146–165; EN trimmed ≤ 165.
- H1s: home hero slide 1 → «أفلام تاكاي اليابانية: حماية طلاء السيارات وعزل حراري
  للمباني» (no longer car-only); services index «خدمات حماية السيارات والمباني
  والقوارب»; each detail page has its own `h1` key; warranty «ضمان حماية السيارات —
  مكتوب، لا كلام»; branches «فروع سوباكوتو في مصر والإمارات».
- No "lifetime" in any metadata (guard scope unchanged); no superlatives; no
  competitor names.

### Item 3 — sitemap, robots, schema
- `app/sitemap.ts` = `ROUTES` (derived) × hreflang `ar` / `en` / `x-default`; noindex
  services excluded; 22 AR entries each declaring both locales. `robots.ts` unchanged
  (allows all but `/dev/`); nothing important blocked.
- hreflang on every page: `ar`, `en`, `x-default` (→ ar) + canonical, both directions
  (each locale's page lists the other) — smoke asserts.
- JSON-LD (audited by `scripts/jsonld-audit.mjs`, all 44 pages parse, required fields
  present): Service + BreadcrumbList (+ FAQPage where FAQs exist) on all seven service
  pages; AutomotiveBusiness ×6 on /branches now with `telephone` = new numbers, `geo`,
  `url`, `parentOrganization`, `brand`; FAQPage on /faq, /authentic and service pages;
  Organization on `/` (+ /authentic); BreadcrumbList on /services/*, the quote funnel
  and /warranty/claim; ItemList on /services.

### Item 4 — broken links and cutover readiness
- Footer: social icons whose URL is a placeholder are no longer rendered (Instagram +
  Facebook remain); TikTok / YouTube / LinkedIn URLs logged in ASSETS-NEEDED — adding
  the URL in `lib/nav.ts` makes the icon appear.
- Canonical/OG/hreflang/JSON-LD/sitemap/robots all derive from one env var
  (`NEXT_PUBLIC_SITE_URL`, default `https://supakoto.com`) — cutover is DNS + (optional)
  env, no code. Documented step by step in `docs/progress/CUTOVER.md`, incl. why the
  vercel.app preview is deliberately non-indexable today and why og:image previews look
  broken until the domain moves (they resolve via `/opengraph-image` on the new origin).
- **Crawl** (`scripts/crawl.mjs`): 72 URLs, no 404, no redirect chains, no orphans.
  The first crawl found five orphans (/about, /faq, /gallery, /contact, /careers) —
  root cause: the header dropdown children were conditionally rendered, so no
  server-rendered link existed anywhere. Fixed in `Header.tsx`: submenu always in the
  DOM, visibility animated, `inert` + `tabIndex=-1` when closed (hover/click still
  open/close, tab order verified).
- Smoke extended: 7 service pages × 2 locales (200, Service+Breadcrumb JSON-LD, robots
  index/noindex as intended, no anchor links), sitemap composition, unique keyword
  titles, canonical + hreflang, no `/services#` anywhere → **195/195**.
- Ops note: `pkill -x next-server` does NOT match the process (`next-server (v15…)`);
  use `pkill -f "^next-server"`. A stale server serving cached prerenders cost one
  false negative during this round.
