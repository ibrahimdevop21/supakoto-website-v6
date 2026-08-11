/** Global nav structure per STRUCTURE-SPEC. Labels live in messages: nav.<key>. */

export type NavLeaf = { key: string; href: string };
export type NavItem = NavLeaf | { key: string; children: NavLeaf[] };

export const NAV: NavItem[] = [
  { key: "home", href: "/" },
  {
    key: "about",
    children: [
      { key: "aboutPage", href: "/about" },
      { key: "faq", href: "/faq" },
    ],
  },
  {
    // Added 2026-08-07 — services were never nav-reachable (gap inherited
    // from the reference IA). Buildings gets its own direct entry.
    key: "services",
    children: [
      { key: "servicesAll", href: "/services" },
      { key: "servicesPpf", href: "/services/ppf" },
      { key: "servicesHeatCars", href: "/services/heat-isolation" },
      { key: "servicesBuildings", href: "/services/building-heat-isolation" },
      { key: "servicesColour", href: "/services/colour-change" },
      { key: "servicesNano", href: "/services/nano-ceramic" },
      { key: "servicesMarine", href: "/services/marine-ppf" },
      { key: "servicesSurface", href: "/services/surface-protection" },
    ],
  },
  {
    key: "ourWork",
    children: [{ key: "gallery", href: "/gallery" }],
  },
  { key: "book", href: "/booking" },
  {
    key: "warranty",
    children: [
      { key: "warrantyPolicy", href: "/warranty" },
      { key: "warrantyClaim", href: "/warranty/claim" },
    ],
  },
  {
    key: "business",
    children: [
      { key: "franchise", href: "/franchise" },
      { key: "b2b", href: "/business" },
    ],
  },
  { key: "branches", href: "/branches" },
  {
    key: "contact",
    children: [
      { key: "contactPage", href: "/contact" },
      { key: "careers", href: "/careers" },
    ],
  },
];

export const SOCIAL_LINKS = [
  { key: "instagram", href: "https://instagram.com/supakoto" },
  { key: "tiktok", href: "#" }, // TODO — URL not in V2_Prod, see ASSETS-NEEDED.md
  { key: "facebook", href: "https://facebook.com/supakoto" },
  { key: "youtube", href: "#" }, // TODO — see ASSETS-NEEDED.md
  { key: "linkedin", href: "#" }, // TODO — see ASSETS-NEEDED.md
] as const;
