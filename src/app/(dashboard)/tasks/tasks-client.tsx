"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GitPullRequest, CircleDot, Search } from "lucide-react";
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

interface TasksClientProps {
  tasks: Task[];
  repos: { id: string; name: string }[];
}

export function TasksClient({ tasks, repos }: TasksClientProps) {
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [repoFilter, setRepoFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("complexity");

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
        case "complexity":
          return b.complexity - a.complexity;
        case "priority":
          return b.priority - a.priority;
        case "updated":
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case "created":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [tasks, search, stateFilter, repoFilter, sortBy]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
        <p className="text-sm text-muted-foreground">
          All synced issues and pull requests from GitHub
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
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
            <SelectItem value="complexity">Complexity</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
            <SelectItem value="updated">Last Updated</SelectItem>
            <SelectItem value="created">Created</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10"></TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="w-[120px]">Repository</TableHead>
              <TableHead className="w-[90px]">Complexity</TableHead>
              <TableHead className="w-[80px]">State</TableHead>
              <TableHead className="w-[100px]">Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  {tasks.length === 0
                    ? "No tasks synced yet. Click Sync & Refresh on the dashboard."
                    : "No tasks match your filters."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    {task.type === "pr" ? (
                      <GitPullRequest size={14} className="text-muted-foreground" />
                    ) : (
                      <CircleDot size={14} className="text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{task.title}</div>
                    <div className="text-xs text-muted-foreground">
                      #{task.number}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {task.repo}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs",
                        task.complexity <= 3
                          ? "bg-zinc-100 text-zinc-600"
                          : task.complexity <= 6
                          ? "bg-zinc-200 text-zinc-700"
                          : "bg-zinc-800 text-zinc-100"
                      )}
                    >
                      {task.complexity.toFixed(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={task.state === "open" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {task.state}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(new Date(task.updatedAt), "MMM d")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground text-right">
        Showing {filtered.length} of {tasks.length} tasks
      </p>
    </div>
  );
}
