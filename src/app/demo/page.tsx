import { DemoClient } from "./demo-client";

export const metadata = {
  title: "Live Demo — Cognitive OS",
  description: "Explore real developer dashboards populated with GitHub data.",
};

export default function DemoPage() {
  return <DemoClient users={[]} />;
}
