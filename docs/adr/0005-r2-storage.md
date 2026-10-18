# 0005. R2 storage: public photos, private documents, presigned uploads

- Status: accepted
- Date: 2026-10-18

## Context

Promoters upload property photos (public) and documentation (signed-in users only). Vercel
functions have a ~4.5 MB request body limit. The existing R2 bucket is public
(`NEXT_PUBLIC_R2_CLOUDFLARE_URL`), so a "private prefix" inside it would not be private.

## Decision

- Two buckets: `R2_PUBLIC_BUCKET` (photos, served via `NEXT_PUBLIC_R2_CLOUDFLARE_URL` + `next/image`)
  and `R2_PRIVATE_BUCKET` (documents, never public).
- Uploads: a server action validates type/size/user and returns a **presigned PUT URL**; the browser
  uploads directly to R2. Keys: `u/<userId>/<uuid>.<ext>`. Saving an opportunity only accepts keys
  under the caller's prefix.
- Images are resized/compressed in the browser before upload (max 2000 px, WebP).
- Downloads: `/api/documents/[id]` checks the session, then redirects to a **5-minute presigned GET**.
- Locally MinIO emulates R2 (`R2_ENDPOINT`); in prod the endpoint is derived from `R2_ACCOUNT_ID`.
- Both R2 buckets need a CORS rule allowing `PUT` from the site origin (see the deploy runbook).

## Consequences

No file bytes pass through our functions. Orphaned uploads (abandoned forms) may accumulate; a
cleanup job can be added later (list keys not referenced in the DB).
