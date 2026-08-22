# Consent banner — decision document (NOT built)

*Phase 22, 2026-08-22. Ibrahim decides. Context: the truthful privacy
policy (Phase 22) gives us disclosure; this doc covers whether we also
need consent, what it would take, and what it costs.*

## Legal position, bluntly

Neither Egypt nor the UAE runs an EU-style "cookie banner or else" regime
today. But both PDPLs are consent-leaning for processing like ours:

- **Egypt (151/2020):** consent-centric — processing personal data
  generally requires consent unless an exception applies; marketing use is
  squarely consent territory. Executive enforcement has been slow to
  materialize, which is why the market mostly doesn't show banners. The
  letter of the law is stricter than the street.
- **UAE (Federal Decree-Law 45/2021):** requires a lawful basis;
  consent is the default basis with defined exceptions, and cross-border
  transfer (all four of our platforms) has its own conditions. The UAE
  regulator is the more active of the two.
- What we run is unambiguously "processing": ad click IDs tied to a
  visitor (sk-attribution), platform cookies (_ga, _fbp, _ttp…), and —
  until the TikTok AAM toggle is turned off — hashed phone numbers.

**Disclosure (done in Phase 22) is necessary but is not consent.** Today
we effectively rely on an implied legitimate-interest-style argument that
neither law spells out the way GDPR does. That is a defensible interim
position with low enforcement probability, not a clean one.

## What a banner would require (if built)

Mechanically small, because the architecture already has one choke point:

1. **Gate:** wrap `initAnalytics()` in `components/providers/Analytics.tsx`
   — no consent, no pixel loads, no platform cookies. `captureAttribution()`
   (ad click IDs) joins the same gate. `sk-region` / `NEXT_LOCALE` are
   strictly-necessary and stay exempt.
2. **UI:** first-visit bar, both locales, white Arabic: one sentence +
   «موافق» / «رفض» (+ privacy link). Choice stored in a `sk-consent`
   cookie, 12 months. No settings modal needed for a two-category site
   (necessary vs measurement).
3. **Consent Mode v2 (optional, Google only):** on decline, gtag can run
   in cookieless "denied" mode and model conversions instead of vanishing.
   Meta/TikTok have no real equivalent — declined means gone.
4. **e2e:** decline → zero pixel requests, zero platform cookies; accept →
   current 143-check behavior. Guard: no pixel request before a stored
   consent when the gate is enabled.

Estimate: ~1 day including e2e, no dependencies.

## What it costs us in measurement

- Every decline is a visitor invisible to GA4, Meta and TikTok. With soft
  regional banner phrasing, expect roughly **10–30% of visitors lost to
  measurement**; the exact rate depends on wording and placement.
- Meta/TikTok optimization gets proportionally less Lead signal → noisier
  CPL, slower learning phases; remarketing audiences shrink by the same
  fraction.
- Attribution joins for Phase 3 (`sk-attribution`) disappear for decliners
  — the WhatsApp ref still works, so leads are not lost, only their
  campaign join.
- Blocking-style (EU-style, prior consent) roughly doubles that loss vs a
  soft opt-out bar.

## Risk of NOT having one

- **Regulatory:** Egypt — low today (enforcement machinery still
  immature). UAE — low-to-moderate and rising; fines exist on paper. A
  complaint-driven action is the realistic vector, and car-protection
  customers are not a complaint-prone segment.
- **Platform:** Meta/TikTok terms require the advertiser to have a lawful
  basis and proper disclosure. Phase 22's policy satisfies disclosure;
  consent gaps are the advertiser's problem, not one the platforms police
  actively in EG/UAE.
- **The acute exposure was undisclosed EnrichAM** (hashed phones flowing
  with a policy that said "no tracking"). Phase 22 closes the disclosure
  half; turning AAM off closes the collection half. What remains without
  a banner is the residual consent-basis gap described above.

## Options

| | What | Measurement cost | Compliance strength |
|---|---|---|---|
| A | Status quo after Phase 22: full disclosure, no banner | none | interim-defensible; weakest under UAE consent reading |
| B | Soft notice bar: visible, accept/decline, pixels load only after accept (or: load by default, stop on decline) | ~10–30% | good-faith consent story in both countries |
| C | Prior-consent blocking gate + Consent Mode v2 | ~20–50% (GA4 partially modeled) | strongest, GDPR-grade |

## OPEN ITEM (recorded 2026-08-22, Ibrahim — not to be acted on yet)

The published privacy policy grants a right to "object to processing or
withdraw consent for advertising measurement", but the site has **no
mechanism** to exercise it — no banner, no toggle, no opt-out path beyond
emailing privacy@supakoto.com. The stated right is currently serviceable
only manually. This gap closes automatically with Option B/C below; until
then any withdrawal request must be handled by hand.

**Recommendation:** stay on A while campaigns are paused; ship B in the
same change as Meta Advanced Matching if AM is approved (AM materially
strengthens the case for asking first), and before any serious UAE spend.
C only if EU/UK traffic ever becomes a real segment.
