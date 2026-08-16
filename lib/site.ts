/** Canonical site origin. Override with NEXT_PUBLIC_SITE_URL on Vercel. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://supakoto.com";

/**
 * Sourced company facts (STRUCTURE-SPEC "Claim discipline" §1). Copy in
 * messages/*.json that states these numbers must agree with this file.
 */
export const FOUNDED_YEAR = 2016; // confirmed by Ibrahim Mohamed, 2026-08-16 (2018 was a V2-era slip)

/**
 * Vehicles protected — the /about "today in numbers" counter.
 *
 *   confirmedBy: "Ibrahim Mohamed"
 *   confirmedOn: "2026-08-16"
 *   note: "Baseline as of 2026. Reconcile against bdm-flow when the live
 *          counter is wired."
 *
 * Context for the record: ~15,000 as of 2025; three branches opened since,
 * network capacity now ~1,250 vehicles/month with a monthly floor ≈ 400.
 *
 * FUTURE (do not build yet): this becomes a live counter fed by bdm-flow.
 * bdm-flow launched 2026-06-01 with NO prior history, so the counter must
 * be FIXED BASELINE + LIVE DELTA (bdm-flow completions since its launch) —
 * never a raw count query, or the number drops to a few hundred overnight.
 */
export const CARS_PROTECTED = {
  baseline: 25000,
  baselineAsOf: "2026-08-16",
  confirmedBy: "Ibrahim Mohamed",
  confirmedOn: "2026-08-16",
  liveSource: "bdm-flow (launched 2026-06-01, no history before that) — baseline + delta only",
} as const;

/** The 18-minute SupaKoto documentary (supplied by Ibrahim, 2026-08-06). */
export const DOCUMENTARY_YOUTUBE_ID: string | null = "umm7ZVZvBqo";

export const ROUTES = [
  "/",
  "/about",
  "/authentic",
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
  "/services/building-heat-isolation",
  "/services/building-heat-isolation/quote",
  "/privacy",
  "/terms",
] as const;

export function localeUrl(locale: "ar" | "en", path: string): string {
  const p = path === "/" ? "" : path;
  return locale === "ar" ? `${SITE_URL}${p || "/"}` : `${SITE_URL}/en${p}`;
}
