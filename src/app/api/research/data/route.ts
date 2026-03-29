export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getResearchData } from "@/lib/research-metrics";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") ?? "json";

  const data = await getResearchData();

  if (format === "csv") {
    const headers = [
      "name", "email", "repos", "open_issues", "open_prs", "total_stars",
      "avg_complexity", "cognitive_load_index", "burnout_risk", "flow_ratio",
      "context_switch_cost_hrs", "projected_time_savings_hrs", "productivity_gain_pct",
      "task_load", "switch_penalty", "review_load", "urgency_stress", "fatigue_index",
      "staleness", "category",
    ];

    const rows = data.developers.map((d) => [
      d.name, d.email ?? "", d.repoCount, d.openIssues, d.openPRs, d.totalStars,
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

  return NextResponse.json(data);
}
