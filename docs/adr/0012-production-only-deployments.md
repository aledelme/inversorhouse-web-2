# 0012. Deploy to production only: no Vercel Preview deployments

- Status: accepted
- Date: 2026-10-19

## Context

ADR-0002 planned a Neon database branch per Vercel Preview deployment. Neon is linked to
Production only and no preview branches exist. Clerk and R2 have a single production instance
in Vercel, so a preview would sign in real users and upload into the real buckets. The project
is maintained by a single developer, and there is no CI (ADR-0008).

## Decision

- Vercel builds **only the production branch**: _Settings → Git → Ignored Build Step_ →
  **Only build production**. Every environment variable lives in the Production environment only.
- Neon is linked to Production only and has no preview branches.
- Pre-release review happens locally: `pnpm verify:full` plus `pnpm prod:local`, the production
  build served against the local Docker services.
- This supersedes the "database branch per Preview deployment" part of ADR-0002. The rest of
  ADR-0002 stands.

## Consequences

- No preview can touch production users, files or data.
- No shareable URL to review a change before it goes live. Rollback is Vercel's
  _Promote to Production_ of the previous deployment (deploy runbook).
- Revisit if more people review changes. Previews would then need their own Clerk development
  instance, their own R2 buckets and Neon preview branches before being enabled.

## Alternatives considered

- **Previews with Neon branches but shared Clerk and R2.** The database is isolated, but users
  and files are still production ones.
- **Fully isolated previews (separate Clerk instance, R2 buckets and Neon branches).** Safe, but
  it means extra setup and secrets with no reviewer to use them today.
