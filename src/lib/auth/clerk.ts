import "server-only";

/**
 * The only module that talks to Clerk's server SDK.
 * Integration tests mock this file (vi.mock("@/lib/auth/clerk")).
 */
export { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
