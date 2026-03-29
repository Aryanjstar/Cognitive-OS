export const dynamic = "force-dynamic";
export const maxDuration = 300;

import { NextResponse } from "next/server";
import { refreshAllActivity } from "@/lib/github-tracker";
import { createChildLogger } from "@/lib/logger";

const log = createChildLogger("api:tracker:refresh");

export async function POST() {
  const start = Date.now();
  log.info("Starting activity refresh");

  try {
    const result = await refreshAllActivity();
    const duration = Date.now() - start;
    log.info({ refreshed: result.refreshed, errors: result.errors.length, duration }, "Refresh complete");

    return NextResponse.json({
      success: true,
      refreshed: result.refreshed,
      totalTracked: result.summary.totalTracked,
      totalActive: result.summary.totalActive,
      avgTimeSavingsPerMonth: result.summary.avgTimeSavingsPerMonth,
      avgProductivityGain: result.summary.avgProductivityGain,
      errors: result.errors,
      durationMs: duration,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.error({ err: msg }, "Refresh failed");
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}
