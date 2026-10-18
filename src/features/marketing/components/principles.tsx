import { HandshakeIcon, LockKeyholeIcon, type LucideIcon, SparklesIcon } from "lucide-react";
import { useTranslations } from "next-intl";

const ITEMS: { key: "direct" | "free" | "privacy"; icon: LucideIcon }[] = [
  { key: "direct", icon: HandshakeIcon },
  { key: "free", icon: SparklesIcon },
  { key: "privacy", icon: LockKeyholeIcon },
];

export function Principles() {
  const t = useTranslations("home.principles");
  return (
    <section className="border-b bg-card">
      <ul className="container-page grid gap-8 py-10 sm:grid-cols-3">
        {ITEMS.map(({ key, icon: Icon }) => (
          <li key={key} className="flex items-start gap-4">
            <Icon className="mt-0.5 size-5 shrink-0 text-highlight-strong" />
            <div>
              <p className="font-medium">{t(`${key}.title`)}</p>
              <p className="text-sm text-muted-foreground">{t(`${key}.body`)}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
