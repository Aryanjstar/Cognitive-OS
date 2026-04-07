export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getTrackerSummary, refreshAllActivity } from "@/lib/github-tracker";
import { createChildLogger } from "@/lib/logger";

const log = createChildLogger("api:tracker:summary");
const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

export async function GET() {
  let summary = await getTrackerSummary();

  if (!summary) {
    return NextResponse.json(
      { error: "No tracked developers found. Run POST /api/tracker/discover first." },
      { status: 404 }
    );
  }

  const age = Date.now() - new Date(summary.lastRefreshed).getTime();
  if (age > SIX_HOURS_MS) {
    log.info({ ageHours: Math.round(age / 3600000) }, "Data stale, triggering background refresh from GitHub");
    refreshAllActivity()
      .then((r) => log.info({ refreshed: r.refreshed }, "Background refresh complete"))
      .catch((e) => log.error({ err: String(e) }, "Background refresh failed"));
  }

  return NextResponse.json(summary);
}
