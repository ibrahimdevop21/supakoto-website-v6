/** Global nav structure per STRUCTURE-SPEC. Labels live in messages: nav.<key>. */

export type NavLeaf = { key: string; href: string };
export type NavItem = NavLeaf | { key: string; children: NavLeaf[] };

export const NAV: NavItem[] = [
  { key: "home", href: "/" },
  {
    key: "about",
    children: [
      { key: "aboutPage", href: "/about" },
      { key: "authenticity", href: "/authentic" },
      { key: "faq", href: "/faq" },
    ],
  },
  // Single link since Phase 14 — all services render inline on /services
  // (anchored sections); the per-service dropdown died with the detail pages.
  { key: "services", href: "/services" },
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
