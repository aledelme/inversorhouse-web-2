"use client";

import imageCompression from "browser-image-compression";

import { requestUploadUrlAction } from "../server/actions";
import type { UploadKind } from "../rules";

export class UploadError extends Error {
  constructor(public readonly code: string) {
    super(code);
  }
}

/** Resize to ≤2000px and convert to WebP before uploading (ADR-0005). */
async function prepareImage(file: File) {
  const compressed = await imageCompression(file, {
    maxWidthOrHeight: 2000,
    maxSizeMB: 1.5,
    fileType: "image/webp",
    initialQuality: 0.82,
    // The worker build loads its script from a public CDN; keep everything first-party.
    useWebWorker: false,
  });
  const bitmap = await createImageBitmap(compressed);
  const dims = { width: bitmap.width, height: bitmap.height };
  bitmap.close();
  return { blob: compressed, contentType: "image/webp", ...dims };
}

async function put(kind: UploadKind, blob: Blob, contentType: string) {
  const presigned = await requestUploadUrlAction({ kind, contentType, size: blob.size });
  if (!presigned.ok) {
    const code = presigned.fieldErrors ? Object.values(presigned.fieldErrors)[0]?.[0] : undefined;
    throw new UploadError(code ?? presigned.error);
  }
  const response = await fetch(presigned.data.url, {
    method: "PUT",
    body: blob,
    headers: { "Content-Type": contentType },
  });
  if (!response.ok) throw new UploadError("uploadFailed");
  return presigned.data.key;
}

export type UploadedImage = { key: string; width: number | null; height: number | null };
export type UploadedDocument = { key: string; fileName: string; size: number; contentType: string };

export async function uploadImage(file: File): Promise<UploadedImage> {
  if (!file.type.startsWith("image/")) throw new UploadError("fileType");
  const image = await prepareImage(file);
  const key = await put("image", image.blob, image.contentType);
  return { key, width: image.width, height: image.height };
}

export async function uploadDocument(file: File): Promise<UploadedDocument> {
  const key = await put("document", file, file.type || "application/octet-stream");
  return { key, fileName: file.name, size: file.size, contentType: file.type };
}
