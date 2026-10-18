import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Terms, LegalDocument } from "@/features/legal";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal");
  return { title: t("terms"), alternates: { canonical: "/terminos" } };
}

export default async function Page() {
  const t = await getTranslations("legal");
  return (
    <LegalDocument title={t("terms")}>
      <Terms />
    </LegalDocument>
  );
}
