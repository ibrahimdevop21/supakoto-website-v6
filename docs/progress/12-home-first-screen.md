# Phase 12 — Homepage first screen: full-viewport hero + partners band

Branch: `feat/home-first-screen` (off `main`, independent of
`feat/building-heat-isolation`).

Brief approved 2026-08-11. End state: hero fills the viewport, partner
carousel is the first thing revealed on scroll, nothing else visible on
first paint.

## Locked decisions

1. `svh` everywhere, never `vh` (avoids mobile browser-chrome jump).
2. Hero gets `min-h-[100svh]` and keeps flowing under the fixed
   transparent header — NOT a literal `calc(100svh - header)`, which
   would put the fold 72px early and leak the partners band.
   STRUCTURE-SPEC's "transparent over hero" stays true.
3. Hero DOM/layout/copy/dots untouched — height and spacing only.
   Triptych layout is intentional (checkpoint doc, decision 7).
4. **No car manufacturer logos, now or later.** V2's `public/partners/`
   folder is a banned source in its entirety — including
   `mansour-group-logo.svg` (parent conglomerate ≠ the Chevrolet
   dealership; using it overstates the relationship).
5. **No fabricated brand assets.** No typographic TAKAI lockup — styling
   our own wordmark for the company we distribute for is the same class
   of error as SK-BLD. Labelled placeholders only, for all three.
6. All three partners ship in `content/partners.ts`; ALL ship
   `confirmed: false` (no real logo exists locally for any of them).
   Only `confirmed: true` entries render.
7. **Zero confirmed partners → the band renders NOTHING.** No empty
   state, no reserved space. Homepage flows hero → services rail exactly
   as today. Section goes live when Ibrahim drops a real logo and flips
   one flag.
8. Exactly one confirmed partner → centred static lockup, never a
   one-item scroller. TAKAI single state carries the framing line
   «أفلام تاكاي اليابانية الأصلية» / "Genuine Japanese TAKAI films" —
   material partnership, not a client logo.
9. Marquee (2+ confirmed) is Framer Motion (`useAnimationFrame`), no CSS
   keyframes. Pauses on hover. `prefers-reduced-motion` → static row.
   Grayscale at rest → colour on hover (CSS transition, allowed).
   Direction follows document direction (RTL-aware).
10. Band scale: ~96–120px logo area + padding. A strip, not a section.
11. New i18n keys land in both `ar.json` and `en.json`; Arabic is MSA
    (the on-main CLAUDE.md predates the MSA migration — MSA governs).
12. TAKAI brand assets are requestable from info@takaifilms.jp —
    recorded in ASSETS-NEEDED, PARTNER LOGOS as top item, TAKAI marked
    as blocking the section.

## Phases

- **P1 — hero height.** `min-h-[80svh]` → `min-h-[100svh]` in
  `HeroCarousel.tsx`. Verify at 390×844, 414×896, 768×1024, 1440×900,
  1920×1080: initial paint shows hero only; hero bottom ≥ viewport
  bottom at scrollY 0.
- **P2 — partners.** `content/partners.ts`, `PartnersBand` component,
  wiring between `HeroCarousel` and `ServicesRail`, i18n keys, labelled
  placeholder assets. Zero-confirmed null render verified; marquee /
  single states verified by temporarily flipping flags in dev only.
- **P3 — docs.** STRUCTURE-SPEC.md (hero height + band), ASSETS-NEEDED
  (PARTNER LOGOS top item), this doc updated with what shipped.

Green bar per phase: `pnpm build` + `pnpm lint` pass, no TS errors.
Local commits only; push/merge on Ibrahim's word.

## Shipped (2026-08-11)

- **P1** — `HeroCarousel` section: `min-h-[80svh]` → `min-h-[100svh]`.
  One-line diff; triptych/headline/CTA/dots untouched. Verified with
  Playwright + system Chrome against all five viewports (390×844,
  414×896, 768×1024, 1440×900, 1920×1080) × both locales: hero bottom
  lands exactly on the fold, services rail at/below it, 10/10 PASS.
- **P2** — `content/partners.ts` (3 entries, all `confirmed: false`),
  `components/sections/home/PartnersBand.tsx`, wired between hero and
  rail in `app/[locale]/page.tsx`, `home.partners.*` keys in both
  locales, labelled placeholder WebPs in `public/images/partners/`.
  State verification (flags flipped in dev only, restored after):
  marquee 15/15 PASS (RTL drifts right, LTR drifts left, hover pauses,
  reduced-motion static row, grayscale→colour), single-TAKAI lockup
  8/8 PASS (centred ±0px, framing line correct in both locales, no
  scroller), zero-confirmed null render re-verified after restore.
- **P3** — STRUCTURE-SPEC §Home: hero height note + section 1.5
  partners band (inserted unnumbered to avoid merge conflicts with the
  buildings branch's rail edits). ASSETS-NEEDED: PARTNER LOGOS as top
  item, TAKAI marked as blocking, info@takaifilms.jp recorded.
- Green bar: `pnpm build` ✓ (all routes), `pnpm lint` ✓ (0 errors; the
  single warning is pre-existing on main in BranchGrid).
- Ops note: the stale Aug-7 dev server was killed and `.next` rebuilt
  clean; a fresh `npm run dev` is serving localhost:3000.

## Next

- Ibrahim requests the TAKAI mark (info@takaifilms.jp), drops it into
  `public/images/partners/`, points `content/partners.ts` at it, flips
  `confirmed: true` — section goes live with the centred lockup.
- Merge order with `feat/building-heat-isolation`: independent; expect
  a trivial i18n merge (new `home.partners` namespace) and none in
  STRUCTURE-SPEC if the unnumbered insert holds.
