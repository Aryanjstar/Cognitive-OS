import { BriefingsClient } from "./briefings-client";

export const metadata = { title: "Briefings" };

export default function BriefingsPage() {
  return <BriefingsClient briefings={[]} tasks={[]} />;
}
