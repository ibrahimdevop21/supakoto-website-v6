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
3. On `bounced` / `delivery_delayed` (> 1 h) / `complained`: alert. The alert
   channel must be **independent of supakoto.org mail** or it fails with the
   same root cause. Candidates: WhatsApp to the ops line via a provider API,
   a Telegram/Slack bot, or SMS. Decision for Ibrahim.
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

## Open decision

Alert channel (must not depend on supakoto.org mail): WhatsApp API / Telegram
/ Slack / SMS — Ibrahim picks.
