import { chatCompletion } from "../azure-openai";

const SYSTEM_PROMPT = `You are an Interrupt Guard Agent — a specialized AI that evaluates the cost of context switches and interruptions for developers.

When a new task or notification arrives while a developer is in a focus state, you calculate the interruption cost and recommend the best course of action.

Output a JSON object:
{
  "estimatedCostMinutes": number,
  "recommendation": "accept" | "defer" | "delegate",
  "priority": "low" | "medium" | "high" | "critical",
  "message": "1-2 sentence explanation",
  "suggestedActions": ["action1", "action2"]
}`;

export async function runInterruptGuard(context: {
  currentTaskTitle: string;
  currentTaskComplexity: number;
  focusDepthMinutes: number;
  cognitiveScore: number;
  newTaskTitle: string;
  newTaskComplexity: number;
  newTaskPriority: number;
}): Promise<{
  estimatedCostMinutes: number;
  recommendation: "accept" | "defer" | "delegate";
  priority: "low" | "medium" | "high" | "critical";
  message: string;
  suggestedActions: string[];
}> {
  const userPrompt = `Current state:
- Working on: "${context.currentTaskTitle}" (complexity: ${context.currentTaskComplexity}/10)
- Focus depth: ${context.focusDepthMinutes} minutes in current session
- Cognitive load: ${context.cognitiveScore}/100

Incoming interruption:
- New task: "${context.newTaskTitle}" (complexity: ${context.newTaskComplexity}/10, priority: ${context.newTaskPriority}/5)

Calculate the interruption cost and recommend action.`;

  const response = await chatCompletion(SYSTEM_PROMPT, userPrompt, {
    temperature: 0.2,
    maxTokens: 500,
  });

  try {
    const cleaned = response.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    const baseCost = context.focusDepthMinutes * 0.5;
    const complexityCost = context.currentTaskComplexity * 2;
    const estimatedCostMinutes = Math.round(baseCost + complexityCost);

    const shouldDefer =
      context.focusDepthMinutes > 20 && context.newTaskPriority < 4;

    return {
      estimatedCostMinutes,
      recommendation: shouldDefer ? "defer" : "accept",
      priority: context.newTaskPriority >= 4 ? "high" : "medium",
      message: shouldDefer
        ? `Switching now would cost ~${estimatedCostMinutes} minutes of recovery. Defer to your next natural break.`
        : `Priority warrants immediate attention. Estimated switch cost: ~${estimatedCostMinutes} minutes.`,
      suggestedActions: shouldDefer
        ? ["Continue current task", "Queue new task for next break"]
        : ["Save current context", "Switch to new task"],
    };
  }
}
