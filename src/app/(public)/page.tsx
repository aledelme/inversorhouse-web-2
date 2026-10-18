import { getProvinces } from "@/features/geo/server";
import { Hero, HowItWorks, OperationTypes, Principles, PromoterCta } from "@/features/marketing";
import { FeaturedSection, LatestSection } from "@/features/marketing/server";

export default async function HomePage() {
  const provinces = await getProvinces();
  return (
    <>
      <Hero provinces={provinces} />
      <Principles />
      <FeaturedSection />
      <LatestSection />
      <OperationTypes />
      <HowItWorks />
      <PromoterCta />
    </>
  );
}
