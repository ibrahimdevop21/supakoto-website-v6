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
 * Regional lines — OPS-CONFIRMED 2026-08-16 (Ibrahim, after Dr. Amer's review;
 * supersedes the 2026-08-06 values). These are the booking-wizard and
 * quote-form destinations.
 *
 *  Egypt  call +20 110 340 2446 · WhatsApp 201103402446
 *  UAE    call +971 55 205 4478 · WhatsApp 971552054478
 *
 * DO NOT "CORRECT" THESE:
 *  - 01103402446 remains the Egypt regional line even though Alexandria's
 *    BRANCH number changed to +20 10 44202946 (content/branches.ts). It is a
 *    dedicated main line, not Alexandria's number.
 *  - The UAE regional line and the Dubai branch number are INTENTIONALLY the
 *    same number (+971 55 205 4478). The previous separate UAE call line
 *    (050…) is retired and must not come back.
 *
 * Do not add phone literals anywhere else — the build guard
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
    phone: "+971 55 205 4478",
    whatsapp: "971552054478",
  },
};

export const DEFAULT_REGION: RegionId = "egypt";
export const REGION_COOKIE = "sk-region";
