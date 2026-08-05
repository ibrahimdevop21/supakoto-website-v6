# Phase 0 — Reference capture

## Plan

1. Add `reference/` to `.gitignore` before anything is captured.
2. Activate pnpm via corepack (not previously installed on this machine).
3. `pnpm init` + `pnpm add -D playwright`, `npx playwright install chromium`.
4. Run `node scripts/capture-reference.mjs` against `dettaglioauto.sa`
   (3 viewports × 14 routes → screenshots + `reference/capture/outline.json`).
5. Read `outline.json`; record per page: section count, section order, and
   deviations from `STRUCTURE-SPEC.md`. Spec wins on disagreement unless the
   capture shows something clearly better.
6. Commit (progress doc + .gitignore + package manifest only — no capture
   output).

## What shipped

- pnpm 11.20.0 activated via corepack; `package.json` created with exact
  `packageManager` pin (the `pnpm init` default emitted a `devEngines` range
  corepack itself rejects — replaced).
- Playwright 1.62.1 + Chromium headless shell installed.
- **Script fix:** `waitUntil: "networkidle"` never fires on their Nuxt site
  (persistent analytics traffic) — every route timed out at 45s. Switched to
  `"load"` + 1.5s settle. All 42 captures (14 routes × 3 viewports) green.
- The stock outline extractor's selectors matched almost nothing in their DOM
  (0 sections on 12 of 14 pages). Ran a supplemental heading-order pass
  (h1–h4 + y-position, desktop) → `reference/capture/headings.json`.
  The one-off script lives in `reference/` (gitignored working material).
- Capture output: `reference/capture/{mobile,tablet,desktop}/*.png`,
  `outline.json`, `headings.json` — 158 MB, all gitignored.

## Findings — measured layout vs `STRUCTURE-SPEC.md`

Verdict up front: **the spec wins everywhere.** On every page where the
measured site differs, their live version is *thinner* than the spec, not
better. No spec changes proposed. Details per page:

### `/` home — 5 measured sections + footer

Measured order: (1) hero carousel — 6 slides, dot nav, **contained width with
rounded corners, not full-bleed**; (2) 3-up tile row: أعمالنا photo/video
tile · services snap-carousel tile (the 5 services live *inside* this small
carousel) · احجز الان tile; (3) full-width فروعنا 3D-tour banner; (4) 3-up
tile row: الضمان · منتجاتنا · الهدايا; (5) قطاع الاعمال band.

Deviations, spec wins on all: spec's hero is full-bleed (matches our sharp
Japanese-minimal identity better than their inset rounded card); spec promotes
the services rail to its own full section instead of a tile-embedded
carousel; spec's أعمالنا is a 9-item masonry section, theirs is one link
tile; their gifts + 3D-tour tiles are dropped per route map; spec's 2×2
feature grid replaces their two 3-up rows. Their footer carries Saudi payment
rails (mada/tabby/tamara) and Maroof/SBC badges — confirmed present,
confirmed not ported.

### `/about` — matches spec skeleton

h1 → brand story block → رؤيتنا/رسالتنا/قيمنا 3-up cards. Same bones as
spec §about; spec adds the stat-counter row (their page has none — our
addition stands). Their homepage warranty tile says "لمدة تصل إلى عشر سنوات"
(10 years) — site-wide single figure. Confirms our tier-scoped approach is a
real differentiator, not just a compliance rule.

### `/booking` — structurally rejected, deliberately

Theirs is one long scroll page with every step stacked (~22 headings, 5110px):
car size → services/packages → branch & time → contact → summary → **payment
method**. Spec's one-question-per-screen wizard stands. Note their step set
includes car size and in-page payment; ours ends at Confirm and posts to
bdm-flow — no change.

### `/warranty` — no structural reference available

Their page is flat policy prose (one h1, 2500px of text). Our tier-comparison
layout has no counterpart there; we build from spec alone.

### `/franchise` — spec is richer than the live page

Spec says "follows their structure closely" — in reality their live funnel is
thin: hero + subline + image, "لماذا تستثمر" as **6** plain text chips (3×2),
one apply CTA. No investment band, no process timeline, no FAQ, no inline
form. Spec's 7-part funnel (4 value props, what-you-get, investment TODO,
timeline, form, FAQ) is a superset — build the spec.

### `/business-contracts` — matches

h1 → pitch line ("لننمِّ أعمالك معنا") → contract-request form. Maps cleanly
to spec's `/business` quote-request page.

### `/branches` — matches

h1 + card grid, 1620px. Card anatomy (photo/address/phone/maps) per spec.

### `/contact-us` — one extra section noted

h1 → 4 info tiles (address/phone/email/hours) → **آراء العملاء customer
reviews carousel** → form. The reviews section is not in our spec and we have
no verified review source — not adopting. Complaints absorbed as form subject
per spec.

### `/careers` — matches

h1 → الشواغر المتاحة openings list → قدّم طلبك الآن application form.

### `/faqs`, galleries — matches / merge confirmed

FAQ: h1 + accordion. Photo gallery: h1 + grid (2296px). Video gallery:
13285px of unfiltered embeds — strong confirmation for spec's single
filtered grid with a Video filter instead of a second page.

### `/information/products` + `/information/polishing` — index pattern confirmed

Products index: full-width alternating image/text rows (theirs lists ~16
retail products; ours is 5 services — pattern ports, content doesn't).
Polishing detail: hero → stage cards (المرحلة 0–3) → CTA. Far thinner than
spec's 8-part service detail template (no pain/solution split, no spec table,
no before/after, no tiers, no FAQ) — spec wins.

### Measured tokens (recorded for completeness, then discarded)

Cairo everywhere, `#161616` body bg, h2 36px/700, RTL root. Zero visual DNA
ports per DESIGN-TOKENS.md — noted only to confirm the capture worked.

## Outstanding

- Nothing blocking. Phase 1 (scaffold) next.
- Reminder logged for later phases: their site proves the "single site-wide
  warranty number" anti-pattern we're avoiding (see /warranty consistency
  check in STRUCTURE-SPEC.md).
