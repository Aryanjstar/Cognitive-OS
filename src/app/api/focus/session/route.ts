import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { focusSessionPostSchema } from "@/lib/api-validation";
import { createChildLogger, logError } from "@/lib/logger";

const log = createChildLogger("api:focus:session");

export async function POST(request: Request) {
  const start = Date.now();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const raw = await request.json();
    const parsed = focusSessionPostSchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const userId = session.user.id;
    const { taskType, startedAt, duration, interrupted, interruptionCount, notes } =
      parsed.data;

    const startedAtDate = new Date(startedAt);
    const endedAt = new Date(startedAtDate.getTime() + duration * 1000);

    const focusSession = await prisma.focusSession.create({
      data: {
        userId,
        taskType,
        startedAt: startedAtDate,
        endedAt,
        duration,
        interrupted,
        interruptionCount,
        notes,
      },
    });

    log.info(
      {
        userId,
        focusSessionId: focusSession.id,
        duration,
        durationMs: Date.now() - start,
      },
      "Focus session saved"
    );

    return NextResponse.json({
      success: true,
      session: {
        id: focusSession.id,
        taskType: focusSession.taskType,
        startedAt: focusSession.startedAt.toISOString(),
        endedAt: focusSession.endedAt?.toISOString() ?? null,
        duration: focusSession.duration,
        interrupted: focusSession.interrupted,
        interruptionCount: focusSession.interruptionCount,
      },
    });
  } catch (error) {
    logError("api:focus:session", error, { route: "POST /api/focus/session" });
    return NextResponse.json(
      { error: "Failed to save focus session" },
      { status: 500 }
    );
  }
}
