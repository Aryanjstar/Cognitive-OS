import { Card, CardContent } from "@/components/ui/card";
import {
  Timer,
  Shuffle,
  Flame,
  ListChecks,
  type LucideIcon,
} from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtext?: string;
}

function StatCard({ icon: Icon, label, value, subtext }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
            {subtext && (
              <p className="mt-0.5 text-xs text-muted-foreground">{subtext}</p>
            )}
          </div>
          <div className="rounded-lg bg-muted p-2">
            <Icon size={18} className="text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface StatsCardsProps {
  focusMinutes: number;
  contextSwitches: number;
  deepWorkStreak: number;
  tasksCompleted: number;
}

export function StatsCards({
  focusMinutes,
  contextSwitches,
  deepWorkStreak,
  tasksCompleted,
}: StatsCardsProps) {
  const hours = Math.floor(focusMinutes / 60);
  const mins = focusMinutes % 60;
  const focusDisplay = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={Timer}
        label="Focus Time Today"
        value={focusDisplay}
        subtext="Total focused minutes"
      />
      <StatCard
        icon={Shuffle}
        label="Context Switches"
        value={contextSwitches}
        subtext="Today's task switches"
      />
      <StatCard
        icon={Flame}
        label="Deep Work Streak"
        value={`${deepWorkStreak}d`}
        subtext="Consecutive days"
      />
      <StatCard
        icon={ListChecks}
        label="Tasks Completed"
        value={tasksCompleted}
        subtext="This week"
      />
    </div>
  );
}
