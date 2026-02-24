import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
  Activity,
  Timer,
  Flame,
  CheckCircle2,
  GitPullRequest,
  CircleDot,
  TrendingUp,
  ArrowLeft,
} from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });
  return {
    title: user ? `${user.name}'s Dashboard` : "Demo Dashboard",
  };
}

interface SnapshotSelect {
  score: number;
  timestamp: Date;
}

interface IssueWithRepo {
  id: string;
  title: string;
  number: number;
  complexity: number;
  state: string;
  repository: { name: string };
}

interface PRWithRepo {
  id: string;
  title: string;
  number: number;
  complexity: number;
  state: string;
  repository: { name: string };
}

interface FocusRecord {
  duration: number;
}

export default async function DemoDashboardPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, image: true, email: true },
  });

  if (!user) notFound();

  const [
    latestSnapshot,
    recentSnapshots,
    openIssues,
    openPRs,
    todaySwitches,
    todayFocus,
    dailyAnalytics,
  ] = await Promise.all([
    prisma.cognitiveSnapshot.findFirst({
      where: { userId },
      orderBy: { timestamp: "desc" },
    }),
    prisma.cognitiveSnapshot.findMany({
      where: {
        userId,
        timestamp: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      orderBy: { timestamp: "asc" },
      select: { score: true, timestamp: true },
    }),
    prisma.issue.findMany({
      where: { userId, state: "open" },
      include: { repository: { select: { name: true } } },
      orderBy: { complexity: "desc" },
      take: 8,
    }),
    prisma.pullRequest.findMany({
      where: { userId, state: "open" },
      include: { repository: { select: { name: true } } },
      orderBy: { complexity: "desc" },
      take: 8,
    }),
    prisma.contextSwitch.findMany({
      where: {
        userId,
        switchedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
    prisma.focusSession.findMany({
      where: {
        userId,
        startedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
    prisma.dailyAnalytics.findMany({
      where: {
        userId,
        date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
      orderBy: { date: "asc" },
    }),
  ]);

  const score = latestSnapshot?.score ?? 0;
  const level = (latestSnapshot?.level as "flow" | "moderate" | "overloaded") ?? "flow";
  const breakdown = latestSnapshot?.breakdown as Record<string, number> | undefined;

  const tasks = [
    ...openIssues.map((i: IssueWithRepo) => ({
      id: i.id,
      type: "issue" as const,
      title: i.title,
      number: i.number,
      repo: i.repository.name,
      complexity: i.complexity,
      state: i.state,
    })),
    ...openPRs.map((pr: PRWithRepo) => ({
      id: pr.id,
      type: "pr" as const,
      title: pr.title,
      number: pr.number,
      repo: pr.repository.name,
      complexity: pr.complexity,
      state: pr.state,
    })),
  ].sort((a, b) => b.complexity - a.complexity);

  const totalFocusMinutes = todayFocus.reduce(
    (sum: number, s: FocusRecord) => sum + Math.floor(s.duration / 60),
    0
  );

  const history = recentSnapshots.map((s: SnapshotSelect) => ({
    score: s.score,
    timestamp: s.timestamp.toISOString(),
  }));

  const avgLoad =
    dailyAnalytics.length > 0
      ? Math.round(
          dailyAnalytics.reduce((s, d) => s + d.avgCognitiveLoad, 0) /
            dailyAnalytics.length
        )
      : 0;

  const totalFocusHours = Math.round(
    dailyAnalytics.reduce((s, d) => s + d.totalFocusMinutes, 0) / 60
  );

  const levelColors: Record<string, string> = {
    flow: "bg-foreground/10 text-foreground",
    moderate: "bg-foreground/10 text-foreground",
    overloaded: "bg-foreground text-background",
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 md:py-12">
      <div className="mb-8 flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild className="gap-1.5">
          <Link href="/demo">
            <ArrowLeft size={14} />
            All Demos
          </Link>
        </Button>
      </div>

      <div className="mb-10 flex items-center gap-4">
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name ?? "User"}
            width={48}
            height={48}
            className="rounded-full ring-2 ring-border"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-lg font-medium text-muted-foreground ring-2 ring-border">
            {(user.name ?? "?")[0]}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {user.name}&apos;s Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Read-only demo view
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Timer}
          label="Focus Today"
          value={`${totalFocusMinutes}m`}
        />
        <StatCard
          icon={Flame}
          label="Context Switches"
          value={String(todaySwitches.length)}
        />
        <StatCard
          icon={CheckCircle2}
          label="30d Avg Load"
          value={String(avgLoad)}
        />
        <StatCard
          icon={TrendingUp}
          label="30d Focus Hours"
          value={String(totalFocusHours)}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border/80 p-6">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.15em] text-foreground/40">
            Cognitive Load
          </p>
          <div className="mt-4 flex items-end gap-3">
            <span className="text-5xl font-bold tabular-nums tracking-tight">
              {Math.round(score)}
            </span>
            <span className="mb-1.5 text-sm text-muted-foreground">/ 100</span>
          </div>
          <Badge
            variant="outline"
            className={`mt-3 capitalize ${levelColors[level]}`}
          >
            {level === "flow"
              ? "Flow State"
              : level === "moderate"
                ? "Moderate Load"
                : "Overloaded"}
          </Badge>

          {breakdown && (
            <>
              <Separator className="my-5" />
              <div className="space-y-2.5">
                {Object.entries(breakdown).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-foreground/40"
                          style={{ width: `${Math.min(Number(val) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-xs tabular-nums text-muted-foreground">
                        {typeof val === "number" ? val.toFixed(1) : val}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="rounded-2xl border border-border/80 p-6 lg:col-span-2">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-foreground/40">
            Load Trend (7 days)
          </p>
          {history.length > 0 ? (
            <div className="flex h-32 items-end gap-[3px]">
              {history.slice(-30).map((point, i) => {
                const maxScore = Math.max(...history.map((h) => h.score), 1);
                const height = (point.score / maxScore) * 100;
                return (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-foreground/20 transition-colors hover:bg-foreground/40"
                    style={{ height: `${height}%` }}
                    title={`Score: ${Math.round(point.score)}`}
                  />
                );
              })}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No snapshot data yet
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-border/80 p-6">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-foreground/40">
          Active Tasks ({tasks.length})
        </p>
        {tasks.length > 0 ? (
          <div className="space-y-0">
            {tasks.slice(0, 10).map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between border-t border-border/60 py-3 first:border-0 first:pt-0"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  {task.type === "issue" ? (
                    <CircleDot size={14} className="shrink-0 text-muted-foreground" />
                  ) : (
                    <GitPullRequest size={14} className="shrink-0 text-muted-foreground" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {task.repo} #{task.number}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <Badge variant="outline" className="text-[10px]">
                    {task.complexity.toFixed(1)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No active tasks
          </p>
        )}
      </div>

      <div className="mt-12 rounded-2xl border border-foreground bg-foreground px-8 py-10 text-center text-background">
        <h2 className="text-2xl font-bold tracking-tight">
          Get your own dashboard
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-background/60">
          Connect your GitHub account to see your real-time Cognitive Load Score,
          focus tracking, AI briefings, and more.
        </p>
        <Button
          size="lg"
          variant="secondary"
          asChild
          className="mt-8 gap-2.5 px-10 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <Link href="/login">
            Sign Up Free
            <ArrowRight size={16} />
          </Link>
        </Button>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border/80 p-5">
      <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-foreground/[0.04]">
        <Icon size={14} className="text-foreground/60" />
      </div>
      <p className="text-2xl font-bold tabular-nums tracking-tight">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
