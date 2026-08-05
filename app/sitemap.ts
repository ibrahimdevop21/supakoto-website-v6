import type { MetadataRoute } from "next";
import { ROUTES, localeUrl } from "@/lib/site";

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
      },
    },
  }));
}
