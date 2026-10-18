# uploads — direct-to-R2 file uploads (ADR-0005)

- Flow: client calls `requestUploadUrlAction` → gets a 5-min presigned PUT → uploads bytes straight to
  R2/MinIO → passes the returned `key` to the form. No file bytes go through our functions.
- Rules (types, sizes, counts, buckets) live in `rules.ts` and are enforced server-side.
- Keys are always `u/<users.id>/<uuid>.<ext>`. Any action that persists keys MUST check
  `isOwnUploadKey(key, viewer.userId)`.
- Images are converted to WebP ≤2000px in the browser (`client/upload.ts`). Documents go to the
  PRIVATE bucket and are only downloadable via `/api/documents/[id]` (signed GET, 5 min).
