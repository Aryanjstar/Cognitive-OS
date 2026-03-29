import { prisma } from "@/lib/prisma";
import type { CognitiveScore, CognitiveLoadBreakdown } from "@/types";

const WEIGHTS = {
  SWITCH_COST_FACTOR: 5,
  REVIEW_WEIGHT: 3,
  URGENCY_MULTIPLIER: 8,
  FATIGUE_RATE: 2,
  STALENESS_FACTOR: 1,
  TASK_COMPLEXITY_BASE: 2,
};

/**
 * Adaptive weight adjustment based on user's historical patterns.
 * Learns which factors correlate most with the user's overloaded states.
 */
async function getAdaptiveWeights(userId: string) {
  const recentSnapshots = await prisma.cognitiveSnapshot.findMany({
    where: { userId },
    orderBy: { timestamp: "desc" },
    take: 50,
    select: { score: true, breakdown: true, level: true, timestamp: true },
  });

  if (recentSnapshots.length < 10) return WEIGHTS;

  const overloadedSnapshots = recentSnapshots.filter(
    (s) => s.level === "overloaded"
  );

  if (overloadedSnapshots.length < 3) return WEIGHTS;

  const avgBreakdown = overloadedSnapshots.reduce(
    (acc, s) => {
      const b = s.breakdown as unknown as CognitiveLoadBreakdown;
      return {
        taskLoad: acc.taskLoad + b.taskLoad,
        switchPenalty: acc.switchPenalty + b.switchPenalty,
        reviewLoad: acc.reviewLoad + b.reviewLoad,
        urgencyStress: acc.urgencyStress + b.urgencyStress,
        fatigueIndex: acc.fatigueIndex + b.fatigueIndex,
        staleness: acc.staleness + b.staleness,
      };
    },
    {
      taskLoad: 0,
      switchPenalty: 0,
      reviewLoad: 0,
      urgencyStress: 0,
      fatigueIndex: 0,
      staleness: 0,
    }
  );

  const count = overloadedSnapshots.length;
  const dominant = Object.entries(avgBreakdown).sort(
    ([, a], [, b]) => b / count - a / count
  )[0][0];

  const adaptiveWeights = { ...WEIGHTS };
  const boostMap: Record<string, keyof typeof WEIGHTS> = {
    taskLoad: "TASK_COMPLEXITY_BASE",
    switchPenalty: "SWITCH_COST_FACTOR",
    reviewLoad: "REVIEW_WEIGHT",
    urgencyStress: "URGENCY_MULTIPLIER",
    fatigueIndex: "FATIGUE_RATE",
    staleness: "STALENESS_FACTOR",
  };

  const key = boostMap[dominant];
  if (key) {
    adaptiveWeights[key] = Math.round(WEIGHTS[key] * 1.25 * 10) / 10;
  }

  return adaptiveWeights;
}

/**
 * Apply exponential decay weighting — recent data matters more.
 * Half-life of 3 days: data from 3 days ago has half the weight.
 */
function applyHistoricalWeighting(
  recentSnapshots: { score: number; timestamp: Date }[]
): number {
  if (recentSnapshots.length === 0) return 0;

  const now = Date.now();
  const HALF_LIFE_MS = 3 * 24 * 60 * 60 * 1000;

  let weightedSum = 0;
  let totalWeight = 0;

  for (const s of recentSnapshots) {
    const age = now - s.timestamp.getTime();
    const weight = Math.pow(0.5, age / HALF_LIFE_MS);
    weightedSum += s.score * weight;
    totalWeight += weight;
  }

  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}

/**
 * Detect anomalies — sudden spikes in cognitive load.
 * Returns anomaly info if current score deviates significantly from recent trend.
 */
function detectAnomaly(
  currentScore: number,
  recentSnapshots: { score: number; timestamp: Date }[]
): { isAnomaly: boolean; severity: "mild" | "moderate" | "severe"; delta: number } {
  if (recentSnapshots.length < 5) {
    return { isAnomaly: false, severity: "mild", delta: 0 };
  }

  const scores = recentSnapshots.map((s) => s.score);
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance =
    scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
  const stdDev = Math.sqrt(variance);

  const delta = currentScore - mean;
  const zScore = stdDev > 0 ? delta / stdDev : 0;

  if (zScore > 2.5) {
    return { isAnomaly: true, severity: "severe", delta: Math.round(delta) };
  }
  if (zScore > 1.8) {
    return { isAnomaly: true, severity: "moderate", delta: Math.round(delta) };
  }
  if (zScore > 1.2) {
    return { isAnomaly: true, severity: "mild", delta: Math.round(delta) };
  }

  return { isAnomaly: false, severity: "mild", delta: Math.round(delta) };
}

/**
 * Compute trend direction from recent snapshots.
 */
function computeTrend(
  recentSnapshots: { score: number; timestamp: Date }[]
): "improving" | "stable" | "declining" {
  if (recentSnapshots.length < 3) return "stable";

  const recent = recentSnapshots.slice(0, Math.min(5, recentSnapshots.length));
  const older = recentSnapshots.slice(
    Math.min(5, recentSnapshots.length),
    Math.min(15, recentSnapshots.length)
  );

  if (older.length === 0) return "stable";

  const recentAvg = recent.reduce((s, r) => s + r.score, 0) / recent.length;
  const olderAvg = older.reduce((s, r) => s + r.score, 0) / older.length;
  const diff = recentAvg - olderAvg;

  if (diff > 8) return "declining";
  if (diff < -8) return "improving";
  return "stable";
}

export async function calculateCognitiveLoad(
  userId: string
): Promise<CognitiveScore> {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const [
    openIssues,
    openPRs,
    todaySwitches,
    lastFocusSession,
    recentSnapshots,
    adaptiveWeights,
  ] = await Promise.all([
    prisma.issue.findMany({
      where: { userId, state: "open" },
      select: { complexity: true, priority: true, createdAt: true },
    }),
    prisma.pullRequest.findMany({
      where: { userId, state: "open" },
      select: { complexity: true, createdAt: true },
    }),
    prisma.contextSwitch.count({
      where: { userId, switchedAt: { gte: todayStart } },
    }),
    prisma.focusSession.findFirst({
      where: { userId },
      orderBy: { startedAt: "desc" },
      select: { endedAt: true, startedAt: true },
    }),
    prisma.cognitiveSnapshot.findMany({
      where: { userId },
      orderBy: { timestamp: "desc" },
      take: 50,
      select: { score: true, timestamp: true },
    }),
    getAdaptiveWeights(userId),
  ]);

  // --- Task Load ---
  const taskLoad = openIssues.reduce(
    (sum, issue) =>
      sum +
      issue.complexity *
        issue.priority *
        adaptiveWeights.TASK_COMPLEXITY_BASE,
    0
  );

  // --- Switch Penalty ---
  const switchPenalty = todaySwitches * adaptiveWeights.SWITCH_COST_FACTOR;

  // --- Review Load ---
  const reviewLoad = openPRs.reduce(
    (sum, pr) => sum + pr.complexity * adaptiveWeights.REVIEW_WEIGHT,
    0
  );

  // --- Urgency Stress (tasks older than 7 days) ---
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const overdueCount = openIssues.filter(
    (i) => i.createdAt < sevenDaysAgo
  ).length;
  const urgencyStress = overdueCount * adaptiveWeights.URGENCY_MULTIPLIER;

  // --- Fatigue Index ---
  let hoursSinceBreak = 0;
  if (lastFocusSession?.endedAt) {
    hoursSinceBreak =
      (now.getTime() - lastFocusSession.endedAt.getTime()) / (1000 * 60 * 60);
  } else if (lastFocusSession?.startedAt) {
    hoursSinceBreak =
      (now.getTime() - lastFocusSession.startedAt.getTime()) /
      (1000 * 60 * 60);
  }
  const fatigueIndex =
    Math.min(hoursSinceBreak, 8) * adaptiveWeights.FATIGUE_RATE;

  // --- Staleness ---
  const avgTaskAgeDays =
    openIssues.length > 0
      ? openIssues.reduce(
          (sum, i) =>
            sum +
            (now.getTime() - i.createdAt.getTime()) / (1000 * 60 * 60 * 24),
          0
        ) / openIssues.length
      : 0;
  const staleness =
    Math.min(avgTaskAgeDays, 30) * adaptiveWeights.STALENESS_FACTOR;

  // --- Raw Score ---
  const rawScore =
    taskLoad +
    switchPenalty +
    reviewLoad +
    urgencyStress +
    fatigueIndex +
    staleness;

  // --- Blend with historical weighted average (30% historical, 70% current) ---
  const historicalAvg = applyHistoricalWeighting(recentSnapshots);
  const blendedRaw = normalize(rawScore, 0, 200) * 100;
  const currentScore =
    recentSnapshots.length >= 5
      ? Math.round(blendedRaw * 0.7 + historicalAvg * 0.3)
      : Math.round(blendedRaw);

  const score = Math.min(currentScore, 100);

  const level: CognitiveScore["level"] =
    score <= 30 ? "flow" : score <= 60 ? "moderate" : "overloaded";

  const breakdown: CognitiveLoadBreakdown = {
    taskLoad: Math.round(taskLoad * 10) / 10,
    switchPenalty: Math.round(switchPenalty * 10) / 10,
    reviewLoad: Math.round(reviewLoad * 10) / 10,
    urgencyStress: Math.round(urgencyStress * 10) / 10,
    fatigueIndex: Math.round(fatigueIndex * 10) / 10,
    staleness: Math.round(staleness * 10) / 10,
  };

  // --- Anomaly Detection ---
  const anomaly = detectAnomaly(score, recentSnapshots);
  const trend = computeTrend(recentSnapshots);

  // --- Persist snapshot with enriched metadata ---
  await prisma.cognitiveSnapshot.create({
    data: {
      userId,
      score,
      level,
      breakdown: breakdown as object,
      factors: {
        openIssues: openIssues.length,
        openPRs: openPRs.length,
        todaySwitches,
        overdueCount,
        hoursSinceBreak: Math.round(hoursSinceBreak * 10) / 10,
        avgTaskAgeDays: Math.round(avgTaskAgeDays * 10) / 10,
        anomaly,
        trend,
        adaptiveWeightsUsed: adaptiveWeights !== WEIGHTS,
      },
    },
  });

  return { score, level, breakdown, timestamp: now, anomaly, trend };
}

export async function getCognitiveHistory(
  userId: string,
  days: number = 7
): Promise<{ score: number; timestamp: Date }[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  return prisma.cognitiveSnapshot.findMany({
    where: { userId, timestamp: { gte: since } },
    orderBy: { timestamp: "asc" },
    select: { score: true, timestamp: true },
  });
}

export async function getLatestSnapshot(userId: string) {
  return prisma.cognitiveSnapshot.findFirst({
    where: { userId },
    orderBy: { timestamp: "desc" },
  });
}

function normalize(value: number, min: number, max: number): number {
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}
