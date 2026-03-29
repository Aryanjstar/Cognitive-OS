/**
 * Cognitive OS — Real-Time GitHub Activity Tracker
 *
 * Discovers active developers via GitHub API, fetches their contribution
 * data (commits, PRs, reviews, issues) across day/week/month/year periods,
 * computes cognitive load estimates and time savings projections, and
 * caches results for the live dashboard.
 */

import { Octokit } from "octokit";
import { prisma } from "@/lib/prisma";
import { cacheGet, cacheSet } from "@/lib/redis";
import { createChildLogger } from "@/lib/logger";
import {
  computeContextSwitchCost,
  computeBurnoutRisk,
  computeProductivityGain,
} from "@/lib/research-metrics";

const log = createChildLogger("github-tracker");

const GITHUB_TOKEN = process.env.GITHUB_TOKEN ?? "";

function getOctokit() {
  if (!GITHUB_TOKEN) {
    log.warn("GITHUB_TOKEN not set — API calls will be rate-limited to 60/hour");
    return new Octokit();
  }
  return new Octokit({ auth: GITHUB_TOKEN });
}

// ─── Types ───────────────────────────────────────────────────

export interface DeveloperActivity {
  login: string;
  name: string | null;
  avatarUrl: string;
  bio: string | null;
  company: string | null;
  publicRepos: number;
  followers: number;
  category: string;
  periods: {
    day: PeriodMetrics;
    week: PeriodMetrics;
    month: PeriodMetrics;
    year: PeriodMetrics;
  };
  timeSavings: TimeSavings;
  lastFetched: string;
}

export interface PeriodMetrics {
  commits: number;
  prsOpened: number;
  prsMerged: number;
  prsReviewed: number;
  issuesOpened: number;
  issuesClosed: number;
  reposContributed: number;
  linesAdded: number;
  linesRemoved: number;
  activeDays: number;
  longestStreak: number;
  cognitiveLoadEst: number;
  contextSwitchEst: number;
  burnoutRisk: number;
}

export interface TimeSavings {
  hoursPerDay: number;
  hoursPerWeek: number;
  hoursPerMonth: number;
  hoursPerYear: number;
  productivityGainPct: number;
  monetarySavingsPerMonth: number;
}

export interface TrackerSummary {
  totalTracked: number;
  totalActive: number;
  avgTimeSavingsPerMonth: number;
  avgProductivityGain: number;
  lastRefreshed: string;
  categoryBreakdown: Record<string, number>;
  developers: DeveloperActivity[];
}

// ─── Developer Category Classification ───────────────────────

function classifyDeveloper(data: {
  publicRepos: number;
  prsReviewed: number;
  prsMerged: number;
  issuesOpened: number;
  issuesClosed: number;
  commits: number;
}): string {
  const { publicRepos, prsReviewed, prsMerged, issuesOpened, issuesClosed, commits } = data;

  if (prsReviewed > prsMerged * 2 && prsReviewed > 20) return "reviewer";
  if (publicRepos > 50 && issuesClosed > issuesOpened) return "maintainer";
  if (commits > 200 && prsMerged > 30) return "prolific-coder";
  if (issuesOpened > 20 && commits < 50) return "issue-triager";
  if (prsMerged > 10 && publicRepos < 20) return "contributor";
  if (publicRepos > 30) return "oss-creator";
  return "contributor";
}

// ─── Compute Metrics for a Period ────────────────────────────

function computePeriodMetrics(raw: {
  commits: number;
  prsOpened: number;
  prsMerged: number;
  prsReviewed: number;
  issuesOpened: number;
  issuesClosed: number;
  reposContributed: number;
  linesAdded: number;
  linesRemoved: number;
  activeDays: number;
  longestStreak: number;
  periodDays: number;
}): { cognitiveLoadEst: number; contextSwitchEst: number; burnoutRisk: number } {
  const dailyCommits = raw.periodDays > 0 ? raw.commits / raw.periodDays : 0;
  const dailyPRs = raw.periodDays > 0 ? (raw.prsOpened + raw.prsReviewed) / raw.periodDays : 0;
  const dailyIssues = raw.periodDays > 0 ? (raw.issuesOpened + raw.issuesClosed) / raw.periodDays : 0;

  const taskLoad = Math.min(dailyCommits * 3 + dailyPRs * 8 + dailyIssues * 5, 100);
  const switchPenalty = Math.min(raw.reposContributed * 4 + dailyPRs * 6, 100);
  const reviewLoad = Math.min(raw.prsReviewed * 3, 100);
  const urgencyStress = Math.min(raw.issuesOpened * 2, 100);

  const activeRatio = raw.periodDays > 0 ? raw.activeDays / raw.periodDays : 0;
  const fatigueIndex = activeRatio > 0.85 ? 60 + (activeRatio - 0.85) * 200 : activeRatio * 50;
  const staleness = raw.activeDays === 0 ? 80 : Math.max(0, 50 - raw.longestStreak * 5);

  const cognitiveLoadEst = Math.min(Math.round(
    0.25 * taskLoad + 0.20 * switchPenalty + 0.15 * reviewLoad +
    0.15 * urgencyStress + 0.15 * fatigueIndex + 0.10 * staleness
  ), 100);

  const contextSwitchEst = Math.round(raw.reposContributed * 1.5 + dailyPRs * 2 + dailyIssues);

  const focusRatio = Math.max(0.1, 1 - (contextSwitchEst / 20));
  const burnoutRisk = computeBurnoutRisk(cognitiveLoadEst, contextSwitchEst, focusRatio);

  return { cognitiveLoadEst, contextSwitchEst, burnoutRisk };
}

// ─── Compute Time Savings ────────────────────────────────────

function computeTimeSavings(monthMetrics: PeriodMetrics): TimeSavings {
  const avgSwitchesPerDay = monthMetrics.contextSwitchEst / 22;
  const avgFocusMinPerDay = Math.max(120, 480 - monthMetrics.contextSwitchEst * 15);

  const gain = computeProductivityGain(
    avgSwitchesPerDay,
    avgSwitchesPerDay * 0.65,
    avgFocusMinPerDay,
    avgFocusMinPerDay * 1.20
  );

  return {
    hoursPerDay: Math.round((gain.timeSavedHoursPerMonth / 22) * 10) / 10,
    hoursPerWeek: Math.round((gain.timeSavedHoursPerMonth / 4.4) * 10) / 10,
    hoursPerMonth: gain.timeSavedHoursPerMonth,
    hoursPerYear: Math.round(gain.timeSavedHoursPerMonth * 12 * 10) / 10,
    productivityGainPct: gain.productivityGainPercent,
    monetarySavingsPerMonth: gain.monetarySavingsPerMonth,
  };
}

// ─── Fetch Activity for a Single Developer ───────────────────

async function fetchDeveloperActivity(
  octokit: Octokit,
  login: string
): Promise<{
  profile: {
    id: number; login: string; name: string | null; email: string | null;
    avatar_url: string; bio: string | null; company: string | null;
    location: string | null; public_repos: number; followers: number; following: number;
  };
  events: Array<{ type: string; created_at: string; repo: { name: string }; payload?: Record<string, unknown> }>;
}> {
  const [profileRes, eventsRes] = await Promise.all([
    octokit.rest.users.getByUsername({ username: login }),
    octokit.rest.activity.listPublicEventsForUser({ username: login, per_page: 100 }).catch(() => ({ data: [] })),
  ]);

  return {
    profile: profileRes.data as {
      id: number; login: string; name: string | null; email: string | null;
      avatar_url: string; bio: string | null; company: string | null;
      location: string | null; public_repos: number; followers: number; following: number;
    },
    events: (eventsRes.data ?? []) as Array<{
      type: string; created_at: string; repo: { name: string }; payload?: Record<string, unknown>;
    }>,
  };
}

function aggregateEvents(
  events: Array<{ type: string; created_at: string; repo: { name: string }; payload?: Record<string, unknown> }>,
  since: Date,
  until: Date
): Omit<PeriodMetrics, "cognitiveLoadEst" | "contextSwitchEst" | "burnoutRisk"> {
  const filtered = events.filter((e) => {
    const d = new Date(e.created_at);
    return d >= since && d <= until;
  });

  const repos = new Set<string>();
  const activeDates = new Set<string>();
  let commits = 0, prsOpened = 0, prsMerged = 0, prsReviewed = 0;
  let issuesOpened = 0, issuesClosed = 0, linesAdded = 0, linesRemoved = 0;

  for (const ev of filtered) {
    const dateKey = ev.created_at.slice(0, 10);
    activeDates.add(dateKey);
    repos.add(ev.repo.name);
    const payload = ev.payload ?? {};

    switch (ev.type) {
      case "PushEvent": {
        const pushCommits = (payload.commits as Array<unknown>) ?? [];
        commits += pushCommits.length;
        linesAdded += pushCommits.length * 30;
        linesRemoved += pushCommits.length * 10;
        break;
      }
      case "PullRequestEvent": {
        const action = payload.action as string;
        if (action === "opened") prsOpened++;
        if (action === "closed" && (payload.pull_request as Record<string, unknown>)?.merged) prsMerged++;
        const pr = payload.pull_request as Record<string, unknown> | undefined;
        if (pr) {
          linesAdded += (pr.additions as number) ?? 0;
          linesRemoved += (pr.deletions as number) ?? 0;
        }
        break;
      }
      case "PullRequestReviewEvent":
        prsReviewed++;
        break;
      case "IssuesEvent": {
        const issueAction = payload.action as string;
        if (issueAction === "opened") issuesOpened++;
        if (issueAction === "closed") issuesClosed++;
        break;
      }
      case "IssueCommentEvent":
        issuesOpened += 0.1;
        break;
      case "CreateEvent":
      case "DeleteEvent":
      case "ForkEvent":
      case "WatchEvent":
        break;
    }
  }

  const sortedDates = [...activeDates].sort();
  let longestStreak = 0, currentStreak = 0;
  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) { currentStreak = 1; }
    else {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      currentStreak = diffDays <= 1 ? currentStreak + 1 : 1;
    }
    longestStreak = Math.max(longestStreak, currentStreak);
  }

  return {
    commits: Math.round(commits),
    prsOpened: Math.round(prsOpened),
    prsMerged: Math.round(prsMerged),
    prsReviewed: Math.round(prsReviewed),
    issuesOpened: Math.round(issuesOpened),
    issuesClosed: Math.round(issuesClosed),
    reposContributed: repos.size,
    linesAdded,
    linesRemoved,
    activeDays: activeDates.size,
    longestStreak,
  };
}

// ─── Discover Active Developers ──────────────────────────────

const SEED_DEVELOPERS = [
  "sindresorhus", "tj", "rauchg", "gaearon", "Rich-Harris", "yyx990803",
  "BurntSushi", "sharkdp", "mitchellh", "fatih", "developit", "addyosmani",
  "colinhacks", "dtolnay", "karpathy", "hwchase17", "cassidoo", "ThePrimeagen",
  "jonhoo", "matklad", "tannerlinsley", "evanw", "leerob", "getify", "mdo",
  "jessfraz", "zkochan", "timneutkens", "antfu", "wesbos", "kentcdodds",
  "t3dotgg", "shadcn", "pilcrowOnPaper", "egoist", "pacocoursey", "shuding",
  "cramforce", "wongmjane", "privatenumber", "transitive-bullshit",
  "ai", "vercel", "oven-sh", "denoland", "nicolo-ribaudo",
  "ljharb", "sokra", "sebmarkbage", "acdlite", "gnoff",
];

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function discoverAndTrackDevelopers(): Promise<{ tracked: number; errors: string[] }> {
  const octokit = getOctokit();
  const errors: string[] = [];
  let tracked = 0;
  const delayMs = GITHUB_TOKEN ? 200 : 1200;

  for (const login of SEED_DEVELOPERS) {
    try {
      if (tracked > 0) await delay(delayMs);
      const { profile } = await fetchDeveloperActivity(octokit, login);

      await prisma.trackedDeveloper.upsert({
        where: { githubId: profile.id },
        update: {
          name: profile.name,
          email: profile.email,
          avatarUrl: profile.avatar_url,
          bio: profile.bio,
          company: profile.company,
          location: profile.location,
          publicRepos: profile.public_repos,
          followers: profile.followers,
          following: profile.following,
          isActive: true,
        },
        create: {
          githubLogin: profile.login,
          githubId: profile.id,
          name: profile.name,
          email: profile.email,
          avatarUrl: profile.avatar_url,
          bio: profile.bio,
          company: profile.company,
          location: profile.location,
          publicRepos: profile.public_repos,
          followers: profile.followers,
          following: profile.following,
          category: "contributor",
          isActive: true,
        },
      });
      tracked++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${login}: ${msg}`);
      log.warn({ login, err: msg }, "Failed to track developer");
    }
  }

  log.info({ tracked, errors: errors.length }, "Developer discovery complete");
  return { tracked, errors };
}

// ─── Refresh Activity Data for All Tracked Developers ────────

export async function refreshAllActivity(): Promise<{
  refreshed: number;
  errors: string[];
  summary: TrackerSummary;
}> {
  const cached = await cacheGet<TrackerSummary>("tracker:summary");
  if (cached && Date.now() - new Date(cached.lastRefreshed).getTime() < 3600_000) {
    return { refreshed: 0, errors: [], summary: cached };
  }

  const octokit = getOctokit();
  const developers = await prisma.trackedDeveloper.findMany({
    where: { isActive: true },
    orderBy: { lastFetchedAt: "asc" },
    take: 60,
  });

  const errors: string[] = [];
  let refreshed = 0;
  const results: DeveloperActivity[] = [];

  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

  const refreshDelay = GITHUB_TOKEN ? 200 : 1200;

  for (let idx = 0; idx < developers.length; idx++) {
    const dev = developers[idx];
    try {
      if (idx > 0) await delay(refreshDelay);
      const { profile, events } = await fetchDeveloperActivity(octokit, dev.githubLogin);

      const dayRaw = aggregateEvents(events, dayAgo, now);
      const weekRaw = aggregateEvents(events, weekAgo, now);
      const monthRaw = aggregateEvents(events, monthAgo, now);
      const yearRaw = aggregateEvents(events, yearAgo, now);

      const dayMetrics = { ...dayRaw, ...computePeriodMetrics({ ...dayRaw, periodDays: 1 }) };
      const weekMetrics = { ...weekRaw, ...computePeriodMetrics({ ...weekRaw, periodDays: 7 }) };
      const monthMetrics = { ...monthRaw, ...computePeriodMetrics({ ...monthRaw, periodDays: 30 }) };
      const yearMetrics = { ...yearRaw, ...computePeriodMetrics({ ...yearRaw, periodDays: 365 }) };

      const category = classifyDeveloper({
        publicRepos: profile.public_repos,
        prsReviewed: monthRaw.prsReviewed,
        prsMerged: monthRaw.prsMerged,
        issuesOpened: monthRaw.issuesOpened,
        issuesClosed: monthRaw.issuesClosed,
        commits: monthRaw.commits,
      });

      const timeSavings = computeTimeSavings(monthMetrics);

      await prisma.trackedDeveloper.update({
        where: { id: dev.id },
        data: {
          name: profile.name,
          email: profile.email,
          avatarUrl: profile.avatar_url,
          bio: profile.bio,
          company: profile.company,
          location: profile.location,
          publicRepos: profile.public_repos,
          followers: profile.followers,
          following: profile.following,
          category,
          lastFetchedAt: now,
        },
      });

      const periods = [
        { period: "day", start: dayAgo, end: now, metrics: dayMetrics },
        { period: "week", start: weekAgo, end: now, metrics: weekMetrics },
        { period: "month", start: monthAgo, end: now, metrics: monthMetrics },
        { period: "year", start: yearAgo, end: now, metrics: yearMetrics },
      ] as const;

      for (const p of periods) {
        await prisma.activitySnapshot.upsert({
          where: {
            developerId_period_periodStart: {
              developerId: dev.id,
              period: p.period,
              periodStart: p.start,
            },
          },
          update: {
            periodEnd: p.end,
            commitsCount: p.metrics.commits,
            prsOpened: p.metrics.prsOpened,
            prsMerged: p.metrics.prsMerged,
            prsReviewed: p.metrics.prsReviewed,
            issuesOpened: p.metrics.issuesOpened,
            issuesClosed: p.metrics.issuesClosed,
            reposContributed: p.metrics.reposContributed,
            linesAdded: p.metrics.linesAdded,
            linesRemoved: p.metrics.linesRemoved,
            activeDays: p.metrics.activeDays,
            longestStreak: p.metrics.longestStreak,
            contextSwitchEst: p.metrics.contextSwitchEst,
            cognitiveLoadEst: p.metrics.cognitiveLoadEst,
            timeSavingsHrs: p.period === "month" ? timeSavings.hoursPerMonth : 0,
            productivityGain: p.period === "month" ? timeSavings.productivityGainPct : 0,
            burnoutRisk: p.metrics.burnoutRisk,
            fetchedAt: now,
          },
          create: {
            developerId: dev.id,
            period: p.period,
            periodStart: p.start,
            periodEnd: p.end,
            commitsCount: p.metrics.commits,
            prsOpened: p.metrics.prsOpened,
            prsMerged: p.metrics.prsMerged,
            prsReviewed: p.metrics.prsReviewed,
            issuesOpened: p.metrics.issuesOpened,
            issuesClosed: p.metrics.issuesClosed,
            reposContributed: p.metrics.reposContributed,
            linesAdded: p.metrics.linesAdded,
            linesRemoved: p.metrics.linesRemoved,
            activeDays: p.metrics.activeDays,
            longestStreak: p.metrics.longestStreak,
            contextSwitchEst: p.metrics.contextSwitchEst,
            cognitiveLoadEst: p.metrics.cognitiveLoadEst,
            timeSavingsHrs: p.period === "month" ? timeSavings.hoursPerMonth : 0,
            productivityGain: p.period === "month" ? timeSavings.productivityGainPct : 0,
            burnoutRisk: p.metrics.burnoutRisk,
          },
        });
      }

      results.push({
        login: dev.githubLogin,
        name: profile.name,
        avatarUrl: profile.avatar_url,
        bio: profile.bio,
        company: profile.company,
        publicRepos: profile.public_repos,
        followers: profile.followers,
        category,
        periods: { day: dayMetrics, week: weekMetrics, month: monthMetrics, year: yearMetrics },
        timeSavings,
        lastFetched: now.toISOString(),
      });

      refreshed++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${dev.githubLogin}: ${msg}`);
      log.warn({ login: dev.githubLogin, err: msg }, "Failed to refresh developer");
    }
  }

  const categoryBreakdown: Record<string, number> = {};
  for (const d of results) {
    categoryBreakdown[d.category] = (categoryBreakdown[d.category] ?? 0) + 1;
  }

  const summary: TrackerSummary = {
    totalTracked: developers.length,
    totalActive: results.filter((d) => d.periods.week.activeDays > 0).length,
    avgTimeSavingsPerMonth: results.length > 0
      ? Math.round((results.reduce((s, d) => s + d.timeSavings.hoursPerMonth, 0) / results.length) * 10) / 10
      : 0,
    avgProductivityGain: results.length > 0
      ? Math.round((results.reduce((s, d) => s + d.timeSavings.productivityGainPct, 0) / results.length) * 10) / 10
      : 0,
    lastRefreshed: now.toISOString(),
    categoryBreakdown,
    developers: results,
  };

  await cacheSet("tracker:summary", summary, 3600);

  log.info({ refreshed, errors: errors.length, total: developers.length }, "Activity refresh complete");
  return { refreshed, errors, summary };
}

// ─── Get Cached Summary (for dashboard) ──────────────────────

export async function getTrackerSummary(): Promise<TrackerSummary | null> {
  const cached = await cacheGet<TrackerSummary>("tracker:summary");
  if (cached) return cached;

  const developers = await prisma.trackedDeveloper.findMany({
    where: { isActive: true },
    include: {
      activitySnapshots: {
        where: { period: { in: ["day", "week", "month", "year"] } },
        orderBy: { fetchedAt: "desc" },
      },
    },
  });

  if (developers.length === 0) return null;

  const emptyMetrics: PeriodMetrics = {
    commits: 0, prsOpened: 0, prsMerged: 0, prsReviewed: 0,
    issuesOpened: 0, issuesClosed: 0, reposContributed: 0,
    linesAdded: 0, linesRemoved: 0, activeDays: 0, longestStreak: 0,
    cognitiveLoadEst: 0, contextSwitchEst: 0, burnoutRisk: 0,
  };

  function snapToMetrics(snap: typeof developers[0]["activitySnapshots"][0]): PeriodMetrics {
    return {
      commits: snap.commitsCount,
      prsOpened: snap.prsOpened,
      prsMerged: snap.prsMerged,
      prsReviewed: snap.prsReviewed,
      issuesOpened: snap.issuesOpened,
      issuesClosed: snap.issuesClosed,
      reposContributed: snap.reposContributed,
      linesAdded: snap.linesAdded,
      linesRemoved: snap.linesRemoved,
      activeDays: snap.activeDays,
      longestStreak: snap.longestStreak,
      cognitiveLoadEst: snap.cognitiveLoadEst,
      contextSwitchEst: snap.contextSwitchEst,
      burnoutRisk: snap.burnoutRisk,
    };
  }

  const results: DeveloperActivity[] = developers
    .filter((d) => d.activitySnapshots.length > 0)
    .map((d) => {
      const latestByPeriod = new Map<string, typeof d.activitySnapshots[0]>();
      for (const snap of d.activitySnapshots) {
        if (!latestByPeriod.has(snap.period)) {
          latestByPeriod.set(snap.period, snap);
        }
      }

      const daySnap = latestByPeriod.get("day");
      const weekSnap = latestByPeriod.get("week");
      const monthSnap = latestByPeriod.get("month");
      const yearSnap = latestByPeriod.get("year");

      const monthMetrics = monthSnap ? snapToMetrics(monthSnap) : emptyMetrics;

      return {
        login: d.githubLogin,
        name: d.name,
        avatarUrl: d.avatarUrl ?? "",
        bio: d.bio,
        company: d.company,
        publicRepos: d.publicRepos,
        followers: d.followers,
        category: d.category,
        periods: {
          day: daySnap ? snapToMetrics(daySnap) : emptyMetrics,
          week: weekSnap ? snapToMetrics(weekSnap) : emptyMetrics,
          month: monthMetrics,
          year: yearSnap ? snapToMetrics(yearSnap) : emptyMetrics,
        },
        timeSavings: computeTimeSavings(monthMetrics),
        lastFetched: d.lastFetchedAt?.toISOString() ?? "",
      };
    });

  const categoryBreakdown: Record<string, number> = {};
  for (const d of results) {
    categoryBreakdown[d.category] = (categoryBreakdown[d.category] ?? 0) + 1;
  }

  const summary: TrackerSummary = {
    totalTracked: developers.length,
    totalActive: results.filter((r) => r.periods.month.activeDays > 0).length,
    avgTimeSavingsPerMonth: results.length > 0
      ? Math.round((results.reduce((s, d) => s + d.timeSavings.hoursPerMonth, 0) / results.length) * 10) / 10
      : 0,
    avgProductivityGain: results.length > 0
      ? Math.round((results.reduce((s, d) => s + d.timeSavings.productivityGainPct, 0) / results.length) * 10) / 10
      : 0,
    lastRefreshed: new Date().toISOString(),
    categoryBreakdown,
    developers: results,
  };

  await cacheSet("tracker:summary", summary, 3600);
  return summary;
}

// ─── Generate Outreach Email Content ─────────────────────────

export function generateOutreachEmail(dev: DeveloperActivity): {
  subject: string;
  body: string;
} {
  const m = dev.periods.month;
  const ts = dev.timeSavings;
  const categoryLabel: Record<string, string> = {
    "reviewer": "Code Reviewer",
    "maintainer": "OSS Maintainer",
    "prolific-coder": "Prolific Developer",
    "issue-triager": "Issue Triager",
    "contributor": "Active Contributor",
    "oss-creator": "OSS Creator",
  };

  const role = categoryLabel[dev.category] ?? "Developer";

  const subject = `${dev.name ?? dev.login}, you could save ${ts.hoursPerMonth}h/month — here's how`;

  const body = `Hi ${dev.name ?? dev.login},

I've been analyzing public GitHub activity patterns for active developers, and your profile stood out as a ${role.toLowerCase()}.

Here's what I found from your recent activity:

📊 Your GitHub Activity (Last 30 Days)
  • ${m.commits} commits across ${m.reposContributed} repositories
  • ${m.prsOpened} PRs opened, ${m.prsMerged} merged, ${m.prsReviewed} reviewed
  • ${m.issuesOpened} issues opened, ${m.issuesClosed} closed
  • ${m.activeDays} active days (${m.longestStreak}-day longest streak)
  • ~${m.linesAdded.toLocaleString()} lines added, ~${m.linesRemoved.toLocaleString()} removed

⏱️ Time You Could Save with Cognitive OS
  • Per day: ~${ts.hoursPerDay} hours
  • Per week: ~${ts.hoursPerWeek} hours
  • Per month: ~${ts.hoursPerMonth} hours
  • Per year: ~${ts.hoursPerYear} hours
  • Productivity gain: ${ts.productivityGainPct}%

🧠 How It Works
Cognitive OS is an AI-powered system that measures your cognitive load in real-time and protects your deep work:

  1. Interrupt Guard — Defers non-critical notifications during flow states (saves ~23 min per avoided context switch)
  2. Smart Task Sequencing — Orders your work queue by complexity and energy state
  3. Focus Protection — Detects and extends deep work sessions
  4. Burnout Prevention — Alerts when cognitive load patterns indicate risk

As a ${role.toLowerCase()}, your biggest time sink is likely ${
    dev.category === "reviewer" ? "context switching between code reviews" :
    dev.category === "maintainer" ? "triaging issues and managing contributors" :
    dev.category === "prolific-coder" ? "context switching between repositories" :
    "managing multiple concurrent tasks"
  }.

Would you be interested in trying it out? I'd love to show you a personalized dashboard with your actual GitHub data.

Best,
Cognitive OS Team

P.S. This analysis is based entirely on your public GitHub activity. See the full methodology at our research page.`;

  return { subject, body };
}
