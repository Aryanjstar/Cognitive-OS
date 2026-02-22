import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const user = await prisma.user.upsert({
    where: { email: "demo@cognitive-os.dev" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@cognitive-os.dev",
      image: "https://avatars.githubusercontent.com/u/0",
    },
  });

  const repo = await prisma.repository.upsert({
    where: { githubId: 100001 },
    update: {},
    create: {
      userId: user.id,
      githubId: 100001,
      name: "cognitive-os",
      fullName: "demo/cognitive-os",
      url: "https://github.com/demo/cognitive-os",
      description: "Cognitive Operating System for Developers",
      language: "TypeScript",
    },
  });

  const repo2 = await prisma.repository.upsert({
    where: { githubId: 100002 },
    update: {},
    create: {
      userId: user.id,
      githubId: 100002,
      name: "api-gateway",
      fullName: "demo/api-gateway",
      url: "https://github.com/demo/api-gateway",
      description: "API Gateway microservice",
      language: "Go",
    },
  });

  const issues = [
    { title: "Implement auth token refresh logic", complexity: 6, priority: 4, labels: ["bug", "high"], repoId: repo.id, githubId: 201 },
    { title: "Add rate limiting to public endpoints", complexity: 4, priority: 3, labels: ["enhancement"], repoId: repo.id, githubId: 202 },
    { title: "Fix memory leak in WebSocket handler", complexity: 8, priority: 5, labels: ["bug", "critical"], repoId: repo2.id, githubId: 203 },
    { title: "Migrate database schema for v2", complexity: 7, priority: 4, labels: ["enhancement"], repoId: repo.id, githubId: 204 },
    { title: "Update documentation for API v3", complexity: 2, priority: 2, labels: ["docs"], repoId: repo2.id, githubId: 205 },
    { title: "Implement caching layer for search", complexity: 5, priority: 3, labels: ["enhancement"], repoId: repo.id, githubId: 206 },
    { title: "Add E2E tests for checkout flow", complexity: 4, priority: 3, labels: ["testing"], repoId: repo.id, githubId: 207 },
    { title: "Optimize image processing pipeline", complexity: 6, priority: 2, labels: ["performance"], repoId: repo2.id, githubId: 208 },
  ];

  for (const issue of issues) {
    await prisma.issue.upsert({
      where: { repoId_githubId: { repoId: issue.repoId, githubId: issue.githubId } },
      update: {},
      create: {
        userId: user.id,
        repoId: issue.repoId,
        githubId: issue.githubId,
        number: issue.githubId - 200,
        title: issue.title,
        body: `Description for: ${issue.title}`,
        state: "open",
        labels: issue.labels,
        complexity: issue.complexity,
        priority: issue.priority,
        commentCount: Math.floor(Math.random() * 10),
        createdAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000),
      },
    });
  }

  const prs = [
    { title: "feat: Add cognitive load calculation engine", additions: 450, deletions: 30, files: 12, repoId: repo.id, githubId: 301 },
    { title: "fix: Resolve auth callback race condition", additions: 80, deletions: 25, files: 3, repoId: repo.id, githubId: 302 },
    { title: "refactor: Extract middleware into separate modules", additions: 200, deletions: 180, files: 8, repoId: repo2.id, githubId: 303 },
  ];

  for (const pr of prs) {
    await prisma.pullRequest.upsert({
      where: { repoId_githubId: { repoId: pr.repoId, githubId: pr.githubId } },
      update: {},
      create: {
        userId: user.id,
        repoId: pr.repoId,
        githubId: pr.githubId,
        number: pr.githubId - 300,
        title: pr.title,
        state: "open",
        additions: pr.additions,
        deletions: pr.deletions,
        changedFiles: pr.files,
        complexity: Math.min(Math.ceil((pr.additions + pr.deletions) / 100) + Math.ceil(pr.files / 5), 10),
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      },
    });
  }

  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    await prisma.dailyAnalytics.upsert({
      where: { userId_date: { userId: user.id, date } },
      update: {},
      create: {
        userId: user.id,
        date,
        totalFocusMinutes: 120 + Math.floor(Math.random() * 180),
        contextSwitches: 2 + Math.floor(Math.random() * 8),
        avgCognitiveLoad: 25 + Math.floor(Math.random() * 45),
        deepWorkStreaks: Math.floor(Math.random() * 4),
        peakFocusHour: 9 + Math.floor(Math.random() * 5),
        tasksCompleted: Math.floor(Math.random() * 5),
      },
    });
  }

  for (let i = 23; i >= 0; i--) {
    const timestamp = new Date(now);
    timestamp.setHours(timestamp.getHours() - i);

    await prisma.cognitiveSnapshot.create({
      data: {
        userId: user.id,
        score: 20 + Math.floor(Math.random() * 50),
        level: i % 3 === 0 ? "flow" : i % 3 === 1 ? "moderate" : "overloaded",
        breakdown: {
          taskLoad: 10 + Math.random() * 30,
          switchPenalty: Math.random() * 20,
          reviewLoad: Math.random() * 15,
          urgencyStress: Math.random() * 25,
          fatigueIndex: Math.random() * 10,
          staleness: Math.random() * 15,
        },
        factors: {
          openIssues: 8,
          openPRs: 3,
          todaySwitches: Math.floor(Math.random() * 6),
        },
        timestamp,
      },
    });
  }

  for (let i = 0; i < 5; i++) {
    const startedAt = new Date(now);
    startedAt.setHours(9 + i * 2, 0, 0, 0);
    const duration = 1200 + Math.floor(Math.random() * 3600);

    await prisma.focusSession.create({
      data: {
        userId: user.id,
        taskType: ["coding", "review", "planning", "debugging", "general"][i],
        startedAt,
        endedAt: new Date(startedAt.getTime() + duration * 1000),
        duration,
        interrupted: Math.random() > 0.6,
        interruptionCount: Math.floor(Math.random() * 3),
      },
    });
  }

  for (let i = 0; i < 4; i++) {
    const switchedAt = new Date(now);
    switchedAt.setHours(10 + i * 2, 30, 0, 0);

    await prisma.contextSwitch.create({
      data: {
        userId: user.id,
        fromTaskType: ["coding", "review", "coding", "meeting"][i],
        toTaskType: ["review", "coding", "debugging", "coding"][i],
        switchedAt,
        estimatedCost: 10 + Math.random() * 20,
      },
    });
  }

  await prisma.agentRecommendation.create({
    data: {
      userId: user.id,
      agent: "focus",
      type: "break",
      message:
        "Your cognitive load has been above 60 for 2 hours. Take a 15-minute break to restore mental clarity before tackling the database migration task.",
      priority: "high",
      suggestedActions: [
        "Take a 15-minute break",
        "Defer non-urgent PR reviews",
        "Consider a short walk",
      ],
    },
  });

  await prisma.agentRecommendation.create({
    data: {
      userId: user.id,
      agent: "planning",
      type: "reorder",
      message:
        "Based on your current energy level and task complexity, start with the rate limiting task (moderate) before tackling the WebSocket memory leak (high complexity).",
      priority: "low",
      suggestedActions: [
        "Start with Issue #2: Rate limiting",
        "Move to Issue #3: WebSocket fix after lunch",
        "Save documentation for end of day",
      ],
    },
  });

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
