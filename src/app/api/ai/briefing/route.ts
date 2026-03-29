import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateBriefing } from "@/lib/ai/briefing-generator";
import { createChildLogger, logError } from "@/lib/logger";
import { briefingPostSchema } from "@/lib/api-validation";

const log = createChildLogger("api:ai:briefing");

export async function POST(request: Request) {
  const start = Date.now();
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const raw = await request.json();
    const parsed = briefingPostSchema.safeParse(raw);

    if (!parsed.success) {
      log.warn({ userId, errors: parsed.error.flatten() }, "Validation failed");
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { taskId, taskType } = parsed.data;

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
