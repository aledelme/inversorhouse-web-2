import { z } from "zod";

/** Upload rules (ADR-0005). Shared by the client (pre-checks) and the server (authoritative). */
export const UPLOAD_RULES = {
  image: {
    bucket: "public",
    maxBytes: 8 * 1024 * 1024,
    contentTypes: { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png" },
    maxFiles: 12,
  },
  document: {
    bucket: "private",
    maxBytes: 25 * 1024 * 1024,
    contentTypes: {
      "application/pdf": "pdf",
      "application/msword": "doc",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
      "application/vnd.ms-excel": "xls",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
      "image/jpeg": "jpg",
      "image/png": "png",
    },
    maxFiles: 10,
  },
} as const;

export type UploadKind = keyof typeof UPLOAD_RULES;

export const uploadRequestSchema = z
  .object({
    kind: z.enum(["image", "document"]),
    contentType: z.string(),
    size: z.number().int().positive(),
  })
  .superRefine((value, ctx) => {
    const rules = UPLOAD_RULES[value.kind];
    if (!(value.contentType in rules.contentTypes)) {
      ctx.addIssue({ code: "custom", path: ["contentType"], message: "fileType" });
    }
    if (value.size > rules.maxBytes) {
      ctx.addIssue({ code: "custom", path: ["size"], message: "fileTooLarge" });
    }
  });

export type UploadRequest = z.infer<typeof uploadRequestSchema>;

/** Every object a user uploads lives under their own prefix. */
export const userUploadPrefix = (userId: string) => `u/${userId}/`;

export function isOwnUploadKey(key: string, userId: string) {
  return key.startsWith(userUploadPrefix(userId)) && !key.includes("..");
}

export function extensionFor(kind: UploadKind, contentType: string) {
  return (UPLOAD_RULES[kind].contentTypes as Record<string, string>)[contentType];
}
