import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { TasksClient } from "./tasks-client";

export const metadata = { title: "Tasks" };

interface IssueRecord {
  id: string;
  title: string;
  number: number;
  complexity: number;
  priority: number;
  state: string;
  labels: unknown;
  repoId: string;
  createdAt: Date;
  updatedAt: Date;
  repository: { name: string; fullName: string };
}

interface PRRecord {
  id: string;
  title: string;
  number: number;
  complexity: number;
  state: string;
  repoId: string;
  createdAt: Date;
  updatedAt: Date;
  repository: { name: string; fullName: string };
}

export default async function TasksPage() {
  const user = await requireAuth();

  const [issues, pullRequests, repos] = await Promise.all([
    prisma.issue.findMany({
      where: { userId: user.id },
      include: { repository: { select: { name: true, fullName: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.pullRequest.findMany({
      where: { userId: user.id },
      include: { repository: { select: { name: true, fullName: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.repository.findMany({
      where: { userId: user.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const tasks = [
    ...issues.map((i: IssueRecord) => ({
      id: i.id,
      type: "issue" as const,
      title: i.title,
      number: i.number,
      repo: i.repository.name,
      repoFullName: i.repository.fullName,
      repoId: i.repoId,
      complexity: i.complexity,
      priority: i.priority,
      state: i.state,
      labels: i.labels as string[],
      createdAt: i.createdAt.toISOString(),
      updatedAt: i.updatedAt.toISOString(),
    })),
    ...pullRequests.map((pr: PRRecord) => ({
      id: pr.id,
      type: "pr" as const,
      title: pr.title,
      number: pr.number,
      repo: pr.repository.name,
      repoFullName: pr.repository.fullName,
      repoId: pr.repoId,
      complexity: pr.complexity,
      priority: 1,
      state: pr.state,
      labels: [] as string[],
      createdAt: pr.createdAt.toISOString(),
      updatedAt: pr.updatedAt.toISOString(),
    })),
  ];

  return (
    <TasksClient
      tasks={tasks}
      repos={repos.map((r: { id: string; name: string }) => ({ id: r.id, name: r.name }))}
    />
  );
}
