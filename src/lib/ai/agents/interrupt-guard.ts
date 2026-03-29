import { chatCompletion } from "../azure-openai";
import { getAgentMemory } from "./agent-memory";

const SYSTEM_PROMPT = `You are an Interrupt Guard Agent — a specialized AI that evaluates the cost of context switches and interruptions for developers.

When a new task or notification arrives while a developer is in a focus state, you calculate the interruption cost and recommend the best course of action.

You have access to prior recommendations and whether they were dismissed, so you can calibrate your sensitivity.

Your three options:
1. "accept" — switch now, it's worth the cost
2. "defer" — queue it for the next natural break, with auto-snooze suggestion
3. "delegate" — suggest someone else handle it (when cognitive load is high and task isn't user-specific)

Output a JSON object:
{
  "estimatedCostMinutes": number,
  "recommendation": "accept" | "defer" | "delegate",
  "priority": "low" | "medium" | "high" | "critical",
  "message": "1-2 sentence explanation",
  "suggestedActions": ["action1", "action2"],
  "deferUntil": "suggested time or condition to revisit (if deferring)",
  "delegateReason": "why delegation is recommended (if delegating)",
  "reasoning": "brief decision logic"
}`;

export async function runInterruptGuard(context: {
  userId?: string;
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
  deferUntil?: string;
  delegateReason?: string;
  reasoning?: string;
}> {
  const memory = context.userId
    ? await getAgentMemory(context.userId, "interrupt-guard")
    : [];

  const recentDeferrals = memory.filter(
    (m) => (m.value as { type?: string }).type === "defer"
  ).length;

  const memoryContext =
    memory.length > 0
      ? `\n\nRecent interrupt history (24h):
- ${memory.length} interruptions evaluated
- ${recentDeferrals} were deferred
${recentDeferrals > 3 ? "- Many deferrals — consider if delegation would be better" : ""}`
      : "";

  const userPrompt = `Current state:
- Working on: "${context.currentTaskTitle}" (complexity: ${context.currentTaskComplexity}/10)
- Focus depth: ${context.focusDepthMinutes} minutes in current session
- Cognitive load: ${context.cognitiveScore}/100

Incoming interruption:
- New task: "${context.newTaskTitle}" (complexity: ${context.newTaskComplexity}/10, priority: ${context.newTaskPriority}/5)${memoryContext}

Calculate the interruption cost and recommend action.`;

  const response = await chatCompletion(SYSTEM_PROMPT, userPrompt, {
    temperature: 0.2,
    maxTokens: 600,
  });

  try {
    const cleaned = response.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return fallbackDecision(context, recentDeferrals);
  }
}

function fallbackDecision(
  context: {
    currentTaskComplexity: number;
    focusDepthMinutes: number;
    cognitiveScore: number;
    newTaskComplexity: number;
    newTaskPriority: number;
  },
  recentDeferrals: number
): {
  estimatedCostMinutes: number;
  recommendation: "accept" | "defer" | "delegate";
  priority: "low" | "medium" | "high" | "critical";
  message: string;
  suggestedActions: string[];
  deferUntil?: string;
  delegateReason?: string;
  reasoning: string;
} {
  const baseCost = context.focusDepthMinutes * 0.5;
  const complexityCost = context.currentTaskComplexity * 2;
  const estimatedCostMinutes = Math.round(baseCost + complexityCost);

  const isDeepFocus = context.focusDepthMinutes > 20;
  const isHighLoad = context.cognitiveScore > 70;
  const isLowPriorityInterrupt = context.newTaskPriority < 3;
  const isHighPriorityInterrupt = context.newTaskPriority >= 4;
  const tooManyDeferrals = recentDeferrals > 5;

  if (
    isHighLoad &&
    isLowPriorityInterrupt &&
    !tooManyDeferrals
  ) {
    return {
      estimatedCostMinutes,
      recommendation: "delegate",
      priority: "medium",
      message: `Your cognitive load is high (${context.cognitiveScore}/100) and this task is low priority. Consider delegating to a teammate.`,
      suggestedActions: [
        "Tag a teammate on this task",
        "Add to team backlog for triage",
      ],
      delegateReason: `High cognitive load (${context.cognitiveScore}) + low priority task (${context.newTaskPriority}/5) = delegation opportunity`,
      reasoning: "Rule-based: high load + low priority → delegate",
    };
  }

  if (isDeepFocus && !isHighPriorityInterrupt) {
    return {
      estimatedCostMinutes,
      recommendation: "defer",
      priority: "medium",
      message: `Switching now would cost ~${estimatedCostMinutes} minutes of recovery. Defer to your next natural break.`,
      suggestedActions: [
        "Continue current task",
        "Queue new task for next break",
      ],
      deferUntil: "Next natural break or end of current focus session",
      reasoning: `Rule-based: deep focus (${context.focusDepthMinutes}min) + non-urgent interrupt → defer`,
    };
  }

  return {
    estimatedCostMinutes,
    recommendation: "accept",
    priority: isHighPriorityInterrupt ? "high" : "medium",
    message: `Priority warrants immediate attention. Estimated switch cost: ~${estimatedCostMinutes} minutes.`,
    suggestedActions: ["Save current context", "Switch to new task"],
    reasoning: `Rule-based: priority ${context.newTaskPriority}/5 warrants switching`,
  };
}
