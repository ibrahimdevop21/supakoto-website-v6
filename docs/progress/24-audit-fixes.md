# 24 — Audit fixes (Phases A–E)

Source: `docs/audit/SUMMARY.md` (2026-08-25). Fix order set by Ibrahim 2026-08-25. Sequential, not parallel. Report after each phase.

═══ BRIEF audit-fixes ═══

READ FIRST (in order): docs/CHECKPOINT.md → docs/progress/23-forms-destination.md → docs/audit/SUMMARY.md → the per-area report for the phase in hand.

SCOPE: the 16 numbered items below, in order A→E.
NOT IN SCOPE: the tracking layer (`lib/analytics.ts`, `lib/attribution.ts`, `lib/intent.ts`, pixel loaders, SK-ref chain, `sk-attribution` cookie) — no changes, no refactors, even though pixels are 22–39 % of TBT. `llms.txt` — skipped. Committing `docs/audit/data/` — gitignored instead. Gallery/testimonial *design* beyond what each item needs. Booking-wizard UX items (F2–F9 in report 05) — not in this order; separate brief later.

ROLE REFERENCE: Ibrahim = planner/approver; pushes, merges, deploys only on his explicit word per phase. Claude = executor; local commits.

## LOCKED DECISIONS (override any earlier phrasing)

Phase A — ship today
- LD-A1 Merge `feat/phase-23-forms-destination` (64924d5) into `main`, push, Vercel auto-deploys. **Item 11 (origin check on `/api/forms`) is folded into Phase A** and lands *before* the merge, as Ibrahim allowed ("or fold this into Phase A").
- LD-A2 Deploy proceeds only once `RESEND_API_KEY`, `FORMS_TO_EMAIL`, `FORMS_FROM_EMAIL` are confirmed set on the Vercel project (production env). Without the key the route returns an error — forms would go from "fake success" to "visible failure". Not acceptable to ship blind.
- LD-A3 Event mapping (doc 23, LD-3) stays **unwired** in Phase A — `form_submit` remains GA4-only. Wiring it touches the tracking layer, which is out of scope. Ibrahim's approval of the table is recorded for the tracking branch, not acted on here.
- LD-A4 Testimonials: remove ids 7, 9, 26, 28 (discount/deal/price language) and 16 (flat "10 years warranty" — violates tier-scoping). Mechanism: an allow-list/`exclude` flag in `content/testimonials.ts` respected by `orderedTestimonials()`, plus a guard rule so a banned word in a testimonial fails the build. Every remaining testimonial audited against: no discount/price/deal, no bare warranty figures, no competitor names, no unbranded claims. Report lists what stays.
- LD-A5 Placeholders: `[To be confirmed]` rows in heat-isolation (heat %, UV %) and nano-ceramic (hardness) spec tables are **removed**, not blanked; `franchise.investmentTodo` and its rendering are **removed**. Guard extended: any `[` … `]` bracketed string in `messages/*.json` or `content/*.ts` fails the build.
- LD-A6 TAKAI attribution: `home.services.sub`, `services.index.seoDescription`, gallery alts `surface-marble-table`, `surface-film-roll` rewritten so TAKAI is claimed only for PPF, heat isolation, building heat isolation (confirmed products). Colour-change stays "premium wrap vinyl"; marine/surface unbranded. Guard: `check-claims.mjs` gains a rule that "TAKAI/تاكاي" within N chars of marine/boat/surface/interior/colour-change/wrap terms fails, in both message files and gallery alts.
- LD-A7 Phase A is one branch `fix/audit-a` on top of `main` *after* the Phase 23 merge, so prod gets Phase 23 + A together in one deploy.

Phase B — crawlability
- LD-B1 `Accordion.tsx` always mounts the answer; visibility via `hidden`/`aria-hidden` + height animation, not conditional render. JSON-LD unchanged (now truthful).
- LD-B2 Region: both regions' `TierBreakdown` / `TakaiComparison` render server-side; the inactive one is `hidden` and toggled client-side from the cookie. Default visible region stays Egypt.
- LD-B3 Locale switcher emits the un-prefixed AR path (no `/ar/`), so zero redirects; `next-intl` config unchanged.
- LD-B4 `/authentic` FAQ 1 reverts to white Arabic (`كيف أعرف أن فيلم الحماية أصلي؟`) — this **reverses** the Phase 16 decision to keep the Egyptian question for search intent. Ibrahim's 2026-08-25 order wins. Whole page swept for dialect.
- LD-B5 `Review` nodes removed from `Testimonials.tsx` on all 12 pages. **No `AggregateRating` added** — the 4.8/1570 is Google's listing figure, still self-served on our own site; stays as visible text only. The duplicate `Organization` block that carried the reviews goes with it.

Phase C — security
- LD-C1 Headers via `headers()` in `next.config.ts`: HSTS `max-age=63072000; includeSubDomains; preload`, `X-Frame-Options: DENY` + `frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` minimal.
- LD-C2 CSP ships **enforced**, with an explicit allow-list for the four pixel origins + Google Maps/Leaflet tiles + Vercel; `'unsafe-inline'` for script only if the hand-rolled loaders need it (measured, not assumed). Verified with the e2e-analytics suite — pixels must still fire. If any pixel breaks under enforcement, fall back to `Content-Security-Policy-Report-Only` and report — the tracking layer is not touched to accommodate CSP.

Phase D — performance
- LD-D1 Order 12 → 13 → 14 → 15 exactly. 14 is diagnostic only; fix hours estimated after.
- LD-D2 Gallery virtualisation keeps the documented viewer UX (doc 20): stage, arrows, thumb strip look and keyboard/swipe direction unchanged; only mount count changes. e2e-gallery must stay 44/44.
- LD-D3 `LazyMotion` migration is its own commit series with a full smoke + e2e pass; no other changes mixed in.

Phase E — a11y
- LD-E1 `--color-fg-subtle` raised to ≥ 4.5:1 on ink-800; `--color-sk-red` never used as text on dark — replaced with a text-safe red token. Lifetime qualifier verified ≥ 4.5:1 at its rendered size on `/warranty` and `/services/ppf`.

Housekeeping
- LD-H1 `docs/audit/data/` added to `.gitignore`; the seven reports are committed.
- LD-H2 Every phase ends green: `pnpm build` (all guards), `pnpm lint`, `pnpm typecheck`, `scripts/smoke.mjs`, relevant e2e. Local commits only; push/merge/deploy on Ibrahim's word per phase.

## OPEN QUESTIONS (answer before Phase A can deploy)

- OQ-1 Are `RESEND_API_KEY`, `FORMS_TO_EMAIL`, `FORMS_FROM_EMAIL` set on Vercel → supakoto-website-v6 → Production? Check: `! vercel env ls production --scope ibrahims-projects-89fe7cc4` (or the dashboard). If not, set them first.
- OQ-2 Is `forms@supakoto.com` (or whatever `FORMS_FROM_EMAIL` uses) on a Resend-verified domain? Unverified sender = silent bounce.
- OQ-3 Testimonial 16 ("10 years warranty", flat figure) — confirm removal (LD-A4 proposes yes).
- OQ-4 Franchise investment section — remove entirely (LD-A5), or replace with a one-line "figures on request" sentence?
- OQ-5 LD-B4 reverses your Phase 16 search-intent decision on the Egyptian FAQ question. Confirm.

## PHASES & GATES

| Phase | Halt condition | Unlocks |
|---|---|---|
| A | Origin check + items 2–4 committed on `fix/audit-a`; build/lint/typecheck/smoke green; e2e-forms 163/163 | Ibrahim's "push/merge/deploy" + OQ-1/2 confirmed → merge 23 → merge A → push → live smoke: 5 forms → 5 tagged emails at info@ |
| B | items 5–9 green; crawl + JSON-LD audit clean; JS-off fetch shows FAQ answers + UAE tiers | Ibrahim's word |
| C | headers verified with curl on preview; e2e-analytics green under enforced CSP | Ibrahim's word |
| D | per item: Lighthouse before/after (same machine, 3 runs, median) in the report | Ibrahim's word per item |
| E | axe color-contrast 0 on `/`, `/services/ppf`, `/warranty`, `/booking`; Lighthouse a11y 100 | Ibrahim's word |

GIT DISCIPLINE: `fix/audit-a` … `fix/audit-e`, each off the then-current `main`. Local commits, imperative subjects, body = what/why/verified. No co-author trailers. Push/merge/deploy only on explicit instruction per phase.

SMOKE CRITERIA: per phase above; plus after every deploy `scripts/smoke.mjs` against production and a manual check of the exact audit evidence (e.g. `curl -sI` for headers, JS-off `curl` for accordion answers).

## SHIPPED
(filled per phase)
