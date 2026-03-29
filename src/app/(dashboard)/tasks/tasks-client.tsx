"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GitPullRequest,
  CircleDot,
  Search,
  Brain,
  Zap,
  Coffee,
  Ban,
  ArrowUpRight,
  Clock,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Task {
  id: string;
  type: "issue" | "pr";
  title: string;
  number: number;
  repo: string;
  repoFullName: string;
  repoId: string;
  complexity: number;
  priority: number;
  state: string;
  labels: string[];
  createdAt: string;
  updatedAt: string;
}

type TaskCategory = "deep" | "shallow" | "blocked" | "review";

function categorizeTask(task: Task): TaskCategory {
  if (task.state === "closed") return "shallow";

  const blockedLabels = ["blocked", "waiting", "on-hold", "needs-info"];
  if (task.labels.some((l) => blockedLabels.includes(l.toLowerCase()))) {
    return "blocked";
  }

  if (task.type === "pr") return "review";
  if (task.complexity >= 6) return "deep";
  return "shallow";
}

function getAIPriorityScore(task: Task): number {
  const ageDays =
    (Date.now() - new Date(task.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  const urgencyBoost = ageDays > 7 ? Math.min(ageDays / 7, 3) : 0;
  const complexityFactor = task.complexity / 10;
  const priorityWeight = task.priority / 5;
  const recencyDecay =
    1 -
    Math.min(
      (Date.now() - new Date(task.updatedAt).getTime()) /
        (30 * 24 * 60 * 60 * 1000),
      0.5
    );

  return Math.round(
    (priorityWeight * 40 +
      complexityFactor * 20 +
      urgencyBoost * 15 +
      recencyDecay * 25) *
      10
  ) / 10;
}

const categoryConfig: Record<
  TaskCategory,
  { label: string; icon: typeof Brain; description: string }
> = {
  deep: {
    label: "Deep Work",
    icon: Brain,
    description: "Complex tasks requiring sustained focus",
  },
  review: {
    label: "Code Reviews",
    icon: GitPullRequest,
    description: "Pull requests needing review",
  },
  shallow: {
    label: "Quick Tasks",
    icon: Zap,
    description: "Low-complexity or completed tasks",
  },
  blocked: {
    label: "Blocked",
    icon: Ban,
    description: "Waiting on external input",
  },
};

interface TasksClientProps {
  tasks: Task[];
  repos: { id: string; name: string }[];
}

export function TasksClient({ tasks, repos }: TasksClientProps) {
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [repoFilter, setRepoFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("ai-priority");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set()
  );

  const toggleGroup = (group: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  const filtered = useMemo(() => {
    let result = tasks;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.repo.toLowerCase().includes(q) ||
          t.number.toString().includes(q)
      );
    }

    if (stateFilter !== "all") {
      result = result.filter((t) => t.state === stateFilter);
    }

    if (repoFilter !== "all") {
      result = result.filter((t) => t.repoId === repoFilter);
    }

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "ai-priority":
          return getAIPriorityScore(b) - getAIPriorityScore(a);
        case "complexity":
          return b.complexity - a.complexity;
        case "priority":
          return b.priority - a.priority;
        case "updated":
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        case "created":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        default:
          return 0;
      }
    });

    return result;
  }, [tasks, search, stateFilter, repoFilter, sortBy]);

  const grouped = useMemo(() => {
    const groups: Record<TaskCategory, Task[]> = {
      deep: [],
      review: [],
      shallow: [],
      blocked: [],
    };

    for (const task of filtered) {
      const category = categorizeTask(task);
      groups[category].push(task);
    }

    return groups;
  }, [filtered]);

  const categoryOrder: TaskCategory[] = ["deep", "review", "shallow", "blocked"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
        <p className="text-sm text-muted-foreground">
          AI-prioritized and grouped for optimal workflow
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={stateFilter} onValueChange={setStateFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="State" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={repoFilter} onValueChange={setRepoFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Repository" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Repos</SelectItem>
            {repos.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ai-priority">AI Priority</SelectItem>
            <SelectItem value="complexity">Complexity</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
            <SelectItem value="updated">Last Updated</SelectItem>
            <SelectItem value="created">Created</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {categoryOrder.map((cat) => {
          const items = grouped[cat];
          if (items.length === 0) return null;
          const config = categoryConfig[cat];
          const Icon = config.icon;
          const isCollapsed = collapsedGroups.has(cat);

          return (
            <Card key={cat}>
              <CardHeader className="pb-2">
                <button
                  onClick={() => toggleGroup(cat)}
                  className="flex w-full items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg",
                        cat === "deep"
                          ? "bg-zinc-900 text-zinc-100"
                          : cat === "review"
                          ? "bg-zinc-700 text-zinc-100"
                          : cat === "blocked"
                          ? "bg-zinc-300 text-zinc-700"
                          : "bg-zinc-100 text-zinc-600"
                      )}
                    >
                      <Icon size={16} />
                    </div>
                    <div className="text-left">
                      <CardTitle className="text-sm font-semibold">
                        {config.label}
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          {items.length}
                        </span>
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {config.description}
                      </p>
                    </div>
                  </div>
                  {isCollapsed ? (
                    <ChevronRight size={16} className="text-muted-foreground" />
                  ) : (
                    <ChevronDown size={16} className="text-muted-foreground" />
                  )}
                </button>
              </CardHeader>
              {!isCollapsed && (
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {items.map((task) => {
                      const aiScore = getAIPriorityScore(task);
                      const ageDays = Math.floor(
                        (Date.now() - new Date(task.createdAt).getTime()) /
                          (1000 * 60 * 60 * 24)
                      );
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
                            </div>
                            <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                              <span>{task.repo} #{task.number}</span>
                              {ageDays > 0 && (
                                <span className="flex items-center gap-1">
                                  <Clock size={10} />
                                  {ageDays}d old
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {sortBy === "ai-priority" && (
                              <Badge
                                variant="outline"
                                className="gap-1 text-[10px] font-mono"
                              >
                                <ArrowUpRight size={10} />
                                {aiScore.toFixed(0)}
                              </Badge>
                            )}
                            <Badge
                              variant="secondary"
                              className={cn(
                                "shrink-0 text-xs",
                                task.complexity <= 3
                                  ? "bg-zinc-100 text-zinc-600"
                                  : task.complexity <= 6
                                  ? "bg-zinc-200 text-zinc-700"
                                  : "bg-zinc-800 text-zinc-100"
                              )}
                            >
                              {task.complexity.toFixed(1)}
                            </Badge>
                            <Badge
                              variant={
                                task.state === "open" ? "default" : "secondary"
                              }
                              className="text-[10px]"
                            >
                              {task.state}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      <p className="text-right text-xs text-muted-foreground">
        Showing {filtered.length} of {tasks.length} tasks
      </p>
    </div>
  );
}
