import "server-only";

import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";

import { routes } from "@/config/navigation";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { env } from "@/lib/env";

import { hasAdminEmail, parseAdminEmails } from "./admin-emails";
import { auth, currentUser } from "./clerk";
import { AuthError } from "./errors";

export type Viewer = {
  clerkUserId: string;
  /** Local users.id (uuid). */
  userId: string;
  isBanned: boolean;
};

/** Creates the local mirror row on first use (ADR-0003: lazy, no webhook). */
export async function ensureLocalUser(clerkUserId: string) {
  const [existing] = await db.select().from(users).where(eq(users.clerkUserId, clerkUserId));
  if (existing) return existing;
  await db.insert(users).values({ clerkUserId }).onConflictDoNothing();
  const [created] = await db.select().from(users).where(eq(users.clerkUserId, clerkUserId));
  return created!;
}

/** Current signed-in user or null. Reads the session: call inside <Suspense> or a dynamic route. */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return null;
  const user = await ensureLocalUser(clerkUserId);
  return { clerkUserId, userId: user.id, isBanned: user.status === "banned" };
});

/** For server actions/services: throws AuthError (mapped by runAction). */
export async function requireUser(): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) throw new AuthError("unauthenticated");
  if (viewer.isBanned) throw new AuthError("forbidden");
  return viewer;
}

export const isAdmin = cache(async (): Promise<boolean> => {
  const user = await currentUser();
  if (!user) return false;
  const verified = user.emailAddresses
    .filter((email) => email.verification?.status === "verified")
    .map((email) => email.emailAddress);
  return hasAdminEmail(verified, parseAdminEmails(env.ADMIN_EMAILS));
});

export async function requireAdmin(): Promise<Viewer> {
  const viewer = await requireUser();
  if (!(await isAdmin())) throw new AuthError("forbidden");
  return viewer;
}

/** For pages: redirects to sign-in, hides admin pages behind a 404. */
export async function requireUserPage(): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) redirect(routes.signIn);
  if (viewer.isBanned) redirect("/");
  return viewer;
}

export async function requireAdminPage(): Promise<Viewer> {
  const viewer = await requireUserPage();
  if (!(await isAdmin())) notFound();
  return viewer;
}
