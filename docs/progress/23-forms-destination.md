# Phase 23 — the five forms get a real destination

*2026-08-22. Ibrahim approved recommendation (b) from the forms report with
five decisions. Branch `feat/phase-23-forms-destination` off main.*

## LOCKED DECISIONS (Ibrahim, 2026-08-22)
- LD-1 All five forms → **email via Resend**, one API route
  (`/api/forms`), all to **info@supakoto.com** with per-form subject tags
  (recipient + from overridable via env for later per-team inboxes).
- LD-2 `RESEND_API_KEY` lives in Vercel env (NOT in the repo / .env.local);
  domain verification records added by Ibrahim. Without the key the route
  answers 503 `email_unconfigured` and the form shows the error state —
  it never fakes success.
- LD-3 **Platform conversions re-arm ONLY after Ibrahim approves the
  per-form event mapping** (proposed at the end of this doc). Careers and
  warranty claims never fire Meta Lead / TikTok SubmitForm. Until
  approval, `form_submit` stays GA4-only (now with `ref`).
- LD-4 Warranty claim form gains **name + phone** (it had neither — a
  claim couldn't be answered).
- LD-5 SK-ref in the subject, reply-to = visitor email when given,
  honeypot field + per-IP rate limit (in-memory, per-instance — a basic
  gate, not a fortress), file caps (≤2 files… careers 1 CV, claims ≤4
  photos; ≤5MB each, type-checked).

## SHAPE
- `app/api/forms/route.ts` — multipart POST: validates form id, SK-ref,
  honeypot, rate limit, field/file caps; builds a plain-text email
  (subject `[Tag] SK-XXXXXX — <name|plate>`); sends via Resend REST
  (plain fetch — no new dependency); attachments base64.
- `components/forms/FormShell.tsx` replaces StubForm (deleted): generates
  the ref client-side, POSTs FormData, success screen shows the ref,
  error state keeps the visitor's input; honeypot input lives here.
  Intent log gains kind `"form"` (`sk-form-intents`).
- ClaimForm + messages: name/phone fields; stub copy removed everywhere.
- e2e-analytics forms section reworked: intercepts `/api/forms`, asserts
  the POST carries a valid ref + fields, success shows the ref, and
  Meta/TikTok still receive NOTHING (until LD-3 approval).

## PROPOSED EVENT MAPPING (pending Ibrahim — NOT wired)
| Form | GA4 | Meta | TikTok |
|---|---|---|---|
| contact | form_submit (+ref) | `Contact` eventID=ref | `Contact` event_id=ref |
| business | form_submit + generate_lead (transaction_id=ref) | **`Lead`** eventID=ref | `SubmitForm` event_id=ref |
| franchise | form_submit + generate_lead | **`Lead`** eventID=ref | `SubmitForm` event_id=ref |
| careers | form_submit only | — (option: `SubmitApplication`, distinct + non-lead) | — |
| warranty_claim | form_submit only | — | — |

Rationale: business + franchise are acquisition leads → full Lead
treatment like the three wizard completions. Contact is mixed intent
(includes complaints) → `Contact`, which platforms don't fold into Lead
optimization. Careers + claims are not acquisition and stay out of ad
platforms entirely per Ibrahim's instruction.

## SHIPPED — 2026-08-22 (`ec9d5ca`, LOCAL — not merged)
- `/api/forms` + FormShell (StubForm deleted), claim form name+phone,
  intent kind `form`, stub copy removed (booking.stub restored — wizard
  copy, not a form stub), env names in .env.example.
- Verified: e2e-analytics **163/163** (forms POST with ref, honeypot,
  success-ref, Meta/TikTok still silent), route failure modes
  curl-verified (503 / honeypot-accept / 400 / 400), build 7 guards,
  lint 0/0, typecheck, parity. GA4 SPA-nav beacon assert hardened to a
  6s poll (flush-timing flake, queue check already proved issuance).
- **Deploy blocked on:** (1) RESEND_API_KEY + FORMS_TO_EMAIL /
  FORMS_FROM_EMAIL set in Vercel env (from must be on the verified
  domain), (2) Ibrahim's word on the event mapping above (LD-3), then
  merge → live smoke: submit each form once, confirm five tagged emails
  with refs arrive at info@supakoto.com.

## SHIPPED — 2026-08-25 — FORM DESTINATIONS master prompt (LOCAL, not merged)
Root cause of the "Resend failure" was `supakoto.org` expiring on Aug 3 —
DNS gone, mail bounced silently ~2 weeks, nine leads lost. Domain reactivated,
Resend verified (DKIM/MX/SPF), env set on Production + Preview:
`RESEND_API_KEY`, `FORMS_TO_EMAIL=info@supakoto.org`,
`FORMS_FROM_EMAIL=noreply@send.supakoto.org` (SPF subdomain; root runs cPanel).

**Everything the site collects now goes to email — nine surfaces, one inbox:**
5 standalone forms (contact, careers, franchise, business, warranty claim),
3 wizard flows (vehicle → 🚗 [CAR], building → 🏢 [BUILDING], marine/interior
→ 🛥️ [MARINE]), and the standalone building quote page (🏢 [BUILDING],
identical body). Eighth tag 🏭 [BUSINESS] added for fleet/dealer enquiries.
Subject `<emoji> [TAG] — <service EN> — <name> — <SK-ref>`; body = ref
first, every field (English labels, ids resolved to names), then the
`sk-attribution` fields (utm_*, fbclid, gclid, …) appended client-side.
Reply-To = visitor email where collected; claim form gained an optional
email field. Wizard flows collect no email by decision (conversion cost).

Locked behaviour: WhatsApp is an **opt-in button** on the success screen with
a ref-only message (`مرحبا، أرسلت طلب رقم SK-… من الموقع`); on send failure
the fallback button carries the FULL request. `booking_complete` /
`quote_complete` / `enquiry_complete` fire **only after a confirmed send**
(same payload, `eventID = ref`); `whatsapp_click` is now a true click count.
One SK-ref per session, reused across retries. 15 s timeout; success only on
`{ok:true,id}`. Route: same-site Origin check (403), `.org` fallbacks +
`scripts/check-email-fallbacks.mjs` guard (build fails on a `.com` sender/
recipient or a fallback ≠ `.env.example`), Resend 2xx-without-id = failure.

Files: `app/api/forms/route.ts`, `lib/forms/{spec,submit,whatsapp}.ts`,
`FormShell`, `BookingWizard`, `BuildingQuoteForm`, `ClaimForm`, messages
(approved white-Arabic copy; `booking.stub`/`reopenWhatsApp` removed),
`scripts/e2e-analytics.mjs` (+ failure-path test: 502 → no Lead, alert,
full-body fallback, same ref on retry → Lead).

Verified: typecheck, lint 0/0, 8 guards, build, e2e-analytics **177/177**,
smoke 196/196, route curl (cross-site 403 / no-origin 403 / no-key 503 /
bad form 400). Tracking layer untouched (`whatsapp_click` from standalone
forms uses the existing `contact` source — adding a `form` source is a
tracking-branch item). Event mapping (LD-3) still unwired.

Next: `/code-review` fresh-context → Ibrahim pushes → **Step 4**: submit all
nine surfaces on the Preview URL and confirm nine emails LAND at
info@supakoto.org (not API 200 — inbox). Then production.
Follow-up scoped, not built: `docs/progress/DELIVERY-WEBHOOK.md`.
