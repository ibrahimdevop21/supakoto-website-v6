import type { MetadataRoute } from "next";
import { ROUTES, localeUrl } from "@/lib/site";

/**
 * Sitemap = ROUTES (lib/site.ts), which is derived from the route list +
 * the service catalogue minus NOINDEX_SERVICE_IDS — never hand-maintained.
 * Both locales are declared per entry via hreflang alternates (+ x-default).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((path) => ({
    url: localeUrl("ar", path),
    lastModified: new Date(),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
    alternates: {
      languages: {
        ar: localeUrl("ar", path),
        en: localeUrl("en", path),
        "x-default": localeUrl("ar", path),
      },
    },
  }));
}
