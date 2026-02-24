"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CTASection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 0.4], [0.92, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0.5, 1]);

  return (
    <section ref={sectionRef} className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-28 md:py-36">
        <motion.div
          style={{ scale, opacity }}
          className="relative flex flex-col items-center overflow-hidden rounded-3xl bg-foreground px-8 py-20 text-center text-background md:px-20"
        >
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/[0.03] blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-white/[0.03] blur-3xl" />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative flex flex-col items-center justify-center"
          >
            <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
              Start protecting your focus today
            </h2>
            <p className="mt-5 max-w-lg text-center text-background/60 md:text-lg">
              Join the private beta. Connect your GitHub in one click and get
              your first Cognitive Load Score in under 2 minutes.
            </p>
            <Button
              size="lg"
              variant="secondary"
              asChild
              className="mt-10 gap-2.5 px-10 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <Link href="/login">
                Get Started Free
                <ArrowRight size={16} />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
