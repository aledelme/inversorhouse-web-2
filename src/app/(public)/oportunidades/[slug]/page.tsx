import { ArrowLeftIcon, MapPinIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { RichTextView } from "@/components/rich-text/rich-text-view";
import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/config/navigation";
import { FeaturedBadge, Gallery, KeyFigures, TypeBadge } from "@/features/opportunities";
import { getPublicOpportunity } from "@/features/opportunities/server";
import { formatDate } from "@/lib/format";
import { formatPlace } from "@/lib/utils/place";

import { ContactSection, DocumentsSection } from "./contact-section";

type Params = PageProps<"/oportunidades/[slug]">["params"];

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const [opportunity, t] = await Promise.all([
    getPublicOpportunity(slug),
    getTranslations("opportunity"),
  ]);
  if (!opportunity) return { title: t("notFound.title"), robots: { index: false } };
  return {
    title: opportunity.title,
    description: opportunity.excerpt,
    alternates: { canonical: `/oportunidades/${slug}` },
    openGraph: {
      title: opportunity.title,
      description: opportunity.excerpt,
      images: opportunity.coverImageUrl ? [{ url: opportunity.coverImageUrl }] : undefined,
    },
  };
}

export default function OpportunityPage({ params }: PageProps<"/oportunidades/[slug]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <OpportunityDetail params={params} />
    </Suspense>
  );
}

async function OpportunityDetail({ params }: { params: Params }) {
  const { slug } = await params;
  const [o, t, tContact] = await Promise.all([
    getPublicOpportunity(slug),
    getTranslations("opportunity"),
    getTranslations("contact"),
  ]);
  if (!o) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: o.title,
    description: o.excerpt,
    datePosted: o.publishedAt.toISOString(),
    image: o.images.map((i) => i.url),
    contentLocation: { "@type": "Place", name: `${o.municipality}, ${o.province}` },
  };

  return (
    <article className="container-page py-8 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Link
        href={routes.search}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        {t("backToSearch")}
      </Link>

      <header className="mb-8 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <TypeBadge type={o.type} className="bg-secondary shadow-none" />
          {o.isFeatured && <FeaturedBadge />}
        </div>
        <h1 className="max-w-4xl text-3xl leading-tight wrap-break-word sm:text-5xl">{o.title}</h1>
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MapPinIcon className="size-4" />
            {formatPlace(o.municipality, o.province)} · {o.community}
          </span>
          <span>{t("publishedAt", { date: formatDate(o.publishedAt) })}</span>
        </p>
      </header>

      <Gallery images={o.images} title={o.title} />

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-10">
          <section className="space-y-4">
            <h2 className="text-2xl">{t("description")}</h2>
            <RichTextView doc={o.description} />
          </section>
          <Suspense fallback={<Skeleton className="h-24 w-full" />}>
            <DocumentsSection opportunityId={o.id} documentCount={o.documentCount} />
          </Suspense>
        </div>

        {/* On mobile the key figures and contact come right after the gallery. */}
        <aside className="max-lg:order-first lg:row-span-2">
          <div className="space-y-6 lg:sticky lg:top-24">
            <div className="rounded-2xl border bg-card p-6 shadow-soft">
              <KeyFigures opportunity={o} />
            </div>
            <div className="rounded-2xl border bg-card p-6 shadow-soft">
              <h2 className="mb-5 text-xl">{tContact("title")}</h2>
              <Suspense fallback={<Skeleton className="h-48 w-full" />}>
                <ContactSection
                  opportunityId={o.id}
                  promoterUserId={o.promoterUserId}
                  slug={o.slug}
                />
              </Suspense>
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}

function DetailSkeleton() {
  return (
    <div className="container-page space-y-6 py-12">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-12 w-3/4" />
      <Skeleton className="aspect-[16/9] w-full rounded-2xl" />
    </div>
  );
}
