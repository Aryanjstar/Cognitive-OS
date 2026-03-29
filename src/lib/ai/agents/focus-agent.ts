import { chatCompletion } from "../azure-openai";
import type { CognitiveScore } from "@/types";
import { getAgentMemory } from "./agent-memory";

const SYSTEM_PROMPT = `You are a Focus Agent — a specialized AI that monitors a developer's cognitive load and recommends actions to protect deep work.

You receive the developer's current cognitive load score (0-100), breakdown of contributing factors, recent history, and your prior recommendations (with whether they were dismissed).

Your job:
1. Assess whether the developer is at risk of overload
2. Provide actionable, specific recommendations
3. If you've made recent recommendations that were dismissed, adjust your approach
4. Suggest auto-snooze durations for notifications when cognitive load is high
5. Be direct and practical — no fluff

Output a JSON object:
{
  "shouldIntervene": boolean,
  "priority": "low" | "medium" | "high" | "critical",
  "message": "concise recommendation (1-2 sentences)",
  "suggestedActions": ["action1", "action2"],
  "autoSnooze": { "enabled": boolean, "durationMinutes": number, "reason": "why snooze is recommended" },
  "reasoning": "brief explanation of your decision logic"
}`;

export async function runFocusAgent(
  cognitiveScore: CognitiveScore,
  context: {
    userId?: string;
    openTaskCount: number;
    todaySwitches: number;
    hoursSinceBreak: number;
    focusMinutesToday: number;
  }
): Promise<{
  shouldIntervene: boolean;
  priority: "low" | "medium" | "high" | "critical";
  message: string;
  suggestedActions: string[];
  autoSnooze?: { enabled: boolean; durationMinutes: number; reason: string };
  reasoning?: string;
}> {
  const memory = context.userId
    ? await getAgentMemory(context.userId, "focus")
    : [];

  const dismissedRecent = memory.filter(
    (m) =>
      (m.value as { wasDismissed?: boolean }).wasDismissed === true
  );

  const memoryContext =
    memory.length > 0
      ? `\n\nRecent memory (last 24h):
- ${memory.length} prior recommendations made
- ${dismissedRecent.length} were dismissed by the developer
${dismissedRecent.length > 0 ? "- Developer seems to prefer less intervention — calibrate accordingly" : ""}`
      : "";

  const anomalyContext = cognitiveScore.anomaly?.isAnomaly
    ? `\n\nANOMALY DETECTED: Score spiked by ${cognitiveScore.anomaly.delta} points (${cognitiveScore.anomaly.severity} severity)`
    : "";

  const trendContext = cognitiveScore.trend
    ? `\nTrend: ${cognitiveScore.trend}`
    : "";

  const userPrompt = `Current cognitive state:
- Score: ${cognitiveScore.score}/100 (${cognitiveScore.level})
- Task Load: ${cognitiveScore.breakdown.taskLoad}
- Switch Penalty: ${cognitiveScore.breakdown.switchPenalty}
- Review Load: ${cognitiveScore.breakdown.reviewLoad}
- Urgency Stress: ${cognitiveScore.breakdown.urgencyStress}
- Fatigue Index: ${cognitiveScore.breakdown.fatigueIndex}
- Staleness: ${cognitiveScore.breakdown.staleness}${trendContext}

Context:
- Open tasks: ${context.openTaskCount}
- Context switches today: ${context.todaySwitches}
- Hours since last break: ${context.hoursSinceBreak.toFixed(1)}
- Focus minutes today: ${context.focusMinutesToday}${memoryContext}${anomalyContext}

Analyze and recommend.`;

  const response = await chatCompletion(SYSTEM_PROMPT, userPrompt, {
    temperature: 0.2,
    maxTokens: 600,
  });

  try {
    const cleaned = response.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    const isHighLoad = cognitiveScore.score > 60;
    const isCritical = cognitiveScore.score > 80;
    const snoozeDuration = isCritical ? 60 : isHighLoad ? 30 : 0;

    return {
      shouldIntervene: isHighLoad,
      priority: isCritical ? "high" : isHighLoad ? "medium" : "low",
      message: isHighLoad
        ? "Your cognitive load is elevated. Consider taking a short break or deferring low-priority tasks."
        : "Your cognitive load is manageable. Continue your current work pattern.",
      suggestedActions: isHighLoad
        ? ["Take a 10-minute break", "Defer non-urgent reviews"]
        : ["Maintain current focus pattern"],
      autoSnooze: isHighLoad
        ? {
            enabled: true,
            durationMinutes: snoozeDuration,
            reason: `Cognitive load at ${cognitiveScore.score}/100 — snooze notifications to protect focus`,
          }
        : undefined,
      reasoning: `Rule-based fallback: score ${cognitiveScore.score}/100 ${isHighLoad ? "exceeds" : "below"} threshold`,
    };
  }
}
