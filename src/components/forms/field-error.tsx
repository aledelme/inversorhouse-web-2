"use client";

import { useTranslations } from "next-intl";

/**
 * Shows the first validation message. Schema messages are keys under `errors.*`;
 * unknown keys (e.g. Zod defaults) fall back to the generic "invalid" message.
 */
export function FieldError({ messages }: { messages?: string[] }) {
  const t = useTranslations("errors");
  const key = messages?.[0];
  if (!key) return null;
  return (
    <p role="alert" className="text-sm text-destructive">
      {t.has(key as never) ? t(key as never) : t("invalid")}
    </p>
  );
}
