# V2 → V6 redirect map

Source of truth for the permanent redirects implemented in
`next.config.ts`. Built from the V2_Prod route inventory
(`src/pages/**` of the Astro site; its `vercel.json` carried no redirects
of its own).

**Locale inversion is the whole point of this file.** V2 served English at
the root and Arabic under `/ar/*`. V6 serves Arabic at the root and
English under `/en/*`. Without these redirects, every indexed V2 URL
lands on the wrong language (or a 404) the moment the domain cuts over.

Next.js `permanent: true` issues **308** (the modern 301 — method-preserving,
cached, passes link equity the same way).

| V2 route | V6 target | Note |
|---|---|---|
| `/ar` | `/` | Arabic home moves to root |
| `/ar/about` | `/about` | |
| `/ar/services` | `/services` | |
| `/ar/gallery` | `/gallery` | |
| `/ar/locations` | `/branches` | renamed |
| `/ar/business` | `/business` | |
| `/ar/contact` | `/contact` | |
| `/ar/faq` | `/faq` | |
| `/ar/privacy` | `/privacy` | |
| `/ar/terms` | `/terms` | |
| `/ar/offers` | `/services` | no offers page in V6 (brand: never discount) |
| `/ar/thank-you` | `/` | form thank-you page dropped |
| `/about` | *(none)* | `/about` exists in V6 as Arabic — collision, no redirect |
| `/services` | *(none)* | `/services` exists in V6 as Arabic — old EN visitors get Arabic; acceptable, locale switcher is one tap. No redirect (target collision). |
| `/gallery` | *(none)* | same collision — V6 owns the path |
| `/business` | *(none)* | same |
| `/contact` | *(none)* | same |
| `/faq` | *(none)* | same |
| `/privacy` | *(none)* | same |
| `/terms` | *(none)* | same |
| `/locations` | `/en/branches` | path free in V6 (renamed to /branches) |
| `/offers` | `/en/services` | path free in V6 |
| `/thank-you` | `/en` | path free in V6 |
| `/test-chat` | *(404)* | dev page, let it die |
| `/api/*` | *(404)* | V2 Astro endpoints, dead |

**The collision rows are deliberate.** `/services`, `/gallery`, `/business`,
`/contact`, `/faq`, `/privacy`, `/terms` are *live V6 Arabic pages* — they
cannot also redirect to `/en/*`. Old English deep-links to those paths now
resolve to the Arabic page of the same content. That is the accepted cost
of making Arabic the default locale; hreflang alternates tell search
engines the correct language split going forward.

Only `/locations`, `/offers`, `/thank-you` have free EN slots (V6 renamed
or dropped those paths), so those three do redirect to `/en/*`.

## 2026-08-11 — polishing removed

`/services/polishing` and `/en/services/polishing` 301 to their
locale's `/services`. The polishing service was dropped from the
catalogue in the services restructure (7 services, 4 substrates).

## 2026-08-14 — services consolidated to one page (Phase 14)

Per-service detail pages folded into anchored sections on `/services`.
Six services × both locales 301 to `/services#<id>` /
`/en/services#<id>`: `ppf`, `heat-isolation`, `colour-change`,
`nano-ceramic`, `marine-ppf`, `surface-protection`.

`/services/building-heat-isolation` (+ `/quote`) deliberately kept live
in both locales — standalone SEO landing page for building window film.

## 2026-08-16 — services re-split (Phase 17, technical SEO)

The Phase-14 anchor redirects (`/services/<slug>` → `/services#<slug>`) are
REMOVED: the seven service pages are real routes again. Nothing else in the
map changed. Building keeps `/services/building-heat-isolation` (+ `/quote`);
marine-ppf and surface-protection exist but are `noindex, follow` and out of
the sitemap until TAKAI confirms a product.
