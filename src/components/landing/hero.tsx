"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Github } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const dashboardY = useTransform(scrollYProgress, [0, 1], [0, -60]);

  return (
    <section ref={containerRef} className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]" />
        <motion.div
          style={{ y }}
          className="absolute left-1/2 top-0 -z-10 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-zinc-100 to-transparent blur-3xl"
        />
      </div>

      <div className="mx-auto max-w-6xl px-6 pb-24 pt-24 md:pb-40 md:pt-36">
        <motion.div
          style={{ opacity, scale }}
          className="flex flex-col items-center text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/[0.03] px-4 py-1.5 text-xs font-medium tracking-wide text-muted-foreground backdrop-blur-sm"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-foreground/30" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-foreground" />
            </span>
            Now in private beta
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl lg:text-8xl"
          >
            Infrastructure for{" "}
            <span className="inline-block bg-gradient-to-r from-foreground via-foreground/70 to-foreground/40 bg-clip-text text-transparent">
              Developer Cognition
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-8 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg"
          >
            The first operating system that models your mental workload.
            Track cognitive load, eliminate context-switch overhead, and
            protect your deep work.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-10 flex flex-col gap-4 sm:flex-row"
          >
            <Button
              size="lg"
              asChild
              className="gap-2.5 px-8 shadow-lg shadow-foreground/5 transition-all duration-300 hover:shadow-xl hover:shadow-foreground/10 hover:-translate-y-0.5"
            >
              <Link href="/login">
                <Github size={18} />
                Connect GitHub to Start
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="gap-2 px-8 transition-all duration-300 hover:-translate-y-0.5"
            >
              <Link href="#how-it-works">
                See How It Works
                <ArrowRight size={16} />
              </Link>
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-5 text-xs text-muted-foreground/50"
          >
            Free tier available. No credit card required.
          </motion.p>
        </motion.div>

        <motion.div
          style={{ y: dashboardY }}
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
          className="relative mx-auto mt-20 max-w-4xl"
        >
          <div className="overflow-hidden rounded-2xl border border-foreground/10 bg-zinc-950 shadow-[0_20px_70px_-10px_rgba(0,0,0,0.3)]">
            <div className="flex items-center gap-2 border-b border-zinc-800/80 px-5 py-3">
              <div className="flex gap-2">
                <div className="h-3 w-3 rounded-full bg-zinc-700/80 transition-colors hover:bg-red-400/80" />
                <div className="h-3 w-3 rounded-full bg-zinc-700/80 transition-colors hover:bg-yellow-400/80" />
                <div className="h-3 w-3 rounded-full bg-zinc-700/80 transition-colors hover:bg-green-400/80" />
              </div>
              <div className="mx-auto rounded-lg bg-zinc-800/60 px-6 py-1 text-[11px] text-zinc-500 font-mono">
                cognitive-os.dev/dashboard
              </div>
            </div>
            <div className="grid grid-cols-12 gap-4 p-6">
              <div className="col-span-4 space-y-3">
                <div className="rounded-xl bg-zinc-900/80 p-4 backdrop-blur">
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500">Cognitive Load</div>
                  <div className="mt-2 text-4xl font-bold tabular-nums text-white">42</div>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
                    <span className="text-[10px] text-zinc-400">Flow State</span>
                  </div>
                </div>
                <div className="rounded-xl bg-zinc-900/80 p-4 backdrop-blur">
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500">Focus Time</div>
                  <div className="mt-2 text-2xl font-bold tabular-nums text-white">2h 14m</div>
                </div>
                <div className="rounded-xl bg-zinc-900/80 p-4 backdrop-blur">
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500">Switches</div>
                  <div className="mt-2 text-2xl font-bold tabular-nums text-white">3</div>
                </div>
              </div>
              <div className="col-span-8 space-y-3">
                <div className="rounded-xl bg-zinc-900/80 p-4 backdrop-blur">
                  <div className="mb-4 text-[10px] uppercase tracking-wider text-zinc-500">Load Trend (24h)</div>
                  <div className="flex h-28 items-end gap-[3px]">
                    {[30, 35, 28, 42, 55, 48, 38, 42, 35, 50, 45, 42, 38, 33, 40].map((v, i) => (
                      <motion.div
                        key={i}
                        className="flex-1 rounded-t bg-gradient-to-t from-zinc-600 to-zinc-500"
                        initial={{ height: 0 }}
                        animate={{ height: `${v}%` }}
                        transition={{ duration: 0.6, delay: 0.8 + i * 0.04, ease: "easeOut" }}
                      />
                    ))}
                  </div>
                </div>
                <div className="rounded-xl bg-zinc-900/80 p-4 backdrop-blur">
                  <div className="mb-3 text-[10px] uppercase tracking-wider text-zinc-500">Active Tasks</div>
                  {["Fix auth token refresh", "Review PR #142", "Implement caching layer"].map(
                    (task, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between border-t border-zinc-800/60 py-2.5 first:border-0 first:pt-0"
                      >
                        <span className="text-[13px] text-zinc-300">{task}</span>
                        <span className="rounded-md bg-zinc-800/80 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                          {["Low", "Med", "High"][i]}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="pointer-events-none absolute -inset-8 -z-10 rounded-3xl bg-gradient-to-b from-foreground/[0.04] to-transparent blur-2xl" />
        </motion.div>
      </div>
    </section>
  );
}
