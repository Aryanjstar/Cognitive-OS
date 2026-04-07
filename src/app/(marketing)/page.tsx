export const revalidate = 3600;

import { Hero } from "@/components/landing/hero";
import { ProblemSection } from "@/components/landing/problem-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FeaturesSection } from "@/components/landing/features-section";
import { ResearchSection } from "@/components/landing/research-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { GuideSection } from "@/components/landing/guide-section";
import { CTASection } from "@/components/landing/cta-section";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const [trackedCount, avgProductivityGain] = await Promise.all([
    prisma.trackedDeveloper.count({ where: { isActive: true } }).catch(() => 0),
    prisma.activitySnapshot
      .aggregate({ _avg: { burnoutRisk: true }, where: { period: "month" } })
      .then((r) => Math.round((r._avg.burnoutRisk ?? 0) * 100) / 100)
      .catch(() => 0),
  ]);

  return (
    <>
      <Hero />
      <ProblemSection />
      <HowItWorks />
      <FeaturesSection />
      <ResearchSection
        trackedCount={trackedCount}
        avgProductivityGain={avgProductivityGain}
      />
      <PricingSection />
      <GuideSection />
      <CTASection />
    </>
  );
}
