# 0006. Admins are configured by environment variable

- Status: accepted
- Date: 2026-10-18

## Context

A small, non-technical team needs an admin panel. A roles UI is not needed yet.

## Decision

`ADMIN_EMAILS` (comma-separated, case-insensitive). A user is an admin iff one of their **verified**
Clerk email addresses is in the list. It is checked server-side by `requireAdmin()` on every admin
page and action; `/admin` is also filtered in `proxy.ts`. Every admin mutation writes to
`admin_audit_log`.

## Consequences

Changing admins means editing the env var in Vercel and redeploying. Fine at this scale; move to
Clerk roles/organisations if the team grows.
