import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // V2 → V6 permanent redirects. Source of truth: docs/REDIRECTS.md.
  // V2 served EN at root and AR under /ar — V6 inverts that, so every
  // indexed /ar/* URL must be remapped or it lands on the wrong language.
  async redirects() {
    const arPages: Array<[string, string]> = [
      ["/ar", "/"],
      ["/ar/about", "/about"],
      ["/ar/services", "/services"],
      ["/ar/gallery", "/gallery"],
      ["/ar/locations", "/branches"],
      ["/ar/business", "/business"],
      ["/ar/contact", "/contact"],
      ["/ar/faq", "/faq"],
      ["/ar/privacy", "/privacy"],
      ["/ar/terms", "/terms"],
      ["/ar/offers", "/services"],
      ["/ar/thank-you", "/"],
      // EN routes whose V6 path is free (renamed or dropped in V6):
      ["/locations", "/en/branches"],
      ["/offers", "/en/services"],
      ["/thank-you", "/en"],
    ];
    return arPages.map(([source, destination]) => ({
      source,
      destination,
      permanent: true,
    }));
  },
};

export default withNextIntl(nextConfig);
