import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { AnalyticsClient } from "./analytics-client";

export const metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const user = await requireAuth();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [snapshots, dailyData, focusSessions, switches] = await Promise.all([
    prisma.cognitiveSnapshot.findMany({
      where: { userId: user.id, timestamp: { gte: thirtyDaysAgo } },
      orderBy: { timestamp: "asc" },
      select: { score: true, level: true, timestamp: true, breakdown: true },
    }),
    prisma.dailyAnalytics.findMany({
      where: { userId: user.id, date: { gte: thirtyDaysAgo } },
      orderBy: { date: "asc" },
    }),
    prisma.focusSession.findMany({
      where: { userId: user.id, startedAt: { gte: thirtyDaysAgo } },
      select: { duration: true, startedAt: true },
    }),
    prisma.contextSwitch.findMany({
      where: { userId: user.id, switchedAt: { gte: thirtyDaysAgo } },
      select: { switchedAt: true, estimatedCost: true },
    }),
  ]);

  return (
    <AnalyticsClient
      snapshots={snapshots.map((s) => ({
        score: s.score,
        level: s.level,
        timestamp: s.timestamp.toISOString(),
        breakdown: s.breakdown as Record<string, number>,
      }))}
      dailyData={dailyData.map((d) => ({
        date: d.date.toISOString(),
        totalFocusMinutes: d.totalFocusMinutes,
        contextSwitches: d.contextSwitches,
        avgCognitiveLoad: d.avgCognitiveLoad,
        deepWorkStreaks: d.deepWorkStreaks,
      }))}
      focusSessions={focusSessions.map((s) => ({
        duration: s.duration,
        startedAt: s.startedAt.toISOString(),
      }))}
      switches={switches.map((s) => ({
        switchedAt: s.switchedAt.toISOString(),
        estimatedCost: s.estimatedCost,
      }))}
    />
  );
}
