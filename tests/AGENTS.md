# tests — shared test infrastructure

- Unit tests live next to the code (`src/**/*.test.ts(x)`), run with `pnpm test` (jsdom, env
  validation skipped).
- Integration tests: `src/**/*.int.test.ts` or `tests/integration/**/*.int.test.ts`, run with
  `pnpm test:integration`. `global-setup.ts` starts `postgres-test` (:5443, RAM) + MinIO, recreates the
  schema and seeds the geography once per run; `setup.ts` truncates data before **each** test.
  Never point these at the dev database.
- Factories in `tests/factories/` create valid rows with sensible defaults — use them instead of
  hand-written inserts so schema changes are fixed in one place.
- Clerk is mocked in integration tests via `vi.mock("@/lib/auth/clerk")` (see existing tests).
- E2E (`tests/e2e/*.spec.ts`, Playwright): production build on :3022 against the test services
  (`scripts/e2e-server.ts`), projects `desktop` and `mobile`. Prefer role/label selectors
  (`getByRole`, `getByLabel`) with Spanish text — they double as accessibility checks.
- Auth in e2e uses `@clerk/testing` with the Clerk development instance (needs real pk_test/sk_test
  keys in `.env.production.local`; test users use `+clerk_test` emails, OTP `424242`).
