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

  return NextResponse.json({
    ...summary,
    _meta: {
      source: "GitHub API → DB cache → this response",
      githubApis: [
        "GET https://api.github.com/users/{login}",
        "GET https://api.github.com/users/{login}/events/public?per_page=100",
        "GET https://api.github.com/users/{login}/repos?sort=pushed&per_page=100&type=owner",
      ],
      liveEndpoint: "/api/github/live?login={login}",
      refreshEndpoint: "POST /api/tracker/refresh",
      lastRefreshed: summary.lastRefreshed,
      dataAgeHours: Math.round((Date.now() - new Date(summary.lastRefreshed).getTime()) / 3600000),
      autoRefreshThresholdHours: 6,
    },
    _github_apis: summary.developers.map(dev => ({
      login: dev.login,
      profile: `https://api.github.com/users/${dev.login}`,
      events: `https://api.github.com/users/${dev.login}/events/public?per_page=100`,
      repos: `https://api.github.com/users/${dev.login}/repos?sort=pushed&per_page=100&type=owner`,
      instructions: "Copy these URLs to DevTools Console and run: fetch(url).then(r=>r.json()).then(d=>console.table(d))",
    })),
  });
}
