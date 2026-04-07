import { LiveAnalyticsClient } from "./live-analytics-client";

export const metadata = {
  title: "Research Tracker — Cognitive OS",
  description: "Real-time GitHub activity tracking and research metrics for active developers.",
};

export default function LiveAnalyticsPage() {
  return <LiveAnalyticsClient summary={null} trackedCount={0} activeCount={0} />;
}
