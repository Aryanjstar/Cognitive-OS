"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CognitiveGaugeProps {
  score: number;
  level: "flow" | "moderate" | "overloaded";
  breakdown?: {
    taskLoad: number;
    switchPenalty: number;
    reviewLoad: number;
    urgencyStress: number;
    fatigueIndex: number;
    staleness: number;
  };
}

const levelConfig = {
  flow: {
    label: "Flow State",
    description: "Optimal cognitive load — you're in the zone",
    ringColor: "text-zinc-300",
    dotColor: "bg-zinc-300",
    bgGlow: "shadow-[inset_0_0_60px_rgba(0,0,0,0.03)]",
  },
  moderate: {
    label: "Moderate Load",
    description: "Manageable workload — stay aware of changes",
    ringColor: "text-zinc-500",
    dotColor: "bg-zinc-500",
    bgGlow: "shadow-[inset_0_0_60px_rgba(0,0,0,0.06)]",
  },
  overloaded: {
    label: "Overloaded",
    description: "High cognitive load — consider reducing workload",
    ringColor: "text-zinc-900",
    dotColor: "bg-zinc-900",
    bgGlow: "shadow-[inset_0_0_60px_rgba(0,0,0,0.12)]",
  },
};

export function CognitiveGauge({
  score,
  level,
  breakdown,
}: CognitiveGaugeProps) {
  const circumference = 2 * Math.PI * 60;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const config = levelConfig[level];

  return (
    <Card className={cn("h-full", config.bgGlow)}>
      <CardContent className="flex h-full flex-col items-center justify-center px-6 py-8">
        {/* Score Ring */}
        <div className="relative h-44 w-44">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 128 128">
            <circle
              cx="64"
              cy="64"
              r="60"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-muted/30"
            />
            <motion.circle
              cx="64"
              cy="64"
              r="60"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              className={config.ringColor}
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className="text-5xl font-bold tabular-nums"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {score}
            </motion.span>
            <span className="text-xs text-muted-foreground">/ 100</span>
          </div>
        </div>

        {/* Level Label */}
        <div className="mt-4 flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full", config.dotColor)} />
          <span className="text-sm font-semibold">{config.label}</span>
        </div>
        <p className="mt-1 text-center text-xs text-muted-foreground">
          {config.description}
        </p>

        {/* Breakdown Bars */}
        {breakdown && (
          <div className="mt-6 w-full space-y-2.5">
            {[
              { label: "Task Load", value: breakdown.taskLoad, max: 60 },
              { label: "Switches", value: breakdown.switchPenalty, max: 40 },
              { label: "Reviews", value: breakdown.reviewLoad, max: 30 },
              { label: "Urgency", value: breakdown.urgencyStress, max: 40 },
              { label: "Fatigue", value: breakdown.fatigueIndex, max: 16 },
              { label: "Staleness", value: breakdown.staleness, max: 30 },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="w-20 text-right text-[11px] text-muted-foreground">
                  {item.label}
                </span>
                <div className="h-1.5 flex-1 rounded-full bg-muted">
                  <motion.div
                    className={cn(
                      "h-full rounded-full",
                      item.value / item.max > 0.7
                        ? "bg-zinc-900"
                        : item.value / item.max > 0.4
                        ? "bg-zinc-500"
                        : "bg-zinc-300"
                    )}
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min((item.value / item.max) * 100, 100)}%`,
                    }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  />
                </div>
                <span className="w-8 text-right font-mono text-[11px] text-muted-foreground">
                  {item.value.toFixed(0)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
