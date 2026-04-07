export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createChildLogger } from "@/lib/logger";

const log = createChildLogger("api:github:sources");

/**
 * Returns the exact GitHub API endpoints that power CognitiveOS.
 * This helps users verify the data is coming from real GitHub API calls.
 * 
 * GET /api/github/sources?login=tj — returns profile + events + repos + GitHub URLs
 * GET /api/github/sources — returns template GitHub API URLs
 */
export async function GET(request: Request) {
  const start = Date.now();
  const { searchParams } = new URL(request.url);
  const login = searchParams.get("login");
  
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

  if (!login) {
    return NextResponse.json({
      _message: "Cognitive OS uses these GitHub APIs to get real developer data",
      githubApiEndpoints: {
        profile: "GET https://api.github.com/users/{login}",
        events: "GET https://api.github.com/users/{login}/events/public?per_page=100",
        repos: "GET https://api.github.com/users/{login}/repos?sort=pushed&per_page=100&type=owner",
      },
      howToVerify: "Add ?login=USERNAME to this endpoint to see real data from these APIs",
      example: "/api/github/sources?login=linus",
    });
  }

  try {
    const githubUrls = {
      profile: `${GITHUB_API}/users/${login}`,
      events: `${GITHUB_API}/users/${login}/events/public?per_page=100`,
      repos: `${GITHUB_API}/users/${login}/repos?sort=pushed&per_page=100&type=owner`,
    };

    const [profileRes, eventsRes, reposRes] = await Promise.all([
      fetch(githubUrls.profile, { headers: headers() }),
      fetch(githubUrls.events, { headers: headers() }),
      fetch(githubUrls.repos, { headers: headers() }),
    ]);

    const duration = Date.now() - start;
    
    if (!profileRes.ok || !eventsRes.ok || !reposRes.ok) {
      return NextResponse.json({
        error: "GitHub API returned non-200 status",
        statuses: {
          profile: profileRes.status,
          events: eventsRes.status,
          repos: reposRes.status,
        },
      }, { status: 502 });
    }

    const [profile, events, repos] = await Promise.all([
      profileRes.json(),
      eventsRes.json(),
      reposRes.json(),
    ]);

    log.info({ login, durationMs: duration }, "GitHub sources fetch");

    return NextResponse.json({
      _verification: {
        message: "All data below came from these exact GitHub API calls",
        githubApiUrls: githubUrls,
        fetchedAt: new Date().toISOString(),
        durationMs: duration,
        instructions: "You can verify by calling these URLs directly in the browser console or making curl requests",
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
        _source: githubUrls.profile,
      },
      events: {
        count: Array.isArray(events) ? events.length : 0,
        data: Array.isArray(events) ? events.slice(0, 20).map((e: Record<string, unknown>) => ({
          type: e.type,
          created_at: e.created_at,
          repo: (e.repo as Record<string, unknown>)?.name,
        })) : [],
        _source: githubUrls.events,
      },
      repos: {
        count: Array.isArray(repos) ? repos.length : 0,
        data: Array.isArray(repos) ? repos.slice(0, 20).map((r: Record<string, unknown>) => ({
          name: r.name,
          full_name: r.full_name,
          stars: r.stargazers_count,
          language: r.language,
          pushed_at: r.pushed_at,
        })) : [],
        _source: githubUrls.repos,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.error({ login, err: msg }, "GitHub sources fetch failed");
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
