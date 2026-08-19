/**
 * Landing-session attribution — captured once per browser session on the
 * first page load and attached to booking / quote intents (Phase 18 item 6)
 * so the SK-ref that travels into WhatsApp can later be joined back to the
 * campaign that produced it. Contract: docs/progress/TRACKING-SPEC.md.
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
const CLICK_IDS = ["fbclid", "gclid", "gbraid", "wbraid", "ttclid"] as const;
const UTMS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "utm_id"] as const;

/** Store the landing context for this session (first page load wins, except a new click-id/UTM set overwrites). */
export function captureAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;
  try {
    const url = new URL(window.location.href);
    const incoming: Partial<Attribution> = {};
    for (const k of [...UTMS, ...CLICK_IDS]) {
      const v = url.searchParams.get(k);
      if (v) incoming[k] = v;
    }
    const existing = readAttribution();
    const hasNewCampaign = Object.keys(incoming).length > 0;
    if (existing && !hasNewCampaign) return existing;
    const entry: Attribution = {
      landed_at: new Date().toISOString(),
      landing_page: url.pathname + url.search,
      referrer: document.referrer || "",
      ...incoming,
    };
    sessionStorage.setItem(KEY, JSON.stringify(entry));
    return entry;
  } catch {
    return null; // storage unavailable (private mode)
  }
}

export function readAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Attribution) : null;
  } catch {
    return null;
  }
}
