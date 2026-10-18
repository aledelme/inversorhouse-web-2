import "server-only";

import { isClerkAPIResponseError } from "@clerk/nextjs/errors";

import { clerkClient } from "@/lib/auth/clerk";

import {
  type ContactSettings,
  isAllowedBookingUrl,
  parseStoredContact,
  type PromoterContact,
} from "../schemas";

/** Seed users (local data only) have no Clerk account. */
const isSeedUser = (clerkUserId: string) => clerkUserId.startsWith("seed_");

/** Placeholder identity for local seed users, e.g. seed_promoter → "Seed promoter". */
function seedIdentity(clerkUserId: string) {
  const label = clerkUserId.replace(/^seed_/, "").replace(/_/g, " ");
  return {
    name: `Seed ${label}`,
    email: `${clerkUserId.replace(/_/g, "-")}@example.com`,
  };
}

type ClerkUserLike = {
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  primaryEmailAddress?: { emailAddress: string } | null;
  privateMetadata: Record<string, unknown>;
};

function readSettings(user: ClerkUserLike): ContactSettings | null {
  return parseStoredContact((user.privateMetadata as { contact?: unknown }).contact);
}

export function displayName(user: Pick<ClerkUserLike, "firstName" | "lastName" | "username">) {
  return [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || "—";
}

/** The current settings of a user (for their own profile form). */
export async function getContactSettings(clerkUserId: string): Promise<ContactSettings | null> {
  if (isSeedUser(clerkUserId)) return null;
  const client = await clerkClient();
  return readSettings(await client.users.getUser(clerkUserId));
}

export async function hasPhone(clerkUserId: string) {
  return Boolean((await getContactSettings(clerkUserId))?.phone);
}

export async function saveContactSettings(clerkUserId: string, settings: ContactSettings) {
  const client = await clerkClient();
  await client.users.updateUserMetadata(clerkUserId, {
    privateMetadata: {
      contact: {
        phone: settings.phone,
        phoneVisibility: settings.phoneVisibility,
        // null removes the key on Clerk's deep merge.
        bookingUrl: settings.bookingUrl ?? null,
      },
    },
  });
}

/**
 * Contact block shown to SIGNED-IN visitors (business rule #4).
 * Returns "deleted" when the Clerk account no longer exists (rule #8).
 * Never cache the result: it contains personal data (ADR-0003).
 */
export async function getPromoterContact(
  clerkUserId: string,
): Promise<PromoterContact | "deleted"> {
  if (isSeedUser(clerkUserId)) {
    return {
      ...seedIdentity(clerkUserId),
      phone: "+34600000000",
      bookingUrl: null,
    };
  }
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(clerkUserId);
    const settings = readSettings(user);
    return {
      name: displayName(user),
      email: user.primaryEmailAddress?.emailAddress ?? null,
      phone: settings?.phoneVisibility === "public" ? settings.phone : null,
      bookingUrl:
        settings?.bookingUrl && isAllowedBookingUrl(settings.bookingUrl)
          ? settings.bookingUrl
          : null,
    };
  } catch (error) {
    if (isClerkAPIResponseError(error) && error.status === 404) return "deleted";
    throw error;
  }
}

/** Name + email of several users (interested investors), read from Clerk on demand. */
export async function getUsersBasicInfo(clerkUserIds: string[]) {
  const real = clerkUserIds.filter((id) => !isSeedUser(id));
  const result = new Map<string, { name: string; email: string | null }>();
  for (const id of clerkUserIds.filter(isSeedUser)) {
    result.set(id, seedIdentity(id));
  }
  if (real.length === 0) return result;
  const client = await clerkClient();
  // Clerk caps the page size at 500; interests per opportunity are far fewer.
  const { data } = await client.users.getUserList({ userId: real, limit: 500 });
  for (const user of data) {
    result.set(user.id, {
      name: displayName(user),
      email: user.primaryEmailAddress?.emailAddress ?? null,
    });
  }
  return result;
}
