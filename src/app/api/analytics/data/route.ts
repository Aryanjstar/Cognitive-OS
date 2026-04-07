export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createChildLogger, logError } from "@/lib/logger";

const log = createChildLogger("api:analytics:data");

export async function GET(request: Request) {
  const start = Date.now();
  const path = new URL(request.url).pathname;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      log.warn({ path }, "Unauthorized analytics data request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    log.info({ userId, path }, "Analytics data request started");

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [snapshots, dailyRows, focusSessions, switches] = await Promise.all([
      prisma.cognitiveSnapshot.findMany({
        where: { userId, timestamp: { gte: thirtyDaysAgo } },
        orderBy: { timestamp: "asc" },
        select: {
          score: true,
          level: true,
          timestamp: true,
          breakdown: true,
        },
      }),
      prisma.dailyAnalytics.findMany({
        where: { userId, date: { gte: thirtyDaysAgo } },
        orderBy: { date: "asc" },
        select: {
          date: true,
          totalFocusMinutes: true,
          contextSwitches: true,
          avgCognitiveLoad: true,
          deepWorkStreaks: true,
        },
      }),
      prisma.focusSession.findMany({
        where: { userId, startedAt: { gte: thirtyDaysAgo } },
        select: { duration: true, startedAt: true, interrupted: true },
      }),
      prisma.contextSwitch.findMany({
        where: { userId, switchedAt: { gte: thirtyDaysAgo } },
        select: { switchedAt: true, estimatedCost: true },
      }),
    ]);

    const payload = {
      snapshots: snapshots.map((s) => ({
        score: s.score,
        level: s.level,
        timestamp: s.timestamp.toISOString(),
        breakdown: s.breakdown,
      })),
      dailyData: dailyRows.map((d) => ({
        date: d.date.toISOString(),
        totalFocusMinutes: d.totalFocusMinutes,
        contextSwitches: d.contextSwitches,
        avgCognitiveLoad: d.avgCognitiveLoad,
        deepWorkStreaks: d.deepWorkStreaks,
      })),
      focusSessions: focusSessions.map((f) => ({
        duration: f.duration,
        startedAt: f.startedAt.toISOString(),
        interrupted: f.interrupted,
      })),
      switches: switches.map((c) => ({
        switchedAt: c.switchedAt.toISOString(),
        estimatedCost: c.estimatedCost,
      })),
      _meta: {
        source: "GitHub API → sync → DB → 30d analytics window",
        period: "30d" as const,
      },
    };

    const durationMs = Date.now() - start;
    log.info(
      {
        userId,
        path,
        durationMs,
        snapshotCount: snapshots.length,
        dailyCount: dailyRows.length,
      },
      "Analytics data request completed"
    );

    return NextResponse.json(payload);
  } catch (error) {
    logError("api:analytics:data", error, { path });
    return NextResponse.json(
      { error: "Failed to load analytics data" },
      { status: 500 }
    );
  }
}
