import { Hero } from "@/components/landing/hero";
import { ProblemSection } from "@/components/landing/problem-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FeaturesSection } from "@/components/landing/features-section";
import { ResearchSection } from "@/components/landing/research-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { GuideSection } from "@/components/landing/guide-section";
import { CTASection } from "@/components/landing/cta-section";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProblemSection />
      <HowItWorks />
      <FeaturesSection />
      <ResearchSection />
      <PricingSection />
      <GuideSection />
      <CTASection />
    </>
  );
}
