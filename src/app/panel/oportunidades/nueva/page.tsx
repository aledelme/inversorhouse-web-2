import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/layout/page-header";
import { getCommunities, getProvinces } from "@/features/geo/server";
import { OpportunityForm } from "@/features/opportunities";
import { hasPhone } from "@/features/promoter-profile/server";
import { isAdmin, requireUserPage } from "@/lib/auth";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("opportunityForm");
  return { title: t("createTitle"), robots: { index: false } };
}

export default async function NewOpportunityPage() {
  const viewer = await requireUserPage();
  // Business rule #3: a phone is required before publishing.
  if (!(await hasPhone(viewer.clerkUserId))) redirect("/panel/perfil?next=nueva");

  const [communities, provinces, admin, t] = await Promise.all([
    getCommunities(),
    getProvinces(),
    isAdmin(),
    getTranslations("opportunityForm"),
  ]);

  return (
    <>
      <PageHeader
        title={t("createTitle")}
        description={admin ? t("createAsAdmin") : t("createDescription")}
      />
      <OpportunityForm mode="create" communities={communities} provinces={provinces} />
    </>
  );
}
