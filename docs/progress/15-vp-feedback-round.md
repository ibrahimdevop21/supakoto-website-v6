# Phase 15 — VP feedback round (Dr. Amer), 2026-08-16

Status: **EXECUTING — approved 2026-08-16 in fully autonomous mode** (no gates,
overrides recorded below). Order: A claims (2,3,6,7) → B data/assets (4,5,8) →
C white Arabic (1).

## Execution log

### Group A — claims (items 2, 3, 6, 7) + item 5 (folded in so the new guard is green from its first commit)
- **Item 2:** no Premium-Plus/PPF heat claim existed in V6 (see findings). Added
  spec rule (STRUCTURE-SPEC → "Claim discipline" §2), `scripts/check-claims.mjs`
  heat-in-ppf rule (PPF/TAKAI/warranty/home.takai/home.features.takai keys;
  self-healing keys whitelisted; buildings block excluded), wired into `pnpm build`.
  Copy: hero s2 dropped "and paint" (both locales); `takai.lines.performance.tagline`
  ("built for high-heat markets") neutralised to "High-strength protection for
  everyday driving" — key was never rendered anywhere, kept for parity.
  **Recorded:** the claim most likely lives on the LIVE supakoto.com (V2_Prod) or in
  sales material; V6 being clean does not mean it is not out there.
- **Item 3:** removed all six equivalence sites (takai.ts altName field+value+comment,
  warranty.ts comment + `"TAKAI SILVER (TAKAI 5)"` → `"TAKAI SILVER"`,
  `warranty.breakdown.note` deleted en+ar, TakaiComparison altName render).
  **OQ-3 override applied:** `/warranty` breakdown is now region-aware —
  new `components/sections/warranty/TierBreakdown.tsx` (client, `useRegion`) +
  `tierBreakdownForRegion()`; shows one region's list + the RegionPicker hint.
- **Item 6:** rewrote `home.features.takai.sub` and `about.whoWeAre.body` in both
  locales to distributor framing; grep for all listed variants → 0 (the only hit,
  franchise "workshop fit-out to our spec", is not about the film and the guard is
  scoped to film/TAKAI context). Guard rule `distributor-not-manufacturer`.
- **Item 7:** standing traceability rule added to STRUCTURE-SPEC §1 (SK-BLD precedent).
- **Item 5:** `Flag_of_Japan.svg.webp` (960×640 WebP) → `public/images/brand/flag-japan.webp`,
  rendered via `next/image` in the /about stat; `about.stats.exclusive.value` removed
  from both locales; guard rule `emoji-flag` (regional-indicator range) → repo clean.
- Guard also enforces lifetime scoping (allowed namespaces only) so the "lifetime
  guard" Ibrahim referenced is now a real script, not a convention.
- Green: typecheck, lint (1 pre-existing BranchGrid warning), build, both guards.


═══ BRIEF vp-feedback-round-1 ═══

## READ FIRST (in order)
1. `CLAUDE.md` — Content rules (Arabic register line is being replaced by this brief)
2. `docs/STRUCTURE-SPEC.md` — `/about`, `/services`, `/warranty` sections
3. `content/warranty.ts` header comment (lifetime scoping law) and `content/takai.ts`
4. `content/regions.ts` + `content/branches.ts` + `scripts/check-phone-literals.mjs`
5. `docs/progress/14-services-one-page.md` (current services architecture)

## SCOPE
Six items from Dr. Amer's review. Items 2, 3, 6 are **claim corrections = blocking**;
they ship first, before the Arabic rewrite.

| # | Item | Class |
|---|------|-------|
| 2 | Premium Plus / PPF must carry no heat-isolation claim | claim correction |
| 3 | Delete "TAKAI Silver = TAKAI 5" equivalence; UAE says Silver only | claim correction |
| 6 | `/about` (and any other surface): distributor framing, not "made for us" | claim correction |
| 4 | Branch phone numbers — full replacement (regions.ts frozen) | data |
| 5 | Replace 🇯🇵 emoji with image asset; no emoji flags anywhere | asset |
| 1 | Arabic register → White Arabic; CLAUDE.md first, then ar.json rewrite | copy |

**NOT IN SCOPE:** any change to `content/regions.ts` (frozen until Ibrahim confirms
the new main Egypt line); TAKAI spec values; warranty terms/years; marine/interior
pending-product pages (still blocked); English copy beyond the three claim fixes;
push/merge/deploy.

## FINDINGS FROM THE CODE (what the brief is built on)

**Item 2 — Premium Plus / heat.** Searched all 43 heat/UV/IR strings in each locale,
plus `content/`, `components/`, `app/`, docs, and git history. **There is no
statement in the current codebase that Premium Plus (or PPF) provides heat
isolation.** The only heat mentions in PPF contexts are:
- `services.items.ppf.solutions.b1` — self-healing "with heat" (physically correct,
  not an isolation claim; keep)
- `warranty.rows.selfHealing.value`, `faq.items.selfHealing.a` — same (keep)
- `takai.lines.performance.tagline` — "built for high-heat markets like the Middle
  East" (durability framing, not isolation; borderline — see OQ-2)
- `home.hero.slides.s2.sub` — "Heat isolation that protects **cabin and paint**
  from Egyptian and Gulf summers" — this is the *heat-isolation* slide, but "and
  paint" blurs the glass-film/PPF line Dr. Amer is drawing (see OQ-2)
Everything else is on the automotive heat-isolation or building heat-isolation
surfaces, which stay untouched.
→ Likely Dr. Amer saw this on the **old supakoto.com** or heard it in sales copy,
not on V6. I will still add a spec rule + build guard so it cannot appear.

**Item 3 — Silver = TAKAI 5.** Equivalence lives in exactly 6 places:
`content/takai.ts:17,51,52` (`altName: "TAKAI 5"` on SILVER), `content/warranty.ts:68,110`
(`"TAKAI SILVER (TAKAI 5)"`), `messages/{en,ar}.json` `warranty.breakdown.note`,
and the `altName` render in `TakaiComparison.tsx:77`. Product naming is **already
region-aware** for the TAKAI table (Signature line = UAE shows SILVER; Performance
line = Egypt shows TAKAI 5; driven by RegionPicker/RegionProvider). The one
non-region-aware surface is **`/warranty` "Terms by tier"**, which renders the
Egypt AND UAE breakdowns side by side to every visitor (see OQ-3).

**Item 6 — "made for us".** Two strings, both locales:
`about.whoWeAre.body` ("a Japanese film made exclusively for us" / «خامة يابانية
تصنع خصيصا لنا») and **`home.features.takai.sub`** ("film made in Japan, exclusively
for us" / «خامة تصنع في اليابان لنا حصريا»). `about.sub`/`about.stats.exclusive.label`
already say «الوكيل الحصري» (exclusive agent) — that framing is correct and stays.

**Item 4 — phones.** `content/branches.ts` holds the six branch numbers; consumers
are all data-driven (BranchGrid, BranchMap, Footer, WhatsAppFab, forms, JSON-LD in
`app/[locale]/branches/page.tsx` via `b.phone`). Build guard forbids literals
elsewhere, so the change is one file. `content/regions.ts` Egypt line =
`+20 110 340 2446` / wa `201103402446` = old Alexandria number → **FROZEN**.
UAE regional: call `+971 50 626 5404`, WhatsApp `971552054478` (already = new Dubai
branch number).

**Item 5 — flags.** Exactly one emoji flag in the repo: `about.stats.exclusive.value`
= 🇯🇵 (both locales), rendered at `app/[locale]/about/page.tsx:111`. No 🇪🇬/🇦🇪/🇸🇦
anywhere (RegionPicker is text-only). Ibrahim's file is already at repo root:
`Flag_of_Japan.svg.webp` — note it is a **WebP raster**, not an SVG.

**Item 1 — Arabic.** `messages/ar.json` = 886 strings. Current CLAUDE.md rule is
plain MSA (2026-08-07). Rewrite target is White Arabic per Dr. Amer.

## LOCKED DECISIONS (proposed — override earlier phrasing once approved)
1. **Order of work:** claim corrections (2, 3, 6) → data/asset (4, 5) → Arabic
   rewrite (1). Each group is its own commit; Arabic rewrite is its own commit(s)
   so the substantive-change list is reviewable in isolation.
2. **Item 2 scope = PPF contexts only.** Automotive heat-isolation service, building
   heat-isolation service, and self-healing "heals with heat" wording are untouched.
   Add to STRUCTURE-SPEC + `content/warranty.ts` header: *"PPF / Premium Plus is
   body-panel paint protection. It never claims heat isolation, IR/UV rejection, or
   cabin temperature benefit. Glass heat isolation is a separate product and
   service."* Add a build guard (`scripts/check-claims.mjs`) that fails if
   heat/IR/عازل/حرار terms appear inside `services.items.ppf.*`,
   `*.premiumPlus*`, or `warranty.tiers/rows` keys (self-healing rows whitelisted).
3. **Item 3:** delete `altName` field + render, delete both `breakdown.note` strings,
   change UAE breakdown label to `"TAKAI SILVER"`, rewrite `warranty.ts` comment.
   Add STRUCTURE-SPEC rule: *"TAKAI SILVER (UAE) and TAKAI 5 (Egypt) are never
   named together or described as equivalent. Product names are region-scoped."*
   Add the same to the claims guard (fail on `SILVER` and `TAKAI 5` in one string).
4. **Item 6 applies site-wide**, not only `/about` — both `about.whoWeAre.body` and
   `home.features.takai.sub` get distributor framing ("exclusive distributor of
   TAKAI in Egypt and the UAE — film engineered in Japan"). STRUCTURE-SPEC gains:
   *"SupaKoto is TAKAI's exclusive distributor. Never 'made for us / to our spec /
   exclusively for SupaKoto'."* Guard fails on `made (exclusively )?for us`,
   `خصيصا لنا`, `لنا حصريا`.
5. **Item 4:** replace all six numbers in `content/branches.ts` (display + wa
   digits, LTR). `regions.ts` untouched; I report its values (above) and stop.
   Damietta stays `franchise: true`; capacities unchanged.
6. **Item 5:** relocate `Flag_of_Japan.svg.webp` → `public/images/brand/flag-japan.webp`
   (brand-adjacent, not a partner logo), render via `next/image` at a fixed height
   in the stat slot; `about.stats.exclusive.value` key removed from both locales.
   Add STRUCTURE-SPEC line "no emoji flags anywhere" + guard on the regional-
   indicator emoji range.
7. **Item 1:** CLAUDE.md Arabic line replaced by the White Arabic rule verbatim
   (Dr. Amer's five bullets + the "simple ≠ bland" clause + the Cairo/Dubai/Riyadh
   test). Then rewrite `ar.json` in passes by namespace; every string whose
   meaning/structure changed (not just a synonym swap) is listed in this doc for
   Ibrahim's review with before/after. English is not touched in this item.
8. Every phase ends green: `pnpm build`, `pnpm lint`, phone-literal guard, new
   claims guard, and the 43-check smoke script from Phase 14 still passing.

## OPEN QUESTIONS (answer or accept the proposed default)
- **OQ-1 (item 2):** No explicit claim exists in V6. Do you want the extra guard +
  spec rule only (proposed), or do you know a specific surface Dr. Amer was
  looking at (old site? PDF? Meta ad)? If it's the old site, that's outside V6.
- **OQ-2 (item 2 edges):** (a) `home.hero.slides.s2.sub` "protects cabin **and
  paint**" — drop "and paint" so the heat-isolation slide speaks only about glass/
  cabin? *Default: yes, drop it.* (b) `takai.lines.performance.tagline` "built for
  high-heat markets" — keep (durability, not isolation)? *Default: keep.*
- **OQ-3 (item 3):** `/warranty` "Terms by tier" shows Egypt and UAE lists side by
  side to all visitors, so a UAE reader still sees "TAKAI 5" under the Egypt
  heading. Options: (a) keep both lists, just remove the equivalence — *default*;
  (b) make `/warranty` region-aware like the TAKAI table (show only the visitor's
  region, with the switch hint). (b) is a structural change to a spec'd page.
- **OQ-4 (item 4):** Dubai's new branch number `+971 55 205 4478` equals the current
  UAE regional WhatsApp digits. Confirm the UAE regional **call** line
  `+971 50 626 5404` in `regions.ts` also stays as-is (frozen with Egypt)?
  *Default: yes, whole file frozen.*
- **OQ-5 (item 5):** The asset is WebP, not SVG. Use it as-is (fine for a ~40px
  stat glyph) or do you want me to draw a clean inline SVG (red disc on white,
  4:3 or 3:2)? *Default: use your WebP; SVG on request.*
- **OQ-6 (item 1):** "Flag every string changed substantially" — threshold I'll use:
  restructured sentence, changed meaning, or changed a headline/CTA. Pure
  vocabulary swaps (يقي→يحمي) are listed as a count only. OK?

## PHASES & GATES
| Phase | Work | Halt condition | Unlocks |
|---|---|---|---|
| 15a | Items 2+3+6 (claims) + STRUCTURE-SPEC + claims guard | build/lint/guards green | commit `fix(claims): …` |
| 15b | Item 4 branches.ts (+ report regions.ts, stop) + item 5 flag | green + phone guard | commit `chore: …` |
| 15c | Item 1: CLAUDE.md rule, then ar.json rewrite by namespace | green + review list in this doc | commit(s) `copy(ar): …` |
| gate | Ibrahim reviews the substantive-change list; smoke pass | his word | push |

## GIT DISCIPLINE
Branch `feat/vp-feedback-round-1` off `main` (which is pushed, `3f52b78`). Local
commits only; imperative subjects; no trailers. Push/merge only on Ibrahim's word.

## SMOKE CRITERIA
- 15a: grep for `TAKAI 5` returns hits only in Egypt-scoped data; `altName` gone;
  no `made for us`/`خصيصا لنا`; claims guard passes; `/warranty`, `/services`,
  `/about`, `/` render both locales; lifetime qualifier still adjacent to every
  "lifetime" (Phase 14 checks 43/43).
- 15b: six numbers verified in `/branches` DOM + JSON-LD + wa.me links, all LTR;
  `regions.ts` byte-identical to `main`; no U+1F1E6–1F1FF in repo; flag image 200.
- 15c: ar.json key parity with en.json (script), no tashkeel, no phone digits, no
  clichés/classical constructions (grep list), banned-word list from Dr. Amer's
  bullets = 0 hits; review list published in this doc.
