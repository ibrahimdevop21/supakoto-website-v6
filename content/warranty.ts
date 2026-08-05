/**
 * Warranty is TIERED. This file is the single source of truth for every
 * warranty claim on the site.
 *
 * Hard rules (CLAUDE.md):
 * - No site-wide single warranty figure, ever.
 * - Standard TAKAI tiers: "up to 15 years", always named as such.
 * - Premium Plus: "lifetime" — allowed ONLY on /warranty, /services/ppf and
 *   the Premium Plus tier card, and every render MUST place the qualifier
 *   (LIFETIME_QUALIFIER message key) in the same visual block.
 *
 * TODO (Ibrahim — stop-and-ask item #5, unresolved by design):
 * - Whose lifetime? film / original ownership / vehicle. Materially
 *   different promises. The message key warranty.qualifier.todo renders a
 *   clearly-labelled placeholder until decided.
 * - Row values marked `todo: true` render as honest "to be confirmed"
 *   cells, not invented coverage.
 */

export type WarrantyTierId = "standard" | "premiumPlus";

export type WarrantyTerm =
  | { kind: "years"; upTo: number }
  | { kind: "lifetime" };

export type WarrantyRow = {
  /** messages: warranty.rows.<key>.label (+ .standard / .premiumPlus when !todo) */
  key: string;
  todo: boolean;
};

export const warrantyTiers: Record<
  WarrantyTierId,
  { id: WarrantyTierId; term: WarrantyTerm }
> = {
  standard: { id: "standard", term: { kind: "years", upTo: 15 } },
  premiumPlus: { id: "premiumPlus", term: { kind: "lifetime" } },
};

export const warrantyRows: WarrantyRow[] = [
  { key: "term", todo: false },
  { key: "scope", todo: true },
  { key: "transferable", todo: true },
  { key: "yellowing", todo: true },
  { key: "cracking", todo: true },
  { key: "selfHealing", todo: true },
  { key: "exclusions", todo: true },
];

/**
 * Message key for the mandatory lifetime qualifier. Renders adjacent to
 * EVERY "lifetime" mention, same visual block, no exceptions.
 * Currently a labelled TODO — do not launch with it unresolved.
 */
export const LIFETIME_QUALIFIER_KEY = "warranty.qualifier.todo";

/** Routes allowed to render the word "lifetime" at all. */
export const LIFETIME_ALLOWED_ROUTES = [
  "/warranty",
  "/services/ppf",
] as const;
