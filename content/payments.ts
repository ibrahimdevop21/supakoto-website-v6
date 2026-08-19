import type { RegionId } from "./regions";

/**
 * Payment methods shown in the footer trust strip (Phase 18). Logos are the
 * V2 site's own assets (`supakoto-Website_V2_Prod/public/payment/`),
 * converted to trimmed WebP — nothing substituted. Displaying a logo
 * implies we accept it: the list is the one Ibrahim briefed (2026-08-19)
 * and is pending his per-branch confirmation before cutover.
 *
 *  Egypt   valU · Banque Misr · NBE · CIB
 *  UAE     Tabby
 *  Both    Visa · Mastercard · American Express · Apple Pay · Google Pay
 */
export type PaymentMethod = {
  id: string;
  /** Alt text / tooltip (brand name, not translated). */
  name: string;
  src: string;
  /** Intrinsic size of the asset (next/image needs it; aspect is kept). */
  width: number;
  height: number;
  /** undefined = both regions. */
  region?: RegionId;
  /** Instalment / BNPL programme (rendered in the "installments" row). */
  installments?: boolean;
  /** White-on-transparent mark — needs the dark chip, not the light one. */
  onDark?: boolean;
};

export const paymentMethods: PaymentMethod[] = [
  // Egypt
  { id: "valu", name: "valU", src: "/payment/valu.webp", width: 1107, height: 240, region: "egypt", installments: true },
  { id: "banque-misr", name: "Banque Misr", src: "/payment/banque-misr.webp", width: 284, height: 109, region: "egypt", installments: true },
  { id: "nbe", name: "National Bank of Egypt", src: "/payment/nbe.svg", width: 300, height: 90, region: "egypt", installments: true },
  // V2 only carried CIB's 50th-anniversary mark (109×33, white) — low-res,
  // white-only; replacement logged in ASSETS-NEEDED.
  { id: "cib", name: "CIB", src: "/payment/cib.webp", width: 109, height: 33, region: "egypt", installments: true, onDark: true },
  // UAE
  { id: "tabby", name: "Tabby", src: "/payment/tabby.webp", width: 512, height: 204, region: "uae", installments: true },
  // Both
  { id: "visa", name: "Visa", src: "/payment/visa.webp", width: 385, height: 240 },
  { id: "mastercard", name: "Mastercard", src: "/payment/mastercard.webp", width: 401, height: 240 },
  { id: "amex", name: "American Express", src: "/payment/amex.webp", width: 271, height: 240 },
  { id: "apple-pay", name: "Apple Pay", src: "/payment/apple-pay.webp", width: 240, height: 240 },
  { id: "google-pay", name: "Google Pay", src: "/payment/google-pay.webp", width: 289, height: 115 },
];

export function paymentsForRegion(region: RegionId): {
  installments: PaymentMethod[];
  cards: PaymentMethod[];
} {
  const visible = paymentMethods.filter((m) => !m.region || m.region === region);
  return {
    installments: visible.filter((m) => m.installments),
    cards: visible.filter((m) => !m.installments),
  };
}
