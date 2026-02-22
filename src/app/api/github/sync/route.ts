import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getGitHubToken } from "@/lib/auth-helpers";
import { fullSync } from "@/lib/github";
import { createChildLogger, logError } from "@/lib/logger";
import { cacheInvalidate } from "@/lib/redis";

const log = createChildLogger("api:github:sync");

export async function POST() {
  const start = Date.now();
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      log.warn("Unauthorized sync attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    log.info({ userId }, "Starting GitHub sync");

    const token = await getGitHubToken(userId);
    if (!token) {
      log.warn({ userId }, "No GitHub token found");
      return NextResponse.json(
        { error: "No GitHub token found. Please reconnect." },
        { status: 400 }
      );
    }

    const result = await fullSync(userId, token);

    await cacheInvalidate(`cognitive:${userId}*`);

    const duration = Date.now() - start;
    log.info({ userId, ...result, durationMs: duration }, "GitHub sync completed");

    return NextResponse.json({
      success: true,
      ...result,
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    logError("api:github:sync", error);
    return NextResponse.json(
      { error: "Sync failed. Please try again." },
      { status: 500 }
    );
  }
}
