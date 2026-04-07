export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createChildLogger, logError } from "@/lib/logger";

const log = createChildLogger("api:briefings:data");

export async function GET() {
  const start = Date.now();
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const [briefingRows, issueRows, prRows] = await Promise.all([
      prisma.aIBriefing.findMany({
        where: { userId },
        orderBy: { generatedAt: "desc" },
        take: 20,
      }),
      prisma.issue.findMany({
        where: { userId, state: "open" },
        include: { repository: { select: { name: true } } },
        orderBy: { complexity: "desc" },
        take: 10,
      }),
      prisma.pullRequest.findMany({
        where: { userId, state: "open" },
        include: { repository: { select: { name: true } } },
        orderBy: { complexity: "desc" },
        take: 10,
      }),
    ]);

    const briefings = briefingRows.map((b) => ({
      id: b.id,
      taskId: b.taskId,
      taskType: b.taskType,
      title: b.title,
      content: b.content,
      sections: b.sections as unknown,
      generatedAt: b.generatedAt.toISOString(),
    }));

    const tasks = [
      ...issueRows.map((i) => ({
        id: i.id,
        type: "issue" as const,
        title: i.title,
        number: i.number,
        repo: i.repository.name,
      })),
      ...prRows.map((p) => ({
        id: p.id,
        type: "pr" as const,
        title: p.title,
        number: p.number,
        repo: p.repository.name,
      })),
    ];

    const durationMs = Date.now() - start;
    log.info(
      {
        userId,
        briefingCount: briefings.length,
        taskCount: tasks.length,
        durationMs,
      },
      "Briefings data loaded"
    );

    return NextResponse.json({
      briefings,
      tasks,
      _meta: {
        source:
          "Prisma aIBriefing, issue, pullRequest → GET /api/briefings/data",
        briefingCount: briefings.length,
        taskCount: tasks.length,
      },
    });
  } catch (error) {
    logError("api:briefings:data", error, { route: "GET /api/briefings/data" });
    return NextResponse.json(
      { error: "Failed to load briefings data" },
      { status: 500 }
    );
  }
}
