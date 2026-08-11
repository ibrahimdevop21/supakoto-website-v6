# Phase 13 — Services restructure: 7 services, 4 substrates

Branch: `feat/services-restructure` (off merged `main` = buildings +
home-first-screen, merge commits `fe0c582…794d0a5`).

Spec approved 2026-08-11 (STRUCTURE-SPEC updated first, commit
`4d34703`, refined during merge resolution). Ibrahim's answers:
merge-first sequencing (no pre-restructure smoke — ONE combined pass
at the end), grid = homepage section AND `/services` index (same
behaviour), heading approved, slug `surface-protection` (not
interior-).

## Plan

1. **Catalogue** — `content/services.ts`: delete polishing; extend
   `Substrate` with `"marine" | "interior"`; add `marine-ppf` +
   `surface-protection` (no specKeys, no packageKeys, no FAQ — no
   confirmed TAKAI product exists; SK-BLD guard).
2. **Routing** — `lib/site.ts` ROUTES (drop polishing, add two);
   `lib/nav.ts` dropdown (same); 301 `/services/polishing →
   /services` in next.config + REDIRECTS.md.
3. **i18n** — remove `services.items.polishing.*` +
   `nav.servicesPolishing`; add nav keys + full MSA/EN copy for the
   two new services (general problem/solution only, every spec slot a
   labelled TODO «بانتظار تأكيد المنتج من تاكاي»); new home services
   heading «كل ما يستحق الحماية، نحميه» / "Everything worth
   protecting".
4. **Components** — `ServicesGrid` replaces the home snap-rail
   (1/2/3/4 wrapping columns: base/sm/lg/2xl, equal heights, no
   horizontal overflow) and replaces the index's alternating rows;
   dual-destination heat-isolation card retired; non-vehicle cards
   visually distinct (red-border treatment + substrate line).
5. **New pages** — `/services/marine-ppf` + `/services/surface-
   protection`: shared PendingServiceDetail (hero, general
   problem/solution, TODO spec block, wa.me quote CTA), per-route OG
   images. Labelled placeholder card images.
6. **Cleanup** — gallery: polishing category removed, its 2 images
   re-tagged; BookingWizard already filters `vehicleServices` (verify
   = 4 after removal); JsonLd untouched (per-page, polishing page
   dies with the catalogue entry).
7. **Verify** — grep zero polishing refs; 301 works; grid columns at
   390/768/1440/1920; wizard shows 4; pixel-lock suite re-run; build,
   lint, typecheck green.

## Shipped (2026-08-11)

- Catalogue: polishing deleted; `Substrate` = vehicle | building |
  marine | interior; `marine-ppf` + `surface-protection` entries with
  zero specKeys/packages/FAQ by design (SK-BLD guard comment in file).
  `vehicleServices` now = 4 (drives BookingWizard automatically).
- Routing: ROUTES −polishing +marine/surface (+ building routes that
  the buildings branch had missed in the sitemap — fixed in passing);
  nav dropdown −التلميع +حماية القوارب +حماية الأسطح; permanent
  redirect `/services/polishing → /services` both locales (308, house
  standard per REDIRECTS.md) + REDIRECTS.md entry.
- i18n: `services.items.polishing.*` and `nav.servicesPolishing`
  removed; full MSA/EN copy for the two pending services (general
  problem/solution only, labelled TODO spec block, region-aware
  WhatsApp CTA text); home services heading is the approved
  «كل ما يستحق الحماية، نحميه» / "Everything worth protecting" + sub;
  dual-card labels (forCars/forBuildings) removed with the card.
- Components: shared `ServicesGrid` (grid-cols 1/sm 2/lg 3/2xl 4,
  equal heights, substrate-distinct borders) used by the new home
  `ServicesSection` (replaces the snap-rail, which is deleted) and by
  the `/services` index (alternating rows replaced). Dual-destination
  heat-isolation card retired.
- New pages: `/services/marine-ppf` + `/services/surface-protection`
  via `PendingServiceDetail` (hero, placeholder image band, general
  problem/solution, dashed TODO spec panel, `PendingServiceCta` →
  region-aware wa.me) + per-route OG images. Labelled placeholder
  card/hero images generated; polishing.webp deleted.
- Gallery: polishing category removed; its two photos re-tagged
  nano-ceramic.

Verified: 308s live both locales; TODO blocks render in AR + EN; grid
46/46 (7 cards, 1/2/3/3/4 columns at 390/768/1024/1440/1920, ≤4 per
row, no horizontal overflow, new heading) on home + index; 70-check
first-screen pixel-lock suite ALL PASS; `pnpm build` (54 pages incl.
4 new SSG routes), lint (0 errors), typecheck green.

## Smoke checklist v2 — items this restructure invalidates

For Ibrahim's ONE combined smoke pass (replaces the buildings-era
checks that tested a now-changed surface):

1. ~~Home rail dual-destination heat-isolation card ("للسيارات /
   للمباني" buttons)~~ — card no longer exists; buildings has its own
   grid card. Test instead: buildings card present in the 7-card grid
   and routes to `/services/building-heat-isolation`.
2. ~~Services index: buildings as visually-distinct SIXTH alternating
   row~~ — index is now the 7-card grid; buildings (+ marine +
   surface) carry the red-border treatment there.
3. ~~Nav dropdown lists 7 entries ending التلميع~~ — dropdown is now 8
   entries, no التلميع, ends حماية القوارب / حماية الأسطح.
4. ~~Booking wizard service step shows 5 automotive services~~ — now
   4 (polishing gone). Buildings/marine/surface must still never
   appear there.
5. Everything else from smoke v2 (building page content, TK-7099-IR
   single SKU, quote form wa.me routing, warranty buildings row,
   gallery buildings empty state) still applies unchanged — plus NEW:
   marine + surface pages show NO product/spec/warranty claims, only
   the labelled TODO, in both locales.
