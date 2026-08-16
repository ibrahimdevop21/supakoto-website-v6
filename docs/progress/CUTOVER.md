# CUTOVER — pointing supakoto.com at V6

Written 2026-08-16 (Phase 17, technical SEO round). Read this end to end
before touching DNS.

## The one switch: `NEXT_PUBLIC_SITE_URL`

Every absolute URL the site emits derives from `SITE_URL` in `lib/site.ts`:

```ts
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://supakoto.com";
```

It drives: `<link rel="canonical">`, every hreflang alternate (`ar`, `en`,
`x-default`), `og:url`, `metadataBase` (so `og:image` → `/opengraph-image`
resolves absolute), every JSON-LD `url` / `item`, `sitemap.xml` entries and
`robots.txt`'s sitemap line.

**Today** (pre-cutover) the Vercel production project has **no**
`NEXT_PUBLIC_SITE_URL`, so everything canonicalises to `https://supakoto.com`
— correct for the final state, and it means the `*.vercel.app` preview is
deliberately **non-indexable** (its canonicals point elsewhere and its
og:image URLs hit the old V2 site, which is why social previews look broken
right now). Nothing to fix; it resolves the moment the domain moves.

## Cutover steps (config + DNS, no code)

1. **Freeze**: confirm `main` is the build you want live (`git log -1`),
   Vercel production deployment READY, `node scripts/smoke.mjs` against the
   preview URL green.
2. **Vercel → Project → Settings → Domains**: add `supakoto.com` (primary)
   and `www.supakoto.com` (redirect to apex). Vercel shows the required DNS.
3. **DNS** (registrar): apex `A 76.76.21.21` (or Vercel's current value),
   `www CNAME cname.vercel-dns.com`. Lower TTL a day earlier if possible.
4. **Env**: leave `NEXT_PUBLIC_SITE_URL` unset (default is already
   `https://supakoto.com`) — or set it explicitly to `https://supakoto.com`
   for clarity. If a staging domain is ever used, set the var per
   environment; never hard-code a URL in code.
5. **Redeploy** production once DNS is live so any cached HTML is fresh
   (canonicals/OG were already correct; this is belt-and-braces).
6. **Verify** on the real domain, both locales:
   - `curl -sI https://supakoto.com/` → 200, `<html dir="rtl">`;
     `https://supakoto.com/en` → `dir="ltr"`
   - `view-source` → canonical + hreflang (`ar`, `en`, `x-default`) all on
     `supakoto.com`; `og:image` = `https://supakoto.com/opengraph-image…`
     returns an image (200, image/png)
   - `https://supakoto.com/sitemap.xml` lists every indexable route ×
     alternates; `robots.txt` points at it; `/services/marine-ppf` and
     `/services/surface-protection` carry `noindex, follow` and are absent
     from the sitemap
   - `BASE=https://supakoto.com node scripts/smoke.mjs` → all green
   - `BASE=https://supakoto.com node scripts/crawl.mjs` → no 404 / no
     redirect chains / no orphans
   - `BASE=https://supakoto.com node scripts/jsonld-audit.mjs` → all
     blocks parse, required fields present
7. **V2 → V6 redirects**: `next.config.ts` carries the permanent redirects
   for every indexed V2 URL (`docs/REDIRECTS.md`). Spot-check five old URLs
   (`/ar/services`, `/locations`, `/ar/offers`, `/services/polishing`,
   `/thank-you`) → 308 to the right V6 page, single hop.
8. **Search Console**: add the property if missing, submit
   `https://supakoto.com/sitemap.xml`, request indexing for `/`,
   `/services/ppf`, `/authentic`. Watch Coverage for a week.
9. **Social debuggers**: re-scrape `/` and `/services/ppf` in the Facebook
   Sharing Debugger / LinkedIn Post Inspector once — clears the cached
   broken previews from the pre-cutover period.

## Rollback

Point DNS back at the V2 host. Nothing in V6 needs undoing — canonicals
already name `supakoto.com`, so a temporary flip costs nothing.

## Do-not-touch during cutover

- `content/regions.ts` / `content/branches.ts` (phones — guarded)
- `scripts/check-claims.mjs` (claim guards — spec-level law)
- Marine / surface `noindex` (flip only after TAKAI confirms — one line in
  `content/services.ts` → `NOINDEX_SERVICE_IDS`)
