---
name: verify
description: Run the full local verification suite (types, lint, format, unit, integration, e2e) after any implementation and report the result. Use before declaring any task done.
---

# Verify

There is no CI in this project: this skill **is** the CI (ADR-0008).

1. Make sure Docker is running (`docker info`). If not, tell the user and stop.
2. Run `pnpm verify:full`. It runs, in order:
   `typecheck` → `lint` → `format:check` → `test` (unit) → `test:integration` → `test:e2e`.
3. If a step fails:
   - `format:check` → run `pnpm format` and re-run.
   - `lint` → try `pnpm lint:fix`, then fix the rest by hand. Never disable a rule to pass.
   - Tests → fix the code (or the test if the behaviour change was intended — say so).
   - E2E needs Clerk development keys in `.env.production.local`; if they are missing, report it
     clearly instead of skipping silently.
4. Re-run until green, then report: what ran, pass/fail per step, and anything skipped and why.
   Paste the failing output if you could not fix something.
