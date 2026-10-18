import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Privacy, LegalDocument } from "@/features/legal";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal");
  return { title: t("privacy"), alternates: { canonical: "/privacidad" } };
}

export default async function Page() {
  const t = await getTranslations("legal");
  return (
    <LegalDocument title={t("privacy")}>
      <Privacy />
    </LegalDocument>
  );
}
