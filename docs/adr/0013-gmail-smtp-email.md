# 0013. Send transactional email through Gmail SMTP with nodemailer

- Status: accepted
- Date: 2026-10-25

## Context

v1 (`inversorhouse-web`) emailed every opportunity submitted through `/submit-opportunity` as a
plain-text block with emojis inside a `<pre>`, so it could be copied and pasted into WhatsApp. It
used nodemailer with a Gmail account (`smtp.gmail.com:465`, app password in `EMAIL_USER` /
`EMAIL_PASS`, sender `EMAIL_FROM`). v2 had no email at all.

We want the same announcement back, now sent to a list of people **other than the admins**
whenever a promoter publishes a new opportunity. Volume is low (one email per new listing); Gmail
allows ~500 recipients/day per account, far above our needs.

## Decision

- **Transport**: `nodemailer` + Gmail SMTP, configured exactly as v1, in `src/lib/email`
  (`sendEmail`, server-only). Credentials come from `env` (`EMAIL_USER`, `EMAIL_PASS`,
  `EMAIL_FROM`) and are **optional**: when unset, `sendEmail` returns `false` without sending, so
  local dev, integration and e2e runs never send real email (ADR-0008).
- **Recipients**: `NEW_OPPORTUNITY_NOTIFY_EMAILS`, comma-separated, independent of `ADMIN_EMAILS`.
  Kept in env, never in the DB (ADR-0003). Sent as **BCC** so recipients don't see each other.
- **Trigger**: only on creation. `createOpportunityAction` schedules
  `notifyNewOpportunity(slug)` (`src/features/opportunities/server/notify.ts`) with `after()` from
  `next/server`: the promoter does not wait for SMTP and a failure never fails the publication.
  Withdraw/republish and admin restore do not notify.
- **Content** (`server/announcement.ts`): title, type, location, capital, minimum ticket, returns,
  term, closing date and the link to the public listing, copy in `messages/es.json`
  (`notifications.newOpportunity`). **No promoter data**: contact stays behind sign-in (business
  rule #4). The cover photo is attached, fetched by nodemailer from its public R2 URL.
- **No PII in logs**: errors log only SMTP codes, never addresses or content.

## Consequences

- Adding another email means calling `sendEmail` from a feature; copy goes in `messages/es.json`.
- Deliverability and limits depend on one Gmail account and its app password; if it is revoked,
  emails stop silently (only an error log). Watch the logs after rotating the password.
- If volume grows or we need templates, bounces or tracking, supersede this ADR with a
  transactional provider (Resend, Postmark, SES) behind the same `sendEmail` signature.

## Alternatives considered

- Resend / Postmark / SES — better deliverability and observability, but a new account, domain DNS
  setup and a cost for a handful of emails a week; the user asked to keep v1's mechanism.
- Sending inside the action (await) — slows publishing and couples it to SMTP availability.
- Storing the recipient list in the DB with an admin UI — more code and stores emails locally; env
  is enough for a short, rarely changing list.
