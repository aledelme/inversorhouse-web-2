import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { LegalNotice, LegalDocument } from "@/features/legal";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal");
  return { title: t("legalNotice"), alternates: { canonical: "/aviso-legal" } };
}

export default async function Page() {
  const t = await getTranslations("legal");
  return (
    <LegalDocument title={t("legalNotice")}>
      <LegalNotice />
    </LegalDocument>
  );
}
