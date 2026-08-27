# Follow-up: Resend delivery webhook → alert on bounce

Status: **SCOPED, NOT BUILT** (Ibrahim, 2026-08-25: "Add to the plan, do NOT build now").

## Why this exists

`/api/forms` treats Resend's `202` + `id` as success. That means **queued**, not
delivered. In August 2026 `supakoto.org` expired (grace period, expiry Aug 3),
DNS stopped resolving, and every submission bounced with "recipient's mail
server not found" — for roughly two weeks, while every dashboard looked
healthy. Nine leads were lost. Nothing in the send path can detect that
class of failure; only the delivery events can.

## What it does

1. Resend → `POST /api/resend-webhook` with events `email.delivered`,
   `email.bounced`, `email.delivery_delayed`, `email.complained`.
2. Verify the Svix signature (`RESEND_WEBHOOK_SECRET`) — reject anything unsigned.
3. On `bounced` / `delivery_delayed` (> 1 h) / `complained`: alert by
   **WhatsApp to the Egypt line 201103402446** (Ibrahim, 2026-08-25) via a
   WhatsApp Business / provider API — independent of supakoto.org mail, so
   it cannot fail with the same root cause. Message: tag, SK-ref, event,
   bounce reason. (Number must be read from `content/regions.ts`, never
   hard-coded — the phone-literal guard.)
4. Log every event with the SK-ref (Resend supports a `tags` array on send —
   add `tags: [{ name: "ref", value }]` in the route so the webhook can name
   the lead that bounced).
5. Optional: a daily "sent vs delivered" count via the Resend API so silence
   is also visible — zero sends on a weekday is itself a signal.

## Scope

- New route `app/api/resend-webhook/route.ts` (~80 lines), env
  `RESEND_WEBHOOK_SECRET`, `ALERT_*` for the chosen channel.
- Small change in `app/api/forms/route.ts`: attach the ref as a Resend tag.
- No UI. No tracking-layer change.
- Guard: `check-email-fallbacks.mjs` already prevents a `.com` regression;
  add the webhook secret to `.env.example`.

## Effort

~3 h including the alert channel wiring and a forced-bounce test
(send to `bounced@resend.dev`, Resend's test address).

## Decided

Alert channel: WhatsApp, Egypt line (`regions.egypt.whatsapp`). Remaining
choice at build time: which WhatsApp API provider (Meta Cloud API needs a
Business account; a relay like Twilio is faster to stand up).
