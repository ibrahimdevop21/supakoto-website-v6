import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // The OG routes read these with fs at request time; Vercel's output
  // tracing doesn't follow process.cwd()-joined paths, so without this
  // the files are absent from the function bundle and every
  // opengraph-image 500s with ENOENT (2026-08-22 incident, ~2k/24h).
  outputFileTracingIncludes: {
    "/[locale]/opengraph-image": ["./assets/og/**", "./public/brand/logo-white.png"],
    "/[locale]/**/opengraph-image": ["./assets/og/**", "./public/brand/logo-white.png"],
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
      // Dropped service (2026-08-11): polishing removed from the
      // catalogue — both locales' URLs fold into the services index.
      ["/services/polishing", "/services"],
      ["/en/services/polishing", "/en/services"],
      // Phase 17 (2026-08-16): the per-service pages are back at
      // /services/<slug> (SEO re-split). The Phase-14 anchor redirects are
      // gone — an anchor can't be redirected server-side anyway, and every
      // internal link now targets the real page.
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
