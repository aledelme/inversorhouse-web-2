import "server-only";

import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { env } from "@/lib/env";

import { createStorageClient } from "./create-client";

export { publicObjectUrl } from "./public-url";

export const buckets = {
  public: env.R2_PUBLIC_BUCKET,
  private: env.R2_PRIVATE_BUCKET,
} as const;
export type BucketKind = keyof typeof buckets;

const globalForS3 = globalThis as unknown as { __ihS3?: ReturnType<typeof createStorageClient> };

/** Created on first use: importing this module has no side effects. */
function client() {
  globalForS3.__ihS3 ??= createStorageClient({
    endpoint: env.R2_ENDPOINT,
    accountId: env.R2_ACCOUNT_ID,
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  });
  return globalForS3.__ihS3;
}

/** Presigned PUT the browser uses to upload directly (ADR-0005). */
export function presignUpload(input: {
  bucket: BucketKind;
  key: string;
  contentType: string;
  contentLength: number;
}) {
  return getSignedUrl(
    client(),
    new PutObjectCommand({
      Bucket: buckets[input.bucket],
      Key: input.key,
      ContentType: input.contentType,
      ContentLength: input.contentLength,
    }),
    { expiresIn: 300 },
  );
}

/** Short-lived download URL for a PRIVATE object (documents). */
export function presignDownload(input: { key: string; fileName: string; expiresIn?: number }) {
  return getSignedUrl(
    client(),
    new GetObjectCommand({
      Bucket: buckets.private,
      Key: input.key,
      ResponseContentDisposition: `attachment; filename*=UTF-8''${encodeURIComponent(input.fileName)}`,
    }),
    { expiresIn: input.expiresIn ?? 300 },
  );
}

/** Deletes objects (missing keys are not an error). Sequential batches keep R2 calls bounded. */
export async function deleteObjects(bucket: BucketKind, keys: string[]) {
  for (let i = 0; i < keys.length; i += 20) {
    await Promise.all(
      keys
        .slice(i, i + 20)
        .map((key) =>
          client().send(new DeleteObjectCommand({ Bucket: buckets[bucket], Key: key })),
        ),
    );
  }
}

/** Every object under `prefix`, following ListObjectsV2 pagination. */
export async function* listObjects(bucket: BucketKind, prefix: string) {
  let continuationToken: string | undefined;
  do {
    const page = await client().send(
      new ListObjectsV2Command({
        Bucket: buckets[bucket],
        Prefix: prefix,
        ContinuationToken: continuationToken,
      }),
    );
    for (const object of page.Contents ?? []) {
      if (object.Key && object.LastModified) {
        yield { key: object.Key, lastModified: object.LastModified };
      }
    }
    continuationToken = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (continuationToken);
}
