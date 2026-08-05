# Phase 3 — Chrome

## Plan

- **Assets found locally** (Visual Identity 2025 folder): white logo, full
  colour lockup, red monochrome mark, vector SK roundel → `public/brand/`.
  Social URLs + Egypt WhatsApp line extracted from V2_Prod (content/URLs are
  the sanctioned use of V2). TikTok/YouTube/LinkedIn URLs not found → stub +
  log in ASSETS-NEEDED.md.
- **Spec conflict resolved:** STRUCTURE-SPEC says "port RegionPicker from
  V5"; the kickoff hard-constraints say V3/V4/V5 are off-limits entirely.
  Kickoff wins — RegionPicker is rebuilt fresh (same UX contract: modal,
  Egypt/UAE, cookie).
- `content/regions.ts` — typed region records (currency, phone, WhatsApp).
  `content/branches.ts` — typed seed rows (ids/regions/phones only; names and
  addresses are message keys, Phase 4 fills them).
- `RegionProvider` (client context): default Egypt, hydrates from the
  `sk-region` cookie on mount (client-side read keeps the tree SSG — a
  server `cookies()` read would force dynamic rendering).
- `Header` (client): sticky, transparent over hero → solid+blur+hairline on
  scroll; two-level dropdowns (Framer, aria-expanded, hover + focus); right
  cluster = locale switch (ع/EN), RegionPicker trigger, CTA → `/booking`.
  Mobile: full-screen Framer drawer with accordion sub-nav.
- `Footer`: logo + tagline, 5-icon social row, region-aware contact block
  (phones LTR, swap with region), legal row. `TrustBadges` stubbed with TODO.
- `WhatsAppFab`: fixed, logical inset, region-aware wa.me link.
- Nav structure per STRUCTURE-SPEC in `lib/nav.ts`; all labels in messages.

Verify: build/lint/typecheck green; both locales render chrome; region swap
flips footer phones; cookie persists.

## What shipped

- `public/brand/`: white logo, colour lockup, red mark, vector roundel —
  copied from the local Visual Identity 2025 folder. Logo asset gap closed.
- `content/regions.ts` (Egypt/UAE: currency, phone, WhatsApp) and
  `content/branches.ts` (6 seed branches, typed; names/addresses deferred to
  message keys in Phase 4). Capacities recorded: التجمع 8, زايد 6, المعادي 3.
- `RegionProvider` — client context, Egypt default, `sk-region` cookie
  (1-year, lax) written on change, read client-side post-mount so every page
  stays SSG.
- `Header` — fixed, transparent at top, solid + blur + hairline after 8px
  scroll; two-level Framer dropdowns (hover + click + focus-out + Esc,
  `aria-expanded`), active-route red underline, right cluster (locale switch,
  region trigger, booking CTA), full-screen mobile drawer with accordion
  sub-nav that closes on navigation.
- `Footer` — 4 zones per spec: logo+tagline, 5 social icons
  (IG/FB live URLs from V2_Prod; TikTok/YT/LI stubbed with TODO), region-aware
  contact block (tel: + wa.me swap with region, phones pinned LTR), legal row
  with dynamic year. `TrustBadges` stub renders nothing (TODO documented).
- `WhatsAppFab` — fixed, logical `end-5`, region-aware wa.me target.
- `docs/progress/ASSETS-NEEDED.md` started (missing socials, unverified
  phones, branch photos, hero slides, gallery media, trust badges).

## Verification

`pnpm build` ✓ · `pnpm lint` ✓ · `tsc --noEmit` ✓ · curl smoke test: Arabic
chrome shows nav/CTA/tagline/Egypt phone/wa.me link, English chrome shows
translated equivalents ✓

## Outstanding

- Region-picker doesn't auto-open on first visit (spec is silent; decided
  against — the default Egypt + manual switch is less intrusive). Flag if
  UAE traffic data says otherwise.
- Full message bundle (incl. `dev.*`) serializes into every page via
  provider inheritance — trim with a namespace pick in Phase 6 if payload
  size matters.
- Header is transparent over page top on every route; Phase 5 pages must
  start with a hero/pad that accounts for the fixed 4.5rem bar.
