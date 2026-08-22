# TRACKING AUDIT — V6 (2026-08-22)

*Read-only audit of the deployed production site
(https://supakoto-website-v6.vercel.app, main `27866bf`). Post-Phase-19/20:
every finding re-verified against the CURRENT three-flow wizard and the
rebuilt gallery — nothing carried over from pre-Phase-19 verification.
No code changed; this document is the only artifact.*

**Method.** (a) Code inspection of `lib/analytics.ts` / `lib/ref.ts` /
`lib/intent.ts` / `lib/attribution.ts` and every `track()` call site.
(b) Guard negative tests (two injected violations). (c) The full
`e2e-analytics.mjs` suite run against production — **130/130** (beacons
captured at the network layer, then swallowed: nothing polluted the
platforms). (d) A live walk of all three flows on production with a **real
Chrome UA and no interception** — beacons actually left the browser and
will appear in Events Manager (refs listed in §8).

---

## 1. Verdict

**Trustworthy, with three caveats.** The direct-pixel install is real: all
four IDs are compiled into the deployed bundle, the SDKs load after
hydration, and every event in the spec — including every unverified
Phase 19 addition — was observed as an actual outbound network request on
production, with the SK-ref riding as `eventID` on the Meta `Lead` exactly
as the Phase 3 dedup contract requires. The V2 failure mode (correct-looking
code, zero events sent) is demonstrably not present, and the build guard
that prevents its return works in both directions. The caveats: the five
stub forms send Meta a `Lead`/`SubmitApplication` for submissions that are
discarded locally (defect #1); the rebuilt gallery tracks nothing at all
(decide if that's intended); and GA4's enhanced measurement is on, which
can shadow our hand-fired `form_submit` (defect #3).

## 2. Installation

| Platform | ID | In prod bundle? | Loaded by | Mechanism | Render-blocking? |
|---|---|---|---|---|---|
| GA4 | `G-ENPYD2K4R3` | ✅ `layout-53be067b.js` | `lib/analytics.ts` `initAnalytics()` | gtag.js injected async post-hydration; `send_page_view:false` (we fire our own) | No — 0 pixel scripts in SSR HTML (curl-verified) |
| Meta Pixel | `1306471927697780` | ✅ same chunk | same | standard fbevents.js loader, `fbq('init', id)` only | No |
| TikTok | `D32GSIRC77U649U91T50` | ✅ same chunk | same | standard events.js loader | No |
| Google Ads | `AW-17767525580` | ✅ same chunk | same | shares the gtag.js loader; base tag only | No |

- **Env, not hardcoded:** all four read from `NEXT_PUBLIC_*` in
  `lib/analytics.ts:108-113`; a repo-wide grep finds no ID literal outside
  `.env.example`/`.env.local`. The Vercel production env vars ARE set
  (IDs present in the deployed chunk) — the CHECKPOINT note calling them
  pending is stale.
- **Single call site:** only `lib/analytics.ts` touches gtag/fbq/ttq.
  `check-analytics-calls.mjs` runs in `pnpm build` and was negative-tested
  live during this audit: an injected `window.fbq(...)` in a component →
  exit 1; an injected untracked `wa.me` link → exit 1; clean tree → exit 0.
- **No duplicate init:** `__skAnalytics.inited` guard + script-src dedupe;
  `<Analytics />` mounts once in `app/[locale]/layout.tsx`. Observed live:
  exactly one loader request per SDK, one PageView per page.
- **SPA pageviews:** verified live — a client-side navigation fired
  `page_view` beacons to GA4, Ads, Meta (`PageView`) and TikTok
  (`Pageview`). Not hard-load-only.

## 3. Event map — as built vs `TRACKING-SPEC.md`

Code and spec agree on names, triggers, payloads and platform mapping, with
two documentation divergences noted below the table. VERIFIED column:
**prod-e2e** = network-captured in the 130-check production run;
**live** = real outbound beacon observed with a normal Chrome UA.

| Event | Trigger / from | Payload | GA4 | Meta | TikTok | Verified |
|---|---|---|---|---|---|---|
| `page_view` | first paint + every route change (`Analytics.tsx`) | path, title | `page_view` (+Ads) | `PageView` | `page()` | ✅ live, incl. SPA nav |
| `service_view` | service page mount | service | `view_item` | `ViewContent` | `ViewContent` | ✅ prod-e2e |
| `booking_start` | **vehicle** service picked, step 1, once | region, service | custom | `trackCustom` | custom | ✅ live (`booking_start` beacon on wire) |
| `quote_start` | **building** picked (wizard) / quote-page mount (page) | region, service, source | custom | `trackCustom` | custom | ✅ live, both sources |
| `enquiry_start` | **marine/interior** picked | region, service | custom | `trackCustom` | custom | ✅ live |
| `booking_step` | every wizard step | step, step_name, region, flow | custom | `trackCustom` | custom | ✅ live — 8 vehicle steps, 8 building, 5 enquiry, in order, correct `flow` |
| `booking_complete` | vehicle confirm, before wa.me | ref, region, branch, service | event + `generate_lead` (transaction_id=ref) | **`Lead` eventID=ref** | `SubmitForm` event_id=ref (wire: TikTok merges to `Lead`) | ✅ live (`Lead[SK-P56X57]` on facebook.com/tr with `eid=`) |
| `quote_complete` | building confirm / quote page | + property_type, source | same | **`Lead` eventID=ref** | same | ✅ live (`Lead[SK-RKDZLR]`) |
| `enquiry_complete` | marine/interior confirm | ref, region, service | same | **`Lead` eventID=ref** | same | ✅ live (`Lead[SK-DZNTZ9]`) |
| `whatsapp_click` | every wa.me link (9 sources) | source, region?, branch?, ref? | event | `Contact` | `Contact` | ✅ live (completion) + prod-e2e (all 9 sources) |
| `call_click` | every tel: link | branch, source | event | `Contact` | `Contact` | ✅ prod-e2e (footer, contact, branch_card, branch_map) |
| `branch_view` | card/map interactions | branch, action | custom | `trackCustom` | custom | ✅ prod-e2e (call/whatsapp/directions/map_popup) |
| `form_submit` | 5 stub forms | form | `form_submit` | `Lead` (careers→`SubmitApplication`) | `SubmitForm` | ✅ prod-e2e — **but see defect #1** |

There is deliberately no shared funnel-top event; the three `*_start`
events fire on service selection at step 1, exactly where the flows
diverge — confirmed live: no start event fires before a service is picked,
and each pick fires exactly one, exactly once.

**Spec divergences (docs, not behavior):**
1. `TRACKING-SPEC.md` §4's `IntentEntry.kind` type reads
   `"booking" | "quote"` — code (correctly) also writes `"enquiry"`, and
   the same section already lists the `sk-enquiry-intents` key. Stale type.
2. Spec §3 says ref is generated at "booking_complete / quote_complete" —
   enquiry_complete also generates one (§2 has it right). Stale sentence.

## 4. Coverage — the V2 branch-card failure mode

Every interactive element that reaches WhatsApp or the phone, enumerated:

| Element | File | Events | Verified |
|---|---|---|---|
| WhatsApp FAB | `chrome/WhatsAppFab.tsx` | whatsapp_click(fab)+region | ✅ prod-e2e |
| Footer tel / wa.me | `chrome/Footer.tsx` | call_click(footer, regional), whatsapp_click(footer) | ✅ prod-e2e |
| /contact info cards | `forms/ContactForm.tsx` | call_click(contact), whatsapp_click(contact) | ✅ prod-e2e |
| Branch cards ×6 | `sections/BranchGrid.tsx` | call_click + whatsapp_click + branch_view(call/whatsapp/directions) | ✅ prod-e2e — **the exact V2 gap, now tracked** |
| Map pins / popups | `sections/BranchMap.tsx` | branch_view(map_popup) + call/whatsapp/directions | ✅ prod-e2e |
| Pending-service CTA (marine/surface) | `services/PendingServiceCta.tsx` | whatsapp_click(service_page) | ✅ prod-e2e |
| Wizard completion + reopen links (3 flows) | `forms/BookingWizard.tsx` | whatsapp_click(booking/quote/enquiry) with ref | ✅ live |
| Quote page submit + reopen | `forms/BuildingQuoteForm.tsx` | whatsapp_click(quote) with ref | ✅ prod-e2e |
| Forms: contact, careers, franchise, business, warranty claim | `forms/StubForm.tsx` | form_submit | ✅ prod-e2e (see defect #1) |
| **Gallery (rebuilt Phase 20)** | `sections/GalleryViewer.tsx` | **NONE** | ⚠️ confirmed live: arrows/filters/fullscreen fire zero events |

- SSR-without-JS class: none found. Every wa.me/tel element lives in a
  client component that calls `track()`, and the guard makes an untracked
  link a build failure (proven above). The grep set of files containing
  wa.me/tel (8 files) equals the tracked set exactly.
- The gallery is the one interactive surface with no events. The spec
  never defined gallery events, so code matches spec — but after a rebuild
  whose whole point was engagement, there is no way to see whether anyone
  uses the viewer. Decision needed, not silently fine.

## 5. Ref ID chain — pass/fail per link

| Link | Status | Evidence |
|---|---|---|
| Generated at all 3 completion points | ✅ | live: SK-P56X57 (booking), SK-RKDZLR (quote), SK-DZNTZ9 (enquiry) |
| Format, no ambiguous chars | ✅ | `lib/ref.ts`: `SK-` + 6 from 32-char alphabet excluding O/0/I/1; crypto-random; regex-checked in e2e |
| In the WhatsApp body, labelled | ✅ | live: line 2 = `Request ref: SK-P56X57` / `رقم الطلب: …`, under the flow-marker first line, in all three flows |
| `eventID` on the Meta event | ✅ | live wire capture: `facebook.com/tr` `ev=Lead&…eid=SK-P56X57` (and for both other flows). Phase 3 CAPI dedup key is in place and consistent |
| TikTok `event_id` | ✅ | live: `"event_id":"SK-…"` in the pixel POST body |
| GA4 `transaction_id` on `generate_lead` | ✅ | prod-e2e: `generate_lead&transaction_id=SK-…` |
| Stored client-side | ✅ | live localStorage dump: `ref, kind, at (ISO), region, branch (null for quote/enquiry), service, locale, attribution, draft` |
| Attribution: UTM/referrer/fbclid/gclid | ✅ | live: landing with `utm_source&utm_campaign&fbclid&gclid` → all present in `sk-attribution` and attached to the intent entry |
| Stored shape matches spec §4 | ✅* | field-for-field match; *the spec's TYPE is stale on `kind: "enquiry"` (divergence #1 above) |

One design limitation, matching spec but worth knowing: attribution lives
in **sessionStorage** (first-touch per session). A visitor who clicks an ad
today and books tomorrow in a new session books with `referrer:""` and no
click-id — Phase 3 loses that join. localStorage with an expiry window
would keep it.

## 6. Meta readiness (next phase)

- **Standard events sent:** `PageView` (every route change, verified —
  not hard-loads only), `ViewContent` (service pages), `Contact` (every
  call/WhatsApp click), `Lead` (all three completions, eventID=ref),
  `SubmitApplication` (careers stub), `trackCustom` for steps/starts.
  Nothing in the set is malformed or rejectable; custom properties on
  standard events are within Meta's rules.
- **Lead for all three completions — is it right?** Yes, keep it.
  One optimizable event with volume beats splitting into
  `Schedule`/`Lead`/`Contact` at today's traffic, and the Phase 3 CAPI
  dedup contract is written against `Lead` + eventID. Revisit only if the
  vehicle flow alone gets enough volume to optimize on `Schedule`.
- **Advanced Matching: not configured.** `fbq('init', id)` carries no user
  data and there is no manual-AM code. Note the asymmetry: TikTok's
  automatic advanced matching IS active (observed `EnrichAM` beacons).
  Data already collected that could be hashed for Meta AM: **phone + first
  name on every completion** (all three flows), email on the contact stub.
  Phone is the high-value matcher in EG/UAE. Whether "Automatic Advanced
  Matching" is toggled on in Events Manager cannot be read from the site —
  check the pixel settings.
- **CAPI: not configured anywhere.** Confirmed — no server-side send, no
  graph.facebook.com calls, no `_fbp`/`_fbc` forwarding. Expected; the
  browser side has everything CAPI dedup needs (eventID=ref).
- **Route changes:** pixel fires `PageView` on every client-side
  navigation (verified live). ✅
- **Egypt vs UAE:** one pixel serves both; every conversion carries
  `region` ("egypt"/"uae"). Two ad accounts can share this pixel today by
  building region-filtered custom conversions (`region` parameter) —
  works, but custom conversions cap out and can't power value rules per
  account cleanly. True separation = second pixel ID per region, which
  needs: two env vars, region-aware `init` (region cookie exists), and a
  region column in the Phase 3 CAPI sender. ~Half-day of work when needed;
  nothing in the current design blocks it.
- **Bot filter note:** with a HeadlessChrome UA, Meta's SDK loads but
  silently refuses to beacon. All live verification here used a normal
  Chrome UA; the e2e suite knows this and falls back to queue inspection.

## 7. Defects, ranked by impact

1. **Stub forms fire real Meta `Lead`s for submissions that go nowhere.**
   `StubForm.tsx` fakes the submit locally (data is discarded, the UI even
   says "this form is a stub") yet fires `form_submit` → Meta `Lead`
   (careers → `SubmitApplication`), GA4 `form_submit`, TikTok `SubmitForm`.
   Five forms: contact, careers, franchise, business, warranty claim.
   These Leads have no ref, no dedup key, and no downstream record — once
   Meta campaigns optimize on Lead, every stub submission is a fake
   conversion polluting the audience model. Fix direction (not applied):
   either downgrade stub submissions to a custom event until the backend
   exists, or exclude no-ref Leads in campaign config.
2. **The gallery tracks nothing.** Zero events on filter clicks, image
   navigation, fullscreen, or video play — confirmed live post-rebuild.
   Matches spec (which defines no gallery events), so this is a decision
   gap, not a regression: you cannot currently measure whether the Phase 20
   rebuild changed engagement at all.
3. **GA4 enhanced measurement is on** (a `scroll` event was observed
   arriving automatically). Its automatic form-interaction events can
   shadow/duplicate our hand-fired `form_submit` in GA4 reports, and
   auto-scroll adds noise. Property-side setting, not code. Decide:
   disable form interactions (keep our taxonomy authoritative) or accept.
4. **Attribution is session-scoped** (see §5) — cross-session ad clicks
   lose their join to the ref. Spec-compliant; flag for Phase 3.
5. **Spec drift, docs only:** `IntentEntry.kind` missing `"enquiry"`;
   ref-generation sentence missing enquiry_complete (§3 above).
6. **PII in localStorage:** the intent draft stores raw name + phone
   client-side (last 20 entries). Spec'd and low-risk (user's own device),
   but it is personal data at rest with no expiry — note for the PDPL
   consent decision already parked in the spec's open items.

## 8. Test refs generated during this audit (discount in Events Manager)

All submitted with name/car "AUDIT — ignore", phone 0100000000, region
Egypt, EN locale, on 2026-08-22 between ~08:52 and ~09:00 UTC:

| Ref | Flow | Meta Lead sent? |
|---|---|---|
| SK-P56X57 | vehicle booking (ppf, branch Fifth Settlement) | ✅ live |
| SK-RKDZLR | building quote via wizard | ✅ live |
| SK-DZNTZ9 | marine enquiry via wizard | ✅ live |
| SK-WYEC4M | building quote via wizard (first walk) | ✅ live |
| SK-QN5QCB | marine enquiry via wizard (first walk) | ✅ live |
| *(unrecorded)* | vehicle booking, first walk — the ref line was lost to output truncation; its Lead hit Events Manager ~08:56 UTC with `content_name: booking_complete`, service ppf | ✅ live |

The 130-check e2e suite intercepted its beacons at the network layer —
**none of its ~260 events reached any platform**; only the six refs above
(plus their PageView/step/Contact companions from the two live walks) will
appear in Events Manager / GA4 / TikTok.

---
*Audit artifacts: `scratchpad/audit-walk-2.json` (full beacon capture),
`audit-e2e-prod.log` (130/130). Nothing committed, nothing changed —
this file is the only addition, left uncommitted for review.*
