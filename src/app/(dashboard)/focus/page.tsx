import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { FocusClient } from "./focus-client";

export const metadata = { title: "Focus" };

export default async function FocusPage() {
  const user = await requireAuth();

  const sessions = await prisma.focusSession.findMany({
    where: { userId: user.id },
    orderBy: { startedAt: "desc" },
    take: 50,
  });

  return (
    <FocusClient
      sessions={sessions.map((s) => ({
        id: s.id,
        taskType: s.taskType,
        startedAt: s.startedAt.toISOString(),
        endedAt: s.endedAt?.toISOString() ?? null,
        duration: s.duration,
        interrupted: s.interrupted,
        interruptionCount: s.interruptionCount,
      }))}
      userId={user.id}
    />
  );
}
