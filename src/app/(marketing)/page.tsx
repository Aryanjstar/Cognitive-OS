export const revalidate = 3600;

import { Hero } from "@/components/landing/hero";
import { ProblemSection } from "@/components/landing/problem-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FeaturesSection } from "@/components/landing/features-section";
import { ResearchSection } from "@/components/landing/research-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { GuideSection } from "@/components/landing/guide-section";
import { CTASection } from "@/components/landing/cta-section";
import { getTrackerSummary } from "@/lib/github-tracker";

export default async function HomePage() {
  const summary = await getTrackerSummary().catch(() => null);
  const trackedCount = summary?.totalTracked ?? 0;
  const avgProductivityGain = summary?.avgProductivityGain ?? 0;

  return (
    <>
      <Hero />
      <ProblemSection />
      <HowItWorks />
      <FeaturesSection />
      <ResearchSection
        trackedCount={trackedCount}
        avgProductivityGain={avgProductivityGain}
        avgTimeSavings={summary?.avgTimeSavingsPerMonth ?? 0}
      />
      <PricingSection />
      <GuideSection />
      <CTASection />
    </>
  );
}
