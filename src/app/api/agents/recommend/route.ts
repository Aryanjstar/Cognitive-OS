import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { runOrchestrator } from "@/lib/ai/agents/orchestrator";
import { prisma } from "@/lib/prisma";
import { createChildLogger, logError, logAgentRun } from "@/lib/logger";
import {
  agentRecommendPostSchema,
  agentRecommendPatchSchema,
} from "@/lib/api-validation";

const log = createChildLogger("api:agents");

export async function POST(request: Request) {
  const start = Date.now();
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const raw = await request.json();
    const parsed = agentRecommendPostSchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { trigger, newTaskContext } = parsed.data;

    log.info({ userId, trigger }, "Running agent orchestrator");

    const results = await runOrchestrator(userId, trigger, newTaskContext);

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

    const raw = await request.json();
    const parsed = agentRecommendPatchSchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { id, dismissed } = parsed.data;

    await prisma.agentRecommendation.update({
      where: { id, userId: session.user.id },
      data: { dismissed },
    });

    log.info(
      { userId: session.user.id, recommendationId: id, dismissed },
      "Recommendation updated"
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("api:agents", error, { route: "PATCH /api/agents/recommend" });
    return NextResponse.json(
      { error: "Failed to update recommendation" },
      { status: 500 }
    );
  }
}
