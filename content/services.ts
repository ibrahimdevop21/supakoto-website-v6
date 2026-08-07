/**
 * Service catalogue. All display strings live in messages under
 * services.items.<id>.* — this file is structure only.
 */

export type ServiceId =
  | "ppf"
  | "heat-isolation"
  | "colour-change"
  | "nano-ceramic"
  | "polishing"
  | "building-heat-isolation";

/**
 * What the film goes on. Automotive-only surfaces (BookingWizard, package
 * tiers, before/after) must filter on "vehicle" — the buildings service can
 * never appear in the car booking flow.
 */
export type Substrate = "vehicle" | "building";

export type Service = {
  id: ServiceId;
  slug: string;
  substrate: Substrate;
  /** Rows in the detail spec table: services.items.<id>.spec.<key>.{label,value} */
  specKeys: string[];
  /** Package tiers: services.items.<id>.packages.<key>.{name,coverage} */
  packageKeys: string[];
  /** FAQ entries: services.items.<id>.faq.<n>.{q,a} */
  faqCount: number;
  /** Only PPF may speak about the Premium Plus lifetime tier. */
  premiumPlus?: boolean;
};

export const services: Service[] = [
  {
    id: "ppf",
    slug: "ppf",
    substrate: "vehicle",
    specKeys: ["material", "thickness", "warranty", "coverage", "selfHealing"],
    packageKeys: ["front", "partial", "full"],
    faqCount: 6,
    premiumPlus: true,
  },
  {
    id: "heat-isolation",
    slug: "heat-isolation",
    substrate: "vehicle",
    specKeys: ["material", "heatRejection", "uvRejection", "warranty", "shades"],
    packageKeys: ["windshield", "sides", "full"],
    faqCount: 5,
  },
  {
    id: "colour-change",
    slug: "colour-change",
    substrate: "vehicle",
    specKeys: ["material", "finish", "warranty", "removal"],
    packageKeys: ["accents", "full"],
    faqCount: 5,
  },
  {
    id: "nano-ceramic",
    slug: "nano-ceramic",
    substrate: "vehicle",
    specKeys: ["layers", "hardness", "warranty", "maintenance"],
    packageKeys: ["single", "multi", "withPpf"],
    faqCount: 5,
  },
  {
    id: "polishing",
    slug: "polishing",
    substrate: "vehicle",
    specKeys: ["stages", "duration", "finish"],
    packageKeys: ["exterior", "showroom"],
    faqCount: 4,
  },
  {
    // Single SKU: TAKAI TK-7099-IR. No shade options, no packages — the
    // funnel is quotation-based (customer-sent measurements), not booking.
    id: "building-heat-isolation",
    slug: "building-heat-isolation",
    substrate: "building",
    specKeys: [
      "product",
      "thickness",
      "vlt",
      "irRejection",
      "uvRejection",
      "tser",
      "warranty",
    ],
    packageKeys: [],
    faqCount: 4,
  },
];

export const serviceIds = services.map((s) => s.id);

/** The five automotive treatments — what the booking flow and car-only UI use. */
export const vehicleServices = services.filter(
  (s) => s.substrate === "vehicle",
);

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}
