"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ShieldAlert,
  ListOrdered,
  X,
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
}

const agentIcons: Record<string, typeof Sparkles> = {
  focus: Sparkles,
  "interrupt-guard": ShieldAlert,
  planning: ListOrdered,
};

const priorityStyles: Record<string, string> = {
  low: "bg-zinc-100 text-zinc-600",
  medium: "bg-zinc-200 text-zinc-700",
  high: "bg-zinc-700 text-zinc-100",
  critical: "bg-zinc-900 text-zinc-100",
};

export function AgentRecommendations({
  recommendations,
  onDismiss,
}: AgentRecommendationsProps) {
  const active = recommendations.filter((r) => !r.dismissed);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          AI Agent Insights
        </CardTitle>
        <Sparkles size={14} className="text-muted-foreground" />
      </CardHeader>
      <CardContent className="p-0">
        {active.length === 0 ? (
          <div className="px-6 pb-6 text-center text-sm text-muted-foreground">
            No active recommendations. Your agents are monitoring.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {active.map((rec) => {
              const Icon = agentIcons[rec.agent] ?? Sparkles;
              return (
                <div key={rec.id} className="flex gap-3 px-6 py-4">
                  <Icon
                    size={16}
                    className="mt-0.5 shrink-0 text-muted-foreground"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[10px]",
                          priorityStyles[rec.priority] ?? priorityStyles.medium
                        )}
                      >
                        {rec.agent}
                      </Badge>
                      {rec.estimatedCostMinutes != null && (
                        <span className="text-xs text-muted-foreground">
                          ~{rec.estimatedCostMinutes}min impact
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm leading-relaxed">
                      {rec.message}
                    </p>
                  </div>
                  {onDismiss && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 shrink-0 p-0"
                      onClick={() => onDismiss(rec.id)}
                    >
                      <X size={12} />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
