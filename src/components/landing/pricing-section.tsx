"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For solo developers getting started",
    features: [
      "GitHub sync (3 repos)",
      "Basic cognitive load score",
      "Focus timer",
      "7-day analytics",
      "Community support",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$15",
    period: "per month",
    description: "Full cognitive analytics & AI memory",
    features: [
      "Unlimited GitHub repos",
      "Advanced cognitive scoring",
      "AI context briefings",
      "Interrupt guard agent",
      "Smart task sequencing",
      "30-day analytics & heatmaps",
      "Priority support",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Team",
    price: "$35",
    period: "per seat / month",
    description: "Organizational cognitive observability",
    features: [
      "Everything in Pro",
      "Team cognitive heatmaps",
      "Bottleneck prediction",
      "Burnout risk alerts",
      "Manager dashboard",
      "API access",
      "Dedicated support",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="relative overflow-hidden border-t border-border">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-muted/30 to-transparent" />

      <div className="mx-auto max-w-6xl px-6 py-28 md:py-36">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/40">
            Pricing
          </p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            Invest in your attention
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-muted-foreground md:text-lg">
            Save 3-5 hours per week of cognitive recovery time. The tool pays
            for itself instantly.
          </p>
        </motion.div>

        <div className="mt-20 grid gap-6 md:grid-cols-3">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.6,
                delay: i * 0.1,
                ease: [0.25, 0.4, 0.25, 1],
              }}
              className={`group relative overflow-hidden rounded-2xl border p-8 transition-all duration-500 ${
                tier.highlighted
                  ? "border-foreground bg-foreground text-background shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] hover:shadow-[0_25px_70px_-10px_rgba(0,0,0,0.5)]"
                  : "border-border/80 bg-background hover:border-foreground/20 hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)]"
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-px left-1/2 -translate-x-1/2">
                  <div className="rounded-b-lg bg-background px-5 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-foreground">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="mb-6 pt-2">
                <h3 className="text-lg font-bold tracking-tight">{tier.name}</h3>
                <p
                  className={`mt-1.5 text-sm ${
                    tier.highlighted ? "text-background/60" : "text-muted-foreground"
                  }`}
                >
                  {tier.description}
                </p>
              </div>

              <div className="mb-8 flex items-baseline gap-1">
                <span className="text-5xl font-bold tracking-tight">{tier.price}</span>
                <span
                  className={`text-sm ${
                    tier.highlighted ? "text-background/50" : "text-muted-foreground"
                  }`}
                >
                  /{tier.period}
                </span>
              </div>

              <ul className="mb-8 space-y-3.5">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check
                      size={15}
                      strokeWidth={2.5}
                      className={`mt-0.5 shrink-0 ${
                        tier.highlighted ? "text-background/50" : "text-foreground/30"
                      }`}
                    />
                    <span className={tier.highlighted ? "text-background/80" : ""}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full gap-2 transition-all duration-300 group-hover:-translate-y-0.5 ${
                  tier.highlighted ? "" : ""
                }`}
                variant={tier.highlighted ? "secondary" : "default"}
                asChild
              >
                <Link href="/login">
                  {tier.cta}
                  <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
