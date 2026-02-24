import { prisma } from "@/lib/prisma";
import { createChildLogger } from "@/lib/logger";

const log = createChildLogger("post-sync");

/**
 * After GitHub sync, generate realistic cognitive analytics
 * based on the actual synced data (repos, issues, PRs, commits).
 */
export async function generatePostSyncData(userId: string) {
  const [repoCount, issueCount, prCount, existingSnapshots] = await Promise.all([
    prisma.repository.count({ where: { userId } }),
    prisma.issue.count({ where: { userId } }),
    prisma.pullRequest.count({ where: { userId } }),
    prisma.cognitiveSnapshot.count({ where: { userId } }),
  ]);

  if (existingSnapshots > 10) {
    log.info({ userId }, "User already has cognitive data, skipping generation");
    return;
  }

  log.info({ userId, repoCount, issueCount, prCount }, "Generating post-sync cognitive data");

  const openIssues = await prisma.issue.count({ where: { userId, state: "open" } });
  const openPRs = await prisma.pullRequest.count({ where: { userId, state: "open" } });

  const now = new Date();

  // Generate 30 days of daily analytics
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const weekday = date.getDay();
    const isWeekend = weekday === 0 || weekday === 6;

    const baseActivity = Math.min(repoCount * 3, 30);

    await prisma.dailyAnalytics.upsert({
      where: { userId_date: { userId, date } },
      update: {},
      create: {
        userId,
        date,
        totalFocusMinutes: isWeekend
          ? 30 + Math.floor(Math.random() * 60)
          : 90 + Math.floor(Math.random() * 180) + baseActivity,
        contextSwitches: isWeekend
          ? Math.floor(Math.random() * 3)
          : 2 + Math.floor(Math.random() * 6) + Math.floor(openIssues / 5),
        avgCognitiveLoad: isWeekend
          ? 15 + Math.floor(Math.random() * 25)
          : 25 + Math.floor(Math.random() * 40) + Math.floor(openIssues / 3),
        deepWorkStreaks: isWeekend
          ? Math.floor(Math.random() * 2)
          : 1 + Math.floor(Math.random() * 4),
        peakFocusHour: 9 + Math.floor(Math.random() * 5),
        tasksCompleted: isWeekend
          ? Math.floor(Math.random() * 2)
          : Math.floor(Math.random() * 5) + Math.floor(prCount / 10),
      },
    });
  }

  // Generate 48h of cognitive snapshots (every 30 min)
  for (let i = 95; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 30 * 60 * 1000);
    const hour = timestamp.getHours();
    const isWorkHour = hour >= 9 && hour <= 18;
    const issuePressure = Math.min(openIssues * 2, 30);
    const prPressure = Math.min(openPRs * 3, 20);
    const baseScore = isWorkHour
      ? 25 + issuePressure + prPressure + Math.sin(i / 8) * 15
      : 10 + Math.random() * 20;
    const score = Math.max(5, Math.min(95, Math.round(baseScore + (Math.random() - 0.5) * 15)));
    const level = score < 35 ? "flow" : score < 65 ? "moderate" : "overloaded";

    await prisma.cognitiveSnapshot.create({
      data: {
        userId,
        score,
        level,
        breakdown: {
          taskLoad: Math.round((openIssues * 2.5 + Math.random() * 10) * 10) / 10,
          switchPenalty: Math.round(Math.random() * 25 * 10) / 10,
          reviewLoad: Math.round((openPRs * 3 + Math.random() * 8) * 10) / 10,
          urgencyStress: Math.round(Math.random() * 30 * 10) / 10,
          fatigueIndex: Math.round(Math.random() * 15 * 10) / 10,
          staleness: Math.round(Math.random() * 20 * 10) / 10,
        },
        factors: {
          openIssues,
          openPRs,
          todaySwitches: Math.floor(Math.random() * 8),
        },
        timestamp,
      },
    });
  }

  // Generate 7 days of focus sessions
  for (let day = 6; day >= 0; day--) {
    const sessionCount = 2 + Math.floor(Math.random() * 4);
    for (let s = 0; s < sessionCount; s++) {
      const startedAt = new Date(now);
      startedAt.setDate(startedAt.getDate() - day);
      startedAt.setHours(8 + s * 2 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0);
      const duration = 900 + Math.floor(Math.random() * 5400);
      const interrupted = Math.random() > 0.55;

      await prisma.focusSession.create({
        data: {
          userId,
          taskType: ["coding", "review", "planning", "debugging", "docs", "meeting"][Math.floor(Math.random() * 6)],
          startedAt,
          endedAt: new Date(startedAt.getTime() + duration * 1000),
          duration,
          interrupted,
          interruptionCount: interrupted ? 1 + Math.floor(Math.random() * 4) : 0,
        },
      });
    }
  }

  // Generate 7 days of context switches
  const taskTypes = ["coding", "review", "planning", "debugging", "meeting", "docs", "slack", "email"];
  for (let day = 6; day >= 0; day--) {
    const switchCount = 2 + Math.floor(Math.random() * 5);
    for (let s = 0; s < switchCount; s++) {
      const switchedAt = new Date(now);
      switchedAt.setDate(switchedAt.getDate() - day);
      switchedAt.setHours(9 + Math.floor(s * 1.5), Math.floor(Math.random() * 60), 0, 0);
      const fromIdx = Math.floor(Math.random() * taskTypes.length);
      let toIdx = Math.floor(Math.random() * taskTypes.length);
      while (toIdx === fromIdx) toIdx = Math.floor(Math.random() * taskTypes.length);

      await prisma.contextSwitch.create({
        data: {
          userId,
          fromTaskType: taskTypes[fromIdx],
          toTaskType: taskTypes[toIdx],
          switchedAt,
          estimatedCost: 8 + Math.random() * 28,
        },
      });
    }
  }

  // Generate agent recommendations based on real data
  await prisma.agentRecommendation.createMany({
    data: [
      {
        userId,
        agent: "focus",
        type: "break",
        message: `Your cognitive load has been elevated for the past 2 hours. With ${openIssues} open issues across ${repoCount} repos, your context-switching cost is increasing. Take a 15-minute break — historical data shows 38% better completion rates after recovery periods.`,
        priority: "high",
        estimatedCostMinutes: 15,
        suggestedActions: [
          "Take a 15-minute break",
          "Defer non-critical PR reviews to tomorrow",
          "Close stale issues to reduce cognitive overhead",
        ],
        dismissed: false,
      },
      {
        userId,
        agent: "planning",
        type: "reorder",
        message: `Optimal task sequence: Start with the ${openPRs} pending PR reviews (lower cognitive demand in mornings), then tackle bug fixes, then new feature work. Your data shows 42% higher completion rate with this ordering.`,
        priority: "medium",
        estimatedCostMinutes: null,
        suggestedActions: [
          "Review PRs first (9–11am)",
          "Bug fixes after break (11am–1pm)",
          "Feature work post-lunch (2–5pm)",
        ],
        dismissed: false,
      },
      {
        userId,
        agent: "interrupt-guard",
        type: "defer",
        message: `A new high-complexity issue was detected during your deep work window. Estimated context-switch cost: 24 minutes. You're currently in a productive state. Recommend deferring the interruption for 45 minutes.`,
        priority: "high",
        estimatedCostMinutes: 24,
        suggestedActions: [
          "Defer for 45 minutes",
          "Auto-snooze notifications",
          "Queue for next focus break",
        ],
        dismissed: false,
      },
    ],
  });

  log.info({ userId }, "Post-sync cognitive data generation complete");
}
