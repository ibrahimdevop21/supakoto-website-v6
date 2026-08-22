# Tracking spec — V6 (supakoto.com)

*Phase 18 (2026-08-19). Owner: Ibrahim. This is the contract Phase 3
(bdm-flow hand-off + server-side conversions) builds against. Change it here
first, then the code.*

## 1. Principles

- **Direct pixels, no tag manager.** GA4, Meta Pixel, TikTok Pixel and the
  Google Ads base tag are loaded by `lib/analytics.ts` after hydration. IDs
  come from `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_META_PIXEL_ID`,
  `NEXT_PUBLIC_TIKTOK_PIXEL_ID`, `NEXT_PUBLIC_GOOGLE_ADS_ID` (values in
  `.env.example`; set the same in Vercel for Production + Preview).
- **One call site.** Components call `track(event, params)` from
  `@/lib/analytics` and nothing else. `scripts/check-analytics-calls.mjs`
  fails `pnpm build` on any `gtag( / fbq( / ttq. / dataLayer` outside that
  file.
- **Every tel: and wa.me link fires.** No interactive element ships without
  the JS that tracks it (the V2 branch-card failure).
- **Google Ads = base tag only** in Phase 1 (remarketing lists build; no
  conversion actions configured). Conversions for Ads arrive in Phase 3
  server-side.
- **Debug:** append `?sk_debug` to any URL → every `track()` is logged to the
  console; `window.__skAnalytics.log` holds the in-page event log (used by
  `scripts/e2e-analytics.mjs`).

## 2. Event taxonomy

| Event | Trigger | Params | GA4 | Meta | TikTok | Ads |
|---|---|---|---|---|---|---|
| `page_view` | first paint + every App Router pathname change (`<Analytics />`) | `path`, `title` | `page_view` (auto pageview disabled) | `PageView` | `page()` | `page_view` (send_to AW) |
| `service_view` | service detail page mount (`<ServiceViewTracker />`) | `service` (slug) | `view_item` items[{item_id}] | `ViewContent` {content_name, content_category:"service"} | `ViewContent` | — |
| `booking_start` | wizard: a **vehicle** service picked on step 1 (once per flow per visit) | `region`, `service` | custom | `trackCustom` | custom | — |
| `quote_start` | wizard: a **building** service picked on step 1 (`source:"wizard"`); BuildingQuoteForm mounted (`source:"page"`) | `region`, `service`, `source` | custom | `trackCustom` | custom | — |
| `enquiry_start` | wizard: a **marine / interior** service picked on step 1 | `region`, `service` | custom | `trackCustom` | custom | — |
| `booking_step` | every wizard step shown | `step` (1-based), `step_name` (service/region/branch/car/date/time/property/location/measurements/problem/details/contact/confirm), `region`, `flow?` ∈ vehicle · building · enquiry (absent on step 1) | custom | `trackCustom` | custom | — |
| **`booking_complete`** | vehicle confirm, BEFORE `window.open(wa.me)` | `ref`, `region`, `branch`, `service` | `booking_complete` + `generate_lead` (transaction_id=ref) | **`Lead`** {content_name:"booking_complete", content_category:service, ref} **eventID=ref** | `SubmitForm` {content_id:ref} event_id=ref | — |
| **`quote_complete`** | building confirm (wizard) or quote page submit, BEFORE `window.open(wa.me)` | `ref`, `region`, `property_type`, `service`, `source` ∈ wizard · page | `quote_complete` + `generate_lead` | **`Lead`** eventID=ref | `SubmitForm` event_id=ref | — |
| **`enquiry_complete`** | marine / interior confirm, BEFORE `window.open(wa.me)` | `ref`, `region`, `service` | `enquiry_complete` + `generate_lead` | **`Lead`** eventID=ref | `SubmitForm` event_id=ref | — |
| `whatsapp_click` | any wa.me link | `source` ∈ booking · quote · enquiry · fab · footer · branch_card · branch_map · service_page · contact; `region?`, `branch?`, `ref?` | `whatsapp_click` | `Contact` | `Contact` | — |
| `call_click` | any tel: link | `branch` (branch id or `<region>-regional`), `source` | `call_click` | `Contact` | `Contact` | — |
| `branch_view` | branch card / map pin interaction | `branch`, `action` ∈ call · whatsapp · directions · map_popup | custom | `trackCustom` | custom | — |
| `form_submit` | stub forms submit | `form` ∈ contact · careers · franchise · business · warranty_claim | `form_submit` | — | — | — |

**`form_submit` is GA4-only while the forms are stubs** (Phase 21, audit
defect #1): submissions are discarded locally, so no platform may receive a
conversion for them. **Requirement:** when a form is wired to a real
destination, its submit gets an SK-ref and fires with a dedup key
(`eventID` / `event_id` = ref) exactly like the three completions — only
then do Meta (`Lead`; careers `SubmitApplication`) and TikTok
(`SubmitForm`) come back.

"custom" = same event name on every platform (`gtag('event', name)`,
`fbq('trackCustom', name)`, `ttq.track(name)`).

Primary conversions are **`booking_complete`**, **`quote_complete`** and
**`enquiry_complete`** (Phase 19). Funnel tops are flow-specific — there is
deliberately no shared "wizard opened" event, so drop-off reads per flow
(Ibrahim, 2026-08-21). All carry the ref so the browser-side `Lead` and the Phase-3 server-side
copy deduplicate (`event_id` / `eventID` = ref).

### Where each element is wired

| Element | File | Events |
|---|---|---|
| WhatsApp FAB | `components/chrome/WhatsAppFab.tsx` | whatsapp_click(fab) |
| Footer tel / wa.me | `components/chrome/Footer.tsx` | call_click(regional, footer), whatsapp_click(footer) |
| /contact info cards | `components/forms/ContactForm.tsx` (`ContactInfo`) | call_click(regional, contact), whatsapp_click(contact) |
| Branch cards | `components/sections/BranchGrid.tsx` | call_click + branch_view(call), whatsapp_click(branch_card) + branch_view(whatsapp), branch_view(directions) |
| Branch map pins / popups | `components/sections/BranchMap.tsx` (delegated) | branch_view(map_popup), call_click / whatsapp_click(branch_map), branch_view(directions) |
| Pending-service WhatsApp CTA | `components/sections/services/PendingServiceCta.tsx` | whatsapp_click(service_page) |
| Service pages | `components/providers/ServiceViewTracker.tsx` | service_view |
| Booking wizard (all seven services) | `components/forms/BookingWizard.tsx` | booking_start / quote_start / enquiry_start (on service pick), booking_step, booking_complete / quote_complete / enquiry_complete, whatsapp_click(booking · quote · enquiry) |
| Building quote page | `components/forms/BuildingQuoteForm.tsx` (fieldsets shared with the wizard: `components/forms/building/`) | quote_start(page), quote_complete(page), whatsapp_click(quote) |
| Site forms ×5 (real destination since Phase 23: POST `/api/forms` → Resend → info@supakoto.com, SK-ref in subject) | `components/forms/FormShell.tsx` (`formId`) | form_submit (+ref) — platform mapping pending Ibrahim (doc 23) |

## 3. Ref ID — `SK-XXXXXX`

- Generated client-side (`lib/ref.ts`) at `booking_complete` / `quote_complete` / `enquiry_complete`.
- Format: `SK-` + 6 characters from `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`
  (uppercase, no O/0/I/1). Regex: `^SK-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$`.
  ~1.07 × 10⁹ combinations; collisions are handled by the receiver
  (Phase 3: unique index + retry / suffix).
- Embedded in the pre-filled WhatsApp message on its own line directly under
  the title line, label from messages (`booking.waRef`, `buildingQuote.wa.ref`):

  ```
  حجز جديد من الموقع:
  رقم الطلب: SK-A7F3K2
  المنطقة: مصر
  …
  ```
  ```
  New booking from the website:
  Request ref: SK-A7F3K2
  Region: Egypt
  …
  ```
- Shown to the user on the success screen and carried as `ref` on
  `booking_complete`, `quote_complete` and the booking/quote `whatsapp_click`.

## 4. Stored payload (client-side intent log)

`localStorage["sk-booking-intents"]`, `localStorage["sk-building-quote-intents"]`, `localStorage["sk-enquiry-intents"]` and `localStorage["sk-form-intents"]` (Phase 23; writer: `lib/intent.ts`)
— arrays, last 20 entries each:

```ts
type IntentEntry = {
  ref: string;                 // "SK-A7F3K2"
  kind: "booking" | "quote" | "enquiry";
  at: string;                  // ISO-8601, client clock
  region: "egypt" | "uae";
  branch: string | null;       // content/branches.ts id (booking) — null for quotes
  service: string;             // content/services.ts id (quotes: "building-heat-isolation")
  locale?: "ar" | "en";
  attribution: Attribution | null;
  draft: BookingDraft | QuoteDraft;   // the raw form state (name/phone included)
};

type Attribution = {           // cookie "sk-attribution" (30 days), captured on first landing
  landed_at: string;           // ISO-8601
  landing_page: string;        // pathname + search
  referrer: string;
  utm_source?: string; utm_medium?: string; utm_campaign?: string;
  utm_term?: string; utm_content?: string; utm_id?: string;
  fbclid?: string; gclid?: string; gbraid?: string; wbraid?: string; ttclid?: string;
};
```

Attribution is **first-touch with a 30-day window** (Phase 21, audit fix
#2): stored in a first-party cookie (`Max-Age` 30 days, `Path=/`,
`SameSite=Lax`, `Secure` on https). A later landing NEVER overwrites — not
even with new UTMs or click-ids; the cookie expiring starts the next first
touch. (Supersedes the Phase 18 per-session rule.)

## 5. Phase 3 contract (not built in Phase 1)

1. At `booking_complete` / `quote_complete`, POST the `IntentEntry` to
   bdm-flow (endpoint TBD) — include `ref`, `attribution`, and the browser
   identifiers needed for server-side matching: Meta `_fbp` / `_fbc` cookies,
   `fbclid`, `gclid`, user agent, client IP (server-side), event time.
2. When the conversation converts in WhatsApp, the agent records the ref in
   bdm-flow; bdm-flow fires:
   - **Meta Conversions API** `Lead` (or a downstream `Purchase`/custom) with
     `event_id = ref` → deduplicates against the browser `Lead`.
   - **Google Ads** offline/enhanced conversion keyed on `gclid` (or
     `transaction_id = ref` via GA4 import).
3. Region split: `region` is on every conversion event; Meta/Google ad accounts
   per region filter on it (or separate pixels/accounts later).

## 6. Open items

- **Consent banner / Consent Mode v2 — not in this phase.** Egypt (PDPL,
  Law 151/2020) and the UAE (PDPL, Federal Decree-Law 45/2021) both require a
  lawful basis and transparency for personal-data processing, but neither has
  an enforced cookie-banner regime comparable to the EU ePrivacy rules today;
  EU/UK visitors are a small share. Decision pending Ibrahim; the
  `lib/analytics.ts` init is the single place a consent gate would go.
- Google Ads conversion actions (whatsapp_lead / call_lead / form_lead)
  intentionally not configured until campaigns resume.
- Per-branch public ratings for the testimonials aggregate
  (`content/branches.ts → reviews`).
