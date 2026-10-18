"use server";

import { requireUser } from "@/lib/auth";
import { type ActionResult, runAction } from "@/lib/safe-action";
import { presignUpload } from "@/lib/storage";

import {
  extensionFor,
  UPLOAD_RULES,
  type UploadRequest,
  uploadRequestSchema,
  userUploadPrefix,
} from "../rules";

/** Returns a presigned PUT URL; the browser uploads the bytes directly to R2 (ADR-0005). */
export async function requestUploadUrlAction(
  input: UploadRequest,
): Promise<ActionResult<{ url: string; key: string }>> {
  return runAction(async () => {
    const viewer = await requireUser();
    const request = uploadRequestSchema.parse(input);
    const key = `${userUploadPrefix(viewer.userId)}${crypto.randomUUID()}.${extensionFor(request.kind, request.contentType)}`;
    const url = await presignUpload({
      bucket: UPLOAD_RULES[request.kind].bucket,
      key,
      contentType: request.contentType,
      contentLength: request.size,
    });
    return { url, key };
  });
}
