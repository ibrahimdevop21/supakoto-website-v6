import type { Metadata } from "next";
import { localeUrl, SITE_URL } from "./site";

/**
 * Per-route metadata with correct language alternates.
 * Rule check upstream: descriptions must never carry warranty figures or
 * unscoped "lifetime" wording — they reuse vetted message strings only.
 */
export function pageMetadata({
  locale,
  path,
  title,
  description,
  noindex = false,
}: {
  locale: string;
  path: string;
  title: string;
  description: string;
  /** Thin/unconfirmed pages: rendered, crawlable, not indexed (Phase 17). */
  noindex?: boolean;
}): Metadata {
  const url = localeUrl(locale === "ar" ? "ar" : "en", path);
  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
    alternates: {
      canonical: url,
      languages: {
        ar: localeUrl("ar", path),
        en: localeUrl("en", path),
        "x-default": localeUrl("ar", path),
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "SupaKoto",
      locale: locale === "ar" ? "ar_EG" : "en_US",
      alternateLocale: locale === "ar" ? "en_US" : "ar_EG",
      type: "website",
    },
  };
}
