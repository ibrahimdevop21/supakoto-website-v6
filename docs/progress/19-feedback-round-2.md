# Phase 19 — feedback round 2 (Hussein + VP) + booking wizard: all seven services + date/time picker

*Brief drafted 2026-08-21 from Ibrahim's two messages (feedback round; wizard
re-spec). Status: **AWAITING APPROVAL — no code written.** Items 1–5 were
declared autonomous; the second message replaced item 1 with a larger spec,
so the whole round goes through the brief first.*

═══ BRIEF phase-19 ═══

## READ FIRST (in order)
1. `CHECKPOINT.md` (2026-08-19 TL;DR — Phase 18 is now merged to `main`, pushed; `main` = `origin/main` = `463831e`)
2. `docs/progress/18-pre-cutover-tracking.md` + `docs/progress/TRACKING-SPEC.md` (event contract the wizard must extend)
3. `docs/progress/10-building-heat-isolation.md` (why the building funnel is quote-only)
4. `content/services.ts`, `components/forms/BookingWizard.tsx`, `components/forms/BuildingQuoteForm.tsx`
5. `docs/progress/ASSETS-NEEDED.md` line 122 (branch hours already logged as outstanding)

## WHAT I VERIFIED BEFORE WRITING THIS (facts, not assumptions)

| Claim in the message | What the code / production actually shows |
|---|---|
| "Currently the wizard only offers PPF" | **Not true on production.** Playwright against `supakoto-website-v6.vercel.app/booking` and `/en/booking` at 390px: the service step lists PPF, Heat Isolation, Colour Change, Nano Ceramic — all four `substrate === "vehicle"` entries (`vehicleServices`, since commit `5b537db`). So the original item 1 ("audit vehicle list") has **zero missing services**. The new spec (all seven, branched) still stands and is what this brief builds. |
| Gallery has duplicates, Porsche twice adjacent | Confirmed, two distinct problems: (a) `sk-123.webp` and `sk-234.webp` are **byte-identical** (same md5; white Rolls-Royce, portrait) — positions 17 and 36 of the list; (b) `sk-230` and `sk-232` are the **same green Porsche Taycan from two angles, adjacent** in the list (positions 34–35). No other near-duplicates at perceptual-hash distance ≤ 12/256. |
| Gallery sizes inconsistent | By design today: `content/gallery.ts` derives `aspect` per image (36 photos at 3:2 landscape or 3:4 portrait, plus 4 surface/2 building photos at odd ratios and a 16:9 video) and `GalleryGrid` uses `aspect-square / aspect-3/4 / aspect-4/3` per tile → mixed tile heights in a 2/3-column grid. |
| Maserati logo is wrong | **There is no Maserati anywhere**: not in `content/partners.ts`, not in `public/images/partners/`, not in the V2 `public/partners/` set Ibrahim approved on 2026-08-11, not in the brand-kit folder. Contact sheet of all 29 logo files: none is a mislabelled Maserati. So the answer to "wrong file / distorted / wrong size / missing" is **missing** — and it was never in the approved set. Side-finding from the same sheet: Porsche's and Bentley's wordmarks are black on transparent, so on the dark band only the crests read; not the reported bug, noted for Q4. |
| Heat isolation label | `services.items.heat-isolation.name` = «العازل الحراري» / "Heat Isolation" (bare). That key is what the home services section, `/services` index (both render `ServicesGrid`), booking wizard, gallery filter, related-services cards, breadcrumbs and Service JSON-LD all display. The nav has unused keys `servicesHeatCars` («العازل الحراري — سيارات» / "Heat isolation — cars") left over from the pre-Phase-14 dropdown. Footer lists no services. The service page's own H1/SEO title already say «عزل حراري للسيارات». |
| Branch hours for time slots | Not in `content/branches.ts`. V2 (`src/data/branches.ts`) carried «السبت–الجمعة: 10ص–8م» for every branch (one had «الأحد: مغلق»). V2 phone data was proven unreliable, so V2 hours are a *default*, not a fact. |
| Date-picker library RTL | `react-day-picker` v9 (context7 docs): `dir="rtl"`, `locale={ar}` from `react-day-picker/locale` (date-fns), `numerals` defaults to `"latn"` (Western digits even under `ar`), `weekStartsOn`, full keyboard model (arrows / Enter / Escape), `disabled` matchers for past/future. Adds `react-day-picker` + `date-fns` to dependencies — the first non-framework deps besides Leaflet. |

## CONFLICTS WITH THE CURRENT WIZARD (the report you asked for before building)

1. **Step order.** Today: region → branch → service → car → date → time → contact → confirm. The new flow branches on service, and building/marine/interior have no branch — so **service must move to step 1**. Region must stay a step for *every* substrate: it decides the WhatsApp line (`regions[region].whatsapp`), and the building form already asks region + governorate/emirate. Proposed shared spine: **service → region → (substrate steps) → contact → confirm**.
2. **"Reuse the building form's steps" — the building form has no steps.** `BuildingQuoteForm` is one long `<form>` with five fieldsets (property, region+area, measurements, problem, contact). Two honest ways to reuse it — see Q1.
3. **Wizard progress bar** is `stepIndex / STEPS.length` over a fixed tuple; it must become per-flow.
4. **Intent log and events** are per-form (`kind: "booking"`, key `sk-booking-intents` vs `kind: "quote"`, key `sk-building-quote-intents`; `booking_complete` vs `quote_complete`). The wizard must emit the *quote* shape for building and a new *enquiry* shape for marine/interior; `lib/analytics.ts` `EventMap`, `TRACKING-SPEC.md`, and `scripts/e2e-analytics.mjs` (84 cases) all need the new events.
5. **`booking_start` fires on mount**, before any service is known. With service first, the funnel-top event is substrate-agnostic — see LD-9.
6. **`booking.steps.confirm` summary rows** are hardcoded to region/branch/service/car/datetime — needs per-flow rows.

## SCOPE
- A. Bugs 2–5 from the feedback round (heat-isolation label, gallery, Maserati report, homepage text audit).
- B. Booking wizard: all seven services from `content/services.ts`, substrate branching, shared building fieldsets, enquiry flow, events, build guard.
- C. Date + time picker in the vehicle flow (react-day-picker; slot buttons from branch hours).
- D. Docs only: `BOOKING-TIER-DECISION.md`, `CONTENT-ROADMAP.md`.

## NOT IN SCOPE
- Capturing film tier in the wizard (item 6 — decision doc only).
- Live capacity / bdm-flow writes (slots are requests; confirmation copy says so).
- Per-service galleries, case studies, customer stories (roadmap doc only).
- Adding any Maserati (or other new) logo without Ibrahim's explicit word + a real file.
- Marine/surface indexing (`NOINDEX_SERVICE_IDS` untouched) or any spec figures for them.
- Redesigning the standalone `/services/building-heat-isolation/quote` page — it keeps working, same fields.

## ROLE REFERENCE
Public site, no auth. One "role": an anonymous visitor in Egypt or UAE. Region comes from `RegionProvider` (cookie) and is re-asked in the wizard; the wizard's choice wins for the WhatsApp line (same rule as the quote form today).

## LOCKED DECISIONS (proposed — these override any earlier phrasing once approved)
- **LD-1 Step spine:** service → region → substrate steps → contact → confirm. Vehicle: branch → car → date → time. Building: property → area (governorate/emirate) → measurements (area m² or window count + dims, floors, glass type) → primary problem. Marine/interior: one free-text "brief description" step (optional, max 500 chars). Region is pre-selected from `RegionProvider` like today.
- **LD-2 Service step** renders `services` (all seven) straight from `content/services.ts`, grouped visually by substrate (cars / buildings / pending), never a hardcoded list. Marine/interior cards carry the existing "pending confirmation" line so nobody expects a quote.
- **LD-3 Building reuse = shared fieldset components.** `BuildingQuoteForm` is split into `components/forms/building/{PropertyStep,LocationStep,MeasurementsStep,ProblemStep}.tsx` + shared `Draft` type + validators + `buildQuoteMessage()`. The standalone `/quote` page stacks them in one `<form>` exactly as today (no visual change); the wizard pages them. One message builder → both paths send the identical WhatsApp body with first line «طلب عرض سعر — عزل حراري للمباني» (existing `buildingQuote.wa.title`).
- **LD-4 WhatsApp first lines:** vehicle = existing `booking.waTitle`; building = existing `buildingQuote.wa.title`; marine/interior = new `booking.waEnquiryTitle` «استفسار — {service}» / "Enquiry — {service}". Ref line second in all three.
- **LD-5 Events:** `booking_start` (on mount, as today, all substrates — it is "wizard opened") and `booking_step` (every step, now with `flow: vehicle|building|enquiry`). Completion: `booking_complete` (vehicle, unchanged), `quote_complete` (building, gains `service` + `source: "wizard"|"page"`), new `enquiry_complete` `{ ref, region, service }` mapped like the other primaries (GA4 + generate_lead, Meta Lead, TikTok SubmitForm). `quote_start`/`enquiry_start` fire when the substrate branch is entered. Intent log: one key `sk-intents` going forward? **No** — keep the two existing keys and add `sk-enquiry-intents`; TRACKING-SPEC updated; e2e-analytics extended.
- **LD-6 Build guard:** `scripts/check-wizard-services.mjs` imports `content/services.ts` and the wizard's exported `FLOWS: Record<Substrate, Step[]>` and fails if any service's substrate has no flow or any service id is filtered out; plus TS exhaustiveness (`satisfies Record<Substrate, …>`). Wired into `pnpm build` and `pnpm guards`.
- **LD-7 Heat-isolation label:** rename the canonical `services.items.heat-isolation.name` to «عزل حراري للسيارات» / "Car Heat Isolation" — one key, every surface (home grid, /services index, wizard, gallery filter, related cards, breadcrumbs, Service JSON-LD). Delete the dead `nav.servicesHeat*`/`servicesPpf`… keys. Claim guards re-run.
- **LD-8 Gallery:** every tile `aspect-4/3` + `object-cover` (video tile too); drop the `aspect` field and the per-image ratio logic from `content/gallery.ts`; lightbox keeps natural ratio. De-dup: remove `sk-234` (byte-identical to `sk-123`) and `sk-232` (keep `sk-230`, the three-quarter view); delete the two webp files and their `gallery.items.*` alt keys in both locales.
- **LD-9 Maserati:** report only — no logo added. If Ibrahim confirms Maserati belongs in the roster he supplies or approves the file; `confirmed: false` placeholder pattern is NOT used for car brands.
- **LD-10 Date picker:** `react-day-picker` v9 + `date-fns`. `dir` from locale, `locale={ar}`/`enUS`, `numerals="latn"`, `weekStartsOn={6}` (Saturday) for both regions, disabled = today and past, max = today + 60 days, Arabic month names from the locale. No weekend/closure shading until ops data exists (logged in ASSETS-NEEDED). Styled with our tokens, not the library CSS.
- **LD-11 Time slots:** add `hours?: { open: string; close: string }` to `Branch`; seed every branch with V2's default 10:00–20:00 and mark it `// DEFAULT — ops unconfirmed` + ASSETS-NEEDED entry. Slots hourly from open to close − 1h (10:00 … 19:00), 4-col at 390px. Past slots on today's date never arise (today is disabled). Slot buttons render disabled+greyed rather than hidden when a rule excludes them.
- **LD-12 Confirmation copy:** success screen + WhatsApp body say the slot is a request the team confirms (`booking.success` already says "we'll confirm your slot"; the date/time summary row gains «(يؤكده الفريق)» / "(team confirms)").
- **LD-13 Homepage text audit method (item 5):** Playwright, 390/768/1440/1920 × ar/en, after 3.5s (past the 2.5s Reveal fail-safe): flag any text node with computed opacity < 0.05, `scrollWidth > clientWidth` on a non-scrolling box, `scrollHeight > clientHeight` inside `overflow-hidden`/`line-clamp`, or `elementFromPoint` at its centre resolving to a different non-descendant element. Findings reported with viewport + locale; only genuine defects fixed, design-intended clamps (testimonial 6-line clamp with "read more") reported as such.
- **LD-14 Git:** branch `feat/phase-19-feedback-round-2` off `main`; one commit per item; local only; no push/merge.

## OPEN QUESTIONS (each maps to a proposed default above — "approved" alone accepts the defaults)
- **Q1 (LD-3)** Building reuse as shared fieldset components (recommended; both paths stay identical, standalone page unchanged) — or the zero-refactor alternative: embed the whole `BuildingQuoteForm` as a single wizard screen after service+region (faster, but a 10-field screen inside a one-question-per-screen wizard)?
- **Q2 (LD-7)** Canonical rename of the heat-isolation name everywhere (incl. breadcrumbs/JSON-LD) vs a separate list-only label? English wording: "Car Heat Isolation" (default) or "Heat Isolation — Cars"?
- **Q3 (LD-8)** 4:3 for every tile (default; portraits centre-cropped) vs 1:1? And confirm drop `sk-232` (keep `sk-230`).
- **Q4 (LD-9)** Is Maserati a confirmed client brand that should be in the roster? If yes, who supplies the logo file? (Hussein may also have been seeing the Porsche tile with its black wordmark invisible on the dark band — say if you want those two wordmarks fixed.)
- **Q5 (LD-11)** Confirm 10:00–20:00 as the interim default for every branch (V2's figure) — or a narrower range?
- **Q6 (LD-10)** OK to add `react-day-picker` + `date-fns` as dependencies?
- **Q7 (LD-5)** OK that `booking_start` stays the single funnel-top event for all three flows (funnel = wizard opened → flow entered → completed)?

## APPROVAL — 2026-08-21, Ibrahim: "Approved with three overrides, plus two asset fixes."
Q1 shared fieldsets ✔ · Q2 canonical rename, "Car Heat Isolation" ✔ · Q5 10:00–20:00 interim ✔ · Q6 deps ✔ · enquiry_complete primary ✔.
Overrides and additions (these supersede the LDs above):
- **LD-8 → 16:9**, not 4:3 — car photography is shot wide; video tiles match. Drop `sk-234` + `sk-232`, keep `sk-230`. Spot-check the set first: if a meaningful number are portrait, say so and reconsider rather than crop them to nothing.
- **LD-9 → Maserati ships.** Ibrahim put `maserati-4.svg` in the repo root: convert per the existing convention → `public/images/partners/maserati.webp`, add the entry to `content/partners.ts` (+ names in both locales). **Also fix the Porsche and Bentley dark wordmarks** (invert or white variants); if inverting looks wrong, log in ASSETS-NEEDED instead of shipping a half-invisible logo. **Audit every marquee logo** for the same dark-on-dark problem.
- **LD-5 → flow-specific funnel tops.** `booking_start` / `quote_start` / `enquiry_start` each fire **on service selection** (where the flows diverge), not on mount. No shared funnel-top event.
- **New — Japan flag.** `Flag_of_Japan.svg.webp` was committed at the repo root in Phase 15 while `/about` already referenced `/images/brand/flag-japan.webp` → broken image. Move it, verify it renders on the loaded page, audit **every** image reference in the codebase against disk, report any other orphans, and add a **build guard** (`scripts/check-image-refs.mjs`) that fails on any referenced image path with no file.
- **New — step-1 heading flow-neutral.** «ابدأ طلبك» / "Start your request" (or similar) on the service step; final CTA changes per flow (book / request quote / send enquiry). Page title/hero copy for `/booking` reviewed for the same neutrality.
- Proceed 0 → A → B → C autonomously, no gates, one report at the end.

## PHASES & GATES
| Phase | Content | Halt condition | Unlocks |
|---|---|---|---|
| 0 | Docs: `BOOKING-TIER-DECISION.md`, `CONTENT-ROADMAP.md` (with the client-permission warning) | none | — |
| A | Bugs: heat label (LD-7), gallery (LD-8), Maserati report (LD-9), homepage audit (LD-13) + fixes | audit finds something that needs a design call | report |
| B | Wizard: seven services, spine, building fieldset split, enquiry flow, events, guard, i18n, e2e | any step needs a field we can't justify for marine/interior | report |
| C | Date/time picker (LD-10/11/12), 390px touch test | library fails RTL/keyboard check in practice | report |
| End | `pnpm build` (all guards) · lint · typecheck · i18n parity · smoke · e2e-whatsapp · e2e-analytics · crawl · JSON-LD | any red | checkpoint + report |

Order: 0 → A → B → C. One "approved" covers all; no re-confirmation between phases unless a halt condition fires.

## GIT DISCIPLINE
`feat/phase-19-feedback-round-2`, imperative subjects, one commit per item, no AI trailers, **no push / merge / deploy** until told.

## SMOKE CRITERIA
- Wizard: for each of the seven services, complete the flow in ar and en at 390px; WhatsApp URL decodes to the right first line, ref on line 2, right regional number, no car fields in building/enquiry bodies, no branch/date in non-vehicle bodies.
- Standalone `/services/building-heat-isolation/quote` still submits the same body as the wizard's building path (diff the decoded text).
- `scripts/check-wizard-services.mjs` fails when a service is commented out of a flow (prove it once, then restore).
- Calendar at 390px ar: week reads right-to-left, starts Saturday, Western digits, Arabic months; keyboard: arrows/Enter/Escape; today + past disabled; nothing after +60d.
- Gallery: every tile same ratio at 390/768/1440; 2 files gone; no missing alt keys (i18n parity).
- Heat-isolation label: «عزل حراري للسيارات» wherever the building service also appears; grep for bare «العازل الحراري» returns only body copy, never a list label.
- Homepage audit: report table (viewport × locale × element × defect); zero unexplained findings after fixes.
- All guards + e2e suites green; no new phone literals; no competitor names.
