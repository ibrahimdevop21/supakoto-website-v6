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

## SHIPPED
(fill at end)
