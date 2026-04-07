import { ResearchClient } from "./research-client";

export const metadata = {
  title: "Research — Cognitive OS",
  description: "Formal metrics, developer comparison data, and research methodology for the Cognitive OS paper.",
};

export default function ResearchPage() {
  return <ResearchClient developers={[]} aggregate={null} />;
}
