import { MailIcon } from "lucide-react";
import type { Route } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Logo } from "@/components/brand/logo";
import { InstagramIcon, LinkedinIcon } from "@/components/brand/social-icons";
import { brand } from "@/config/brand";
import { routes } from "@/config/navigation";

/** Cached so reading the clock doesn't make the shell dynamic. */
async function CurrentYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

function FooterLink({ href, children }: { href: Route; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="text-sm text-inverse-foreground/70 transition-colors hover:text-inverse-foreground"
      >
        {children}
      </Link>
    </li>
  );
}

export function SiteFooter() {
  const t = useTranslations();
  return (
    <footer className="mt-auto bg-inverse text-inverse-foreground">
      <div className="container-page grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="space-y-5">
          <Logo onDark />
          <p className="max-w-xs text-sm leading-relaxed text-inverse-foreground/70">
            {t("footer.about")}
          </p>
          <div className="h-px w-12 bg-highlight" />
        </div>
        <div>
          <h2 className="mb-4 font-sans eyebrow text-highlight">{t("footer.platform")}</h2>
          <ul className="space-y-3">
            <FooterLink href={routes.search}>{t("nav.opportunities")}</FooterLink>
            <FooterLink href={routes.publish}>{t("common.publish")}</FooterLink>
            <FooterLink href="/#como-funciona">{t("nav.howItWorks")}</FooterLink>
          </ul>
        </div>
        <div>
          <h2 className="mb-4 font-sans eyebrow text-highlight">{t("footer.legal")}</h2>
          <ul className="space-y-3">
            <FooterLink href="/aviso-legal">{t("footer.legalNotice")}</FooterLink>
            <FooterLink href="/terminos">{t("footer.terms")}</FooterLink>
            <FooterLink href="/privacidad">{t("footer.privacy")}</FooterLink>
            <FooterLink href="/cookies">{t("footer.cookies")}</FooterLink>
          </ul>
        </div>
        <div>
          <h2 className="mb-4 font-sans eyebrow text-highlight">{t("footer.contact")}</h2>
          <ul className="space-y-3 text-sm text-inverse-foreground/70">
            <li>
              <a
                href={`mailto:${brand.email}`}
                className="inline-flex items-center gap-2 hover:text-inverse-foreground"
              >
                <MailIcon className="size-4" /> {brand.email}
              </a>
            </li>
            <li className="flex gap-3 pt-1">
              <a
                href={brand.social.instagram}
                aria-label="Instagram"
                className="hover:text-inverse-foreground"
                target="_blank"
                rel="noopener noreferrer"
              >
                <InstagramIcon className="size-5" />
              </a>
              <a
                href={brand.social.linkedin}
                aria-label="LinkedIn"
                className="hover:text-inverse-foreground"
                target="_blank"
                rel="noopener noreferrer"
              >
                <LinkedinIcon className="size-5" />
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-inverse-foreground/10">
        <div className="container-page space-y-4 py-8 text-xs leading-relaxed text-inverse-foreground/55">
          <p className="max-w-4xl">{t("footer.disclaimer")}</p>
          <p>
            © <CurrentYear /> {brand.name}. {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
