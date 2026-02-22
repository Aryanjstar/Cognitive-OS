"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BrainCircuit, Loader2, CircleDot, GitPullRequest } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

interface Briefing {
  id: string;
  taskId: string;
  taskType: string;
  title: string;
  content: string;
  sections: {
    whatChanged: string;
    keyDecisions: string;
    currentStatus: string;
    needsAttention: string;
  };
  generatedAt: string;
}

interface Task {
  id: string;
  type: "issue" | "pr";
  title: string;
  number: number;
  repo: string;
}

interface BriefingsClientProps {
  briefings: Briefing[];
  tasks: Task[];
}

export function BriefingsClient({ briefings, tasks }: BriefingsClientProps) {
  const router = useRouter();
  const [selectedTask, setSelectedTask] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [activeBriefing, setActiveBriefing] = useState<Briefing | null>(
    briefings[0] ?? null
  );

  const handleGenerate = useCallback(async () => {
    if (!selectedTask) return;
    const task = tasks.find((t) => t.id === selectedTask);
    if (!task) return;

    setGenerating(true);
    try {
      const res = await fetch("/api/ai/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: task.id,
          taskType: task.type,
        }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch {
      // Handle error
    } finally {
      setGenerating(false);
    }
  }, [selectedTask, tasks, router]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Briefings</h1>
        <p className="text-sm text-muted-foreground">
          Context reload summaries to eliminate mental friction
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Generate New Briefing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Select value={selectedTask} onValueChange={setSelectedTask}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a task to brief on..." />
                </SelectTrigger>
                <SelectContent>
                  {tasks.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      <span className="flex items-center gap-2">
                        {t.type === "pr" ? (
                          <GitPullRequest size={12} />
                        ) : (
                          <CircleDot size={12} />
                        )}
                        {t.repo} #{t.number}: {t.title}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleGenerate}
              disabled={!selectedTask || generating}
              className="gap-2"
            >
              {generating ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <BrainCircuit size={14} />
              )}
              Generate
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground px-1">
            History ({briefings.length})
          </h3>
          {briefings.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-sm text-muted-foreground">
                No briefings yet. Select a task and generate your first one.
              </CardContent>
            </Card>
          ) : (
            briefings.map((b) => (
              <button
                key={b.id}
                onClick={() => setActiveBriefing(b)}
                className={`w-full rounded-lg border p-4 text-left transition-colors ${
                  activeBriefing?.id === b.id
                    ? "border-foreground bg-muted"
                    : "border-border hover:bg-muted/50"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium leading-snug line-clamp-2">
                    {b.title}
                  </span>
                  <Badge variant="secondary" className="shrink-0 text-[10px]">
                    {b.taskType}
                  </Badge>
                </div>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {format(new Date(b.generatedAt), "MMM d, h:mm a")}
                </span>
              </button>
            ))
          )}
        </div>

        <div className="lg:col-span-2">
          {activeBriefing ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {activeBriefing.title}
                    </CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Generated{" "}
                      {format(
                        new Date(activeBriefing.generatedAt),
                        "MMM d, yyyy h:mm a"
                      )}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { title: "What Changed", content: activeBriefing.sections.whatChanged },
                  { title: "Key Decisions", content: activeBriefing.sections.keyDecisions },
                  { title: "Current Status", content: activeBriefing.sections.currentStatus },
                  { title: "Needs Attention", content: activeBriefing.sections.needsAttention },
                ].map((section) => (
                  <div key={section.title}>
                    <h4 className="mb-2 text-sm font-semibold">
                      {section.title}
                    </h4>
                    <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                      {section.content || "No information available."}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex h-[400px] items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BrainCircuit size={40} className="mx-auto mb-4 opacity-20" />
                  <p className="text-sm">
                    Select a briefing from the list or generate a new one
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
