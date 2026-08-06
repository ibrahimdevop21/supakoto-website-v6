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
 * RESOLVED (Ibrahim, 2026-08-06):
 * - Lifetime scope: LIFETIME OF THE VEHICLE — the warranty transfers with
 *   the car on resale (all tiers transfer). Qualifier text lives at
 *   warranty.qualifier.text and still must render beside every "lifetime".
 * - Coverage rows filled per the same decision + the TAKAI spec sheet;
 *   exclusions mirror the long-approved FAQ wording.
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
  { key: "scope", todo: false },
  { key: "transferable", todo: false },
  { key: "yellowing", todo: false },
  { key: "cracking", todo: false },
  { key: "selfHealing", todo: false },
  { key: "exclusions", todo: false },
];

/**
 * Message key for the mandatory lifetime qualifier. Renders adjacent to
 * EVERY "lifetime" mention, same visual block, no exceptions.
 * Resolved 2026-08-06: lifetime of the vehicle, transfers on resale.
 */
export const LIFETIME_QUALIFIER_KEY = "warranty.qualifier.text";

/** Routes allowed to render the word "lifetime" at all. */
export const LIFETIME_ALLOWED_ROUTES = [
  "/warranty",
  "/services/ppf",
] as const;

/**
 * Per-product warranty terms — OPS-CONFIRMED for EGYPT (Performance line),
 * Ibrahim 2026-08-06: TAKAI 5 → 5y, GOLD/GOLD PLUS → 10y,
 * STEEL/STEEL PLUS → 15y, PREMIUM PLUS → lifetime (qualifier still TODO).
 * UAE (Signature line): only PREMIUM PLUS confirmed (lifetime, both
 * regions); all other Signature products unconfirmed — render the honest
 * TBC cell, do not guess.
 */
export type ProductWarrantyTerm =
  | { kind: "years"; years: 5 | 10 | 15 }
  | { kind: "lifetime" }
  | { kind: "tbc" };

const egyptTerms: Record<string, ProductWarrantyTerm> = {
  "TAKAI 5": { kind: "years", years: 5 },
  "TAKAI GOLD": { kind: "years", years: 10 },
  "TAKAI GOLD PLUS": { kind: "years", years: 10 },
  "TAKAI STEEL": { kind: "years", years: 15 },
  "TAKAI STEEL PLUS": { kind: "years", years: 15 },
  "TAKAI PREMIUM PLUS": { kind: "lifetime" },
};

/** Display grouping for the /warranty page (Egypt / Performance line). */
export const egyptTierBreakdown: Array<{
  products: string[];
  term: ProductWarrantyTerm;
}> = [
  { products: ["TAKAI 5"], term: { kind: "years", years: 5 } },
  { products: ["TAKAI GOLD", "TAKAI GOLD PLUS"], term: { kind: "years", years: 10 } },
  { products: ["TAKAI STEEL", "TAKAI STEEL PLUS"], term: { kind: "years", years: 15 } },
  { products: ["TAKAI PREMIUM PLUS"], term: { kind: "lifetime" } },
];

export function warrantyTermForProduct(
  region: "egypt" | "uae",
  productName: string,
): ProductWarrantyTerm {
  if (productName === "TAKAI PREMIUM PLUS") return { kind: "lifetime" };
  if (region === "egypt") return egyptTerms[productName] ?? { kind: "tbc" };
  return { kind: "tbc" };
}
