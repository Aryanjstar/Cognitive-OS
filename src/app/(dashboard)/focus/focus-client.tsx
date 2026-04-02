"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Pause,
  Square,
  Timer,
  Flame,
  Zap,
  TrendingUp,
  TrendingDown,
  Target,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Session {
  id: string;
  taskType: string;
  startedAt: string;
  endedAt: string | null;
  duration: number;
  interrupted: boolean;
  interruptionCount: number;
}

interface FocusClientProps {
  sessions: Session[];
  userId: string;
}

function calculateFocusScore(session: Session): number {
  const durationMinutes = session.duration / 60;
  const durationScore = Math.min(durationMinutes / 90, 1) * 50;
  const interruptionPenalty = session.interruptionCount * 8;
  const continuityBonus = !session.interrupted ? 20 : 0;
  const deepWorkBonus = durationMinutes >= 25 ? 15 : durationMinutes >= 15 ? 8 : 0;
  return Math.max(
    0,
    Math.min(100, Math.round(durationScore + continuityBonus + deepWorkBonus - interruptionPenalty))
  );
}

function getSessionInsight(session: Session): string {
  const score = calculateFocusScore(session);
  const mins = Math.round(session.duration / 60);

  if (score >= 80)
    return `Excellent ${mins}min deep work session with minimal interruptions.`;
  if (score >= 60)
    return `Good ${mins}min session. ${session.interruptionCount > 0 ? `${session.interruptionCount} interruption(s) reduced effectiveness.` : "Solid focus maintained."}`;
  if (score >= 40)
    return `Moderate session. ${session.interrupted ? "Interruptions fragmented your focus." : "Consider longer sessions for deeper work."}`;
  return `Short or disrupted session. Try blocking notifications for your next session.`;
}

function getFocusScoreColor(score: number): string {
  if (score >= 80) return "text-zinc-900";
  if (score >= 60) return "text-zinc-700";
  if (score >= 40) return "text-zinc-500";
  return "text-zinc-400";
}

function getFocusScoreBg(score: number): string {
  if (score >= 80) return "bg-zinc-900 text-zinc-100";
  if (score >= 60) return "bg-zinc-600 text-zinc-100";
  if (score >= 40) return "bg-zinc-300 text-zinc-800";
  return "bg-zinc-100 text-zinc-500";
}

export function FocusClient({ sessions }: FocusClientProps) {
  const router = useRouter();
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [mode, setMode] = useState<"free" | "pomodoro">("free");
  const [sessionStart, setSessionStart] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const POMODORO_MINUTES = 25;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => setElapsed((p) => p + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0)
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const pomodoroRemaining =
    mode === "pomodoro" ? Math.max(0, POMODORO_MINUTES * 60 - elapsed) : null;

  useEffect(() => {
    if (pomodoroRemaining === 0 && isRunning && mode === "pomodoro") {
      setIsRunning(false);
    }
  }, [pomodoroRemaining, isRunning, mode]);

  const handleStart = useCallback(() => {
    setError(null);
    setIsRunning(true);
    setSessionStart((prev) => prev ?? new Date());
  }, []);

  const handlePause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const handleStop = useCallback(async () => {
    setIsRunning(false);

    if (elapsed <= 0 || !sessionStart) {
      setElapsed(0);
      setSessionStart(null);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const interrupted = mode === "pomodoro" && elapsed < POMODORO_MINUTES * 60;
      const res = await fetch("/api/focus/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskType: mode === "pomodoro" ? "pomodoro" : "focus",
          startedAt: sessionStart.toISOString(),
          duration: elapsed,
          interrupted,
          interruptionCount: interrupted ? 1 : 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to save focus session.");
        return;
      }

      setElapsed(0);
      setSessionStart(null);
      router.refresh();
    } catch {
      setError("Failed to save focus session.");
    } finally {
      setSaving(false);
    }
  }, [elapsed, mode, router, sessionStart]);

  const todaySessions = sessions.filter(
    (s) =>
      new Date(s.startedAt).toDateString() === new Date().toDateString()
  );
  const totalFocusToday = todaySessions.reduce(
    (sum, s) => sum + s.duration,
    0
  );
  const totalInterruptions = todaySessions.reduce(
    (sum, s) => sum + s.interruptionCount,
    0
  );

  const todayFocusScore = useMemo(() => {
    if (todaySessions.length === 0) return 0;
    const scores = todaySessions.map(calculateFocusScore);
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }, [todaySessions]);

  const weeklyInsights = useMemo(() => {
    const weekSessions = sessions.filter(
      (s) =>
        Date.now() - new Date(s.startedAt).getTime() < 7 * 24 * 60 * 60 * 1000
    );

    if (weekSessions.length < 2) return null;

    const avgScore =
      weekSessions.reduce((sum, s) => sum + calculateFocusScore(s), 0) /
      weekSessions.length;
    const avgDuration =
      weekSessions.reduce((sum, s) => sum + s.duration, 0) /
      weekSessions.length;
    const interruptRate =
      weekSessions.filter((s) => s.interrupted).length / weekSessions.length;

    const peakHours: Record<number, number> = {};
    for (const s of weekSessions) {
      const h = new Date(s.startedAt).getHours();
      peakHours[h] = (peakHours[h] || 0) + s.duration;
    }
    const bestHour = Object.entries(peakHours).sort(
      ([, a], [, b]) => b - a
    )[0];

    return {
      avgScore: Math.round(avgScore),
      avgDurationMin: Math.round(avgDuration / 60),
      interruptRate: Math.round(interruptRate * 100),
      bestHour: bestHour ? parseInt(bestHour[0]) : null,
      totalSessions: weekSessions.length,
    };
  }, [sessions]);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const heatmapData = days.map((day) => {
    const daySessions = sessions.filter(
      (s) => new Date(s.startedAt).toDateString() === day.toDateString()
    );
    return hours.map((hour) => {
      const hourSessions = daySessions.filter((s) => {
        const h = new Date(s.startedAt).getHours();
        return h === hour;
      });
      return hourSessions.reduce((sum, s) => sum + s.duration, 0);
    });
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Focus</h1>
        <p className="text-sm text-muted-foreground">
          Track and protect your deep work sessions
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Focus Timer
              </CardTitle>
              <div className="flex gap-1">
                <Button
                  variant={mode === "free" ? "default" : "ghost"}
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => setMode("free")}
                >
                  Free
                </Button>
                <Button
                  variant={mode === "pomodoro" ? "default" : "ghost"}
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => setMode("pomodoro")}
                >
                  Pomodoro
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center py-8">
              <div className="font-mono text-5xl font-bold tracking-wider">
                {mode === "pomodoro" && pomodoroRemaining != null
                  ? formatTime(pomodoroRemaining)
                  : formatTime(elapsed)}
              </div>
              {mode === "pomodoro" && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {POMODORO_MINUTES} minute session
                </p>
              )}
              {isRunning && elapsed >= 60 && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-900" />
                  <span className="text-xs text-muted-foreground">
                    Focus active
                  </span>
                </div>
              )}
              <div className="mt-8 flex gap-3">
                {!isRunning ? (
                  <Button
                    onClick={handleStart}
                    size="lg"
                    className="gap-2"
                    disabled={saving}
                  >
                    <Play size={16} />
                    {elapsed > 0 ? "Resume" : "Start"}
                  </Button>
                ) : (
                  <Button
                    onClick={handlePause}
                    size="lg"
                    variant="outline"
                    className="gap-2"
                    disabled={saving}
                  >
                    <Pause size={16} />
                    Pause
                  </Button>
                )}
                {(isRunning || elapsed > 0) && (
                  <Button
                    onClick={handleStop}
                    size="lg"
                    variant="ghost"
                    className="gap-2"
                    disabled={saving}
                  >
                    <Square size={16} />
                    {saving ? "Saving..." : "End"}
                  </Button>
                )}
              </div>
              {error && (
                <p className="mt-4 text-center text-xs text-destructive">
                  {error}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted p-2">
                    <Target size={16} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Focus Score
                    </p>
                    <p
                      className={cn(
                        "text-xl font-bold",
                        getFocusScoreColor(todayFocusScore)
                      )}
                    >
                      {todayFocusScore}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted p-2">
                    <Timer size={16} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Focus Today
                    </p>
                    <p className="text-xl font-bold">
                      {Math.floor(totalFocusToday / 3600)}h{" "}
                      {Math.floor((totalFocusToday % 3600) / 60)}m
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted p-2">
                    <Flame size={16} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Sessions
                    </p>
                    <p className="text-xl font-bold">{todaySessions.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted p-2">
                    <Zap size={16} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Interruptions
                    </p>
                    <p className="text-xl font-bold">{totalInterruptions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {weeklyInsights && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Weekly Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Avg Score
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-lg font-bold">
                      {weeklyInsights.avgScore}
                      {weeklyInsights.avgScore >= 60 ? (
                        <TrendingUp size={14} className="text-zinc-600" />
                      ) : (
                        <TrendingDown size={14} className="text-zinc-400" />
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Avg Duration
                    </p>
                    <p className="mt-1 text-lg font-bold">
                      {weeklyInsights.avgDurationMin}m
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Interrupt Rate
                    </p>
                    <p className="mt-1 text-lg font-bold">
                      {weeklyInsights.interruptRate}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Best Hour
                    </p>
                    <p className="mt-1 text-lg font-bold">
                      {weeklyInsights.bestHour !== null
                        ? `${weeklyInsights.bestHour}:00`
                        : "—"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Focus Heatmap (7 days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="min-w-[600px]">
                  <div className="mb-1 flex gap-0.5 pl-12">
                    {hours
                      .filter((h) => h % 3 === 0)
                      .map((h) => (
                        <div
                          key={h}
                          className="text-[10px] text-muted-foreground"
                          style={{ width: "36px" }}
                        >
                          {h.toString().padStart(2, "0")}
                        </div>
                      ))}
                  </div>
                  {days.map((day, di) => (
                    <div key={di} className="flex items-center gap-1">
                      <span className="w-10 text-right text-[10px] text-muted-foreground">
                        {format(day, "EEE")}
                      </span>
                      <div className="flex gap-0.5">
                        {heatmapData[di].map((val, hi) => {
                          const intensity = Math.min(val / 3600, 1);
                          return (
                            <div
                              key={hi}
                              className="h-3 w-3 rounded-sm"
                              style={{
                                backgroundColor:
                                  intensity === 0
                                    ? "var(--muted)"
                                    : `rgba(0, 0, 0, ${0.1 + intensity * 0.7})`,
                              }}
                              title={`${format(day, "MMM d")} ${hi}:00 — ${Math.round(val / 60)}min`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Recent Sessions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {sessions.slice(0, 10).length === 0 ? (
              <div className="px-6 py-8 text-center text-sm text-muted-foreground">
                No focus sessions recorded yet. Start your first session above.
              </div>
            ) : (
              sessions.slice(0, 10).map((s) => {
                const score = calculateFocusScore(s);
                const insight = getSessionInsight(s);
                return (
                  <div key={s.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold",
                            getFocusScoreBg(score)
                          )}
                        >
                          {score}
                        </div>
                        <div>
                          <span className="text-sm font-medium">
                            {format(new Date(s.startedAt), "MMM d, h:mm a")}
                          </span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            {s.taskType}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {s.interrupted && (
                          <Badge variant="secondary" className="text-xs">
                            {s.interruptionCount} interruption
                            {s.interruptionCount !== 1 ? "s" : ""}
                          </Badge>
                        )}
                        <span className="font-mono text-sm">
                          {Math.floor(s.duration / 60)}m
                        </span>
                      </div>
                    </div>
                    <p className="mt-1.5 pl-11 text-xs text-muted-foreground">
                      {insight}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
