import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateBriefing } from "@/lib/ai/briefing-generator";
import { createChildLogger, logError } from "@/lib/logger";

const log = createChildLogger("api:ai:briefing");

export async function POST(request: Request) {
  const start = Date.now();
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { taskId, taskType } = body;

    if (!taskId || !taskType) {
      log.warn({ userId, body }, "Missing required fields");
      return NextResponse.json(
        { error: "taskId and taskType are required" },
        { status: 400 }
      );
    }

    log.info({ userId, taskId, taskType }, "Generating briefing");

    const briefing = await generateBriefing(userId, taskId, taskType);

    const duration = Date.now() - start;
    log.info({ userId, taskId, durationMs: duration }, "Briefing generated");

    return NextResponse.json({ success: true, briefing });
  } catch (error) {
    logError("api:ai:briefing", error, { route: "POST /api/ai/briefing" });
    return NextResponse.json(
      { error: "Failed to generate briefing" },
      { status: 500 }
    );
  }
}
