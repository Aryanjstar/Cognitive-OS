export const dynamic = "force-dynamic";
export const maxDuration = 300;

import { NextResponse } from "next/server";
import { discoverAndTrackDevelopers } from "@/lib/github-tracker";
import { createChildLogger } from "@/lib/logger";

const log = createChildLogger("api:tracker:discover");

export async function POST() {
  const start = Date.now();
  log.info("Starting developer discovery");

  try {
    const result = await discoverAndTrackDevelopers();
    const duration = Date.now() - start;
    log.info({ tracked: result.tracked, errors: result.errors.length, duration }, "Discovery complete");

    return NextResponse.json({
      success: true,
      tracked: result.tracked,
      errors: result.errors,
      durationMs: duration,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.error({ err: msg }, "Discovery failed");
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
