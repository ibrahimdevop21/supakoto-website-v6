# supakoto-website-V6

Rebuild of supakoto.com. Reference site for **information architecture and page
structure only**: `dettaglioauto.sa`. Visual identity is 100% SupaKoto.

## Non-negotiables

1. **Never copy from the reference site**: no scraped HTML, no scraped CSS, no
   downloaded images, no copied body text (Arabic or English). Structure and
   section ordering only. If you find yourself pasting anything from
   `dettaglioauto.sa`, stop.
2. **Arabic is the default locale.** `/` is Arabic RTL. `/en` is English LTR.
   Not the other way around.
3. **Framer Motion is the only animation layer.** No GSAP, no AOS, no
   `animate.css`, no bespoke CSS keyframe libraries.
4. **Fish shell.** All terminal commands must be fish-compatible. No bash
   heredocs (`<<EOF`). Use `printf` or write files with the editor tool.
5. **No co-author trailers in commits.** No `Co-Authored-By`, no
   `Generated with Claude Code`.
6. **Brief before build.** Before each phase, write the plan to
   `docs/progress/NN-phase.md`, then execute. After each phase, update it with
   what shipped and what's left.

## Stack

- Next.js 15, App Router, TypeScript strict
- Tailwind CSS v4 (`@theme` tokens, no `tailwind.config.js` colour duplication)
- `next-intl` for i18n
- Framer Motion
- `next/image` with AVIF + WebP
- Deploy target: Vercel

## Content rules

- Arabic copy is Modern Standard Arabic (فصحى). Professional and clear, not
  stiff or bureaucratic. Avoid MSA clichés: `نقدم لكم`, `أفضل الأسعار`,
  `خدمة متميزة`, `يسعدنا أن`. Short sentences. Same confident, minimal tone
  as the English. (Reversed from Egyptian dialect — Ibrahim, 2026-08-07.)
- English copy: confident, minimal, premium. Short sentences. No hype.
- Brand framing: premium Japanese engineering, long-term investment in the car.
  Never cheap, discount, "best price", or rushed.
- **Warranty claims are tier-scoped.** Warranty terms differ by product tier.
  Never write a single site-wide warranty figure. Every warranty statement must
  name the tier it belongs to.
  - Standard TAKAI tiers: **up to 15 years**
  - **Premium Plus: lifetime** — and every use of "lifetime" on this site must
    render the qualifier defined in `content/warranty.ts` in the same visual
    block. Never a bare "lifetime warranty" with no scope.
  - A page may state "lifetime" only on `/warranty`, the PPF section of
    `/services` (Phase 14 folded `/services/ppf` into it), and the Premium
    Plus tier card. Not in the footer, not in global taglines, not in
    metadata descriptions.

## Autonomy

Work through `docs/BUILD-BRIEF.md` phase by phase without asking for approval
between phases. Stop and ask **only** if you hit one of the blockers listed at
the end of that brief.

Every phase must end green: `pnpm build` passes, `pnpm lint` passes, no
TypeScript errors.
