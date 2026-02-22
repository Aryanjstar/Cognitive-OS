import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "./dashboard-client";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireAuth();

  const [
    latestSnapshot,
    recentSnapshots,
    openIssues,
    openPRs,
    todaySwitches,
    todayFocus,
    recommendations,
    dailyAnalytics,
  ] = await Promise.all([
    prisma.cognitiveSnapshot.findFirst({
      where: { userId: user.id },
      orderBy: { timestamp: "desc" },
    }),
    prisma.cognitiveSnapshot.findMany({
      where: {
        userId: user.id,
        timestamp: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { timestamp: "asc" },
      select: { score: true, timestamp: true },
    }),
    prisma.issue.findMany({
      where: { userId: user.id, state: "open" },
      include: { repository: { select: { name: true } } },
      orderBy: { complexity: "desc" },
      take: 10,
    }),
    prisma.pullRequest.findMany({
      where: { userId: user.id, state: "open" },
      include: { repository: { select: { name: true } } },
      orderBy: { complexity: "desc" },
      take: 10,
    }),
    prisma.contextSwitch.findMany({
      where: {
        userId: user.id,
        switchedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
      orderBy: { switchedAt: "desc" },
    }),
    prisma.focusSession.findMany({
      where: {
        userId: user.id,
        startedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    prisma.agentRecommendation.findMany({
      where: { userId: user.id, dismissed: false },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.dailyAnalytics.findFirst({
      where: {
        userId: user.id,
        date: new Date(new Date().toISOString().split("T")[0]),
      },
    }),
  ]);

  const tasks = [
    ...openIssues.map((i) => ({
      id: i.id,
      type: "issue" as const,
      title: i.title,
      number: i.number,
      repo: i.repository.name,
      complexity: i.complexity,
      state: i.state,
    })),
    ...openPRs.map((pr) => ({
      id: pr.id,
      type: "pr" as const,
      title: pr.title,
      number: pr.number,
      repo: pr.repository.name,
      complexity: pr.complexity,
      state: pr.state,
    })),
  ].sort((a, b) => b.complexity - a.complexity);

  const switches = todaySwitches.map((s) => ({
    id: s.id,
    fromTask: s.fromTaskType,
    toTask: s.toTaskType,
    switchedAt: s.switchedAt.toISOString(),
    estimatedCost: s.estimatedCost,
  }));

  const totalFocusMinutes = todayFocus.reduce(
    (sum, s) => sum + Math.floor(s.duration / 60),
    0
  );

  return (
    <DashboardClient
      cognitiveScore={{
        score: latestSnapshot?.score ?? 0,
        level: (latestSnapshot?.level as "flow" | "moderate" | "overloaded") ?? "flow",
        breakdown: latestSnapshot?.breakdown as {
          taskLoad: number;
          switchPenalty: number;
          reviewLoad: number;
          urgencyStress: number;
          fatigueIndex: number;
          staleness: number;
        } | undefined,
      }}
      history={recentSnapshots.map((s) => ({
        score: s.score,
        timestamp: s.timestamp.toISOString(),
      }))}
      tasks={tasks}
      switches={switches}
      stats={{
        focusMinutes: totalFocusMinutes,
        contextSwitches: todaySwitches.length,
        deepWorkStreak: dailyAnalytics?.deepWorkStreaks ?? 0,
        tasksCompleted: dailyAnalytics?.tasksCompleted ?? 0,
      }}
      recommendations={recommendations.map((r) => ({
        id: r.id,
        agent: r.agent,
        type: r.type,
        message: r.message,
        priority: r.priority,
        estimatedCostMinutes: r.estimatedCostMinutes,
        dismissed: r.dismissed,
      }))}
    />
  );
}
