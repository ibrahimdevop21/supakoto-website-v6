# Phase 4 — Content layer

## Plan

- Typed data in `content/`: `services.ts` (5 services + package/spec shape),
  `warranty.ts` (tier table with honest TODOs + the lifetime-qualifier
  contract), `faq.ts` (ids/categories), `gallery.ts` (placeholder items with
  categories). Branch display strings become `branches.items.<id>.*` message
  keys on top of the existing `content/branches.ts`.
- Full site copy for all 15 routes in `messages/ar.json` first (Egyptian
  dialect, no نقدم لكم/أفضل الأسعار/خدمة متميزة, premium-Japanese framing,
  phones LTR), then `messages/en.json` (confident, minimal, short sentences).
- Warranty rules enforced at the content level: every warranty string names
  its tier; "lifetime" strings exist only in the `warranty` and
  `services.ppf` namespaces + Premium Plus tier card copy; the qualifier
  renders from `content/warranty.ts` beside every lifetime mention and ships
  as a visible, clearly-labelled TODO (cells stay honest, no invented terms).
- Franchise investment figures: TODO per the brief (Ibrahim supplies).

## What shipped

- `content/services.ts` (5 services: spec/package/FAQ shape, `premiumPlus`
  flag on PPF only), `content/warranty.ts` (tier table + honest-TODO rows +
  `LIFETIME_QUALIFIER_KEY` contract + allowed-routes list),
  `content/faq.ts` (10 entries, 4 categories), `content/gallery.ts`
  (12 typed placeholder items + filter list).
- Full site copy for all 15 routes in both message files — **577 keys,
  perfect ar/en parity** (script-checked). Arabic written first in Egyptian
  dialect; English translated second, short and unhyped.
- Automated content checks all green: no banned phrases
  (نقدم لكم / أفضل الأسعار / خدمة متميزة); "lifetime"/"مدى الحياة" appears
  ONLY under `warranty.*` and `services.items.ppf.*`; footer/taglines/
  feature tiles are warranty-tier-neutral.
- Honest TODO placeholders (visible, bracketed) for: lifetime qualifier
  (whose lifetime — Ibrahim's call), warranty table cells, film
  thickness/self-healing specs, about-page 4th stat, franchise investment
  figures. None invented.

## Verification

`pnpm build` ✓ · `pnpm lint` ✓ · `tsc --noEmit` ✓ · key-parity +
banned-phrase + lifetime-scope script ✓

## Outstanding

- Ibrahim's decisions pending (all rendered as labelled TODOs, non-blocking):
  lifetime qualifier scope, warranty table cells, about 4th stat, franchise
  investment ranges.
- Branch street addresses are approximate (seed data had areas, not full
  addresses); hours unverified — both flagged in ASSETS-NEEDED.md.
