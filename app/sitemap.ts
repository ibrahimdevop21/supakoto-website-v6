import type { MetadataRoute } from "next";
import { ROUTES, localeUrl } from "@/lib/site";

/**
 * Sitemap = ROUTES (lib/site.ts), which is derived from the route list +
 * the service catalogue minus NOINDEX_SERVICE_IDS — never hand-maintained.
 * Both locales are declared per entry via hreflang alternates (+ x-default).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  // One <url> entry per locale (Google: every language URL is its own entry
  // with reciprocal alternates), so the file lists all 2 × ROUTES URLs.
  return ROUTES.flatMap((path) =>
    (["ar", "en"] as const).map((locale) => ({
      url: localeUrl(locale, path),
      lastModified: new Date(),
      changeFrequency: path === "/" ? ("weekly" as const) : ("monthly" as const),
      priority: path === "/" ? 1 : 0.7,
      alternates: {
        languages: {
          ar: localeUrl("ar", path),
          en: localeUrl("en", path),
          "x-default": localeUrl("ar", path),
        },
      },
    })),
  );
}
