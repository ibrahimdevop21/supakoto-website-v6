/**
 * Service catalogue. All display strings live in messages under
 * services.items.<id>.* — this file is structure only.
 */

export type ServiceId =
  | "ppf"
  | "heat-isolation"
  | "colour-change"
  | "nano-ceramic"
  | "polishing";

export type Service = {
  id: ServiceId;
  slug: string;
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
    specKeys: ["material", "thickness", "warranty", "coverage", "selfHealing"],
    packageKeys: ["front", "partial", "full"],
    faqCount: 6,
    premiumPlus: true,
  },
  {
    id: "heat-isolation",
    slug: "heat-isolation",
    specKeys: ["material", "heatRejection", "uvRejection", "warranty", "shades"],
    packageKeys: ["windshield", "sides", "full"],
    faqCount: 5,
  },
  {
    id: "colour-change",
    slug: "colour-change",
    specKeys: ["material", "finish", "warranty", "removal"],
    packageKeys: ["accents", "full"],
    faqCount: 5,
  },
  {
    id: "nano-ceramic",
    slug: "nano-ceramic",
    specKeys: ["layers", "hardness", "warranty", "maintenance"],
    packageKeys: ["single", "multi", "withPpf"],
    faqCount: 5,
  },
  {
    id: "polishing",
    slug: "polishing",
    specKeys: ["stages", "duration", "finish"],
    packageKeys: ["exterior", "showroom"],
    faqCount: 4,
  },
];

export const serviceIds = services.map((s) => s.id);

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}
