# Phase 14 — Services one-page consolidation

Ibrahim, 2026-08-14: "i dont think each service should have its own sub nav
i think they all should be under one page our services when opened show all
the services with text content and available images starting with cars ppf,
then heat isolation for building then boats then the rest of services."
Open questions answered with "use your judgment" — decisions below are the
locked list executed against.

## Locked decisions

1. **Order:** ppf → building-heat-isolation → marine-ppf → heat-isolation
   (cars) → colour-change → nano-ceramic → surface-protection. Each section
   carries `id=<serviceId>` so `/services#<id>` deep-links work.
2. **URLs:** the six detail pages (`ppf`, `heat-isolation`, `colour-change`,
   `nano-ceramic`, `marine-ppf`, `surface-protection`) 301 to
   `/services#<id>` in both locales. `/services/building-heat-isolation`
   **stays live** as the standalone SEO landing page (deliberate keyword
   entry point), linked from its section; its `/quote` funnel stays.
3. **Depth:** each section reuses existing i18n keys only — name, benefit,
   problem, solutionIntro, solutions bullets, spec table (collapsed in an
   Accordion) where a confirmed TAKAI product exists. Packages drop from
   marketing surfaces (booking flow owns tiers); FAQs stay on `/faq`.
   Marine + surface keep pending-product framing: no specs, no codes,
   WhatsApp CTA (SK-BLD rule unchanged).
4. **Warranty:** the qualified Premium Plus lifetime block moves with PPF
   into its `/services` section; CLAUDE.md allowed-surfaces list amended
   (`/services/ppf` → PPF section of `/services`).
5. **Nav:** header "Services" becomes a single leaf link, dropdown removed.

## Plan

- New `components/sections/services/ServiceShowcase.tsx` — the 7 sections,
  alternating tones/image sides, real images (building + surface sections
  also show their gallery project shots), per-service CTA:
  vehicle → /booking, building → quote funnel + SEO page link,
  marine/surface → PendingServiceCta (WhatsApp).
- Rewrite `/services` page: PageHero + anchor chip row + showcase + CtaBand.
- `ServicesGrid` (homepage) cards link to `/services#<id>`.
- Delete `[slug]` route, marine/surface static routes, and orphaned
  components (BeforeAfter, PendingServiceDetail, TakaiLineup).
- ROUTES (sitemap) trimmed; 12 permanent redirects added in next.config.
- New i18n key: `services.index.fullDetails` (en+ar) for the building
  section's link to its SEO page.

## Shipped

All five locked decisions landed, 2026-08-14:

- `ServiceShowcase.tsx` renders all 7 sections on `/services` in the locked
  order, each with `id=<serviceId>` anchors; alternating layout, real
  photography for building/marine/surface, per-service CTAs as planned.
- `/services` page rewritten: PageHero + anchor chips + showcase + CtaBand.
  `ServicesGrid` homepage cards now deep-link to `/services#<id>`.
- Deleted: `[slug]` route + its OG image, marine-ppf and surface-protection
  static routes, BeforeAfter, PendingServiceDetail, TakaiLineup.
- 12 permanent redirects in `next.config.ts` (six old detail slugs × two
  locales → `/services#<id>`); ROUTES/sitemap trimmed; header dropdown
  collapsed to a leaf link; `services.index.fullDetails` added in en+ar.
- Warranty rule holds: "lifetime" renders only in the PPF section — once in
  the Premium Plus card, once under the spec table's "lifetime*" row — the
  qualifier sharing the visual block at both sites. CLAUDE.md, warranty.ts,
  FeatureGrid, and TakaiComparison scrubbed of stale `/services/ppf` refs.

## Verified

- `pnpm build` green (42/42 static pages), `pnpm lint` 1 pre-existing
  warning (unused `t` in BranchGrid.tsx), no TS errors.
- Smoke: `/services` + `/en/services` 200 with all 7 anchors in both
  locales; `/services/ppf` et al. 308 → `/services#<id>`;
  `/services/building-heat-isolation` and its `/quote` funnel 200.
- Qualifier duplication scare resolved: raw HTML shows the phrase 4× but
  3 are RSC flight-payload serialization inside `<script>` tags — visible
  DOM has exactly 1 (Premium Plus card; the second site is inside the
  collapsed specs accordion). Homepage visible DOM: 0 "lifetime" mentions
  (the 8 raw hits are the serialized next-intl message bundle).

## Left

- Marine PPF + surface protection stay pending-product (no TAKAI
  confirmation yet) — SK-BLD rule unchanged.
- Combined smoke pass with the earlier merged branches still owed before
  any push (see V6 build status memory).
