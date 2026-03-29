export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getTrackerSummary } from "@/lib/github-tracker";

export async function GET() {
  const summary = await getTrackerSummary();

  if (!summary) {
    return NextResponse.json(
      { error: "No tracked developers found. Run POST /api/tracker/discover first." },
      { status: 404 }
    );
  }

  return NextResponse.json(summary);
}
