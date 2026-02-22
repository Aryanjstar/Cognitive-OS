import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  calculateCognitiveLoad,
  getCognitiveHistory,
  getLatestSnapshot,
} from "@/lib/cognitive-engine";
import { createChildLogger, logError } from "@/lib/logger";
import { cacheGet, cacheSet } from "@/lib/redis";

const log = createChildLogger("api:cognitive:score");

export async function GET(request: Request) {
  const start = Date.now();
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const refresh = searchParams.get("refresh") === "true";
    const days = parseInt(searchParams.get("days") ?? "7", 10);

    const cacheKey = `cognitive:${userId}:${days}`;

    if (!refresh) {
      const cached = await cacheGet<{ current: unknown; history: unknown }>(cacheKey);
      if (cached) {
        log.debug({ userId, source: "cache", durationMs: Date.now() - start }, "Score from cache");
        return NextResponse.json(cached);
      }
    }

    let current;
    if (refresh) {
      current = await calculateCognitiveLoad(userId);
    } else {
      const latest = await getLatestSnapshot(userId);
      if (latest) {
        current = {
          score: latest.score,
          level: latest.level,
          breakdown: latest.breakdown,
          timestamp: latest.timestamp,
        };
      } else {
        current = await calculateCognitiveLoad(userId);
      }
    }

    const history = await getCognitiveHistory(userId, days);
    const payload = { current, history };

    await cacheSet(cacheKey, payload, 60);

    const duration = Date.now() - start;
    log.info({ userId, score: current.score, refresh, durationMs: duration }, "Score calculated");

    return NextResponse.json(payload);
  } catch (error) {
    logError("api:cognitive:score", error);
    return NextResponse.json(
      { error: "Failed to calculate cognitive load" },
      { status: 500 }
    );
  }
}
