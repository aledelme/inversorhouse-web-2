# 0008. Local-only test strategy and safe environments

- Status: accepted
- Date: 2026-10-18

## Context

No paid CI for now. Developers (and agents) must be able to run everything locally without any risk
of touching production. Other projects on the same machine use ports 3000, 5432, 5433, 9000, 9001.

## Decision

- Docker Compose (`docker/compose.yml`): `postgres` :5442 (dev), `postgres-test` :5443 (tmpfs) and
  MinIO :9010/:9011 with dev and test buckets. Ports can be overridden with `IH_*` variables.
- The `pnpm dev`, `pnpm prod:local`, seed and reset scripts refuse a remote `DATABASE_URL` or
  `R2_ENDPOINT` (`scripts/lib/env.ts`). `ALLOW_REMOTE=1` overrides dev/migrate only, never
  seed/reset/tests.
- Locally, Clerk uses the **development** instance keys (pk_test); production keys never live locally.
- Test pyramid:
  - **Unit** (Vitest, jsdom): pure logic, schemas, components. `*.test.ts(x)` next to the code.
  - **Integration** (Vitest, node): services and queries against the real test Postgres + MinIO.
    `*.int.test.ts`. Data is truncated before each test (geography is kept).
  - **E2E** (Playwright): production build on :3022 against the test services; desktop + mobile.
- `pnpm verify` (fast) runs on `pre-push` via Lefthook. `pnpm verify:full` is required after every
  implementation (root `AGENTS.md`, "Definition of done").

## Consequences

Discipline replaces CI. Revisit (GitHub Actions or similar) when there are more contributors.
