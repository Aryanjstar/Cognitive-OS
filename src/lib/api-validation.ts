import { z } from "zod";

export const agentRecommendPostSchema = z.object({
  trigger: z.enum(["periodic", "new_task", "manual"]).default("manual"),
  newTaskContext: z
    .object({
      taskTitle: z.string().min(1).max(500),
      taskComplexity: z.number().min(1).max(10),
      taskPriority: z.number().min(1).max(5),
    })
    .optional(),
});

export const agentRecommendPatchSchema = z.object({
  id: z.string().min(1, "id is required"),
  dismissed: z.boolean(),
});

export const briefingPostSchema = z.object({
  taskId: z.string().min(1, "taskId is required"),
  taskType: z.enum(["issue", "pull_request"]),
});

export const cognitiveScoreQuerySchema = z.object({
  refresh: z
    .string()
    .optional()
    .transform((v) => v === "true"),
  days: z
    .string()
    .optional()
    .transform((v) => {
      const n = parseInt(v ?? "7", 10);
      return isNaN(n) || n < 1 || n > 90 ? 7 : n;
    }),
});

export const focusSessionPostSchema = z.object({
  taskType: z.string().trim().min(1).max(100).default("general"),
  startedAt: z.string().datetime(),
  duration: z.number().int().min(1).max(24 * 60 * 60),
  interrupted: z.boolean().default(false),
  interruptionCount: z.number().int().min(0).max(100).default(0),
  notes: z.string().max(2000).optional(),
});
