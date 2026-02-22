"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Shuffle, BrainCircuit, Clock } from "lucide-react";

const problems = [
  {
    icon: Shuffle,
    title: "Context Switching",
    stat: "23 min",
    statLabel: "average recovery time per switch",
    description:
      "Developers switch between repos, PRs, issues, and meetings constantly. Each switch costs 10-25 minutes of mental reload. No tool measures or reduces this cost.",
  },
  {
    icon: BrainCircuit,
    title: "Cognitive Overload",
    stat: "5-15",
    statLabel: "active issues juggled simultaneously",
    description:
      "Multiple code reviews, feature work, and production fixes create mental fragmentation. There is no brain RAM meter, no overload warning system.",
  },
  {
    icon: Clock,
    title: "Invisible Costs",
    stat: "40%",
    statLabel: "of productive time lost to friction",
    description:
      "Existing tools optimize task completion and velocity. They ignore mental clarity, focus endurance, attention decay, and cognitive recovery time.",
  },
];

export function ProblemSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section ref={sectionRef} className="relative overflow-hidden border-t border-border">
      <motion.div
        style={{ y: bgY }}
        className="pointer-events-none absolute right-0 top-0 -z-10 h-[500px] w-[500px] rounded-full bg-gradient-to-bl from-foreground/[0.02] to-transparent blur-3xl"
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
            The Problem
          </p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            Developer attention is under attack
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-muted-foreground md:text-lg">
            Modern engineering workflows are optimized for output, not for the
            human brain. The result: chronic context fragmentation.
          </p>
        </motion.div>

        <div className="mt-20 grid gap-6 md:grid-cols-3">
          {problems.map((problem, i) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.6,
                delay: i * 0.12,
                ease: [0.25, 0.4, 0.25, 1],
              }}
              className="group relative overflow-hidden rounded-2xl border border-border/80 bg-background p-8 transition-all duration-500 hover:border-foreground/20 hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.12)]"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-foreground/[0.02] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              <div className="relative">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-foreground transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <problem.icon className="text-background" size={22} strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-semibold tracking-tight">{problem.title}</h3>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-bold tracking-tight">{problem.stat}</span>
                  <span className="text-xs text-muted-foreground">{problem.statLabel}</span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {problem.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
