# Phase 10 — Building heat isolation service

Approved brief: building heat isolation as a sixth service in the existing
line (substrate: building), NOT a separate vertical. Spec source of truth:
`docs/STRUCTURE-SPEC.md` (amended 2026-08-07). Branch:
`feat/building-heat-isolation`.

## Locked decisions

1. `content/services.ts` gains `substrate: "vehicle" | "building"`; buildings
   is a sixth entry; automotive-only surfaces filter on `vehicle` — buildings
   never appears in the booking flow.
2. Home rail: العازل الحراري becomes a dual-destination card (للسيارات /
   للمباني), no new tile.
3. **Both regions** (Ibrahim, 2026-08-07): governorate (EG) + emirate (UAE)
   options in the quote form; wa.me routes by the selection, overriding the
   RegionPicker. Body language follows the ACTIVE LOCALE (/en English, /
   Arabic) — same rule applied to BookingWizard (Correction B).
4. No phone literals — all lines from `content/regions.ts`; guard stays
   authoritative.
5. Warranty: buildings = **10 years** per TAKAI catalogue (TK-7099-IR). Own
   row, not a vehicle tier. No "lifetime" on the new routes.
6. Gallery: Buildings filter ships with labelled "photography coming soon"
   placeholder; never car images.
7. /business links into the canonical page; the line is B2C + B2B, not
   B2B-only.
8. Buildings page template diverges: no packages, no before/after, no booking
   CTA — problem / solution / funnel / quote CTA.
9. Nav gains خدماتنا / Services dropdown (all six + index) — services were
   never nav-reachable before; buildings gets its own direct entry.
10. Single SKU TK-7099-IR; no other TK- codes; honest positioning — clarity
    WITH heat rejection, never "maximum heat rejection". No privacy claims,
    no privacy option in the form.
11. SK-BLD was fabricated — deleted repo-wide (5 occurrences); never
    reintroduce.

## Plan

- P1 ✅ spec amended + SK-BLD purge (this commit)
- P2 catalogue + routes + service page + quote form + SEO/JSON-LD
- P3 nav dropdown + 8 surface updates + BookingWizard language fix
- P4 ASSETS-NEEDED (BUILDINGS PHOTOGRAPHY), placeholders, verification green

## Shipped

(updated as phases land)
