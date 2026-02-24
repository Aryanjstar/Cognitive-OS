"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Gauge,
  BookOpen,
  Timer,
  ShieldAlert,
  CalendarClock,
  BarChart3,
  ArrowUpRight,
} from "lucide-react";

const features = [
  {
    icon: Gauge,
    title: "Cognitive Load Score",
    description:
      "A live 0-100 metric that fuses task complexity, context switches, review burden, and fatigue into a single number — your brain's RAM meter.",
  },
  {
    icon: BookOpen,
    title: "Context Memory Engine",
    description:
      "AI-generated briefings when you return to a task. No more manually reloading PRs, comments, and code changes after time away.",
  },
  {
    icon: Timer,
    title: "Focus Timer & Tracking",
    description:
      "Built-in focus sessions with interruption detection. Track deep work streaks and build a heatmap of your productive hours.",
  },
  {
    icon: ShieldAlert,
    title: "Interrupt Guard",
    description:
      "When a new task arrives mid-focus, the system calculates the exact context-switch cost and recommends: accept, defer, or delegate.",
  },
  {
    icon: CalendarClock,
    title: "Smart Task Sequencing",
    description:
      "AI-powered planning agent suggests optimal task order based on complexity, deadlines, your energy state, and time of day.",
  },
  {
    icon: BarChart3,
    title: "Cognitive Analytics",
    description:
      "Trends, heatmaps, and pattern recognition across days and weeks. Identify your peak hours and chronic overload patterns.",
  },
];

export function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const bgX = useTransform(scrollYProgress, [0, 1], [-30, 30]);

  return (
    <section ref={sectionRef} id="features" className="relative overflow-hidden border-t border-border">
      <motion.div
        style={{ x: bgX }}
        className="pointer-events-none absolute left-0 top-1/3 -z-10 h-[400px] w-[400px] rounded-full bg-gradient-to-r from-foreground/[0.03] to-transparent blur-3xl"
      />

      <div className="mx-auto max-w-6xl px-6 py-28 md:py-36">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/40">
            Features
          </p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            Mental bandwidth infrastructure
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-muted-foreground md:text-lg">
            Not another task manager. A complete cognitive operating system
            that understands, protects, and optimizes how you think.
          </p>
        </motion.div>

        <div className="mt-20 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.5,
                delay: i * 0.08,
                ease: [0.25, 0.4, 0.25, 1],
              }}
            >
              <Link
                href="/#guide"
                className="group relative block overflow-hidden rounded-2xl border border-border/80 p-7 transition-all duration-500 hover:border-foreground/15 hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)]"
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-foreground/[0.015] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative">
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-foreground/10 bg-foreground/[0.04] transition-all duration-500 group-hover:bg-foreground group-hover:border-foreground">
                      <feature.icon
                        size={20}
                        strokeWidth={1.5}
                        className="text-foreground transition-colors duration-500 group-hover:text-background"
                      />
                    </div>
                    <ArrowUpRight
                      size={16}
                      className="text-muted-foreground/0 transition-all duration-500 group-hover:text-muted-foreground group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </div>
                  <h3 className="text-base font-semibold tracking-tight">{feature.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
