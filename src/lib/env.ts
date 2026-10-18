import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * Single source of truth for environment variables.
 * Import `env` instead of reading `process.env` anywhere else in the app.
 * Adding a variable: declare it here, document it in `.env.example`.
 */
export const env = createEnv({
  server: {
    DATABASE_URL: z.url(),
    CLERK_SECRET_KEY: z.string().optional(),
    // Comma-separated, case-insensitive. Parsed by `parseAdminEmails`.
    ADMIN_EMAILS: z.string().default(""),
    // S3 endpoint override (MinIO locally). In production it is derived from R2_ACCOUNT_ID.
    R2_ENDPOINT: z.url().optional(),
    R2_ACCOUNT_ID: z.string().optional(),
    R2_ACCESS_KEY_ID: z.string().min(1),
    R2_SECRET_ACCESS_KEY: z.string().min(1),
    R2_PUBLIC_BUCKET: z.string().min(1),
    R2_PRIVATE_BUCKET: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_SITE_URL: z.url(),
    NEXT_PUBLIC_R2_CLOUDFLARE_URL: z.url(),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().optional(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_R2_CLOUDFLARE_URL: process.env.NEXT_PUBLIC_R2_CLOUDFLARE_URL,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  },
  emptyStringAsUndefined: true,
  skipValidation: process.env.SKIP_ENV_VALIDATION === "1",
});
