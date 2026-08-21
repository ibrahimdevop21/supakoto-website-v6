# Content roadmap — what the VP's four proposals need before they can be built

*Drafted 2026-08-21 (Phase 0 of `19-feedback-round-2.md`). Scope only — nothing
here is built. Purpose: let Ibrahim brief a photo shoot and a copy round.*

The VP proposed (1) per-service case studies, (2) per-service image galleries of
3–4 images, (3) better service imagery, (4) a customer-stories section with
before/after photos. All four are blocked on photography that does not exist.
Below: what we have, what each needs (photos, permissions, copy, component), and
a one-day shoot plan.

> ### ⚠️ Client naming — read before anything is built
> - **Building case studies that name clients (AstraZeneca, Hustle Drip) need
>   WRITTEN permission from the client before publication.** No permission is on
>   file today.
> - **Already live without it:** the two building gallery photos
>   (`gallery.items.building-astrazeneca.alt`, `gallery.items.building-hustle-drip.alt`
>   in both message files) name the clients in alt text, and the /about timeline
>   entry `about.timeline.3` says "AstraZeneca contract". Both surfaces are shown
>   on `/gallery`, `/services/building-heat-isolation` (via `ServiceDetailBody`
>   project photos) and `/about`. **Flagged for Ibrahim's review** — either obtain
>   permission or anonymise ("pharmaceutical HQ, New Cairo", "café, Sheikh Zayed").
> - **No component may be built that assumes permission exists.** Any case-study
>   or story component must take a `client` field that is *optional* and render
>   the anonymised form by default; the named form is enabled per entry only with
>   a `permission: { by, on, doc }` provenance record (same pattern as
>   `PARTNERSHIP_CLAIMS` in `content/partners.ts`).
> - **Marine PPF and surface protection have no confirmed TAKAI product**
>   (`content/services.ts`, ASSETS-NEEDED blocking item). No case study, gallery
>   or story may imply one until written confirmation from TAKAI. Photos of the
>   existing surface work may stay as "work we have done"; nothing may name a
>   film, spec or warranty.

## Hard rules that apply to every shot

- **Watermark.** Every image on the site carries the SupaKoto × TAKAI watermark;
  unwatermarked or stock imagery stays out. Shoot clean, watermark in post,
  keep originals in `assets/source/` (gitignored).
- **Minimum delivery:** 3:2 landscape ≥ 2000 px on the long edge for heroes and
  tiles; portrait is acceptable only for the gallery (tiles crop to a uniform
  ratio — Phase 19 sets it; wide shots survive the crop, tall ones do not).
- **Plates and faces.** Either consent in writing or blur/crop in post. Staff in
  frame need the same consent as customers.
- **Copy register:** white Arabic (CLAUDE.md) — short sentences, no
  `نقدم لكم`, no superlatives (claims guard `scripts/check-claims.mjs` is law),
  PPF never claims heat, warranty always tier-scoped. English: confident,
  minimal. Claims (figures, warranty, "largest", client names) go through
  **Dr. Amer** before they enter `messages/*.json`.

## What exists today

| Asset | Where | State |
|---|---|---|
| 36 car photos (V2 harvest) | `public/images/gallery/sk-*.webp`, `content/gallery.ts` | All watermarked "Protection Film" → tagged PPF by default; 5 tagged nano-ceramic, 2 heat-isolation, 3 colour-change only where visible. 13 are 3:4 portrait. Six UAE night shots (213–234) are phone-grade — first out when replacements arrive. Phase 19 removes two duplicates (sk-234, sk-232). |
| 2 building photos | `building-astrazeneca.webp` (680×383), `building-hustle-drip.webp` (408×544) | Small, web-grade, client-named (see box above). |
| 4 surface photos | `surface-*.webp` (387–1000 px) | Small; product roll + marble counter/table. |
| 1 showreel video | `/videos/showreel*.webm` | Used as one gallery tile and hero; no poster frame. |
| 5 hero slides | `public/images/hero/s1–s5.webp` (2000 px) | Real workshop photos. |
| 1 image per service | `public/images/services/<id>.webp` — all 7 exist on disk | `ppf`, `heat-isolation`, `colour-change`, `nano-ceramic` are harvest photos; `building-heat-isolation` is a **labelled placeholder, not a project photo**; `marine-ppf` (389 KB) and `surface-protection` (301 KB) were added 2026-08-15 — verify they are our own watermarked shots, not stock, before any "better imagery" pass. |
| Before/after pairs | none | Service pages carry a labelled placeholder slider; the V2 archive has no true pairs. |
| Testimonials | `content/testimonials.ts` — 29 V2 reviews, text only, no photos, no dates | Carousel on home/about/service pages (`components/sections/Testimonials.tsx`). |

Components that already exist and would be reused: `GalleryGrid` + `Lightbox`
(filterable grid, keyboard/swipe lightbox), `ServiceDetailBody` (hero image +
project-photo strip keyed by gallery ids), `Testimonials` / `TestimonialsCarousel`,
`Reveal` motion primitives, `JsonLd` helpers (`Review`, `AggregateRating`,
`Service`, breadcrumbs).

## Proposal 1 — per-service case studies

One page (or expandable card) per service telling one real job: the car/building,
the problem, what was installed, the outcome, a quote from the owner.

| Service | Photos needed | Permissions | Copy |
|---|---|---|---|
| PPF | 1 job, 6–8 shots: arrival (before, swirl marks / stone chips visible in raking light), masking + film lay (during, installer hands), edge wrap detail, finished three-quarter front in daylight, finished detail of a wrapped edge, owner handover (optional) | Owner: car + plate + name/quote; installer: face | Job story ar+en (150–200 words), 3 facts (coverage package, tier name, time in workshop), tier-scoped warranty line if any |
| Heat isolation (cars) | 1 job, 5–6 shots: before through windscreen on a sunny day, film application on side glass, finished cabin from the driver seat showing daylight still clear, exterior showing legal shade, **a thermometer/IR gun reading inside** (supports the heat claim without a percentage) | Owner; any figure shown must be what the device read, no rounding up | Story + legal-shade note per region (Egypt vs UAE tint rules differ — Dr. Amer confirms) |
| Colour change | 1 job, 6 shots: original colour (before), panel-by-panel progress, seams/edges detail, finished in daylight AND under workshop light, close-up of finish texture (matte/satin/gloss) | Owner | Story + finish named exactly as in `content/takai.ts` (TAKAI Colours / MATT) |
| Nano ceramic | 1 job, 5 shots: paint inspection before, coating application, curing under lights, water-beading hero (hose + beads on bonnet), finished | Owner | Story; no durability figure beyond what `services.items.nano-ceramic.spec` already states |
| Building heat isolation | 1 job (AstraZeneca or Hustle Drip **only with written permission**, otherwise a new install shot anonymised): exterior wide, interior with daylight through filmed glass, installer on the glass, AC display / thermometer before-after, finished office in use | **Client written permission for naming, photography inside premises, and any staff in frame**; building management for exterior | Story + TK-7099-IR facts already in `spec` — nothing new; "largest project in Egypt" stays out unless Dr. Amer re-confirms with a source |
| Marine PPF, surface protection | **Blocked** — no confirmed product. Surface: may document the marble work as "what we did", no film name | — | — |

Component note: new `CaseStudy` section reusing `ServiceDetailBody` layout +
`Lightbox`; content in `content/caseStudies.ts` with `client?` + `permission?`
fields (see box). Estimate after assets exist: ~12 h for the template + 7 entries.

## Proposal 2 — per-service galleries (3–4 images each)

A 3–4 tile strip on every service page, filtered from the main gallery.

| Service | Have now (usable) | Need |
|---|---|---|
| PPF | 20+ photos | Nothing to shoot; curate 4 wide daylight shots, retire night phone shots |
| Heat isolation | 2 (sk-050, sk-128) — one is a portrait workshop shot | 2–3 wide shots of tinted glass in daylight, cabin view |
| Colour change | 3 (sk-059, sk-176, sk-232 → sk-232 removed in Phase 19) | 2 wide finished wraps, one detail |
| Nano ceramic | 5 | 1 water-beading shot (the only one that reads as "ceramic" to a customer) |
| Building | 2 small client-named photos | 4 wide anonymisable shots (see Proposal 1 row) |
| Marine / surface | 0 / 4 small | Blocked / 2 larger surface shots if the work continues |

Permissions: same as gallery today (owner consent or plate blur). Copy: alt
text per image in both locales (`gallery.items.<id>.alt`) — descriptive, no
claims. Component note: `ServiceDetailBody` already renders a project-photo
strip from gallery ids (`PROJECT_PHOTOS` map) — this proposal is **content, not
code**, once photos exist: add ids to the map and entries to `content/gallery.ts`.

## Proposal 3 — better service imagery (hero per service)

One purpose-shot hero per service replacing the harvest picks.

| Service | Brief |
|---|---|
| PPF | Dark car, three-quarter front, workshop lights reflecting in an unbroken line across the bonnet (film invisible = the point), 3:2, room on the start side for the H1 overlay |
| Heat isolation | Car side-on in hard sun, interior visible and clear through the glass |
| Colour change | Satin/matte finish under soft light, colour filling the frame |
| Nano ceramic | Water beads on paint, macro, shallow depth of field |
| Building | Glass façade or villa glazing at golden hour, film invisible; **no client signage** |
| Marine / surface | Hold until product confirmation; surface may use a finished marble surface shot |

All 3:2 ≥ 2000 px, watermark bottom-corner as today. Copy: `imageAlt` per
service exists — rewrite to match the new shot. Component note: drop-in
replacement of `public/images/services/<id>.webp`; no code. Also regenerate the
OG images (`app/[locale]/**/opengraph-image.tsx` read the same files).

## Proposal 4 — customer stories with before/after photos

A dedicated section (home + `/about`, maybe `/stories`) pairing a real customer,
their car, a before/after slider and their words.

Needs per story (target 6: 2 Tagamoa, 1 Zayed, 1 Maadi, 1 Alexandria, 1 Dubai):
- **Before/after pair shot from a tripod at the identical position and focal
  length**, same time of day or same workshop lighting — this is the one thing
  the V2 archive never had and the only way a slider works.
- Customer portrait with the car (optional; the quote can stand alone).
- Written consent covering: photo use on the website and social, name (first
  name + initial is enough), car make/model, branch, quote text.
- Quote in the customer's own words (ar or en, translated and labelled like
  the testimonials today), dated.

Copy: short story frame per entry (2–3 sentences, white Arabic / minimal
English), section intro, consent line in the footer of the section. Component
note: new `BeforeAfter` slider (Framer Motion drag, no new library — the
placeholder slider on service pages is the seed), `Testimonials` card styling
for the quote, `Review` JSON-LD reused. Estimate after assets: ~10 h.

## Shoot plan — one day, Tagamoa branch (highest volume, best light, real cars daily)

| Slot | What | Why Tagamoa |
|---|---|---|
| 09:00–10:30 | Heroes for PPF + nano ceramic (clean bay, lights on) | Biggest bay, aerial already shot |
| 10:30–12:30 | One PPF job start-to-finish "before" + "during" frames (tripod marks taped on the floor for the "after") | Daily cap 8 → a suitable dark car is near-certain |
| 12:30–14:00 | Heat-isolation: car in the sun out front, cabin + thermometer frames | Hard midday sun is the point |
| 14:00–16:00 | Nano-ceramic beading hero + colour-change detail if a wrap is in | — |
| 16:00–17:30 | "After" frames of the morning PPF job from the taped marks; owner handover + quote on camera/phone | Completes the first true before/after pair |
| Golden hour | Building exterior at a nearby anonymisable install, or exterior of the branch | — |

Second day (later): Dubai for the UAE story + Signature-line hero, and one
building interior with permission in hand.

Bring: tripod, floor tape, IR thermometer, consent forms (ar+en, one page),
list of cars booked that day from bdm-flow.

## Order of work once assets land

1. Proposal 3 (drop-in, no code) → 2. Proposal 2 (content only) → 3. Proposal 4
(new slider component) → 4. Proposal 1 (case-study template; only after the
permission model in the box above is in `content/`).
