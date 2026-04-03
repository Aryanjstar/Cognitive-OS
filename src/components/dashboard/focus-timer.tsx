"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Square } from "lucide-react";

interface FocusTimerProps {
  onSessionEnd?: (duration: number) => void;
  persistSession?: boolean;
  onPersistResult?: (result: { ok: boolean; message: string }) => void;
}

export function FocusTimer({
  onSessionEnd,
  persistSession = false,
  onPersistResult,
}: FocusTimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [sessionStart, setSessionStart] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleStart = useCallback(() => {
    setError(null);
    setIsRunning(true);
    if (!sessionStart) {
      setSessionStart(new Date());
    }
  }, [sessionStart]);

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

    if (elapsed > 0) {
      onSessionEnd?.(elapsed);
    }

    if (!persistSession) {
      setElapsed(0);
      setSessionStart(null);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/focus/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskType: "dashboard-focus",
          startedAt: sessionStart.toISOString(),
          duration: elapsed,
          interrupted: false,
          interruptionCount: 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const message = data.error ?? "Failed to save focus session.";
        setError(message);
        onPersistResult?.({ ok: false, message });
        return;
      }

      setElapsed(0);
      setSessionStart(null);
      onPersistResult?.({ ok: true, message: "Focus session saved." });
    } catch {
      const message = "Failed to save focus session.";
      setError(message);
      onPersistResult?.({ ok: false, message });
    } finally {
      setSaving(false);
    }
  }, [elapsed, onPersistResult, onSessionEnd, persistSession, sessionStart]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Focus Session
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="text-4xl font-mono font-bold tracking-wider">
            {formatTime(elapsed)}
          </div>

          {sessionStart && (
            <p className="mt-1 text-xs text-muted-foreground">
              Started at{" "}
              {sessionStart.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}

          <div className="mt-6 flex gap-3">
            {!isRunning ? (
              <Button
                onClick={handleStart}
                size="sm"
                className="gap-2"
                disabled={saving}
              >
                <Play size={14} />
                {elapsed > 0 ? "Resume" : "Start Focus"}
              </Button>
            ) : (
              <Button
                onClick={handlePause}
                size="sm"
                variant="outline"
                className="gap-2"
                disabled={saving}
              >
                <Pause size={14} />
                Pause
              </Button>
            )}
            {(isRunning || elapsed > 0) && (
              <Button
                onClick={handleStop}
                size="sm"
                variant="ghost"
                className="gap-2"
                disabled={saving}
              >
                <Square size={14} />
                {saving ? "Saving..." : "End"}
              </Button>
            )}
          </div>
          {error && (
            <p className="mt-3 text-center text-xs text-destructive">{error}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
