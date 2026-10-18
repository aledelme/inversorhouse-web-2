---
name: new-feature
description: Scaffold or extend a feature slice in src/features following the project architecture (schemas, server queries/actions/service, components, tests, AGENTS.md, messages).
---

# New feature slice

Read first: `src/features/AGENTS.md`, `docs/architecture.md`, `docs/domain.md`, and an existing
slice of similar shape (e.g. `src/features/interests`).

1. **Domain**: if the feature adds concepts or rules, update `docs/domain.md` first.
2. **Schema** (if data changes): use the `db-change` skill.
3. **Create** `src/features/<name>/`:
   - `AGENTS.md` — purpose, invariants, which cache tags it reads/invalidates.
   - `schemas.ts` — Zod input schemas; export inferred types.
   - `server/service.ts` — business logic with explicit actor/input parameters.
   - `server/queries.ts` — reads. Public data: `'use cache'` + `cacheLife` + `cacheTag`.
   - `server/actions.ts` — `"use server"`; `requireUser()`/`requireAdmin()` → parse → service →
     `updateTag` → return `ActionResult`.
   - `server/index.ts` — `import "server-only"` + re-exports.
   - `components/` — UI using `@/components/ui` primitives and semantic tokens.
   - `index.ts` — client-safe re-exports.
4. **Copy**: add a namespace to `messages/es.json`; no literals in components.
5. **Routes**: thin page in `src/app/...` composing the feature.
6. **Tests**: unit for pure logic/schemas, `*.int.test.ts` for service + queries (use
   `tests/factories`), e2e spec in `tests/e2e/` for the user flow.
7. Run the `verify` skill.
