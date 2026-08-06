# Assets needed — running log

Updated after the V2_Prod photography harvest (2026-08-05). Everything
below either has a clearly-labelled placeholder or is a verification task.

## Resolved by the harvest

- **Hero carousel slides** — 5 real workshop photos live (`public/images/hero/`).
- **Service imagery** — one real photo per service (rail, index, detail hero).
- **Gallery** — 36 curated stills + 1 showreel video from the 238-photo V2
  archive. Full originals kept in `assets/source/` (gitignored, on-disk).
- **Logo files / RH-Zak** — resolved earlier from the Visual Identity kit.

## Still genuinely missing

| Asset | Placeholder in use | Needed from |
|---|---|---|
| Branch photos (6 branches) | Labelled placeholder block on branch cards | **Ibrahim collecting now** — drop-in ready: put files at `public/images/branches/<id>.webp` and set `photo` in `content/branches.ts` |
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
