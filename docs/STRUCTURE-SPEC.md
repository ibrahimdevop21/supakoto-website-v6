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

**Total: 15 routes × 2 locales.**

---

## Global chrome

**Header** — sticky, transparent over hero then solid on scroll. Logo right in
RTL / left in LTR. Two-level nav with dropdowns:

- الرئيسية / Home
- من نحن / About → [About, FAQ]
- خدماتنا / Services → [كل الخدمات (index), أفلام حماية الطلاء,
  العازل الحراري — سيارات, عزل حراري للمباني, تغيير اللون,
  النانو سيراميك, حماية القوارب, حماية الأسطح الداخلية]
  — dropdown added on `feat/building-heat-isolation`; the 2026-08-11
  restructure REMOVES التلميع from it and ADDS Marine PPF + Interior
  Surface Protection. (Conflict note: this line edits the same region
  the buildings branch touched — resolve in its favour on structure,
  this list on content.)
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
   everything we protect. PROPOSED copy (MSA, Ibrahim signs off):
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
   - حماية الأسطح الداخلية / Interior Surface Protection →
     `/services/interior-protection` (interior)
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
Only `substrate === "vehicle"` services appear in the booking wizard.
Polishing is deleted from the catalogue (route 301s to `/services`).

Index: hero + 7 service cards, full-bleed alternating rows. Non-vehicle
cards are visually distinguished by substrate (pattern already
established by the buildings card).

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

B2B: fleets, dealerships, and the building-film line (SK-BLD). Quote request
form, not a booking form.

---

## `/gallery`

Single filtered grid: All / PPF / Heat Isolation / Colour Change / Nano
Ceramic / Video. Lightbox with keyboard nav. Uniform grid, port from V5.

## `/faq`, `/contact`, `/careers`, `/privacy`, `/terms`

Standard. `/contact` form has a subject dropdown that includes **شكوى /
Complaint** — this is how we absorb their `/complaints` route.
