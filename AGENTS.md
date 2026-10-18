<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# InversorHouse — agent guide

Marketplace where **promoters** (promotores) publish real-estate investment opportunities and
**investors** (inversores) find them and contact the promoter. We only facilitate contact: no
payments, no contracts, no document management. UI is 100% Spanish (es-ES, "tú").

Read before working: [docs/architecture.md](docs/architecture.md) · [docs/domain.md](docs/domain.md) ·
[docs/adr/](docs/adr/) (decisions — don't contradict an accepted ADR, write a new one).

## Stack (exact versions in package.json)

Next 16 App Router (Cache Components ON, `proxy.ts` not middleware) · React 19 · TypeScript strict ·
Tailwind 4 + shadcn/ui · Drizzle ORM + Postgres (Neon in prod, Docker locally) · Clerk auth ·
Cloudflare R2 (MinIO locally) · next-intl · Zod 4 · Vitest · Playwright · pnpm.

## Commands

| Task                                                    | Command                                                   |
| ------------------------------------------------------- | --------------------------------------------------------- |
| Dev server (Docker + migrations + `next dev` on :3020+) | `pnpm dev`                                                |
| Production build served locally (:3021+)                | `pnpm prod:local`                                         |
| Fast check (types, lint, format, unit)                  | `pnpm verify`                                             |
| **Everything** (verify + integration + e2e)             | `pnpm verify:full`                                        |
| Unit / integration / e2e                                | `pnpm test` / `pnpm test:integration` / `pnpm test:e2e`   |
| New migration after editing `src/db/schema`             | `pnpm db:generate --name <change>` then `pnpm db:migrate` |
| Reset local DB (drop, migrate, seed)                    | `pnpm db:reset`                                           |

## Definition of done (non-negotiable)

1. `pnpm verify:full` passes locally. There is **no CI** — you are the CI. Report the result.
2. New behaviour has tests next to the code (`*.test.ts` unit, `*.int.test.ts` integration) and,
   for user flows, an e2e spec in `tests/e2e/`.
3. Schema change ⇒ committed migration in `src/db/migrations` (never edit an applied migration).
4. New UI text ⇒ key in `messages/es.json` (never hardcode copy in components).
5. New env var ⇒ declared in `src/lib/env.ts` **and** documented in `.env.example`.
6. Architectural decision ⇒ ADR in `docs/adr/` (use the `new-adr` skill).
7. Conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`).

## Golden rules

- **No personal data in our DB.** Users are referenced only by `clerk_user_id`. Names, emails and
  phones are read from Clerk at request time (ADR-0003). Never log or cache PII on the server.
- **Authorize on the server, every time.** `proxy.ts` is only a first filter. Every server action
  and query that touches private data calls `requireUser()` / `requireAdmin()` from `@/lib/auth`.
- **Layers** (ADR-0004): `app → features → (components, lib, db, config, i18n)`. Import a feature
  only via `@/features/<name>` (client-safe) or `@/features/<name>/server` (server-only). ESLint enforces it.
- **Validate at the boundary** with the feature's Zod schemas (`schemas.ts`), shared by form and action.
- **Env** only through `env` from `@/lib/env`. **Copy** only through next-intl. **Brand** values only
  through `@/config/brand` and the CSS tokens in `src/styles/theme.css`.
- Local commands must never touch production: scripts refuse remote DB/storage (ADR-0008).
- Ports 3000, 5432, 5433, 9000, 9001 are reserved for other projects on the dev machine.

## Where things go

```
src/app/            routes only: thin pages/layouts composing feature components
src/features/<f>/   components/, server/{queries,actions,service}.ts, schemas.ts, index.ts, AGENTS.md
src/components/     ui/ (shadcn primitives), layout/, brand/ — no business logic
src/lib/            env, auth, storage, formatting, safe-action, utils
src/db/             schema/, migrations/, seed/, client
src/i18n/ messages/ next-intl config + es.json
docs/               architecture, domain, adr/, runbooks/
tests/              e2e/, integration/ helpers, factories/
```

Each folder with an `AGENTS.md` has local rules — read it before editing files there.
