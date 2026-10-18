import Image from "next/image";
import { useTranslations } from "next-intl";

import { Logo } from "@/components/brand/logo";
import { brand } from "@/config/brand";

/** Split layout: brand panel (desktop) + Clerk widget. */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  const t = useTranslations("home");
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-inverse lg:block">
        <Image src={brand.heroImage} alt="" fill sizes="50vw" className="object-cover opacity-35" />
        <div className="absolute inset-0 bg-linear-to-t from-inverse via-inverse/60 to-transparent" />
        <div className="relative flex h-full flex-col justify-between p-12 text-inverse-foreground">
          <Logo onDark />
          <div className="max-w-md space-y-4">
            <div className="h-px w-12 bg-highlight" />
            <p className="font-display text-3xl leading-tight">{t("title")}</p>
          </div>
        </div>
      </aside>
      <main className="flex flex-col items-center justify-center gap-8 px-4 py-12">
        <div className="lg:hidden">
          <Logo />
        </div>
        {children}
      </main>
    </div>
  );
}
