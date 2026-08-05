# Phase 7 — Ship

## Status: ready to deploy — waiting on Ibrahim (auth-gated)

Everything buildable is built and committed. Deployment needs Vercel
authentication, which is interactive and auth-sensitive — per the global
working rules the exact commands are drafted below for Ibrahim to run.

## Pre-flight (done)

- `pnpm build` clean with NO env overrides — 48 static pages, both locales.
- `pnpm lint`, `tsc --noEmit` clean.
- Message parity + banned-phrase + lifetime-scope checks green.
- `reference/`, `node_modules/`, `.next/` gitignored; working tree clean.

## Ibrahim's runbook (fish-compatible, run each with `!`)

```
npm i -g vercel
vercel login
vercel link        # create/link the project, accept defaults (Next.js)
vercel env add NEXT_PUBLIC_SITE_URL production   # value: https://<final-domain>
vercel --prod
```

## After deploy — do not skip

1. **Disable Deployment Protection** (Vercel dashboard → Project →
   Settings → Deployment Protection → Off). This caused V5's false login
   redirect and burned a day.
2. Open the production URL **in a private window**: `/` must be Arabic RTL,
   `/en` English LTR, no auth interstitial.
3. Check `/dev/kitchen-sink` is NOT indexed (robots disallows it) but still
   loads for internal QA.
4. Set the real domain in `NEXT_PUBLIC_SITE_URL` and redeploy if the first
   deploy used a vercel.app URL — canonicals and sitemap read from it.

## Launch blockers already logged elsewhere (not deploy blockers)

- Lifetime qualifier scope (whose lifetime) — content/warranty.ts TODO.
  **Site renders a visible bracketed TODO until decided.**
- Warranty table cells, about 4th stat, franchise investment figures.
- Booking/claim/contact forms are stubs — bdm-flow public write path
  needed (mismatch documented in 05-pages.md).
- Ops verification: branch phones, hours, WhatsApp lines, social URLs.
- Real photography for hero/services/branches/gallery.
