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
  totalStars: number;
  totalForks: number;
  languages: string[];
  recentlyActiveRepos: number;
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
  totalStars?: number;
  recentlyActiveRepos?: number;
}): string {
  const { publicRepos, prsReviewed, prsMerged, issuesOpened, issuesClosed, commits, totalStars = 0, recentlyActiveRepos = 0 } = data;

  if (prsReviewed > 10 && prsReviewed > prsMerged * 2) return "reviewer";
  if (commits > 200 && prsMerged > 30) return "prolific-coder";
  if (publicRepos > 50 && (issuesClosed > issuesOpened || recentlyActiveRepos > 10)) return "maintainer";
  if (issuesOpened > 20 && commits < 50) return "issue-triager";
  if (totalStars > 5000 || publicRepos > 30) return "oss-creator";
  if (prsMerged > 10 && publicRepos < 20) return "contributor";
  if (recentlyActiveRepos > 5) return "maintainer";
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

function computeTimeSavings(
  monthMetrics: PeriodMetrics,
  extra?: { recentlyActiveRepos: number; totalStars: number; publicRepos: number }
): TimeSavings {
  let avgSwitchesPerDay: number;
  let avgFocusMinPerDay: number;

  if (monthMetrics.activeDays > 0 && monthMetrics.contextSwitchEst > 0) {
    avgSwitchesPerDay = monthMetrics.contextSwitchEst / Math.max(monthMetrics.activeDays, 1);
    avgFocusMinPerDay = Math.max(120, 480 - avgSwitchesPerDay * 25);
  } else if (extra) {
    // Estimate from repo portfolio when no event data (cap at 15 switches)
    const repoActivity = Math.min(extra.recentlyActiveRepos, 15);
    const maintainerLoad = extra.publicRepos > 50 ? 3 : extra.publicRepos > 20 ? 2 : 1;
    avgSwitchesPerDay = Math.min(15, Math.max(2, repoActivity * 0.5 + maintainerLoad));
    avgFocusMinPerDay = Math.max(120, 480 - avgSwitchesPerDay * 25);
  } else {
    avgSwitchesPerDay = 3;
    avgFocusMinPerDay = 360;
  }

  const gain = computeProductivityGain(
    avgSwitchesPerDay,
    avgSwitchesPerDay * 0.65,
    avgFocusMinPerDay,
    avgFocusMinPerDay * 1.20
  );

  const cappedMonthly = Math.min(gain.timeSavedHoursPerMonth, 80);
  return {
    hoursPerDay: Math.round((cappedMonthly / 22) * 10) / 10,
    hoursPerWeek: Math.round((cappedMonthly / 4.4) * 10) / 10,
    hoursPerMonth: cappedMonthly,
    hoursPerYear: Math.round(cappedMonthly * 12 * 10) / 10,
    productivityGainPct: Math.min(gain.productivityGainPercent, 80),
    monetarySavingsPerMonth: Math.min(gain.monetarySavingsPerMonth, cappedMonthly * 101),
  };
}

// ─── Types for fetched data ──────────────────────────────────

interface FetchedRepo {
  name: string;
  full_name: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  pushed_at: string;
  created_at: string;
  updated_at: string;
  size: number;
}

interface FetchedActivity {
  profile: {
    id: number; login: string; name: string | null; email: string | null;
    avatar_url: string; bio: string | null; company: string | null;
    location: string | null; public_repos: number; followers: number; following: number;
  };
  events: Array<{ type: string; created_at: string; repo: { name: string }; payload?: Record<string, unknown> }>;
  repos: FetchedRepo[];
  totalStars: number;
  totalForks: number;
  languages: string[];
  recentlyPushedRepos: number;
}

// ─── Fetch Activity for a Single Developer ───────────────────

async function fetchDeveloperActivity(
  octokit: Octokit,
  login: string
): Promise<FetchedActivity> {
  const [profileRes, eventsRes, reposRes] = await Promise.all([
    octokit.rest.users.getByUsername({ username: login }),
    octokit.rest.activity.listPublicEventsForUser({ username: login, per_page: 100 }).catch(() => ({ data: [] })),
    octokit.rest.repos.listForUser({ username: login, sort: "pushed", per_page: 100, type: "owner" }).catch(() => ({ data: [] })),
  ]);

  const repos = (reposRes.data ?? []) as unknown as FetchedRepo[];
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  let totalStars = 0;
  let totalForks = 0;
  const langSet = new Set<string>();
  let recentlyPushedRepos = 0;

  for (const r of repos) {
    totalStars += r.stargazers_count;
    totalForks += r.forks_count;
    if (r.language) langSet.add(r.language);
    if (new Date(r.pushed_at).getTime() > thirtyDaysAgo) recentlyPushedRepos++;
  }

  return {
    profile: profileRes.data as FetchedActivity["profile"],
    events: (eventsRes.data ?? []) as FetchedActivity["events"],
    repos,
    totalStars,
    totalForks,
    languages: [...langSet],
    recentlyPushedRepos,
  };
}

function aggregateEvents(
  events: Array<{ type: string; created_at: string; repo: { name: string }; payload?: Record<string, unknown> }>,
  since: Date,
  until: Date,
  repoData?: { repos: FetchedRepo[]; totalStars: number; totalForks: number; recentlyPushedRepos: number }
): Omit<PeriodMetrics, "cognitiveLoadEst" | "contextSwitchEst" | "burnoutRisk"> {
  const filtered = events.filter((e) => {
    const d = new Date(e.created_at);
    return d >= since && d <= until;
  });

  const repoSet = new Set<string>();
  const activeDates = new Set<string>();
  let commits = 0, prsOpened = 0, prsMerged = 0, prsReviewed = 0;
  let issuesOpened = 0, issuesClosed = 0, linesAdded = 0, linesRemoved = 0;

  for (const ev of filtered) {
    const dateKey = ev.created_at.slice(0, 10);
    activeDates.add(dateKey);
    repoSet.add(ev.repo.name);
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

  // Supplement with repo data when events are sparse
  if (repoData && filtered.length < 5) {
    const periodMs = until.getTime() - since.getTime();
    const periodDays = periodMs / (24 * 60 * 60 * 1000);

    for (const r of repoData.repos) {
      const pushedAt = new Date(r.pushed_at).getTime();
      if (pushedAt >= since.getTime() && pushedAt <= until.getTime()) {
        repoSet.add(r.full_name);
        const pushDate = r.pushed_at.slice(0, 10);
        activeDates.add(pushDate);
      }
    }

    // Estimate activity from repos pushed in this period
    const reposPushedInPeriod = repoData.repos.filter(
      (r) => new Date(r.pushed_at).getTime() >= since.getTime() && new Date(r.pushed_at).getTime() <= until.getTime()
    );

    if (commits === 0 && reposPushedInPeriod.length > 0) {
      commits = reposPushedInPeriod.length * Math.max(2, Math.round(periodDays / 5));
    }
    if (issuesOpened === 0) {
      const totalOpenIssues = reposPushedInPeriod.reduce((s, r) => s + r.open_issues_count, 0);
      issuesOpened = Math.round(totalOpenIssues * Math.min(periodDays / 365, 1));
      issuesClosed = Math.round(issuesOpened * 0.6);
    }
    if (linesAdded === 0 && reposPushedInPeriod.length > 0) {
      linesAdded = reposPushedInPeriod.reduce((s, r) => s + Math.round(r.size * 0.1), 0);
      linesRemoved = Math.round(linesAdded * 0.3);
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
    reposContributed: repoSet.size,
    linesAdded,
    linesRemoved,
    activeDays: activeDates.size,
    longestStreak,
  };
}

// ─── Discover Active Developers ──────────────────────────────

const DEFAULT_SEED_DEVELOPERS = [
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

function getSeedDevelopers(): string[] {
  const envList = process.env.SEED_DEVELOPERS;
  if (envList) {
    return envList.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return DEFAULT_SEED_DEVELOPERS;
}

async function processBatch<T, R>(
  items: T[],
  batchSize: number,
  fn: (item: T) => Promise<R>
): Promise<PromiseSettledResult<R>[]> {
  const results: PromiseSettledResult<R>[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(batch.map(fn));
    results.push(...batchResults);
  }
  return results;
}

export async function discoverAndTrackDevelopers(): Promise<{ tracked: number; errors: string[] }> {
  const octokit = getOctokit();
  const errors: string[] = [];
  let tracked = 0;
  const batchSize = GITHUB_TOKEN ? 10 : 3;

  const seedDevs = getSeedDevelopers();
  const results = await processBatch(seedDevs, batchSize, async (login) => {
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
    return login;
  });

  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (r.status === "fulfilled") {
      tracked++;
    } else {
      const login = seedDevs[i];
      const msg = r.reason instanceof Error ? r.reason.message : String(r.reason);
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

  const batchSize = GITHUB_TOKEN ? 10 : 3;

  const fetched = await processBatch(developers, batchSize, async (dev) => {
    const activity = await fetchDeveloperActivity(octokit, dev.githubLogin);
    return { dev, ...activity };
  });

  for (const result of fetched) {
    if (result.status === "rejected") {
      const msg = result.reason instanceof Error ? result.reason.message : String(result.reason);
      errors.push(msg);
      continue;
    }
    const { dev, profile, events, repos, totalStars, totalForks, languages, recentlyPushedRepos } = result.value;
    const repoData = { repos, totalStars, totalForks, recentlyPushedRepos };
    try {
      const dayRaw = aggregateEvents(events, dayAgo, now, repoData);
      const weekRaw = aggregateEvents(events, weekAgo, now, repoData);
      const monthRaw = aggregateEvents(events, monthAgo, now, repoData);
      const yearRaw = aggregateEvents(events, yearAgo, now, repoData);

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
        totalStars,
        recentlyActiveRepos: recentlyPushedRepos,
      });

      const timeSavings = computeTimeSavings(monthMetrics, {
        recentlyActiveRepos: recentlyPushedRepos,
        totalStars,
        publicRepos: profile.public_repos,
      });

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
        totalStars,
        totalForks,
        languages,
        recentlyActiveRepos: recentlyPushedRepos,
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
        totalStars: 0,
        totalForks: 0,
        languages: [],
        recentlyActiveRepos: 0,
        periods: {
          day: daySnap ? snapToMetrics(daySnap) : emptyMetrics,
          week: weekSnap ? snapToMetrics(weekSnap) : emptyMetrics,
          month: monthMetrics,
          year: yearSnap ? snapToMetrics(yearSnap) : emptyMetrics,
        },
        timeSavings: computeTimeSavings(monthMetrics, {
          recentlyActiveRepos: monthMetrics.reposContributed,
          totalStars: 0,
          publicRepos: d.publicRepos,
        }),
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
  const w = dev.periods.week;
  const ts = dev.timeSavings;
  const name = dev.name ?? dev.login;

  const categoryLabel: Record<string, string> = {
    "reviewer": "Code Reviewer",
    "maintainer": "OSS Maintainer",
    "prolific-coder": "Prolific Developer",
    "issue-triager": "Issue Triager",
    "contributor": "Active Contributor",
    "oss-creator": "OSS Creator",
  };
  const role = categoryLabel[dev.category] ?? "Developer";

  // Build personalized activity lines — only include non-zero data
  const activityLines: string[] = [];
  if (m.commits > 0) activityLines.push(`${m.commits} commits across ${m.reposContributed} repos this month`);
  if (m.prsOpened > 0 || m.prsMerged > 0) activityLines.push(`${m.prsOpened} PRs opened, ${m.prsMerged} merged`);
  if (m.prsReviewed > 0) activityLines.push(`${m.prsReviewed} code reviews completed`);
  if (m.issuesOpened > 0 || m.issuesClosed > 0) activityLines.push(`${m.issuesOpened} issues opened, ${m.issuesClosed} closed`);
  if (m.activeDays > 0) activityLines.push(`${m.activeDays} active days${m.longestStreak > 1 ? ` (${m.longestStreak}-day streak)` : ""}`);
  if (dev.totalStars > 0) activityLines.push(`${dev.totalStars.toLocaleString()} total stars across your repos`);
  if (dev.recentlyActiveRepos > 0) activityLines.push(`${dev.recentlyActiveRepos} repos with recent pushes`);
  if (dev.languages.length > 0) activityLines.push(`Primary languages: ${dev.languages.slice(0, 5).join(", ")}`);

  // If still no data, use profile-level info
  if (activityLines.length === 0) {
    activityLines.push(`${dev.publicRepos} public repositories`);
    activityLines.push(`${dev.followers.toLocaleString()} followers`);
  }

  // Personalized pain point based on category + actual data
  const painPoint = dev.category === "reviewer"
    ? `With ${m.prsReviewed || "multiple"} reviews this month, each context switch between PRs costs ~23 minutes of refocus time. That adds up fast.`
    : dev.category === "maintainer"
    ? `Managing ${dev.publicRepos} repos means constant context switching — triaging issues, reviewing PRs, and coordinating contributors across projects.`
    : dev.category === "prolific-coder"
    ? `With ${m.commits || "heavy"} commits across ${m.reposContributed || "multiple"} repos, you're switching contexts frequently. Each switch costs ~23 minutes of deep focus.`
    : dev.category === "oss-creator"
    ? `Maintaining ${dev.publicRepos} public repos${dev.totalStars > 1000 ? ` with ${dev.totalStars.toLocaleString()} stars` : ""} means juggling issues, PRs, and community contributions — a significant cognitive load.`
    : `Your activity pattern shows ${m.reposContributed || dev.recentlyActiveRepos || "multiple"} active repos, which means frequent context switching between codebases.`;

  // Personalized weekly insight
  const weekParts: string[] = [];
  if (w.commits > 0) weekParts.push(`${w.commits} commits`);
  if (w.prsReviewed > 0) weekParts.push(`${w.prsReviewed} reviews`);
  if (w.prsOpened > 0) weekParts.push(`${w.prsOpened} PRs opened`);
  if (w.issuesClosed > 0) weekParts.push(`${w.issuesClosed} issues closed`);
  const weekInsight = w.activeDays > 0 && weekParts.length > 0
    ? `Just this week: ${weekParts.join(", ")} across ${w.activeDays} active days.`
    : "";

  const subject = `${name} — ${ts.hoursPerMonth}h/month of focus time you're losing to context switches`;

  const body = `Hi ${name},

I noticed your work as a ${role.toLowerCase()}${dev.company ? ` at ${dev.company}` : ""} and ran your public GitHub activity through our cognitive load analysis.

📊 What I Found
${activityLines.map(l => `  • ${l}`).join("\n")}
${weekInsight ? `\n  ${weekInsight}` : ""}

🧠 The Problem
${painPoint}

Research shows developers lose an average of 23 minutes and 15 seconds per context switch (Mark et al., 2008). For your activity pattern, that translates to:

⏱️ Estimated Time Lost to Context Switching
  • ~${ts.hoursPerDay}h per day
  • ~${ts.hoursPerWeek}h per week
  • ~${ts.hoursPerMonth}h per month (${ts.productivityGainPct}% of productive time)
  • ~$${ts.monetarySavingsPerMonth.toLocaleString()}/month in recovered productivity

💡 What Cognitive OS Does
It's an AI layer that sits on top of your GitHub workflow:
  1. Detects when you're in a flow state and defers interruptions
  2. Sequences tasks by cognitive complexity to minimize switch cost
  3. Alerts when your load pattern indicates burnout risk (your current burnout score: ${Math.round(m.burnoutRisk * 100)}%)

Would love to show you a personalized dashboard. Takes 30 seconds to connect via GitHub OAuth.

— Cognitive OS Team

P.S. All analysis is from public GitHub data only. Full methodology: cognitive-os.dev/research`;

  return { subject, body };
}
