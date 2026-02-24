import { config } from "dotenv";
config({ path: ".env.local", override: true });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

interface UserSeed {
  name: string;
  email: string;
  image: string;
  repos: RepoSeed[];
}

interface RepoSeed {
  githubId: number;
  name: string;
  fullName: string;
  url: string;
  description: string;
  language: string;
  stars: number;
  issues: IssueSeed[];
  prs: PRSeed[];
}

interface IssueSeed {
  githubId: number;
  title: string;
  body: string;
  complexity: number;
  priority: number;
  labels: string[];
  state: string;
  comments: number;
}

interface PRSeed {
  githubId: number;
  title: string;
  additions: number;
  deletions: number;
  files: number;
  state: string;
  reviews: number;
}

const users: UserSeed[] = [
  {
    name: "Aryan Jaiswal",
    email: "aryanjstar3@gmail.com",
    image: "https://avatars.githubusercontent.com/u/108309165",
    repos: [
      {
        githubId: 900001,
        name: "Cognitive-OS",
        fullName: "Aryanjstar/Cognitive-OS",
        url: "https://github.com/Aryanjstar/Cognitive-OS",
        description: "AI-powered cognitive operating system for developers",
        language: "TypeScript",
        stars: 12,
        issues: [
          { githubId: 1001, title: "Implement biometric HRV telemetry integration", body: "Integrate Heart Rate Variability data from wearable devices via BLE API to estimate NASA-TLX Effort dimension in real-time. This requires a local daemon (Rust/Go) exposing a WebSocket for the VS Code extension to consume.", complexity: 9, priority: 5, labels: ["feature", "critical", "research"], state: "open", comments: 8 },
          { githubId: 1002, title: "Add Temporal Knowledge Graph (TKG) for context memory", body: "Replace standard RAG with a Temporal Knowledge Graph. Each node/edge should have a validity date range. When facts change or code is refactored, automatically invalidate old information.", complexity: 10, priority: 5, labels: ["feature", "architecture", "research"], state: "open", comments: 12 },
          { githubId: 1003, title: "Build MCP server for local data sovereignty", body: "Implement a Model Context Protocol server using @modelcontextprotocol/sdk. Expose PostgreSQL schemas as resources and define tools for cognitive state extraction, branch briefings, and focus block metadata.", complexity: 8, priority: 4, labels: ["feature", "security"], state: "open", comments: 5 },
          { githubId: 1004, title: "Fix cognitive score calculation for zero-activity days", body: "When user has no focus sessions or context switches for a day, the fatigue index produces NaN due to division by zero. Add proper fallback handling.", complexity: 3, priority: 4, labels: ["bug", "engine"], state: "open", comments: 2 },
          { githubId: 1005, title: "Implement Bayesian interruption cost forecasting", body: "Replace static context-switch cost estimation with Bayesian statistical model that factors in current AST complexity, historical recovery time, and time-of-day patterns.", complexity: 8, priority: 3, labels: ["feature", "ml", "research"], state: "open", comments: 7 },
          { githubId: 1006, title: "Add team cognitive heatmaps for manager dashboard", body: "Create organization-level view showing cognitive load distribution across team members. Include bottleneck prediction and burnout risk indicators.", complexity: 7, priority: 3, labels: ["feature", "enterprise"], state: "open", comments: 4 },
        ],
        prs: [
          { githubId: 2001, title: "feat: implement multi-agent orchestrator with blackboard pattern", additions: 1280, deletions: 45, files: 18, state: "open", reviews: 3 },
          { githubId: 2002, title: "fix: resolve cognitive score NaN for zero-session days", additions: 42, deletions: 8, files: 2, state: "open", reviews: 1 },
          { githubId: 2003, title: "feat: add Apple-style parallax scroll animations to landing", additions: 890, deletions: 320, files: 9, state: "merged", reviews: 2 },
        ],
      },
      {
        githubId: 900002,
        name: "DevTinder",
        fullName: "Aryanjstar/DevTinder",
        url: "https://github.com/Aryanjstar/DevTinder",
        description: "Tinder-like platform for developers to find collaborators",
        language: "JavaScript",
        stars: 35,
        issues: [
          { githubId: 1010, title: "Add real-time chat with WebSocket", body: "Implement a real-time messaging system using Socket.IO for matched developers to communicate.", complexity: 7, priority: 4, labels: ["feature", "real-time"], state: "open", comments: 6 },
          { githubId: 1011, title: "Implement ML-based profile matching", body: "Use collaborative filtering to improve match quality based on tech stack overlap, contribution patterns, and project interests.", complexity: 8, priority: 3, labels: ["feature", "ml"], state: "open", comments: 9 },
          { githubId: 1012, title: "Fix CORS issue on production deployment", body: "Socket.IO connections fail on production due to CORS policy. Need to configure proper origin whitelist.", complexity: 2, priority: 5, labels: ["bug", "production"], state: "open", comments: 3 },
        ],
        prs: [
          { githubId: 2010, title: "feat: add Socket.IO real-time messaging", additions: 560, deletions: 12, files: 11, state: "open", reviews: 2 },
        ],
      },
    ],
  },
  {
    name: "Priya Sharma",
    email: "priya.sharma.dev@gmail.com",
    image: "https://avatars.githubusercontent.com/u/44446532",
    repos: [
      {
        githubId: 900010,
        name: "react-query-dashboard",
        fullName: "priyasharma/react-query-dashboard",
        url: "https://github.com/priyasharma/react-query-dashboard",
        description: "Enterprise analytics dashboard built with React Query and Recharts",
        language: "TypeScript",
        stars: 148,
        issues: [
          { githubId: 1020, title: "Add virtualized table for 10k+ row datasets", body: "Current table component crashes when rendering more than 5000 rows. Need to integrate react-window or tanstack-virtual for smooth scrolling with large datasets.", complexity: 6, priority: 5, labels: ["performance", "critical"], state: "open", comments: 11 },
          { githubId: 1021, title: "Implement column-level access control", body: "Add role-based column visibility so admin users see all columns while viewers see a restricted set. Needs integration with the existing RBAC system.", complexity: 5, priority: 3, labels: ["feature", "security"], state: "open", comments: 4 },
          { githubId: 1022, title: "Fix chart tooltip positioning on mobile", body: "Recharts tooltip overflows screen on narrow viewports. Need to detect viewport edges and reposition.", complexity: 3, priority: 3, labels: ["bug", "mobile"], state: "open", comments: 2 },
          { githubId: 1023, title: "Add CSV/Excel export functionality", body: "Users need to export filtered data as CSV or Excel. Should respect column visibility and active filters.", complexity: 4, priority: 4, labels: ["feature"], state: "open", comments: 5 },
          { githubId: 1024, title: "Migrate from Create React App to Vite", body: "CRA is deprecated. Migrate to Vite for faster builds and HMR. Need to update all config files and CI pipeline.", complexity: 6, priority: 2, labels: ["chore", "dx"], state: "open", comments: 7 },
        ],
        prs: [
          { githubId: 2020, title: "feat: add tanstack-virtual for large dataset rendering", additions: 340, deletions: 120, files: 6, state: "open", reviews: 4 },
          { githubId: 2021, title: "fix: tooltip positioning on mobile viewports", additions: 65, deletions: 20, files: 3, state: "open", reviews: 1 },
        ],
      },
      {
        githubId: 900011,
        name: "graphql-codegen-toolkit",
        fullName: "priyasharma/graphql-codegen-toolkit",
        url: "https://github.com/priyasharma/graphql-codegen-toolkit",
        description: "Auto-generate TypeScript types and React hooks from GraphQL schemas",
        language: "TypeScript",
        stars: 89,
        issues: [
          { githubId: 1030, title: "Support for GraphQL subscriptions codegen", body: "Currently only generates types for queries and mutations. Need to add subscription hook generation.", complexity: 7, priority: 3, labels: ["feature"], state: "open", comments: 6 },
          { githubId: 1031, title: "Fix duplicate type generation for union types", body: "When a union type is used in multiple queries, the codegen creates duplicate TypeScript types.", complexity: 4, priority: 4, labels: ["bug"], state: "open", comments: 3 },
        ],
        prs: [
          { githubId: 2030, title: "feat: add subscription hook generation", additions: 280, deletions: 15, files: 5, state: "open", reviews: 2 },
        ],
      },
    ],
  },
  {
    name: "Rahul Verma",
    email: "rahul.verma.eng@gmail.com",
    image: "https://avatars.githubusercontent.com/u/35825286",
    repos: [
      {
        githubId: 900020,
        name: "kubernetes-autoscaler",
        fullName: "rahulverma/kubernetes-autoscaler",
        url: "https://github.com/rahulverma/kubernetes-autoscaler",
        description: "Custom HPA controller with ML-based predictive scaling for Kubernetes",
        language: "Go",
        stars: 312,
        issues: [
          { githubId: 1040, title: "Implement LSTM-based traffic prediction model", body: "Replace the current linear regression model with an LSTM network trained on 30-day historical metrics for more accurate scaling predictions.", complexity: 9, priority: 4, labels: ["feature", "ml", "core"], state: "open", comments: 15 },
          { githubId: 1041, title: "Add support for custom metrics from Prometheus", body: "Current implementation only supports CPU/memory metrics. Need to add Prometheus adapter for custom business metrics.", complexity: 6, priority: 4, labels: ["feature"], state: "open", comments: 8 },
          { githubId: 1042, title: "Fix race condition in scale-down cooldown", body: "Concurrent scale-down decisions can bypass the cooldown period. Need to add distributed locking.", complexity: 5, priority: 5, labels: ["bug", "critical"], state: "open", comments: 4 },
          { githubId: 1043, title: "Add Grafana dashboard templates", body: "Create pre-built Grafana dashboards showing scaling decisions, prediction accuracy, and cost savings.", complexity: 3, priority: 2, labels: ["docs", "monitoring"], state: "open", comments: 3 },
          { githubId: 1044, title: "Implement cost-aware scaling policies", body: "Factor in spot instance pricing and reserved instance utilization when making scaling decisions.", complexity: 7, priority: 3, labels: ["feature", "cost"], state: "open", comments: 6 },
          { githubId: 1045, title: "Add support for multi-cluster scaling", body: "Enable coordinated scaling across multiple Kubernetes clusters with a global controller.", complexity: 9, priority: 2, labels: ["feature", "enterprise"], state: "open", comments: 10 },
          { githubId: 1046, title: "Fix memory leak in metrics collector goroutine", body: "The metrics collector accumulates stale entries when pods are terminated. Needs proper cleanup.", complexity: 4, priority: 5, labels: ["bug", "memory"], state: "open", comments: 2 },
        ],
        prs: [
          { githubId: 2040, title: "feat: LSTM prediction model with 30-day training window", additions: 2100, deletions: 300, files: 24, state: "open", reviews: 7 },
          { githubId: 2041, title: "fix: distributed lock for scale-down cooldown", additions: 180, deletions: 45, files: 4, state: "open", reviews: 3 },
          { githubId: 2042, title: "docs: add Grafana dashboard JSON templates", additions: 450, deletions: 0, files: 6, state: "merged", reviews: 2 },
        ],
      },
    ],
  },
  {
    name: "Ananya Gupta",
    email: "ananya.gupta.tech@gmail.com",
    image: "https://avatars.githubusercontent.com/u/68780624",
    repos: [
      {
        githubId: 900030,
        name: "design-system-core",
        fullName: "ananyagupta/design-system-core",
        url: "https://github.com/ananyagupta/design-system-core",
        description: "Accessible, themeable React component library with Radix UI primitives",
        language: "TypeScript",
        stars: 567,
        issues: [
          { githubId: 1050, title: "Implement dark mode support for all components", body: "Add CSS variable-based theming so all 40+ components support dark mode out of the box. Must work with Tailwind dark: variant.", complexity: 7, priority: 4, labels: ["feature", "theming"], state: "open", comments: 18 },
          { githubId: 1051, title: "Add combobox component with async search", body: "Build a combobox that supports async data fetching, keyboard navigation, and virtual scrolling for large option lists.", complexity: 8, priority: 3, labels: ["feature", "a11y"], state: "open", comments: 9 },
          { githubId: 1052, title: "Fix focus trap escaping in nested modals", body: "When a dialog opens another dialog, Tab key can escape to background elements.", complexity: 5, priority: 5, labels: ["bug", "a11y", "critical"], state: "open", comments: 6 },
          { githubId: 1053, title: "Add Storybook interaction tests", body: "Migrate from manual Chromatic visual tests to Storybook play functions for automated interaction testing.", complexity: 5, priority: 3, labels: ["testing", "dx"], state: "open", comments: 4 },
          { githubId: 1054, title: "Reduce bundle size with tree-shaking improvements", body: "Current bundle is 180KB gzipped. Need to investigate named exports and side-effect marking for better tree-shaking.", complexity: 6, priority: 4, labels: ["performance"], state: "open", comments: 7 },
        ],
        prs: [
          { githubId: 2050, title: "feat: CSS variable theming system for dark mode", additions: 920, deletions: 380, files: 44, state: "open", reviews: 5 },
          { githubId: 2051, title: "fix: focus trap in nested dialog components", additions: 95, deletions: 30, files: 3, state: "open", reviews: 2 },
        ],
      },
      {
        githubId: 900031,
        name: "figma-to-code",
        fullName: "ananyagupta/figma-to-code",
        url: "https://github.com/ananyagupta/figma-to-code",
        description: "AI-powered Figma plugin that generates production React + Tailwind code",
        language: "TypeScript",
        stars: 234,
        issues: [
          { githubId: 1060, title: "Add auto-layout to flexbox conversion", body: "Figma auto-layout properties should map directly to CSS flexbox. Handle gap, padding, alignment.", complexity: 6, priority: 5, labels: ["feature", "core"], state: "open", comments: 12 },
          { githubId: 1061, title: "Support responsive breakpoints from Figma variants", body: "When a component has mobile/tablet/desktop variants, generate responsive Tailwind classes automatically.", complexity: 8, priority: 3, labels: ["feature"], state: "open", comments: 5 },
          { githubId: 1062, title: "Fix incorrect border-radius on nested frames", body: "Nested frames lose their border-radius values during code generation.", complexity: 3, priority: 4, labels: ["bug"], state: "open", comments: 2 },
        ],
        prs: [
          { githubId: 2060, title: "feat: auto-layout to flexbox conversion engine", additions: 680, deletions: 90, files: 8, state: "open", reviews: 3 },
        ],
      },
    ],
  },
  {
    name: "Vikram Singh",
    email: "vikram.singh.devops@gmail.com",
    image: "https://avatars.githubusercontent.com/u/12345678",
    repos: [
      {
        githubId: 900040,
        name: "terraform-azure-modules",
        fullName: "vikramsingh/terraform-azure-modules",
        url: "https://github.com/vikramsingh/terraform-azure-modules",
        description: "Production-ready Terraform modules for Azure infrastructure",
        language: "HCL",
        stars: 423,
        issues: [
          { githubId: 1070, title: "Add AKS module with managed identity", body: "Create a comprehensive AKS module supporting managed identity, CNI networking, and auto-scaling node pools.", complexity: 8, priority: 4, labels: ["feature", "aks"], state: "open", comments: 14 },
          { githubId: 1071, title: "Implement drift detection pipeline", body: "Build a CI/CD pipeline that detects Terraform state drift and creates PRs with the required changes.", complexity: 7, priority: 3, labels: ["feature", "ci-cd"], state: "open", comments: 8 },
          { githubId: 1072, title: "Fix NSG rule ordering in network module", body: "Network Security Group rules are applied in wrong priority order causing traffic drops.", complexity: 4, priority: 5, labels: ["bug", "critical", "networking"], state: "open", comments: 5 },
          { githubId: 1073, title: "Add cost estimation to plan output", body: "Integrate Infracost to show estimated monthly costs in terraform plan output.", complexity: 4, priority: 2, labels: ["feature", "cost"], state: "open", comments: 3 },
          { githubId: 1074, title: "Upgrade to Terraform 1.8 with import blocks", body: "Migrate from terraform import CLI to declarative import blocks. Update all modules.", complexity: 5, priority: 3, labels: ["chore", "upgrade"], state: "open", comments: 4 },
        ],
        prs: [
          { githubId: 2070, title: "feat: AKS module with managed identity and auto-scaling", additions: 1450, deletions: 0, files: 15, state: "open", reviews: 6 },
          { githubId: 2071, title: "fix: NSG rule priority ordering in network module", additions: 85, deletions: 60, files: 3, state: "open", reviews: 2 },
          { githubId: 2072, title: "chore: upgrade all modules to Terraform 1.8", additions: 320, deletions: 280, files: 22, state: "open", reviews: 4 },
        ],
      },
    ],
  },
];

async function seedUser(userData: UserSeed) {
  const user = await prisma.user.upsert({
    where: { email: userData.email },
    update: { name: userData.name, image: userData.image },
    create: {
      name: userData.name,
      email: userData.email,
      image: userData.image,
    },
  });

  for (const repoData of userData.repos) {
    const repo = await prisma.repository.upsert({
      where: { githubId: repoData.githubId },
      update: {},
      create: {
        userId: user.id,
        githubId: repoData.githubId,
        name: repoData.name,
        fullName: repoData.fullName,
        url: repoData.url,
        description: repoData.description,
        language: repoData.language,
        starCount: repoData.stars,
      },
    });

    for (const issue of repoData.issues) {
      await prisma.issue.upsert({
        where: { repoId_githubId: { repoId: repo.id, githubId: issue.githubId } },
        update: {},
        create: {
          userId: user.id,
          repoId: repo.id,
          githubId: issue.githubId,
          number: issue.githubId % 1000,
          title: issue.title,
          body: issue.body,
          state: issue.state,
          labels: issue.labels,
          complexity: issue.complexity,
          priority: issue.priority,
          commentCount: issue.comments,
          createdAt: new Date(Date.now() - Math.random() * 21 * 24 * 60 * 60 * 1000),
        },
      });
    }

    for (const pr of repoData.prs) {
      await prisma.pullRequest.upsert({
        where: { repoId_githubId: { repoId: repo.id, githubId: pr.githubId } },
        update: {},
        create: {
          userId: user.id,
          repoId: repo.id,
          githubId: pr.githubId,
          number: pr.githubId % 1000,
          title: pr.title,
          state: pr.state,
          additions: pr.additions,
          deletions: pr.deletions,
          changedFiles: pr.files,
          reviewComments: pr.reviews,
          complexity: Math.min(
            Math.ceil((pr.additions + pr.deletions) / 150) + Math.ceil(pr.files / 4),
            10
          ),
          createdAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const baseLoad = 25 + Math.sin(i / 3) * 15;
    const focusMins = 60 + Math.floor(Math.random() * 240);
    const switches = 1 + Math.floor(Math.random() * 8);

    await prisma.dailyAnalytics.upsert({
      where: { userId_date: { userId: user.id, date } },
      update: {},
      create: {
        userId: user.id,
        date,
        totalFocusMinutes: focusMins,
        contextSwitches: switches,
        avgCognitiveLoad: Math.round(baseLoad + Math.random() * 30),
        deepWorkStreaks: Math.floor(Math.random() * 5),
        peakFocusHour: 9 + Math.floor(Math.random() * 6),
        tasksCompleted: Math.floor(Math.random() * 6),
      },
    });
  }

  for (let i = 47; i >= 0; i--) {
    const timestamp = new Date(now);
    timestamp.setHours(timestamp.getHours() - i);

    const score = 15 + Math.floor(Math.random() * 60);
    const level = score < 40 ? "flow" : score < 70 ? "moderate" : "overloaded";

    await prisma.cognitiveSnapshot.create({
      data: {
        userId: user.id,
        score,
        level,
        breakdown: {
          taskLoad: 5 + Math.random() * 35,
          switchPenalty: Math.random() * 25,
          reviewLoad: Math.random() * 20,
          urgencyStress: Math.random() * 30,
          fatigueIndex: Math.random() * 15,
          staleness: Math.random() * 20,
        },
        factors: {
          openIssues: userData.repos.reduce((sum, r) => sum + r.issues.filter((i) => i.state === "open").length, 0),
          openPRs: userData.repos.reduce((sum, r) => sum + r.prs.filter((p) => p.state === "open").length, 0),
          todaySwitches: Math.floor(Math.random() * 8),
        },
        timestamp,
      },
    });
  }

  for (let day = 6; day >= 0; day--) {
    const sessionCount = 2 + Math.floor(Math.random() * 4);
    for (let s = 0; s < sessionCount; s++) {
      const startedAt = new Date(now);
      startedAt.setDate(startedAt.getDate() - day);
      startedAt.setHours(8 + s * 2 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0);
      const duration = 600 + Math.floor(Math.random() * 5400);
      const interrupted = Math.random() > 0.6;

      await prisma.focusSession.create({
        data: {
          userId: user.id,
          taskType: ["coding", "review", "planning", "debugging", "general", "meeting"][Math.floor(Math.random() * 6)],
          startedAt,
          endedAt: new Date(startedAt.getTime() + duration * 1000),
          duration,
          interrupted,
          interruptionCount: interrupted ? 1 + Math.floor(Math.random() * 3) : 0,
        },
      });
    }
  }

  for (let day = 6; day >= 0; day--) {
    const switchCount = 1 + Math.floor(Math.random() * 5);
    for (let s = 0; s < switchCount; s++) {
      const switchedAt = new Date(now);
      switchedAt.setDate(switchedAt.getDate() - day);
      switchedAt.setHours(9 + s * 2, Math.floor(Math.random() * 60), 0, 0);

      const types = ["coding", "review", "planning", "debugging", "meeting", "docs"];
      const fromIdx = Math.floor(Math.random() * types.length);
      let toIdx = Math.floor(Math.random() * types.length);
      while (toIdx === fromIdx) toIdx = Math.floor(Math.random() * types.length);

      await prisma.contextSwitch.create({
        data: {
          userId: user.id,
          fromTaskType: types[fromIdx],
          toTaskType: types[toIdx],
          switchedAt,
          estimatedCost: 8 + Math.random() * 25,
        },
      });
    }
  }

  const agentRecs = [
    {
      agent: "focus",
      type: "break",
      message: `${userData.name}, your cognitive load has been above 65 for 3 consecutive hours. Your HRV data suggests elevated cortisol. Take a 20-minute break before tackling the next complex task.`,
      priority: "high",
      costMin: 20,
      actions: ["Take a 20-minute break", "Defer non-critical PR reviews", "Try a brief walk or stretching"],
    },
    {
      agent: "planning",
      type: "reorder",
      message: `Based on your energy curve and task complexity analysis, start with the moderate-complexity bug fixes before the high-complexity feature work. Your historical data shows 34% higher completion rate with this ordering.`,
      priority: "medium",
      costMin: null,
      actions: ["Start with bug fixes (complexity 3-5)", "Move to feature work after lunch", "Save documentation for end of day"],
    },
    {
      agent: "interrupt-guard",
      type: "defer",
      message: `A new high-priority issue was assigned during your deep work session. The estimated context-switch cost is 28 minutes. Recommending deferral until your current focus block ends in 45 minutes.`,
      priority: "high",
      costMin: 28,
      actions: ["Defer for 45 minutes", "Auto-snooze Slack notifications", "Queue for next focus break"],
    },
  ];

  for (const rec of agentRecs) {
    await prisma.agentRecommendation.create({
      data: {
        userId: user.id,
        agent: rec.agent,
        type: rec.type,
        message: rec.message,
        priority: rec.priority,
        estimatedCostMinutes: rec.costMin,
        suggestedActions: rec.actions,
      },
    });
  }

  console.log(`  Seeded user: ${userData.name} (${userData.repos.length} repos, ${userData.repos.reduce((s, r) => s + r.issues.length, 0)} issues, ${userData.repos.reduce((s, r) => s + r.prs.length, 0)} PRs)`);
}

async function main() {
  console.log("Seeding Cognitive OS database with 5 users...\n");

  for (const userData of users) {
    await seedUser(userData);
  }

  console.log("\nSeed completed successfully!");
  console.log(`Total: ${users.length} users, ${users.reduce((s, u) => s + u.repos.length, 0)} repos`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
