/**
 * SupaKoto analytics — the ONLY file allowed to talk to gtag / fbq / ttq.
 *
 * One call site fans out to every platform so no conversion silently misses
 * one (Phase 18, Ibrahim 2026-08-19; V2 audit: GTM had zero custom-event
 * triggers, every dataLayer.push was ignored). Direct pixels, no tag
 * manager — everything tracked lives in this repo and shows up in code
 * review. `scripts/check-analytics-calls.mjs` fails the build on any direct
 * platform call outside this module.
 *
 * IDs come from NEXT_PUBLIC_* env (never hard-coded in components). A
 * platform whose ID is unset is simply skipped — the rest still fire.
 *
 *   NEXT_PUBLIC_GA4_ID            G-XXXXXXXXXX
 *   NEXT_PUBLIC_META_PIXEL_ID     15–16 digits
 *   NEXT_PUBLIC_TIKTOK_PIXEL_ID   TikTok pixel code
 *   NEXT_PUBLIC_GOOGLE_ADS_ID     AW-XXXXXXXXXX (base tag only — remarketing
 *                                 audiences; no conversion actions in Phase 1)
 *
 * Loading: `initAnalytics()` runs from the <Analytics /> provider AFTER
 * hydration (useEffect) — nothing render-blocking, nothing in <head>. The
 * queue stubs are created synchronously inside init, so `track()` calls
 * that race the network are buffered by each SDK's own queue.
 *
 * Event taxonomy + platform mapping: docs/progress/TRACKING-SPEC.md.
 */

/* ---------- taxonomy ---------- */

export type WhatsAppSource =
  | "booking"
  | "quote"
  | "fab"
  | "footer"
  | "branch_card"
  | "branch_map"
  | "service_page"
  | "contact";

export type FormId =
  | "contact"
  | "careers"
  | "franchise"
  | "business"
  | "warranty_claim";

export type EventMap = {
  /** Every route, including client-side navigation. */
  page_view: { path: string; title?: string };
  /** Service detail pages. */
  service_view: { service: string };
  /** Booking wizard step 1 shown. */
  booking_start: { region: string };
  booking_step: { step: number; step_name: string; region: string };
  /** PRIMARY conversion — fired BEFORE the WhatsApp handoff. */
  booking_complete: {
    ref: string;
    region: string;
    branch: string;
    service: string;
  };
  /** Building quote form shown. */
  quote_start: { region: string };
  /** PRIMARY conversion — fired BEFORE the WhatsApp handoff. */
  quote_complete: { ref: string; region: string; property_type: string };
  /** Any wa.me link. */
  whatsapp_click: {
    source: WhatsAppSource;
    region?: string;
    branch?: string;
    ref?: string;
  };
  /** Any tel: link. `branch` is a branch id or "<region>-regional". */
  call_click: { branch: string; source?: string };
  /** Branch card / map-pin interaction. */
  branch_view: {
    branch: string;
    action: "call" | "whatsapp" | "directions" | "map_popup";
  };
  /** Stub forms (contact / careers / franchise / business / warranty claim). */
  form_submit: { form: FormId };
};

export type EventName = keyof EventMap;

/* ---------- env ---------- */

export const ANALYTICS_IDS = {
  ga4: process.env.NEXT_PUBLIC_GA4_ID || "",
  meta: process.env.NEXT_PUBLIC_META_PIXEL_ID || "",
  tiktok: process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || "",
  googleAds: process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || "",
} as const;

export const analyticsEnabled = Boolean(
  ANALYTICS_IDS.ga4 || ANALYTICS_IDS.meta || ANALYTICS_IDS.tiktok || ANALYTICS_IDS.googleAds,
);

/* ---------- window typing (local to this module) ---------- */

type Gtag = (...args: unknown[]) => void;
type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
  push?: unknown;
  loaded?: boolean;
  version?: string;
};
type Ttq = {
  page: () => void;
  track: (name: string, params?: Record<string, unknown>, opts?: Record<string, unknown>) => void;
  load: (id: string, opts?: Record<string, unknown>) => void;
  methods?: string[];
  setAndDefer?: (target: unknown, method: string) => void;
  instance?: (id: string) => unknown;
  _i?: Record<string, unknown[] & { _u?: string }>;
  _t?: Record<string, number>;
  _o?: Record<string, unknown>;
  push?: (args: unknown[]) => void;
} & unknown[];

type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: Gtag;
  fbq?: Fbq;
  _fbq?: Fbq;
  ttq?: Ttq;
  TiktokAnalyticsObject?: string;
  __skAnalytics?: { inited: boolean; debug: boolean; log: Array<{ event: string; params: unknown; at: number }> };
};

function w(): AnalyticsWindow | null {
  return typeof window === "undefined" ? null : (window as AnalyticsWindow);
}

/* ---------- init (idempotent) ---------- */

export function initAnalytics(): void {
  const win = w();
  if (!win) return;
  if (!win.__skAnalytics) {
    win.__skAnalytics = {
      inited: false,
      debug: new URLSearchParams(win.location.search).has("sk_debug"),
      log: [],
    };
  }
  if (win.__skAnalytics.inited) return; // never initialise twice (SPA remounts, HMR)
  win.__skAnalytics.inited = true;
  if (!analyticsEnabled) return;

  // --- Google (gtag.js): GA4 + Google Ads base tag share one loader ---
  const googleId = ANALYTICS_IDS.ga4 || ANALYTICS_IDS.googleAds;
  if (googleId) {
    win.dataLayer = win.dataLayer || [];
    if (!win.gtag) {
      win.gtag = function gtag() {
        // eslint-disable-next-line prefer-rest-params
        win.dataLayer!.push(arguments);
      };
    }
    win.gtag("js", new Date());
    // We fire page_view ourselves on every route change (App Router), so
    // the automatic one is off — otherwise the hard load double-counts.
    if (ANALYTICS_IDS.ga4) win.gtag("config", ANALYTICS_IDS.ga4, { send_page_view: false });
    if (ANALYTICS_IDS.googleAds) win.gtag("config", ANALYTICS_IDS.googleAds, { send_page_view: false });
    loadScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(googleId)}`);
  }

  // --- Meta Pixel (standard loader, PageView fired by track, not here) ---
  if (ANALYTICS_IDS.meta && !win.fbq) {
    const n: Fbq = function fbq(...args: unknown[]) {
      if (n.callMethod) n.callMethod(...args);
      else n.queue!.push(args);
    };
    win.fbq = n;
    if (!win._fbq) win._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    loadScript("https://connect.facebook.net/en_US/fbevents.js");
    win.fbq("init", ANALYTICS_IDS.meta);
  }

  // --- TikTok Pixel (standard loader, page() fired by track, not here) ---
  if (ANALYTICS_IDS.tiktok && !win.ttq) {
    win.TiktokAnalyticsObject = "ttq";
    const ttq = [] as unknown as Ttq;
    win.ttq = ttq;
    ttq.methods = [
      "page", "track", "identify", "instances", "debug", "on", "off", "once", "ready",
      "alias", "group", "enableCookie", "disableCookie", "holdConsent", "revokeConsent", "grantConsent",
    ];
    ttq.setAndDefer = (target: unknown, method: string) => {
      (target as Record<string, unknown>)[method] = (...args: unknown[]) =>
        (target as { push: (a: unknown[]) => void }).push([method, ...args]);
    };
    for (const m of ttq.methods) ttq.setAndDefer(ttq, m);
    ttq.instance = (id: string) => {
      const e = (ttq._i?.[id] ?? []) as unknown[];
      for (const m of ttq.methods!) ttq.setAndDefer!(e, m);
      return e;
    };
    ttq.load = (id: string, opts?: Record<string, unknown>) => {
      const u = "https://analytics.tiktok.com/i18n/pixel/events.js";
      ttq._i = ttq._i || {};
      ttq._i[id] = [] as unknown[] & { _u?: string };
      ttq._i[id]._u = u;
      ttq._t = ttq._t || {};
      ttq._t[id] = +new Date();
      ttq._o = ttq._o || {};
      ttq._o[id] = opts || {};
      loadScript(`${u}?sdkid=${encodeURIComponent(id)}&lib=ttq`);
    };
    ttq.load(ANALYTICS_IDS.tiktok);
  }
}

function loadScript(src: string): void {
  const win = w();
  if (!win || win.document.querySelector(`script[src="${src}"]`)) return;
  const s = win.document.createElement("script");
  s.async = true;
  s.src = src;
  win.document.head.appendChild(s);
}

/* ---------- track: one call, every platform ---------- */

export function track<E extends EventName>(event: E, params: EventMap[E]): void {
  const win = w();
  if (!win) return;
  initAnalytics(); // safe no-op after the first call
  const p = params as Record<string, unknown>;
  const state = win.__skAnalytics!;
  state.log.push({ event, params: p, at: Date.now() });
  if (state.debug) console.info("[sk-analytics]", event, p);
  if (!analyticsEnabled) return;

  const { gtag, fbq, ttq } = win;
  const ga = Boolean(gtag && (ANALYTICS_IDS.ga4 || ANALYTICS_IDS.googleAds));

  switch (event) {
    case "page_view": {
      const sendTo = [ANALYTICS_IDS.ga4, ANALYTICS_IDS.googleAds].filter(Boolean);
      if (ga && sendTo.length) {
        gtag!("event", "page_view", {
          page_location: win.location.href,
          page_path: p.path,
          page_title: p.title ?? win.document.title,
          send_to: sendTo,
        });
      }
      if (fbq && ANALYTICS_IDS.meta) fbq("track", "PageView");
      if (ttq && ANALYTICS_IDS.tiktok) ttq.page();
      return;
    }
    case "service_view": {
      if (ga && ANALYTICS_IDS.ga4)
        gtag!("event", "view_item", { send_to: ANALYTICS_IDS.ga4, items: [{ item_id: p.service, item_category: "service" }], ...p });
      if (fbq && ANALYTICS_IDS.meta) fbq("track", "ViewContent", { content_name: p.service, content_category: "service" });
      if (ttq && ANALYTICS_IDS.tiktok) ttq.track("ViewContent", { content_name: p.service, content_category: "service" });
      return;
    }
    case "booking_complete":
    case "quote_complete": {
      // PRIMARY conversions → platform "Lead". event_id = ref so the Phase-3
      // server-side (CAPI / Ads) copy deduplicates against this browser hit.
      const ref = String(p.ref);
      if (ga && ANALYTICS_IDS.ga4) {
        gtag!("event", event, { send_to: ANALYTICS_IDS.ga4, ...p });
        gtag!("event", "generate_lead", { send_to: ANALYTICS_IDS.ga4, lead_source: event, transaction_id: ref, ...p });
      }
      if (fbq && ANALYTICS_IDS.meta)
        fbq("track", "Lead", { content_name: event, content_category: p.service ?? p.property_type, ref }, { eventID: ref });
      if (ttq && ANALYTICS_IDS.tiktok)
        ttq.track("SubmitForm", { content_name: event, content_id: ref }, { event_id: ref });
      return;
    }
    case "whatsapp_click":
    case "call_click": {
      if (ga && ANALYTICS_IDS.ga4) gtag!("event", event, { send_to: ANALYTICS_IDS.ga4, ...p });
      if (fbq && ANALYTICS_IDS.meta) fbq("track", "Contact", { content_name: event, ...p });
      if (ttq && ANALYTICS_IDS.tiktok) ttq.track("Contact", { content_name: event, ...p });
      return;
    }
    case "form_submit": {
      if (ga && ANALYTICS_IDS.ga4) gtag!("event", "form_submit", { send_to: ANALYTICS_IDS.ga4, ...p });
      if (fbq && ANALYTICS_IDS.meta)
        fbq("track", p.form === "careers" ? "SubmitApplication" : "Lead", { content_name: `form_${p.form}` });
      if (ttq && ANALYTICS_IDS.tiktok) ttq.track("SubmitForm", { content_name: `form_${p.form}` });
      return;
    }
    default: {
      // booking_start / booking_step / quote_start / branch_view — custom on every platform
      if (ga && ANALYTICS_IDS.ga4) gtag!("event", event, { send_to: ANALYTICS_IDS.ga4, ...p });
      if (fbq && ANALYTICS_IDS.meta) fbq("trackCustom", event, p);
      if (ttq && ANALYTICS_IDS.tiktok) ttq.track(event, p);
    }
  }
}

/** Read-only view of what fired (E2E + `?sk_debug` console). */
export function analyticsLog() {
  return w()?.__skAnalytics?.log ?? [];
}
