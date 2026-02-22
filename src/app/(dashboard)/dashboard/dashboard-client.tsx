"use client";

import { useCallback } from "react";
import { CognitiveGauge } from "@/components/dashboard/cognitive-gauge";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { TaskList } from "@/components/dashboard/task-list";
import { CognitiveChart } from "@/components/dashboard/cognitive-chart";
import { FocusTimer } from "@/components/dashboard/focus-timer";
import { SwitchTimeline } from "@/components/dashboard/switch-timeline";
import { AgentRecommendations } from "@/components/dashboard/agent-recommendations";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

interface DashboardClientProps {
  cognitiveScore: {
    score: number;
    level: "flow" | "moderate" | "overloaded";
    breakdown?: {
      taskLoad: number;
      switchPenalty: number;
      reviewLoad: number;
      urgencyStress: number;
      fatigueIndex: number;
      staleness: number;
    };
  };
  history: { score: number; timestamp: string }[];
  tasks: {
    id: string;
    type: "issue" | "pr";
    title: string;
    number: number;
    repo: string;
    complexity: number;
    state: string;
  }[];
  switches: {
    id: string;
    fromTask: string | null;
    toTask: string | null;
    switchedAt: string;
    estimatedCost: number;
  }[];
  stats: {
    focusMinutes: number;
    contextSwitches: number;
    deepWorkStreak: number;
    tasksCompleted: number;
  };
  recommendations: {
    id: string;
    agent: string;
    type: string;
    message: string;
    priority: string;
    estimatedCostMinutes?: number | null;
    dismissed: boolean;
  }[];
}

export function DashboardClient({
  cognitiveScore,
  history,
  tasks,
  switches,
  stats,
  recommendations,
}: DashboardClientProps) {
  const router = useRouter();

  const handleSync = useCallback(async () => {
    try {
      await fetch("/api/github/sync", { method: "POST" });
      await fetch("/api/cognitive/score?refresh=true");
      router.refresh();
    } catch {
      // silently fail for now
    }
  }, [router]);

  const handleDismissRecommendation = useCallback(
    async (id: string) => {
      try {
        await fetch(`/api/agents/recommend`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, dismissed: true }),
        });
        router.refresh();
      } catch {
        // silently fail
      }
    },
    [router]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Your cognitive state at a glance
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={handleSync}>
          <RefreshCw size={14} />
          Sync & Refresh
        </Button>
      </div>

      <StatsCards {...stats} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <CognitiveGauge {...cognitiveScore} />
        </div>
        <div className="lg:col-span-2">
          <CognitiveChart data={history} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TaskList tasks={tasks} />
        </div>
        <div className="space-y-6">
          <FocusTimer />
          <SwitchTimeline switches={switches} />
        </div>
      </div>

      <AgentRecommendations
        recommendations={recommendations}
        onDismiss={handleDismissRecommendation}
      />
    </div>
  );
}
