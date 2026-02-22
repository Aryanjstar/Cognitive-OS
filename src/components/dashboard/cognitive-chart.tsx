"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface CognitiveChartProps {
  data: { score: number; timestamp: string | Date }[];
  title?: string;
}

export function CognitiveChart({
  data,
  title = "Cognitive Load Trend",
}: CognitiveChartProps) {
  const chartData = data.map((d) => ({
    time: format(new Date(d.timestamp), "HH:mm"),
    date: format(new Date(d.timestamp), "MMM d"),
    score: d.score,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            No data yet. Your cognitive load will appear here over time.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="loadGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="currentColor" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="currentColor" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                tick={{ fontSize: 11, fill: "#a1a1aa" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: "#a1a1aa" }}
                tickLine={false}
                axisLine={false}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#09090b",
                  border: "1px solid #27272a",
                  borderRadius: "8px",
                  color: "#fafafa",
                  fontSize: "12px",
                }}
                labelFormatter={(label, payload) => {
                  if (payload?.[0]?.payload?.date) {
                    return `${payload[0].payload.date} ${label}`;
                  }
                  return label;
                }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#3f3f46"
                strokeWidth={2}
                fill="url(#loadGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
