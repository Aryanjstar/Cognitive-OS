import { chatCompletion } from "../azure-openai";

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

You receive a list of active tasks with complexity scores, priorities, and ages. You also receive the current time of day and cognitive state.

Your job:
1. Reorder tasks in the optimal sequence for the developer
2. Consider: start with moderate tasks to warm up, tackle complex tasks during peak energy, end with low-complexity items
3. Group related repository work together to minimize context switching

Output a JSON object:
{
  "orderedTaskIds": ["id1", "id2", ...],
  "reasoning": "brief explanation of ordering strategy",
  "message": "1-2 sentence recommendation for the developer",
  "suggestedActions": ["action1", "action2"]
}`;

export async function runPlanningAgent(
  tasks: TaskForPlanning[],
  context: {
    currentHour: number;
    cognitiveScore: number;
    focusMinutesToday: number;
  }
): Promise<{
  orderedTaskIds: string[];
  reasoning: string;
  message: string;
  suggestedActions: string[];
}> {
  const userPrompt = `Current context:
- Time: ${context.currentHour}:00
- Cognitive Load: ${context.cognitiveScore}/100
- Focus minutes today: ${context.focusMinutesToday}

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
    return {
      orderedTaskIds: tasks
        .sort((a, b) => b.priority * b.complexity - a.priority * a.complexity)
        .map((t) => t.id),
      reasoning: "Sorted by priority-complexity product (default fallback).",
      message:
        "Tasks have been ordered by a combination of priority and complexity.",
      suggestedActions: [
        "Start with the highest priority task",
        "Take breaks between complex tasks",
      ],
    };
  }
}
