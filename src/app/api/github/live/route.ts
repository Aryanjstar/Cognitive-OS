export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createChildLogger } from "@/lib/logger";

const log = createChildLogger("api:github:live");
const GITHUB_API = "https://api.github.com";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN ?? "";

function headers(): HeadersInit {
  const h: HeadersInit = {
    Accept: "application/vnd.github+json",
    "User-Agent": "Cognitive-OS",
  };
  if (GITHUB_TOKEN) h.Authorization = `Bearer ${GITHUB_TOKEN}`;
  return h;
}

/**
 * Proxy endpoint for live GitHub API calls.
 * Returns raw GitHub data for a developer so the real API interaction
 * is visible in the browser's DevTools Network tab.
 *
 * GET /api/github/live?login=tj
 * GET /api/github/live?login=tj&type=profile
 * GET /api/github/live?login=tj&type=events
 * GET /api/github/live?login=tj&type=repos
 */
export async function GET(request: Request) {
  const start = Date.now();
  const { searchParams } = new URL(request.url);
  const login = searchParams.get("login");
  const type = searchParams.get("type") ?? "all";

  if (!login) {
    return NextResponse.json({ error: "Missing ?login= parameter" }, { status: 400 });
  }

  const githubApis = {
    profile: `${GITHUB_API}/users/${login}`,
    events: `${GITHUB_API}/users/${login}/events/public?per_page=100`,
    repos: `${GITHUB_API}/users/${login}/repos?sort=pushed&per_page=100&type=owner`,
  };

  try {
    if (type !== "all" && type in githubApis) {
      const url = githubApis[type as keyof typeof githubApis];
      const res = await fetch(url, { headers: headers() });
      const data = await res.json();
      const duration = Date.now() - start;
      log.info({ login, type, duration }, "GitHub live fetch");

      return NextResponse.json({
        _source: { api: url, fetchedAt: new Date().toISOString(), durationMs: duration },
        data,
      });
    }

    const [profileRes, eventsRes, reposRes] = await Promise.all([
      fetch(githubApis.profile, { headers: headers() }),
      fetch(githubApis.events, { headers: headers() }),
      fetch(githubApis.repos, { headers: headers() }),
    ]);

    const [profile, events, repos] = await Promise.all([
      profileRes.json(),
      eventsRes.json(),
      reposRes.json(),
    ]);

    const duration = Date.now() - start;
    log.info({ login, type: "all", duration }, "GitHub live fetch (all)");

    return NextResponse.json({
      _sources: {
        profile: { api: githubApis.profile, status: profileRes.status },
        events: { api: githubApis.events, status: eventsRes.status, count: Array.isArray(events) ? events.length : 0 },
        repos: { api: githubApis.repos, status: reposRes.status, count: Array.isArray(repos) ? repos.length : 0 },
        fetchedAt: new Date().toISOString(),
        durationMs: duration,
      },
      profile: {
        login: profile.login,
        name: profile.name,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        company: profile.company,
        location: profile.location,
        public_repos: profile.public_repos,
        followers: profile.followers,
        following: profile.following,
      },
      events: Array.isArray(events)
        ? events.map((e: Record<string, unknown>) => ({
            type: e.type,
            created_at: e.created_at,
            repo: (e.repo as Record<string, unknown>)?.name,
          }))
        : [],
      repos: Array.isArray(repos)
        ? repos.map((r: Record<string, unknown>) => ({
            name: r.name,
            full_name: r.full_name,
            stars: r.stargazers_count,
            forks: r.forks_count,
            language: r.language,
            pushed_at: r.pushed_at,
            open_issues: r.open_issues_count,
          }))
        : [],
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.error({ login, err: msg }, "GitHub live fetch failed");
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
