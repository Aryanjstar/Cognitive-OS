export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTrackerSummary, generateOutreachEmail } from "@/lib/github-tracker";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const login = searchParams.get("login");

  const summary = await getTrackerSummary();
  if (!summary) {
    return NextResponse.json({ error: "No data available" }, { status: 404 });
  }

  if (login) {
    const dev = summary.developers.find((d) => d.login === login);
    if (!dev) {
      return NextResponse.json({ error: `Developer ${login} not found` }, { status: 404 });
    }
    return NextResponse.json(generateOutreachEmail(dev));
  }

  const emails = summary.developers
    .filter((d) => d.periods.month.activeDays > 5)
    .slice(0, 10)
    .map((d) => ({
      login: d.login,
      name: d.name,
      category: d.category,
      ...generateOutreachEmail(d),
    }));

  return NextResponse.json({ count: emails.length, emails });
}
