# Phase 18 — pre-cutover: quick wins + tracking foundation

*Brief from Ibrahim, 2026-08-19. Autonomous, no gates, one commit per item,
one report at the end. Branch: `feat/phase-18-pre-cutover`.*

Context: the V2 tracking audit (`supakoto-Website_V2_Prod/docs/TRACKING-AUDIT.md`)
found GTM-PKSH2C5K had zero custom-event triggers — every `dataLayer.push`
was ignored and Meta/GA4/TikTok only ever received PageView. V6 uses direct
pixels in the repo, no tag manager.

## Plan

| # | Item | Deliverable |
|---|------|-------------|
| 1 | Testimonials (harvest from V2 `src/data/testimonials.ts`, 30 entries) | `content/testimonials.ts` (typed, ar+en, source), `components/sections/Testimonials.tsx`, placement home (4) / service pages (2, service-filtered) / about, aggregate rating from `content/branches.ts`, JSON-LD Review + AggregateRating for displayed items only |
| 2 | Payment methods | `content/payments.ts`, fill `TrustBadges` (region-aware), logos harvested from V2 `public/payment/` → `public/payment/*.webp` |
| 3 | Social + email | five social URLs in `lib/nav.ts`, `info@supakoto.com` in footer + /contact, `sameAs` on Organization JSON-LD |
| 4 | Direct pixels | `lib/analytics.ts` (single `track()`), `components/providers/Analytics.tsx` (afterInteractive, route-change pageviews), IDs from `NEXT_PUBLIC_*` env, `scripts/check-analytics-calls.mjs` build guard |
| 5 | Event taxonomy | page_view, service_view, booking_start/step/complete, quote_start/complete, whatsapp_click, call_click, branch_view, form_submit — wired into every tel:/wa.me element and form; Meta/TikTok standard-event mapping |
| 6 | Ref IDs | `SK-XXXXXX` at booking_complete / quote_complete, on its own labelled line in the WhatsApp message, stored in the intent log with UTMs/referrer/fbclid/gclid, `docs/progress/TRACKING-SPEC.md` contract for Phase 3 |
| 7 | Checks | placeholder `wa.me/20123456789` absent, no untracked tel/wa, no un-hydrated interactive component, consent flagged as open |

## Execution log

(filled as items land — see the final report in this file)
