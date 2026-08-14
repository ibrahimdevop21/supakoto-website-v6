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
- Owner TODOs: founding year 2016 vs 2018, social URLs, branch
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
