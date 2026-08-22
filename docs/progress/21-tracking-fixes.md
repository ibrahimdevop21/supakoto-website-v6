# Phase 21 — tracking fixes from the 2026-08-22 audit

*Brief from Ibrahim's ranked work order (2026-08-22, autonomous). Source:
`TRACKING-AUDIT-V6.md` defects #1, #4, #3 + spec drift.*

## SCOPE
1. **Stub forms stop firing platform conversions.** `form_submit` becomes
   GA4-only (internal funnel event); nothing to Meta, TikTok, or Ads while
   submissions are discarded locally. Spec gains the requirement: when a
   form is wired to a real destination it gets an SK-ref + dedup key like
   the three completions.
2. **Attribution → first-party cookie, 30 days, first touch wins.** UTM /
   fbclid / gclid / referrer capture moves from sessionStorage to a
   `sk-attribution` cookie, Max-Age 30 days. A later visit NEVER
   overwrites (pure first-touch — Ibrahim's override of the Phase 18
   "new campaign overwrites" rule). Intent log keeps embedding it.
3. **GA4 enhanced measurement** — property-side; exact toggles listed in
   the final report (no code).
4. **Spec stale lines:** `IntentEntry.kind` gains `"enquiry"`; ref
   generation sentence gains enquiry_complete.
5. **Report only, no build:** Meta Advanced Matching requirements →
   `docs/progress/META-ADVANCED-MATCHING.md`.

## NOT IN SCOPE
Gallery tracking (Ibrahim decides separately). CAPI. Any AM code.

## LOCKED DECISIONS
- LD-1 `form_submit` GA4 mapping unchanged (`form_submit` event); Meta /
  TikTok branches removed from that case in `lib/analytics.ts` with a
  comment stating the re-arm condition (persisted submissions + ref).
- LD-2 Cookie: `sk-attribution=<URI-encoded JSON>`, `Max-Age=2592000`,
  `Path=/`, `SameSite=Lax`, `Secure` when served over https. Same
  `Attribution` shape, same reader API. No sessionStorage migration (the
  window it would save is one session).
- LD-3 e2e-analytics updated to assert the ABSENCE of Meta/TikTok beacons
  on form submits, and first-touch cookie persistence (second landing with
  new UTMs does not overwrite).
- LD-4 Branch `feat/phase-21-tracking-fixes` off `main`; local only, no
  push/merge until Ibrahim's word.

## SMOKE
- Submit each of the 5 stub forms: GA4 `form_submit` fires; zero
  facebook.com/tr and zero analytics.tiktok.com event requests.
- Land with `?utm_source=A&fbclid=F1` → cookie set with 30-day expiry;
  revisit with `?utm_source=B&gclid=G2` in the SAME context → cookie still
  A/F1; complete a booking → intent entry carries A/F1.
- Completions still send Meta Lead + eventID=ref (untouched path).
- Guards, build, lint, typecheck, e2e-analytics green.

## SHIPPED
(fill at end)
