# Assets needed — running log

## ⛔ BLOCKING — TAKAI product confirmation (added 2026-08-11)

Two new services enter the catalogue with **no confirmed TAKAI
product**. Both pages ship with every spec slot as a labelled TODO —
no product codes, no spec figures, no warranty terms, nothing adapted
from the automotive PPF page (inventing here is the SK-BLD error
class). **Launch of each is blocked** until TAKAI confirms in writing
(info@takaifilms.jp):

| Service | Blocked on |
|---|---|
| Marine PPF (`/services/marine-ppf`) | Does TAKAI have a film rated for boat hulls (gelcoat, UV, salt water)? Product name, specs, warranty — all unknown |
| Interior Surface Protection (`/services/interior-protection`) | Does TAKAI have a film for marble / high-value interior surfaces? Product name, specs, warranty — all unknown |

Photography for both is also missing (no placeholder brief yet —
write one when products are confirmed).

Updated after the V2_Prod photography harvest (2026-08-05). Everything
below either has a clearly-labelled placeholder or is a verification task.

## PARTNER LOGOS (added 2026-08-11) — TOP PRIORITY

The homepage partners strip (`content/partners.ts`, shares the first
viewport with the hero) ships **visible with all 27 unique V2 marks in
original colours**: 25 car brands + Mansour Group + Auto Samir Rayan
(Ibrahim reversed the manufacturer-logo ban and named the last two
explicitly, 2026-08-11; assets re-rendered to trimmed transparent
WebPs, ~360 KB total). Still pending:

| Partner | Status | Needed |
|---|---|---|
| Mansour Chevrolet (dealership entity, distinct from the imported Mansour Group mark) | `confirmed: false` placeholder | Written permission + the dealership's own mark, if Ibrahim still wants it alongside the Group logo |
| RB Garage | `confirmed: false` (Damietta franchise) | Written permission + logo file |

**TAKAI is out of this strip by decision (2026-08-11)** — mother
company, not a peer partner. For any other TAKAI brand-asset need,
official marks are requestable via **info@takaifilms.jp**.

## FROM THE VP REVIEW (added 2026-08-16)

- **Japan flag — inline SVG preferred.** The `/about` stat now uses
  `public/images/brand/flag-japan.webp` (960×640 raster, supplied by Ibrahim)
  instead of the 🇯🇵 emoji (renders as letters on Windows). A clean inline
  SVG (red disc, 3:2) would be crisper at high pixel densities and
  theme-safe; swap in when available — no code change beyond the `src`.
- **Home feature tiles now carry photography** (branches aerial, TAKAI film
  gloss, Prado, workshop) chosen from the sanctioned watermarked set. If ops
  wants purpose-shot tile imagery (e.g. a booking-desk / handover shot for
  «احجز موعدك»), supply watermarked 3:2 landscapes ≥1600px.
- **Branch photos**: `content/branches.ts` still labels the branch photos
  as "placeholder until set" — Tagamoa's aerial is real; verify the other
  five are the intended storefronts.

## CLAIMS NEEDING TRACEABLE CONFIRMATION (added 2026-08-16, second copy review)

Logged under STRUCTURE-SPEC "Claim discipline" §1 — **not removed**:

- **Still open — performance figure:** `about.whoWeAre.body` + the /about stat
  (`about.stats.cars`, `Counter value={25000}`): «تجاوزنا 25 ألف سيارة محمية» /
  "past 25,000 cars protected". Needs a traceable source (invoice / booking
  export) or the wording gets softened.
- ~~Partnerships Škoda / Kasrawy / Mansour~~ — **CONFIRMED by Ibrahim Mohamed,
  2026-08-16** (official SupaKoto partners). Provenance recorded in
  `content/partners.ts` (`PARTNERSHIP_CLAIMS`). Closed.

## Resolved

- **Branch photos** — all six delivered by Ibrahim 2026-08-06, converted
  to webp under `public/images/branches/`. No placeholders left on
  /branches.

## Resolved by the harvest

- **Hero carousel slides** — 5 real workshop photos live (`public/images/hero/`).
- **Service imagery** — one real photo per service (rail, index, detail hero).
- **Gallery** — 36 curated stills + 1 showreel video from the 238-photo V2
  archive. Full originals kept in `assets/source/` (gitignored, on-disk).
- **Logo files / RH-Zak** — resolved earlier from the Visual Identity kit.

## Still genuinely missing

| Asset | Placeholder in use | Needed from |
|---|---|---|
| Before/after pairs | Labelled placeholder slider on service pages | Marketing — no true before/after pairs exist in the V2 archive |
| TikTok, YouTube, LinkedIn profile URLs | Footer icons render with `#` + TODO | Marketing |
| Egypt trust badges / registry equivalents | `<TrustBadges />` renders nothing | Ibrahim |

## BUILDINGS PHOTOGRAPHY (added 2026-08-07)

No building photography exists anywhere in the repo — all 238 harvested
images are automotive, and car images must NEVER appear on building
surfaces. Until real installs are shot, a generated placeholder
(`public/images/services/building-heat-isolation.webp`, labelled
"PLACEHOLDER — NOT A PROJECT PHOTO") covers every slot.

| Slot | Currently | Needed |
|---|---|---|
| Service page hero (`/services/building-heat-isolation`) | Labelled placeholder | Wide shot of a finished install — glass facade or villa glazing, film invisible (that IS the product) |
| Services index + home rail card | Same placeholder | One representative install photo |
| Gallery "Buildings" category | Empty state with "coming soon" copy | 4–6 install photos: during-application shot, finished office, finished residential |
| OG image | Brand-text card (fine as-is) | Optional: real photo variant |

Shot brief for whoever shoots: interiors showing daylight staying bright
through filmed glass sell the 70% VLT story better than exteriors;
one thermometer/AC-display shot would support the bills claim.

## Verification tasks (not assets)

- ~~Regional phone/WhatsApp lines~~ **RESOLVED 2026-08-06** — ops decision
  applied: Egypt call+WhatsApp share one line, UAE call and WhatsApp are
  separate lines; all V2-derived numbers of unknown ownership purged.
  `content/regions.ts` is the single source. Branch numbers confirmed
  available as seeded.
- Branch working hours — ops.
- ~~Maps coordinates~~ **RESOLVED 2026-08-06** — all six pins
  ops-confirmed by Ibrahim on-site.
- RH-Zak web-embedding licence — Ibrahim.

## Quality flags from the harvest

- Photos `supa-203`–`238` (UAE workshop night shots) are phone-grade:
  dimmer, noisier. The few used in the gallery (213, 221, 225, 230, 232,
  234) hold up at grid size but should be first out when replacement
  photography arrives. None used as hero or service imagery.
- Hero videos (`showreel*.webm`, 4.6–5.2 MB) reused as one gallery video
  item; bitrate is fine but there is no poster frame — consider generating
  one if the tile looks blank on slow connections.
