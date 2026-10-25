# src/lib — cross-cutting infrastructure

- `env.ts`: the only place that reads `process.env`. Add vars here and in `.env.example`.
- `auth/`: `getViewer()`, `requireUser()`, `requireAdmin()`, admin email parsing. Server-only.
  Authorization always happens here, never only in `proxy.ts`.
- `storage/`: S3 client for R2/MinIO, presigned URLs, public URL builder. Server-only, except
  `publicUrl` helpers that only need `NEXT_PUBLIC_*`.
- `email/`: `sendEmail` via Gmail SMTP (nodemailer, ADR-0013). Server-only. No-op (returns false)
  without `EMAIL_USER`/`EMAIL_PASS`. Never log recipients or content. Mock it in integration tests.
- `format.ts`: currency, percent, dates, months — locale-aware (`Intl`). Use these, never ad-hoc
  `toLocaleString` in components.
- `safe-action.ts`: `ActionResult` type and helpers for server actions.
- `utils/`: tiny pure helpers (`cn`, `slugify`). Pure ⇒ unit-tested.
- Must not import from `src/features` or `src/app` (ESLint enforces it).
