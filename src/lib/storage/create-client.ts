import { S3Client } from "@aws-sdk/client-s3";

export type StorageConfig = {
  endpoint?: string;
  accountId?: string;
  accessKeyId: string;
  secretAccessKey: string;
};

/**
 * S3 client for Cloudflare R2 (or MinIO locally when `endpoint` is set).
 * Free of `server-only`/env imports so scripts and tests can use it.
 */
export function createStorageClient(config: StorageConfig) {
  const endpoint =
    config.endpoint ??
    (config.accountId ? `https://${config.accountId}.r2.cloudflarestorage.com` : undefined);
  if (!endpoint) throw new Error("Set R2_ACCOUNT_ID (production) or R2_ENDPOINT (local MinIO)");
  return new S3Client({
    region: "auto",
    endpoint,
    // MinIO needs path-style URLs (http://host:port/bucket/key).
    forcePathStyle: Boolean(config.endpoint),
    credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey },
  });
}
