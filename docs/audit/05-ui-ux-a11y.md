# 05 — UI / UX / Accessibility

Read-only audit of the LIVE site https://supakoto.com, 2026-08-25. Tooling: Lighthouse 13.4.1 JSON already in
`docs/audit/data/lh/` (home + /services/ppf, mobile + desktop) plus my own axe-core 4.10.2 runs (WCAG 2.x A/AA +
2.2 AA + best-practice rulesets) via Playwright 1.62 / Chromium on 14 pages × 2 viewports (390×844 mobile emulation,
1350×940 desktop), keyboard walks, RTL probes, and three booking-wizard flows in both locales at 390px. No form was
submitted: the only submit clicked was the `/contact` form with `/api/forms` intercepted by `page.route` (0 requests
reached the server — and, as it turned out, the live form never calls the network anyway; see F1). Screenshots in
`docs/audit/data/screens/` (30 files). Code cross-checked against branch `feat/phase-23-forms-destination`.

**Important context discovered during the audit:** the live deployment is `main` (c4bee0a), i.e. PRE-Phase-23. The
five site forms on production are still `StubForm` — they show a success message and discard the submission, with a
bracketed developer note rendered to the public. Phase 23 (`FormShell` → `/api/forms` → Resend) exists only on the
local branch. Sections 5 and 6 report BOTH what is live and what the branch will ship.

## Score

| Route | Viewport | Lighthouse a11y | axe violations (rule × nodes) |
|---|---|---|---|
| `/` | mobile / desktop | 96 / 96 | color-contrast ×9, region ×1, scrollable-region-focusable ×1 (mobile only) |
| `/services/ppf` | mobile / desktop | 96 / 96 | color-contrast ×10, region ×1 |
| `/faq` | mobile / desktop | — | region ×1 |
| `/booking` | mobile / desktop | — | color-contrast ×2, region ×1 |
| `/gallery` | mobile / desktop | — | region ×1 |
| `/branches` | mobile / desktop | — | aria-command-name ×6, target-size ×2, region ×1 |
| `/warranty/claim` | mobile / desktop | — | color-contrast ×1 (the stub note), region ×1 |
| `/en` | mobile / desktop | — | color-contrast ×30 / ×32, region, scrollable-region-focusable |
| `/en/services/ppf` | both | — | color-contrast ×33, region |
| `/en/faq` `/en/gallery` | both | — | color-contrast ×2, region |
| `/en/booking` | both | — | color-contrast ×12, region |
| `/en/branches` | both | — | aria-command-name ×6, target-size ×2, color-contrast ×8, region |
| `/en/warranty/claim` | both | — | color-contrast ×4, region |

No page has horizontal overflow at 390px (`scrollWidth == innerWidth` on all 14). Every page has exactly one `<main>`
and one `<h1>` (home briefly has two `<h1>` during the hero crossfade; one after it settles). No `<img>` without `alt`.

**UX grade: 6/10.** The bones are good (logical CSS everywhere, RTL carousel/lightbox/calendar all travel the right
way, reduced-motion honoured, dialogs restore focus). It loses points for: forms on production that silently do
nothing (F1), a booking wizard whose "Next" button and next-step heading are off-screen on a phone (F2, F3), no
skip link, three "modal" dialogs that are not modal for the keyboard, and the contrast tokens that cost the 4 points.

## The missing 4 points (exact audits + elements)

Lighthouse's accessibility category on `/` and `/services/ppf`, mobile and desktop, has exactly ONE weighted failing
audit: **`color-contrast`** (weight 7). `label-content-name-mismatch` also fails (24–25 testimonial "read more"
buttons) but has weight 0, so it costs nothing. Everything else in the category scores 1. Fix the elements below and
the score is 100.

| Route × viewport | Element (selector) | Text | Measured | Cause (token) |
|---|---|---|---|---|
| `/` mob+desk | `tbody tr th span[dir=ltr]` | TAKAI PREMIUM PLUS | 2.95:1 (#bf1e2e on #221216) | brand red as 14px text on the `bg-sk-red/10` row |
| `/` mob+desk | `li.w-[85vw] figcaption span.block.text-fg-subtle` ×8 | branch name under each review | 3.27:1 (#6b6b70 on #1a1a1d) | `text-fg-subtle` on `bg-ink-800` |
| `/services/ppf` mob+desk | `p.mt-4.max-w-prose.text-eyebrow.text-fg-subtle` | "* مدى الحياة يعني مدى حياة السيارة…" (the mandatory lifetime qualifier) | 3.73:1 at 12px | `text-eyebrow text-fg-subtle` on page bg |
| `/services/ppf` mob+desk | `a.font-medium.text-sk-red[href=/authentic]` | "الفيلم الأصلي يأتي من الموزع المعتمد فقط" | 3.24:1 | `text-sk-red` as 14px link text |
| `/services/ppf` mob+desk | testimonial figcaptions ×8 | as above | 3.27:1 | same |

Root cause is two tokens: `--color-fg-subtle: #6b6b70` (3.27–3.73:1 on every dark surface; needs ≥ #8a8a90 for
4.5:1 on ink-800) and `--color-sk-red: #bf1e2e` used as text (2.95–3.24:1 on dark; fine as a button fill with white
text, not as body/link colour). The same two tokens produce every other axe contrast hit on the site
(`/booking` group eyebrows and "Book at a branch" sub-labels, `/branches` "Working hours: contact the branch",
`/faq` and footer "Installment options / Cards & wallets" eyebrows, `/warranty/claim` "Upload clear photos…").
EN pages flag ~3× more nodes than AR only because axe evaluates the Latin font differently at the 14px/normal-weight
boundary — the fix is identical.

## Findings table

| # | Impact | Effort (h) | Finding | Evidence |
|---|---|---|---|---|
| F1 | CRITICAL | 0 (deploy Phase 23) | Every form on production is a stub: submit shows "وصلتنا رسالتك — سنرد عليك قريبا" and nothing is sent; a bracketed dev note "[يفعل الإرسال مع ربط الأنظمة — النموذج شكلي حاليا]" / "[Claim submissions activate with system link — this form is temporary]" is rendered publicly under every form. A customer filing a warranty claim believes it was filed. | `contact-after-submit-live.png`; 0 requests to `/api/forms` on submit; `git show main:components/forms/StubForm.tsx` |
| F2 | HIGH | 1 | Booking wizard step 1 on a phone: after tapping a service the **Next button sits at y≈1353px** (viewport 844) — below the fold, nothing visibly happens except a border highlight. Same on the branch step (Next at y≈1068). | probe: `/booking` 390px, Next y=1353 (AR) / 1380 (EN); `wiz-ar-v1-service.png` |
| F3 | HIGH | 1 | On every step change the page keeps its scroll position and focus drops to `<body>`: the new step's `<h2>` lands at **y = −368px** (AR) / −418px (EN), i.e. the customer sees the middle of the next screen and never the question. Screen-reader users get no announcement. | probe "step2 scrollY after Next: 871, h2 y: -368"; wizard keyboard walk "focus after Next: BODY" |
| F4 | HIGH | 2 | Three `role=dialog aria-modal=true` overlays are not modal for the keyboard: Lightbox, RegionPicker, and the testimonial modal let Tab walk out into the page behind (Lightbox: after prev/next, Tab goes to the header nav). RegionPicker also does not restore focus to its trigger on close. Mobile drawer is fine (its contents fill the tab ring). WCAG 2.4.3 / 2.1.2-adjacent. | keys run: "lightbox tab cycle: […,OUT,OUT,OUT]", "region modal tab cycle inDialog: […false,false]" |
| F5 | HIGH | 0.5 | No skip link on any page; first Tab lands on the logo, then 9–13 header controls before content (desktop) or 4 (mobile). WCAG 2.4.1. | metrics `skip=False` ×28; tab sequences |
| F6 | HIGH | 1 | Wizard phone field accepts anything ≥10 chars ("abcdefghij" enables Next); no `inputmode`, `autocomplete=tel`, no per-country pattern, no error text ever — the only feedback anywhere in the wizard is a greyed Next button. Same `length>=10` rule in `BuildingQuoteForm`. | wizard run: "phone 'abcdefghij' next enabled?: true"; `BookingWizard.tsx` `canContinue.contact` |
| F7 | HIGH | 2 | Wizard state is lost on refresh (back to step 1) and browser Back leaves `/booking` entirely — 8 screens with no history entries and no `sessionStorage`. The "Back" button inside the wizard is the only way back. | wizard run: "after reload step: ابدأ طلبك", "after browser Back url: …/booking?service=ppf" (previous page) |
| F8 | HIGH | 1 | Desktop nav dropdown: Escape closes it only while focus is on the trigger button; once Tab has moved into a child link, Escape does nothing (`aria-expanded` stays true). No `aria-controls`. | keys run: "after Esc expanded: true" (AR and EN) |
| F9 | MED | 1.5 | Colour tokens fail 4.5:1 (see section above). Includes the lifetime-warranty qualifier — the one line the brand rules say must always be visible — rendered at 12px and 3.73:1. | LH + axe color-contrast |
| F10 | MED | 1 | Leaflet on `/branches`: six pin markers are `role=button tabindex=0` with **no accessible name** and are 18×18px; zoom buttons 30×30; popup close/zoom labels in English on Arabic pages ("Zoom in", "Close popup"); popup links 13px / 17px tall. | axe aria-command-name ×6, target-size ×2; `branches-map-popup.png` |
| F11 | MED | 0.5 | Hero carousel dots are **16×4px** (active 32×4) buttons — the smallest targets on the site; WCAG 2.5.8 passes only via the spacing exception. Effectively untappable on a phone. | touch list `/`: `button.h-1.rounded-full` 16×4 ×4 |
| F12 | MED | 0.5 | Comparison table wrapper `div.mt-10.overflow-x-auto` on `/` scrolls horizontally on mobile but is not keyboard-focusable (axe `scrollable-region-focusable`, serious). | axe `/` mobile |
| F13 | MED | 1 | Header controls are 36px tall (burger 36×36, locale 44×36, region 49×36, "احجز الآن" 82×36, logo 85×36); footer socials 40×40; gallery stage arrows 38×38; testimonial prev/next 40×40; gallery filter chips 40 tall; branch-card phone/WhatsApp/Directions 40 tall; footer phone/WhatsApp/email links 27 tall; privacy link 22. All ≥24 (2.5.8 AA passes) but none meets the 44×44 mobile target. | touch lists, all six routes |
| F14 | MED | 0.5 | Native inputs signal focus only by a 1px border colour change (`focus:outline-none focus:border-sk-red`) — weak against 2.4.11/2.4.13 focus-appearance; buttons/links have a proper 2px red outline. | `components/ui/Field.tsx` `control` string |
| F15 | MED | 1 | Wizard summary shows the date as raw ISO `2026-08-26` while the calendar footer shows "الأربعاء 26 أغسطس 2026"; the WhatsApp message carries the ISO form too. Time slots and hours are fine (LTR, tabular). | `wiz-ar-v8-confirm.png`; `slotLabel` in BookingWizard |
| F16 | MED | 0.5 | Governorate/emirate `<select>` starts with an empty `<option value="" disabled>` — no "اختر…" placeholder label, so the control reads as blank; screen readers announce nothing. | wizard run "blank option label empty? true" |
| F17 | MED | 0.5 | Measurements step accepts `-5` m² and `0` floors (only `min="1"` on the input, the wizard checks `length>0`). | wizard run "glazing=-5 floors=0 next enabled?: true" |
| F18 | MED | 0.5 | Required fields are not marked (no asterisk, legend, or `aria-required`) on any of the five forms; the only cue is the browser's native bubble after submit. | errors run: `starred=false`, `aria-req=null` on all forms |
| F19 | MED | 0.5 | Gallery: a 404 image leaves a broken `<img>` (naturalWidth 0) inside the stage with no placeholder/retry; no skeleton while loading. Stage keeps its aspect box so CLS = 0. | `gallery-img-404.png`; CLS 0 over 5 nexts |
| F20 | LOW | 0.5 | `FormShell` (branch, not live) `fetch("/api/forms")` has no `AbortController`/timeout: a hung request leaves the button "جار الإرسال…" forever; `Button disabled` + no spinner, no `aria-busy`. | `components/forms/FormShell.tsx` |
| F21 | LOW | 0.25 | WhatsApp FAB `<a>` sits outside any landmark (axe `region`, every page). Also 52×52 at bottom-start overlaps the footer's first text line on mobile ("الوكيل الحصري في مصر…"). | axe region ×28; keys run "fab under: FOOTER…" |
| F22 | LOW | 0.25 | Locale switcher text "التبديل إلى العربية" on EN pages (and "Switch to English" on AR) has no `lang` attribute — mispronounced by screen readers; `hreflang` is set. | keys run header links |
| F23 | LOW | 0.5 | Gallery stage: with a mouse, a drag-to-swipe ends in a `click` on the full-bleed zoom button and opens the lightbox (touch is unaffected). | keys run "lightbox opened by mouse-drag swipe?: 1" |
| F24 | LOW | 0.25 | Service pages' "احجز هذه الخدمة" link to bare `/booking`; there is no `?service=` preselect anywhere in the code, so the customer re-picks the service they just read about. | grep: no `useSearchParams` in wizard; "preselect ?service=ppf pressed: 0" |
| F25 | LOW | 0.5 | 12px text is used for meaningful copy: section eyebrows, "متاح مطفي" badge, gallery counter, "فرع امتياز" badge, and the warranty footnote (F9). | metrics `small<14` |

## 2. WCAG 2.2 AA beyond Lighthouse

- **Keyboard traps:** none found — nothing captures Tab permanently. The opposite problem exists (F4): dialogs let
  focus leak out. Escape works on drawer, region modal, lightbox, testimonial modal; NOT reliably on the desktop
  dropdown (F8). FAQ accordion: `h3 > button[aria-expanded][aria-controls]` → `region[aria-labelledby]`, Enter
  toggles, 15 items, 67px tall. Correct.
- **Focus order vs visual order (RTL):** matches. Desktop AR tab sequence runs logo (x=1182) → nav right-to-left
  → locale → region → CTA (x=83) → content. Mobile AR: logo → EN → مصر → burger (x=20). Correct.
- **Visible focus:** all buttons/links show `outline 2px #bf1e2e` (`focus-visible`); text inputs only change border
  colour (F14). Programmatic focus on Close buttons (drawer, lightbox) shows no ring — acceptable, it is
  `focus-visible` behaviour.
- **ARIA:** choice buttons use `aria-pressed` correctly; drawer has `aria-controls="mobile-drawer"` + `aria-expanded`;
  desktop dropdown lacks `aria-controls`; testimonial cards use `aria-label="اقرأ المزيد — name"` which overrides the
  visible quote (LH `label-content-name-mismatch`, harmless but noisy); Stars are `role=img` with label; Leaflet pins
  have no name (F10). Live regions: FormShell success `role=status`, error `role=alert`; calendar footer
  `aria-live=polite`; wizard step changes have NO live region and no focus move (F3).
- **Form labels:** every `input/select/textarea` on all five forms and all wizard steps has a bound `<label for>`
  (0 unlabeled controls found). Building steps wrap groups in `<fieldset>` with `sr-only` legend. Good.
- **Heading order:** clean on all audited routes (H1 → H2 → H3, no skips). Wizard step titles are `<h2>`.
- **Skip link:** absent (F5). **Focus not obscured:** no case found where a focused element was covered by the fixed
  header (`obscured` false throughout); the fixed header does not overlap because pages pad for it.
- **Dragging alternatives (2.5.7):** testimonials and gallery both have prev/next buttons and arrow keys; thumbnail
  strip is a native scroll with buttons. Pass.
- **Target size (2.5.8):** AA (24×24) passes everywhere except Leaflet pins (18px) and — via the spacing exception
  only — the 4px-tall hero dots (F11). 44×44 mobile: fails broadly (F13).

## 3. RTL correctness

- **Gallery carousel (AR):** "next" moves toward the reading direction. Verified: ArrowLeft advanced 2→3, a
  finger-right swipe advanced 1→2, "التالي" button sits at x=29 (left edge) with an un-rotated left chevron, "السابق"
  at x=323 rotated 180°. Lightbox mirrors identically (close at top-left in RTL via `end-4`). Correct.
- **Testimonials (AR):** next button scrolls `scrollLeft` −347 → −695 (leftward = forward in RTL); prev icon
  `scale: -1 1`, next `scale: 1`; prev is to the right of next. Cards keep the reviewer's own `dir`/`lang` (mixed
  rtl/ltr by design). Correct.
- **Date picker (`DatePicker.tsx`, react-day-picker v10):** `weekStartsOn={6}` → Saturday first in both locales
  (AR: سبت…جمعة right-to-left, cell x 311→33; EN: Sa…Fr). `numerals="latn"` → Western digits, per brand rule.
  Month/day names from date-fns `ar`. Nav: "الشهر السابق" at x=317 (right) and "الشهر التالي" at x=33 (left), both
  `rtl:rotate-180` — correct direction of travel. Selected-day footer localised. Day cells 42×42. Today disabled +
  underlined, past disabled, 60-day horizon. Timezone: browser-local `new Date()` — a UAE customer booking an Egypt
  branch at 23:30 Gulf time can pick "tomorrow" that is still today in Cairo; harmless at this granularity.
  No holidays/closure days modelled (documented as ASSETS-NEEDED).
- **Phone inputs:** `PhoneInput` forces `dir="ltr" text-start type="tel"` — correct in every form and the wizard.
  Phone numbers in footer/branch cards/map popups all `dir="ltr"`.
- **Icons:** chevrons (nav dropdown, accordion, carousel arrows, calendar nav) mirror via `rtl:` variants or are
  direction-neutral (down chevron). Logos, stars, checkmarks, WhatsApp/social icons do not mirror. Correct.
- **Mixed AR/EN strings:** summary `<dd dir="auto">`, ref numbers `dir="ltr"`, `<bdi>` around reviewer names. The
  "Toyota Land Cruiser" row renders correctly in the AR summary. Good.
- **Physical Tailwind classes:** grep of `components/` and `app/` for `ml-|mr-|pl-|pr-|left-|right-|text-left|
  text-right|rounded-l|rounded-r|border-l|border-r` → **0 occurrences**; 9 deliberate `rtl:`/`ltr:` variants for icon
  mirroring. Everything is `ms-/me-/ps-/start-/end-/text-start/text-end`. This is exemplary — do not touch.

## 4. Touch targets at 390px

Elements < 44×44 (deduplicated; full lists in the axe run). Under 24px in **bold**.

| Route (AR / EN identical unless noted) | Element | Size |
|---|---|---|
| all | header burger `button[aria-controls=mobile-drawer]` | 36×36 |
| all | locale switcher `a[aria-label]` | 44×36 (EN: 34×36) |
| all | region button "مصر"/"Egypt" | 49×36 (65×36) |
| all | logo link | 85×36 |
| `/` | hero CTA "احجز الآن" ×2 | 82×36 |
| `/` | **hero dots ×5** `button.h-1.rounded-full` | **16×4 / 32×4** |
| `/`, `/services/ppf` | testimonial prev/next | 40×40 |
| all (footer) | social links ×5 | 40×40 |
| all (footer) | phone / WhatsApp / email rows | 165×27 / 69×27 / 168×27 |
| all (footer) | "الموزع المعتمد الوحيد…" link, privacy link | 307×21, 103×22 |
| `/services/ppf` | inline link "الفيلم الأصلي يأتي من…" | 320×21 |
| `/gallery` | filter chips ×9 | 51–192×40 |
| `/gallery` | stage prev/next | 38×38 |
| `/booking` | (wizard buttons are ≥ 44 — slots 79×53, day cells 42×42, choice cards ≥ 100 tall) | — |
| `/branches` | **Leaflet pins ×6** | **18×18** |
| `/branches` | zoom in / out | 30×30 |
| `/branches` | **attribution links** Leaflet / OSM / CARTO | **215×14 / 85×14 / 42×14** |
| `/branches` | branch-card phone / WhatsApp / Directions ×6 each | 161×40 / 93×40 / 82×40 |
| `/branches` | popup links (phone/WhatsApp/Directions), popup close | 101×17 / 42×17 / 50×17, 24×24 |

Counts: `/` 24 under-44 (8 under-24), `/services/ppf` 18 (4), `/faq` 15 (3), `/booking` 15 (3), `/gallery` 26 (3),
`/branches` 44 (12). The under-24 set is entirely the hero dots, Leaflet pins/attribution, and 21–22px inline text
links — the inline links are exempt under 2.5.8; the dots and pins are not.

## 5. Booking wizard walkthrough (390px, `/booking`)

Three flows in `BookingWizard.tsx`: **vehicle** (ppf, heat-isolation, colour-change, nano-ceramic → 8 steps),
**building** (building-heat-isolation → 8 steps), **enquiry** (marine-ppf, surface-protection → 5 steps). All end in a
`wa.me` deep link, not a POST — so the "network failure" case does not apply to the wizard; it applies to the five
FormShell forms (section 6). I stopped at the review step in every run; the confirm button was never clicked.

Common to every flow and both locales (screens `wiz-ar-v1…v8`, `wiz-en-*-confirm`):
- Step 1 "ابدأ طلبك / Start your request": 7 tall cards grouped للسيارات / للمباني / قيد التأكيد. Progress
  "خطوة 1 من 8" appears only after picking (correct — total depends on the flow) but it appears ABOVE the cards and
  pushes them down 60px at the moment of tap. **Stuck point 1:** Next is 500px below the fold (F2).
- Every Next: page does not scroll, new heading is above the viewport, focus on body (F3). **Stuck point 2** — on a
  phone the customer lands mid-screen on the branch list / calendar / time grid and has to scroll up to read what is
  being asked.
- Back: works and preserves the answer (region stays "الإمارات" after Back). Browser Back exits (F7). Refresh wipes
  (F7).
- Validation: there are NO validation messages in the wizard at all. Next is simply disabled until `canContinue`; no
  hint says why. Tone/language therefore n/a — the hints under each title are good white-Arabic ("التقريبية تكفي —
  الفني يراجعها يوم التركيب").
- Required marking: none, and none needed on choice steps; the car/contact text fields have no indicator.
- Contact step: name ≥ 2 chars, phone ≥ 10 chars of anything (F6). No country-code prefix shown even though the
  region step already fixed the country; a UAE user typing 0501234567 and an Egypt user typing 01001234567 both pass,
  as does 10 spaces.
- Confirm: `<dl>` summary, correct labels both locales, CTA per flow ("أكد الحجز" / "أرسل طلب عرض السعر" /
  "أرسل الاستفسار"). Date shown as ISO (F15).
- Success screen (code-read, not exercised): `role=status` success line, "reopen WhatsApp" link, ref number LTR, and
  for vehicle the honest "الحجز المباشر من الموقع يفعل قريبا" note. Reasonable. Note the primary conversion event fires
  BEFORE `window.open`, so a popup blocker still counts a completion.
- URL preselect: **does not exist** (`?service=ppf` → 0 pressed) (F24).

**Vehicle (AR + EN):** service → country (2 cards) → branch → car → date → time → contact → confirm.
Region gating makes sense: Egypt lists 5 branches (Tagamoa, Zayed, Maadi, Alexandria, Damietta) with addresses; UAE
lists Dubai only. Region step defaults to the header RegionPicker's cookie value, and picking here does not change
the header — fine. Calendar (section 3) is the best screen in the flow. Time step: 10 hourly slots from
`DEFAULT_HOURS` 10:00–19:00 for every branch (ops hours unconfirmed — the customer cannot tell these are placeholders),
4-column grid, 79×53 buttons, "المواعيد طلبات — الفرع يؤكدها على واتساب" is honest.

**Building (AR + EN):** service → country → property (سكني/تجاري) → location (`<select>` governorate; emirates for
UAE) → measurements (area m² OR windows count+dims, floors, glass type) → problem (4 cards) → contact → confirm.
Stuck points: blank first `<option>` (F16); negative/zero numbers accepted (F17); when "عدد النوافذ" mode is chosen,
the dims textarea placeholder is the only guidance. Summary correctly shows "120 m² · الطوابق 3". Region change
clears the area (good).

**Enquiry (marine / surface):** service → country → details (optional textarea, 500 max, no counter) → contact →
confirm; "استفسار — المنتج قيد التأكيد" is shown on the card, honest. Summary shows "التفاصيل —" when empty. Short
and fine; 5 steps for "send us a line" is still one more than needed (country could be inferred from the header
region).

## 6. Loading and error states

- **Forms (live):** `StubForm` — no network, instant fake success, public dev note (F1). Native browser validation
  only ("Please fill out this field." in the browser's language, bubble disappears on scroll). No required marking.
- **Forms (branch, Phase 23 `FormShell`):** `sending` state disables the button and swaps its label; no spinner, no
  `aria-busy`, no timeout (F20); non-2xx → `role=alert` "تعذر الإرسال. حاول مرة أخرى — أو راسلنا على واتساب." and the
  input is preserved (good); success replaces the button with `role=status` + LTR ref. Honeypot is `aria-hidden
  tabIndex=-1 class=hidden` — fine. Multipart file upload on the claim form has no size/count limit client-side.
- **Gallery:** `next/image fill priority` for the stage, hidden eager preloads for prev/next, lazy 96px thumbs. No
  skeleton, no `onError` (F19). Stage is a fixed `aspect-[16/10]` box so there is zero layout shift while paging
  (measured 0 over 5 nexts). Videos `autoPlay muted loop` in the stage — under reduced-motion they still autoplay
  (only Framer transitions are gated). Empty-category state exists and is labelled.
- **Map (`/branches`):** Leaflet dynamic-imported client-side, Carto tiles. No loading state (a `bg-paper` box until
  JS arrives), no error state: with tiles blocked you get a grey #ddd rectangle with pins and no message
  (`branches-map-tiles-blocked.png`). No consent gate — tiles come from `basemaps.cartocdn.com` (third-party request,
  no cookies set); the privacy policy should mention it if it does not. Popups are `innerHTML` strings but built from
  trusted content only.
- **Suspense:** no `Suspense` boundaries anywhere; nothing streams. **Client fetches:** the only `fetch` in
  `components/` is FormShell's; it has a `try/catch` but no timeout.
- **Reveal fail-safe:** `Reveal.tsx` forces visibility after 2.5s if IntersectionObserver never fires. Good.

## 7. General UX

- **Mobile nav:** drawer is portaled to `<body>`, `role=dialog aria-modal`, focus → Close (36×36) on open, Esc and
  every link close it, focus returns to the burger, body scroll locked, links 58px tall, nested groups animate
  height. Solid. Only nit: the drawer header shows the text "SupaKoto" instead of the logo.
- **Language switcher:** preserves the current page in both directions (`/services/ppf` ↔ `/en/services/ppf`,
  `/branches` ↔ `/en/branches`). Region choice survives (cookie). Good.
- **Sticky CTAs:** header is fixed (72px) but pages pad for it; WhatsApp FAB 52×52 covers the footer's first line
  at the very bottom of every page (F21). No other overlap.
- **Motion:** 27–28 elements carry Framer inline transforms on the home page at rest; `Reveal`/`RevealStagger` use
  `useInView once` (no continuous `whileInView`), hero copy crossfades every 6s, testimonials autoplay every 6s
  (stops on first interaction), hero video loops. No scroll jank observed in emulation; the site is animation-light.
  `prefers-reduced-motion`: honoured everywhere it matters — hero video not rendered, Reveal renders plain divs,
  dialogs/accordion/carousel skip transitions, Leaflet fitBounds un-animated. Verified: only the 5 hidden desktop
  dropdown `<ul>`s have `opacity:0` under reduce. Gallery `<video autoPlay loop>` is the one exception.
- **Hero readability:** white 44px display over a 160° scrim (0.8→0.5→0.85) on the video; measured legible at
  390px (`mobile-ar-hero.png`); subtitle at `fg/85`. Text rows have reserved `lh` heights so the layout never moves
  between slides. Good.
- **Secondary text contrast:** `fg-muted #a1a1a5` passes everywhere; `fg-subtle #6b6b70` fails everywhere (F9).
- **Font sizes < 14px on mobile:** eyebrow token is 12px and is used for real information (F25).
- **Horizontal overflow at 390px:** none on any of the 14 pages.

## What is already good (do not touch)

- 100% logical CSS properties; 0 physical `ml/mr/left/right` classes across `components/` and `app/`.
- RTL direction-of-travel is correct in the gallery stage, lightbox, testimonials, and calendar — including swipe,
  arrow keys, icon mirroring, and button placement. This is rarer than it should be.
- `DatePicker`: Saturday-first, Latin numerals, Arabic month/day names, 42px day cells, today/past disabled and still
  visible, `aria-live` selection footer, RTL month navigation.
- Mobile drawer: portal, dialog semantics, focus management, scroll lock, Escape, closes on every link.
- Every form control has a bound label; building steps use `fieldset/legend`; phone inputs are LTR everywhere.
- `useReducedMotion` in every animated component plus a Reveal fail-safe timer; hero video gated on reduced motion.
- Heading hierarchy, single `<main>`, single `<h1>`, alt text on every image, no horizontal overflow.
- Wizard step copy: short, white-Arabic, honest about what is confirmed on WhatsApp; per-flow CTAs and success text.
- Testimonial cards: fixed-height quote, honest "read more" only when it actually overflows, per-card `lang`/`dir`.

## Open questions for the owner

1. Is production on `main` deliberately (Phase 23 gated on Resend)? Until it ships, should the five stub forms be
   hidden or replaced with a WhatsApp/mailto CTA, and should the bracketed dev note at least be removed from the
   public build?
2. Phone validation: per-country regex (EG `01[0-2,5]\d{8}`, UAE `05\d{8}` / `+971 5x`) — or accept anything and let
   WhatsApp sort it out? The wizard already knows the country at step 2.
3. Should the wizard persist its draft in `sessionStorage` and push a history entry per step (browser Back = wizard
   Back)? Both are ~1h and remove F7.
4. `?service=` preselect from the service pages (F24): wanted, or is re-picking intentional funnel behaviour?
5. Contrast: raise `--color-fg-subtle` to ≈ `#8f8f95` site-wide (4.5:1 on ink-800), or only on the specific
   surfaces? And is `text-sk-red` as link/body colour a brand requirement — if so it needs a lighter tint for dark
   backgrounds (≈ `#e5343f` reaches 4.5:1 on `#0a0a0b`).
6. Branch hours: every branch shows `10:00–19:00` slots from `DEFAULT_HOURS`. Is it acceptable that customers see
   placeholder hours as if they were real until ops confirms?
7. Carto map tiles: does the privacy policy cover the third-party tile requests, or should the map be click-to-load?
