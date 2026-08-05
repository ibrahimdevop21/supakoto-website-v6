import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ar", "en"],
  defaultLocale: "ar",
  localePrefix: "as-needed",
  // Arabic is the default at "/" for everyone — no Accept-Language redirect.
  // Users switch locales explicitly; keeps canonicals stable for SEO.
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
