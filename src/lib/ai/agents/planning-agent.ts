import { chatCompletion } from "../azure-openai";
import { getAgentMemory, getUserEnergyPattern } from "./agent-memory";

interface TaskForPlanning {
  id: string;
  title: string;
  type: "issue" | "pr";
  complexity: number;
  priority: number;
  repo: string;
  state: string;
  ageDays: number;
}

const SYSTEM_PROMPT = `You are a Planning Agent — a specialized AI that optimizes task sequencing for developers to minimize cognitive load and maximize productive output.

You receive a list of active tasks with complexity scores, priorities, and ages. You also receive the current time of day, cognitive state, and the developer's energy pattern (0-100 per hour based on historical focus sessions).

Your job:
1. Reorder tasks in the optimal sequence for the developer
2. Use the energy pattern: schedule complex tasks during peak energy hours, low-complexity during low energy
3. Group related repository work together to minimize context switching
4. Consider time of day: morning warmup → peak complexity → afternoon wind-down
5. If prior planning recommendations were dismissed, note and adjust

Output a JSON object:
{
  "orderedTaskIds": ["id1", "id2", ...],
  "reasoning": "brief explanation of ordering strategy",
  "message": "1-2 sentence recommendation for the developer",
  "suggestedActions": ["action1", "action2"],
  "energyAlignment": "how task order aligns with energy pattern",
  "estimatedCompletionHours": number
}`;

export async function runPlanningAgent(
  tasks: TaskForPlanning[],
  context: {
    userId?: string;
    currentHour: number;
    cognitiveScore: number;
    focusMinutesToday: number;
  }
): Promise<{
  orderedTaskIds: string[];
  reasoning: string;
  message: string;
  suggestedActions: string[];
  energyAlignment?: string;
  estimatedCompletionHours?: number;
}> {
  const [memory, energyPattern] = await Promise.all([
    context.userId
      ? getAgentMemory(context.userId, "planning")
      : Promise.resolve([]),
    context.userId
      ? getUserEnergyPattern(context.userId)
      : Promise.resolve({} as Record<number, number>),
  ]);

  const currentEnergy = energyPattern[context.currentHour] ?? 50;
  const peakHours = Object.entries(energyPattern)
    .filter(([, v]) => v >= 70)
    .map(([h]) => parseInt(h))
    .sort((a, b) => a - b);

  const dismissedCount = memory.filter(
    (m) => (m.value as { wasDismissed?: boolean }).wasDismissed
  ).length;

  const energyContext =
    Object.keys(energyPattern).length > 0
      ? `\n\nEnergy Pattern (0-100 per hour):
${Object.entries(energyPattern)
  .filter(([h]) => {
    const hour = parseInt(h);
    return hour >= 7 && hour <= 22;
  })
  .map(([h, v]) => `  ${h}:00 → ${v}%`)
  .join("\n")}
- Current energy level: ${currentEnergy}%
- Peak hours: ${peakHours.length > 0 ? peakHours.map((h) => `${h}:00`).join(", ") : "insufficient data"}`
      : "";

  const memoryContext =
    dismissedCount > 0
      ? `\n\nNote: ${dismissedCount} of your recent planning suggestions were dismissed. Consider less aggressive reordering.`
      : "";

  const userPrompt = `Current context:
- Time: ${context.currentHour}:00
- Cognitive Load: ${context.cognitiveScore}/100
- Focus minutes today: ${context.focusMinutesToday}${energyContext}${memoryContext}

Active tasks:
${tasks
  .map(
    (t) =>
      `- [${t.id}] ${t.type.toUpperCase()} "${t.title}" (repo: ${t.repo}, complexity: ${t.complexity}/10, priority: ${t.priority}/5, age: ${t.ageDays}d)`
  )
  .join("\n")}

Suggest the optimal task order for maximum cognitive efficiency.`;

  const response = await chatCompletion(SYSTEM_PROMPT, userPrompt, {
    temperature: 0.3,
    maxTokens: 800,
  });

  try {
    const cleaned = response.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return energyAwareFallback(tasks, context.currentHour, currentEnergy);
  }
}

function energyAwareFallback(
  tasks: TaskForPlanning[],
  currentHour: number,
  currentEnergy: number
): {
  orderedTaskIds: string[];
  reasoning: string;
  message: string;
  suggestedActions: string[];
  energyAlignment: string;
} {
  const sorted = [...tasks];

  if (currentEnergy >= 70) {
    sorted.sort(
      (a, b) =>
        b.priority * b.complexity - a.priority * a.complexity
    );
  } else if (currentEnergy >= 40) {
    sorted.sort((a, b) => {
      const aScore = a.priority * 2 + (10 - a.complexity);
      const bScore = b.priority * 2 + (10 - b.complexity);
      return bScore - aScore;
    });
  } else {
    sorted.sort((a, b) => a.complexity - b.complexity);
  }

  const grouped: TaskForPlanning[] = [];
  const seen = new Set<string>();

  for (const task of sorted) {
    if (seen.has(task.id)) continue;
    seen.add(task.id);
    grouped.push(task);
    for (const other of sorted) {
      if (!seen.has(other.id) && other.repo === task.repo) {
        seen.add(other.id);
        grouped.push(other);
      }
    }
  }

  const ismorning = currentHour >= 6 && currentHour < 12;
  const timeLabel = ismorning
    ? "morning (peak energy expected)"
    : currentHour < 17
    ? "afternoon"
    : "evening (wind-down)";

  return {
    orderedTaskIds: grouped.map((t) => t.id),
    reasoning: `Energy-aware fallback: current energy ${currentEnergy}%, ${timeLabel}. ${
      currentEnergy >= 70
        ? "High energy — prioritizing complex+important tasks."
        : currentEnergy >= 40
        ? "Moderate energy — balancing priority with manageable complexity."
        : "Low energy — starting with simpler tasks."
    } Grouped by repository to reduce context switching.`,
    message:
      currentEnergy >= 70
        ? "Your energy is high — tackle your most complex tasks now."
        : currentEnergy >= 40
        ? "Moderate energy — focus on high-priority but manageable tasks."
        : "Energy is winding down — handle simpler tasks and reviews.",
    suggestedActions:
      currentEnergy >= 70
        ? [
            "Start with the highest-complexity task",
            "Block notifications for deep work",
          ]
        : currentEnergy >= 40
        ? [
            "Work through prioritized tasks in order",
            "Take short breaks between tasks",
          ]
        : [
            "Handle quick reviews and responses",
            "Plan tomorrow's deep work tasks",
          ],
    energyAlignment: `Aligned with ${currentEnergy}% energy at ${currentHour}:00`,
  };
}
