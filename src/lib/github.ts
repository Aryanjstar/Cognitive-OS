import { Octokit } from "octokit";
import { prisma } from "@/lib/prisma";

export function createOctokit(accessToken: string) {
  return new Octokit({ auth: accessToken });
}

export async function syncRepositories(userId: string, accessToken: string) {
  const octokit = createOctokit(accessToken);
  const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
    sort: "updated",
    per_page: 30,
  });

  const results = [];

  for (const repo of repos) {
    const upserted = await prisma.repository.upsert({
      where: { githubId: repo.id },
      update: {
        name: repo.name,
        fullName: repo.full_name,
        url: repo.html_url,
        description: repo.description,
        language: repo.language,
        isPrivate: repo.private,
        starCount: repo.stargazers_count ?? 0,
        lastSyncedAt: new Date(),
      },
      create: {
        userId,
        githubId: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        url: repo.html_url,
        description: repo.description,
        language: repo.language,
        isPrivate: repo.private,
        starCount: repo.stargazers_count ?? 0,
      },
    });
    results.push(upserted);
  }

  return results;
}

export async function syncIssues(
  userId: string,
  accessToken: string,
  repoId: string,
  owner: string,
  repo: string
) {
  const octokit = createOctokit(accessToken);

  const { data: issues } = await octokit.rest.issues.listForRepo({
    owner,
    repo,
    state: "all",
    per_page: 50,
    sort: "updated",
  });

  const results = [];

  for (const issue of issues) {
    if (issue.pull_request) continue;

    const complexity = calculateIssueComplexity(issue);
    const priority = calculatePriority(issue);

    const upserted = await prisma.issue.upsert({
      where: { repoId_githubId: { repoId, githubId: issue.id } },
      update: {
        title: issue.title,
        body: issue.body,
        state: issue.state,
        labels: issue.labels.map((l) =>
          typeof l === "string" ? l : l.name ?? ""
        ),
        complexity,
        priority,
        commentCount: issue.comments,
        closedAt: issue.closed_at ? new Date(issue.closed_at) : null,
        updatedAt: new Date(),
      },
      create: {
        userId,
        repoId,
        githubId: issue.id,
        number: issue.number,
        title: issue.title,
        body: issue.body,
        state: issue.state,
        labels: issue.labels.map((l) =>
          typeof l === "string" ? l : l.name ?? ""
        ),
        complexity,
        priority,
        commentCount: issue.comments,
        assignedAt: issue.assignee ? new Date() : null,
        closedAt: issue.closed_at ? new Date(issue.closed_at) : null,
      },
    });
    results.push(upserted);
  }

  return results;
}

export async function syncPullRequests(
  userId: string,
  accessToken: string,
  repoId: string,
  owner: string,
  repo: string
) {
  const octokit = createOctokit(accessToken);

  const { data: prs } = await octokit.rest.pulls.list({
    owner,
    repo,
    state: "all",
    per_page: 30,
    sort: "updated",
  });

  const results = [];

  for (const pr of prs) {
    const prAny = pr as Record<string, unknown>;
    const additions = (typeof prAny.additions === "number" ? prAny.additions : 0) as number;
    const deletions = (typeof prAny.deletions === "number" ? prAny.deletions : 0) as number;
    const changedFiles = (typeof prAny.changed_files === "number" ? prAny.changed_files : 0) as number;

    const complexity = calculatePRComplexity({
      additions,
      deletions,
      changed_files: changedFiles,
      body: pr.body,
    });

    const upserted = await prisma.pullRequest.upsert({
      where: { repoId_githubId: { repoId, githubId: pr.id } },
      update: {
        title: pr.title,
        body: pr.body,
        state: pr.state,
        additions,
        deletions,
        changedFiles,
        complexity,
        mergedAt: pr.merged_at ? new Date(pr.merged_at) : null,
        closedAt: pr.closed_at ? new Date(pr.closed_at) : null,
        updatedAt: new Date(),
      },
      create: {
        userId,
        repoId,
        githubId: pr.id,
        number: pr.number,
        title: pr.title,
        body: pr.body,
        state: pr.state,
        additions,
        deletions,
        changedFiles,
        complexity,
        mergedAt: pr.merged_at ? new Date(pr.merged_at) : null,
        closedAt: pr.closed_at ? new Date(pr.closed_at) : null,
      },
    });
    results.push(upserted);
  }

  return results;
}

export async function syncCommits(
  userId: string,
  accessToken: string,
  repoId: string,
  owner: string,
  repo: string
) {
  const octokit = createOctokit(accessToken);

  const { data: commits } = await octokit.rest.repos.listCommits({
    owner,
    repo,
    per_page: 30,
  });

  const results = [];

  for (const commit of commits) {
    const existing = await prisma.commit.findUnique({
      where: { repoId_sha: { repoId, sha: commit.sha } },
    });

    if (existing) continue;

    const created = await prisma.commit.create({
      data: {
        userId,
        repoId,
        sha: commit.sha,
        message: commit.commit.message,
        additions: (commit.stats?.additions ?? 0),
        deletions: (commit.stats?.deletions ?? 0),
        filesChanged: commit.files?.length ?? 0,
        committedAt: new Date(commit.commit.committer?.date ?? Date.now()),
      },
    });
    results.push(created);
  }

  return results;
}

export async function fullSync(userId: string, accessToken: string) {
  const repos = await syncRepositories(userId, accessToken);

  for (const repo of repos.slice(0, 10)) {
    const [owner, name] = repo.fullName.split("/");
    try {
      await syncIssues(userId, accessToken, repo.id, owner, name);
      await syncPullRequests(userId, accessToken, repo.id, owner, name);
      await syncCommits(userId, accessToken, repo.id, owner, name);
    } catch {
      // Rate limits or permission errors for individual repos are non-fatal
      continue;
    }
  }

  return { syncedRepos: repos.length };
}

// ─── Complexity Scoring ──────────────────────────────────────

function calculateIssueComplexity(issue: {
  body?: string | null;
  labels: Array<string | { name?: string }>;
  comments: number;
}): number {
  let score = 1;

  const bodyLength = issue.body?.length ?? 0;
  if (bodyLength > 2000) score += 3;
  else if (bodyLength > 500) score += 2;
  else if (bodyLength > 100) score += 1;

  const labelNames = issue.labels
    .map((l) => (typeof l === "string" ? l : l.name ?? "").toLowerCase());

  if (labelNames.some((l) => l.includes("bug"))) score += 2;
  if (labelNames.some((l) => l.includes("critical") || l.includes("urgent")))
    score += 3;
  if (labelNames.some((l) => l.includes("enhancement") || l.includes("feature")))
    score += 1;

  score += Math.min(issue.comments * 0.5, 3);

  return Math.min(score, 10);
}

function calculatePriority(issue: {
  labels: Array<string | { name?: string }>;
  state: string;
}): number {
  let priority = 1;

  const labelNames = issue.labels
    .map((l) => (typeof l === "string" ? l : l.name ?? "").toLowerCase());

  if (labelNames.some((l) => l.includes("critical") || l.includes("p0")))
    priority = 5;
  else if (labelNames.some((l) => l.includes("high") || l.includes("p1")))
    priority = 4;
  else if (labelNames.some((l) => l.includes("medium") || l.includes("p2")))
    priority = 3;
  else if (labelNames.some((l) => l.includes("low") || l.includes("p3")))
    priority = 2;

  if (issue.state === "open") priority += 0.5;

  return Math.min(priority, 5);
}

function calculatePRComplexity(pr: {
  additions?: number;
  deletions?: number;
  changed_files?: number;
  body?: string | null;
}): number {
  let score = 1;
  const totalChanges = (pr.additions ?? 0) + (pr.deletions ?? 0);

  if (totalChanges > 1000) score += 4;
  else if (totalChanges > 500) score += 3;
  else if (totalChanges > 100) score += 2;
  else if (totalChanges > 20) score += 1;

  const files = pr.changed_files ?? 0;
  if (files > 20) score += 3;
  else if (files > 10) score += 2;
  else if (files > 5) score += 1;

  return Math.min(score, 10);
}
