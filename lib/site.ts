/** Canonical site origin. Override with NEXT_PUBLIC_SITE_URL on Vercel. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://supakoto.com";

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
  "/services/polishing",
  "/privacy",
  "/terms",
] as const;

export function localeUrl(locale: "ar" | "en", path: string): string {
  const p = path === "/" ? "" : path;
  return locale === "ar" ? `${SITE_URL}${p || "/"}` : `${SITE_URL}/en${p}`;
}
