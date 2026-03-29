"use client";

import { useMemo, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Clock,
  TrendingDown,
  TrendingUp,
  Minus,
} from "lucide-react";
import { format, startOfDay, eachDayOfInterval, subDays } from "date-fns";
import { cn } from "@/lib/utils";

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
  focusSessions: { duration: number; startedAt: string; interrupted: boolean }[];
  switches: { switchedAt: string; estimatedCost: number }[];
}

const tooltipStyle = {
  backgroundColor: "#09090b",
  border: "1px solid #27272a",
  borderRadius: "8px",
  color: "#fafafa",
  fontSize: "12px",
};

type TimeRange = "7d" | "30d";

function computeBurnoutRisk(
  snapshots: AnalyticsClientProps["snapshots"],
  focusSessions: AnalyticsClientProps["focusSessions"],
  switches: AnalyticsClientProps["switches"]
): { level: "low" | "moderate" | "high" | "critical"; score: number; factors: string[] } {
  const recentDays = 7;
  const cutoff = Date.now() - recentDays * 24 * 60 * 60 * 1000;

  const recentSnapshots = snapshots.filter(
    (s) => new Date(s.timestamp).getTime() > cutoff
  );
  const recentSessions = focusSessions.filter(
    (s) => new Date(s.startedAt).getTime() > cutoff
  );
  const recentSwitches = switches.filter(
    (s) => new Date(s.switchedAt).getTime() > cutoff
  );

  const factors: string[] = [];
  let burnoutScore = 0;

  const avgLoad =
    recentSnapshots.length > 0
      ? recentSnapshots.reduce((s, d) => s + d.score, 0) /
        recentSnapshots.length
      : 0;
  if (avgLoad > 70) {
    burnoutScore += 30;
    factors.push("Sustained high cognitive load");
  } else if (avgLoad > 50) {
    burnoutScore += 15;
  }

  const overloadedPct =
    recentSnapshots.length > 0
      ? recentSnapshots.filter((s) => s.level === "overloaded").length /
        recentSnapshots.length
      : 0;
  if (overloadedPct > 0.5) {
    burnoutScore += 25;
    factors.push("Frequently in overloaded state");
  } else if (overloadedPct > 0.3) {
    burnoutScore += 12;
  }

  const interruptRate =
    recentSessions.length > 0
      ? recentSessions.filter((s) => s.interrupted).length /
        recentSessions.length
      : 0;
  if (interruptRate > 0.5) {
    burnoutScore += 20;
    factors.push("High interruption frequency");
  }

  const dailySwitchAvg = recentSwitches.length / Math.max(recentDays, 1);
  if (dailySwitchAvg > 10) {
    burnoutScore += 15;
    factors.push("Excessive context switching");
  }

  const totalFocusHours =
    recentSessions.reduce((s, f) => s + f.duration, 0) / 3600;
  const avgDailyFocus = totalFocusHours / recentDays;
  if (avgDailyFocus > 8) {
    burnoutScore += 10;
    factors.push("Extended daily focus hours");
  }

  const score = Math.min(burnoutScore, 100);
  const level =
    score >= 70
      ? "critical"
      : score >= 45
      ? "high"
      : score >= 20
      ? "moderate"
      : "low";

  return { level, score, factors };
}

function computeBestWorkingHours(
  focusSessions: AnalyticsClientProps["focusSessions"]
): { hour: number; avgDuration: number; sessionCount: number }[] {
  const hourBuckets: Record<number, { totalDuration: number; count: number }> =
    {};
  for (let h = 0; h < 24; h++) {
    hourBuckets[h] = { totalDuration: 0, count: 0 };
  }

  for (const s of focusSessions) {
    const hour = new Date(s.startedAt).getHours();
    hourBuckets[hour].totalDuration += s.duration;
    hourBuckets[hour].count += 1;
  }

  return Object.entries(hourBuckets)
    .map(([h, data]) => ({
      hour: parseInt(h),
      avgDuration: data.count > 0 ? Math.round(data.totalDuration / data.count / 60) : 0,
      sessionCount: data.count,
    }))
    .filter((h) => h.sessionCount > 0)
    .sort((a, b) => b.avgDuration - a.avgDuration);
}

function computeWeeklyMonthlySummary(
  snapshots: AnalyticsClientProps["snapshots"],
  focusSessions: AnalyticsClientProps["focusSessions"],
  switches: AnalyticsClientProps["switches"],
  range: TimeRange
) {
  const rangeDays = range === "7d" ? 7 : 30;
  const cutoff = Date.now() - rangeDays * 24 * 60 * 60 * 1000;
  const prevCutoff = cutoff - rangeDays * 24 * 60 * 60 * 1000;

  const currentSnapshots = snapshots.filter(
    (s) => new Date(s.timestamp).getTime() > cutoff
  );
  const prevSnapshots = snapshots.filter(
    (s) => {
      const t = new Date(s.timestamp).getTime();
      return t > prevCutoff && t <= cutoff;
    }
  );

  const currentSessions = focusSessions.filter(
    (s) => new Date(s.startedAt).getTime() > cutoff
  );
  const prevSessions = focusSessions.filter(
    (s) => {
      const t = new Date(s.startedAt).getTime();
      return t > prevCutoff && t <= cutoff;
    }
  );

  const currentSwitches = switches.filter(
    (s) => new Date(s.switchedAt).getTime() > cutoff
  );
  const prevSwitches = switches.filter(
    (s) => {
      const t = new Date(s.switchedAt).getTime();
      return t > prevCutoff && t <= cutoff;
    }
  );

  const avgLoad =
    currentSnapshots.length > 0
      ? Math.round(
          currentSnapshots.reduce((s, d) => s + d.score, 0) /
            currentSnapshots.length
        )
      : 0;
  const prevAvgLoad =
    prevSnapshots.length > 0
      ? Math.round(
          prevSnapshots.reduce((s, d) => s + d.score, 0) /
            prevSnapshots.length
        )
      : 0;

  const focusHours = Math.round(
    currentSessions.reduce((s, f) => s + f.duration, 0) / 3600
  );
  const prevFocusHours = Math.round(
    prevSessions.reduce((s, f) => s + f.duration, 0) / 3600
  );

  return {
    avgLoad,
    loadDelta: avgLoad - prevAvgLoad,
    focusHours,
    focusDelta: focusHours - prevFocusHours,
    switches: currentSwitches.length,
    switchDelta: currentSwitches.length - prevSwitches.length,
    sessions: currentSessions.length,
    sessionDelta: currentSessions.length - prevSessions.length,
  };
}

function DeltaBadge({ delta, inverse = false }: { delta: number; inverse?: boolean }) {
  const isPositive = inverse ? delta < 0 : delta > 0;
  const isNegative = inverse ? delta > 0 : delta < 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-[10px] font-medium",
        isPositive
          ? "text-zinc-900"
          : isNegative
          ? "text-zinc-400"
          : "text-zinc-500"
      )}
    >
      {delta > 0 ? (
        <TrendingUp size={10} />
      ) : delta < 0 ? (
        <TrendingDown size={10} />
      ) : (
        <Minus size={10} />
      )}
      {delta > 0 ? "+" : ""}
      {delta}
    </span>
  );
}

export function AnalyticsClient({
  snapshots,
  dailyData,
  focusSessions,
  switches,
}: AnalyticsClientProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  const rangeDays = timeRange === "7d" ? 7 : 30;
  const days = useMemo(() => {
    return eachDayOfInterval({
      start: subDays(new Date(), rangeDays - 1),
      end: new Date(),
    });
  }, [rangeDays]);

  const loadByDay = useMemo(() => {
    return days.map((day) => {
      const dayStr = format(day, "yyyy-MM-dd");
      const daySnapshots = snapshots.filter(
        (s) => format(new Date(s.timestamp), "yyyy-MM-dd") === dayStr
      );
      const avg =
        daySnapshots.length > 0
          ? daySnapshots.reduce((s, d) => s + d.score, 0) /
            daySnapshots.length
          : 0;
      return { date: format(day, "MMM d"), load: Math.round(avg) };
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

  const summary = useMemo(
    () => computeWeeklyMonthlySummary(snapshots, focusSessions, switches, timeRange),
    [snapshots, focusSessions, switches, timeRange]
  );

  const burnout = useMemo(
    () => computeBurnoutRisk(snapshots, focusSessions, switches),
    [snapshots, focusSessions, switches]
  );

  const bestHours = useMemo(
    () => computeBestWorkingHours(focusSessions),
    [focusSessions]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Cognitive performance trends and insights
          </p>
        </div>
        <div className="flex gap-1">
          <Button
            variant={timeRange === "7d" ? "default" : "ghost"}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setTimeRange("7d")}
          >
            7 days
          </Button>
          <Button
            variant={timeRange === "30d" ? "default" : "ghost"}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setTimeRange("30d")}
          >
            30 days
          </Button>
        </div>
      </div>

      {/* Summary Cards with Deltas */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Avg Cognitive Load
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold">{summary.avgLoad}</span>
              <span className="text-sm text-muted-foreground">/100</span>
              <DeltaBadge delta={summary.loadDelta} inverse />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Total Focus
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold">{summary.focusHours}</span>
              <span className="text-sm text-muted-foreground">hours</span>
              <DeltaBadge delta={summary.focusDelta} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Context Switches
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold">{summary.switches}</span>
              <DeltaBadge delta={summary.switchDelta} inverse />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Focus Sessions
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold">{summary.sessions}</span>
              <DeltaBadge delta={summary.sessionDelta} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Burnout Risk + Best Hours */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <AlertTriangle size={14} />
              Burnout Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-bold",
                  burnout.level === "critical"
                    ? "bg-zinc-900 text-zinc-100"
                    : burnout.level === "high"
                    ? "bg-zinc-700 text-zinc-100"
                    : burnout.level === "moderate"
                    ? "bg-zinc-300 text-zinc-800"
                    : "bg-zinc-100 text-zinc-500"
                )}
              >
                {burnout.score}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs capitalize",
                      burnout.level === "critical"
                        ? "bg-zinc-900 text-zinc-100"
                        : burnout.level === "high"
                        ? "bg-zinc-700 text-zinc-100"
                        : ""
                    )}
                  >
                    {burnout.level} risk
                  </Badge>
                </div>
                {burnout.factors.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {burnout.factors.map((f, i) => (
                      <li
                        key={i}
                        className="text-xs text-muted-foreground"
                      >
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
                {burnout.factors.length === 0 && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    No significant burnout indicators detected.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Clock size={14} />
              Best Working Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bestHours.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Not enough focus session data yet.
              </p>
            ) : (
              <div className="space-y-2">
                {bestHours.slice(0, 5).map((h, i) => (
                  <div key={h.hour} className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex h-7 w-12 items-center justify-center rounded-md text-xs font-mono font-medium",
                        i === 0
                          ? "bg-zinc-900 text-zinc-100"
                          : i === 1
                          ? "bg-zinc-600 text-zinc-100"
                          : "bg-zinc-100 text-zinc-600"
                      )}
                    >
                      {h.hour.toString().padStart(2, "0")}:00
                    </span>
                    <div className="h-2 flex-1 rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-foreground/40"
                        style={{
                          width: `${Math.min(
                            (h.avgDuration / (bestHours[0]?.avgDuration || 1)) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="w-16 text-right text-xs text-muted-foreground">
                      ~{h.avgDuration}m avg
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Cognitive Load ({timeRange === "7d" ? "7" : "30"} days)
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
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#a1a1aa" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: "#a1a1aa" }}
                  tickLine={false}
                  axisLine={false}
                  width={30}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="load"
                  stroke="#3f3f46"
                  strokeWidth={2}
                  fill="url(#loadFill)"
                />
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
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#a1a1aa" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#a1a1aa" }}
                  tickLine={false}
                  axisLine={false}
                  width={30}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar
                  dataKey="minutes"
                  fill="#52525b"
                  radius={[4, 4, 0, 0]}
                />
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
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#a1a1aa" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#a1a1aa" }}
                  tickLine={false}
                  axisLine={false}
                  width={30}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar
                  dataKey="switches"
                  fill="#a1a1aa"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
