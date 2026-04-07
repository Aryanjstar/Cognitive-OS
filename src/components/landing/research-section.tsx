"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Users, Clock, TrendingUp, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function ResearchSection() {
  const [trackedCount, setTrackedCount] = useState(0);
  const [avgProductivityGain, setAvgProductivityGain] = useState(0);
  const [avgTimeSavings, setAvgTimeSavings] = useState(0);

  useEffect(() => {
    fetch("/api/tracker/summary")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        setTrackedCount(data.totalTracked ?? 0);
        setAvgProductivityGain(data.avgProductivityGain ?? 0);
        setAvgTimeSavings(data.avgTimeSavingsPerMonth ?? 0);
      })
      .catch(() => {});
  }, []);

  const displayCount = trackedCount > 0 ? String(trackedCount) : "—";
  const displayGain = avgProductivityGain > 0 ? `${avgProductivityGain}%` : "—";
  const displaySavings = avgTimeSavings > 0 ? `${avgTimeSavings}h/mo` : "—";

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
            Backed by Research · Real-Time Tracking
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
            {trackedCount > 0 ? `${displayCount} developers tracked live.` : "Live developer tracking."}{" "}
            <span className="text-foreground/50">Real data. Real results.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-muted-foreground">
            We track cognitive load patterns across active GitHub developers in real-time — from
            framework creators to systems programmers — using 7 research-grade formulas.
            Data refreshes automatically every 6 hours.
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
            value={displayCount}
            label="Developers Tracked Live"
            description="Real-time GitHub activity, auto-refreshed every 6 hours"
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
            value={displaySavings}
            label="Avg Time Savings"
            description={`${displayGain} productivity gain per developer with Cognitive OS`}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 flex justify-center gap-4"
        >
          <Button variant="outline" asChild className="gap-2">
            <Link href="/analytics-live">
              Open Research Tracker
              <ArrowRight size={14} />
            </Link>
          </Button>
          <Button variant="outline" asChild className="gap-2">
            <Link href="/research">
              Research Data
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
      <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-foreground/4">
        <Icon size={18} className="text-foreground/60" />
      </div>
      <p className="text-3xl font-bold tabular-nums tracking-tight">{value}</p>
      <p className="mt-1 text-sm font-medium">{label}</p>
      <p className="mt-2 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
