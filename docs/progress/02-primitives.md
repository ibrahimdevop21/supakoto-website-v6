# Phase 2 — Primitives

## Plan

Component set in `components/ui/`, shared helpers in `lib/`:

- `lib/cn.ts` — tiny class joiner (no clsx dep).
- `lib/motion.ts` — the DESIGN-TOKENS motion constants in one place:
  entrance (y 24→0, 0.6s, `[0.16,1,0.3,1]`), hover lift (y −4, 0.25s),
  stagger 0.08s, counter 1.6s @ 40% viewport. Everything respects
  `useReducedMotion`.
- `Container` — max-w 1280 + fluid gutter. `Section` — vertical rhythm,
  optional `paper` (light) variant.
- `Eyebrow` — small label + red rule; tracking/uppercase are Latin-only by
  the RTL base-layer guard.
- `Heading` — h1/h2/h3, display font on h1/h2, token sizes.
- `Button` — primary (red fill) / ghost (hairline) / link; renders locale-aware
  `Link` when `href` given. Colour transitions are CSS; no animation lib.
- `Card` — ink-800 surface, hairline border, `radius-card`, optional Framer
  hover lift.
- `Reveal` + `RevealStagger` — standard Framer entrance, `whileInView` once.
- `Counter` — count-up over 1.6s on 40% in-view, Western numerals.
- `Accordion` — accessible (`button[aria-expanded]` + region), Framer
  height/opacity, chevron mirrors via rotate only (non-directional).
- `Lightbox` — portal modal, Esc/arrow keyboard nav, focus restore,
  Framer fade/scale.
- `Field` set — `Label`, `Input`, `Textarea`, `Select`, `FieldError`,
  focus ring in sk-red.

Kitchen sink: `app/[locale]/dev/kitchen-sink/page.tsx` renders every
primitive; strings from a `dev.kitchenSink` namespace in both message files
(keeps the no-hardcoded-strings rule intact and doubles as an i18n check).
Locale routes give both directions: `/dev/kitchen-sink` (ar/RTL) and
`/en/dev/kitchen-sink` (en/LTR), plus an inline opposite-`dir` strip on each
for side-by-side comparison.

Verify: build/lint/typecheck green; manual curl of both kitchen-sink routes.

## What shipped

Everything in the plan, as planned:

- `lib/cn.ts`, `lib/motion.ts` (all DESIGN-TOKENS motion constants; every
  animated component checks `useReducedMotion` and degrades to static).
- `components/ui/`: `Container`, `Section` (dark/raised/paper tones),
  `Eyebrow`, `Heading`, `Button` (primary/ghost/link; locale-aware `Link`
  when `href` present), `Card` (optional hover lift), `Reveal` +
  `RevealStagger`/`RevealItem`, `Counter` (Western numerals, `dir="ltr"`,
  tabular), `Accordion` (aria-expanded/controls, single-open), `Lightbox`
  (portal, Esc + arrows with RTL-aware prev/next mapping, focus restore,
  scroll lock), `Field` set (`Label`, `Input`, `Textarea`, `Select`,
  `FieldError`, `PhoneInput` — phone always LTR).
- Kitchen sink at `/dev/kitchen-sink` + `/en/dev/kitchen-sink`: every
  primitive, forms demoed on the paper tone, plus an opposite-`dir` strip on
  each locale. All strings live in `dev.kitchenSink` in both message files —
  no hardcoded copy, and the Arabic is Egyptian dialect from day one.

## Verification

`pnpm build` ✓ (kitchen sink SSG both locales) · `pnpm lint` ✓ ·
`tsc --noEmit` ✓ · curl smoke test on both routes ✓

## Outstanding

- Lightbox focus trap is minimal (focus lands on close, restores on exit;
  Tab is not cycled inside the dialog). Harden in Phase 6 a11y pass if
  keyboard-nav review demands it.
- `dev.kitchenSink` strings ship in the production message bundle. Harmless;
  revisit at Phase 6 only if bundle size matters.
