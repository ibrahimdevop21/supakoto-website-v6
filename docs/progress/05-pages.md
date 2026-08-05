# Phase 5 — Pages

## Plan

Build order per BUILD-BRIEF: home → services (+5 details) → branches →
about → warranty (+claim) → gallery → booking → franchise/business →
faq/contact/careers/privacy/terms. Verify (build/lint/tsc) after each group.

Shared pieces first:
- `Placeholder` — clearly-labelled placeholder media block (all imagery is
  pending per ASSETS-NEEDED.md).
- `PageHero` — inner-page opener that clears the fixed header.
- `CtaBand` — wide booking CTA reused across pages.
- `StubForm` wrapper — client form that fakes submit locally and shows the
  page's success/stub note; real endpoints land with integrations.

Route notes:
- Home: hero carousel (6s autoplay, Ken Burns 12s scale 1→1.06, reduced-
  motion safe), services snap rail, know-more band, 9-item work preview,
  2×2 feature grid (warranty tile tier-neutral), business split band.
- Services detail: one template for all 5 (problem → solution → spec table →
  before/after slider → packages → FAQ → CTA). Premium Plus lifetime card
  renders ONLY on PPF and always with the qualifier block from
  `content/warranty.ts`.
- Branches: RegionPicker-filtered card grid; Damietta carries the franchise
  badge (decision: yes, badge ships — honesty beats polish; flagged in
  progress notes for Ibrahim to veto).
- Warranty: tier comparison from `content/warranty.ts` with honest TODO
  cells + qualifier block adjacent to every lifetime cell.
- Booking: 8-step wizard (Region → Branch → Service → Car → Date → Time →
  Contact → Confirm), progress bar, submit stubbed — bdm-flow contract not
  wired in this environment; mismatch/contract notes recorded below.
- Gallery: category-filtered grid + Lightbox, placeholder media.
- Remaining pages: standard composition from primitives + messages.

## What shipped

All 15 routes, both locales, all SSG:

- **Home**: hero carousel (5 slides, 6s autoplay, Ken Burns drift, the only
  infinite loop on the site), services snap rail, know-more CTA band, 9-item
  work preview, 2×2 feature grid (warranty tile tier-neutral), business
  split band.
- **Services**: index with alternating full-width rows; one detail template
  ×5 (problem → solution bullets → spec table on paper tone → before/after
  range slider → packages → FAQ accordion → CTA). Premium Plus lifetime card
  renders only on PPF with the qualifier in the same block; PPF spec table
  carries the qualifier note too.
- **Branches**: region-filtered card grid; Damietta ships the franchise
  badge (decision recorded — Ibrahim can veto); Directions links instead of
  maps embeds until coordinates are verified (embed risk with approximate
  addresses).
- **About**: logo lockup band (light/dark pair), story, 4-up counters
  (4th stat honest TODO), V/M/V cards, CTA.
- **Warranty**: no figure in the hero; tier table from `content/warranty.ts`
  with honest TODO cells; qualifier block adjacent to the lifetime cell;
  4 registration steps; claim CTA; FAQ including "إيه اللي بيلغي الضمان؟".
- **Warranty claim**: full form (plate/branch/invoice date/issue/photos),
  stubbed submit with visible stub note.
- **Gallery**: filter chips (All/5 services/Video), staggered grid,
  Lightbox with RTL-aware keyboard nav.
- **Booking**: 8-step one-question wizard with progress bar, region-filtered
  branches, validation per step, summary + confirm, stubbed submit.
- **Franchise**: full 7-part funnel (investment band = honest TODO).
  **Business**: 3 segments + quote form. **FAQ/Contact/Careers/Privacy/
  Terms**: standard builds; complaint absorbed as contact subject.
- Localized 404.

## bdm-flow booking contract — documented mismatch (stop-and-ask #4)

Read from `~/Desktop/bdm-flow/supabase/migrations`:
`public.create_booking(p_payload jsonb)` expects `branch_id` (uuid),
`service` (label text, e.g. 'Heat Isolation'), `customer_name`,
`customer_phone`, `appointment_date` (date), optional `car_model`, `amount`,
`deposit`, `notes`, `idempotency_key`. Capacity is enforced inside the RPC
per branch/date. **Mismatches for a public site client:**
1. The RPC is SECURITY DEFINER **for authenticated CRM users** — it reads
   `v_role`/`v_user_id` from auth, and a migration explicitly revokes anon
   read on bookings/users. There is no anonymous write path today.
2. No time-slot column — `appointment_date` only. Our wizard's Time step
   has nowhere to land (could go into `notes`).
3. Branch mapping: site uses slugs, bdm-flow uses branch UUIDs — needs a
   lookup (branches table has a `code` column that could carry our slugs).
Submit is stubbed per the brief. Unblock options for Ibrahim: a public
Edge Function / API route holding a service key that calls the RPC with a
dedicated "website" user, or an anon-callable wrapper RPC.

## Verification

`pnpm build` ✓ (all 40 page instances SSG) · `pnpm lint` ✓ · `tsc` ✓ ·
smoke script: 40/40 pages fetch, every page has an h1, zero "lifetime"
leaks outside /warranty and /services/ppf ✓

## Outstanding

- Maps embeds deferred until verified coordinates (Directions links live).
- Booking Time step is UI-only until the write path exists.
- All imagery is labelled placeholders (ASSETS-NEEDED.md).
