# 0014. Derive the home listings' cache lifetime from their closing dates

- Status: accepted
- Date: 2026-11-06

## Context

`/` is a fully static page (`○` in `next build`). Its revalidation interval is the shortest
`cacheLife` it reads: `listFeaturedOpportunities` and `listLatestOpportunities` used
`cacheLife("minutes")` (ADR-0007), so the build reported `Revalidate 1m`. With constant traffic
(including crawlers), Vercel re-rendered the whole home every minute. `/` became the route that
uses the most Fluid Active CPU, close to the Hobby plan limit.

The short lifetime was not needed for freshness: every mutation (create, edit, withdraw, feature,
admin remove/restore, ban) already calls `updateTag(...)`. Only two things change visibility
without a tag update:

- `closes_at` passing (evaluated in SQL with `now()`).
- `withdrawAllForPromoter`, which runs during render when a promoter's Clerk account is gone
  (business rule #8). `revalidateTag` cannot be called during render.

## Decision

- The two home queries call `cacheLife(homeListingCacheLife(rows))`
  (`src/features/opportunities/server/cache-life.ts`). It is an inline profile computed from the
  returned rows: `revalidate` = the earlier of **1 hour** and **the next `closesAt` among the
  listed items**, never below 60 s. `stale` is 5 min and `expire` is 7 days, so the entry stays in
  the static shell.
- Other public queries keep ADR-0007 (`cacheLife("minutes")`). They render in dynamic holes
  (`/oportunidades`, `/oportunidades/[slug]` show `Revalidate 1d` at route level), so they don't
  regenerate a whole static page.

## Consequences

- The home regenerates at most about once an hour instead of every minute (≈60× fewer renders),
  unless a listed opportunity closes sooner.
- A closed opportunity disappears from the home when it closes, as before (to the minute).
- Listings retired by `withdrawAllForPromoter` can stay on the home for up to 1 hour (before: 1
  minute). This is rare and acceptable.
- If `/` keeps topping CPU usage, look next at `proxy.ts` (Clerk runs on every request to `/`)
  and at crawler traffic.

## Alternatives considered

- `cacheLife("hours")` / `"days"` with no closing-date logic: a closed listing would stay visible
  for up to the full interval.
- `"days"` plus `revalidateTag` from the daily cron: closed listings would still be visible for up
  to a day, and it needs more plumbing.
- Making the home dynamic: it would render on every request, which costs more CPU.
