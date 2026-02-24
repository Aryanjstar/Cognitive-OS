"use client";

import { useState, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ListTodo,
  Timer,
  BarChart3,
  BrainCircuit,
  Settings,
  Activity,
  GitPullRequest,
  Clock,
  Flame,
  TrendingUp,
  Shield,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DashboardGuide {
  id: string;
  icon: LucideIcon;
  title: string;
  tagline: string;
  description: string;
  metrics: string[];
  details: string[];
}

const dashboards: DashboardGuide[] = [
  {
    id: "dashboard",
    icon: LayoutDashboard,
    title: "Dashboard",
    tagline: "Your cognitive command center",
    description:
      "A real-time overview of your mental workload. The Cognitive Load Score (0-100) fuses task complexity, context switches, PR reviews, urgency, fatigue, and staleness into one number that tells you exactly where you stand.",
    metrics: [
      "Cognitive Load Score",
      "48h Load Trend",
      "Context Switches",
      "Focus Minutes",
    ],
    details: [
      "Score breakdown by six cognitive dimensions",
      "Active GitHub tasks sorted by complexity",
      "Built-in focus timer with session tracking",
      "AI Agent Insights from Focus, Planning, and Interrupt Guard agents",
    ],
  },
  {
    id: "tasks",
    icon: ListTodo,
    title: "Tasks",
    tagline: "All synced GitHub work in one view",
    description:
      "Every issue and pull request from your connected repositories, enriched with auto-calculated complexity scores. Filter by state, repo, or complexity to find what needs attention.",
    metrics: [
      "Complexity Score (1-10)",
      "Repository Filter",
      "State Filter",
      "Last Updated",
    ],
    details: [
      "Issues and PRs synced from GitHub automatically",
      "Complexity auto-calculated from body length, labels, comments, and PR size",
      "Filterable by open, closed, or all states",
      "Sort by complexity to prioritize high-effort work",
    ],
  },
  {
    id: "focus",
    icon: Timer,
    title: "Focus",
    tagline: "Track and protect deep work",
    description:
      "Built-in timers for free-form and Pomodoro sessions. See your focus time today, session count, and interruptions detected. A 7-day heatmap reveals your most productive hours.",
    metrics: [
      "Focus Time Today",
      "Session Count",
      "Interruptions",
      "7-Day Heatmap",
    ],
    details: [
      "Free mode for open-ended deep work sessions",
      "Pomodoro mode with configurable work/break intervals",
      "Interruption detection during active sessions",
      "Recent sessions list with duration, type, and interruption count",
    ],
  },
  {
    id: "analytics",
    icon: BarChart3,
    title: "Analytics",
    tagline: "30-day cognitive performance trends",
    description:
      "Charts and metrics that reveal patterns in your cognitive load, focus time, and context switches over the last 30 days. Identify peak productivity windows and chronic overload patterns.",
    metrics: [
      "Average Load",
      "Peak Load",
      "Total Focus Hours",
      "Switch Count",
    ],
    details: [
      "Daily cognitive load trend chart",
      "Focus minutes per day visualization",
      "Context switches per day tracking",
      "Identify peak hours and overload patterns",
    ],
  },
  {
    id: "briefings",
    icon: BrainCircuit,
    title: "Briefings",
    tagline: "AI-powered context reload",
    description:
      "Select any synced task and generate a structured briefing using GPT-4.1. The AI analyzes complexity, code changes, comments, and your cognitive state to produce a summary that eliminates mental reload time.",
    metrics: [
      "Task Selector",
      "AI Summary",
      "Complexity Analysis",
      "Reload Time Saved",
    ],
    details: [
      "Works with any synced issue or pull request",
      "Powered by Azure OpenAI GPT-4.1",
      "Factors in your current cognitive state",
      "Structured output reduces context-switch overhead",
    ],
  },
  {
    id: "settings",
    icon: Settings,
    title: "Settings",
    tagline: "Customize your cognitive model",
    description:
      "Manage your profile, GitHub integration, and the weight factors that drive your Cognitive Load Score. Fine-tune how context switches, PR reviews, urgency, fatigue, and staleness affect your score.",
    metrics: [
      "GitHub Status",
      "Sync Repos",
      "Load Weights",
      "Profile",
    ],
    details: [
      "See GitHub connection status and manage tokens",
      "Select which repositories to sync",
      "Adjust Context Switch Cost, PR Review Weight, Urgency Multiplier",
      "Customize Fatigue Rate and Staleness Factor",
    ],
  },
];

const metricIcons: Record<string, LucideIcon> = {
  "Cognitive Load Score": Activity,
  "48h Load Trend": TrendingUp,
  "Context Switches": Flame,
  "Focus Minutes": Clock,
  "Complexity Score (1-10)": Activity,
  "Repository Filter": GitPullRequest,
  "State Filter": Shield,
  "Last Updated": Clock,
  "Focus Time Today": Clock,
  "Session Count": Timer,
  "Interruptions": Shield,
  "7-Day Heatmap": BarChart3,
  "Average Load": Activity,
  "Peak Load": TrendingUp,
  "Total Focus Hours": Clock,
  "Switch Count": Flame,
  "Task Selector": ListTodo,
  "AI Summary": BrainCircuit,
  "Complexity Analysis": Activity,
  "Reload Time Saved": Clock,
  "GitHub Status": GitPullRequest,
  "Sync Repos": GitPullRequest,
  "Load Weights": Settings,
  "Profile": Settings,
};

export function GuideSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const active = dashboards[activeIndex];

  return (
    <section ref={sectionRef} id="guide" className="relative overflow-hidden border-t border-border">
      <motion.div
        style={{ y: bgY }}
        className="pointer-events-none absolute right-0 top-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-gradient-to-l from-foreground/[0.03] to-transparent blur-3xl"
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
            Platform Guide
          </p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            Every screen, explained
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-muted-foreground md:text-lg">
            Six purpose-built dashboards that work together to model, protect,
            and optimize your cognitive bandwidth.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-16 flex flex-wrap justify-center gap-2"
        >
          {dashboards.map((d, i) => (
            <button
              key={d.id}
              onClick={() => setActiveIndex(i)}
              className={`
                group relative flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300
                ${
                  activeIndex === i
                    ? "bg-foreground text-background shadow-lg"
                    : "border border-border/80 text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                }
              `}
            >
              <d.icon size={15} strokeWidth={1.5} />
              {d.title}
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.25, 0.4, 0.25, 1] }}
            className="mt-12"
          >
            <div className="grid gap-8 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <div className="sticky top-24">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-foreground/10 bg-foreground/[0.04]">
                    <active.icon size={22} strokeWidth={1.5} className="text-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight">{active.title}</h3>
                  <p className="mt-1 text-sm font-medium text-foreground/50">{active.tagline}</p>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    {active.description}
                  </p>
                </div>
              </div>

              <div className="space-y-6 lg:col-span-3">
                <div className="rounded-2xl border border-border/80 p-6">
                  <p className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-foreground/40">
                    Key Metrics
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {active.metrics.map((metric, i) => {
                      const MetricIcon = metricIcons[metric] || Activity;
                      return (
                        <motion.div
                          key={metric}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.06 }}
                          className="flex items-center gap-3 rounded-xl border border-border/60 px-4 py-3 transition-colors duration-300 hover:border-foreground/15"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-foreground/[0.04]">
                            <MetricIcon size={14} strokeWidth={1.5} className="text-foreground/60" />
                          </div>
                          <span className="text-sm font-medium">{metric}</span>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-2xl border border-border/80 p-6">
                  <p className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-foreground/40">
                    What You Get
                  </p>
                  <div className="space-y-3">
                    {active.details.map((detail, i) => (
                      <motion.div
                        key={detail}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.06 }}
                        className="flex items-start gap-3"
                      >
                        <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/30" />
                        <span className="text-sm leading-relaxed text-muted-foreground">{detail}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {active.metrics.map((metric) => (
                    <Badge key={metric} variant="outline" className="text-xs font-normal">
                      {metric}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
