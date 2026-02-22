"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Square, Timer, Flame, Zap } from "lucide-react";
import { format } from "date-fns";

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

export function FocusClient({ sessions }: FocusClientProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [mode, setMode] = useState<"free" | "pomodoro">("free");
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
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const pomodoroRemaining =
    mode === "pomodoro" ? Math.max(0, POMODORO_MINUTES * 60 - elapsed) : null;

  useEffect(() => {
    if (pomodoroRemaining === 0 && isRunning && mode === "pomodoro") {
      setIsRunning(false);
    }
  }, [pomodoroRemaining, isRunning, mode]);

  const handleStop = useCallback(() => {
    setIsRunning(false);
    setElapsed(0);
  }, []);

  const todaySessions = sessions.filter(
    (s) =>
      new Date(s.startedAt).toDateString() === new Date().toDateString()
  );
  const totalFocusToday = todaySessions.reduce((sum, s) => sum + s.duration, 0);
  const totalInterruptions = todaySessions.reduce(
    (sum, s) => sum + s.interruptionCount,
    0
  );

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
                  className="h-6 text-xs px-2"
                  onClick={() => setMode("free")}
                >
                  Free
                </Button>
                <Button
                  variant={mode === "pomodoro" ? "default" : "ghost"}
                  size="sm"
                  className="h-6 text-xs px-2"
                  onClick={() => setMode("pomodoro")}
                >
                  Pomodoro
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center py-8">
              <div className="text-5xl font-mono font-bold tracking-wider">
                {mode === "pomodoro" && pomodoroRemaining != null
                  ? formatTime(pomodoroRemaining)
                  : formatTime(elapsed)}
              </div>
              {mode === "pomodoro" && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {POMODORO_MINUTES} minute session
                </p>
              )}
              <div className="mt-8 flex gap-3">
                {!isRunning ? (
                  <Button
                    onClick={() => setIsRunning(true)}
                    size="lg"
                    className="gap-2"
                  >
                    <Play size={16} />
                    {elapsed > 0 ? "Resume" : "Start"}
                  </Button>
                ) : (
                  <Button
                    onClick={() => setIsRunning(false)}
                    size="lg"
                    variant="outline"
                    className="gap-2"
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
                  >
                    <Square size={16} />
                    End
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted p-2">
                    <Timer size={18} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Focus Today</p>
                    <p className="text-xl font-bold">
                      {Math.floor(totalFocusToday / 3600)}h{" "}
                      {Math.floor((totalFocusToday % 3600) / 60)}m
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted p-2">
                    <Flame size={18} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Sessions</p>
                    <p className="text-xl font-bold">{todaySessions.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted p-2">
                    <Zap size={18} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Interruptions</p>
                    <p className="text-xl font-bold">{totalInterruptions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

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
              sessions.slice(0, 10).map((s) => (
                <div key={s.id} className="flex items-center justify-between px-6 py-3">
                  <div>
                    <span className="text-sm font-medium">
                      {format(new Date(s.startedAt), "MMM d, h:mm a")}
                    </span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {s.taskType}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {s.interrupted && (
                      <Badge variant="secondary" className="text-xs">
                        {s.interruptionCount} interruption{s.interruptionCount !== 1 ? "s" : ""}
                      </Badge>
                    )}
                    <span className="text-sm font-mono">
                      {Math.floor(s.duration / 60)}m
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
