"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ShieldAlert,
  ListOrdered,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Recommendation {
  id: string;
  agent: string;
  type: string;
  message: string;
  priority: string;
  estimatedCostMinutes?: number | null;
  dismissed: boolean;
}

interface AgentRecommendationsProps {
  recommendations: Recommendation[];
  onDismiss?: (id: string) => void;
  onAccept?: (id: string) => void;
}

const agentConfig: Record<
  string,
  { icon: typeof Sparkles; label: string; color: string }
> = {
  focus: {
    icon: Sparkles,
    label: "Focus Agent",
    color: "bg-zinc-900 text-zinc-100",
  },
  "interrupt-guard": {
    icon: ShieldAlert,
    label: "Interrupt Guard",
    color: "bg-zinc-700 text-zinc-100",
  },
  planning: {
    icon: ListOrdered,
    label: "Planning Agent",
    color: "bg-zinc-500 text-zinc-100",
  },
};

const priorityConfig: Record<string, { label: string; className: string }> = {
  low: { label: "Low", className: "bg-zinc-100 text-zinc-600" },
  medium: { label: "Medium", className: "bg-zinc-200 text-zinc-700" },
  high: { label: "High", className: "bg-zinc-700 text-zinc-100" },
  critical: { label: "Critical", className: "bg-zinc-900 text-zinc-100" },
};

const typeLabels: Record<string, string> = {
  break: "Take a break",
  defer: "Defer task",
  reorder: "Reorder tasks",
  accept: "Accept switch",
  delegate: "Delegate task",
};

function RecommendationCard({
  rec,
  onDismiss,
  onAccept,
}: {
  rec: Recommendation;
  onDismiss?: (id: string) => void;
  onAccept?: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const agent = agentConfig[rec.agent] ?? {
    icon: Sparkles,
    label: rec.agent,
    color: "bg-zinc-500 text-zinc-100",
  };
  const priority = priorityConfig[rec.priority] ?? priorityConfig.medium;
  const Icon = agent.icon;

  return (
    <div className="rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-sm">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            agent.color
          )}
        >
          <Icon size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              {agent.label}
            </span>
            <Badge
              variant="secondary"
              className={cn("text-[10px]", priority.className)}
            >
              {priority.label}
            </Badge>
            {rec.type && typeLabels[rec.type] && (
              <Badge variant="outline" className="text-[10px]">
                {typeLabels[rec.type]}
              </Badge>
            )}
          </div>
          <p className="mt-1.5 text-sm leading-relaxed">{rec.message}</p>

          {/* Expandable details */}
          {rec.estimatedCostMinutes != null && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <Lightbulb size={12} />
              {expanded ? "Hide details" : "Show details"}
              {expanded ? (
                <ChevronUp size={12} />
              ) : (
                <ChevronDown size={12} />
              )}
            </button>
          )}

          {expanded && (
            <div className="mt-2 rounded-md bg-muted/50 p-3">
              {rec.estimatedCostMinutes != null && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock size={12} />
                  Estimated impact: ~{rec.estimatedCostMinutes} minutes
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-3 flex items-center justify-end gap-2 pl-12">
        {onAccept && (
          <Button
            variant="default"
            size="sm"
            className="h-7 gap-1.5 text-xs"
            onClick={() => onAccept(rec.id)}
          >
            <Check size={12} />
            Accept
          </Button>
        )}
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 text-xs text-muted-foreground"
            onClick={() => onDismiss(rec.id)}
          >
            <X size={12} />
            Dismiss
          </Button>
        )}
      </div>
    </div>
  );
}

export function AgentRecommendations({
  recommendations,
  onDismiss,
  onAccept,
}: AgentRecommendationsProps) {
  const active = recommendations.filter((r) => !r.dismissed);

  if (active.length === 0) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Sparkles size={14} className="text-muted-foreground" />
          AI Agent Insights
          <Badge variant="secondary" className="ml-1 text-[10px]">
            {active.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {active.map((rec) => (
            <RecommendationCard
              key={rec.id}
              rec={rec}
              onDismiss={onDismiss}
              onAccept={onAccept}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
