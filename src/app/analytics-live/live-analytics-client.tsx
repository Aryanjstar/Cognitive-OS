"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  RefreshCw, Users, Clock, TrendingUp, Brain, Mail,
  ArrowDown, ArrowUp, Activity, Zap, GitPullRequest,
  GitCommit, Eye, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { TrackerSummary, DeveloperActivity } from "@/lib/github-tracker";

interface Props {
  summary: TrackerSummary | null;
  trackedCount: number;
  activeCount: number;
}

type SortKey = "commits" | "timeSavings" | "cognitiveLoad" | "activeDays" | "prsReviewed" | "followers";
type PeriodKey = "day" | "week" | "month" | "year";

export function LiveAnalyticsClient({ summary: initialSummary, trackedCount, activeCount }: Props) {
  const [summary, setSummary] = useState(initialSummary);
  const [loading, setLoading] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("timeSavings");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [period, setPeriod] = useState<PeriodKey>("month");
  const [emailPreview, setEmailPreview] = useState<{ subject: string; body: string } | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);

  const fetchWithTimeout = useCallback(async (url: string, opts?: RequestInit, timeoutMs = 120_000) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, { ...opts, signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  }, []);

  const loadSummary = useCallback(async () => {
    const res = await fetchWithTimeout("/api/tracker/summary");
    const data = await res.json();
    if (!data.error) setSummary(data);
    return data;
  }, [fetchWithTimeout]);

  const handleDiscover = useCallback(async () => {
    setDiscovering(true);
    setError(null);
    setProgress("Discovering 50+ active GitHub developers...");
    try {
      const discoverRes = await fetchWithTimeout("/api/tracker/discover", { method: "POST" }, 180_000);
      const discoverData = await discoverRes.json();
      if (!discoverRes.ok) {
        setError(discoverData.error ?? "Discovery failed");
        return;
      }
      setProgress(`Found ${discoverData.tracked} developers. Fetching activity data...`);

      const refreshRes = await fetchWithTimeout("/api/tracker/refresh", { method: "POST" }, 180_000);
      const refreshData = await refreshRes.json();
      if (refreshRes.ok && refreshData.success) {
        setProgress("Loading analytics...");
        await loadSummary();
      } else {
        await loadSummary();
        if (!summary) setError("Developers discovered but refresh timed out. Click Refresh to retry.");
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setError("Request timed out. The server is still processing — click Refresh in a minute.");
        await loadSummary().catch(() => {});
      } else {
        setError(err instanceof Error ? err.message : "Network error — check your connection");
      }
    } finally {
      setDiscovering(false);
      setProgress(null);
    }
  }, [fetchWithTimeout, loadSummary, summary]);

  const handleRefresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    setProgress("Refreshing activity data for all tracked developers...");
    try {
      const refreshRes = await fetchWithTimeout("/api/tracker/refresh", { method: "POST" }, 180_000);
      if (!refreshRes.ok) {
        const d = await refreshRes.json();
        setError(d.error ?? "Refresh failed");
      }
      setProgress("Loading analytics...");
      const data = await loadSummary();
      if (data.error) setError(data.error);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setError("Refresh timed out. The server is still processing — try again in a minute.");
        await loadSummary().catch(() => {});
      } else {
        setError(err instanceof Error ? err.message : "Network error");
      }
    } finally {
      setLoading(false);
      setProgress(null);
    }
  }, [fetchWithTimeout, loadSummary]);

  const handleEmailPreview = useCallback(async (login: string) => {
    const res = await fetch(`/api/tracker/email?login=${login}`);
    const data = await res.json();
    if (!data.error) setEmailPreview(data);
  }, []);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  }

  const getSortValue = (dev: DeveloperActivity, key: SortKey): number => {
    const p = dev.periods[period];
    switch (key) {
      case "commits": return p.commits;
      case "timeSavings": return dev.timeSavings.hoursPerMonth;
      case "cognitiveLoad": return p.cognitiveLoadEst;
      case "activeDays": return p.activeDays;
      case "prsReviewed": return p.prsReviewed;
      case "followers": return dev.followers;
    }
  };

  const sorted = summary?.developers
    ? [...summary.developers].sort((a, b) => {
        const diff = getSortValue(a, sortKey) - getSortValue(b, sortKey);
        return sortDir === "desc" ? -diff : diff;
      })
    : [];

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return null;
    return sortDir === "desc" ? <ArrowDown size={11} /> : <ArrowUp size={11} />;
  };

  const categoryColors: Record<string, string> = {
    "reviewer": "bg-foreground/10",
    "maintainer": "bg-foreground/10",
    "prolific-coder": "bg-foreground/10",
    "issue-triager": "bg-foreground/10",
    "contributor": "bg-foreground/5",
    "oss-creator": "bg-foreground/10",
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/40">
              Research Dataset
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
              Research Tracker
            </h1>
            <p className="mt-2 text-muted-foreground">
              {trackedCount > 0
                ? `Tracking ${trackedCount} developers · ${activeCount} with data · Auto-refreshes every 6 hours`
                : "Click 'Discover' to build the research dataset from active GitHub developers"}
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleDiscover} disabled={discovering || loading} variant={sorted.length > 0 ? "outline" : "default"} className="gap-2">
              {discovering ? <Loader2 size={14} className="animate-spin" /> : <Users size={14} />}
              {discovering ? "Discovering..." : "Discover"}
            </Button>
            <Button onClick={handleRefresh} disabled={loading || discovering} variant="outline" className="gap-2">
              {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              {loading ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Progress Display */}
      {progress && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-xl border border-border/60 bg-foreground/2 px-4 py-3 flex items-center gap-3"
        >
          <Loader2 size={14} className="animate-spin text-foreground/60" />
          <p className="text-sm text-foreground/70">{progress}</p>
        </motion.div>
      )}

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3"
        >
          <p className="text-sm text-destructive">{error}</p>
        </motion.div>
      )}

      {/* Stats Cards */}
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <StatCard icon={Users} label="Developers Tracked" value={String(summary.totalTracked)} sub={`${summary.totalActive} active this week`} />
          <StatCard icon={Clock} label="Avg Time Savings" value={`${summary.avgTimeSavingsPerMonth}h/mo`} sub="Per developer with Cognitive OS" />
          <StatCard icon={TrendingUp} label="Avg Productivity Gain" value={`${summary.avgProductivityGain}%`} sub="Through interrupt guarding + focus protection" />
          <StatCard
            icon={Activity}
            label="Categories"
            value={String(Object.keys(summary.categoryBreakdown).length)}
            sub={Object.entries(summary.categoryBreakdown).map(([k, v]) => `${v} ${k}`).join(", ")}
          />
        </motion.div>
      )}

      {/* Period Selector */}
      {sorted.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10 flex items-center gap-2"
        >
          <span className="text-xs text-muted-foreground mr-2">Period:</span>
          {(["day", "week", "month", "year"] as const).map((p) => (
            <Button
              key={p}
              size="sm"
              variant={period === p ? "default" : "outline"}
              onClick={() => setPeriod(p)}
              className="text-xs capitalize"
            >
              {p}
            </Button>
          ))}
        </motion.div>
      )}

      {/* Developer Table */}
      {sorted.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-6 overflow-x-auto rounded-2xl border border-border/80"
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-foreground/2">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Developer</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">Category</th>
                <th className="cursor-pointer px-3 py-3 text-right text-xs font-medium text-muted-foreground hover:text-foreground" onClick={() => toggleSort("commits")}>
                  <span className="inline-flex items-center gap-1"><GitCommit size={11} /> Commits <SortIcon col="commits" /></span>
                </th>
                <th className="cursor-pointer px-3 py-3 text-right text-xs font-medium text-muted-foreground hover:text-foreground" onClick={() => toggleSort("prsReviewed")}>
                  <span className="inline-flex items-center gap-1"><Eye size={11} /> Reviews <SortIcon col="prsReviewed" /></span>
                </th>
                <th className="cursor-pointer px-3 py-3 text-right text-xs font-medium text-muted-foreground hover:text-foreground" onClick={() => toggleSort("activeDays")}>
                  <span className="inline-flex items-center gap-1"><Activity size={11} /> Active <SortIcon col="activeDays" /></span>
                </th>
                <th className="cursor-pointer px-3 py-3 text-right text-xs font-medium text-muted-foreground hover:text-foreground" onClick={() => toggleSort("cognitiveLoad")}>
                  <span className="inline-flex items-center gap-1"><Brain size={11} /> Load <SortIcon col="cognitiveLoad" /></span>
                </th>
                <th className="cursor-pointer px-3 py-3 text-right text-xs font-medium text-muted-foreground hover:text-foreground" onClick={() => toggleSort("timeSavings")}>
                  <span className="inline-flex items-center gap-1"><Clock size={11} /> Savings <SortIcon col="timeSavings" /></span>
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((dev) => {
                const p = dev.periods[period];
                return (
                  <tr key={dev.login} className="border-b border-border/40 last:border-0 hover:bg-foreground/2 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {dev.avatarUrl ? (
                          <Image src={dev.avatarUrl} alt={dev.login} width={28} height={28} className="rounded-full" />
                        ) : (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium">
                            {dev.login[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-sm">{dev.name ?? dev.login}</p>
                          <p className="text-[10px] text-muted-foreground">
                            @{dev.login} · {dev.publicRepos} repos · {dev.followers.toLocaleString()} followers
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant="outline" className={`text-[10px] capitalize ${categoryColors[dev.category] ?? ""}`}>
                        {dev.category.replace(/-/g, " ")}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="font-medium">{p.commits}</span>
                        {p.prsOpened > 0 && (
                          <span className="text-[10px] text-muted-foreground">
                            +{p.prsOpened}<GitPullRequest size={9} className="inline ml-0.5" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">{p.prsReviewed}</td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      <span className="font-medium">{p.activeDays}d</span>
                      {p.longestStreak > 1 && (
                        <span className="ml-1 text-[10px] text-muted-foreground">({p.longestStreak}🔥)</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-1.5 w-10 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-foreground/40" style={{ width: `${Math.min(p.cognitiveLoadEst, 100)}%` }} />
                        </div>
                        <span className="text-xs">{p.cognitiveLoadEst}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums font-semibold">
                      {dev.timeSavings.hoursPerMonth}h/mo
                    </td>
                    <td className="px-3 py-3 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 gap-1 text-xs"
                        onClick={() => handleEmailPreview(dev.login)}
                      >
                        <Mail size={11} />
                        Email
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* Empty State */}
      {(!summary || sorted.length === 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-20 text-center"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-foreground/4">
            <Zap size={24} className="text-foreground/40" />
          </div>
          <h2 className="mt-6 text-xl font-semibold">No developers tracked yet</h2>
          <p className="mt-2 text-muted-foreground">
            Click &ldquo;Discover Developers&rdquo; to find and track 50+ active GitHub developers.
            Data will auto-refresh every 6 hours.
          </p>
          <Button onClick={handleDiscover} disabled={discovering} className="mt-6 gap-2">
            {discovering ? <Loader2 size={14} className="animate-spin" /> : <Users size={14} />}
            {discovering ? "Discovering..." : "Discover Developers"}
          </Button>
        </motion.div>
      )}

      {/* Email Preview Modal */}
      {emailPreview && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-6"
          onClick={() => setEmailPreview(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-background p-8 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Email Preview</h3>
              <Button size="sm" variant="ghost" onClick={() => setEmailPreview(null)}>Close</Button>
            </div>
            <div className="mt-4 rounded-lg bg-foreground/2 p-4">
              <p className="text-xs text-muted-foreground">Subject:</p>
              <p className="mt-1 text-sm font-medium">{emailPreview.subject}</p>
            </div>
            <div className="mt-4 rounded-lg bg-foreground/2 p-4">
              <p className="text-xs text-muted-foreground">Body:</p>
              <pre className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-foreground/80 font-sans">
                {emailPreview.body}
              </pre>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Last Refreshed */}
      {summary && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-xs text-muted-foreground/50"
        >
          Last refreshed: {new Date(summary.lastRefreshed).toLocaleString()} · Auto-refreshes every 6 hours via /api/cron/refresh-tracker
        </motion.p>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub }: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string; value: string; sub: string;
}) {
  return (
    <div className="rounded-2xl border border-border/80 p-5">
      <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-foreground/4">
        <Icon size={14} className="text-foreground/60" />
      </div>
      <p className="text-2xl font-bold tabular-nums tracking-tight">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 text-[10px] text-muted-foreground/60 line-clamp-2">{sub}</p>
    </div>
  );
}
