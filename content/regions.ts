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
 * Regional lines — OPS-CONFIRMED 2026-08-06 (Ibrahim's decision):
 * Egypt call and WhatsApp are the same line; UAE call and WhatsApp differ.
 * Branch-level numbers live in content/branches.ts (seed table, confirmed
 * available). Do not add phone literals anywhere else — the build guard
 * (scripts/check-phone-literals.mjs) fails on numbers outside content/.
 */
export const regions: Record<RegionId, Region> = {
  egypt: {
    id: "egypt",
    currency: "EGP",
    phone: "+20 110 340 2446",
    whatsapp: "201103402446",
  },
  uae: {
    id: "uae",
    currency: "AED",
    phone: "+971 50 626 5404",
    whatsapp: "971552054478",
  },
};

export const DEFAULT_REGION: RegionId = "egypt";
export const REGION_COOKIE = "sk-region";
