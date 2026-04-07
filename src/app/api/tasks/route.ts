export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createChildLogger, logError } from "@/lib/logger";

const log = createChildLogger("api:tasks");

interface TaskRow {
  id: string;
  type: "issue" | "pr";
  title: string;
  number: number;
  repo: string;
  repoFullName: string;
  repoId: string;
  complexity: number;
  priority: number;
  state: string;
  labels: unknown;
  createdAt: string;
  updatedAt: string;
}

export async function GET(request: Request) {
  const start = Date.now();
  const path = new URL(request.url).pathname;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      log.warn({ path }, "Unauthorized tasks request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    log.info({ userId, path }, "Tasks request started");

    const [issues, pullRequests, repos] = await Promise.all([
      prisma.issue.findMany({
        where: { userId },
        include: {
          repository: { select: { name: true, fullName: true } },
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.pullRequest.findMany({
        where: { userId },
        include: {
          repository: { select: { name: true, fullName: true } },
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.repository.findMany({
        where: { userId },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
    ]);

    const issueTasks: TaskRow[] = issues.map((i) => ({
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
      labels: i.labels as unknown,
      createdAt: i.createdAt.toISOString(),
      updatedAt: i.updatedAt.toISOString(),
    }));

    const prTasks: TaskRow[] = pullRequests.map((p) => ({
      id: p.id,
      type: "pr" as const,
      title: p.title,
      number: p.number,
      repo: p.repository.name,
      repoFullName: p.repository.fullName,
      repoId: p.repoId,
      complexity: p.complexity,
      priority: 1,
      state: p.state,
      labels: [] as unknown,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

    const tasks = [...issueTasks, ...prTasks].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    const payload = {
      tasks,
      repos: repos.map((r) => ({ id: r.id, name: r.name })),
      _meta: {
        source: "GitHub API → sync → DB → tasks aggregate",
        taskCount: tasks.length,
        repoCount: repos.length,
      },
    };

    const durationMs = Date.now() - start;
    log.info(
      { userId, path, durationMs, taskCount: tasks.length },
      "Tasks request completed"
    );

    return NextResponse.json(payload);
  } catch (error) {
    logError("api:tasks", error, { path });
    return NextResponse.json(
      { error: "Failed to load tasks" },
      { status: 500 }
    );
  }
}
