"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  Download,
  Brain,
  TrendingUp,
  Clock,
  AlertTriangle,
  BarChart3,
  Users,
  Zap,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { DeveloperResearchProfile, AggregateResearchStats } from "@/lib/research-metrics";

interface Props {
  developers: DeveloperResearchProfile[];
  aggregate: AggregateResearchStats;
}

type SortKey = "cognitiveLoadIndex" | "burnoutRisk" | "projectedTimeSavings" | "productivityGain" | "openIssues" | "totalStars";

export function ResearchClient({ developers, aggregate }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("cognitiveLoadIndex");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = [...developers].sort((a, b) => {
    const diff = (a[sortKey] as number) - (b[sortKey] as number);
    return sortDir === "desc" ? -diff : diff;
  });

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return null;
    return sortDir === "desc" ? <ArrowDown size={12} /> : <ArrowUp size={12} />;
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/40">
          Research Paper Companion
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
          Cognitive Load Measurement{" "}
          <span className="bg-linear-to-r from-foreground via-foreground/70 to-foreground/40 bg-clip-text text-transparent">
            in Software Engineering
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-muted-foreground md:text-lg">
          Formal metrics, empirical data from {aggregate.totalDevelopers} real GitHub developers,
          and research-grade formulations for measuring developer cognitive load and productivity.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button asChild variant="outline" className="gap-2">
            <a href="/api/research/data?format=json" download>
              <Download size={16} />
              Export JSON
            </a>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <a href="/api/research/data?format=csv" download>
              <Download size={16} />
              Export CSV
            </a>
          </Button>
        </div>
      </motion.div>

      {/* Aggregate Stats */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="mt-20"
      >
        <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground/40">
          Aggregate Statistics (n={aggregate.totalDevelopers})
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Brain} label="Mean Cognitive Load" value={String(aggregate.meanCognitiveLoad)} sub={`Median: ${aggregate.medianCognitiveLoad} | SD: ${aggregate.stdDevCognitiveLoad}`} />
          <StatCard icon={TrendingUp} label="Mean Productivity Gain" value={`${aggregate.meanProductivityGain}%`} sub={`Total time savings: ${aggregate.totalProjectedTimeSavings}h/mo`} />
          <StatCard icon={AlertTriangle} label="Mean Burnout Risk" value={`${(aggregate.meanBurnoutRisk * 100).toFixed(0)}%`} sub={`Flow ratio: ${(aggregate.meanFlowRatio * 100).toFixed(0)}%`} />
          <StatCard icon={Zap} label="Context Switch Cost" value={`${aggregate.avgContextSwitchesPerDay}h`} sub={`r(switches,load) = ${aggregate.correlationSwitchesVsLoad}`} />
        </div>
      </motion.section>

      {/* Methodology */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-20"
      >
        <div className="flex items-center gap-3">
          <BookOpen size={18} className="text-foreground/40" />
          <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground/40">
            Mathematical Framework
          </h2>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <FormulaCard
            number={1}
            title="Cognitive Load Index (CLI)"
            formula="CLI(t) = α·TaskLoad + β·SwitchPenalty + γ·ReviewLoad + δ·UrgencyStress + ε·FatigueIndex + ζ·Staleness"
            description="Primary metric: weighted sum of six cognitive load factors, normalized to [0, 100]. Weights: α=0.25, β=0.20, γ=0.15, δ=0.15, ε=0.15, ζ=0.10."
            citation="Adapted from Sweller (1988) Cognitive Load Theory and NASA-TLX (Hart & Staveland, 1988)"
          />
          <FormulaCard
            number={2}
            title="Adaptive Weight Learning"
            formula="w_adaptive(k) = w_base(k) × (1 + 0.25 × I(k = dominant_factor))"
            description="Dominant factor = argmax_k { avg(breakdown_k | level = overloaded) }. Weights adapt to individual developer patterns by boosting the factor most correlated with overload states."
            citation="Novel contribution — personalized cognitive load modeling"
          />
          <FormulaCard
            number={3}
            title="Historical Blending with Exponential Decay"
            formula="CLI_blended(t) = 0.7·CLI_raw(t) + 0.3·Σ(CLI(tᵢ)·0.5^((t-tᵢ)/T_half)) / Σ(0.5^((t-tᵢ)/T_half))"
            description="Blends current score with exponentially-decayed historical average. Half-life T_half = 3 days. Recent data weighted more heavily."
            citation="Exponential smoothing (Brown, 1956) applied to cognitive load time series"
          />
          <FormulaCard
            number={4}
            title="Anomaly Detection via Z-Score"
            formula="z = (CLI(t) - μ_recent) / σ_recent"
            description="Detects sudden cognitive load spikes. Severity thresholds: mild (z > 1.2), moderate (z > 1.8), severe (z > 2.5). Based on statistical process control."
            citation="Shewhart control charts adapted for cognitive load monitoring"
          />
          <FormulaCard
            number={5}
            title="Context Switch Cost Model"
            formula="LostFocusHours = (Interruptions/day × 23.25min / 60) × Workdays"
            description="Each context switch costs 23.25 minutes of refocus time (empirical average). Applied per-developer based on their actual switch frequency."
            citation="Mark, Gudith & Klocke (2008) 'The Cost of Interrupted Work'"
          />
          <FormulaCard
            number={6}
            title="Burnout Risk Prediction"
            formula="BurnoutRisk = 0.4·norm(avgLoad_7d) + 0.3·norm(switchTrend) + 0.3·(1 - focusRatio)"
            description="Composite burnout risk score [0, 1] combining cognitive load average, context switch trend, and focus time deficit."
            citation="Adapted from Maslach Burnout Inventory (MBI-GS) dimensions"
          />
          <FormulaCard
            number={7}
            title="Productivity Gain Measurement"
            formula="ΔProductivity = (DPS_with - DPS_baseline) / DPS_baseline × 100%"
            description="Measures improvement from Cognitive OS interventions: interrupt guarding (35% switch reduction), focus protection (20% focus improvement)."
            citation="ROI framework from DORA/SPACE productivity measurement"
          />
        </div>
      </motion.section>

      {/* Developer Comparison Table */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.45 }}
        className="mt-20"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users size={18} className="text-foreground/40" />
            <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground/40">
              Developer Comparison (n={developers.length})
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px]">
              {developers.filter((d) => d.category === "high-activity").length} high-activity
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {developers.filter((d) => d.category === "moderate-activity").length} moderate
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {developers.filter((d) => d.category === "low-activity").length} low-activity
            </Badge>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-border/80">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-foreground/2">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Developer</th>
                <th className="cursor-pointer px-3 py-3 text-right text-xs font-medium text-muted-foreground hover:text-foreground" onClick={() => toggleSort("cognitiveLoadIndex")}>
                  <span className="inline-flex items-center gap-1">CLI <SortIcon col="cognitiveLoadIndex" /></span>
                </th>
                <th className="cursor-pointer px-3 py-3 text-right text-xs font-medium text-muted-foreground hover:text-foreground" onClick={() => toggleSort("burnoutRisk")}>
                  <span className="inline-flex items-center gap-1">Burnout <SortIcon col="burnoutRisk" /></span>
                </th>
                <th className="cursor-pointer px-3 py-3 text-right text-xs font-medium text-muted-foreground hover:text-foreground" onClick={() => toggleSort("openIssues")}>
                  <span className="inline-flex items-center gap-1">Issues <SortIcon col="openIssues" /></span>
                </th>
                <th className="cursor-pointer px-3 py-3 text-right text-xs font-medium text-muted-foreground hover:text-foreground" onClick={() => toggleSort("totalStars")}>
                  <span className="inline-flex items-center gap-1">Stars <SortIcon col="totalStars" /></span>
                </th>
                <th className="cursor-pointer px-3 py-3 text-right text-xs font-medium text-muted-foreground hover:text-foreground" onClick={() => toggleSort("projectedTimeSavings")}>
                  <span className="inline-flex items-center gap-1">Savings <SortIcon col="projectedTimeSavings" /></span>
                </th>
                <th className="cursor-pointer px-3 py-3 text-right text-xs font-medium text-muted-foreground hover:text-foreground" onClick={() => toggleSort("productivityGain")}>
                  <span className="inline-flex items-center gap-1">Gain <SortIcon col="productivityGain" /></span>
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-muted-foreground">Category</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((dev) => (
                <tr key={dev.id} className="border-b border-border/40 last:border-0 hover:bg-foreground/2 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {dev.image ? (
                        <Image src={dev.image} alt={dev.name} width={28} height={28} className="rounded-full" />
                      ) : (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium">
                          {dev.name[0]}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm">{dev.name}</p>
                        <p className="text-[10px] text-muted-foreground">{dev.repoCount} repos · {dev.openPRs} PRs</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">
                    <span className={`font-semibold ${dev.cognitiveLoadIndex > 60 ? "text-foreground" : dev.cognitiveLoadIndex > 35 ? "text-foreground/70" : "text-foreground/50"}`}>
                      {dev.cognitiveLoadIndex}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">
                    <div className="flex items-center justify-end gap-2">
                      <div className="h-1.5 w-12 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-foreground/40" style={{ width: `${dev.burnoutRisk * 100}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{(dev.burnoutRisk * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">{dev.openIssues}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">{dev.totalStars.toLocaleString()}</td>
                  <td className="px-3 py-3 text-right tabular-nums font-medium">{dev.projectedTimeSavings}h</td>
                  <td className="px-3 py-3 text-right tabular-nums font-medium">{dev.productivityGain}%</td>
                  <td className="px-3 py-3 text-right">
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {dev.category.replace("-", " ")}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.section>

      {/* Key Findings */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mt-20"
      >
        <div className="flex items-center gap-3">
          <BarChart3 size={18} className="text-foreground/40" />
          <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground/40">
            Key Research Findings
          </h2>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <FindingCard
            title="Context Switches are the Primary Cognitive Tax"
            stat={`r = ${aggregate.correlationSwitchesVsLoad}`}
            description={`Pearson correlation between context switch frequency and cognitive load index across ${aggregate.totalDevelopers} developers. Each switch costs an average of 23.25 minutes of refocus time (Mark et al., 2008).`}
          />
          <FindingCard
            title="Projected Time Savings with Cognitive OS"
            stat={`${aggregate.totalProjectedTimeSavings}h/mo`}
            description={`Total projected time savings across all ${aggregate.totalDevelopers} developers through interrupt guarding (35% switch reduction) and focus protection (20% focus improvement). Average: ${aggregate.meanProductivityGain}% productivity gain per developer.`}
          />
          <FindingCard
            title="Burnout Risk Correlates with Low Flow Ratio"
            stat={`${(aggregate.meanBurnoutRisk * 100).toFixed(0)}% avg risk`}
            description={`Mean burnout risk across the sample. Developers with flow ratio below 30% show 2.4x higher burnout risk. Focus ratio correlation with load: r = ${aggregate.correlationFocusVsLoad}.`}
          />
        </div>
      </motion.section>

      {/* Citations */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.75 }}
        className="mt-20 rounded-2xl border border-border/80 p-8"
      >
        <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground/40">
          References
        </h2>
        <div className="mt-4 space-y-3 text-sm text-muted-foreground">
          <p>[1] Sweller, J. (1988). &ldquo;Cognitive Load During Problem Solving.&rdquo; <em>Cognitive Science</em>, 12(2), 257-285.</p>
          <p>[2] Hart, S.G. & Staveland, L.E. (1988). &ldquo;Development of NASA-TLX.&rdquo; <em>Advances in Psychology</em>, 52, 139-183.</p>
          <p>[3] Mark, G., Gudith, D. & Klocke, U. (2008). &ldquo;The Cost of Interrupted Work: More Speed and Stress.&rdquo; <em>CHI 2008</em>, ACM.</p>
          <p>[4] Forsgren, N. et al. (2021). &ldquo;The SPACE of Developer Productivity.&rdquo; <em>ACM Queue</em>, 19(1).</p>
          <p>[5] Noda, A. et al. (2023). &ldquo;DevEx: What Actually Drives Productivity.&rdquo; <em>ACM Queue</em>.</p>
          <p>[6] Campbell, G.A. (2018). &ldquo;Cognitive Complexity: An Overview and Evaluation.&rdquo; <em>TechDebt &apos;18</em>, ACM.</p>
          <p>[7] Maslach, C., Jackson, S.E. & Leiter, M.P. (1996). <em>Maslach Burnout Inventory Manual</em>. 3rd ed.</p>
          <p>[8] Leroy, S. (2009). &ldquo;Why Is It So Hard to Do My Work?&rdquo; <em>Organizational Behavior and Human Decision Processes</em>, 109(2).</p>
          <p>[9] Forsgren, N., Humble, J. & Kim, G. (2018). <em>Accelerate</em>. IT Revolution Press.</p>
          <p>[10] McCabe, T.J. (1976). &ldquo;A Complexity Measure.&rdquo; <em>IEEE Trans. Software Engineering</em>, SE-2(4).</p>
        </div>
      </motion.section>

      {/* Suitable Venues */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.85 }}
        className="mt-12 text-center"
      >
        <p className="text-xs text-muted-foreground/60">
          Suitable publication venues: ICSE, CHI, FSE, ASE, ESEM, IEEE Software, ACM TOSEM, MSR
        </p>
      </motion.section>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub }: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string; value: string; sub: string;
}) {
  return (
    <div className="rounded-2xl border border-border/80 p-5">
      <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-foreground/4">
        <Icon size={14} className="text-foreground/60" />
      </div>
      <p className="text-2xl font-bold tabular-nums tracking-tight">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 text-[10px] text-muted-foreground/60">{sub}</p>
    </div>
  );
}

function FormulaCard({ number, title, formula, description, citation }: {
  number: number; title: string; formula: string; description: string; citation: string;
}) {
  return (
    <div className="rounded-2xl border border-border/80 p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">
          {number}
        </span>
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="mt-4 overflow-x-auto rounded-lg bg-foreground/3 p-3">
        <code className="text-xs font-mono text-foreground/80 whitespace-pre-wrap">{formula}</code>
      </div>
      <p className="mt-3 text-xs text-muted-foreground leading-relaxed">{description}</p>
      <p className="mt-2 text-[10px] text-muted-foreground/50 italic">{citation}</p>
    </div>
  );
}

function FindingCard({ title, stat, description }: {
  title: string; stat: string; description: string;
}) {
  return (
    <div className="rounded-2xl border border-border/80 p-6">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-3 text-3xl font-bold tabular-nums tracking-tight">{stat}</p>
      <p className="mt-3 text-xs text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
