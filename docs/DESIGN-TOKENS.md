# Design Tokens — SupaKoto V6

The reference site contributes **zero** visual DNA. Everything below is
SupaKoto's own identity: dark base, single red accent, Japanese-minimal
restraint, generous negative space.

## Palette

```css
@theme {
  /* Brand */
  --color-sk-red:        #bf1e2e;
  --color-sk-red-hover:  #a51828;
  --color-sk-red-muted:  #bf1e2e1a;

  /* Surfaces — dark is the default mode, not an option */
  --color-ink-950: #0a0a0b;  /* page background */
  --color-ink-900: #111113;  /* raised surface */
  --color-ink-800: #1a1a1d;  /* card */
  --color-ink-700: #26262b;  /* border, hairline */

  /* Text */
  --color-fg:        #f5f5f4;
  --color-fg-muted:  #a1a1a5;
  --color-fg-subtle: #6b6b70;

  /* Light sections (used sparingly — spec pages, forms) */
  --color-paper: #fafaf9;
  --color-paper-ink: #0a0a0b;
}
```

Red is an **accent, not a surface**. It appears on: primary CTA fill, active
nav underline, stat counter numerals, section eyebrow rules, focus rings.
Never as a large background block. If a screen has more than ~5% red by area,
it's wrong.

## Type

```css
@theme {
  --font-display: "RH-Zak", system-ui, sans-serif;   /* installed system-wide */
  --font-body-ar: "IBM Plex Sans Arabic", sans-serif;
  --font-body-en: "Inter", system-ui, sans-serif;
}
```

- **RH-Zak** — display only: H1, H2, stat numerals, hero. Never body copy.
- Arabic body: IBM Plex Sans Arabic. Ships variable, good RTL metrics.
- English body: Inter.

Scale (clamp, fluid 390 → 1440):

| Token | Size |
|---|---|
| `display` | `clamp(2.75rem, 6vw, 5rem)` |
| `h1` | `clamp(2.25rem, 4.5vw, 3.5rem)` |
| `h2` | `clamp(1.75rem, 3vw, 2.5rem)` |
| `h3` | `clamp(1.25rem, 2vw, 1.5rem)` |
| `body` | `1rem` / `1.7` line-height |
| `small` | `0.875rem` |
| `eyebrow` | `0.75rem`, `0.18em` tracking, uppercase (Latin only) |

Arabic never gets letter-spacing and never gets `text-transform`. Guard this
in the base layer — it breaks glyph joining.

## Spacing & layout

- 4px base. Section vertical rhythm: `clamp(5rem, 10vw, 9rem)`.
- Container: `max-width: 1280px`, gutter `clamp(1.25rem, 4vw, 3rem)`.
- Radius: `--radius-card: 4px`. Deliberately tight — the Japanese-precision
  read comes from sharp corners, not soft ones. No `rounded-2xl` anywhere.
- Borders: `1px solid var(--color-ink-700)`. Hairlines over shadows. Shadows
  are near-invisible on a dark base anyway.

## Motion — Framer Motion only

| Use | Value |
|---|---|
| Entrance | `y: 24 → 0`, `opacity: 0 → 1`, `0.6s`, `[0.16, 1, 0.3, 1]` |
| Hover lift | `y: -4`, `0.25s` ease-out |
| Stagger | `0.08s` between children |
| Hero drift | 12s linear, `scale: 1 → 1.06` |
| Counters | count up over `1.6s`, trigger at 40% viewport |

All wrapped in `useReducedMotion()`. Nothing loops infinitely except the hero
carousel.

## RTL

Logical properties throughout (`ms-*`, `me-*`, `ps-*`, `pe-*`). Never `ml-*` /
`mr-*`. Icons that imply direction (arrows, chevrons) mirror; icons that don't
(clock, phone, star) do not. Numerals stay Western (`١٢٣` reads as a design
affectation to Egyptian car buyers — use `123`).
