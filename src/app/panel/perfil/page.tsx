import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/layout/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ContactSettingsForm } from "@/features/promoter-profile";
import { getContactSettings } from "@/features/promoter-profile/server";
import { requireUserPage } from "@/lib/auth";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("profile");
  return { title: t("title"), robots: { index: false } };
}

export default async function ProfilePage({ searchParams }: PageProps<"/panel/perfil">) {
  const [viewer, { next }, t] = await Promise.all([
    requireUserPage(),
    searchParams,
    getTranslations("profile"),
  ]);
  const settings = await getContactSettings(viewer.clerkUserId);
  const comingFromPublish = next === "nueva";

  return (
    <div className="max-w-2xl">
      <PageHeader title={t("title")} description={t("description")} />
      {comingFromPublish && (
        <Alert className="mb-8 border-highlight/60 bg-highlight/10">
          <AlertDescription>{t("phoneRequiredNotice")}</AlertDescription>
        </Alert>
      )}
      <ContactSettingsForm
        initial={settings}
        next={comingFromPublish ? "/panel/oportunidades/nueva" : undefined}
      />
    </div>
  );
}
