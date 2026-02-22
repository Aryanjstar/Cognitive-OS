import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { BriefingsClient } from "./briefings-client";

export const metadata = { title: "Briefings" };

export default async function BriefingsPage() {
  const user = await requireAuth();

  const [briefings, openIssues, openPRs] = await Promise.all([
    prisma.aIBriefing.findMany({
      where: { userId: user.id },
      orderBy: { generatedAt: "desc" },
      take: 20,
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
  ]);

  const tasks = [
    ...openIssues.map((i) => ({
      id: i.id,
      type: "issue" as const,
      title: i.title,
      number: i.number,
      repo: i.repository.name,
    })),
    ...openPRs.map((pr) => ({
      id: pr.id,
      type: "pr" as const,
      title: pr.title,
      number: pr.number,
      repo: pr.repository.name,
    })),
  ];

  return (
    <BriefingsClient
      briefings={briefings.map((b) => ({
        id: b.id,
        taskId: b.taskId,
        taskType: b.taskType,
        title: b.title,
        content: b.content,
        sections: b.sections as {
          whatChanged: string;
          keyDecisions: string;
          currentStatus: string;
          needsAttention: string;
        },
        generatedAt: b.generatedAt.toISOString(),
      }))}
      tasks={tasks}
    />
  );
}
