export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getTrackerSummary } from "@/lib/github-tracker";
import { LiveAnalyticsClient } from "./live-analytics-client";

export const metadata = {
  title: "Research Tracker — Cognitive OS",
  description: "Real-time GitHub activity tracking and research metrics for active developers.",
};

export default async function LiveAnalyticsPage() {
  const summary = await getTrackerSummary();

  const trackedCount = await prisma.trackedDeveloper.count();
  const activeCount = await prisma.trackedDeveloper.count({
    where: { lastFetchedAt: { not: null } },
  });

  return (
    <LiveAnalyticsClient
      summary={summary}
      trackedCount={trackedCount}
      activeCount={activeCount}
    />
  );
}
