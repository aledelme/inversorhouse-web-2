import { HeadObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import { db } from "@/db/client";
import { opportunities, opportunityDocuments, opportunityImages } from "@/db/schema";
import { env } from "@/lib/env";
import { createStorageClient } from "@/lib/storage/create-client";

import { createUser } from "../../../../tests/factories/db";
import { buildOpportunityInput } from "../../../../tests/factories/opportunity-input";

import {
  adminRemove,
  createOpportunity,
  getEditableOpportunity,
  setStatusByOwner,
  updateOpportunity,
} from "./service";

describe("createOpportunity", () => {
  it("stores sanitised content, location codes and files", async () => {
    const promoter = await createUser();
    const actor = { userId: promoter.id, isAdmin: false };
    const created = await createOpportunity(
      actor,
      buildOpportunityInput({
        images: [{ key: `u/${promoter.id}/a.webp`, width: 800, height: 600 }],
        documents: [
          {
            key: `u/${promoter.id}/b.pdf`,
            fileName: "nota.pdf",
            size: 100,
            contentType: "application/pdf",
          },
        ],
      }),
    );
    const [row] = await db.select().from(opportunities).where(eq(opportunities.id, created.id));
    expect(row).toMatchObject({
      provinceCode: "29",
      communityCode: "01",
      isFeatured: false,
      status: "published",
    });
    expect(row!.descriptionText).toContain("Vivienda de 90 m²");
    expect(created.slug).toMatch(/^piso-para-reformar-en-el-centro-de-malaga-[a-f0-9]{6}$/);
    expect(await db.select().from(opportunityImages)).toHaveLength(1);
    expect(await db.select().from(opportunityDocuments)).toHaveLength(1);
  });

  it("features opportunities published by admins (rule #11)", async () => {
    const admin = await createUser();
    const created = await createOpportunity(
      { userId: admin.id, isAdmin: true },
      buildOpportunityInput(),
    );
    const [row] = await db.select().from(opportunities).where(eq(opportunities.id, created.id));
    expect(row!.isFeatured).toBe(true);
  });

  it("rejects upload keys that belong to someone else", async () => {
    const promoter = await createUser();
    await expect(
      createOpportunity(
        { userId: promoter.id, isAdmin: false },
        buildOpportunityInput({ images: [{ key: "u/someone-else/a.webp", width: 1, height: 1 }] }),
      ),
    ).rejects.toMatchObject({ code: "invalidUpload" });
  });

  it("rejects unknown municipalities", async () => {
    const promoter = await createUser();
    await expect(
      createOpportunity(
        { userId: promoter.id, isAdmin: false },
        buildOpportunityInput({ municipalityCode: "99999" }),
      ),
    ).rejects.toMatchObject({ code: "municipalityRequired" });
  });
});

describe("ownership and moderation (rule #6)", () => {
  it("only the owner or an admin can edit", async () => {
    const owner = await createUser();
    const stranger = await createUser();
    const { id } = await createOpportunity(
      { userId: owner.id, isAdmin: false },
      buildOpportunityInput(),
    );

    await expect(
      updateOpportunity({ userId: stranger.id, isAdmin: false }, id, buildOpportunityInput()),
    ).rejects.toMatchObject({ code: "notFound" });
    await expect(
      getEditableOpportunity({ userId: stranger.id, isAdmin: false }, id),
    ).rejects.toMatchObject({
      code: "notFound",
    });

    const admin = await createUser();
    await updateOpportunity(
      { userId: admin.id, isAdmin: true },
      id,
      buildOpportunityInput({ title: "Título corregido por moderación" }),
    );
    const editable = await getEditableOpportunity({ userId: owner.id, isAdmin: false }, id);
    expect(editable.input.title).toBe("Título corregido por moderación");
  });

  it("keeps existing files when an admin edits someone else's listing", async () => {
    const owner = await createUser();
    const images = [{ key: `u/${owner.id}/a.webp`, width: 1, height: 1 }];
    const { id } = await createOpportunity(
      { userId: owner.id, isAdmin: false },
      buildOpportunityInput({ images }),
    );
    const admin = await createUser();
    await expect(
      updateOpportunity({ userId: admin.id, isAdmin: true }, id, buildOpportunityInput({ images })),
    ).resolves.toMatchObject({ id });
  });

  it("deletes files dropped in an edit from storage and keeps the rest", async () => {
    const owner = await createUser();
    const actor = { userId: owner.id, isAdmin: false };
    const prefix = `u/${owner.id}/`;
    const s3 = createStorageClient({
      endpoint: env.R2_ENDPOINT,
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    });
    const bucket = env.R2_PRIVATE_BUCKET;
    const exists = (key: string) =>
      s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key })).then(
        () => true,
        () => false,
      );
    const doc = (name: string) => ({
      key: `${prefix}${name}.pdf`,
      fileName: `${name}.pdf`,
      size: 1,
      contentType: "application/pdf",
    });
    for (const name of ["kept", "dropped"]) {
      await s3.send(
        new PutObjectCommand({ Bucket: bucket, Key: `${prefix}${name}.pdf`, Body: "x" }),
      );
    }
    const { id } = await createOpportunity(
      actor,
      buildOpportunityInput({ documents: [doc("kept"), doc("dropped")] }),
    );

    await updateOpportunity(actor, id, buildOpportunityInput({ documents: [doc("kept")] }));

    expect(await exists(`${prefix}kept.pdf`)).toBe(true);
    expect(await exists(`${prefix}dropped.pdf`)).toBe(false);
  });

  it("owners can withdraw and republish, but not undo an admin removal", async () => {
    const owner = await createUser();
    const actor = { userId: owner.id, isAdmin: false };
    const { id } = await createOpportunity(actor, buildOpportunityInput());

    await setStatusByOwner(actor, id, "withdrawn");
    await setStatusByOwner(actor, id, "published");
    await adminRemove(id, "Contenido engañoso");

    await expect(setStatusByOwner(actor, id, "published")).rejects.toMatchObject({
      code: "removedByAdmin",
    });
    await expect(updateOpportunity(actor, id, buildOpportunityInput())).rejects.toMatchObject({
      code: "removedByAdmin",
    });
  });
});
