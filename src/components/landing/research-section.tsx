"use client";

import { motion } from "framer-motion";
import { ArrowRight, Users, Clock, TrendingUp, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function ResearchSection() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/40">
            Backed by Research
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
            30+ developers analyzed.{" "}
            <span className="text-foreground/50">Real data. Real results.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-muted-foreground">
            We studied cognitive load patterns across 30+ real GitHub developers — from
            framework creators to systems programmers — using 7 research-grade formulas.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          <ResearchStat
            icon={Users}
            value="33"
            label="Developers Analyzed"
            description="Real GitHub profiles with verified public data"
          />
          <ResearchStat
            icon={Brain}
            value="7"
            label="Research Formulas"
            description="CLI, adaptive weights, anomaly detection, burnout risk"
          />
          <ResearchStat
            icon={Clock}
            value="23.25min"
            label="Avg Refocus Time"
            description="Cost per context switch (Mark et al., 2008)"
          />
          <ResearchStat
            icon={TrendingUp}
            value="35%"
            label="Switch Reduction"
            description="Projected interrupt reduction with Cognitive OS"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <Button variant="outline" asChild className="gap-2">
            <Link href="/research">
              View Full Research Data
              <ArrowRight size={14} />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

function ResearchStat({
  icon: Icon,
  value,
  label,
  description,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  value: string;
  label: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-border/80 p-6 text-center">
      <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-foreground/[0.04]">
        <Icon size={18} className="text-foreground/60" />
      </div>
      <p className="text-3xl font-bold tabular-nums tracking-tight">{value}</p>
      <p className="mt-1 text-sm font-medium">{label}</p>
      <p className="mt-2 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
