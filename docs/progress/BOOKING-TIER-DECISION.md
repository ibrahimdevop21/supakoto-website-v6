# Decision memo — should the booking wizard capture the film tier?

*Raised by Hussein in the 2026-08-21 feedback round. Drafted 2026-08-21 as
Phase 0 of `19-feedback-round-2.md`. **Decision: Ibrahim's. Nothing in the
wizard changes until he picks an option.***

## TL;DR

Today the wizard books an appointment for a *service* (PPF, heat isolation,
colour change, nano ceramic); the film tier is chosen at the branch. bdm-flow,
however, already records the booking's `service` **as the tier label**
(`'Takai 5' | 'Gold' | 'Gold Plus' | 'Steel' | 'Steel Plus' | 'Heat Isolation' |
'Annual Maintenance' | 'Others'`) — so the CRM side of the funnel is tier-shaped
and the website side is not. Capturing tier would close that gap at the cost of
one more step asked of someone who has not yet seen the film. Recommendation at
the end: **O2 (optional, skippable "interested in" step)** — but it is a
product call, not an engineering one.

## (a) Current state

| | Website wizard (`components/forms/BookingWizard.tsx`) | bdm-flow (`~/Desktop/bdm-flow`) |
|---|---|---|
| What "service" means | Catalogue id from `content/services.ts`: `ppf`, `heat-isolation`, `colour-change`, `nano-ceramic` | `lib/services.ts` `SERVICES` — **the PPF tier is the service**: `Takai 5`, `Gold`, `Gold Plus`, `Steel`, `Steel Plus`, plus `Heat Isolation`, `Annual Maintenance`, `Others` |
| Tier field | none | none separate — `bookings.service` text carries it |
| Price fields | none | `bookings.amount` (agreed price, single source of truth since migration `20260531044800_unified_booking_amount_audit_and_mirror.sql`, mirrored to `workshop_jobs.actual_amount`) and `deposit`; both written by agents, **no price-list table exists** |
| Write path | WhatsApp deeplink + client-side intent log (`SK-XXXXXX` ref); no RPC call | `public.create_booking(p_payload jsonb, p_force_confirmed boolean)` (`20260725220300_create_booking_vin_passthrough.sql`) — `SECURITY DEFINER`, **requires an authenticated CRM user**; payload: `branch_id` uuid, `service` text, `customer_name`, `customer_phone`, `appointment_date`, optional `car_model`, `vin_last8`, `amount`, `deposit`, `notes`, `idempotency_key` |
| Tier catalogue on the site | `content/takai.ts` — UAE Signature line (SILVER, MATT, MATT PLUS, Colours, ULTIMATE GLOSS, STEELPLUS, PREMIUM PLUS) and Egypt Performance line (TAKAI 5, GOLD, GOLD PLUS, STEEL, STEEL PLUS, PREMIUM PLUS) | Egypt Performance names only, no PREMIUM PLUS, no UAE line |
| Warranty | **tier-scoped by law** (CLAUDE.md, `content/warranty.ts`): standard tiers "up to 15 years", Premium Plus "lifetime" + qualifier, never a single site-wide figure | `lib/schemas/index.ts` `WARRANTY_PRODUCTS` carries per-product `duration_years` (5/10/10/15/15, heat isolation 10) for the warranty PDF — CRM data, **not** site copy |

What the wizard captures today, in order: region → branch → service → car make/model
→ date → time → name/phone → confirm. (Phase 19 moves service to step 1 and adds
building/enquiry flows; none of that touches tier.)

## (b) What capturing tier would give

1. **Lead data that matches the CRM.** A booking arriving as «PPF» makes the agent
   ask the tier question on WhatsApp anyway; «PPF — interested in TAKAI STEEL»
   lands straight into `bookings.service` when the Phase-3 write path
   (`docs/progress/TRACKING-SPEC.md`) replaces the WhatsApp handoff. Mapping is
   trivial for Egypt (site tier names = bdm-flow labels minus the "TAKAI "
   prefix) and **undefined for the UAE line** (no SILVER/MATT/ULTIMATE labels in
   bdm-flow — `Others` today).
2. **Pre-pricing.** Only partly: bdm-flow has no price list, just the agreed
   `amount` per booking. Showing a price *range* at booking would need a new
   tier × coverage × region price table (bdm-flow or `content/`), owned by ops,
   with currency per region (`regions.ts`). Without that table the "pricing"
   benefit is zero.
3. **Conversion signal.** `booking_complete` gains a `tier` param (and `value` /
   `currency` once a price table exists) → GA4 `generate_lead` value, Meta `Lead`
   `content_name`/`value`, TikTok `SubmitForm` value. Lets ads optimise toward
   higher-tier intent instead of any booking. This is the benefit that survives
   even without pricing.
4. **Capacity nuance.** bdm-flow caps heat isolation separately from the main
   daily cap (`HEAT_ISOLATION_SERVICES`, `add_heat_isolation_cap_to_branches`).
   Tier does not change that; service already does.

## (c) Costs and risks

| Cost | Why it matters here |
|---|---|
| One more step | Wizard is one-question-per-screen; every screen measurably drops completion (`booking_step` will show exactly how much once live). |
| Choosing before seeing the film | The branch sale works because the customer touches the sample; asking online invites the cheapest pick or a wrong one, then a re-sell at the branch that feels like an upsell. |
| Anchoring | A list starting at TAKAI 5 / TAKAI SILVER anchors low. Mitigation: list order + "recommended" marker are marketing decisions Dr. Amer must approve. |
| Regional SKU split | UAE = Signature line, Egypt = Performance line, PREMIUM PLUS in both (`content/takai.ts`). TAKAI SILVER must never be shown as, or next to, TAKAI 5 (Dr. Amer 2026-08-16). The tier step must render **the selected region's line only**. |
| Warranty framing | Any tier card in the wizard that mentions warranty must carry the tier-scoped term and, for Premium Plus, the lifetime qualifier in the same block — and the wizard is **not** one of the three routes allowed to say "lifetime" (`LIFETIME_ALLOWED_ROUTES`). Simplest: tier step shows names only, no warranty text. |
| Only PPF has tiers | Heat isolation, colour change, nano ceramic have packages (`packageKeys`) but no tier ladder. Step would be PPF-only; other services skip it. |
| Data honesty | If the customer changes tier at the branch (the expected case), the site's `tier` becomes "interest", not "sale". Reports must label it as such. |

## (d) Options

| | O1 — leave as is | O2 — optional "interested in" step (PPF only) | O3 — mandatory tier + price range |
|---|---|---|---|
| What the customer sees | Nothing new | After service = PPF: the region's tier names as choice buttons + **«لست متأكدا — انصحوني في الفرع» / "Not sure — advise me at the branch"** (default-selected, Next always enabled) | Tier required; each card shows a from–to price in EGP/AED |
| What changes in data | — | WhatsApp line «الفئة: TAKAI STEEL» / «الفئة: أنصحوني في الفرع»; `booking_complete.tier` param; intent log field; TRACKING-SPEC + `e2e-analytics` cases | All of O2 + `value`/`currency` on the conversion; `bookings.service` set from tier in the Phase-3 write path |
| Dependencies | — | `content/takai.ts` (exists), messages ×2, guard for region-scoped names | A price table that does not exist anywhere; ops owner; approval of published prices (brand rule: never "best price"); bdm-flow write path (post-launch) |
| Risks | CRM keeps re-asking | Low — skippable, names only, no warranty text | High — price talk on the site, anchoring, stale prices, UAE mapping gap |
| Build estimate | 0 h | **~6 h** (step + messages + event param + spec + e2e + smoke at 390px, both locales) | **~20 h site** + price-table design/ops process + Phase-3 integration (not started) |
| Reversible | — | Yes — one step behind a flag | Partly — published prices are hard to un-publish |

## Recommendation (engineering view — Ibrahim decides)

**O2.** It gives the conversion signal and the CRM alignment without forcing a
choice, and the default "advise me at the branch" keeps the sale where it works.
Ship names only (no warranty, no price), region-scoped list, PPF only. Revisit O3
only if ops wants prices on the site at all — that is a brand decision first and
a data-table decision second.

If O1: no action; close Hussein's note as "intentional — sale at the branch".

If O2 or O3: brief it as its own phase; it is explicitly **not** part of Phase 19.
