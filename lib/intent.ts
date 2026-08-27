import { readAttribution } from "./attribution";

/**
 * Client-side intent log — the record that pairs the SK-ref sent into
 * WhatsApp with the landing attribution (Phase 18 item 6; shape is the
 * Phase-3 contract in docs/progress/TRACKING-SPEC.md). One localStorage
 * key per kind, last 20 entries each. Phase 19 moved it here so the
 * wizard's three flows and the standalone quote page share one writer.
 */
export type IntentKind = "booking" | "quote" | "enquiry" | "form";

const KEYS: Record<IntentKind, string> = {
  booking: "sk-booking-intents",
  quote: "sk-building-quote-intents",
  enquiry: "sk-enquiry-intents",
  // Phase 23: the five site forms (service = the FormId).
  form: "sk-form-intents",
};

export function logIntent(
  kind: IntentKind,
  entry: {
    ref: string;
    region: string;
    branch: string | null;
    service: string;
    draft: unknown;
  },
) {
  const full = {
    ref: entry.ref,
    kind,
    at: new Date().toISOString(),
    region: entry.region,
    branch: entry.branch,
    service: entry.service,
    locale: typeof document !== "undefined" ? document.documentElement.lang : undefined,
    attribution: readAttribution(),
    draft: entry.draft,
  };
  console.info(`[${kind}] submit intent`, full);
  try {
    const key = KEYS[kind];
    const log = JSON.parse(localStorage.getItem(key) ?? "[]") as unknown[];
    log.push(full);
    localStorage.setItem(key, JSON.stringify(log.slice(-20)));
  } catch {
    // storage unavailable (private mode) — console log above still fired
  }
}
