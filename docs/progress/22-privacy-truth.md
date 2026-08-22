# Phase 22 — privacy page tells the truth

*2026-08-22, urgent, from Ibrahim's work order. Phase 21 merged+pushed
first (main `bd57ddf`).*

## WHY
`/privacy` (live) claims one region cookie and «بدون أي تتبع إعلاني». Both
false: GA4, Meta Pixel, TikTok, Google Ads base tag run on every page, an
`sk-attribution` cookie stores fbclid/gclid for 30 days, and TikTok's
automatic advanced matching is sharing personal data with no disclosure.

## VERIFIED BEFORE WRITING (production, real Chrome UA, 2026-08-22)
- **EnrichAM payload captured on /en/booking:** after typing a phone into
  `#bk-phone`, TikTok's pixel sent
  `user.auto_phone_number: 1ae4cefa…` = **SHA-256 of the typed phone**,
  self-triggered (`auto_trigger_type`), plus diagnostic labels showing it
  also computed a second "suggested" hash after injecting a country code.
  Email fields absent → email slots empty. This is TikTok **Automatic
  Advanced Matching** scraping form fields; we wrote no code for it.
- **Actual cookie inventory on a plain landing:** first-party set by us:
  `sk-attribution` (30d; `sk-region` 1y appears when a region is picked;
  `NEXT_LOCALE` session, set by next-intl). Set by the pixels on our
  domain: `_ga`, `_ga_ENPYD2K4R3` (400d), `_gcl_au` (90d), `_fbp` (90d),
  `_ttp`, `_tt_enable_cookie`, `ttcsid`, `ttcsid_<pixel>` (390d). True
  third-party: `facebook.com fr` (90d), `tiktok.com _ttp` (390d),
  `doubleclick.net test_cookie` (session).
- localStorage (device-only, never sent): `sk-booking-intents` /
  `sk-building-quote-intents` / `sk-enquiry-intents`, last 20 each, hold
  name + phone + form draft + the SK-ref.

## SCOPE
1. Rewrite `/privacy` (both locales, white Arabic): every cookie with
   name/purpose/lifetime; Google, Meta, TikTok named with what each
   receives; explicit statement that analytics + advertising tracking
   occurs; retention; PDPL rights (EG 151/2020, UAE 45/2021).
2. `/terms`: add a data-and-measurement section pointing at the privacy
   policy (the existing four sections are factually fine and stay).
3. EnrichAM report + disable instructions (in this doc, §below).
4. `docs/progress/CONSENT-DECISION.md` — report only, NOT built.
5. Guard `scripts/check-privacy-claims.mjs`: build fails if privacy copy
   claims no advertising tracking (or "single cookie") while any pixel env
   var is set; also fails if pixels are set and the copy does not name
   Google, Meta and TikTok.

## LOCKED DECISIONS
- LD-1 Page structure: privacy sections become collect · use · cookies ·
  thirdParties · retention · rights · contact; sections may carry an
  `items` string-array rendered as a list (page component updated).
  LAST_UPDATED → 2026-08-22 on both pages.
- LD-2 Copy states TikTok's automatic matching plainly (it is live today).
  If Ibrahim disables AAM after reading the report, one sentence gets
  trimmed — disclosure first, then reduction.
- LD-3 Cookie lifetimes in copy in human units (سنة، ٩٠ يوما، ١٣ شهرا…),
  matching the measured values above.
- LD-4 Guard reads env from process.env AND falls back to `.env.local` /
  `.env.example` so it fails locally, not only on Vercel.
- LD-5 Branch `feat/phase-22-privacy-truth` off main; local only until
  Ibrahim's word (the fix is urgent — flag for fast merge in the report).

## TIKTOK ENRICHAM — what it does and how to turn it off
**What it collects/sends (captured, not inferred):** when a visitor types
into any field the pixel classifies as a phone/email input, pixel.js
hashes the value (SHA-256) client-side and sends it to
`analytics.tiktok.com` in an `EnrichAM` event tied to the visitor's
anonymous id and session — for us that is the booking-wizard phone field
(and name fields are probed; email would be captured on the contact form).
No code of ours triggers it; it ships enabled with the standard pixel.
**Disable (Events Manager, no code):** TikTok Events Manager → select
pixel `D32GSIRC77U649U91T50` → **Settings** → **Advanced Matching** →
turn **OFF “Automatic Advanced Matching”** (web). Manual advanced matching
stays available later via `ttq.identify()` if ever wanted — that would be
our code, our normalisation, our disclosure.
**Verify after toggling:** rerun the capture
(`scratchpad/enricham-capture.mjs`): the `EnrichAM` request should stop
carrying `auto_phone_number` (or stop appearing entirely).

## SMOKE
- /privacy + /terms render new sections in ar + en; parity; white Arabic.
- Guard: with pixel IDs set, restoring the old «بدون أي تتبع إعلاني» line
  → build fails; new copy → passes. Negative-test both directions.
- Full gate: build (7 guards) · lint · typecheck · parity · smoke.

## SHIPPED
(fill at end)
