import { afterAll, beforeEach } from "vitest";

import { resetData } from "./db";

beforeEach(async () => {
  await resetData();
});

afterAll(async () => {
  const { closeTestDb } = await import("./db");
  await closeTestDb();
});
