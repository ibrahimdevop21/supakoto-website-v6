/**
 * Warranty is TIERED. This file is the single source of truth for every
 * warranty claim on the site.
 *
 * Hard rules (CLAUDE.md):
 * - No site-wide single warranty figure, ever.
 * - Standard TAKAI tiers: "up to 15 years", always named as such.
 * - Premium Plus: "lifetime" — allowed ONLY on /warranty, the PPF section
 *   of /services (Phase 14 folded /services/ppf into it) and the Premium
 *   Plus tier card, and every render MUST place the qualifier
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
  "/services", // PPF section only — the old /services/ppf page lives here now
] as const;

/**
 * Per-product warranty terms — OPS-CONFIRMED, Ibrahim 2026-08-06.
 * EGYPT (Performance line): TAKAI 5 → 5y, GOLD/GOLD PLUS → 10y,
 * STEEL/STEEL PLUS → 15y, PREMIUM PLUS → lifetime.
 * UAE (Signature line): SILVER → 5y; MATT / MATT PLUS / Colours /
 * ULTIMATE GLOSS → 10y; STEELPLUS → 15y; PREMIUM PLUS → lifetime.
 * Lifetime = vehicle lifetime, transfers on resale.
 *
 * NAMING (Dr. Amer, 2026-08-16): in the UAE the entry product is called
 * TAKAI SILVER — only. Never "TAKAI 5", never "SILVER (TAKAI 5)", never any
 * statement that the two are the same film. Product names are region-scoped;
 * /warranty renders one region's list at a time (TierBreakdown, RegionPicker).
 *
 * HEAT (Dr. Amer, 2026-08-16): PPF / Premium Plus is body-panel paint
 * protection. Nothing here or in any PPF context may claim heat isolation,
 * IR/UV rejection, or cabin-temperature benefit — glass heat isolation is a
 * separate product and service. Enforced by scripts/check-claims.mjs.
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

const uaeTerms: Record<string, ProductWarrantyTerm> = {
  "TAKAI SILVER": { kind: "years", years: 5 },
  "TAKAI MATT": { kind: "years", years: 10 },
  "TAKAI MATT PLUS": { kind: "years", years: 10 },
  "TAKAI Colours": { kind: "years", years: 10 },
  "TAKAI ULTIMATE GLOSS": { kind: "years", years: 10 },
  "TAKAI STEELPLUS": { kind: "years", years: 15 },
  "TAKAI PREMIUM PLUS": { kind: "lifetime" },
};

export type TierBreakdownGroup = {
  products: string[];
  term: ProductWarrantyTerm;
};

/** Display groupings for the /warranty page. */
export const egyptTierBreakdown: TierBreakdownGroup[] = [
  { products: ["TAKAI 5"], term: { kind: "years", years: 5 } },
  { products: ["TAKAI GOLD", "TAKAI GOLD PLUS"], term: { kind: "years", years: 10 } },
  { products: ["TAKAI STEEL", "TAKAI STEEL PLUS"], term: { kind: "years", years: 15 } },
  { products: ["TAKAI PREMIUM PLUS"], term: { kind: "lifetime" } },
];

export const uaeTierBreakdown: TierBreakdownGroup[] = [
  { products: ["TAKAI SILVER"], term: { kind: "years", years: 5 } },
  {
    products: ["TAKAI MATT", "TAKAI MATT PLUS", "TAKAI Colours", "TAKAI ULTIMATE GLOSS"],
    term: { kind: "years", years: 10 },
  },
  { products: ["TAKAI STEELPLUS"], term: { kind: "years", years: 15 } },
  { products: ["TAKAI PREMIUM PLUS"], term: { kind: "lifetime" } },
];

/** Region-gated view for /warranty — never render both lists together. */
export function tierBreakdownForRegion(
  region: "egypt" | "uae",
): TierBreakdownGroup[] {
  return region === "uae" ? uaeTierBreakdown : egyptTierBreakdown;
}

export function warrantyTermForProduct(
  region: "egypt" | "uae",
  productName: string,
): ProductWarrantyTerm {
  if (productName === "TAKAI PREMIUM PLUS") return { kind: "lifetime" };
  const terms = region === "egypt" ? egyptTerms : uaeTerms;
  return terms[productName] ?? { kind: "tbc" };
}
