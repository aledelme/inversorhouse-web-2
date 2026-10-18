# src/features — business slices

Each folder is one slice of the product (ADR-0004). Layout:

```
<feature>/
  AGENTS.md        invariants of the slice (keep it current when you change rules)
  index.ts         client-safe public API (components, schemas, types)
  schemas.ts       Zod schemas shared by forms and actions + inferred types
  components/      React components; add "use client" only when needed
  server/
    index.ts       server-only public API — starts with `import "server-only"`
    queries.ts     reads ('use cache' + cacheTag for public data; never cache PII)
    actions.ts     "use server" — requireUser/requireAdmin → schema.parse → service → updateTag
    service.ts     business logic taking validated input + actor; integration-tested
```

Rules:

- Import other features only via `@/features/<name>` or `@/features/<name>/server`.
- Server actions return `ActionResult` from `@/lib/safe-action` (never throw raw errors to the UI);
  validation errors are mapped to field messages (message keys from `messages/es.json`).
- Every mutation invalidates the tags listed in `docs/architecture.md#caching-adr-0007`.
- Tests: pure logic → `*.test.ts`; anything touching the DB → `*.int.test.ts` using
  `tests/factories`. Use the `new-feature` skill to scaffold a slice.

Current slices: `geo`, `opportunities`, `search`, `promoter-profile`, `interests`, `uploads`,
`reports`, `admin`, `marketing`, `legal`.
