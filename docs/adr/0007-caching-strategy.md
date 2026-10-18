# 0007. Caching with Cache Components

- Status: accepted
- Date: 2026-10-18

## Context

Next 16 with `cacheComponents: true`: data access is dynamic unless cached, and uncached access must
sit inside `<Suspense>`. Most traffic is anonymous browsing of public listings.

## Decision

- Public queries (`features/*/server/queries.ts`) use `'use cache'` + `cacheLife('minutes')` +
  `cacheTag('opportunities')` / `cacheTag('opportunity:<id>')`. Geography uses `cacheLife('max')`.
- Expiry by `closes_at` is evaluated in SQL; with a minutes-level lifetime a closed listing may stay
  visible for a few extra minutes — acceptable.
- Mutations call `updateTag(...)` (read-your-writes) from Server Actions.
- Nothing derived from the session or containing PII is cached with `'use cache'`. Session UI lives
  in `<Suspense>` and reads Clerk `auth()` at request time.
- Admin and panel pages are request-time; use `export const instant = false` where navigation
  validation complains (see `node_modules/next/dist/docs/01-app/02-guides/instant-navigation.md`).

## Consequences

Fast static shells for public pages. Every new mutation must call `updateTag` for the tags it affects.
