# Architecture

## Overview

```
Browser ──► Vercel (Next 16, Node runtime)
              │  proxy.ts ── Clerk session check (first filter only)
              │
              ├─ src/app           routes: thin pages/layouts, metadata, route handlers
              │     │ imports
              ├─ src/features/*    business slices: UI + server code + schemas
              │     │ imports
              ├─ src/lib           env, auth guards, storage (S3/R2), formatting
              ├─ src/db            Drizzle schema + client ──► Postgres (Neon / Docker)
              ├─ src/components    design-system primitives (shadcn/ui), layout, brand
              └─ src/i18n          next-intl config ──► messages/es.json
                                    │
External:  Clerk (identity + PII)   Cloudflare R2 (photos public, documents private)
```

## Layers and dependency rules (ADR-0004)

| Layer                                                           | May import                                                                              | Must not import             |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------- |
| `src/app`                                                       | features, components, lib, config, i18n                                                 | — (nothing imports `app`)   |
| `src/features/<f>`                                              | own files (relative), other features' public entries, components, lib, db, config, i18n | another feature's internals |
| `src/components`, `src/lib`, `src/db`, `src/config`, `src/i18n` | each other                                                                              | features, app               |

A feature exposes two entry points:

- `src/features/<f>/index.ts` — client-safe: components, schemas, types, pure helpers.
- `src/features/<f>/server/index.ts` — server-only (`import "server-only"`): queries, actions, services.

Inside a feature:

```
features/opportunities/
  AGENTS.md          invariants of this slice — read first
  schemas.ts         Zod schemas (form + action input), inferred types
  components/        React components ("use client" only where needed)
  server/
    queries.ts       reads; cached with 'use cache' + cacheTag
    actions.ts       "use server" mutations: auth → validate → service → updateTag
    service.ts       business logic, pure-ish, receives validated input (easy to integration-test)
  *.test.ts          unit tests      *.int.test.ts  integration tests (real Postgres)
```

## Request flow

- **Public reads** (home, search, detail): Server Components call cached queries
  (`'use cache'`, `cacheLife('minutes')`, `cacheTag('opportunities')`). They are part of the static
  shell / streamed; no session is read.
- **Session-dependent UI** (contact box, "Me interesa", header user menu) lives inside `<Suspense>`
  and reads the session with Clerk `auth()`.
- **Mutations** are Server Actions: `requireUser()` → Zod parse → service → `updateTag(...)`.
- **Uploads** go browser → R2 directly via presigned PUT URLs (ADR-0005); the action only records keys.
- **Document downloads** go through `/api/documents/[id]`, which checks the session and redirects to
  a 5-minute presigned GET URL.

## Caching (ADR-0007)

Cache Components is on: everything is dynamic unless cached. Tags in use:

| Tag                | Invalidated when                                             |
| ------------------ | ------------------------------------------------------------ |
| `opportunities`    | any opportunity is created/edited/withdrawn/removed/featured |
| `opportunity:<id>` | that opportunity changes                                     |
| `geo`              | never (static data)                                          |

## Environments (ADR-0008)

|                         | Database                           | Storage            | Clerk                             | URL               |
| ----------------------- | ---------------------------------- | ------------------ | --------------------------------- | ----------------- |
| `pnpm dev`              | Docker `postgres` :5442            | MinIO :9010        | development instance (or keyless) | :3020+            |
| `pnpm prod:local`       | Docker `postgres` :5442            | MinIO :9010        | development instance              | :3021+            |
| tests (integration/e2e) | Docker `postgres-test` :5443 (RAM) | MinIO test buckets | development instance              | :3022             |
| Vercel Production       | Neon main                          | R2                 | production instance               | inversorhouse.com |

No Preview deployments and no Neon preview branches (ADR-0012): previews would share production
Clerk and R2 (real users and files).
