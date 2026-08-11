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

## Amendment (2026-08-11, same day)

Ibrahim re-scoped after seeing the build:

1. **First viewport = nav + hero + partners strip together** (was:
   hero only, strip revealed on scroll). Implemented as a
   `min-h-[100svh]` flex column in `page.tsx`; hero becomes `flex-1`.
   When the strip renders nothing the hero fills the viewport alone —
   the layout self-adjusts, no conditional styling.
2. **TAKAI removed from the roster** — mother company (we are its
   exclusive distributor for EG + UAE), not a peer partner. Entry,
   placeholder asset, and i18n keys deleted.
3. **Manufacturer-logo ban RECONFIRMED.** The V2 `public/partners/`
   car logos were floated and explicitly declined — partners only, no
   "brands we've worked on" reframing. The ban stands as written.
4. Marquee bug found & fixed during re-verification: with a small
   roster, 2 track copies don't span wide screens (visible loop gap at
   ≥1440px). Copy count is now measured at runtime
   (`ceil(container/copy) + 1`, window-resize aware); wrap distance is
   one copy width.

Re-verified after the amendment (Playwright, 5 viewports × 2 locales):
empty state 10/10 (hero fills fold exactly); strip state 11/11 (hero +
strip tile the viewport, rail below fold, no-gap coverage at 1920px —
6 copies); marquee behaviour 15/15 (RTL right / LTR left, hover pause,
reduced-motion static, grayscale→colour); single lockup 8/8 (centred,
caption correct both locales, inside first viewport). Ship state
restored: both entries `confirmed: false`.

## Amendment 2 (2026-08-11, afternoon) — manufacturer-logo ban reversed

Ibrahim asked to import "the actual partners" from V2's
`public/partners/`. That folder = 26 car-brand logo files (+ banned
mansour-group-logo.svg + samer.webp / Auto Samir Rayan). Because the
request contradicted the ban he had reconfirmed the same morning, it
went back as an explicit AskUserQuestion whose option text stated the
reversal consequence — **Ibrahim selected the 26 car-brand logos. The
ban is reversed by informed choice, 2026-08-11.** Not selected (stay
out): mansour-group-logo.svg, samer.webp.

What shipped:

- 25 unique brands (Citroën was duplicated in V2) rendered from SVG
  via headless Chrome → alpha-trimmed → 240px-tall transparent WebPs
  (~340 KB total, down from 1.1 MB of raster-embedded SVGs). Four had
  opaque white raster backgrounds knocked out (Haval, Renault, Tesla,
  Toyota).
- `content/partners.ts`: 25 brand entries `confirmed: true` + Mansour
  Chevrolet / RB Garage `confirmed: false`; header comment records the
  rule history. i18n names for all 27 in both locales (Arabic
  transliterations for brands); aria label now "الماركات والشركاء" /
  "Brands & partners".
- Logo rendering: box-constrained (`max-w` + `object-contain`) so wide
  wordmarks (Jetour 2510×240) sit evenly next to roundels; rest state
  changed from brightness-0 silhouette (destroyed Ferrari's shield,
  made white-bg rasters into solid boxes) to `grayscale invert`,
  hover = original colour.
- Placeholders regenerated with transparent backgrounds so filters
  don't turn them into white tiles.

Verified: first-screen tiling 21/21 (5 viewports × 2 locales + no-gap
at 1920px), marquee behaviour 15/15 with the 25-brand roster (50 imgs
= 2 measured copies, RTL/LTR drift, hover pause, reduced-motion static
row of 25, grayscale-invert rest / colour hover). Screenshot review:
Ferrari detail and Haval wordmark legible after the treatment fix.

## Amendment 3 (2026-08-11, afternoon) — full V2 set, original colours

Ibrahim: include all V2 partner logos "even the mansour and the samir
rayan", and remove the overlay — original colours. Shipped:

- `mansour-group.webp` (rendered from the SVG he had earlier banned —
  inclusion now explicitly named by him, ban lifted) and
  `samir-rayan.webp` (native 256×144 WebP, trimmed; already >2× the
  48px display size, not upscaled) join the roster `confirmed: true` →
  **27 visible marks**, ~360 KB total.
- Filter overlay removed entirely — no grayscale/invert/opacity; the
  V2 files are mostly dark-site variants, so original colours stay
  legible on the strip (screenshot-verified: Samir Rayan orange, BYD
  red, Geely blue, silver Bentley).
- Mansour Chevrolet + RB Garage placeholder entries remain
  `confirmed: false` — dealership entity ≠ Group mark; Ibrahim may
  drop or keep them.

Verified: first-screen tiling 21/21, marquee behaviour 15/15 with 27
logos (54 imgs = 2 copies, drift, hover pause, reduced-motion static
row, `filter: none` at rest and on hover).

## Amendment 4 (2026-08-11, evening) — chrome polish

Approved brief, three items:

1. **Logo**: header + drawer-adjacent top bar + footer now use the V2
   horizontal lockup (red SK roundel + SUPA KOTO + tagline). The 154 KB
   traced SVG was rendered once to `public/brand/logo-lockup.webp`
   (353×150, 19 KB); source archived in `assets/source/v2-brand/`.
2. **Hero copy → MSA**: ported verbatim from the buildings branch
   (approved wording) — `home.hero.*` (5 slides + CTA «احجز موعدا»),
   `nav.cta` («احجز الآن»), dialect fixes in `nav`/`chrome`
   (openMenu/closeMenu, region modal, whatsapp label), and
   `home.title` (browser-tab title). Buildings-only `nav.services*`
   keys were NOT ported (no Services dropdown on this branch; key
   symmetry with en.json verified). Remaining dialect below the fold
   ships with the buildings merge.
3. **Header cluster**: root cause of the size mismatch — `cn()` is a
   plain join, so the header's `py-1.5` override lost to Button's
   variant `py-3` in stylesheet order. Button gains a `size` prop
   (`md` unchanged default / `sm` = h-9 px-4 text-small; padding
   moved out of variants, link variant keeps text-body); switcher
   chips become h-9 inline-flex. All three controls verified 36 px,
   4 px radius, 14 px type in both locales.

Verified: chrome-polish checks 12/12, no dialect in header or first
screen, lockup logo served, build/lint/typecheck green.

## Next

- Mansour Chevrolet (dealership) / RB Garage: written permission +
  real logo → point the entry at the file, flip `confirmed: true` —
  or delete the placeholder entries if the Group mark covers Mansour.
- TAKAI framing («أفلام تاكاي اليابانية الأصلية») stays where it
  already lives on the site; not part of this strip.
- Merge order with `feat/building-heat-isolation`: independent; expect
  a trivial i18n merge (new `home.partners` namespace) and none in
  STRUCTURE-SPEC if the unnumbered insert holds.
