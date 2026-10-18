import { env } from "@/lib/env";

/** Public URL of an object in the PUBLIC bucket (photos). Safe on client and server. */
export function publicObjectUrl(key: string) {
  return `${env.NEXT_PUBLIC_R2_CLOUDFLARE_URL.replace(/\/$/, "")}/${key}`;
}
