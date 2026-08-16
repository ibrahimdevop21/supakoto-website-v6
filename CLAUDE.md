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

- **Arabic copy is white Arabic (عربية بيضاء)** — direction set by co-founder
  Dr. Amer, 2026-08-16; supersedes both the Egyptian-dialect rule and the
  plain-MSA rule. Fluent Modern Standard Arabic with simple, everyday
  vocabulary — the register pan-Arab brands and Gulf media use. Grammatically
  standard, effortless to read. An Egyptian, Emirati, or Saudi reader
  understands it immediately without parsing.
  - Common words over formal synonyms: `يحمي` not `يقي`, `يحافظ على` not `يصون`
  - Short sentences, one idea each
  - No classical constructions: `تجدر الإشارة`, `نظرًا لـ`, `يُعد`,
    `من الجدير بالذكر`, `حيث أن`
  - No MSA marketing clichés: `نقدم لكم`, `أفضل الأسعار`, `خدمة متميزة`,
    `يسعدنا أن`
  - No regionalisms — nothing distinctly Egyptian, Levantine, or Gulf
  - Active voice, direct address
  - Match the English tone: confident, minimal, unhurried
  - Simple must not become bland. «حماية يابانية أصلية لسيارتك» is simple AND
    specific. Generic service-site Arabic is a fail even if every rule passes.
  - Test per string: would this read naturally to a car owner in Cairo, Dubai,
    AND Riyadh with zero friction? If any of the three would pause on a word,
    choose a simpler one.
  - No tashkeel. Phone numbers always LTR. Every key lands in both `en` and `ar`.
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
