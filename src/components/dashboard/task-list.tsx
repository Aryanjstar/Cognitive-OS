"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitPullRequest, CircleDot, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskItem {
  id: string;
  type: "issue" | "pr";
  title: string;
  number: number;
  repo: string;
  complexity: number;
  state: string;
  url?: string;
}

interface TaskListProps {
  tasks: TaskItem[];
  title?: string;
  maxItems?: number;
}

function getComplexityLabel(c: number): { label: string; className: string } {
  if (c <= 3) return { label: "Low", className: "bg-zinc-100 text-zinc-600" };
  if (c <= 6) return { label: "Med", className: "bg-zinc-200 text-zinc-700" };
  return { label: "High", className: "bg-zinc-800 text-zinc-100" };
}

export function TaskList({
  tasks,
  title = "Active Tasks",
  maxItems = 8,
}: TaskListProps) {
  const displayed = tasks.slice(0, maxItems);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <span className="text-xs text-muted-foreground">
          {tasks.length} total
        </span>
      </CardHeader>
      <CardContent className="p-0">
        {displayed.length === 0 ? (
          <div className="px-6 pb-6 text-center text-sm text-muted-foreground">
            No active tasks. Sync your GitHub to get started.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {displayed.map((task) => {
              const complexity = getComplexityLabel(task.complexity);
              return (
                <div
                  key={task.id}
                  className="flex items-center gap-3 px-6 py-3 transition-colors hover:bg-muted/30"
                >
                  {task.type === "pr" ? (
                    <GitPullRequest
                      size={16}
                      className="shrink-0 text-muted-foreground"
                    />
                  ) : (
                    <CircleDot
                      size={16}
                      className="shrink-0 text-muted-foreground"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">
                        {task.title}
                      </span>
                      {task.url && (
                        <a
                          href={task.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 text-muted-foreground hover:text-foreground"
                        >
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {task.repo} #{task.number}
                    </span>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn("shrink-0 text-xs", complexity.className)}
                  >
                    {complexity.label}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
