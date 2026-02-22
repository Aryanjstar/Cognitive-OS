"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface SwitchEvent {
  id: string;
  fromTask: string | null;
  toTask: string | null;
  switchedAt: string | Date;
  estimatedCost: number;
}

interface SwitchTimelineProps {
  switches: SwitchEvent[];
}

export function SwitchTimeline({ switches }: SwitchTimelineProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Context Switches Today
        </CardTitle>
      </CardHeader>
      <CardContent>
        {switches.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-4">
            No context switches recorded today. Great focus!
          </p>
        ) : (
          <div className="space-y-3">
            {switches.map((sw, i) => (
              <div key={sw.id} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-2 w-2 rounded-full bg-foreground" />
                  {i < switches.length - 1 && (
                    <div className="mt-1 h-8 w-px bg-border" />
                  )}
                </div>
                <div className="flex-1 pb-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">
                      {sw.fromTask ?? "idle"} → {sw.toTask ?? "idle"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ~{sw.estimatedCost.toFixed(0)}min cost
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(sw.switchedAt), "h:mm a")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
