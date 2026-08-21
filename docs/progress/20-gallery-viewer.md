# Phase 20 — gallery rebuild: real-estate viewer, session-seeded shuffle, service-driven filters

*Brief drafted 2026-08-22 from Ibrahim's message. Declared **autonomous, no
gates, one report at the end** — proposed LOCKED DECISIONS below are the
written defaults being executed against (sprint-brief rule: proceed only
against a written list).*

═══ BRIEF phase-20 ═══

## READ FIRST (in order)
1. `CHECKPOINT.md` (2026-08-21 — Phase 19 done + green on `feat/phase-19-feedback-round-2`, local only)
2. `docs/progress/19-feedback-round-2.md` (16:9 tile decision this phase supersedes for the grid — the grid itself goes away)
3. `content/gallery.ts`, `components/sections/GalleryGrid.tsx`, `content/services.ts`
4. Auto-memory: watermarked-photos-only rule; V2_Prod is the only sanctioned source

## WHAT I VERIFIED BEFORE WRITING THIS

| Claim in the message | What the repo actually shows |
|---|---|
| "same ~12 images … 238 exist in the library" | Site ships **41 items** (34 vehicle `sk-*` + 2 building + 4 surface + 1 video). The library = `assets/source/v2-gallery/` — **exactly 238 files** `supa-001…238`, the gitignored V2_Prod harvest originals. Shipped `sk-NNN` files are ≤1600px re-encodes of `supa-NNN` (same number, same photo). So 204 photos never ship. |
| Library composition | 167× 2000×1333 + 10× 2000×1500 landscape, 59× 1536×2048 + 2× 1365×2048 portrait (**26% portrait** — fine in a contain-style viewer; thumbnails crop). One byte-duplicate: `supa-234` ≡ `supa-123` (the Rolls dupe already killed in Phase 19). Total 39MB source. |
| Filter row misses marine | Confirmed: `galleryCategories` in `content/gallery.ts` is a hardcoded array without `marine-ppf`; `content/services.ts` has 7 services incl. `marine-ppf`. Same defect class as the wizard's pre-Phase-19 hardcoded list. |
| Marine/surface/buildings empty | marine-ppf: **0 images** today. surface-protection: 4. building-heat-isolation: 2. Empty-state currently: none — an empty filter shows a blank area (a placeholder existed on 08-07, removed 08-14). |

## SCOPE
- A. Ingest the full library: audit all 238 for watermark + category + duplicates, re-encode, ship every eligible photo.
- B. Replace `GalleryGrid` with a real-estate-style viewer (main stage, arrows, thumbnail strip, fullscreen, keyboard, swipe, inline video). RTL direction-of-travel correct.
- C. Session-seeded client-side shuffle; filter re-shuffles within category.
- D. Filter row derived from `content/services.ts` + build guard `check-gallery-filters.mjs`; labelled empty states.
- E. Performance: thumbnail/main `sizes`, prev/next-only preload, lazy strip, measured first-load bytes at 390 and 1440.

## NOT IN SCOPE
- Any change to marine/surface *service content* or indexing (`NOINDEX_SERVICE_IDS` untouched); this adds photos/filters only.
- New photography acquisition; only the sanctioned `assets/source/` + already-shipped files.
- Per-service gallery pages (roadmap doc item stays a roadmap item).
- Changing service detail pages' "project photos" pull beyond what the data reshape requires.

## ROLE REFERENCE
Public site, no auth; anonymous visitor. Session = browser sessionStorage
lifetime (per-tab). No server state.

## LOCKED DECISIONS (proposed defaults — executing against these)
- **LD-1 Viewer layout:** filter row (top, unchanged position) → main stage (fixed 16:10 box, `object-contain` on `bg-ink-900` so portraits never crop) → prev/next controls → horizontally scrolling thumbnail strip (fixed-ratio thumbs, current item ring-highlighted, auto-scrolled into view). Click main image = fullscreen (existing `Lightbox` adapted); Escape exits fullscreen; arrows/keyboard work in both contexts. Counter "n/total" stays. Video item plays inline in the main stage (`controls`), thumb shows a play badge.
- **LD-2 RTL direction of travel:** "next" advances in the reading direction — in Arabic the strip lays out and scrolls right→left and next moves leftward. Keyboard maps to *visual* direction (ArrowLeft = move left = next in ar / prev in en); swipe likewise (content follows the finger; the incoming image comes from the reading-direction side). Verified by an automated Playwright check comparing the active thumbnail's x-position before/after "next" in both locales, not by eyeballing icons.
- **LD-3 Shuffle:** seeded mulberry32 over the full item list; seed minted once per session into `sessionStorage["sk-gallery-seed"]` (try/catch, falls back to unshuffled); applied in a layout effect after hydration (no SSR mismatch, no mid-browse jumping, back-navigation keeps the order). Filtering shows the seeded order restricted to that category — a different sequence per category, stable within the session. New session ⇒ new order.
- **LD-4 Filters:** `["all", ...services catalogue order, "video"]` derived from `content/services.ts` at runtime — ppf, heat-isolation, colour-change, nano-ceramic, building-heat-isolation, **marine-ppf**, surface-protection, video. Labels stay `services.items.<id>.name`. Empty category renders the filter *and* a labelled empty state («الصور قريبا — أعمالنا في هذه الخدمة قيد التصوير» / "Photography coming soon") — never blank, never another category's images.
- **LD-5 Ingest:** every eligible `supa-NNN` ships as `public/images/gallery/sk-NNN.webp` (existing 34 untouched; new ones re-encoded to the same recipe: max edge 1600, webp q82). `supa-234` excluded (byte-dupe). Eligibility = SupaKoto × TAKAI watermark visible; unwatermarked or non-work images are excluded and reported, per the standing watermark rule.
- **LD-6 Categorisation:** visual audit of all new images (vision agents, then spot-checked): default `ppf` (everything carries the Protection Film watermark); reassigned only where the photo visibly shows other work — wrap → colour-change, tinted glass → heat-isolation, coating application → nano-ceramic, boat → marine-ppf, building → building-heat-isolation. Near-duplicates (same car, same angle) flagged and thinned like Phase 19's sk-232 precedent.
- **LD-7 Alt text:** bespoke per image in both locales, same style as the existing 41 (EN factual descriptor; AR white Arabic), drafted during the visual audit and spot-checked. i18n parity enforced programmatically.
- **LD-8 Guard:** `scripts/check-gallery-filters.mjs` — fails if any `content/services.ts` id has no gallery filter, or any gallery item's category is not a catalogue service id or `video`. Wired into `pnpm build` and `pnpm guards` (guard #6).
- **LD-9 Performance:** thumbs `sizes` ≈ 96px, lazy; main image `priority` for current only; prev+next preloaded via hidden `next/image`; nothing else eager. First-load transfer measured via Playwright network accounting at 390px and 1440px, both locales; target: not materially worse than today's grid despite 5.8× the library.
- **LD-10 Data shape:** `content/gallery.ts` keeps `GalleryItem` and the `img()` helper (guards regex-parse it); the 200+ new rows are generated `img()` lines, not a runtime directory scan — `check-image-refs.mjs` keeps working unchanged.
- **LD-11 Git:** branch `feat/phase-20-gallery-viewer` **off `feat/phase-19-feedback-round-2`** (needs its gallery + guard state; 19 is unmerged pending Ibrahim's word). One commit per item, local only, no push/merge.
- **LD-12 Grid retirement:** `GalleryGrid.tsx` is replaced by `GalleryViewer.tsx`; the 16:9 tile decision (Phase 19) carries over to *thumbnails*; the main stage never crops.

## PHASES & GATES
| Phase | Content | Halt condition |
|---|---|---|
| A | Library audit (watermark, category, dupes, alts) + ingest + regenerated `content/gallery.ts` + messages | > ~15% of the library unwatermarked or unusable → report before shipping a gutted set |
| B | Viewer component + RTL + fullscreen + video + empty states + derived filters | — |
| C | Shuffle + performance + guard | — |
| End | build (6 guards) · lint · typecheck · parity · smoke · crawl · gallery e2e (RTL travel, filters, bytes) | any red |

## SMOKE CRITERIA
- Each of the 8 filters renders; marine (if still photo-less after audit) shows the empty state, zero car images.
- ar: "next" moves the active thumbnail strictly leftward; en: strictly rightward. Keyboard + swipe follow visual direction. Escape exits fullscreen.
- Two loads in one session: identical order; new session: different order; filter toggle mid-session doesn't reorder the category.
- First-load transferred bytes reported (390 + 1440, ar + en); no full-library fetch.
- `check-gallery-filters.mjs` proven to fail when a service filter is removed, then restored.
- All guards + suites green; i18n parity; no unwatermarked image shipped.

═══ SHIPPED — 2026-08-22 ═══

Three commits on `feat/phase-20-gallery-viewer` (off the unmerged Phase 19
branch, local only): `8906635` brief · `e9c5e50` viewer + full library +
filters + guard · `a3bb75c` e2e suite.

## Library audit result
All 202 unshipped photos audited image-by-image (6 parallel vision passes +
perceptual-hash sweep): **every one carries the SupaKoto × TAKAI watermark;
0 excluded**. Only byte/near duplicate in the whole 238 = supa-234 ≡
supa-123 (already known). New categories found: 12 colour-change wraps;
no boats, no buildings, no tint-subject or coating-subject shots in the
new set. Alts: bespoke EN + AR per image (white Arabic, مركز متخصص
convention normalized per 43cb2ba); the pre-existing 41 alts untouched.

## Item counts per category (site total 243)
| Category | Count |
|---|---|
| ppf | 215 |
| colour-change | 14 |
| nano-ceramic | 5 |
| heat-isolation (cars) | 2 |
| building-heat-isolation | 2 |
| surface-protection | 4 |
| **marine-ppf** | **0 → labelled empty state** |
| video | 1 |

## End-gate (2026-08-22)
- build green with **6 guards** (new: check-gallery-filters, negative-tested)
- lint 0/0 · typecheck clean · i18n parity (243 gallery items each locale)
- smoke 196/196 · crawl 72 URLs clean · **e2e-gallery 42/42, run twice**
- RTL direction of travel verified by measurement (successor thumb x-position
  + active-id after "next" + physical-key mapping), not by icon inspection
- First-load transfer: ar 1.7–2.1 MB, en 0.4–1.6 MB (390px & 1440px; varies
  with which shuffled images land first; no full-library fetch — 243 items
  would be ~33 MB)

Awaiting Ibrahim: word on push/merge (stacked on Phase 19).
