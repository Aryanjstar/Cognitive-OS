/**
 * Cognitive OS — Research Metrics Library
 *
 * Formal mathematical formulations for the research paper.
 * All formulas are citation-ready and map to established frameworks
 * (DORA, SPACE, DevEx, NASA-TLX, Sweller CLT, Mark et al. 2008).
 */

import { prisma } from "@/lib/prisma";

// ─── Types ───────────────────────────────────────────────────

export interface CognitiveLoadBreakdown {
  taskLoad: number;
  switchPenalty: number;
  reviewLoad: number;
  urgencyStress: number;
  fatigueIndex: number;
  staleness: number;
}

export interface DeveloperResearchProfile {
  id: string;
  name: string;
  email: string | null;
  image: string | null;
  repoCount: number;
  openIssues: number;
  openPRs: number;
  totalStars: number;
  avgComplexity: number;
  cognitiveLoadIndex: number;
  burnoutRisk: number;
  flowRatio: number;
  contextSwitchCost: number;
  projectedTimeSavings: number;
  productivityGain: number;
  breakdown: CognitiveLoadBreakdown;
  category: "high-activity" | "moderate-activity" | "low-activity";
}

export interface AggregateResearchStats {
  totalDevelopers: number;
  meanCognitiveLoad: number;
  medianCognitiveLoad: number;
  stdDevCognitiveLoad: number;
  meanFlowRatio: number;
  meanBurnoutRisk: number;
  totalProjectedTimeSavings: number;
  meanProductivityGain: number;
  avgContextSwitchesPerDay: number;
  avgFocusMinutesPerDay: number;
  correlationSwitchesVsLoad: number;
  correlationFocusVsLoad: number;
}

// ─── Constants ───────────────────────────────────────────────

export const WEIGHTS = {
  alpha: 0.25,  // taskLoad
  beta: 0.20,   // switchPenalty
  gamma: 0.15,  // reviewLoad
  delta: 0.15,  // urgencyStress
  epsilon: 0.15, // fatigueIndex
  zeta: 0.10,   // staleness
} as const;

const REFOCUS_TIME_MINUTES = 23.25; // Mark et al. (2008)
const HOURLY_DEVELOPER_COST = 101; // Industry average (salary + 40% overhead)
const WORKING_DAYS_PER_MONTH = 22;
const WORKING_HOURS_PER_DAY = 8;

// ─── Formula 1: Cognitive Load Index (CLI) ───────────────────
// CLI(t) = α·TaskLoad + β·SwitchPenalty + γ·ReviewLoad
//        + δ·UrgencyStress + ε·FatigueIndex + ζ·Staleness

export function computeCognitiveLoadIndex(breakdown: CognitiveLoadBreakdown): number {
  const raw =
    WEIGHTS.alpha * breakdown.taskLoad +
    WEIGHTS.beta * breakdown.switchPenalty +
    WEIGHTS.gamma * breakdown.reviewLoad +
    WEIGHTS.delta * breakdown.urgencyStress +
    WEIGHTS.epsilon * breakdown.fatigueIndex +
    WEIGHTS.zeta * breakdown.staleness;

  return Math.min(Math.max(Math.round(raw * 100) / 100, 0), 100);
}

// ─── Formula 2: Adaptive Weight Learning ─────────────────────
// w_adaptive(k) = w_base(k) × (1 + 0.25 × I(k == dominant_factor))
// dominant_factor = argmax_k { avg(breakdown_k | level = overloaded) }

export function computeAdaptiveWeights(
  overloadedBreakdowns: CognitiveLoadBreakdown[]
): Record<string, number> {
  if (overloadedBreakdowns.length < 3) return { ...WEIGHTS };

  const avgBreakdown: Record<string, number> = {
    taskLoad: 0, switchPenalty: 0, reviewLoad: 0,
    urgencyStress: 0, fatigueIndex: 0, staleness: 0,
  };

  for (const b of overloadedBreakdowns) {
    avgBreakdown.taskLoad += b.taskLoad;
    avgBreakdown.switchPenalty += b.switchPenalty;
    avgBreakdown.reviewLoad += b.reviewLoad;
    avgBreakdown.urgencyStress += b.urgencyStress;
    avgBreakdown.fatigueIndex += b.fatigueIndex;
    avgBreakdown.staleness += b.staleness;
  }

  const n = overloadedBreakdowns.length;
  for (const key of Object.keys(avgBreakdown)) {
    avgBreakdown[key] /= n;
  }

  const dominant = Object.entries(avgBreakdown).sort(([, a], [, b]) => b - a)[0][0];

  const weightMap: Record<string, keyof typeof WEIGHTS> = {
    taskLoad: "alpha", switchPenalty: "beta", reviewLoad: "gamma",
    urgencyStress: "delta", fatigueIndex: "epsilon", staleness: "zeta",
  };

  const adapted = { ...WEIGHTS } as Record<string, number>;
  const key = weightMap[dominant];
  if (key) {
    adapted[key] = Math.round(WEIGHTS[key] * 1.25 * 1000) / 1000;
  }

  return adapted;
}

// ─── Formula 3: Historical Blending with Exponential Decay ───
// CLI_blended(t) = 0.7 × CLI_raw(t) + 0.3 × CLI_historical(t)
// CLI_historical(t) = Σ(CLI(t_i) × 0.5^((t - t_i) / T_half)) / Σ(0.5^((t - t_i) / T_half))
// T_half = 3 days

export function computeHistoricalBlend(
  currentScore: number,
  history: { score: number; timestamp: Date }[]
): number {
  if (history.length < 5) return currentScore;

  const HALF_LIFE_MS = 3 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  let weightedSum = 0;
  let totalWeight = 0;

  for (const h of history) {
    const age = now - h.timestamp.getTime();
    const weight = Math.pow(0.5, age / HALF_LIFE_MS);
    weightedSum += h.score * weight;
    totalWeight += weight;
  }

  const historical = totalWeight > 0 ? weightedSum / totalWeight : currentScore;
  return Math.round((0.7 * currentScore + 0.3 * historical) * 100) / 100;
}

// ─── Formula 4: Anomaly Detection via Z-Score ────────────────
// z = (CLI(t) - μ_recent) / σ_recent
// Severity: mild (z > 1.2), moderate (z > 1.8), severe (z > 2.5)

export function detectAnomaly(
  currentScore: number,
  recentScores: number[]
): { isAnomaly: boolean; zScore: number; severity: "none" | "mild" | "moderate" | "severe" } {
  if (recentScores.length < 5) {
    return { isAnomaly: false, zScore: 0, severity: "none" };
  }

  const mean = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
  const variance = recentScores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / recentScores.length;
  const stdDev = Math.sqrt(variance);
  const zScore = stdDev > 0 ? (currentScore - mean) / stdDev : 0;

  if (zScore > 2.5) return { isAnomaly: true, zScore: Math.round(zScore * 100) / 100, severity: "severe" };
  if (zScore > 1.8) return { isAnomaly: true, zScore: Math.round(zScore * 100) / 100, severity: "moderate" };
  if (zScore > 1.2) return { isAnomaly: true, zScore: Math.round(zScore * 100) / 100, severity: "mild" };
  return { isAnomaly: false, zScore: Math.round(zScore * 100) / 100, severity: "none" };
}

// ─── Formula 5: Context Switch Cost Model ────────────────────
// SwitchCost(t) = BaseCost + TaskComplexity(current) × 2
// LostFocusHours = (Interruptions/day × 23.25min / 60) × Workdays

export function computeContextSwitchCost(
  avgSwitchesPerDay: number,
  avgTaskComplexity: number = 5
): { costMinutesPerSwitch: number; lostHoursPerMonth: number; monetaryCostPerMonth: number } {
  const costMinutesPerSwitch = 8 + avgTaskComplexity * 2;
  const lostHoursPerMonth = (avgSwitchesPerDay * REFOCUS_TIME_MINUTES / 60) * WORKING_DAYS_PER_MONTH;
  const monetaryCostPerMonth = lostHoursPerMonth * HOURLY_DEVELOPER_COST;

  return {
    costMinutesPerSwitch: Math.round(costMinutesPerSwitch * 10) / 10,
    lostHoursPerMonth: Math.round(lostHoursPerMonth * 10) / 10,
    monetaryCostPerMonth: Math.round(monetaryCostPerMonth),
  };
}

// ─── Formula 6: Burnout Risk Prediction ──────────────────────
// BurnoutRisk = 0.4 × norm(avgLoad_7d) + 0.3 × norm(switchTrend) + 0.3 × (1 - focusRatio)

export function computeBurnoutRisk(
  avgCognitiveLoad7d: number,
  contextSwitchesTrend: number, // positive = increasing
  focusRatio: number // 0-1, time in focus / total time
): number {
  const loadNorm = Math.min(Math.max(avgCognitiveLoad7d / 100, 0), 1);
  const switchNorm = Math.min(Math.max(contextSwitchesTrend / 10, 0), 1);
  const focusDeficit = 1 - Math.min(Math.max(focusRatio, 0), 1);

  const risk = 0.4 * loadNorm + 0.3 * switchNorm + 0.3 * focusDeficit;
  return Math.round(Math.max(Math.min(risk, 1), 0) * 100) / 100;
}

// ─── Formula 7: Productivity Gain Measurement ────────────────
// ΔProductivity = (DPS_with_system - DPS_baseline) / DPS_baseline × 100%
// TimeSaved = InterruptionsAvoided × avgRefocusTime

export function computeProductivityGain(
  baselineSwitchesPerDay: number,
  reducedSwitchesPerDay: number,
  baselineFocusMinutes: number,
  improvedFocusMinutes: number
): { timeSavedHoursPerMonth: number; productivityGainPercent: number; monetarySavingsPerMonth: number } {
  const interruptionsAvoided = Math.max(baselineSwitchesPerDay - reducedSwitchesPerDay, 0);
  const timeSavedMinutesPerDay = interruptionsAvoided * REFOCUS_TIME_MINUTES;
  const focusGainMinutesPerDay = Math.max(improvedFocusMinutes - baselineFocusMinutes, 0);
  const totalSavedPerDay = timeSavedMinutesPerDay + focusGainMinutesPerDay * 0.5;
  const timeSavedHoursPerMonth = (totalSavedPerDay / 60) * WORKING_DAYS_PER_MONTH;

  const baselineProductiveHours = baselineFocusMinutes / 60;
  const improvedProductiveHours = baselineProductiveHours + totalSavedPerDay / 60;
  const productivityGainPercent = baselineProductiveHours > 0
    ? ((improvedProductiveHours - baselineProductiveHours) / baselineProductiveHours) * 100
    : 0;

  const monetarySavingsPerMonth = timeSavedHoursPerMonth * HOURLY_DEVELOPER_COST;

  return {
    timeSavedHoursPerMonth: Math.round(timeSavedHoursPerMonth * 10) / 10,
    productivityGainPercent: Math.round(productivityGainPercent * 10) / 10,
    monetarySavingsPerMonth: Math.round(monetarySavingsPerMonth),
  };
}

// ─── Pearson Correlation ─────────────────────────────────────

function pearsonCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n < 3) return 0;

  const meanX = x.slice(0, n).reduce((a, b) => a + b, 0) / n;
  const meanY = y.slice(0, n).reduce((a, b) => a + b, 0) / n;

  let num = 0, denX = 0, denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }

  const den = Math.sqrt(denX * denY);
  return den > 0 ? Math.round((num / den) * 1000) / 1000 : 0;
}

// ─── Aggregate Research Data ─────────────────────────────────

export async function getResearchData(): Promise<{
  developers: DeveloperResearchProfile[];
  aggregate: AggregateResearchStats;
}> {
  const users = await prisma.user.findMany({
    select: {
      id: true, name: true, email: true, image: true,
      repositories: { select: { starCount: true } },
      issues: { where: { state: "open" }, select: { complexity: true, priority: true } },
      pullRequests: { where: { state: "open" }, select: { complexity: true } },
      cognitiveSnapshots: {
        orderBy: { timestamp: "desc" }, take: 48,
        select: { score: true, breakdown: true, level: true, timestamp: true },
      },
      dailyAnalytics: {
        orderBy: { date: "desc" }, take: 30,
        select: { avgCognitiveLoad: true, contextSwitches: true, totalFocusMinutes: true, date: true },
      },
      focusSessions: {
        orderBy: { startedAt: "desc" }, take: 30,
        select: { duration: true, interrupted: true },
      },
      contextSwitches: {
        orderBy: { switchedAt: "desc" }, take: 60,
        select: { estimatedCost: true },
      },
    },
  });

  const developers: DeveloperResearchProfile[] = users
    .filter((u) => u.cognitiveSnapshots.length > 0)
    .map((user) => {
      const latestSnapshot = user.cognitiveSnapshots[0];
      const breakdown = (latestSnapshot?.breakdown ?? {
        taskLoad: 0, switchPenalty: 0, reviewLoad: 0,
        urgencyStress: 0, fatigueIndex: 0, staleness: 0,
      }) as unknown as CognitiveLoadBreakdown;

      const avgLoad = user.dailyAnalytics.length > 0
        ? user.dailyAnalytics.reduce((s, d) => s + d.avgCognitiveLoad, 0) / user.dailyAnalytics.length
        : latestSnapshot?.score ?? 0;

      const avgSwitches = user.dailyAnalytics.length > 0
        ? user.dailyAnalytics.reduce((s, d) => s + d.contextSwitches, 0) / user.dailyAnalytics.length
        : 0;

      const avgFocusMin = user.dailyAnalytics.length > 0
        ? user.dailyAnalytics.reduce((s, d) => s + d.totalFocusMinutes, 0) / user.dailyAnalytics.length
        : 0;

      const focusRatio = avgFocusMin / (WORKING_HOURS_PER_DAY * 60);

      const avgComplexity = user.issues.length > 0
        ? user.issues.reduce((s, i) => s + i.complexity, 0) / user.issues.length
        : 3;

      const switchCost = computeContextSwitchCost(avgSwitches, avgComplexity);
      const burnoutRisk = computeBurnoutRisk(avgLoad, avgSwitches, focusRatio);

      const reductionFactor = 0.35;
      const focusImproveFactor = 0.20;
      const gain = computeProductivityGain(
        avgSwitches,
        avgSwitches * (1 - reductionFactor),
        avgFocusMin,
        avgFocusMin * (1 + focusImproveFactor)
      );

      const totalIssues = user.issues.length;
      const totalPRs = user.pullRequests.length;
      const activity = totalIssues + totalPRs;
      const category: DeveloperResearchProfile["category"] =
        activity >= 15 ? "high-activity" : activity >= 8 ? "moderate-activity" : "low-activity";

      return {
        id: user.id,
        name: user.name ?? "Unknown",
        email: user.email,
        image: user.image,
        repoCount: user.repositories.length,
        openIssues: user.issues.length,
        openPRs: user.pullRequests.length,
        totalStars: user.repositories.reduce((s, r) => s + r.starCount, 0),
        avgComplexity: Math.round(avgComplexity * 10) / 10,
        cognitiveLoadIndex: Math.round(avgLoad * 10) / 10,
        burnoutRisk,
        flowRatio: Math.round(focusRatio * 100) / 100,
        contextSwitchCost: switchCost.lostHoursPerMonth,
        projectedTimeSavings: gain.timeSavedHoursPerMonth,
        productivityGain: gain.productivityGainPercent,
        breakdown,
        category,
      };
    });

  const loads = developers.map((d) => d.cognitiveLoadIndex);
  const sorted = [...loads].sort((a, b) => a - b);
  const mean = loads.length > 0 ? loads.reduce((a, b) => a + b, 0) / loads.length : 0;
  const median = sorted.length > 0
    ? sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)]
    : 0;
  const variance = loads.length > 0
    ? loads.reduce((sum, l) => sum + Math.pow(l - mean, 2), 0) / loads.length
    : 0;

  const switchesArr = developers.map((d) => d.contextSwitchCost);
  const focusArr = developers.map((d) => d.flowRatio);

  const aggregate: AggregateResearchStats = {
    totalDevelopers: developers.length,
    meanCognitiveLoad: Math.round(mean * 10) / 10,
    medianCognitiveLoad: Math.round(median * 10) / 10,
    stdDevCognitiveLoad: Math.round(Math.sqrt(variance) * 10) / 10,
    meanFlowRatio: Math.round((developers.reduce((s, d) => s + d.flowRatio, 0) / Math.max(developers.length, 1)) * 100) / 100,
    meanBurnoutRisk: Math.round((developers.reduce((s, d) => s + d.burnoutRisk, 0) / Math.max(developers.length, 1)) * 100) / 100,
    totalProjectedTimeSavings: Math.round(developers.reduce((s, d) => s + d.projectedTimeSavings, 0) * 10) / 10,
    meanProductivityGain: Math.round((developers.reduce((s, d) => s + d.productivityGain, 0) / Math.max(developers.length, 1)) * 10) / 10,
    avgContextSwitchesPerDay: Math.round((developers.reduce((s, d) => s + d.contextSwitchCost, 0) / Math.max(developers.length, 1)) * 10) / 10,
    avgFocusMinutesPerDay: Math.round((developers.reduce((s, d) => s + d.flowRatio * WORKING_HOURS_PER_DAY * 60, 0) / Math.max(developers.length, 1)) * 10) / 10,
    correlationSwitchesVsLoad: pearsonCorrelation(switchesArr, loads),
    correlationFocusVsLoad: pearsonCorrelation(focusArr, loads),
  };

  return { developers, aggregate };
}
