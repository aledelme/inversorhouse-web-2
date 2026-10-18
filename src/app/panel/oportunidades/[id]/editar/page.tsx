import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/layout/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getCommunities, getProvinces } from "@/features/geo/server";
import { OpportunityForm } from "@/features/opportunities";
import { getEditableOpportunity } from "@/features/opportunities/server";
import { DomainError, isAdmin, requireUserPage } from "@/lib/auth";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("opportunityForm");
  return { title: t("editTitle"), robots: { index: false } };
}

async function loadOrNotFound(actor: { userId: string; isAdmin: boolean }, id: string) {
  try {
    return await getEditableOpportunity(actor, id);
  } catch (error) {
    if (error instanceof DomainError) notFound();
    throw error;
  }
}

export default async function EditOpportunityPage({
  params,
}: PageProps<"/panel/oportunidades/[id]/editar">) {
  const [viewer, { id }] = await Promise.all([requireUserPage(), params]);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const admin = await isAdmin();
  const [editable, communities, provinces, t] = await Promise.all([
    loadOrNotFound({ userId: viewer.userId, isAdmin: admin }, id),
    getCommunities(),
    getProvinces(),
    getTranslations("opportunityForm"),
  ]);

  if (editable.status === "removed" && !admin) {
    return (
      <>
        <PageHeader title={t("editTitle")} />
        <Alert variant="destructive">
          <AlertDescription>{t("removedNotice")}</AlertDescription>
        </Alert>
      </>
    );
  }

  return (
    <>
      <PageHeader title={t("editTitle")} description={t("editDescription")} />
      <OpportunityForm
        mode="edit"
        opportunityId={editable.id}
        initial={editable.input}
        initialLocation={editable.location}
        communities={communities}
        provinces={provinces}
      />
    </>
  );
}
