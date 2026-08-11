# CHECKPOINT — 2026-08-11

## TL;DR

Homepage first screen rebuilt on new branch `feat/home-first-screen`
(5 commits off `main`, local only): nav + hero + partners strip share
exactly one viewport (`min-h-[100svh]` flex column, hero `flex-1`),
and the strip runs an auto-marquee of **all 27 unique V2 partner
logos in original colours** — the manufacturer-logo ban was reversed
by Ibrahim today, explicitly and on the record. Everything verified
with Playwright at 5 viewports × 2 locales; build/lint/typecheck
green. The older `feat/building-heat-isolation` branch is unchanged
and still gated on smoke checklist v2.

## Branch ledger

| Branch | State | Gate |
|---|---|---|
| `main` | = origin/main (`11be7a9`), deployed on Vercel | — |
| `feat/building-heat-isolation` | 6 commits, ends `fe0c582` | Ibrahim's smoke checklist v2 → his merge word |
| `feat/home-first-screen` | 7 commits (see progress doc 12, amendments 1–4), tree clean | Ibrahim's review → his merge word |

`feat/home-first-screen` commits: e227ddf hero 100svh → f59c5de
partners band (dark) → ae09cf6 first-screen column + TAKAI out →
cd021ae 25 car brands visible → 0b8dedf full set, original colours.

## Decisions this session (all Ibrahim, 2026-08-11)

1. First viewport = nav + hero + partners strip; nothing else. svh
   never vh. Fold lands exactly on the strip's bottom edge.
2. **Manufacturer-logo ban REVERSED** — informed choice via explicit
   confirmation (declined twice earlier the same day; the chosen
   option stated the reversal consequence). Then extended by name to
   `mansour-group-logo.svg` and `samer.webp` (Auto Samir Rayan).
   Fabricated marks (SK-BLD class) remain forbidden.
3. **No filter overlay on logos** — original colours at rest and on
   hover. The earlier grayscale-at-rest spec is dead.
4. **TAKAI excluded from the strip** — mother company (we are its
   exclusive EG/UAE distributor), not a peer partner.
5. Marquee: Framer Motion only, reading-direction drift (RTL-aware),
   hover pause, reduced-motion static row, runtime-measured copy
   count (no loop gap at any width).
6. `content/partners.ts` is structure-only; `confirmed: false`
   entries don't render; zero confirmed → strip renders nothing and
   the hero fills the viewport alone.

## HELD (approved to wait — never auto-resume)

- Merge/push of BOTH feature branches: Ibrahim's explicit word only.
- Buildings branch smoke checklist v2: still owed by Ibrahim.
- Mansour Chevrolet (dealership ≠ Group mark) + RB Garage placeholder
  entries: `confirmed: false` until written permission + real logos —
  or Ibrahim deletes them as redundant next to the Group mark.
- Building photography, social URLs, franchise figures, RH-Zak
  licence (owner TODOs from previous checkpoint).

## Known merge notes

- `messages/*.json`: buildings branch rewrote 410 values (MSA);
  home-first-screen added `home.partners.*`. Expect a trivial merge.
- STRUCTURE-SPEC §Home: partners entry inserted unnumbered ("1.5")
  specifically to avoid colliding with the buildings branch's rail
  edits.
- This branch is off pre-MSA `main`, so its AR homepage copy shows
  Egyptian dialect until the buildings branch (MSA rewrite) merges.

## Next action (exact)

Ibrahim eyeballs the strip on localhost:3000 (dev server serving
`feat/home-first-screen`). If satisfied: he decides merge order for
the two branches and says the word; smoke checklist v2 still gates
the buildings branch.

## Tomorrow start here

Run /orient, then ask Ibrahim for merge order between
`feat/building-heat-isolation` (gated on smoke checklist v2) and
`feat/home-first-screen` (gated on his visual sign-off of the strip).
