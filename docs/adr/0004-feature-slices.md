# 0004. Feature slices with enforced boundaries

- Status: accepted
- Date: 2026-10-18

## Context

AI agents work best when every change has an obvious home and the blast radius is small.

## Decision

- Code is organised by feature in `src/features/<name>/` (components, server code, schemas, tests
  and an `AGENTS.md` with the slice's invariants). `src/app` only composes features.
- Public entry points: `@/features/<name>` (client-safe) and `@/features/<name>/server` (server-only,
  starts with `import "server-only"`). Inside a feature, use relative imports.
- Lower layers (`components`, `lib`, `db`, `config`, `i18n`) never import features or `app`.
- Enforced with ESLint `no-restricted-imports` in `eslint.config.mjs`; the messages tell the agent
  what to do instead. `eslint-plugin-boundaries` v7 was evaluated; its policy API was not worth the
  complexity for these few rules.

## Consequences

Some duplication between features is accepted over premature shared abstractions. If two features
need the same logic, move it down to `lib` or expose it from one feature's public entry.
