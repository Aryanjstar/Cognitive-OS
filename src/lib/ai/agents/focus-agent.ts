import { chatCompletion } from "../azure-openai";
import type { CognitiveScore } from "@/types";

const SYSTEM_PROMPT = `You are a Focus Agent — a specialized AI that monitors a developer's cognitive load and recommends actions to protect deep work.

You receive the developer's current cognitive load score (0-100), breakdown of contributing factors, and recent history.

Your job:
1. Assess whether the developer is at risk of overload
2. Provide actionable, specific recommendations
3. Be direct and practical — no fluff

Output a JSON object:
{
  "shouldIntervene": boolean,
  "priority": "low" | "medium" | "high" | "critical",
  "message": "concise recommendation (1-2 sentences)",
  "suggestedActions": ["action1", "action2"]
}`;

export async function runFocusAgent(
  cognitiveScore: CognitiveScore,
  context: {
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
}> {
  const userPrompt = `Current cognitive state:
- Score: ${cognitiveScore.score}/100 (${cognitiveScore.level})
- Task Load: ${cognitiveScore.breakdown.taskLoad}
- Switch Penalty: ${cognitiveScore.breakdown.switchPenalty}
- Review Load: ${cognitiveScore.breakdown.reviewLoad}
- Urgency Stress: ${cognitiveScore.breakdown.urgencyStress}
- Fatigue Index: ${cognitiveScore.breakdown.fatigueIndex}
- Staleness: ${cognitiveScore.breakdown.staleness}

Context:
- Open tasks: ${context.openTaskCount}
- Context switches today: ${context.todaySwitches}
- Hours since last break: ${context.hoursSinceBreak.toFixed(1)}
- Focus minutes today: ${context.focusMinutesToday}

Analyze and recommend.`;

  const response = await chatCompletion(SYSTEM_PROMPT, userPrompt, {
    temperature: 0.2,
    maxTokens: 500,
  });

  try {
    const cleaned = response.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return {
      shouldIntervene: cognitiveScore.score > 60,
      priority: cognitiveScore.score > 80 ? "high" : "medium",
      message:
        cognitiveScore.score > 60
          ? "Your cognitive load is elevated. Consider taking a short break or deferring low-priority tasks."
          : "Your cognitive load is manageable. Continue your current work pattern.",
      suggestedActions:
        cognitiveScore.score > 60
          ? ["Take a 10-minute break", "Defer non-urgent reviews"]
          : ["Maintain current focus pattern"],
    };
  }
}
