import { prisma } from "@/lib/prisma";
import { chatCompletion } from "./azure-openai";

const SYSTEM_PROMPT = `You are a cognitive assistant for software developers. Your job is to generate concise, structured context-reload briefings that help developers quickly regain mental context for a task they haven't worked on recently.

Output format (use these exact section headers):
## What Changed
[Summarize all recent changes, commits, and updates]

## Key Decisions
[Highlight architectural decisions, design choices, or team agreements]

## Current Status
[What state is this task/PR in right now?]

## Needs Attention
[What requires immediate focus or action?]

Keep each section to 2-4 sentences. Be specific, not generic. Reference actual file names, function names, and PR numbers when available.`;

export async function generateBriefing(
  userId: string,
  taskId: string,
  taskType: "issue" | "pull_request" | "pr"
): Promise<{
  title: string;
  content: string;
  sections: {
    whatChanged: string;
    keyDecisions: string;
    currentStatus: string;
    needsAttention: string;
  };
}> {
  let taskData: string;
  let title: string;

  if (taskType === "issue") {
    const issue = await prisma.issue.findUnique({
      where: { id: taskId },
      include: {
        repository: { select: { name: true, fullName: true } },
      },
    });
    if (!issue) throw new Error("Issue not found");

    const recentCommits = await prisma.commit.findMany({
      where: { repoId: issue.repoId },
      orderBy: { committedAt: "desc" },
      take: 10,
      select: { message: true, committedAt: true, additions: true, deletions: true },
    });

    const relatedPRs = await prisma.pullRequest.findMany({
      where: { repoId: issue.repoId, state: "open" },
      take: 5,
      select: { title: true, number: true, additions: true, deletions: true },
    });

    title = `Briefing: ${issue.title} (#${issue.number})`;
    taskData = `
Task: Issue #${issue.number} - ${issue.title}
Repository: ${issue.repository.fullName}
State: ${issue.state}
Labels: ${JSON.stringify(issue.labels)}
Complexity: ${issue.complexity}/10
Body: ${issue.body?.slice(0, 2000) ?? "No description"}
Comments: ${issue.commentCount}

Recent commits in repo:
${recentCommits.map((c) => `- ${c.message} (+${c.additions}/-${c.deletions})`).join("\n")}

Open PRs in repo:
${relatedPRs.map((pr) => `- #${pr.number}: ${pr.title} (+${pr.additions}/-${pr.deletions})`).join("\n")}
`;
  } else {
    const pr = await prisma.pullRequest.findUnique({
      where: { id: taskId },
      include: {
        repository: { select: { name: true, fullName: true } },
      },
    });
    if (!pr) throw new Error("Pull request not found");

    const recentCommits = await prisma.commit.findMany({
      where: { repoId: pr.repoId },
      orderBy: { committedAt: "desc" },
      take: 10,
      select: { message: true, committedAt: true, additions: true, deletions: true },
    });

    title = `Briefing: ${pr.title} (#${pr.number})`;
    taskData = `
Task: PR #${pr.number} - ${pr.title}
Repository: ${pr.repository.fullName}
State: ${pr.state}
Changes: +${pr.additions}/-${pr.deletions} across ${pr.changedFiles} files
Review comments: ${pr.reviewComments}
Complexity: ${pr.complexity}/10
Body: ${pr.body?.slice(0, 2000) ?? "No description"}

Recent commits in repo:
${recentCommits.map((c) => `- ${c.message} (+${c.additions}/-${c.deletions})`).join("\n")}
`;
  }

  const response = await chatCompletion(
    SYSTEM_PROMPT,
    `Generate a context-reload briefing for the following task:\n\n${taskData}`,
    { temperature: 0.3, maxTokens: 1500 }
  );

  const sections = parseSections(response);

  const briefing = await prisma.aIBriefing.create({
    data: {
      userId,
      taskId,
      taskType: taskType === "pull_request" ? "pr" : taskType,
      title,
      content: response,
      sections,
    },
  });

  return {
    title: briefing.title,
    content: briefing.content,
    sections: sections as {
      whatChanged: string;
      keyDecisions: string;
      currentStatus: string;
      needsAttention: string;
    },
  };
}

function parseSections(markdown: string) {
  const extract = (heading: string): string => {
    const regex = new RegExp(
      `##\\s*${heading}\\s*\\n([\\s\\S]*?)(?=\\n##|$)`,
      "i"
    );
    const match = markdown.match(regex);
    return match?.[1]?.trim() ?? "";
  };

  return {
    whatChanged: extract("What Changed"),
    keyDecisions: extract("Key Decisions"),
    currentStatus: extract("Current Status"),
    needsAttention: extract("Needs Attention"),
  };
}
