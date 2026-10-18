import { count } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import { municipalities, provinces } from "@/db/schema";

import { db } from "./db";

describe("test database", () => {
  it("has the INE geography seeded", async () => {
    const [m] = await db.select({ n: count() }).from(municipalities);
    const [p] = await db.select({ n: count() }).from(provinces);
    expect(m?.n).toBe(8132);
    expect(p?.n).toBe(52);
  });
});
