"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export function CognitiveGauge({ score, level, breakdown }: CognitiveGaugeProps) {
  const circumference = 2 * Math.PI * 60;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const levelConfig = {
    flow: { label: "Flow State", color: "text-foreground" },
    moderate: { label: "Moderate Load", color: "text-foreground" },
    overloaded: { label: "Overloaded", color: "text-foreground" },
  };

  const config = levelConfig[level];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Cognitive Load
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="relative h-40 w-40">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 128 128">
              <circle
                cx="64"
                cy="64"
                r="60"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-muted/50"
              />
              <motion.circle
                cx="64"
                cy="64"
                r="60"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                className={cn(
                  score <= 30
                    ? "text-zinc-400"
                    : score <= 60
                    ? "text-zinc-600"
                    : "text-zinc-900"
                )}
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                className="text-4xl font-bold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {score}
              </motion.span>
              <span className="text-xs text-muted-foreground">/ 100</span>
            </div>
          </div>

          <div className={cn("mt-3 flex items-center gap-2", config.color)}>
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                score <= 30
                  ? "bg-zinc-400"
                  : score <= 60
                  ? "bg-zinc-600"
                  : "bg-zinc-900"
              )}
            />
            <span className="text-sm font-medium">{config.label}</span>
          </div>
        </div>

        {breakdown && (
          <div className="mt-6 space-y-2">
            {[
              { label: "Task Complexity", value: breakdown.taskLoad, max: 60 },
              { label: "Context Switches", value: breakdown.switchPenalty, max: 40 },
              { label: "PR Reviews", value: breakdown.reviewLoad, max: 30 },
              { label: "Urgency", value: breakdown.urgencyStress, max: 40 },
              { label: "Fatigue", value: breakdown.fatigueIndex, max: 16 },
              { label: "Staleness", value: breakdown.staleness, max: 30 },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="w-28 text-xs text-muted-foreground">
                  {item.label}
                </span>
                <div className="h-1.5 flex-1 rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full bg-foreground/60"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min((item.value / item.max) * 100, 100)}%`,
                    }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  />
                </div>
                <span className="w-8 text-right text-xs font-mono text-muted-foreground">
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
