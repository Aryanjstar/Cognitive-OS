export const dynamic = "force-dynamic";
export const maxDuration = 300;

import { NextResponse } from "next/server";
import { refreshAllActivity, discoverAndTrackDevelopers } from "@/lib/github-tracker";
import { prisma } from "@/lib/prisma";
import { createChildLogger } from "@/lib/logger";

const log = createChildLogger("cron:refresh-tracker");

/**
 * Cron endpoint for automatic data refresh.
 * Call via: GET /api/cron/refresh-tracker?key=<CRON_SECRET>
 *
 * Can be triggered by:
 * - Azure Container Apps scheduled tasks
 * - GitHub Actions cron workflow
 * - External cron service (cron-job.org, Vercel Cron, etc.)
 * - Manual curl call
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && key !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const start = Date.now();
  log.info("Cron: starting tracker refresh");

  try {
    const trackedCount = await prisma.trackedDeveloper.count();
    if (trackedCount === 0) {
      log.info("No tracked developers found, running discovery first");
      await discoverAndTrackDevelopers();
    }

    const result = await refreshAllActivity();
    const duration = Date.now() - start;

    log.info({
      refreshed: result.refreshed,
      totalTracked: result.summary.totalTracked,
      totalActive: result.summary.totalActive,
      duration,
    }, "Cron: refresh complete");

    return NextResponse.json({
      success: true,
      refreshed: result.refreshed,
      totalTracked: result.summary.totalTracked,
      totalActive: result.summary.totalActive,
      avgTimeSavingsPerMonth: result.summary.avgTimeSavingsPerMonth,
      durationMs: duration,
      nextRefresh: "in ~6 hours",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.error({ err: msg }, "Cron: refresh failed");
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
