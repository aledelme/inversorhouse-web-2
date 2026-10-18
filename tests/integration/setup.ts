import { afterAll, beforeEach, vi } from "vitest";

import { closeTestDb, resetData } from "./db";

// Outside the Next runtime `'use cache'` is inert, but cacheLife/cacheTag/updateTag
// would throw: make them no-ops so cached queries run uncached in tests.
vi.mock("next/cache", () => ({
  cacheLife: () => {},
  cacheTag: () => {},
  updateTag: vi.fn(),
  revalidateTag: vi.fn(),
}));

// Never call Clerk from tests (ADR-0003). Individual tests override what they need.
vi.mock("@/lib/auth/clerk", () => ({
  auth: vi.fn(async () => ({ userId: null })),
  currentUser: vi.fn(async () => null),
  clerkClient: vi.fn(async () => ({ users: {} })),
}));

beforeEach(async () => {
  await resetData();
});

afterAll(async () => {
  await closeTestDb();
});
