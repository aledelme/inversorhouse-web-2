import { db } from "@/db/client";
import { type NewOpportunity, opportunities, users } from "@/db/schema";

let counter = 0;
const next = () => ++counter;

/** Inserts a local user (no PII — just a fake Clerk id). */
export async function createUser(overrides: Partial<typeof users.$inferInsert> = {}) {
  const [user] = await db
    .insert(users)
    .values({ clerkUserId: `user_test_${next()}_${Date.now()}`, ...overrides })
    .returning();
  return user!;
}

/** Inserts a published opportunity in Málaga (29067) with sensible defaults. */
export async function createOpportunityRow(
  promoterId: string,
  overrides: Partial<NewOpportunity> = {},
) {
  const n = next();
  const [row] = await db
    .insert(opportunities)
    .values({
      slug: `oportunidad-${n}-${Date.now()}`,
      promoterId,
      type: "CRV",
      title: `Oportunidad de prueba ${n}`,
      description: { type: "doc", content: [] },
      descriptionText: "Descripción de prueba",
      amountToRaise: 100_000,
      minTicket: 10_000,
      termMonths: 12,
      returnKind: "fixed",
      returnNominalMin: 12,
      returnNominalMax: 12,
      returnAnnualMin: 12,
      returnAnnualMax: 12,
      municipalityCode: "29067",
      provinceCode: "29",
      communityCode: "01",
      ...overrides,
    })
    .returning();
  return row!;
}
