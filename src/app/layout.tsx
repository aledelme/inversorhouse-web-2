import "./globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import { esES } from "@clerk/localizations";
import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { brand } from "@/config/brand";
import { fontDisplay, fontSans } from "@/config/fonts";
import { routes } from "@/config/navigation";
import { defaultLocale, localeTags } from "@/i18n/config";
import { env } from "@/lib/env";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  return {
    metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
    title: { default: t("title"), template: t("titleTemplate") },
    description: t("description"),
    applicationName: brand.name,
    openGraph: {
      type: "website",
      siteName: brand.name,
      locale: localeTags[defaultLocale].replace("-", "_"),
    },
    twitter: { card: "summary_large_image" },
  };
}

export const viewport: Viewport = { themeColor: brand.themeColor };

const clerkAppearance = {
  variables: {
    colorPrimary: brand.themeColor,
    fontFamily: "var(--font-inter), system-ui, sans-serif",
    borderRadius: "0.625rem",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider
      localization={esES}
      appearance={clerkAppearance}
      signInUrl={routes.signIn}
      signUpUrl={routes.signUp}
    >
      <html
        lang={localeTags[defaultLocale]}
        className={cn(fontSans.variable, fontDisplay.variable)}
        data-scroll-behavior="smooth"
      >
        <body className="flex min-h-dvh flex-col">
          <NextIntlClientProvider>
            <NuqsAdapter>
              <TooltipProvider>{children}</TooltipProvider>
            </NuqsAdapter>
            <Toaster position="top-center" richColors />
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
