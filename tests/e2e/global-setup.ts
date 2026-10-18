import { createClerkClient } from "@clerk/backend";
import { clerkSetup } from "@clerk/testing/playwright";

import { E2E_USERS } from "./users";

/**
 * 1. Fetches a Clerk testing token (bypasses bot protection in the dev instance).
 * 2. Makes sure the e2e users exist and resets the promoter's contact settings so the
 *    "add your phone before publishing" flow is exercised on every run.
 */
export default async function globalSetup() {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey?.startsWith("sk_test_")) {
    throw new Error(
      "E2E needs Clerk DEVELOPMENT keys (pk_test_/sk_test_) in .env.production.local — see docs/runbooks/local-dev.md",
    );
  }
  await clerkSetup();

  const clerk = createClerkClient({ secretKey });
  for (const user of Object.values(E2E_USERS)) {
    const { data } = await clerk.users.getUserList({ emailAddress: [user.email] });
    const existing = data[0];
    if (!existing) {
      await clerk.users.createUser({
        emailAddress: [user.email],
        firstName: user.firstName,
        lastName: user.lastName,
        skipPasswordRequirement: true,
      });
    } else if (existing.banned) {
      await clerk.users.unbanUser(existing.id);
    }
  }

  const { data } = await clerk.users.getUserList({ emailAddress: [E2E_USERS.promoter.email] });
  await clerk.users.updateUserMetadata(data[0]!.id, { privateMetadata: { contact: null } });
}
