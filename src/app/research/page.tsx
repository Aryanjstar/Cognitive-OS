export const dynamic = "force-dynamic";

import { getResearchData } from "@/lib/research-metrics";
import { ResearchClient } from "./research-client";

export const metadata = {
  title: "Research — Cognitive OS",
  description: "Formal metrics, developer comparison data, and research methodology for the Cognitive OS paper.",
};

export default async function ResearchPage() {
  const data = await getResearchData();
  const sanitizedDevs = data.developers.map((dev) => {
    const { email: _email, ...rest } = dev;
    return rest;
  });
  return <ResearchClient developers={sanitizedDevs} aggregate={data.aggregate} />;
}
