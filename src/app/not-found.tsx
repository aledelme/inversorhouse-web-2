import Link from "next/link";
import { useTranslations } from "next-intl";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const t = useTranslations("notFound");
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-24 text-center">
      <meta name="robots" content="noindex" />
      <Logo />
      <p className="font-display text-7xl text-highlight">404</p>
      <h1 className="text-3xl">{t("title")}</h1>
      <p className="max-w-md text-muted-foreground">{t("body")}</p>
      <Button asChild>
        <Link href="/">{t("cta")}</Link>
      </Button>
    </main>
  );
}
