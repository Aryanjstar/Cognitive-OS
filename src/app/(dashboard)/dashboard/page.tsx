import { DashboardClient } from "./dashboard-client";

export const metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <DashboardClient
      cognitiveScore={null}
      history={[]}
      tasks={[]}
      switches={[]}
      stats={null}
      recommendations={[]}
    />
  );
}
