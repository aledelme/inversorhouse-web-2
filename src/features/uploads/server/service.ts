import "server-only";

import { inArray } from "drizzle-orm";

import { db } from "@/db/client";
import { opportunityDocuments, opportunityImages } from "@/db/schema";
import { deleteObjects, listObjects } from "@/lib/storage";

import { UPLOAD_RULES, type UploadKind, UPLOADS_ROOT } from "../rules";

/** Where the keys of each kind are referenced (images → public bucket, documents → private). */
const referenceColumn = {
  image: opportunityImages.storageKey,
  document: opportunityDocuments.storageKey,
} as const;

const referenceTable = { image: opportunityImages, document: opportunityDocuments } as const;

async function referencedKeys(kind: UploadKind, keys?: string[]): Promise<Set<string>> {
  if (keys && keys.length === 0) return new Set();
  const column = referenceColumn[kind];
  const rows = await db
    .selectDistinct({ key: column })
    .from(referenceTable[kind])
    .where(keys ? inArray(column, keys) : undefined);
  return new Set(rows.map((row) => row.key));
}

/**
 * Deletes files detached from an opportunity, unless another row still references them
 * (a user may attach the same upload to several listings). Best-effort: a failure is logged
 * and the daily sweep removes the leftovers.
 */
export async function deleteDetachedFiles(files: Record<UploadKind, string[]>) {
  for (const kind of Object.keys(files) as UploadKind[]) {
    const keys = [...new Set(files[kind])];
    if (keys.length === 0) continue;
    try {
      const stillUsed = await referencedKeys(kind, keys);
      await deleteObjects(
        UPLOAD_RULES[kind].bucket,
        keys.filter((key) => !stillUsed.has(key)),
      );
    } catch (error) {
      console.error(`[uploads] could not delete ${keys.length} detached ${kind} file(s)`, error);
    }
  }
}

/**
 * Deletes user uploads that no opportunity references and that are older than `olderThan`
 * (abandoned forms, replaced files whose immediate delete failed). The grace period must
 * comfortably exceed the time a user can spend filling the form after uploading.
 */
export async function sweepOrphanUploads({
  olderThan,
  prefix = UPLOADS_ROOT,
}: {
  olderThan: Date;
  /** Only keys under this prefix are considered (tests narrow it to their own user). */
  prefix?: string;
}): Promise<Record<UploadKind, number>> {
  const deleted = { image: 0, document: 0 };
  for (const kind of Object.keys(deleted) as UploadKind[]) {
    const referenced = await referencedKeys(kind);
    const orphans: string[] = [];
    for await (const object of listObjects(UPLOAD_RULES[kind].bucket, prefix)) {
      if (object.lastModified < olderThan && !referenced.has(object.key)) orphans.push(object.key);
    }
    await deleteObjects(UPLOAD_RULES[kind].bucket, orphans);
    deleted[kind] = orphans.length;
  }
  return deleted;
}
