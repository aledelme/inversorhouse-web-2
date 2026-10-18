import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { routes } from "@/config/navigation";

export default function OpportunityNotFound() {
  const t = useTranslations("opportunity.notFound");
  return (
    <div className="container-page flex flex-col items-center gap-4 py-24 text-center">
      <meta name="robots" content="noindex" />
      <h1 className="text-3xl">{t("title")}</h1>
      <p className="max-w-md text-muted-foreground">{t("body")}</p>
      <Button asChild>
        <Link href={routes.search}>{t("cta")}</Link>
      </Button>
    </div>
  );
}
