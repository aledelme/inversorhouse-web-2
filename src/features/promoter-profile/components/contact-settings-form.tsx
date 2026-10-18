"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { FieldError } from "@/components/forms/field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import type { ContactSettings, PhoneVisibility } from "../schemas";
import { saveContactSettingsAction } from "../server/actions";

export function ContactSettingsForm({
  initial,
  next,
}: {
  initial: ContactSettings | null;
  /** Where to go after saving (e.g. back to "new opportunity"). */
  next?: Route;
}) {
  const t = useTranslations("profile");
  const tErrors = useTranslations("errors");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [visibility, setVisibility] = useState<PhoneVisibility>(
    initial?.phoneVisibility ?? "public",
  );
  const [bookingUrl, setBookingUrl] = useState(initial?.bookingUrl ?? "");
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      const result = await saveContactSettingsAction({
        phone,
        phoneVisibility: visibility,
        bookingUrl,
      });
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        toast.error(tErrors(result.error === "validation" ? "validation" : "unexpected"));
        return;
      }
      setErrors({});
      toast.success(t("saved"));
      if (next) router.push(next);
      else router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8" noValidate>
      <div className="grid gap-2">
        <Label htmlFor="phone">{t("phone")}</Label>
        <Input
          id="phone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          placeholder="+34 600 000 000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby="phone-hint"
          required
        />
        <p id="phone-hint" className="text-xs text-muted-foreground">
          {t("phoneHint")}
        </p>
        <FieldError messages={errors.phone} />
      </div>

      <fieldset className="grid gap-3">
        <legend className="mb-1 text-sm font-medium">{t("visibility")}</legend>
        <RadioGroup
          value={visibility}
          onValueChange={(value) => setVisibility(value as PhoneVisibility)}
          className="grid gap-3"
        >
          {(["public", "hidden"] as const).map((option) => (
            <Label
              key={option}
              htmlFor={`visibility-${option}`}
              className="flex cursor-pointer items-start gap-3 rounded-lg border bg-card p-4 font-normal has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-accent/50"
            >
              <RadioGroupItem id={`visibility-${option}`} value={option} className="mt-0.5" />
              <span className="space-y-1">
                <span className="block font-medium">{t(`visibilityOptions.${option}.title`)}</span>
                <span className="block text-sm text-muted-foreground">
                  {t(`visibilityOptions.${option}.body`)}
                </span>
              </span>
            </Label>
          ))}
        </RadioGroup>
      </fieldset>

      <div className="grid gap-2">
        <Label htmlFor="bookingUrl">
          {t("bookingUrl")}
          {visibility === "public" && (
            <span className="font-normal text-muted-foreground"> · {t("optional")}</span>
          )}
        </Label>
        <Input
          id="bookingUrl"
          type="url"
          inputMode="url"
          placeholder="https://calendar.app.google/…"
          value={bookingUrl}
          onChange={(e) => setBookingUrl(e.target.value)}
          aria-invalid={Boolean(errors.bookingUrl)}
          aria-describedby="booking-hint"
        />
        <p id="booking-hint" className="text-xs text-muted-foreground">
          {t("bookingUrlHint")}
        </p>
        <FieldError messages={errors.bookingUrl} />
      </div>

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? t("saving") : t("save")}
      </Button>
    </form>
  );
}
