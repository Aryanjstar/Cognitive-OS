import { prisma } from "@/lib/prisma";
import { cacheGet, cacheSet } from "@/lib/redis";

export interface AgentMemoryEntry {
  agent: string;
  key: string;
  value: unknown;
  timestamp: Date;
}

/**
 * Short-term memory layer for agents.
 * Stores recent context (last 24h) so agents can make decisions
 * informed by what happened in prior runs.
 */
export async function getAgentMemory(
  userId: string,
  agent: string
): Promise<AgentMemoryEntry[]> {
  const cacheKey = `agent-memory:${userId}:${agent}`;
  const cached = await cacheGet<AgentMemoryEntry[]>(cacheKey);
  if (cached) return cached;

  const recentRecs = await prisma.agentRecommendation.findMany({
    where: {
      userId,
      agent,
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      type: true,
      message: true,
      priority: true,
      dismissed: true,
      createdAt: true,
    },
  });

  const memory: AgentMemoryEntry[] = recentRecs.map((r) => ({
    agent,
    key: "prior_recommendation",
    value: {
      type: r.type,
      message: r.message,
      priority: r.priority,
      wasDismissed: r.dismissed,
    },
    timestamp: r.createdAt,
  }));

  await cacheSet(cacheKey, memory, 300);
  return memory;
}

/**
 * Get user's energy pattern based on historical focus sessions and cognitive snapshots.
 * Returns estimated energy level for each hour of the day.
 */
export async function getUserEnergyPattern(
  userId: string
): Promise<Record<number, number>> {
  const cacheKey = `energy-pattern:${userId}`;
  const cached = await cacheGet<Record<number, number>>(cacheKey);
  if (cached) return cached;

  const sessions = await prisma.focusSession.findMany({
    where: {
      userId,
      startedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      duration: { gt: 0 },
      interrupted: false,
    },
    select: { startedAt: true, duration: true },
  });

  const hourBuckets: Record<number, { total: number; count: number }> = {};
  for (let h = 0; h < 24; h++) {
    hourBuckets[h] = { total: 0, count: 0 };
  }

  for (const session of sessions) {
    const hour = session.startedAt.getHours();
    hourBuckets[hour].total += session.duration;
    hourBuckets[hour].count += 1;
  }

  const pattern: Record<number, number> = {};
  const maxAvg = Math.max(
    ...Object.values(hourBuckets).map((b) =>
      b.count > 0 ? b.total / b.count : 0
    ),
    1
  );

  for (let h = 0; h < 24; h++) {
    const avg =
      hourBuckets[h].count > 0
        ? hourBuckets[h].total / hourBuckets[h].count
        : 0;
    pattern[h] = Math.round((avg / maxAvg) * 100);
  }

  await cacheSet(cacheKey, pattern, 3600);
  return pattern;
}
