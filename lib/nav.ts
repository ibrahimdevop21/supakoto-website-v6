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

/**
 * Live profile URLs — the V2 site's values (Ibrahim, 2026-08-19). V6 had
 * drifted to instagram.com/supakoto and facebook.com/supakoto; these are
 * the real handles. Also emitted as Organization `sameAs` (lib/jsonld.ts).
 */
export const SOCIAL_LINKS = [
  { key: "facebook", href: "https://www.facebook.com/SUPAKOTO" },
  { key: "instagram", href: "https://www.instagram.com/supakotoofficial/" },
  { key: "tiktok", href: "https://www.tiktok.com/@suapkoto.uae" },
  { key: "youtube", href: "https://www.youtube.com/@supakoto94" },
  { key: "linkedin", href: "https://www.linkedin.com/company/supakoto/" },
] as const;

/** Business / franchise enquiries. Rendered in the footer and on /contact. */
// The only mailbox that exists (Ibrahim, 2026-08-25). supakoto.com is a
// URL domain, never a mail domain — scripts/check-email-fallbacks.mjs enforces it.
export const CONTACT_EMAIL = "info@supakoto.org";
