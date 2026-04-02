"use client";

import { useCallback, useState } from "react";
import { CognitiveGauge } from "@/components/dashboard/cognitive-gauge";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { TaskList } from "@/components/dashboard/task-list";
import { CognitiveChart } from "@/components/dashboard/cognitive-chart";
import { FocusTimer } from "@/components/dashboard/focus-timer";
import { SwitchTimeline } from "@/components/dashboard/switch-timeline";
import { AgentRecommendations } from "@/components/dashboard/agent-recommendations";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

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
    anomaly?: {
      isAnomaly: boolean;
      severity: "mild" | "moderate" | "severe";
      delta: number;
    };
    trend?: "improving" | "stable" | "declining";
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
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [focusMessage, setFocusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSync = useCallback(async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const syncRes = await fetch("/api/github/sync", { method: "POST" });
      const syncData = await syncRes.json();
      if (!syncRes.ok) {
        throw new Error(syncData.error ?? "Failed to sync GitHub data.");
      }

      await fetch("/api/cognitive/score?refresh=true");
      router.refresh();
      setSyncMessage({ type: "success", text: "GitHub sync completed." });
    } catch {
      setSyncMessage({ type: "error", text: "Sync failed. Please try again." });
    } finally {
      setSyncing(false);
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

  const trendIcon =
    cognitiveScore.trend === "improving" ? (
      <TrendingDown size={14} />
    ) : cognitiveScore.trend === "declining" ? (
      <TrendingUp size={14} />
    ) : (
      <Minus size={14} />
    );

  const trendLabel =
    cognitiveScore.trend === "improving"
      ? "Load decreasing"
      : cognitiveScore.trend === "declining"
      ? "Load increasing"
      : "Stable";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Your cognitive state at a glance
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={handleSync}
          disabled={syncing}
        >
          <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
          {syncing ? "Syncing..." : "Sync & Refresh"}
        </Button>
      </div>
      {syncMessage && (
        <p
          className={cn(
            "text-xs",
            syncMessage.type === "success" ? "text-foreground/70" : "text-destructive"
          )}
        >
          {syncMessage.text}
        </p>
      )}
      {focusMessage && (
        <p
          className={cn(
            "text-xs",
            focusMessage.type === "success" ? "text-foreground/70" : "text-destructive"
          )}
        >
          {focusMessage.text}
        </p>
      )}

      {/* HERO: Cognitive Score + Trend + Anomaly Alert */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <CognitiveGauge {...cognitiveScore} />
        </div>
        <div className="flex flex-col gap-4 lg:col-span-3">
          {/* Anomaly Alert */}
          {cognitiveScore.anomaly?.isAnomaly && (
            <Card
              className={cn(
                "border-l-4",
                cognitiveScore.anomaly.severity === "severe"
                  ? "border-l-zinc-900"
                  : cognitiveScore.anomaly.severity === "moderate"
                  ? "border-l-zinc-600"
                  : "border-l-zinc-400"
              )}
            >
              <CardContent className="flex items-center gap-3 p-4">
                <AlertTriangle
                  size={18}
                  className={cn(
                    cognitiveScore.anomaly.severity === "severe"
                      ? "text-zinc-900"
                      : "text-zinc-500"
                  )}
                />
                <div>
                  <p className="text-sm font-medium">
                    Cognitive Load Spike Detected
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Score jumped by +{cognitiveScore.anomaly.delta} points (
                    {cognitiveScore.anomaly.severity} severity). Consider
                    reviewing your workload.
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className="ml-auto shrink-0 text-xs capitalize"
                >
                  {cognitiveScore.anomaly.severity}
                </Badge>
              </CardContent>
            </Card>
          )}

          {/* Trend + Chart */}
          <Card className="flex-1">
            <CardContent className="p-0">
              <div className="flex items-center gap-3 border-b border-border px-5 py-3">
                <span className="text-sm font-medium text-muted-foreground">
                  Cognitive Load Trend
                </span>
                <Badge variant="outline" className="gap-1 text-xs">
                  {trendIcon}
                  {trendLabel}
                </Badge>
              </div>
              <div className="p-4">
                <CognitiveChart data={history} compact />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stats row */}
      <StatsCards {...stats} />

      {/* Agent Recommendations (high priority section) */}
      {recommendations.filter((r) => !r.dismissed).length > 0 && (
        <AgentRecommendations
          recommendations={recommendations}
          onDismiss={handleDismissRecommendation}
        />
      )}

      {/* Tasks + Sidebar */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TaskList tasks={tasks} />
        </div>
        <div className="space-y-6">
          <FocusTimer
            persistSession
            onPersistResult={(result) => {
              setFocusMessage({
                type: result.ok ? "success" : "error",
                text: result.message,
              });
              if (result.ok) router.refresh();
            }}
          />
          <SwitchTimeline switches={switches} />
        </div>
      </div>
    </div>
  );
}
