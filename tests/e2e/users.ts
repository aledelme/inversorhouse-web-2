/**
 * Test users in the Clerk DEVELOPMENT instance. `+clerk_test` emails are Clerk's
 * reserved test addresses (no real email is sent). Created by global-setup.ts.
 */
export const E2E_USERS = {
  promoter: { email: "promotor+clerk_test@example.com", firstName: "Paula", lastName: "Promotora" },
  investor: { email: "inversor+clerk_test@example.com", firstName: "Iván", lastName: "Inversor" },
  admin: { email: "admin+clerk_test@example.com", firstName: "Ana", lastName: "Admin" },
} as const;

export type E2EUser = keyof typeof E2E_USERS;
