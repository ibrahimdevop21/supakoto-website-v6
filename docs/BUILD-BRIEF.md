# V6 Build Brief — autonomous execution

Read `CLAUDE.md`, `docs/STRUCTURE-SPEC.md`, and `docs/DESIGN-TOKENS.md` before
starting. Work phases in order. Do not ask for approval between phases. Write
a short brief to `docs/progress/NN-*.md` before each phase and update it after.

Every phase ends green: `pnpm build` clean, `pnpm lint` clean, zero TS errors.
Commit at each phase boundary. No co-author trailers.

---

## Phase 0 — Reference capture

```fish
pnpm add -D playwright
npx playwright install chromium
node scripts/capture-reference.mjs
```

Then read `reference/capture/outline.json` and write
`docs/progress/00-reference.md` recording, per page: section count, section
order, and where the measured layout differs from `STRUCTURE-SPEC.md`. The spec
wins on disagreement unless the capture shows something clearly better.

Add `reference/` to `.gitignore` immediately. Those screenshots are working
material, not assets.

## Phase 1 — Scaffold

Next.js 15 + TS strict + Tailwind v4 + next-intl + Framer Motion.

- Routing: `app/[locale]/...` with `ar` default (no prefix) and `en` prefixed.
- `<html dir>` driven by locale.
- Fonts wired: RH-Zak local, IBM Plex Sans Arabic + Inter via `next/font`.
- `app/globals.css` carries the full `@theme` block from `DESIGN-TOKENS.md`.
- Base layer guard: `[dir="rtl"] * { letter-spacing: normal !important; }` on
  Arabic text elements.
- ESLint rule banning `ml-`/`mr-`/`pl-`/`pr-` Tailwind classes. Logical only.

## Phase 2 — Primitives

`Container`, `Section`, `Eyebrow`, `Heading`, `Button` (primary/ghost/link),
`Card`, `Reveal` (the standard Framer entrance wrapper), `Counter`,
`Accordion`, `Lightbox`, `Field` set for forms.

Build a `/dev/kitchen-sink` route rendering every primitive in both locales and
both directions. This is the visual regression surface.

## Phase 3 — Chrome

Header (sticky, scroll-solidify, two-level dropdowns, mobile drawer), Footer,
RegionPicker modal, locale switcher, WhatsApp FAB.

RegionPicker holds Egypt/UAE in a context provider — branch lists, phone
numbers, and currency all read from it. Persist the choice in a cookie.

## Phase 4 — Content layer

All copy in `messages/ar.json` and `messages/en.json`. No hardcoded strings in
components, not even placeholders. Branch, service, and FAQ data as typed
objects in `content/`.

Write the Arabic first, in Egyptian dialect. Translate to English second —
English is not the source of truth here.

## Phase 5 — Pages, in this order

1. `/` (home)
2. `/services` + the five `/services/[slug]` pages
3. `/branches`
4. `/about`
5. `/warranty` + `/warranty/claim`
6. `/gallery`
7. `/booking`
8. `/franchise`, `/business`
9. `/faq`, `/contact`, `/careers`, `/privacy`, `/terms`

## Phase 6 — Polish

- Metadata per route, both locales, `alternates.languages` correct
- `sitemap.ts`, `robots.ts`, JSON-LD (`LocalBusiness` per branch,
  `Service` per service page, `FAQPage`)
- OG images per route via `opengraph-image.tsx`
- Lighthouse ≥ 95 across all four categories on `/` mobile
- Keyboard nav + focus rings on every interactive element
- `prefers-reduced-motion` honoured

## Phase 7 — Ship

Vercel. **Disable Deployment Protection** — it caused a false login redirect on
V5 and burned a day. Verify the preview loads in a private window before
declaring done.

---

## Stop and ask only for these

1. **Assets.** Logo files, branch photos, gallery media, RH-Zak font files.
   Build with clearly-labelled placeholders and list what's missing in
   `docs/progress/ASSETS-NEEDED.md` — don't stall the build waiting.
2. **Franchise investment figures.** Left blank in the spec on purpose.
3. **Branch data conflicts.** The seed table in `STRUCTURE-SPEC.md` is
   unverified. If two sources disagree on a phone number, flag it, don't guess.
4. **bdm-flow booking contract.** If the Supabase schema doesn't match what
   `/booking` needs, write the mismatch down and stub the submit handler.
5. **Warranty tier terms.** `content/warranty.ts` ships with TODOs. The
   Premium Plus lifetime qualifier — whose lifetime — is a commitment only
   Ibrahim can make. Build the table, leave the cells honest, do not invent
   coverage terms.
6. Anything that would require copying from the reference site.
