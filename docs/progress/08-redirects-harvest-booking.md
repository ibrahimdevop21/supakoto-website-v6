# Post-phase batch — redirects, asset harvest, booking unblock

Ibrahim's four-item directive, 2026-08-05 evening.

## 1. Redirects (deploy blocker — resolved)

`docs/REDIRECTS.md` and the `next.config.ts` redirects did NOT exist —
built now from the V2_Prod route inventory (Astro `src/pages`). Key fact:
V2 served EN at root and AR under `/ar` — inverted vs V6. 16 permanent
(308) redirects implemented; collision paths (V2-EN URLs that are live V6
Arabic pages: /services, /gallery, /about…) deliberately NOT redirected —
documented with rationale. Caught during review: an initial `/about →
/en/about` rule would have shadowed the live Arabic /about page; removed.
Verified by curl: all 16 fire, live pages still 200.

## 2. V2 photography harvest

Brief clarified: V2's design stays rejected, its photography/video is ours.

- Archive: 238 branded workshop photos (2000px webp) + 2 hero webm videos.
  All copied to `assets/source/` (gitignored originals).
- Excluded per instructions: payment-rail logos, partner logos, favicon/OG
  graphics, anything carrying V2 styling.
- Curated + resized (webp q82, ≤2000w hero / ≤1600w rest) into
  `public/images/{hero,services,gallery}` — next/image serves AVIF/WebP.
  Portrait shots swapped out of hero slots (full-bleed needs landscape).
- Placeholders replaced: hero carousel (5), services rail/index/detail (5),
  home work preview (9), gallery (36 stills + showreel video with in-tile
  autoplay preview and lightbox playback).
- Placeholders kept (nothing usable in archive): branch card photos,
  before/after slider pairs.
- Alt text written fresh in both locales (73 new keys) — conservative
  descriptions, models named only when unambiguous (Urus, G-Class, Land
  Cruiser). Nothing ported from V2.
- Categories: the whole archive is watermarked "Protection Film", so PPF
  is the default; heat/colour/nano/polishing assigned only where the photo
  visibly shows it (wraps, coating application, tinted glass). Ibrahim
  should sanity-check those ~9 assignments.
- Quality flags + updated gap list: `docs/progress/ASSETS-NEEDED.md`.

## 3. Booking WhatsApp handoff

Confirm step now: logs the intent client-side (console +
`sk-booking-intents` in localStorage, last 20), opens a prefilled
`wa.me/<region line>` deeplink, then shows success + a re-open link.
Message body is ALWAYS Arabic (labels read straight from
`messages/ar.json`, so the /en locale still sends Arabic — small bundle
cost, noted). Multi-step UI untouched. TODO in code points at the
bdm-flow contract notes in 05-pages.md; edge function stays post-launch.
Note: the deeplink target was ops-confirmed on 2026-08-06 — regional
lines fixed in content/regions.ts, unowned V2-derived numbers purged
repo-wide, and a build guard now blocks phone literals outside content/.

## 4. Deploy posture

Preview only. Runbook updated — `vercel` (preview), not `vercel --prod`.

## Verification

Build (48 pages SSG), lint, tsc, message-parity all green. Redirects
curl-verified. Home + gallery + booking flow screenshot-checked with real
imagery. Payload: images 6.9 MB + videos 9.4 MB committed under public/.
