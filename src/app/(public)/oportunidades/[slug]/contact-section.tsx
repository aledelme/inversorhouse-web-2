import { FileTextIcon, LockKeyholeIcon, PencilIcon } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { routes } from "@/config/navigation";
import { InterestButton } from "@/features/interests";
import { hasInterest } from "@/features/interests/server";
import {
  getPromoterClerkId,
  listDocuments,
  withdrawAllForPromoter,
} from "@/features/opportunities/server";
import { ContactCard } from "@/features/promoter-profile";
import { getPromoterContact } from "@/features/promoter-profile/server";
import { ReportDialog } from "@/features/reports";
import { getViewer } from "@/lib/auth";

type Props = { opportunityId: string; promoterUserId: string; slug: string };

async function LockedContact({ slug }: { slug: string }) {
  const t = await getTranslations("contact");
  const returnTo = encodeURIComponent(`/oportunidades/${slug}`);
  return (
    <div className="space-y-4 text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
        <LockKeyholeIcon className="size-5" />
      </span>
      <div className="space-y-1">
        <p className="font-display text-xl">{t("lockedTitle")}</p>
        <p className="text-sm text-muted-foreground">{t("lockedBody")}</p>
      </div>
      <div className="grid gap-2">
        <Button asChild size="lg">
          <a href={`${routes.signUp}?redirect_url=${returnTo}`}>{t("lockedCta")}</a>
        </Button>
        <Button asChild size="lg" variant="ghost">
          <a href={`${routes.signIn}?redirect_url=${returnTo}`}>{t("lockedSignIn")}</a>
        </Button>
      </div>
    </div>
  );
}

/** Session-dependent: render inside <Suspense>. Never cached (contains PII). */
export async function ContactSection({ opportunityId, promoterUserId, slug }: Props) {
  const viewer = await getViewer();
  if (!viewer) return <LockedContact slug={slug} />;

  const t = await getTranslations("contact");
  const clerkUserId = await getPromoterClerkId(promoterUserId);
  const contact = clerkUserId ? await getPromoterContact(clerkUserId) : "deleted";
  if (contact === "deleted") {
    // Business rule #8: the promoter account is gone.
    await withdrawAllForPromoter(promoterUserId);
    return <p className="text-sm text-muted-foreground">{t("unavailable")}</p>;
  }

  const isOwner = viewer.userId === promoterUserId;
  const interested = isOwner ? false : await hasInterest(viewer.userId, opportunityId);

  return (
    <div className="space-y-6">
      <ContactCard contact={contact} />
      {isOwner ? (
        <div className="space-y-2 rounded-lg bg-secondary p-4 text-sm">
          <p>{t("ownListing")}</p>
          <Button asChild variant="outline" size="sm">
            <Link href={`/panel/oportunidades/${opportunityId}/editar`}>
              <PencilIcon />
              {t("edit")}
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <InterestButton opportunityId={opportunityId} initialInterested={interested} />
          <div className="flex justify-center">
            <ReportDialog opportunityId={opportunityId} />
          </div>
        </>
      )}
    </div>
  );
}

/** Document list for signed-in users; a teaser otherwise. */
export async function DocumentsSection({
  opportunityId,
  documentCount,
}: {
  opportunityId: string;
  documentCount: number;
}) {
  const t = await getTranslations("opportunity");
  if (documentCount === 0) return null;
  const viewer = await getViewer();
  const documents = viewer ? await listDocuments(opportunityId) : [];

  return (
    <section className="space-y-4">
      <h2 className="text-2xl">{t("documents")}</h2>
      {viewer ? (
        <ul className="divide-y rounded-xl border bg-card">
          {documents.map((doc) => (
            <li key={doc.id}>
              <a
                href={`/api/documents/${doc.id}`}
                className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-accent/50"
              >
                <FileTextIcon className="size-4 shrink-0 text-highlight-strong" />
                <span className="min-w-0 flex-1 truncate font-medium">{doc.fileName}</span>
                <span className="text-xs text-muted-foreground">{t("download")}</span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="flex items-center gap-2 rounded-xl border border-dashed bg-card px-4 py-4 text-sm text-muted-foreground">
          <LockKeyholeIcon className="size-4" />
          {t("documentsTeaser", { count: documentCount })} · {t("documentsLocked")}
        </p>
      )}
    </section>
  );
}
