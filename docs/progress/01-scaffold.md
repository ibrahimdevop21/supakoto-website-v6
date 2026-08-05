# Phase 1 — Scaffold

## Plan

Hand-scaffold rather than `create-next-app` (non-empty repo; deterministic
control over every file).

1. Deps: `next@15` + `react@19` + `typescript` strict, `tailwindcss@4` via
   `@tailwindcss/postcss`, `next-intl`, `framer-motion`, `eslint` +
   `eslint-config-next` flat config.
2. Routing: `app/[locale]/` with next-intl — `ar` default at `/` (no prefix,
   `localePrefix: "as-needed"`), `en` at `/en`. Middleware for locale
   negotiation. `<html lang dir>` driven by locale in the root layout.
3. Fonts: IBM Plex Sans Arabic + Inter via `next/font/google`. RH-Zak via
   `next/font/local` if usable files exist on this machine (it's installed
   system-wide); otherwise display falls back and the gap goes to
   `docs/progress/ASSETS-NEEDED.md`.
4. `app/globals.css`: full `@theme` block from `DESIGN-TOKENS.md` (palette,
   fonts, type scale, radius, spacing rhythm) + base layer:
   dark default, `[dir="rtl"]` letter-spacing/text-transform guard.
5. ESLint: flat config with a `no-restricted-syntax` rule failing any
   `className` containing physical `ml-/mr-/pl-/pr-` utilities.
6. Placeholder `app/[locale]/page.tsx` + minimal `messages/{ar,en}.json` so
   the tree builds; real content is Phase 4.
7. Verify: `pnpm build` clean, `pnpm lint` clean, `tsc --noEmit` clean, `/`
   renders Arabic RTL, `/en` renders English LTR.

## What shipped

- Next 15.5.22 + React 19.2 + TS 5.9 strict, hand-scaffolded. Tailwind v4.3
  via `@tailwindcss/postcss`, next-intl 4.13, framer-motion 12.43.
- Deliberate pins: `typescript@^5` (registry default resolved to the brand-new
  7.x native port — too risky) and `eslint-config-next@15` to match Next 15.
  pnpm 11 build-script approvals live in `pnpm-workspace.yaml` (`allowBuilds`
  — the old `package.json#pnpm` field is no longer read).
- Routing: `app/[locale]/` + next-intl `defineRouting`, `ar` default with
  `localePrefix: "as-needed"`, middleware negotiation. Verified on the built
  server: `/` → `lang="ar" dir="rtl"`, `/en` → `lang="en" dir="ltr"`.
- **RH-Zak found on this machine** (`~/.local/share/fonts`, OTF
  Thin/Regular/Bold) — converted to woff2 via fonttools into `app/fonts/`,
  wired with `next/font/local` as `--font-rh-zak`. Not an outstanding asset
  anymore, though Ibrahim should confirm web-embedding is licensed.
- IBM Plex Sans Arabic (400/500/700) + Inter via `next/font/google`.
- `app/globals.css`: full `@theme` token block (palette, fluid type scale,
  radius, section/gutter spacing) + `@theme inline` font hookup + base layer
  with dark default and the RTL guard
  (`[dir="rtl"] * { letter-spacing: normal !important; text-transform: none !important; }`).
- ESLint flat config: next/core-web-vitals + next/typescript + custom
  `no-restricted-syntax` selectors failing any `className` containing
  `ml-/mr-/pl-/pr-` (string literals and template literals, variants and
  negatives included). Probe-tested: fires on `ml-4`, passes on `ps-2`.
- Scripts: `dev` / `build` / `start` / `lint` / `typecheck`.

## Verification

`pnpm build` ✓ (SSG for /ar + /en) · `pnpm lint` ✓ · `tsc --noEmit` ✓ ·
runtime locale/direction curl-checked ✓ · lint guard probe ✓

## Outstanding

- Google Fonts fetch showed transient retries during build (succeeded; fonts
  are self-hosted after build). If a future offline build fails, vendor the
  Plex/Inter woff2 files locally the same way as RH-Zak.
- Metadata is a bare title placeholder — real metadata is Phase 6.
