import {
  CalendarDaysIcon,
  MailIcon,
  MessageCircleIcon,
  PhoneIcon,
  UserRoundIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

import type { PromoterContact } from "../schemas";

/** Promoter contact details for signed-in visitors (business rule #4). */
export function ContactCard({ contact }: { contact: PromoterContact }) {
  const t = useTranslations("contact");
  const whatsapp = contact.phone ? `https://wa.me/${contact.phone.replace(/\D/g, "")}` : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-primary">
          <UserRoundIcon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{t("promoter")}</p>
          <p className="truncate font-medium">{contact.name}</p>
        </div>
      </div>

      {contact.email && (
        <a
          href={`mailto:${contact.email}`}
          className="flex items-center gap-2 text-sm break-all text-primary underline-offset-4 hover:underline"
        >
          <MailIcon className="size-4 shrink-0" />
          {contact.email}
        </a>
      )}

      <div className="grid gap-2">
        {contact.phone && (
          <>
            <Button asChild size="lg">
              <a href={`tel:${contact.phone}`}>
                <PhoneIcon />
                {t("call", { phone: contact.phone })}
              </a>
            </Button>
            {whatsapp && (
              <Button asChild size="lg" variant="outline">
                <a href={whatsapp} target="_blank" rel="noopener noreferrer">
                  <MessageCircleIcon />
                  {t("whatsapp")}
                </a>
              </Button>
            )}
          </>
        )}
        {contact.bookingUrl && (
          <Button asChild size="lg" variant={contact.phone ? "outline" : "default"}>
            <a href={contact.bookingUrl} target="_blank" rel="noopener noreferrer">
              <CalendarDaysIcon />
              {t("book")}
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
