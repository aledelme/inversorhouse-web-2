import { HeadObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { describe, expect, it } from "vitest";

import { db } from "@/db/client";
import { opportunityDocuments, opportunityImages } from "@/db/schema";
import { env } from "@/lib/env";
import { createStorageClient } from "@/lib/storage/create-client";

import { createOpportunityRow, createUser } from "../../../../tests/factories/db";
import { UPLOAD_RULES, type UploadKind, userUploadPrefix } from "../rules";

import { deleteDetachedFiles, sweepOrphanUploads } from "./service";

const s3 = createStorageClient({
  endpoint: env.R2_ENDPOINT,
  accessKeyId: env.R2_ACCESS_KEY_ID,
  secretAccessKey: env.R2_SECRET_ACCESS_KEY,
});
const bucketName = (kind: UploadKind) =>
  UPLOAD_RULES[kind].bucket === "public" ? env.R2_PUBLIC_BUCKET : env.R2_PRIVATE_BUCKET;

async function put(kind: UploadKind, key: string) {
  await s3.send(new PutObjectCommand({ Bucket: bucketName(kind), Key: key, Body: "x" }));
}

async function exists(kind: UploadKind, key: string) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: bucketName(kind), Key: key }));
    return true;
  } catch {
    return false;
  }
}

/** Margins absorb clock differences between the host and the MinIO container. */
const everythingIsOld = () => new Date(Date.now() + 5 * 60_000);
const nothingIsOld = () => new Date(Date.now() - 5 * 60_000);

async function attachImage(opportunityId: string, key: string) {
  await db.insert(opportunityImages).values({ opportunityId, storageKey: key });
}

describe("sweepOrphanUploads", () => {
  it("deletes old unreferenced uploads in both buckets and keeps referenced ones", async () => {
    const user = await createUser();
    const prefix = userUploadPrefix(user.id);
    const opportunity = await createOpportunityRow(user.id);
    await attachImage(opportunity.id, `${prefix}kept.webp`);
    await db.insert(opportunityDocuments).values({
      opportunityId: opportunity.id,
      storageKey: `${prefix}kept.pdf`,
      fileName: "nota.pdf",
      sizeBytes: 1,
      contentType: "application/pdf",
    });
    await Promise.all([
      put("image", `${prefix}kept.webp`),
      put("image", `${prefix}orphan.webp`),
      put("document", `${prefix}kept.pdf`),
      put("document", `${prefix}orphan.pdf`),
    ]);

    const deleted = await sweepOrphanUploads({ olderThan: everythingIsOld(), prefix });

    expect(deleted).toEqual({ image: 1, document: 1 });
    expect(await exists("image", `${prefix}kept.webp`)).toBe(true);
    expect(await exists("image", `${prefix}orphan.webp`)).toBe(false);
    expect(await exists("document", `${prefix}kept.pdf`)).toBe(true);
    expect(await exists("document", `${prefix}orphan.pdf`)).toBe(false);
  });

  it("keeps recent uploads (the user may still be filling the form)", async () => {
    const user = await createUser();
    const prefix = userUploadPrefix(user.id);
    await put("image", `${prefix}fresh.webp`);

    const deleted = await sweepOrphanUploads({ olderThan: nothingIsOld(), prefix });

    expect(deleted).toEqual({ image: 0, document: 0 });
    expect(await exists("image", `${prefix}fresh.webp`)).toBe(true);
  });
});

describe("deleteDetachedFiles", () => {
  it("deletes detached files but not those another opportunity still uses", async () => {
    const user = await createUser();
    const prefix = userUploadPrefix(user.id);
    const other = await createOpportunityRow(user.id);
    await attachImage(other.id, `${prefix}shared.webp`);
    await Promise.all([put("image", `${prefix}shared.webp`), put("image", `${prefix}gone.webp`)]);

    await deleteDetachedFiles({
      image: [`${prefix}shared.webp`, `${prefix}gone.webp`],
      document: [],
    });

    expect(await exists("image", `${prefix}shared.webp`)).toBe(true);
    expect(await exists("image", `${prefix}gone.webp`)).toBe(false);
  });
});
