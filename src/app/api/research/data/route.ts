export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getResearchData } from "@/lib/research-metrics";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") ?? "json";

  const data = await getResearchData();

  const sanitized = {
    ...data,
    developers: data.developers.map((dev) => {
      const { email: _email, ...rest } = dev;
      return rest;
    }),
  };

  if (format === "csv") {
    const headers = [
      "name", "repos", "open_issues", "open_prs", "total_stars",
      "avg_complexity", "cognitive_load_index", "burnout_risk", "flow_ratio",
      "context_switch_cost_hrs", "projected_time_savings_hrs", "productivity_gain_pct",
      "task_load", "switch_penalty", "review_load", "urgency_stress", "fatigue_index",
      "staleness", "category",
    ];

    const rows = sanitized.developers.map((d) => [
      d.name, d.repoCount, d.openIssues, d.openPRs, d.totalStars,
      d.avgComplexity, d.cognitiveLoadIndex, d.burnoutRisk, d.flowRatio,
      d.contextSwitchCost, d.projectedTimeSavings, d.productivityGain,
      d.breakdown.taskLoad.toFixed(2), d.breakdown.switchPenalty.toFixed(2),
      d.breakdown.reviewLoad.toFixed(2), d.breakdown.urgencyStress.toFixed(2),
      d.breakdown.fatigueIndex.toFixed(2), d.breakdown.staleness.toFixed(2),
      d.category,
    ].join(","));

    const csv = [headers.join(","), ...rows].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=cognitive-os-research-data.csv",
      },
    });
  }

  return NextResponse.json({
    ...sanitized,
    _meta: {
      source: "GitHub API → /api/github/sync → DB → computed metrics → this response",
      githubApis: [
        "GET https://api.github.com/users/{login}",
        "GET https://api.github.com/users/{login}/events/public?per_page=100",
        "GET https://api.github.com/users/{login}/repos?sort=pushed&per_page=100&type=owner",
      ],
      liveEndpoint: "/api/github/live?login={username}",
      syncEndpoint: "POST /api/github/sync",
      computedMetrics: [
        "Cognitive Load Index (CLI) — weighted sum of 6 sub-factors",
        "Burnout Risk — 0.4×load + 0.3×switches + 0.3×(1-focus)",
        "Context Switch Cost — switches/day × 23.25min refocus time",
        "Productivity Gain — interrupt reduction + focus improvement",
      ],
    },
    _github_apis: sanitized.developers.map(dev => ({
      name: dev.name,
      profile: `https://api.github.com/users/${dev.name}`,
      events: `https://api.github.com/users/${dev.name}/events/public?per_page=100`,
      repos: `https://api.github.com/users/${dev.name}/repos?sort=pushed&per_page=100&type=owner`,
    })),
  });
}
