import { prisma } from "@/lib/prisma";
import { calculateCognitiveLoad } from "@/lib/cognitive-engine";
import { runFocusAgent } from "./focus-agent";
import { runPlanningAgent } from "./planning-agent";
import { runInterruptGuard } from "./interrupt-guard";

export async function runOrchestrator(
  userId: string,
  trigger: "periodic" | "new_task" | "manual",
  newTaskContext?: {
    taskTitle: string;
    taskComplexity: number;
    taskPriority: number;
  }
) {
  const cognitiveScore = await calculateCognitiveLoad(userId);

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const [openIssueCount, openPRCount, todaySwitchCount, todayFocus, lastSession] =
    await Promise.all([
      prisma.issue.count({ where: { userId, state: "open" } }),
      prisma.pullRequest.count({ where: { userId, state: "open" } }),
      prisma.contextSwitch.count({
        where: { userId, switchedAt: { gte: todayStart } },
      }),
      prisma.focusSession.findMany({
        where: { userId, startedAt: { gte: todayStart } },
        select: { duration: true },
      }),
      prisma.focusSession.findFirst({
        where: { userId },
        orderBy: { startedAt: "desc" },
        select: { endedAt: true, startedAt: true },
      }),
    ]);

  const focusMinutesToday = todayFocus.reduce(
    (sum, s) => sum + Math.floor(s.duration / 60),
    0
  );

  let hoursSinceBreak = 0;
  if (lastSession?.endedAt) {
    hoursSinceBreak =
      (now.getTime() - lastSession.endedAt.getTime()) / (1000 * 60 * 60);
  }

  const results: {
    agent: string;
    type: string;
    message: string;
    priority: string;
    estimatedCostMinutes?: number;
    suggestedActions: string[];
  }[] = [];

  // --- Focus Agent ---
  if (trigger === "periodic" || trigger === "manual") {
    const focusResult = await runFocusAgent(cognitiveScore, {
      openTaskCount: openIssueCount + openPRCount,
      todaySwitches: todaySwitchCount,
      hoursSinceBreak,
      focusMinutesToday,
    });

    if (focusResult.shouldIntervene) {
      results.push({
        agent: "focus",
        type: focusResult.priority === "critical" ? "break" : "defer",
        message: focusResult.message,
        priority: focusResult.priority,
        suggestedActions: focusResult.suggestedActions,
      });
    }
  }

  // --- Planning Agent ---
  if (trigger === "periodic" || trigger === "manual") {
    const openIssues = await prisma.issue.findMany({
      where: { userId, state: "open" },
      include: { repository: { select: { name: true } } },
      take: 15,
    });

    const openPRs = await prisma.pullRequest.findMany({
      where: { userId, state: "open" },
      include: { repository: { select: { name: true } } },
      take: 10,
    });

    const tasksForPlanning = [
      ...openIssues.map((i) => ({
        id: i.id,
        title: i.title,
        type: "issue" as const,
        complexity: i.complexity,
        priority: i.priority,
        repo: i.repository.name,
        state: i.state,
        ageDays: Math.floor(
          (now.getTime() - i.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        ),
      })),
      ...openPRs.map((pr) => ({
        id: pr.id,
        title: pr.title,
        type: "pr" as const,
        complexity: pr.complexity,
        priority: 3,
        repo: pr.repository.name,
        state: pr.state,
        ageDays: Math.floor(
          (now.getTime() - pr.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        ),
      })),
    ];

    if (tasksForPlanning.length > 0) {
      const planResult = await runPlanningAgent(tasksForPlanning, {
        currentHour: now.getHours(),
        cognitiveScore: cognitiveScore.score,
        focusMinutesToday,
      });

      results.push({
        agent: "planning",
        type: "reorder",
        message: planResult.message,
        priority: "low",
        suggestedActions: planResult.suggestedActions,
      });
    }
  }

  // --- Interrupt Guard ---
  if (trigger === "new_task" && newTaskContext) {
    const currentTask = await prisma.focusSession.findFirst({
      where: { userId, endedAt: null },
      orderBy: { startedAt: "desc" },
    });

    const focusDepth = currentTask
      ? Math.floor(
          (now.getTime() - currentTask.startedAt.getTime()) / (1000 * 60)
        )
      : 0;

    const guardResult = await runInterruptGuard({
      currentTaskTitle: currentTask?.taskType ?? "general work",
      currentTaskComplexity: 5,
      focusDepthMinutes: focusDepth,
      cognitiveScore: cognitiveScore.score,
      newTaskTitle: newTaskContext.taskTitle,
      newTaskComplexity: newTaskContext.taskComplexity,
      newTaskPriority: newTaskContext.taskPriority,
    });

    results.push({
      agent: "interrupt-guard",
      type: guardResult.recommendation,
      message: guardResult.message,
      priority: guardResult.priority,
      estimatedCostMinutes: guardResult.estimatedCostMinutes,
      suggestedActions: guardResult.suggestedActions,
    });
  }

  // --- Persist recommendations ---
  for (const result of results) {
    await prisma.agentRecommendation.create({
      data: {
        userId,
        agent: result.agent,
        type: result.type,
        message: result.message,
        priority: result.priority,
        estimatedCostMinutes: result.estimatedCostMinutes,
        suggestedActions: result.suggestedActions,
      },
    });
  }

  return results;
}
