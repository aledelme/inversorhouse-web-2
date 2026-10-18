import type { MetadataRoute } from "next";

import { listVisibleSlugs } from "@/features/opportunities/server";
import { env } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.NEXT_PUBLIC_SITE_URL;
  const opportunities = await listVisibleSlugs();
  const staticPages = [
    "",
    "/oportunidades",
    "/aviso-legal",
    "/terminos",
    "/privacidad",
    "/cookies",
  ];
  return [
    ...staticPages.map((path) => ({ url: `${base}${path}` })),
    ...opportunities.map((o) => ({
      url: `${base}/oportunidades/${o.slug}`,
      lastModified: o.updatedAt,
    })),
  ];
}
