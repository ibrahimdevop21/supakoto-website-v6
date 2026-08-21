# CHECKPOINT — 2026-08-22

## TL;DR (2026-08-22, Phase 20 done + verified, awaiting Ibrahim's word)

**Phase 20 (gallery rebuild) is complete and verified on
`feat/phase-20-gallery-viewer` — 4 commits stacked ON TOP of the unmerged
`feat/phase-19-feedback-round-2`, local only.** The static grid is now a
real-estate-style viewer (main stage + overlay arrows + lazy 16:9 thumbnail
strip + fullscreen + keyboard/swipe, RTL direction of travel measured
correct); the full V2 library ships — 202 new photos audited image-by-image
(all watermarked, 12 colour-change wraps found, bespoke AR/EN alts), site
gallery = 243 items; order reshuffles on every page load/refresh (module-scope seed —
sessionStorage survived refreshes, Ibrahim flagged it; stable across
filter toggles + client-side nav); filter row derives from content/services.ts so
marine-ppf (previously missing) renders with a labelled empty state (0
photos); guard #6 `check-gallery-filters.mjs` negative-tested. End gate:
build 6 guards, lint 0/0, typecheck, parity, smoke 196/196, crawl 72 clean,
e2e-gallery 42/42 twice; first-load 0.4–2.1 MB. Brief + report:
`docs/progress/20-gallery-viewer.md`. No local servers.

## Exact next action
PUSHED to GitHub 2026-08-22 on Ibrahim's word (branches only — NOT merged
to main, NOT deployed). Branch stack: main ← feat/phase-19-feedback-round-2
(10 commits, verified) ← feat/phase-20-gallery-viewer (5 commits incl. the
refresh-reshuffle fix, verified). Next: Ibrahim's word on merging the stack
into main (merge 19 then 20, or 20 alone brings both) → Vercel deploy.
Still open from Phase 18: Vercel env vars + pixel check + domain cutover.
HELD unchanged (bdm-flow counter, Supabase V6, marine/surface content).

---

# CHECKPOINT — 2026-08-21

## TL;DR (2026-08-21 evening, Phase 19 done + verified, awaiting Ibrahim's word)

**Phase 19 (feedback round 2 + booking wizard rebuild) is complete and
end-gate-verified on `feat/phase-19-feedback-round-2` — 9 commits on top of
`main` 463831e, NOT merged, NOT pushed.** (Phase 18 IS merged and pushed;
`main` = `origin/main` = 463831e — the 2026-08-19 section below is stale on
that point.) Full brief + approval + shipped table:
`docs/progress/19-feedback-round-2.md`. Shipped: one wizard for all seven
services branching on substrate (building fieldsets shared with the untouched
`/quote` page, enquiry flow for marine/interior, flow-specific
`booking_start`/`quote_start`/`enquiry_start` on service selection,
`enquiry_complete` primary), react-day-picker calendar + branch-hour slots
(10:00–20:00 interim, ops-unconfirmed), heat-isolation renamed «عزل حراري
للسيارات» everywhere, gallery unified 16:9 with 2 duplicates dropped, Maserati
added + Bentley/Porsche white wordmarks, Japan flag fixed + `check-image-refs`
guard, `check-wizard-services` guard, hero-copy crossfade (Hussein's "text not
showing"). A power outage cut the first end-gate attempt; re-run clean:
build (5 guards), lint 0/0, typecheck, i18n parity 1036=1036, smoke 196/196,
e2e-whatsapp 32/32 (after `5a4a20e` harness fix: networkidle → domcontentloaded),
e2e-analytics 130/130 (initial-beacon checks flaked once on third-party SDK
timing, clean on re-run), crawl 72 URLs clean, JSON-LD clean. No local servers.

## Exact next action
Ibrahim reads the Phase 19 report → his word on push/merge of
`feat/phase-19-feedback-round-2`. Still open from Phase 18: the four
`NEXT_PUBLIC_*` env vars on Vercel + post-deploy pixel sanity check + domain
cutover (`docs/progress/CUTOVER.md`). HELD list unchanged (bdm-flow counter,
Supabase V6, marine/surface content+indexing).

---

# CHECKPOINT — 2026-08-19

## TL;DR (2026-08-19, Phase 18 done, awaiting Ibrahim's approval)

**Phase 18 (pre-cutover quick wins + tracking foundation) is complete on
`feat/phase-18-pre-cutover` — 10 commits on top of `main` 92b3b7e, NOT merged,
NOT pushed.** Rev. 2 (testimonials: real Google aggregate 4.8 · 1,570, no
translations, carousel with expand) landed 2026-08-19 afternoon. Report + harvest table + event verification:
`docs/progress/18-pre-cutover-tracking.md`. Contract for Phase 3:
`docs/progress/TRACKING-SPEC.md`. Shipped: V2 testimonials (29, JSON-LD
Review/AggregateRating), footer payment strip (region-aware, V2 logos), five
live social URLs + info@supakoto.com + sameAs, direct pixels through
`lib/analytics.ts` (GA4 / Meta / TikTok / Ads base, env IDs, route-change
pageviews, build guard), full event taxonomy on every tel:/wa.me/form,
`SK-XXXXXX` ref in the WhatsApp message + intent log + attribution.
Green: build (3 guards), lint 0/0, typecheck, i18n parity, smoke 196/196,
crawl, JSON-LD, e2e-whatsapp 16/16, **e2e-analytics 84/84**. No local servers.

## Exact next action
Ibrahim reviews the report (testimonials list, payment methods, consent open
item), sets the four `NEXT_PUBLIC_*` env vars on Vercel (values in
`.env.example`), then says merge/push → cutover per `docs/progress/CUTOVER.md`.
After deploy: Meta Events Manager / GA4 DebugView (`?sk_debug`) / TikTok
Events Manager sanity check.

---

# CHECKPOINT — 2026-08-17

## TL;DR (2026-08-17, start of day)

**Everything through Phase 17 is on `main` (`78830c6`), pushed, and live on
Vercel production (https://supakoto-website-v6.vercel.app) — verified against
production: smoke 196/196, crawl clean (no 404/chains/orphans), JSON-LD clean,
sitemap 44 URLs, marine/surface `noindex, follow`.** Yesterday shipped four
phases in sequence: 15 (Dr. Amer VP feedback: claim corrections, phones, tiles,
white Arabic ×2 rounds), 16 (`/authentic` genuine-TAKAI page + competitor-name
guard), confirmed facts (2016, 25k vehicles, partnerships — provenance in
`lib/site.ts` / `content/partners.ts`), and 17 (technical SEO: `/services`
re-split into seven pages, keyword titles/metas/H1s, sitemap/hreflang, JSON-LD
audit incl. Organization/LocalBusiness/Breadcrumbs, SSR nav submenu links,
footer placeholders removed, `docs/progress/CUTOVER.md`). Tree clean, nothing
unpushed, no local servers.

## Phase ledger
- 0–17: done and deployed (progress docs 00–17).
- **Next: DOMAIN CUTOVER** — Ibrahim's day; runbook = `docs/progress/CUTOVER.md`
  (also read back as a 23-step checklist in the 2026-08-16 session).
- After cutover: Search Console watch (48h), then whatever Ibrahim briefs.

## Decisions (do not re-litigate) — cumulative, see progress docs 15–17
- White Arabic register; claim discipline (7 guard rules in
  `scripts/check-claims.mjs`, spec-level law); PPF never claims heat; TAKAI
  SILVER only in UAE, region-scoped naming; distributor-not-manufacturer;
  no superlatives; no competitor names; documentation "available on request".
- One URL per service intent (`/services/<slug>`); marine + surface noindex via
  `NOINDEX_SERVICE_IDS` until TAKAI confirms; sitemap derived, both locales as
  own entries; `NEXT_PUBLIC_SITE_URL` is the single canonical switch.
- Phones: Egypt regional line 01103402446 stays; UAE regional = Dubai branch.
- Facts confirmed by Ibrahim 2026-08-16: founded 2016; 25,000 vehicles baseline
  (live counter later = baseline + bdm-flow delta); partners Škoda / Kasrawy /
  Mansour.

## HELD (never auto-resume)
- Live vehicles counter fed by bdm-flow (constraint recorded in `lib/site.ts`).
- Supabase for V6 ("later"; no project exists; never touch bdm-flow).
- Marine / surface product content + indexing (pending written TAKAI confirmation).
- Inline-SVG Japan flag; TikTok/YouTube/LinkedIn URLs (icons hidden until supplied).

## The law
- Phone digits only in `content/regions.ts` / `content/branches.ts` (guard).
- Never edit `check-claims.mjs` to make a claim pass. Never invent product codes.
- Lifetime only on /warranty, /services/ppf, Premium Plus card, with qualifier.
- Local verification: `pnpm build` → `PORT=3111 pnpm start` → `node scripts/smoke.mjs`,
  `crawl.mjs`, `jsonld-audit.mjs`, `e2e-whatsapp-routing.mjs`. Kill servers with
  `pkill -f "^next-server"` (NOT `-x`); never run `pnpm dev` and `pnpm start` from
  the same checkout.

## Exact next action
Cutover is Ibrahim's manual day (Vercel domains → DNS → verify → Search Console).
If a session opens before that: /orient, then wait for the brief. If it opens
after: run the three scripts with `BASE=https://supakoto.com` and report.

---

# CHECKPOINT — 2026-08-16

## TL;DR (2026-08-16, evening)

**Phase 15 (Dr. Amer VP feedback round) is fully shipped: merged to `main`
(`06b55db`), pushed, Vercel production deployed and smoke-verified 97/97
against https://supakoto-website-v6.vercel.app.** Follow-up commit `4db2fc2`
(confirmed founding year + 25k baseline provenance) also on `main`, pushed.
Tree clean, nothing unpushed, no local servers running. What shipped: the
three claim corrections (PPF never claims heat; TAKAI SILVER ≠ TAKAI 5 with a
region-aware `/warranty` breakdown; distributor-not-manufacturer framing),
standing claim-discipline rule + `scripts/check-claims.mjs` (6 rules, runs in
`pnpm build`), all six branch phone numbers replaced + UAE regional line
unified (E2E 16/16), home feature tiles photographed, and the **white Arabic
(عربية بيضاء) register** applied across `ar.json` in two review rounds
(CLAUDE.md rule replaced). Supabase MCP authed but parked (no V6 project;
bdm-flow is off-limits).

## Phase ledger
- 0–14: done (see progress docs 00–14).
- **15 — VP feedback round: DONE, deployed** (`docs/progress/15-vp-feedback-round.md`
  has the full execution log, the 103-string Arabic review table, overrides, and
  the pre-merge verification).
- Next phase: none briefed. Candidates parked by Ibrahim: Supabase for V6
  (later), live vehicles counter (see HELD).

## Decisions this session (do not re-litigate)
- Arabic register = **white Arabic** (supersedes Egyptian dialect and plain MSA).
- PPF / Premium Plus never claims heat, IR/UV or cabin benefit; the heat-isolation
  service never claims paint protection.
- UAE product is **TAKAI SILVER only**; product names are region-scoped; `/warranty`
  and the home TAKAI table render one region at a time (RegionPicker).
- SupaKoto = exclusive **distributor**; TAKAI manufactures for the market.
- No superlatives (best/finest/number one/أفضل/الأول) on brand/product/quality/price.
- Shared surfaces don't assume "your car"; service sections and the vehicle-only
  booking funnel keep substrate language. `home.title` = «سوباكوتو — حماية يابانية أصلية».
- Phones: Egypt regional line **01103402446 stays** (dedicated, not Alexandria's);
  UAE regional line = Dubai branch number **by design**; old 050 line retired.
- Confirmed facts (Ibrahim, 2026-08-16): founded 2016; 25,000 vehicles baseline;
  partnerships Škoda / Kasrawy / Mansour. Provenance in `lib/site.ts` and
  `content/partners.ts`.
- Second-reviewer items Ibrahim REJECTED were not applied (hero «ما تملكه»,
  «لفئات أخرى», «تضم», «منفذة بعناية», «من دون» on policy pages).

## HELD (approved to wait — never auto-resume)
- **Live vehicles counter** fed by bdm-flow — future phase. Constraint recorded in
  `lib/site.ts` (`CARS_PROTECTED`): bdm-flow launched 2026-06-01 with no history,
  so it must be fixed baseline + live delta, never a raw query.
- Supabase for V6 — "later" (Ibrahim). No V6 project exists; do not create one
  unasked; never touch bdm-flow.
- Marine PPF / interior surface protection: still pending-product, no TAKAI codes.
- Inline-SVG Japan flag (nice-to-have; WebP is live).

## The law (frozen unless Ibrahim says otherwise)
- Only `content/regions.ts` and `content/branches.ts` carry phone digits (guard).
- `scripts/check-claims.mjs` rules are spec-level law; editing the guard to make a
  claim pass is itself a violation. Never invent product codes (SK-BLD precedent).
- Lifetime warranty text only on `/warranty`, PPF section, Premium Plus card, with
  the qualifier in the same block.
- Never run `pnpm dev` and `pnpm start` from the same checkout (a stray dev server
  overwrote `.next` mid-verification today).

## Exact next action
Nothing in flight. When Ibrahim brings the next item: run /orient (read this file +
`docs/progress/15-vp-feedback-round.md` + `git log -5`), then sprint-brief it if it
has 2+ requirements. Verification tooling to reuse: `pnpm build` (guards),
`node scripts/smoke.mjs` (needs `PORT=3111 pnpm start`), `node scripts/e2e-whatsapp-routing.mjs`.

---

# CHECKPOINT — 2026-08-15

## Update 2026-08-15 (~1am): smoke pass GREEN, everything pushed

Ibrahim green-lit push conditional on tests. Automated combined smoke
pass executed against a fresh production build (43/43 checks passed:
all key routes 200 in both locales with correct dir, all 12 Phase 14
redirects + polishing redirects, all 7 anchors, lifetime scoping
clean, TAKAI table on home, no product codes in pending marine/
surface sections, TK-7099-IR present for building). Then pushed:
`main` (11be7a9→794d0a5, **Vercel will auto-deploy this** — the
merged buildings + home-first-screen state, WITHOUT phases 13–14),
plus new remote branches `feat/services-restructure`,
`feat/building-heat-isolation`, `feat/home-first-screen`. The smoke
gate below is SATISFIED. Remaining decision: merge
`feat/services-restructure` → `main` (which then deploys phases
13–14 to production) — Ibrahim's word. Smoke script kept at the
session scratchpad (`smoke.py`); all local Next servers stopped.

---

# Previous checkpoint — 2026-08-14

## TL;DR (2026-08-14, ~9:50pm)

Phase 14 shipped and committed on `feat/services-restructure`
(`c9502a1`): all 7 services now live on **one anchored `/services`
page** (ServiceShowcase), the six old detail URLs 308-redirect to
`/services#<id>` in both locales, the header dropdown collapsed to a
leaf link, and `/services/building-heat-isolation` stays live as the
SEO landing page with its `/quote` funnel. Real SupaKoto × TAKAI
watermarked photography is integrated for marine, building
heat-isolation, and surface protection. Build 42/42 green, lint has
one pre-existing warning (unused `t` in BranchGrid.tsx), smoke on all
service routes passed in both locales. The warranty "lifetime"
scoping rule was audit-verified: 1 visible qualifier on
`/en/services` (Premium Plus card; second site inside the collapsed
specs accordion), 0 visible on the homepage — extra raw-HTML hits are
RSC/next-intl script payload, not rendered copy. Tree clean.

Note: the previous checkpoint (2026-08-11) predated the merges; this
doc supersedes it. Git is truth: both old feature branches are merged
into local `main`.

## Branch ledger

| Branch | State | Gate |
|---|---|---|
| `main` (local) | `794d0a5`, both feature branches merged, **19 commits ahead of origin/main, NOT pushed** | Combined smoke pass → Ibrahim's push word |
| `feat/services-restructure` | 6 commits off `main`, ends `c9502a1`, tree clean, local only (no upstream) | Combined smoke pass → Ibrahim's merge word |
| `feat/building-heat-isolation`, `feat/home-first-screen` | merged into local `main`; branches kept | Deletable at Ibrahim's word |

`feat/services-restructure` commits: efab580 restructure (7 services,
polishing removed) → 02b0602 TAKAI comparison table on home →
32d06a1 heat-isolation copy fix → 3a68f99 + 97ab97d real photography
→ c9502a1 Phase 14 one-page consolidation.

## Decisions this session (Ibrahim, 2026-08-14)

1. **One-page services** (Phase 14): no per-service sub-nav; all
   services as sections on `/services`, order ppf →
   building-heat-isolation → marine-ppf → heat-isolation →
   colour-change → nano-ceramic → surface-protection. Open questions
   delegated ("use your judgment") — locked list in
   `docs/progress/14-services-one-page.md`.
2. `/services/building-heat-isolation` deliberately survives as a
   standalone SEO keyword entry point + quote funnel.
3. **Gallery imagery policy:** only SupaKoto × TAKAI watermarked
   photos on the site; unwatermarked/stock stays out (also in
   auto-memory).
4. CLAUDE.md warranty allowed-surfaces list amended:
   `/services/ppf` → "PPF section of `/services`".

## HELD (approved to wait — never auto-resume)

- **Push of local `main` / merge of `feat/services-restructure`:**
  Ibrahim's explicit word only, and only after the combined smoke
  pass below.
- **Marine PPF + surface protection are pending-product**: NO
  confirmed TAKAI line — never add codes/specs/warranty for them
  (SK-BLD class error). Launch of those sections' full content is
  blocked on written TAKAI confirmation.
- Owner TODOs: (founding year 2016 — CONFIRMED 2026-08-16), social URLs, branch
  hours, franchise figures, RH-Zak licence.

## The law (frozen constraints)

- Arabic default locale at `/`, MSA register; phone numbers LTR.
- "Lifetime" renders only on `/warranty`, the PPF section of
  `/services`, and the Premium Plus tier card — always with the
  qualifier from `content/warranty.ts` in the same visual block.
- Watermarked photography only. Framer Motion only. No reference-site
  content. No co-author trailers.

## Next action (exact)

Run the **combined smoke pass** owed since the 2026-08-11 merge-first
sequencing: use the `smoke-checklist` skill against
`feat/services-restructure` (dev server, both locales), covering the
merged buildings + home-first-screen work AND the services
restructure — progress doc 13 lists which smoke-checklist-v2 items
the restructure invalidated, doc 14 lists what Phase 14 changed.
Output: a checklist Ibrahim (or Shahad) can execute. After it passes,
Ibrahim decides merge of `feat/services-restructure` → `main` and
push.

## Tomorrow start here

Run /orient, then generate the combined smoke checklist
(smoke-checklist skill) for `feat/services-restructure` — it gates
the merge to main and the push of the 19 waiting commits.
