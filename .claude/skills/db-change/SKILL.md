---
name: db-change
description: Change the database schema safely with Drizzle (edit schema, generate and review migration, apply locally, update factories/seed/tests).
---

# Database change

Read `src/db/AGENTS.md` first.

1. Edit `src/db/schema/*.ts` (and `relations.ts` / `index.ts` if adding tables). No PII columns.
2. `pnpm db:generate --name <short_snake_case_change>`.
3. **Read the generated SQL** in `src/db/migrations/`. Check: no unintended drops, defaults for new
   NOT NULL columns on existing tables, indexes for new filter columns.
4. `pnpm db:migrate` (local Docker DB). If it fails, delete the new migration files + journal entry,
   fix the schema, regenerate. Never edit a migration that is already committed.
5. Update `tests/factories`, `src/db/seed/sample.ts` and `tests/integration/db.ts` (TRUNCATE list)
   when adding tables.
6. Run the `verify` skill (integration tests recreate the test schema from migrations).
