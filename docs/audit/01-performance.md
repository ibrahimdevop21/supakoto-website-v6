# 01 — Performance (TBT / INP)

Scope: main-thread JS only — TBT, long tasks, INP, hydration, bytes executed.
LCP/FCP/CLS/Speed Index are explicitly out of scope (owner: they're green).
Data: `docs/audit/data/lh/*.json` (Lighthouse 13.4.1, live prod, 3 mobile runs +
1 desktop run per route, median used throughout unless stated), plus new runs
this pass (`*-blocked3-*.json`, `data/probe/inp.json`) and a fresh read of the
source tree at `feat/phase-23-forms-destination` HEAD (64924d5).

## Measured scores table

| Route | Mobile perf | Mobile TBT (median) | Mobile bootup-time | Long tasks >50ms (median) | Desktop perf | Desktop TBT |
|---|---|---|---|---|---|---|
| `/` (home, ar) | 0.71 | 776 ms | 2870 ms | 17 | 0.81 | 341 ms |
| `/services/ppf` | 0.63 | 1860 ms | 3361 ms | 17 | 0.71 | 479 ms |
| `/gallery` | 0.48 | 5115 ms | 7343 ms | 20 | 0.60 | 317 ms |
| `/booking` | 0.60 | 2461 ms | 4200 ms | 16 | 0.85 | 200 ms |
| `/branches` | 0.48 | 1605 ms | 3691 ms | 17 | 0.90 | 255 ms |
| `/en` (home, en) | 0.57 | 2282 ms | 5082 ms | 20 | 0.60 | 1357 ms |

**Gap vs the owner's baseline (`/` mobile perf 50, desktop TBT 470 ms):**
mine reads mobile perf **71**, desktop TBT **341 ms** — meaningfully better on
the same URL, same Lighthouse 13.4.1, same default config
(`throttlingMethod: "simulate"`, RTT 150 ms, 1.6 Mbps, 4× CPU — confirmed in
the LHR `configSettings`). This is not a measurement-methodology difference,
it's a **host-machine** difference: Lighthouse's `simulate` throttling first
runs an *unthrottled* trace on whatever machine is running it, then applies
simulated network/CPU multipliers on top of that observed trace (a "lantern"
graph). A slower or busier host machine produces a slower unthrottled trace,
and the simulation compounds that into a worse score — it is not purely a
fixed 4× multiplier on a fixed baseline. My machine's unthrottled Chromium
trace is evidently faster than the owner's, so the same page nets a better
simulated score. Run-to-run variance on my own machine is itself large (TBT
696–854 ms across 3 home runs, 4038–6193 ms across gallery's 2 runs) —
`simulate` throttling is noisy by nature. If the owner wants a number that
travels between machines, switch to `--throttling-method=devtools` (real CPU
throttling, not simulated) or CrUX field data — the CrUX INP 321 ms figure
already cited is the more trustworthy cross-machine number, and it points at
the same third-party/first-party split this report finds by other means
(§ Third-party cost table).

Note on the CrUX 321 ms INP figure: our own six interaction probes below
(real Pixel 7 + 4× CPU, CDP-throttled, not simulated) all measured under
250 ms for the actual app-code handlers. Read together, that says the 321 ms
CrUX number is more likely a *collision* — a real tap landing on top of a
GTM/FB/TikTok long task already running — than the app's own click handlers
being slow. See § INP below.

## Attribution: where the milliseconds go

### 1. Per-route long-task attribution

**Home (`/`)** — `mainthread-work-breakdown` medians: scriptEvaluation 2763 ms,
other 2029 ms, styleLayout 1388 ms, paintCompositeRender 864 ms,
scriptParseCompile 235 ms, GC 58 ms. Top long tasks:
1. `googletagmanager.com/gtag/js?id=AW-...` — 355 ms @ t≈12.4 s (repeats 3×, 307–355 ms each run)
2. `connect.facebook.net/en_US/fbevents.js` — 199 ms @ t≈8.0 s
3. `supakoto.com/` (own document/hydration) — 183 ms @ t≈1.36 s
4. `analytics.tiktok.com/.../main.js` — 180 ms @ t≈8.3 s
5. `connect.facebook.net/en_US/fbevents.js` (2nd eval pass) — 178 ms @ t≈8.2 s

First-party `bootup-time` top script: **chunk `5672-*.js` (framer-motion) —
2873 ms of CPU time**, more than any third-party script on this route. This
is not parse/compile cost (`scriptParseCompile` for that URL is 8 ms) — it's
`scripting` time, i.e. code *from* that chunk running repeatedly through the
page's lifetime. Root cause: `components/ui/Reveal.tsx`'s `useInView` +
`AnimatePresence` pattern is used by 30+ `<Reveal>`/`<RevealItem>` instances
across the home page's sections (`FeatureGrid`, `ServicesSection`,
`TakaiComparison`, `BusinessBand`, `PartnersBand`), each running its own
IntersectionObserver callback → state update → framer-motion animation
(opacity/y transform, requiring style+layout recalculation) as soon as it's
in view — nearly all of them fire within the first second or two of load
because most of the home page's first sections are above/near the fold. That
matches `styleLayout` (1388 ms) and `paintCompositeRender` (864 ms) both
being unusually high for a page whose actual DOM (1315 nodes) isn't large.

**`/services/ppf`** — scriptEvaluation 3146 ms, styleLayout 758 ms,
scriptParseCompile 340 ms. Top long tasks are almost entirely third-party and
dominated by one script:
1. `connect.facebook.net/signals/config/...` (FB's remote flag/config
   fetch, re-executed) — **1644 ms** @ t≈9.8 s — the single worst long task
   measured anywhere in this audit
2. `googletagmanager.com/gtag/js?id=...&gtm=4e68l1h1` — 1037 ms @ t≈12.0 s
3. `connect.facebook.net/en_US/fbevents.js` — 842 ms @ t≈7.3 s
4. `googletagmanager.com/gtag/js?id=G-ENPYD2K4R3` — 791 ms @ t≈8.4 s
5. `analytics.tiktok.com/.../main.js` — 620 ms @ t≈9.2 s

First-party: `supakoto.com/services/ppf` document itself is 448 ms
(hydration of `ServiceDetailBody.tsx`'s `<Reveal>` blocks — 5 `<Reveal>` + 2
`<RevealStagger>` on this template).

**`/gallery`** (worst route, 5.1 s median TBT) — see § 3 below for the
GalleryViewer-specific analysis. Top long tasks: GTM `gtag.js` **3410 ms**
(the single biggest number in this whole audit — one script, one task, 3.4
real seconds of blocked main thread on a 4×-throttled phone), FB
signals/config 904 ms, FB fbevents.js 789 ms, GTM gtag.js 733 ms again, FB
fbevents.js 545 ms.

**`/booking`** — top long tasks: GTM `gtag.js?...gtm=4e68l1h1` 1258 ms,
TikTok main.js 883 ms, GTM gtag.js 811 ms, GTM GA4 745 ms, GTM gtag h1 551 ms.
See § 4 for the wizard-specific first-party finding (DatePicker bundle).

**`/branches`** — the one route where the **first-party** long task leads:
1. `supakoto.com/branches` (own script) — **1467 ms** @ t≈1.5 s
2. `googletagmanager.com/gtag/js` — 762 ms @ t≈12.4 s
3. `supakoto.com/branches` (second hydration pass) — 541 ms @ t≈3.0 s
4–5. GTM gtag.js, TikTok — 466–479 ms

`components/sections/BranchMap.tsx` dynamically `import()`s Leaflet inside a
`useEffect` (good — the 148 KB Leaflet chunk `ed48eaa7-*.js` is NOT in the
page's initial script list per `bundle-routes.json`), but that `useEffect`
fires immediately on mount with no idle-gating, so the two 1467 ms/541 ms
first-party tasks are the combination of (a) hydrating `BranchGrid.tsx`'s
14 `<RevealItem>` instances (7 branches × 2 region sections, each an
IntersectionObserver + framer-motion mount) and (b) the Leaflet map
constructing its Carto tile layer and Leaflet's own DOM/CSS work, both
racing in the same window.

**`/en`** — see § 5 for why this is 3× home's TBT on identical component
code.

### 2. Third-party cost table

Per Lighthouse's own `third-parties-insight` entity attribution (medians
across 3 mobile runs), transfer size is nearly identical on every route
(same four scripts load everywhere) but main-thread time scales with how
busy the page already is:

| Entity | Transfer (KB, ~constant every route) | Main-thread ms — home | service | gallery | booking | branches | en-home |
|---|---|---|---|---|---|---|---|
| Google Tag Manager (gtag.js ×2: GA4 + Ads) | 335 | 149 | 227 | 652 | 440 | 247 | 245 |
| Facebook (fbevents.js + signals/config) | 176 | 87 | 161 | 328 | 207 | 166 | 169 |
| TikTok (pixel main.js) | 161 | 64 | 82 | 225 | 107 | 94 | 98 |
| Google/Doubleclick Ads | 4 | 1 | 1 | 2 | 2 | 1 | 1 |
| **Total 3P main-thread ms** | **~688 KB transfer** | **301** | **472** | **1207** | **756** | **508** | **513** |
| **as % of median mobile TBT** | | **39%** | **25%** | **24%** | **31%** | **32%** | **22%** |

So roughly a **quarter to two-fifths of TBT on every route is the four
tracking scripts**, independent of which page it is — this is a fixed tax the
site pays everywhere, on top of whatever that page's own code costs.

**How they're loaded today** (`lib/analytics.ts`, `components/providers/
Analytics.tsx`): there is no `next/script` and no GTM container — this is
intentional per the file's own header comment ("direct pixels, no tag
manager… `scripts/check-analytics-calls.mjs` fails the build on any direct
platform call outside this module"). `initAnalytics()` runs from a plain
`useEffect(() => { initAnalytics(); captureAttribution(); }, [])` inside
`<Analytics />`, which is mounted once in the root layout body, i.e. **after
hydration, not render-blocking, not in `<head>`**. Each script tag is created
with `s.async = true` and appended to `<head>` — this is already
functionally equivalent to `next/script`'s `lazyOnload`/`afterInteractive`
async behaviour; there is no lower-hanging "move the strategy" fix available
because there is no strategy prop to move. Consent/region gating: none
found — `analyticsEnabled` only checks whether the NEXT_PUBLIC_*_ID env vars
are set, not user consent or geography (matches the memory note: consent
banner is HELD, not built yet).

**Measured recovery from removing them entirely** (home page,
`--blocked-url-patterns` for all four domains + doubleclick.net,
`docs/audit/data/lh/home-mobile-blocked3-{1,2}.json`, verified the requests
were actually blocked — `statusCode: -1`, `transferSize: 0` on the gtag.js
request, not just present-but-cached):

| Run | TBT | Perf score |
|---|---|---|
| Baseline (median of 3, unblocked) | 776 ms | 0.71 |
| Blocked run 1 | 654 ms | 0.70 |
| Blocked run 2 | 205 ms | 0.85 |

Median blocked TBT ≈ 429 ms → **≈347 ms (45%) measured recovery**, consistent
with (and corroborating) the 301 ms direct third-party attribution above.
Run-to-run variance in the blocked condition is itself large (205–654 ms,
same `simulate`-throttling noise noted in the scores table) so treat "45%"
as a band, not a precise number — but two independent measurement methods
(direct entity attribution, and block-and-diff) agree on the same
neighbourhood (300–350 ms on the home page alone). A first attempt at this
same experiment, using a single `--blocked-url-patterns` flag with a
comma-joined value, silently blocked nothing (request count identical,
91 vs 91) — Lighthouse's CLI wants the flag **repeated once per pattern**
(it's declared `[array]`), not comma-separated. Flagging this because it's
an easy way to convince yourself a change did nothing when actually the
experiment never ran.

**Report only — owner decides on the other branch.** This whole section
(`lib/analytics.ts`, `lib/attribution.ts`, `lib/intent.ts`,
`components/providers/Analytics.tsx`, the SK-ref/sk-attribution cookie
chain) is mid-integration per your instructions. No refactor proposed. The
one concrete, non-structural observation worth carrying over to that branch:
`initAnalytics()` fires on mount via a bare `useEffect`, with no
`requestIdleCallback`/idle gate. Under real (non-simulated) throttled
conditions the four scripts' own long tasks land at t≈7–13 s in this data
— i.e. already fairly late, well after hydration — so gating on idle time
would likely buy only tens of ms, not hundreds; the block experiment above
is the more honest upper bound.

### 3. Gallery (`/gallery`, 5.1 s median TBT — the worst page on the site)

Read: `app/[locale]/gallery/page.tsx`, `components/sections/GalleryViewer.tsx`,
`content/gallery.ts`, `lib/shuffle.ts`.

- `content/gallery.ts` defines **236 items** (`grep -c 'img("' → 236`, not
  238 — close enough to the brief's estimate). It's a plain exported array
  imported directly into `GalleryViewer.tsx` (`"use client"`), so all 236
  records (id, category, width, height — no image bytes, just metadata) ship
  in the client JS bundle. This part is small (tens of KB) and not the
  problem.
- **The problem is DOM/component count, not data size.** `GalleryViewer.tsx`
  renders the *entire* `filtered` array as thumbnail `<button>` elements
  (line 256: `{filtered.map((item, i) => …)}`) with **no virtualisation** —
  every item in the active filter (up to all 236 on "all") gets a mounted
  React component + a `next/image` instance simultaneously. Measured DOM
  size for this route: **754–760 nodes** (`dom-size-insight`, and confirmed
  independently by the Playwright CDP probe: `domNodes: 754`) — consistent
  with ~236 thumbnails × ~3 nodes each (button + Image wrapper + img) plus
  the main stage and filter bar. That's not a *large* DOM by Lighthouse's
  own threshold (it doesn't even trip the 1400-node warning), but 236
  simultaneously-mounted `next/image` components each running their own
  mount-time effects (`onLoad` state, `srcSet` computation, ref callback) is
  real, repeated, per-instance script work — this is why
  `mainthread-work-breakdown`'s `scriptEvaluation` for this route is
  **6824 ms**, more than 2× home's, despite the page having *fewer* DOM
  nodes than home (760 vs 1315).
- **Image bytes are not the issue** — `next/image`'s native
  `loading="lazy"` is working correctly: of 236 possible thumbnails, only
  **53 image requests** actually fired (`network-requests` audit,
  350 KB total image transfer — reasonable). This is a pure JS/DOM-mount
  cost, not a network cost.
- **Double-render on mount.** Lines 46–49: `useEffect(() => {
  setItems(seededShuffle(galleryItems, pageLoadSeed())); setIndex(0); }, [])`
  — SSR renders the *unshuffled* 236-item order, then this effect fires
  immediately after hydration and re-renders the full thumbnail strip a
  second time in shuffled order. Not a hydration-mismatch error (the state
  update happens in an effect, not during render), but it is a second full
  236-item reconciliation pass a few hundred ms into the page's life, on
  top of the first one.
- **Not the cause:** IntersectionObserver / IO-based lazy loading isn't
  what's used for images (native `loading="lazy"` is), and the component
  does *not* use `whileInView` — grepped for it, zero hits in this file.
  The prev/next-neighbour preload (lines 234–247) is bounded to 2 extra
  hidden `<Image>`s, not a factor.
- **Long tasks confirm the shape**: the top 5 long tasks on this route are
  still third-party (GTM 3410 ms + 733 ms, FB 904 + 789 + 545 ms — see § 2),
  but the *baseline* `scriptEvaluation` floor (6824 ms total CPU) that those
  third-party tasks are landing on top of is nearly 3× every other route's,
  and that floor is first-party: 236 mounted thumbnail components.

**Fix shape** (report only, no code changed): virtualise the thumbnail strip
(`react-window`/`react-virtuoso`, or a simpler windowed slice keyed off
scroll position) so only the ~10–15 visible-plus-buffer thumbnails mount at
once; keep `filtered` as the full array for `count`/`index` math, just don't
render all of it. Estimated impact below.

### 4. Booking wizard (`/booking`, 2.5 s median TBT)

Read: `components/forms/BookingWizard.tsx` (598 lines), `components/forms/
DatePicker.tsx` (107 lines), `content/regions.ts`, `content/branches.ts`,
`content/services.ts`.

- `BookingWizard.tsx` line 13: `import { DatePicker } from
  "@/components/forms/DatePicker"` — a **static, top-level import**, even
  though `DatePicker` only renders when `step === "date"` (line 471–472,
  conditionally in JSX). Because it's a static import, webpack bundles
  `react-day-picker` + `date-fns` into the `/booking` route's initial script
  payload regardless of which step the customer is on — confirmed in
  `bundle-routes.json`: chunk `8648-b87ad803b7e11f13.js` (81.6 KB) is listed
  as one of the route's initial chunks, not a separately-fetched one.
- **Measured**: `unused-javascript` audit for this route shows chunk `8648`
  at **62.3 KB unused of 81.6 KB total (76% unused)** on a run where the
  wizard didn't advance to the date step — i.e. three out of four customers'
  worth of this bundle, by weight, is dead code on arrival for anyone who
  hasn't clicked into "date" yet, and **100% dead** for the `building` and
  `enquiry` flows, which never render `DatePicker` at all (`FLOWS.building`
  and `FLOWS.enquiry` in the same file, lines 51–58, don't include a `"date"`
  step).
- `date-fns` itself is already correctly scoped — `DatePicker.tsx` line 5:
  `import { ar, enUS } from "date-fns/locale"` — only the two locales
  actually used, not the full locale directory. Not a problem.
- `react-day-picker` is imported statically inside `DatePicker.tsx` too
  (line 4), which is fine *once* `DatePicker` itself is code-split — the
  fix is one file up, at the `BookingWizard.tsx` import site.
- Fix shape: `const DatePicker = dynamic(() =>
  import("@/components/forms/DatePicker"), { ssr: false })` in
  `BookingWizard.tsx`. Zero behaviour change (it already only renders
  conditionally); this just makes the *fetch* conditional too.

### 5. Home vs `/en`, `/branches`, and Framer Motion hydration cost

`/en` and `/` render the exact same route file (`app/[locale]/page.tsx`
— next-intl locale routing, not separate templates) yet `/en` median TBT is
**2282 ms vs 776 ms**, a 3× gap on identical component code. Measured
`mainthread-work-breakdown` deltas (en minus ar, medians):
scriptEvaluation +2095 ms, styleLayout +794 ms, paintCompositeRender +332 ms,
"other" +1474 ms. DOM size is actually *smaller* on `/en` (1246 vs 1315
nodes), so it isn't "more elements" — it's more *work per element or per
callback*. The bootup-time breakdown shows the same script (chunk `5672`,
framer-motion) attributed **3890 ms on `/en` vs 2873 ms on `/`** for
byte-identical code, which confirms the cost is runtime execution
(animation/layout work triggered repeatedly through the page's life), not
parse/compile. I could not isolate the exact cause within this pass's
budget — candidates I did *not* find evidence for: font-display cost
(`font-display-insight` = 0 wasted ms on both locales; both `rhZak`
(`display: "optional"`, unpreloaded) and `plexArabic`/`inter`
(`display: "swap"`) are self-hosted `next/font`, not render-blocking on
either locale), different image counts (same hero carousel component),
extra JS shipped (same bundle). This needs a side-by-side Performance-panel
trace comparison to pin down definitively — see Open Questions.

**Framer Motion hydration cost, site-wide**: `grep`-ing the actual feature
surface in use — `whileHover` (1 hit, `components/ui/Card.tsx`),
`useMotionValue` (2 hits, `components/sections/home/PartnersBand.tsx`),
`AnimatePresence`, plain `motion.div`, `useInView`, `useReducedMotion` — and
**zero** hits for `drag`, `layout`/`layoutId`, `useScroll`, `useTransform`,
`useAnimation`. The site uses a small slice of framer-motion's API surface
but ships the whole engine: `script-treemap-data` shows chunk `5672` (the
framer-motion chunk) is **131.8 KB with 72.6 KB (55%) unused** on every
route that loads it (which is every route — it's pulled in at the shared
layout level). `import { motion, AnimatePresence } from "framer-motion"`
(used as-is throughout — `GalleryViewer.tsx`, `BookingWizard.tsx`,
`components/ui/Lightbox.tsx`, `components/ui/Reveal.tsx`, `components/ui/
Accordion.tsx`, `components/sections/home/HeroCarousel.tsx`, etc.) is not
individually tree-shakeable; framer-motion's own recommended pattern for
this exact situation is `LazyMotion` + `domAnimation` (a ~30 KB feature
bundle covering exactly what's in use here: fade/transform animations,
gestures, `AnimatePresence`, `useInView` — not drag or layout projection,
which this site doesn't use) with `motion.div` swapped for the lazy `m.div`
across the ~19 call sites. This is a source-wide but mechanical rename, not
proposed here as a change — flagged as the single biggest first-party
bundle-size opportunity on the site (see Ranked fixes).

**`use client` / motion-element inventory, by route** (server components
listed for contrast — these are candidates the owner may want to keep
server-rendered where they already are):

| Component | Client/Server | `<motion.*>` in it |
|---|---|---|
| `BranchGrid.tsx`, `BranchMap.tsx` | Client | via `<RevealItem>` |
| `CtaBand.tsx` | **Server** | via `<Reveal>` (server-safe wrapper) |
| `DocumentaryPlayer.tsx` | Client | — |
| `GalleryViewer.tsx` | Client | yes (`AnimatePresence`) |
| `home/BusinessBand.tsx`, `home/PartnersBand.tsx`, `home/HeroCarousel.tsx`, `home/TakaiComparison.tsx` | Client | yes |
| `home/FeatureGrid.tsx`, `home/ServicesSection.tsx` | **Server** | via `<Reveal>`/`<RevealItem>` |
| `PageHero.tsx` | **Server** | via `<Reveal>` |
| `services/PendingServiceCta.tsx` | Client | — |
| `services/ServiceDetailBody.tsx`, `services/ServicesGrid.tsx` | **Server** | via `<Reveal>`/`<RevealStagger>` |
| `TestimonialsCarousel.tsx` | Client | yes |
| `Testimonials.tsx` | **Server** | via `<Reveal>` |
| `warranty/TierBreakdown.tsx` | Client | yes |

The "Server" rows already do the right thing structurally (the page
component itself doesn't need `"use client"` just because it contains a
`<Reveal>` — `Reveal.tsx` is the client boundary, correctly pushed down to
the leaf). This is good practice already in place, not a finding against
the codebase. 35 files total carry `"use client"` across `components/` +
`app/` — did not find an obvious case of an interactivity-free component
wrongly marked client during this pass.

### 6. Unused JS on first paint, by chunk

First-party chunks with real unused-byte counts (`unused-javascript` audit,
medians are consistent across routes since these chunks are shared):

| Chunk | Contents | Total | Unused | % |
|---|---|---|---|---|
| `5672-*.js` | framer-motion (full engine) | 131.8 KB | 72.6 KB | 55% |
| `7202-*.js` | React 19 runtime (`createRoot`/`hydrateRoot`) + Next glue | 174.5 KB | 69.7 KB | 40% |
| `8648-*.js` (booking only) | react-day-picker + date-fns | 81.6 KB | 62.3 KB | 76% |
| `7857-*.js` (booking only) | (unidentified, no source maps) | 40.1 KB | 17.5 KB | 44% |
| `e9dd2d7c-*.js` | react-dom + scheduler | 173.0 KB | 52.8 KB | 30% |

Third-party unused bytes dwarf all of these (`gtag.js?id=G-ENPYD2K4R3`
71.7 KB unused of ~90 KB delivered, TikTok pixel 57.6 KB unused, `gtag.js?
id=AW-...` 57.2 KB unused, fbevents.js 37.6–38.4 KB unused, FB
signals/config 23.3 KB unused) — consistent with the third-party cost table
in § 2. No source maps are deployed to prod (`valid-source-maps` audit:
empty items, expected/correct for a production build), so first-party
per-module attribution inside a chunk isn't possible from LHR data alone;
the `7857` chunk's contents were identified by size/route pattern only, not
confirmed by content.

### 7. INP — which interactions are actually slow

Six read-only interaction probes, live prod, Pixel 7 emulation + 4× CPU CDP
throttle + slow-4G network (`PerformanceObserver({type:"event",
durationThreshold:16})`, script + raw results in
`docs/audit/data/probe/inp.json`). No form was submitted. `event.duration`
below is the spec field INP is built from (event timestamp → next paint):

| Interaction | Route | Handler / component | Measured duration |
|---|---|---|---|
| Gallery → open lightbox | `/gallery` | `GalleryViewer.tsx` `setFullscreen(true)` → mounts `<Lightbox>` | **240 ms** |
| Gallery → next image | `/gallery` | `GalleryViewer.tsx` `step()` | 200 ms |
| Mobile nav drawer open | `/` | `Header.tsx` `setDrawerOpen(true)` | 168 ms |
| Locale switch (`ar`→`en`) | `/` | `LocaleSwitcher.tsx` (Next `<Link locale=…>`, triggers full route transition) | 168 ms to dispatch + ~1.1 s to next page interactive |
| FAQ accordion toggle | `/faq` | `components/ui/Accordion.tsx` `setOpen()` | 48 ms |
| Booking: pick first service | `/booking` | `BookingWizard.tsx` `selectService()` | 48 ms |
| Branches region toggle | `/branches` | not tested — see below | — |

Branches: there is no in-page region toggle button on `/branches` itself —
`BranchGrid.tsx` renders **both** regions' branches simultaneously by design
("every branch is always visible", comment at line 18) with region context
set elsewhere (persisted via `RegionProvider`'s localStorage). The only
click targets on branch cards are `tel:`/`wa.me` anchors, which I chose not
to click in an automated live-prod run (real external navigation, however
harmless) — the `onClick` on those anchors is a synchronous `track()` call
before navigation, i.e. inherently cheap (see § 2's `lib/analytics.ts` read
— `track()` is a plain synchronous switch/gtag-push, no network wait).

**All six measured interactions are well under the 321 ms CrUX baseline.**
The heaviest, gallery lightbox open (240 ms) and lightbox next (200 ms), are
both mounting/animating a new `AnimatePresence` subtree
(`components/ui/Lightbox.tsx`) — real cost, but not 321 ms. Given every
route in this audit has third-party long tasks landing between t≈7 s and
t≈13 s after load (§ 1, § 2) that run 200 ms–3.4 s **each**, the far more
likely explanation for a field 321 ms INP than "our handlers are slow" is:
a real user's tap lands while a GTM/FB/TikTok script is mid-task, and the
input has to queue behind it. That's a scheduling problem, not a handler
problem — it argues for deferring third-party init further (idle callback,
or first-interaction-gated) rather than optimising app-code handlers, which
this data shows are already fast.

### 8. Other main-thread items

- **Fonts**: not a TBT issue. `app/fonts.ts` — `rhZak` (brand display font,
  weight 700 only) is `display: "optional"` and explicitly `preload: false`
  ("a late-arriving display font must not repaint the hero H1" — correct
  reasoning, and correct for TBT too: an unpreloaded optional font can't
  block anything). `plexArabic` and `inter` are `display: "swap"`,
  self-hosted via `next/font/google`. `font-display-insight` = 0 ms wasted
  on every route sampled.
- **JSON-LD / structured data**: `components/JsonLd.tsx` is the only
  `dangerouslySetInnerHTML` site in the codebase, rendering
  `<script type="application/ld+json">…</script>`. This is **not parsed as
  JavaScript** by the browser — a `ld+json` script tag's contents are never
  handed to V8 unless something explicitly reads `.textContent` and calls
  `JSON.parse` on it (nothing here does). Whatever byte weight another
  audit found for duplicated Review/FAQ schema is a page-weight/SEO
  concern, correctly out of that audit's lane — it is **not** a TBT
  contributor on this site, and I'm flagging that explicitly so it doesn't
  get double-counted as a JS problem in a fix backlog.
- **Polyfills**: `.next/static/chunks/polyfills-*.js` is 112.6 KB and loads
  as a classic blocking `<script>` (not `async`, not `defer` — confirmed via
  the CDP script inventory). It attributes **zero** measurable time in every
  `bootup-time` run sampled, so its guard-clause checks are short-circuiting
  correctly on modern Chrome — the cost here is parse-only (a few ms at
  most), not execution. Worth a look at whether Next's `browserslist`
  target can drop this chunk's size, but it is not a meaningful TBT
  contributor today; noted for completeness per the brief's "anything else"
  ask, not ranked as a fix.
- **Duplicated first-party code**: `lib/analytics.ts` + `lib/attribution.ts`
  (tracking-layer, report only) are compiled into **two** separate chunks —
  once inside the shared `app/[locale]/layout-*.js` (29 KB, present on every
  route, contains the `gtag`/`fbq`/`ttq`/`dataLayer`/`sk-attribution` glue
  verified by grep), and again inside a second chunk `860-5e96d3d83c612faa.js`
  (9.5 KB) that `app-build-manifest.json` shows is pulled into exactly the
  pages that import `track()` directly for their own use — `/booking`,
  `/business`, `/careers`, `/contact`, `/franchise`, `/services/
  building-heat-isolation/quote`, `/warranty/claim`. `duplicated-javascript-
  insight` reports 0 wasted bytes because it needs source maps (none
  deployed) to detect this kind of duplication — it's real, found by direct
  chunk inspection, but the LH audit designed to catch it can't see it here.
  9.5 KB × 7 routes is a small, low-priority item; noted, not ranked (report
  only, tracking-layer).

## Ranked fixes: ms recovered per hour

Sorted by (measured/estimated median mobile ms recovered) ÷ (hours). "Report
only" rows are the tracking-layer per the audit's hard constraint — costs
measured, no refactor proposed, owner decides on the other branch.

| Fix | File(s) | Route(s) | ms recovered | Confidence | Hours | ms/hr |
|---|---|---|---|---|---|---|
| Code-split `DatePicker` (`next/dynamic`, `ssr:false`) | `components/forms/BookingWizard.tsx` (import at line 13) | `/booking` | ~62 KB unused JS removed from initial load for the `building`/`enquiry` flows (100%) and for `vehicle`-flow customers before they reach the date step; est. **150–300 ms** bootup-time off `/booking`'s 4200 ms median | Estimated (from measured 76% unused chunk 8648) | 1 | 150–300 |
| Virtualise the gallery thumbnail strip | `components/sections/GalleryViewer.tsx` (line 256 `.map`) | `/gallery` | scriptEvaluation on this route is 6824 ms with all 236 thumbnails mounted; windowing to ~15 visible items is the single biggest lever on the site's worst page. Conservative est. **1500–3000 ms** off the 5115 ms median TBT | Estimated | 4–6 | 250–500 |
| `LazyMotion` + `domAnimation`, swap `motion.*` → `m.*` | `lib/motion.ts` + ~19 call sites (`GalleryViewer.tsx`, `BookingWizard.tsx`, `Lightbox.tsx`, `Reveal.tsx`, `Accordion.tsx`, `HeroCarousel.tsx`, `Card.tsx`, `PartnersBand.tsx`, `TakaiComparison.tsx`, `TestimonialsCarousel.tsx`, `TierBreakdown.tsx`, `DocumentaryPlayer.tsx`) | every route (shared layout chunk) | 131.8 KB → ~30 KB first-party JS shipped everywhere; chunk 5672 already accounts for 2873 ms of home's bootup-time alone. Est. **300–600 ms** off every route's TBT | Estimated | 8–12 (mechanical but touches every animated component; needs full regression pass) | 30–60 |
| Cap `Reveal`/`RevealItem` cost: batch the 2.5 s force-visible timers, or lazy-init `useInView` only for below-the-fold instances | `components/ui/Reveal.tsx` | home, all `<Reveal>`-heavy pages | Contributory to the 1388–2182 ms `styleLayout` numbers on home/`/en`; hard to isolate precisely without a trace | Estimated, low confidence | 3 | unknown — needs a trace first |
| Investigate `/en` vs `/` 3× TBT gap with a Performance-panel trace diff | n/a (diagnostic, not a fix) | `/en` | Currently paying **+1506 ms** median TBT vs `/` for identical code | n/a | 2 (diagnostic only) | n/a |
| — *report only* — defer/idle-gate `initAnalytics()`, or move pixel init to first-interaction | `lib/analytics.ts`, `components/providers/Analytics.tsx` | every route | Measured ceiling (full removal): **~347 ms** median on home (§2 block-and-diff); idle-gating alone likely recovers less since these scripts already fire at t≈7–13s | Measured (ceiling), estimated (idle-gate delta) | owner decides, other branch | — |
| — *report only* — dedupe `lib/analytics.ts`/`lib/attribution.ts` out of the second chunk `860-*.js` | `lib/analytics.ts`, `lib/attribution.ts` | `/booking`, `/business`, `/careers`, `/contact`, `/franchise`, quote, `/warranty/claim` | ~9.5 KB × 7 routes not re-downloaded (browser-cached chunk anyway after first visit) — low impact | Measured (duplication), estimated (impact) | owner decides, other branch | — |

## What is already good (do not touch)

- **Pixel loading strategy** (`lib/analytics.ts`): async, post-hydration,
  non-render-blocking. There is no `next/script` strategy to "move" because
  it's already hand-rolled to the equivalent of `lazyOnload`. Don't refactor
  this to add a strategy prop that already exists in substance.
- **Leaflet on `/branches`**: correctly `await import("leaflet")`'d inside a
  `useEffect`, not in the initial bundle. Confirmed absent from the route's
  `app-build-manifest.json` entry.
- **`date-fns` locale scoping**: only `ar` + `enUS` imported, not the full
  locale directory.
- **`next/image` lazy loading on `/gallery`**: native lazy loading is doing
  its job — 53 of 236 possible thumbnail images actually requested. The
  gallery's problem is DOM/component mount cost, not network.
- **Fonts**: self-hosted, `display: swap`/`optional` used correctly,
  zero wasted ms per Lighthouse's own audit.
- **JSON-LD**: inert, not a JS-execution cost regardless of its byte size.
- **Server/client component split for `<Reveal>` consumers**: `PageHero.tsx`,
  `CtaBand.tsx`, `home/FeatureGrid.tsx`, `home/ServicesSection.tsx`,
  `services/ServiceDetailBody.tsx`, `services/ServicesGrid.tsx`,
  `Testimonials.tsx` all stay server components despite containing
  `<Reveal>` — the client boundary is correctly pushed down to the leaf
  component, not hoisted to the page.
- **Tracking taxonomy** (`lib/analytics.ts` type system): one call site
  (`track()`) fans out to every platform, env-var gated per platform, no
  hard-coded IDs in components. Not a performance point, but worth saying
  since I read the whole file: it's well-built for what it does.

## Open questions for the owner

1. `/en` vs `/` — 2282 ms vs 776 ms median TBT on byte-identical component
   code, DOM size actually *smaller* on `/en`. I could not isolate the root
   cause within this pass's budget (ruled out: fonts, DOM size, bundle
   differences). Worth a dedicated Performance-panel trace diff before
   spending fix hours here — do you want that as a follow-up pass?
2. Gallery virtualisation is the highest-value fix on the site by a wide
   margin (worst route, largest first-party scriptEvaluation floor) but is
   the most invasive change proposed here (a real UI/behaviour change to
   how the thumbnail strip scrolls/keeps-in-view). Given `docs/progress/
   20-gallery-viewer.md` describes deliberate UX choices for this component
   (real-estate-style viewer, thumbnail strip design), do you want this
   scoped as its own phase rather than folded into a generic perf pass?
3. `LazyMotion` migration touches ~19 files across the whole component
   tree. Mechanical, but "mechanical across 19 files" is still a full
   regression surface (every animated interaction on the site). Want this
   as its own phase with its own review, or bundled with other perf work?
4. Confirmed no consent/region gate on pixel init (matches the memory note
   that a consent banner is HELD) — the ~347 ms measured ceiling from fully
   blocking the four trackers is the number to keep in mind whenever that
   consent-gating work happens on the tracking branch: gating pixel init
   behind consent will, for any visitor who doesn't consent, recover
   roughly that much TBT for free, as a side effect of the compliance work
   rather than a separate perf task.
