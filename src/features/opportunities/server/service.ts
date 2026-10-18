import "server-only";

import { and, count, desc, eq, inArray, sql } from "drizzle-orm";

import { sanitizeRichText } from "@/components/rich-text/sanitize";
import { db } from "@/db/client";
import {
  municipalities,
  opportunities,
  opportunityDocuments,
  opportunityImages,
  opportunityInterests,
  provinces,
  users,
} from "@/db/schema";
import { DomainError } from "@/lib/auth/errors";
import { slugify } from "@/lib/utils/slugify";

import {
  closesOnToDate,
  type OpportunityData,
  type OpportunityInput,
  opportunityInputSchema,
} from "../schemas";

/** Who performs a mutation. `isAdmin` comes from requireAdmin/isAdmin, never from the client. */
export type Actor = { userId: string; isAdmin: boolean };

const ownsKey = (key: string, userId: string) =>
  key.startsWith(`u/${userId}/`) && !key.includes("..");

async function resolveLocation(municipalityCode: string) {
  const [row] = await db
    .select({ provinceCode: provinces.code, communityCode: provinces.communityCode })
    .from(municipalities)
    .innerJoin(provinces, eq(provinces.code, municipalities.provinceCode))
    .where(eq(municipalities.code, municipalityCode));
  if (!row) throw new DomainError("municipalityRequired");
  return row;
}

function randomSuffix() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 6);
}

export function buildSlug(title: string) {
  return `${slugify(title).slice(0, 70).replace(/-+$/, "")}-${randomSuffix()}`;
}

/** Validated, sanitised column values shared by create and update. */
async function toColumns(data: OpportunityData) {
  let description: { doc: Record<string, unknown>; text: string };
  try {
    description = sanitizeRichText(data.description);
  } catch {
    throw new DomainError("descriptionInvalid");
  }
  const location = await resolveLocation(data.municipalityCode);
  return {
    type: data.type,
    title: data.title,
    description: description.doc,
    descriptionText: description.text,
    amountToRaise: data.amountToRaise,
    minTicket: data.minTicket,
    termMonths: data.termMonths,
    closesAt: closesOnToDate(data.closesOn),
    returnKind: data.returnKind,
    returnNominalMin: data.returnNominalMin,
    returnNominalMax: data.returnNominalMax,
    returnAnnualMin: data.returnAnnualMin,
    returnAnnualMax: data.returnAnnualMax,
    municipalityCode: data.municipalityCode,
    provinceCode: location.provinceCode,
    communityCode: location.communityCode,
  };
}

/** New keys must belong to the actor; keys already attached to the opportunity are kept as-is. */
function assertKeys(data: OpportunityData, actor: Actor, existingKeys: Set<string>) {
  for (const { key } of [...data.images, ...data.documents]) {
    if (!existingKeys.has(key) && !ownsKey(key, actor.userId)) {
      throw new DomainError("invalidUpload");
    }
  }
}

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

async function replaceFiles(tx: Tx, opportunityId: string, data: OpportunityData) {
  await tx.delete(opportunityImages).where(eq(opportunityImages.opportunityId, opportunityId));
  await tx
    .delete(opportunityDocuments)
    .where(eq(opportunityDocuments.opportunityId, opportunityId));
  if (data.images.length) {
    await tx.insert(opportunityImages).values(
      data.images.map((image, position) => ({
        opportunityId,
        storageKey: image.key,
        position,
        width: image.width,
        height: image.height,
      })),
    );
  }
  if (data.documents.length) {
    await tx.insert(opportunityDocuments).values(
      data.documents.map((doc) => ({
        opportunityId,
        storageKey: doc.key,
        fileName: doc.fileName,
        sizeBytes: doc.size,
        contentType: doc.contentType,
      })),
    );
  }
}

export async function createOpportunity(actor: Actor, input: OpportunityInput) {
  const data = opportunityInputSchema.parse(input);
  assertKeys(data, actor, new Set());
  const columns = await toColumns(data);
  const slug = buildSlug(data.title);

  return db.transaction(async (tx) => {
    const [created] = await tx
      .insert(opportunities)
      .values({
        ...columns,
        slug,
        promoterId: actor.userId,
        // Business rule #11: admin-published opportunities are featured.
        isFeatured: actor.isAdmin,
      })
      .returning({ id: opportunities.id, slug: opportunities.slug });
    await replaceFiles(tx, created!.id, data);
    return created!;
  });
}

/** Loads an opportunity the actor may manage (owner, or any for admins). */
async function loadManageable(actor: Actor, id: string) {
  const [row] = await db.select().from(opportunities).where(eq(opportunities.id, id));
  if (!row || (!actor.isAdmin && row.promoterId !== actor.userId))
    throw new DomainError("notFound");
  return row;
}

export async function updateOpportunity(actor: Actor, id: string, input: OpportunityInput) {
  const current = await loadManageable(actor, id);
  if (current.status === "removed" && !actor.isAdmin) throw new DomainError("removedByAdmin");

  const data = opportunityInputSchema.parse(input);
  const [images, documents] = await Promise.all([
    db
      .select({ key: opportunityImages.storageKey })
      .from(opportunityImages)
      .where(eq(opportunityImages.opportunityId, id)),
    db
      .select({ key: opportunityDocuments.storageKey })
      .from(opportunityDocuments)
      .where(eq(opportunityDocuments.opportunityId, id)),
  ]);
  assertKeys(data, actor, new Set([...images, ...documents].map((r) => r.key)));
  const columns = await toColumns(data);

  await db.transaction(async (tx) => {
    await tx.update(opportunities).set(columns).where(eq(opportunities.id, id));
    await replaceFiles(tx, id, data);
  });
  return { id, slug: current.slug };
}

/** Promoter withdraws / republishes their own listing (business rule #6). */
export async function setStatusByOwner(
  actor: Actor,
  id: string,
  status: "published" | "withdrawn",
) {
  const current = await loadManageable(actor, id);
  if (current.status === "removed") throw new DomainError("removedByAdmin");
  await db.update(opportunities).set({ status }).where(eq(opportunities.id, id));
  return { id, slug: current.slug };
}

/** Business rule #8: the promoter's Clerk account no longer exists. */
export async function withdrawAllForPromoter(userId: string) {
  await db
    .update(opportunities)
    .set({ status: "withdrawn" })
    .where(and(eq(opportunities.promoterId, userId), eq(opportunities.status, "published")));
}

// --- Admin operations (callers must have checked requireAdmin) -----------------------------

export async function adminRemove(id: string, reason: string) {
  const [row] = await db
    .update(opportunities)
    .set({ status: "removed", removedReason: reason })
    .where(eq(opportunities.id, id))
    .returning({ id: opportunities.id, slug: opportunities.slug });
  if (!row) throw new DomainError("notFound");
  return row;
}

export async function adminRestore(id: string) {
  const [row] = await db
    .update(opportunities)
    .set({ status: "published", removedReason: null })
    .where(eq(opportunities.id, id))
    .returning({ id: opportunities.id, slug: opportunities.slug });
  if (!row) throw new DomainError("notFound");
  return row;
}

export async function adminSetFeatured(id: string, isFeatured: boolean) {
  const [row] = await db
    .update(opportunities)
    .set({ isFeatured })
    .where(eq(opportunities.id, id))
    .returning({ id: opportunities.id, slug: opportunities.slug });
  if (!row) throw new DomainError("notFound");
  return row;
}

// --- Owner / admin reads (request-time, uncached) -------------------------------------------

export async function listOwnOpportunities(userId: string) {
  const rows = await db
    .select({
      id: opportunities.id,
      slug: opportunities.slug,
      title: opportunities.title,
      type: opportunities.type,
      status: opportunities.status,
      removedReason: opportunities.removedReason,
      closesAt: opportunities.closesAt,
      isClosed: sql<boolean>`coalesce(${opportunities.closesAt} < now(), false)`,
      publishedAt: opportunities.publishedAt,
      isFeatured: opportunities.isFeatured,
      municipality: municipalities.name,
    })
    .from(opportunities)
    .innerJoin(municipalities, eq(municipalities.code, opportunities.municipalityCode))
    .where(eq(opportunities.promoterId, userId))
    .orderBy(desc(opportunities.createdAt));

  const ids = rows.map((r) => r.id);
  const counts = ids.length
    ? await db
        .select({ opportunityId: opportunityInterests.opportunityId, n: count() })
        .from(opportunityInterests)
        .where(inArray(opportunityInterests.opportunityId, ids))
        .groupBy(opportunityInterests.opportunityId)
    : [];
  const byId = new Map(counts.map((c) => [c.opportunityId, c.n]));
  return rows.map((row) => ({ ...row, interestCount: byId.get(row.id) ?? 0 }));
}

/** Everything the edit form needs, as an OpportunityInput. */
export async function getEditableOpportunity(actor: Actor, id: string) {
  const row = await loadManageable(actor, id);
  const [images, documents] = await Promise.all([
    db
      .select()
      .from(opportunityImages)
      .where(eq(opportunityImages.opportunityId, id))
      .orderBy(opportunityImages.position),
    db.select().from(opportunityDocuments).where(eq(opportunityDocuments.opportunityId, id)),
  ]);
  const [province] = await db
    .select({ communityCode: provinces.communityCode })
    .from(provinces)
    .where(eq(provinces.code, row.provinceCode));
  const input: OpportunityInput = {
    type: row.type,
    title: row.title,
    description: row.description,
    amountToRaise: row.amountToRaise,
    minTicket: row.minTicket,
    termMonths: row.termMonths,
    closesOn: row.closesAt ? row.closesAt.toISOString().slice(0, 10) : null,
    returnKind: row.returnKind,
    returnNominalMin: row.returnNominalMin,
    returnNominalMax: row.returnNominalMax,
    returnAnnualMin: row.returnAnnualMin,
    returnAnnualMax: row.returnAnnualMax,
    municipalityCode: row.municipalityCode,
    images: images.map((i) => ({ key: i.storageKey, width: i.width, height: i.height })),
    documents: documents.map((d) => ({
      key: d.storageKey,
      fileName: d.fileName,
      size: d.sizeBytes,
      contentType: d.contentType,
    })),
  };
  return {
    id: row.id,
    slug: row.slug,
    status: row.status,
    location: {
      community: province?.communityCode,
      province: row.provinceCode,
      municipality: row.municipalityCode,
    },
    input,
  };
}

export async function listDocuments(opportunityId: string) {
  return db
    .select({
      id: opportunityDocuments.id,
      fileName: opportunityDocuments.fileName,
      sizeBytes: opportunityDocuments.sizeBytes,
    })
    .from(opportunityDocuments)
    .where(eq(opportunityDocuments.opportunityId, opportunityId))
    .orderBy(opportunityDocuments.createdAt);
}

export async function getDocument(id: string) {
  const [row] = await db
    .select({
      storageKey: opportunityDocuments.storageKey,
      fileName: opportunityDocuments.fileName,
      opportunityId: opportunityDocuments.opportunityId,
    })
    .from(opportunityDocuments)
    .where(eq(opportunityDocuments.id, id));
  return row ?? null;
}

export async function getPromoterClerkId(userId: string) {
  const [row] = await db
    .select({ clerkUserId: users.clerkUserId })
    .from(users)
    .where(eq(users.id, userId));
  return row?.clerkUserId ?? null;
}
