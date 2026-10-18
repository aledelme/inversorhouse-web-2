import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Cookies, LegalDocument } from "@/features/legal";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal");
  return { title: t("cookies"), alternates: { canonical: "/cookies" } };
}

export default async function Page() {
  const t = await getTranslations("legal");
  return (
    <LegalDocument title={t("cookies")}>
      <Cookies />
    </LegalDocument>
  );
}
