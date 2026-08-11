# Structure Spec — V6

Derived from `dettaglioauto.sa` **information architecture**. Their site is
Nuxt 3 (`/_ipx/` = Nuxt Image). We are Next.js. Nothing is portable at file
level and nothing should be.

Locale pattern to mirror: Arabic at root, English under `/en`. Their
`og:locale` is `ar_SA` with `en_US` alternate. Ours: `ar_EG` default, `en`
alternate.

---

## Route map

| Reference route | V6 route | Build? |
|---|---|---|
| `/` | `/` | Yes |
| `/about` | `/about` | Yes |
| `/faqs` | `/faq` | Yes |
| `/photo-gallery` | `/gallery` | Yes — merge photo + video into one filtered grid |
| `/video-gallery` | — | Merged above |
| `/booking` | `/booking` | Yes — wire to bdm-flow |
| `/gift` | — | **Drop.** No gift-card product |
| `/warranty` | `/warranty` | Yes |
| (Book Maintenance) | `/warranty/claim` | Yes |
| `/franchise` | `/franchise` | Yes |
| `/business-contracts` | `/business` | Yes — B2B / fleet / building film |
| `/branches` | `/branches` | Yes |
| `/branches-3d` | — | **Drop.** 3D tour is a five-figure production |
| `/contact-us` | `/contact` | Yes |
| `/careers` | `/careers` | Yes |
| `/complaints` | — | Fold into `/contact` as a form subject |
| `/information/products` | `/services` + `/services/[slug]` | Yes |
| `/privacy-policy` | `/privacy` | Yes |
| `/refund-return-policy` | `/terms` | Yes |
| — (V6 addition, no reference equivalent) | `/services/building-heat-isolation` | Yes — buildings substrate service page |
| — (V6 addition, no reference equivalent) | `/services/building-heat-isolation/quote` | Yes — quotation request form |

**Total: 17 routes × 2 locales.**

---

## Global chrome

**Header** — sticky, transparent over hero then solid on scroll. Logo right in
RTL / left in LTR. Two-level nav with dropdowns:

- الرئيسية / Home
- من نحن / About → [About, FAQ]
- خدماتنا / Services → [كل الخدمات (index), أفلام حماية الطلاء,
  العازل الحراري — سيارات, عزل حراري للمباني, تغيير اللون,
  النانو سيراميك, حماية القوارب, حماية الأسطح الداخلية]
  — dropdown added 2026-08-07 (services were never nav-reachable in the
  reference IA); the 2026-08-11 restructure REMOVES التلميع and ADDS
  Marine PPF + Surface Protection. Buildings keeps its own direct
  entry, not nested under automotive heat isolation.
- أعمالنا / Our Work → [Gallery]
- احجز / Book
- الضمان / Warranty → [Warranty Policy, Warranty Claim]
- قطاع الأعمال / Business → [Franchise, B2B & Fleet]
- فروعنا / Branches
- تواصل / Contact → [Contact, Careers]

Right-side cluster: locale switch (ع / EN), **RegionPicker modal** (Egypt /
UAE — port from V5, it stays a modal, not a nav dropdown), primary CTA button
"احجز دلوقتي".

Mobile: full-screen overlay drawer, accordion sub-nav, sticky WhatsApp FAB.

**Footer** — 4 zones, in this order:
1. Logo + tagline line ("الوكيل الحصري في مصر والإمارات لأفلام الحماية اليابانية")
2. Social row: Instagram, TikTok, Facebook, YouTube, LinkedIn
3. Region-aware contact block (phones swap with RegionPicker state)
4. Legal row: Privacy · Terms · © SupaKoto {year}

**Do not port** their payment-rail strip (mada/tabby/tamara are Saudi rails) or
their trust badges (Maroof, Saudi Business Center are Saudi registries). Egypt
equivalent slot: leave a `<TrustBadges />` component stubbed with a TODO — we
have nothing verified to put there yet.

---

## `/` — Home

Section order, top to bottom:

1. **First screen (2026-08-11)** — one `min-h-[100svh]` flex column
   (svh, never vh, to avoid the mobile browser-chrome jump) holding the
   hero and the partners strip, under the fixed transparent header.
   Nothing from any section below is visible at initial scroll
   position; the fold lands exactly on the column's bottom edge.
   1. **Hero carousel** — full-bleed, 5–6 slides, autoplay 6s, one CTA
      overlay linking to `/booking`. Ken Burns drift on the image,
      Framer Motion. `flex-1`: it fills whatever the strip doesn't use —
      and the whole viewport whenever the strip is empty.
   2. **Partners strip** — `content/partners.ts` is structure-only (id,
      name, logo path, `confirmed` flag, optional URL); display strings
      in `home.partners.*`. Only `confirmed: true` entries render — zero
      confirmed renders NOTHING (no empty state, no reserved space).
      One confirmed → centred static lockup with its caption line, never
      a one-item scroller. Two+ → Framer Motion marquee: drifts in
      reading direction (RTL-aware), pauses on hover, static row under
      `prefers-reduced-motion`, grayscale at rest → colour on hover,
      copy count measured at runtime so the loop never shows a gap.
      Logos render in **original colours — no filter overlay**
      (Ibrahim, 2026-08-11; the earlier grayscale-at-rest spec is
      dead). Roster: **all 27 unique marks from V2's
      `public/partners/` ship visible** — 25 car brands (Avatr →
      Volkswagen; Citroën was duplicated in the source) plus Mansour
      Group and Auto Samir Rayan, re-rendered to trimmed transparent
      WebPs (~360 KB total). Mansour Chevrolet (dealership entity) and
      RB Garage keep `confirmed: false` placeholder entries pending
      written permission + a real logo. **TAKAI is deliberately
      excluded**: mother company (SupaKoto is its exclusive
      distributor for Egypt and UAE), not a peer partner.
      **Manufacturer-logo rule history:** the original spec banned car
      manufacturer logos outright; Ibrahim declined to lift the ban
      twice on 2026-08-11, then explicitly reversed it the same day
      (informed choice, the reversal consequence was stated in the
      question) and later that day named Mansour Group and Auto Samir
      Rayan for inclusion as well. Only fabricated marks (SK-BLD class
      error) remain forbidden.
2. **Services grid (restructured 2026-08-11)** — SupaKoto is no longer
   framed as car-only: protection film goes on vehicles, buildings,
   boats, and high-value interior surfaces. "Five ways we protect your
   car" / «خمس طرق نحمي بيها عربيتك» is DEAD — the new heading covers
   everything we protect. APPROVED copy (Ibrahim, 2026-08-11):
   «كل ما يستحق الحماية، نحميه» / "Everything worth protecting" —
   with sub «سيارات ومبانٍ وقوارب وأسطح داخلية — أفلام تاكاي اليابانية
   نفسها» / "Cars, buildings, boats, interiors — the same Japanese
   TAKAI films."
   Layout: the horizontal snap-rail is replaced by a responsive
   wrapping flex grid, full container width, equal-height cards,
   consistent gaps, max 4 per row: 1 column mobile / 2 tablet /
   3 desktop / 4 wide. Cards wrap to the next row; NO horizontal
   overflow at any breakpoint. Seven cards:
   - أفلام حماية الطلاء / Paint Protection Film → `/services/ppf` (vehicle)
   - العازل الحراري / Heat Isolation → `/services/heat-isolation` (vehicle)
   - تغيير اللون / Colour Change → `/services/colour-change` (vehicle)
   - النانو سيراميك / Nano Ceramic → `/services/nano-ceramic` (vehicle)
   - عزل حراري للمباني / Building Heat Isolation →
     `/services/building-heat-isolation` (building — built on
     `feat/building-heat-isolation`; its dual-destination treatment on
     the automotive heat-isolation card is RETIRED once it has its own
     card here)
   - حماية القوارب / Marine PPF → `/services/marine-ppf` (marine)
   - حماية الأسطح / Surface Protection →
     `/services/surface-protection` (interior substrate — slug decision
     2026-08-11: NOT "interior-protection", which reads as car
     interiors and collides in search)
   - **التلميع / Polishing is REMOVED entirely** — every surface,
     every route, all i18n keys. `/services/polishing` gets a 301 to
     `/services` (record in docs/REDIRECTS.md, implement in
     next.config).
3. **"اعرف المزيد"** — single wide CTA band into `/services`.
4. **أعمالنا / Our Work** — section header + subline, then a 3-across masonry
   preview pulling 9 items from `/gallery`. Reuse the V5 uniform-grid component.
5. **Feature tile grid** — 2×2 asymmetric. Theirs is Gifts / Branches 3D /
   Products / Warranty. Ours:
   - فروعنا — "٦ فروع في مصر والإمارات"
   - التقنية اليابانية — TAKAI story → `/services/ppf`
   - الضمان — tier-neutral line, no numeral → `/warranty`
   - احجز موعدك — direct booking tile
6. **قطاع الأعمال / Business band** — split panel, franchise on one side, B2B
   fleet on the other.
7. **Footer.**

---

## `/about`

1. Eyebrow ("SupaKoto") + H1 + one-line subline.
2. Logo lockup band, light/dark pair.
3. "Who we are" — eyebrow, H2, one dense paragraph.
4. **Stat counter row, 4 up** — animate on scroll into view:
   - `6` فروع في مصر والإمارات
   - `100%` أفلام يابانية أصلية TAKAI
   - `🇯🇵` الوكيل الحصري في مصر والإمارات
   - fourth stat: **not a warranty figure** — warranty is tiered and a bare
     numeral here would contradict `/warranty`. Use years in market, cars
     protected, or TAKAI partnership year. `TODO — Ibrahim to pick.`
5. **Vision / Mission / Values** — 3 equal cards.
6. CTA band → `/booking`.

---

## `/services` and `/services/[slug]`

**Restructured 2026-08-11.** The catalogue is seven services across
four substrates. `Service.substrate` extends from
`"vehicle" | "building"` to
`"vehicle" | "building" | "marine" | "interior"`.
Only `substrate === "vehicle"` services appear in the booking wizard —
non-vehicle substrates can never enter the booking flow.
Polishing is deleted from the catalogue (route 301s to `/services`).

Index: hero + 7 service cards in the SAME responsive wrapping grid as
the homepage services section (1/2/3/4 columns, max 4 per row, equal
heights — Ibrahim 2026-08-11: "7 cards should behave the same in both
places"; the old full-bleed alternating rows are replaced). Non-vehicle
cards stay visually distinguished by substrate (pattern established by
the buildings card) — never styled as just another car service.

Detail template for the four VEHICLE services (unchanged):
1. Hero image + H1 + benefit subline
2. "المشكلة" — the pain (stone chips, swirl marks, heat, resale value)
3. "الحل" — what the product does, 3–4 bullets
4. Spec table — thickness, warranty term, coverage options
5. Before/after slider
6. Package tiers (front-end / partial / full body)
7. FAQ accordion, 4–6 items
8. Booking CTA

Building Heat Isolation keeps its own diverged template (built on
`feat/building-heat-isolation`, TK-7099-IR, quote form).

**Marine PPF (`/services/marine-ppf`, substrate "marine") and Interior
Surface Protection (`/services/interior-protection`, substrate
"interior") — ⚠️ NO CONFIRMED TAKAI PRODUCT EXISTS for either.**
Automotive PPF is TPU engineered for painted panels; boat hulls
(gelcoat, UV + salt water) and marble/interior surfaces may need a
different film entirely, and TAKAI's catalogue mentions neither. Hard
rules for both pages, spec-level law:
- NO product codes, NO spec figures, NO warranty terms, NO material
  claims. Every spec slot renders a labelled TODO
  («بانتظار تأكيد المنتج من تاكاي» / "Pending product confirmation
  from TAKAI").
- Do NOT copy or adapt anything from the automotive PPF page.
- Do NOT invent product names or numbers — inventing SK-BLD is
  exactly how this class of error happened before.
- Page structure: hero + problem/solution framing in general terms +
  TODO spec block + contact/quote CTA (wa.me routing like buildings).
  No package tiers, no before/after (no photography exists), no FAQ
  until products are confirmed.
- Both services are BLOCKED for launch on written product
  confirmation from TAKAI (tracked in ASSETS-NEEDED as blocking).

---

## `/services/building-heat-isolation` (+ `/quote`)

**A service in the existing line applied to a different substrate — not a
second business, not a top-level vertical.** Same TAKAI material family,
applied to commercial and residential buildings.

**It serves B2C and B2B equally — it is NOT a B2B-only line.** A homeowner
tinting villa or apartment glazing is as much the audience as an office
facade. This page is the canonical destination for both; tone is
consumer-facing. `/business` links into it for commercial clients, but that
link is one entrance among several (nav, home rail, services index), not the
primary framing.

**Single SKU — TAKAI TK-7099-IR (UV Nano Ceramic, Premium IR series):**

| Spec | Value |
|---|---|
| Thickness | 3.5 mil |
| VLT | 70% — glass stays clear, daylight and view kept |
| IR rejection @950nm | 99% |
| IR rejection @1400nm | 99% |
| UV rejection | 99.5% |
| TSER | 54% |
| Warranty | **10 years** |

No shade selector, no product table, no VLT options. No other TK- codes
anywhere on the site. **Positioning states the trade-off honestly**: 70% VLT
means the glass looks essentially unchanged — claim clarity WITH heat
rejection, never "maximum heat rejection" (darker TAKAI films score higher
TSER).

**Page template (diverges from the automotive template — no package tiers, no
before/after slider, no booking CTA):**
1. Hero + H1 + clarity-with-heat-rejection subline
2. "المشكلة" — AC load and electricity bills, indoor comfort, glare on
   screens, UV fade on furniture and flooring, shatter resistance and
   occupant safety. NOT stone chips, NOT resale value, NOT self-healing,
   NOT privacy (70% VLT cannot deliver it).
3. "الحل" — TK-7099-IR, spec table above
4. How it works — the quotation funnel, 5 steps (contact → customer sends own
   measurements → quotation with proposed appointment → confirmation call →
   technicians re-verify on site and install)
5. Quote CTA → `/services/building-heat-isolation/quote`
6. FAQ accordion (buildings-specific)

Copy: fresh Arabic first in Egyptian dialect, then English. Do not adapt the
automotive heat-isolation copy. No "lifetime" string anywhere on these routes
(allowed-pages list unchanged). Warranty statements say **10 years (TAKAI,
buildings)** — tier-scoped as always.

**`/quote` — quotation request form.** It is not a booking, not a survey
request; it never asks for car make or model. Captures enough to produce a
quote without a site visit:

- Property type (commercial / residential)
- Governorate or emirate — **both regions** (locked 2026-08-07): governorate
  (EG) and emirate (UAE) options; wa.me routes to the line matching the
  selection, overriding the global RegionPicker.
- Glazing area in m² OR window count with dimensions (toggle)
- Number of floors
- Glass type if known
- Primary problem: heat / glare / electricity bills / UV fade (**no privacy
  option** — near-clear film, offering it generates unfulfillable leads)
- Name · phone · WhatsApp

Form copy states measurements are approximate and the technician verifies on
arrival. Submit → prefilled wa.me to the selected region's line (same lines
as booking, from `content/regions.ts` — no phone literals). **First line of
the body marks it unmistakably: "طلب عرض سعر — عزل حراري للمباني" (English
equivalent on /en); measurements immediately after** — it must not read like
a car booking to whoever triages the inbox.

**SEO — standalone entry point.** Own keyword set (عزل حراري للمباني / عزل
حراري للواجهات / building window film Egypt), own metadata, own JSON-LD
`Service` schema. Do not inherit or clone automotive metadata. Internal links
point at it directly, not only through `/services`.

**Assets:** no building photography exists in the repo — clearly-labelled
placeholders only, never car images. BUILDINGS PHOTOGRAPHY section tracked in
`docs/progress/ASSETS-NEEDED.md`.

---

## `/booking`

Multi-step, one question per screen with a progress bar:
Region → Branch → Service → Car make/model → Date → Time → Contact → Confirm.

Service step offers ONLY `substrate === "vehicle"` services (four
after the 2026-08-11 restructure: PPF, Heat Isolation, Colour Change,
Nano Ceramic). Building/marine/interior route to their own quote
flows, never through the car booking wizard.

Branch capacity is enforced server-side. Known caps: التجمع 8, زايد 6,
المعادي 3. Post to the bdm-flow Supabase project — do **not** rebuild booking
logic here, this is a client for it.

**wa.me message language (applies to BookingWizard and the buildings quote
form):** the body is built from the ACTIVE LOCALE's messages — `/en` sends
English, `/` sends Arabic. Same field order both ways.

---

## `/branches`

Card grid, filtered by the RegionPicker. Each card: photo, name, address,
phone (tel: link), WhatsApp button, Google Maps embed, hours.

Seed data (**verify all of these against ops before launch**):

| Branch | Region | Phone |
|---|---|---|
| التجمع الخامس | Egypt | 01220080189 |
| الشيخ زايد | Egypt | 01156608134 |
| زهراء المعادي | Egypt | 01127232340 |
| الإسكندرية — الطريق الصحراوي، داخل منصور شيفروليه | Egypt | 01103402446 |
| دمياط الجديدة — RB Garage، أمام كلية فنون | Egypt (franchise) | 01126978186 |
| دبي — القوز ٣، المنطقة الصناعية | UAE | +971 55 205 4478 |

Damietta is a franchise location — flag whether it carries a franchise badge on
the card before shipping.

One line on the page notes that **building heat isolation is installed at the
customer's property, not at a branch**.

---

## `/warranty`

Warranty is **tiered**, so this page is a comparison, not a single number.

1. Hero — no figure in the headline. Lead with the guarantee concept.
2. **Tier comparison table** — the core of the page. Columns are tiers, rows
   are terms. Source of truth is `content/warranty.ts`.

   | | Standard tiers | **Premium Plus** |
   |---|---|---|
   | Term | up to 15 years | **Lifetime** |
   | Scope qualifier | — | `TODO — see below` |
   | Transferable | `TODO` | `TODO` |
   | Yellowing / discolouration | `TODO` | `TODO` |
   | Cracking / peeling / lifting | `TODO` | `TODO` |
   | Self-healing performance | `TODO` | `TODO` |
   | Exclusions | `TODO` | `TODO` |

3. **Qualifier block** — renders adjacent to every "lifetime" mention. Must
   state whose lifetime. Industry-standard options, pick one and commit:
   - lifetime **of the film** (ends if film is removed/replaced)
   - lifetime **of original ownership** (ends on resale, non-transferable)
   - lifetime **of the vehicle** (transfers with the car)

   These are materially different promises. `content/warranty.ts` must hold the
   chosen wording in both `ar` and `en`. Do not ship with this unresolved.
4. Registration steps, numbered
5. Claim CTA → `/warranty/claim`
6. FAQ accordion — must include "إيه اللي بيلغي الضمان؟"

**Consistency check before ship**: the standard Meta caption footer says
`ضمان يصل إلى 15 سنة`. If the site headlines "lifetime" while every ad footer
says 15 years, customers will read it as a bait-and-switch. Either the footer
gains a Premium Plus line or the site keeps "lifetime" scoped to the tier card
only. Flag to Ibrahim if unresolved at Phase 6.

**Buildings row**: TAKAI TK-7099-IR carries **10 years** per TAKAI's official
catalogue. Rendered as its own row/block — it is a different substrate, not a
vehicle tier. Never "lifetime".

`/warranty/claim` is a form: plate number, branch, invoice date, issue
description, photo upload.

---

## `/franchise`

Follows their structure closely, it's a good funnel:
1. Hero — "كن شريك SupaKoto"
2. Why the brand — 4 value props
3. What you get — equipment, fit-out, training, supervision, marketing, supply
4. Investment band — ranges and terms **(leave as TODO, Ibrahim to supply)**
5. Process timeline — 5 steps, application to opening
6. Application form
7. FAQ

## `/business`

B2B: fleets, dealerships, and — for commercial clients — building heat
isolation. The building card links directly to
`/services/building-heat-isolation`, which is the canonical destination for
the buildings line and serves B2C (residential) and B2B (commercial) alike;
this page only surfaces the commercial angle. Quote request form, not a
booking form.

---

## `/gallery`

Single filtered grid: All / PPF / Heat Isolation / Colour Change / Nano
Ceramic / Buildings / Video. Lightbox with keyboard nav. Uniform grid, port
from V5. The Buildings category ships with a clearly-labelled "photography
coming soon" placeholder state — never car images.

## `/faq`, `/contact`, `/careers`, `/privacy`, `/terms`

Standard. `/contact` form has a subject dropdown that includes **شكوى /
Complaint** — this is how we absorb their `/complaints` route — and **عزل
حراري للمباني / Building heat isolation**.

`/faq` gains 3–4 buildings questions: how to measure, whether a visit is
needed first, installation duration, what happens if the on-site measurement
differs from what was sent.
