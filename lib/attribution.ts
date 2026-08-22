/**
 * First-touch attribution — captured on the first landing and attached to
 * booking / quote / enquiry intents so the SK-ref that travels into
 * WhatsApp can be joined back to the campaign that produced it. Contract:
 * docs/progress/TRACKING-SPEC.md.
 *
 * Phase 21 (audit fix #2): stored in a FIRST-PARTY COOKIE with a 30-day
 * window, not sessionStorage — PPF is a considered purchase and the
 * ad-click-today-book-in-two-days visitor is exactly the one worth
 * attributing. FIRST TOUCH WINS: a later visit never overwrites, even
 * with fresh UTMs or click-ids (Ibrahim, 2026-08-22 — supersedes the
 * Phase 18 "new campaign overwrites" rule). The cookie simply expires
 * after 30 days and the next landing starts a new first touch.
 */

export type Attribution = {
  landed_at: string;
  landing_page: string;
  referrer: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  utm_id?: string;
  fbclid?: string;
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  ttclid?: string;
};

const KEY = "sk-attribution";
const MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days
const CLICK_IDS = ["fbclid", "gclid", "gbraid", "wbraid", "ttclid"] as const;
const UTMS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "utm_id"] as const;

/** Store the first-touch landing context for 30 days. Never overwrites. */
export function captureAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;
  try {
    const existing = readAttribution();
    if (existing) return existing; // first touch wins — no overwrite
    const url = new URL(window.location.href);
    const incoming: Partial<Attribution> = {};
    for (const k of [...UTMS, ...CLICK_IDS]) {
      const v = url.searchParams.get(k);
      if (v) incoming[k] = v;
    }
    const entry: Attribution = {
      landed_at: new Date().toISOString(),
      landing_page: url.pathname + url.search,
      referrer: document.referrer || "",
      ...incoming,
    };
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie =
      `${KEY}=${encodeURIComponent(JSON.stringify(entry))}` +
      `; Max-Age=${MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secure}`;
    return entry;
  } catch {
    return null; // cookies blocked — attribution simply absent
  }
}

export function readAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;
  try {
    const match = document.cookie
      .split("; ")
      .find((c) => c.startsWith(`${KEY}=`));
    if (!match) return null;
    return JSON.parse(decodeURIComponent(match.slice(KEY.length + 1))) as Attribution;
  } catch {
    return null;
  }
}
