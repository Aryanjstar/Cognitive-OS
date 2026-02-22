export interface CognitiveLoadBreakdown {
  taskLoad: number;
  switchPenalty: number;
  reviewLoad: number;
  urgencyStress: number;
  fatigueIndex: number;
  staleness: number;
}

export interface CognitiveScore {
  score: number;
  level: "flow" | "moderate" | "overloaded";
  breakdown: CognitiveLoadBreakdown;
  timestamp: Date;
}

export interface AgentRecommendation {
  agent: "focus" | "planning" | "interrupt-guard";
  type: "break" | "defer" | "reorder" | "accept" | "delegate";
  message: string;
  priority: "low" | "medium" | "high" | "critical";
  estimatedCostMinutes?: number;
  suggestedActions?: string[];
  createdAt: Date;
}

export interface ContextBriefing {
  id: string;
  taskId: string;
  taskType: "issue" | "pull_request";
  title: string;
  content: string;
  sections: {
    whatChanged: string;
    keyDecisions: string;
    currentStatus: string;
    needsAttention: string;
  };
  generatedAt: Date;
}

export interface FocusSessionData {
  id: string;
  taskType: string;
  taskId?: string;
  startedAt: Date;
  endedAt?: Date;
  duration: number;
  interrupted: boolean;
  interruptionCount: number;
}

export interface DailyAnalyticsData {
  date: string;
  totalFocusMinutes: number;
  contextSwitches: number;
  avgCognitiveLoad: number;
  deepWorkStreaks: number;
  peakFocusHour: number;
}
