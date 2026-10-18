# 0003. Clerk is the only custodian of personal data

- Status: accepted
- Date: 2026-10-18

## Context

We want to keep existing users (same Clerk production instance and keys) and minimise our GDPR
exposure. We must still show promoter contact data to signed-in users, and interested investors to
promoters.

## Decision

- Our DB stores only `clerk_user_id` (table `users`) plus non-personal state (status, ban reason).
- Name and email come from the Clerk user. The promoter's contact settings live in Clerk
  **`privateMetadata.contact`** = `{ phone (E.164), phoneVisibility: "public" | "hidden", bookingUrl? }`.
  `privateMetadata` is only readable with the secret key (server-side).
- Contact data is fetched from Clerk at request time, only for signed-in viewers. It is never put in
  a shared cache (`'use cache'`), logged, or written to our DB.
- Local `users` rows are created lazily (upsert) on the first authenticated action — no webhook.
  If Clerk returns 404 for a promoter, their opportunities are set to `withdrawn`.
- "Me interesa" shows the investor an explicit notice that name + email are shared with the promoter.

## Consequences

One Clerk API call per detail view for signed-in users. Phone numbers are not verified by SMS (no
Clerk SMS cost); format is validated with libphonenumber-js.

## Alternatives considered

- Clerk phone numbers as identifiers: requires enabling phone in the instance and SMS verification.
- Clerk webhooks to mirror users: more moving parts, and mirroring PII is exactly what we avoid.
