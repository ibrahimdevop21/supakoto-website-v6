import { localeUrl } from "./site";
import { SOCIAL_LINKS, CONTACT_EMAIL } from "./nav";

/**
 * schema.org BreadcrumbList for nested routes (Phase 17). `crumbs` are
 * [label, path] pairs from the home page down to the current page.
 */
export function breadcrumbLd(
  locale: "ar" | "en",
  crumbs: Array<[name: string, path: string]>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map(([name, path], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: localeUrl(locale, path),
    })),
  };
}

/** SupaKoto as the sole authorized TAKAI distributor — the site-wide Organization node. */
export function organizationLd(locale: "ar" | "en", description: string, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: "SupaKoto",
    url: siteUrl,
    logo: `${siteUrl}/brand/logo.svg`,
    description,
    email: CONTACT_EMAIL,
    sameAs: SOCIAL_LINKS.map((s) => s.href),
    foundingDate: "2016",
    areaServed: [
      { "@type": "Country", name: "Egypt" },
      { "@type": "Country", name: "United Arab Emirates" },
    ],
    brand: {
      "@type": "Brand",
      name: "TAKAI",
      manufacturer: {
        "@type": "Organization",
        name: "Nippon Takai Trading & Innovation Co., Ltd.",
        address: { "@type": "PostalAddress", addressLocality: "Tokyo", addressCountry: "JP" },
      },
    },
    mainEntityOfPage: localeUrl(locale, "/authentic"),
  };
}
