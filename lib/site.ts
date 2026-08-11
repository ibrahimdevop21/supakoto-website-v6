/** Canonical site origin. Override with NEXT_PUBLIC_SITE_URL on Vercel. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://supakoto.com";

/** The 18-minute SupaKoto documentary (supplied by Ibrahim, 2026-08-06). */
export const DOCUMENTARY_YOUTUBE_ID: string | null = "umm7ZVZvBqo";

export const ROUTES = [
  "/",
  "/about",
  "/faq",
  "/gallery",
  "/booking",
  "/warranty",
  "/warranty/claim",
  "/franchise",
  "/business",
  "/branches",
  "/contact",
  "/careers",
  "/services",
  "/services/ppf",
  "/services/heat-isolation",
  "/services/colour-change",
  "/services/nano-ceramic",
  "/services/building-heat-isolation",
  "/services/building-heat-isolation/quote",
  "/services/marine-ppf",
  "/services/surface-protection",
  "/privacy",
  "/terms",
] as const;

export function localeUrl(locale: "ar" | "en", path: string): string {
  const p = path === "/" ? "" : path;
  return locale === "ar" ? `${SITE_URL}${p || "/"}` : `${SITE_URL}/en${p}`;
}
