import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { getCommunities, getProvinces } from "@/features/geo/server";
import { OpportunityForm } from "@/features/opportunities";
import { hasPhone } from "@/features/promoter-profile/server";
import { isAdmin, requireUserPage } from "@/lib/auth";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("opportunityForm");
  return { title: t("createTitle"), robots: { index: false } };
}

async function NewOpportunityPageContent() {
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

/**
 * Reads the session/DB at request time: streamed inside the page's own <Suspense> so
 * navigations between sibling pages stay instant (loading.tsx doesn't cover them).
 */
export default function NewOpportunityPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <NewOpportunityPageContent />
    </Suspense>
  );
}
