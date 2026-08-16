/**
 * Site-level FAQ (the /faq page). Strings: faq.items.<id>.{q,a}.
 * Service-detail FAQs live under services.items.<id>.faq.*
 */

export type FaqCategory =
  | "general"
  | "warranty"
  | "booking"
  | "aftercare"
  | "buildings";

/** `link` renders a link-through under the answer (e.g. /authentic). */
export type FaqEntry = { id: string; category: FaqCategory; link?: string };

export const faqEntries: FaqEntry[] = [
  { id: "whatIsPpf", category: "general" },
  { id: "whyJapanese", category: "general" },
  { id: "genuine", category: "general", link: "/authentic" },
  { id: "howLongInstall", category: "booking" },
  { id: "bookingDeposit", category: "booking" },
  { id: "whichBranch", category: "booking" },
  { id: "warrantyTiers", category: "warranty" },
  { id: "warrantyVoid", category: "warranty" },
  { id: "warrantyTransfer", category: "warranty" },
  { id: "washAfter", category: "aftercare" },
  { id: "selfHealing", category: "aftercare" },
  { id: "bhiMeasure", category: "buildings" },
  { id: "bhiVisit", category: "buildings" },
  { id: "bhiDuration", category: "buildings" },
  { id: "bhiMismatch", category: "buildings" },
];
