"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, startOfDay, eachDayOfInterval, subDays } from "date-fns";

interface AnalyticsClientProps {
  snapshots: {
    score: number;
    level: string;
    timestamp: string;
    breakdown: Record<string, number>;
  }[];
  dailyData: {
    date: string;
    totalFocusMinutes: number;
    contextSwitches: number;
    avgCognitiveLoad: number;
    deepWorkStreaks: number;
  }[];
  focusSessions: { duration: number; startedAt: string }[];
  switches: { switchedAt: string; estimatedCost: number }[];
}

const tooltipStyle = {
  backgroundColor: "#09090b",
  border: "1px solid #27272a",
  borderRadius: "8px",
  color: "#fafafa",
  fontSize: "12px",
};

export function AnalyticsClient({
  snapshots,
  focusSessions,
  switches,
}: AnalyticsClientProps) {
  const days = useMemo(() => {
    return eachDayOfInterval({
      start: subDays(new Date(), 29),
      end: new Date(),
    });
  }, []);

  const loadByDay = useMemo(() => {
    return days.map((day) => {
      const dayStr = format(day, "yyyy-MM-dd");
      const daySnapshots = snapshots.filter(
        (s) => format(new Date(s.timestamp), "yyyy-MM-dd") === dayStr
      );
      const avg =
        daySnapshots.length > 0
          ? daySnapshots.reduce((s, d) => s + d.score, 0) / daySnapshots.length
          : 0;
      return {
        date: format(day, "MMM d"),
        load: Math.round(avg),
      };
    });
  }, [days, snapshots]);

  const focusByDay = useMemo(() => {
    return days.map((day) => {
      const dayStart = startOfDay(day);
      const dayEnd = new Date(dayStart.getTime() + 86400000);
      const daySessions = focusSessions.filter((s) => {
        const d = new Date(s.startedAt);
        return d >= dayStart && d < dayEnd;
      });
      const totalMinutes = daySessions.reduce(
        (sum, s) => sum + Math.floor(s.duration / 60),
        0
      );
      return { date: format(day, "MMM d"), minutes: totalMinutes };
    });
  }, [days, focusSessions]);

  const switchesByDay = useMemo(() => {
    return days.map((day) => {
      const dayStart = startOfDay(day);
      const dayEnd = new Date(dayStart.getTime() + 86400000);
      const count = switches.filter((s) => {
        const d = new Date(s.switchedAt);
        return d >= dayStart && d < dayEnd;
      }).length;
      return { date: format(day, "MMM d"), switches: count };
    });
  }, [days, switches]);

  const peakLoad = Math.max(...snapshots.map((s) => s.score), 0);
  const avgLoad =
    snapshots.length > 0
      ? Math.round(
          snapshots.reduce((s, d) => s + d.score, 0) / snapshots.length
        )
      : 0;
  const totalFocusHours = Math.round(
    focusSessions.reduce((s, f) => s + f.duration, 0) / 3600
  );
  const totalSwitches = switches.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          30-day cognitive performance trends
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Avg Cognitive Load", value: avgLoad, suffix: "/100" },
          { label: "Peak Load", value: peakLoad, suffix: "/100" },
          { label: "Total Focus", value: totalFocusHours, suffix: "h" },
          { label: "Context Switches", value: totalSwitches, suffix: "" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold">
                {stat.value}
                <span className="text-sm font-normal text-muted-foreground">
                  {stat.suffix}
                </span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Cognitive Load (30 days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadByDay.every((d) => d.load === 0) ? (
            <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
              Cognitive load data will appear here as you use the system.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={loadByDay}>
                <defs>
                  <linearGradient id="loadFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3f3f46" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3f3f46" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#a1a1aa" }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#a1a1aa" }} tickLine={false} axisLine={false} width={30} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="load" stroke="#3f3f46" strokeWidth={2} fill="url(#loadFill)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Focus Minutes per Day
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={focusByDay}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#a1a1aa" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#a1a1aa" }} tickLine={false} axisLine={false} width={30} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="minutes" fill="#52525b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Context Switches per Day
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={switchesByDay}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#a1a1aa" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#a1a1aa" }} tickLine={false} axisLine={false} width={30} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="switches" fill="#a1a1aa" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
