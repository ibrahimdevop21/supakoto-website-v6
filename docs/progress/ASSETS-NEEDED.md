# Assets needed — running log

Updated after the V2_Prod photography harvest (2026-08-05). Everything
below either has a clearly-labelled placeholder or is a verification task.

## PARTNER LOGOS (added 2026-08-11) — TOP PRIORITY

The homepage partners band (`content/partners.ts`) ships fully built but
renders **nothing** until a real logo lands and its `confirmed` flag is
flipped. No fabricated marks — a self-styled TAKAI wordmark is the same
class of error as SK-BLD. Labelled placeholders sit in
`public/images/partners/`.

| Partner | Status | Needed |
|---|---|---|
| **TAKAI** | **BLOCKS THE ENTIRE SECTION** — the anchor and only confirmed relationship | Official mark from TAKAI — request via **info@takaifilms.jp** (vector or high-res, light-on-dark friendly) |
| Mansour Chevrolet | Pending permission (hosts Alexandria branch) | Written permission + the dealership's own mark. NOT `mansour-group-logo.svg` from V2 — parent conglomerate, overstates the relationship |
| RB Garage | Pending permission (Damietta franchise) | Written permission + logo file |

Reminder: car manufacturer logos (Mercedes, BMW, Porsche, …) are never
ours to display. V2's `public/partners/` folder is a banned source.

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
