# Meta Advanced Matching — requirements report (NOT built)

*Phase 21, 2026-08-22. Report only, per Ibrahim's instruction. Decision his.
Context: audit found AM absent on Meta while TikTok's automatic equivalent
(`EnrichAM`) is already active.*

## What it buys

Meta matches our events to logged-in users via hashed identifiers. Higher
event-match quality → more conversions attributed to campaigns, better
Lead-optimization signal, lower effective CPL. It matters double for us in
Phase 3: CAPI events carry the same hashed fields, and match quality is
what makes the server-side copies land on the right people.

## The two ways in

**Option A — Automatic Advanced Matching (AAM).** A toggle in Events
Manager → pixel settings. No code: the pixel scrapes recognisable
form-field values (phone, name, email) from the DOM when events fire.
Rejected as the primary path for us: it applies its own normalisation to
whatever it scrapes, and our phone fields hold *local* formats
(`01103402446`) — without a country prefix, Egyptian and UAE numbers
normalise wrongly or not at all, and we can't see or fix what it sends.
Note: this toggle may already be on or off in Events Manager — the site
audit cannot see it; check the pixel settings either way, and if AAM is on
today it should be turned off when (if) manual AM ships, to keep one
deterministic source.

**Option B — Manual AM (recommended if we do this).** Pass user data via
`fbq('init', PIXEL_ID, userData)` before the conversion event fires. The
pixel SHA-256-hashes the plaintext fields client-side before transmission
(hashing is not something we implement — passing pre-hashed values is also
allowed, but pointless in-browser). All code stays in `lib/analytics.ts`,
so the single-call-site guard still holds.

## Which fields we already have, per flow

| Field | Meta key | Vehicle | Building | Enquiry | Normalisation required |
|---|---|---|---|---|---|
| Phone | `ph` | ✅ required | ✅ required | ✅ required | digits only, **country code, no leading zero/plus**: `01103402446` → `201103402446`; UAE `05x…` → `9715x…`. Region is a wizard step, so the prefix is always known. This mapping is the only real work. |
| First name | `fn` | ✅ (single full-name field) | ✅ | ✅ | first token, lowercased; Arabic script is accepted by Meta as-is |
| Last name | `ln` | ✅ | ✅ | ✅ | remaining tokens; skip if the user typed one word |
| Country | `country` | ✅ (region step) | ✅ | ✅ | `eg` / `ae` |
| City | `ct` | ✅ (derivable from branch) | ◐ governorate/emirate chosen | — | lowercase, no spaces; optional — include where cheap |
| Email | `em` | — | — | — | only collected on the stub contact form; nothing to send until forms are real |
| External ID | `external_id` | — | — | — | do NOT use the SK-ref here — it's per-request, not per-person; wrong cardinality pollutes matching |

## Where in the flow it would hook

User data exists only after the **contact step** (name + phone entered).
Shape when built:

1. `lib/analytics.ts` gains `setMatchData({ name, phone, region, city? })`
   — normalises, then calls `fbq('init', ANALYTICS_IDS.meta, userData)`.
   Subsequent events (the `Lead` fired at confirm) carry AM automatically.
2. The wizard calls it once when the contact step validates (all three
   flows share that step component), and `BuildingQuoteForm` at submit.
3. e2e: assert the `facebook.com/tr` Lead request carries `ud[ph]=<hash>`
   and that the hash matches SHA-256 of the normalised phone.

Effort: roughly half a day — the phone normaliser (with tests for `+20`,
`0020`, spaces, `05x` UAE forms) is most of it. No dependency changes.

## Privacy — Egypt and UAE

Blunt version: **hashed is still personal data.** A SHA-256 of a phone
number is deterministic — it identifies the same person every time — so
under both regimes this is processing and cross-border sharing of personal
data with Meta, not anonymisation.

- **Egypt (PDPL, Law 151/2020):** consent-centric law; sharing subscriber
  phone numbers with a foreign ad platform is processing + a cross-border
  transfer, which the law conditions on permission/adequacy. Enforcement
  practice is immature, but the letter of the law wants a lawful basis and
  disclosure.
- **UAE (PDPL, Federal Decree-Law 45/2021):** requires lawful basis,
  transparency, and conditions on cross-border transfer (adequacy or
  consent). Marketing use of personal data leans on consent.
- **What that means practically, before enabling:**
  1. `/privacy` must explicitly disclose sharing hashed contact data with
     Meta (and TikTok) for advertising measurement. Today it doesn't.
  2. This is the same decision as the parked consent-banner item in
     TRACKING-SPEC.md §6 — `initAnalytics()` is the single gate a consent
     mechanism would wrap. Deciding AM without deciding consent leaves the
     bigger exposure (TikTok's `EnrichAM` is ALREADY auto-enriching —
     whatever position you take should be applied to both platforms:
     either gate/disable TikTok's AAM too, or accept both knowingly).
  3. The contact step could carry one line of microcopy («نستخدم بياناتك
     للتواصل بشأن طلبك» + privacy link) — cheap transparency that
     strengthens the lawful-basis story in both countries.

## Recommendation

If campaigns are resuming soon: manual AM (Option B), phone + name +
country only, gated behind the privacy-policy update, decided together
with the consent stance and the TikTok EnrichAM position. If campaigns are
months out, fold it into Phase 3 — CAPI needs the identical normalisation
work, and building both at once avoids doing the phone normaliser twice.
