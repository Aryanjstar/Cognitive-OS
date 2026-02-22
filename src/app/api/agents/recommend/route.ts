import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { runOrchestrator } from "@/lib/ai/agents/orchestrator";
import { prisma } from "@/lib/prisma";
import { createChildLogger, logError, logAgentRun } from "@/lib/logger";

const log = createChildLogger("api:agents");

export async function POST(request: Request) {
  const start = Date.now();
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const trigger = body.trigger ?? "manual";

    log.info({ userId, trigger }, "Running agent orchestrator");

    const results = await runOrchestrator(userId, trigger, body.newTaskContext);

    const duration = Date.now() - start;
    logAgentRun("orchestrator", userId, duration, {
      trigger,
      recommendationCount: results.length,
    });

    return NextResponse.json({ success: true, recommendations: results });
  } catch (error) {
    logError("api:agents", error, { route: "POST /api/agents/recommend" });
    return NextResponse.json(
      { error: "Agent orchestration failed" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, dismissed } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    await prisma.agentRecommendation.update({
      where: { id, userId: session.user.id },
      data: { dismissed },
    });

    log.info({ userId: session.user.id, recommendationId: id, dismissed }, "Recommendation updated");

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("api:agents", error, { route: "PATCH /api/agents/recommend" });
    return NextResponse.json(
      { error: "Failed to update recommendation" },
      { status: 500 }
    );
  }
}
