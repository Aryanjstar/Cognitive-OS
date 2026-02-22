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
      take: 24,
      select: { score: true },
    }),
  ]);

  // --- Task Load ---
  const taskLoad = openIssues.reduce(
    (sum, issue) => sum + issue.complexity * issue.priority * WEIGHTS.TASK_COMPLEXITY_BASE,
    0
  );

  // --- Switch Penalty ---
  const switchPenalty = todaySwitches * WEIGHTS.SWITCH_COST_FACTOR;

  // --- Review Load ---
  const reviewLoad = openPRs.reduce(
    (sum, pr) => sum + pr.complexity * WEIGHTS.REVIEW_WEIGHT,
    0
  );

  // --- Urgency Stress (tasks older than 7 days) ---
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const overdueCount = openIssues.filter(
    (i) => i.createdAt < sevenDaysAgo
  ).length;
  const urgencyStress = overdueCount * WEIGHTS.URGENCY_MULTIPLIER;

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
  const fatigueIndex = Math.min(hoursSinceBreak, 8) * WEIGHTS.FATIGUE_RATE;

  // --- Staleness ---
  const avgTaskAgeDays =
    openIssues.length > 0
      ? openIssues.reduce(
          (sum, i) =>
            sum + (now.getTime() - i.createdAt.getTime()) / (1000 * 60 * 60 * 24),
          0
        ) / openIssues.length
      : 0;
  const staleness = Math.min(avgTaskAgeDays, 30) * WEIGHTS.STALENESS_FACTOR;

  // --- Raw Score ---
  const rawScore =
    taskLoad + switchPenalty + reviewLoad + urgencyStress + fatigueIndex + staleness;

  // --- Normalize to 0-100 ---
  const score = Math.min(Math.round(normalize(rawScore, 0, 200) * 100), 100);

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

  // --- Persist snapshot ---
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
      },
    },
  });

  return { score, level, breakdown, timestamp: now };
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
