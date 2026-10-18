# src/db — schema, migrations, seed

- `schema/*.ts` is the source of truth (Drizzle, `casing: "snake_case"`: camelCase in TS ⇒ snake_case
  columns). Re-export new tables from `schema/index.ts` and add relations in `schema/relations.ts`.
- After changing the schema: `pnpm db:generate --name <short_change>` → review the SQL →
  `pnpm db:migrate`. **Never edit an applied migration**; write a new one.
- Destructive changes (drop/rename column) need a two-step migration and a note in the PR/commit.
- **No personal data columns** (name, email, phone, address of a person). See ADR-0003.
- Money is whole euros in `integer`; percentages are `numeric(6,2)` with `mode: "number"`.
- Prefer constraints in the DB (`check`, FKs, unique) over checks in code — and keep both.
- `client.ts` (server-only, uses env) is for the app. `create.ts` is for scripts and tests.
- `seed/geo.ts` loads INE data from `seed/data` (generated — see its README). `seed/sample.ts`
  creates fake local data; seed users have `clerk_user_id` starting with `seed_`.
- Inspect data: `pnpm db:studio`.
