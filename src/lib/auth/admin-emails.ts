import { parseEmailList } from "@/lib/utils/email-list";

/** "A@x.com, b@y.com " → Set{"a@x.com","b@y.com"} */
export function parseAdminEmails(raw: string | undefined): Set<string> {
  return new Set(parseEmailList(raw));
}

/** True if any of the user's VERIFIED emails is in the admin list (ADR-0006). */
export function hasAdminEmail(verifiedEmails: string[], admins: Set<string>): boolean {
  return verifiedEmails.some((email) => admins.has(email.trim().toLowerCase()));
}
