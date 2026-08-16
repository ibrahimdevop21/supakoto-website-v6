/**
 * Service catalogue. All display strings live in messages under
 * services.items.<id>.* — this file is structure only.
 */

export type ServiceId =
  | "ppf"
  | "heat-isolation"
  | "colour-change"
  | "nano-ceramic"
  | "building-heat-isolation"
  | "marine-ppf"
  | "surface-protection";

/**
 * What the film goes on. Automotive-only surfaces (BookingWizard, package
 * tiers, before/after) must filter on "vehicle" — non-vehicle substrates
 * can never appear in the car booking flow.
 */
export type Substrate = "vehicle" | "building" | "marine" | "interior";

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
  // ⚠️ Marine + surface: NO CONFIRMED TAKAI PRODUCT exists for either
  // (automotive PPF is TPU for painted panels; hulls and marble may need
  // different films entirely). Zero specKeys/packages/FAQ by design —
  // every spec slot on their pages is a labelled TODO. Do not add
  // product codes, figures, or names here before written TAKAI
  // confirmation (inventing one is the SK-BLD error class). Launch of
  // both is BLOCKED — see ASSETS-NEEDED.md.
  {
    id: "marine-ppf",
    slug: "marine-ppf",
    substrate: "marine",
    specKeys: [],
    packageKeys: [],
    faqCount: 0,
  },
  {
    id: "surface-protection",
    slug: "surface-protection",
    substrate: "interior",
    specKeys: [],
    packageKeys: [],
    faqCount: 0,
  },
];

export const serviceIds = services.map((s) => s.id);

/**
 * Services whose pages exist but must NOT be indexed yet (thin content,
 * TAKAI product unconfirmed). Drives `robots: noindex, follow` on the page
 * AND exclusion from sitemap.ts. Enabling later = delete the id from this
 * set — nothing else to touch. (Phase 17, 2026-08-16.)
 * TODO(TAKAI-confirmation): remove "marine-ppf" / "surface-protection" here
 * once written product confirmation arrives (ASSETS-NEEDED, blocking item).
 */
export const NOINDEX_SERVICE_IDS: ReadonlySet<ServiceId> = new Set<ServiceId>([
  "marine-ppf",
  "surface-protection",
]);

/** Related services shown at the foot of each detail page (2–3 each). */
export const RELATED_SERVICES: Record<ServiceId, ServiceId[]> = {
  ppf: ["nano-ceramic", "heat-isolation", "colour-change"],
  "heat-isolation": ["ppf", "nano-ceramic", "building-heat-isolation"],
  "colour-change": ["ppf", "nano-ceramic"],
  "nano-ceramic": ["ppf", "heat-isolation", "colour-change"],
  "building-heat-isolation": ["heat-isolation", "surface-protection"],
  "marine-ppf": ["ppf", "surface-protection"],
  "surface-protection": ["building-heat-isolation", "marine-ppf"],
};

/** Path of a service's own page (building has a static route; the rest are [slug]). */
export function servicePath(s: Pick<Service, "slug">): string {
  return `/services/${s.slug}`;
}

/** The four automotive treatments — what the booking flow and car-only UI use. */
export const vehicleServices = services.filter(
  (s) => s.substrate === "vehicle",
);

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}
