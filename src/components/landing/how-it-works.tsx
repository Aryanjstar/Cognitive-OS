"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Github, Activity, Sparkles } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Github,
    title: "Connect your GitHub",
    description:
      "One-click OAuth integration syncs your repositories, issues, pull requests, and commits. Your data stays local and private.",
  },
  {
    number: "02",
    icon: Activity,
    title: "Track cognitive load",
    description:
      "Our engine analyzes task complexity, context switches, review burden, and fatigue to generate a real-time Cognitive Load Score.",
  },
  {
    number: "03",
    icon: Sparkles,
    title: "AI optimizes your flow",
    description:
      "Specialized agents generate context briefings, suggest optimal task order, guard against costly interruptions, and protect deep work.",
  },
];

export function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const lineScaleY = useTransform(scrollYProgress, [0.1, 0.7], [0, 1]);

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="relative overflow-hidden border-t border-border"
    >
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-muted/40 via-transparent to-muted/20" />

      <div className="mx-auto max-w-6xl px-6 py-28 md:py-36">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/40">
            How It Works
          </p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            Three steps to protected focus
          </h2>
        </motion.div>

        <div className="relative mt-24">
          {/* Animated vertical connector line */}
          <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-border/50 md:block">
            <motion.div
              className="h-full w-full origin-top bg-foreground/20"
              style={{ scaleY: lineScaleY }}
            />
          </div>

          <div className="space-y-20 md:space-y-32">
            {steps.map((step, i) => {
              const isEven = i % 2 === 0;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: isEven ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
                  className={`relative flex flex-col items-center gap-8 md:flex-row ${
                    isEven ? "" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Content side */}
                  <div className={`flex-1 ${isEven ? "md:text-right" : "md:text-left"}`}>
                    <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-foreground/25">
                      Step {step.number}
                    </span>
                    <h3 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">
                      {step.title}
                    </h3>
                    <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
                      {step.description}
                    </p>
                  </div>

                  {/* Center node */}
                  <div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-foreground/10 bg-background shadow-lg transition-transform duration-300 hover:scale-110 hover:shadow-xl">
                    <step.icon size={24} strokeWidth={1.5} className="text-foreground" />
                  </div>

                  {/* Spacer for opposite side */}
                  <div className="hidden flex-1 md:block" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
