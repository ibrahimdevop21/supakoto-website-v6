export type RegionId = "egypt" | "uae";

export type Region = {
  id: RegionId;
  currency: "EGP" | "AED";
  /** Display phone, always rendered LTR. */
  phone: string;
  /** wa.me target, digits only. */
  whatsapp: string;
};

/**
 * Phone/WhatsApp values come from the STRUCTURE-SPEC seed table and V2_Prod.
 * Both are flagged for ops verification before launch — see
 * docs/progress/ASSETS-NEEDED.md.
 */
export const regions: Record<RegionId, Region> = {
  egypt: {
    id: "egypt",
    currency: "EGP",
    phone: "+20 122 008 0189",
    whatsapp: "201128859849",
  },
  uae: {
    id: "uae",
    currency: "AED",
    phone: "+971 55 205 4478",
    whatsapp: "971552054478",
  },
};

export const DEFAULT_REGION: RegionId = "egypt";
export const REGION_COOKIE = "sk-region";
