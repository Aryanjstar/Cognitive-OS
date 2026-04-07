export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createChildLogger, logError } from "@/lib/logger";

const log = createChildLogger("api:demo:users");

export async function GET(request: Request) {
  const start = Date.now();
  const path = new URL(request.url).pathname;

  try {
    log.info({ path }, "Demo users request started");

    const rawUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        image: true,
        repositories: { select: { starCount: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    const users = await Promise.all(
      rawUsers.map(async (u) => {
        const [issues, prs, latestSnapshot] = await Promise.all([
          prisma.issue.count({ where: { userId: u.id } }),
          prisma.pullRequest.count({ where: { userId: u.id } }),
          prisma.cognitiveSnapshot.findFirst({
            where: { userId: u.id },
            orderBy: { timestamp: "desc" },
            select: { score: true },
          }),
        ]);

        const totalStars = u.repositories.reduce(
          (sum, r) => sum + r.starCount,
          0
        );

        return {
          id: u.id,
          name: u.name,
          image: u.image,
          repos: u.repositories.length,
          totalStars,
          issues,
          prs,
          avgLoad: latestSnapshot?.score ?? null,
        };
      })
    );

    const payload = {
      users,
      _meta: {
        source: "GitHub API → sync → DB → demo profiles",
        count: users.length,
      },
    };

    const durationMs = Date.now() - start;
    log.info({ path, durationMs, count: users.length }, "Demo users request completed");

    return NextResponse.json(payload);
  } catch (error) {
    logError("api:demo:users", error, { path });
    return NextResponse.json(
      { error: "Failed to load demo users" },
      { status: 500 }
    );
  }
}
