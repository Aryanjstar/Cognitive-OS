import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ArrowRight, GitFork, CircleDot, GitPullRequest } from "lucide-react";

const DEMO_EMAILS = [
  "antfu7@gmail.com",
  "wesbos@gmail.com",
  "me@kentcdodds.com",
  "theo@t3.gg",
  "shadcn@gmail.com",
];

interface UserWithCounts {
  id: string;
  name: string | null;
  image: string | null;
  email: string | null;
  repos: number;
  issues: number;
  prs: number;
}

async function getDemoUsers(): Promise<UserWithCounts[]> {
  const users = await prisma.user.findMany({
    where: { email: { in: DEMO_EMAILS } },
    select: { id: true, name: true, image: true, email: true },
  });

  const usersWithCounts = await Promise.all(
    users.map(async (user) => {
      const [repos, issues, prs] = await Promise.all([
        prisma.repository.count({ where: { userId: user.id } }),
        prisma.issue.count({ where: { userId: user.id } }),
        prisma.pullRequest.count({ where: { userId: user.id } }),
      ]);
      return { ...user, repos, issues, prs };
    })
  );

  return usersWithCounts;
}

export default async function DemoPage() {
  const users = await getDemoUsers();

  return (
    <div className="mx-auto max-w-4xl px-6 py-20 md:py-28">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/40">
          Live Demo
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
          Explore real dashboards
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-muted-foreground md:text-lg">
          Select a developer to see their Cognitive OS dashboard populated with
          real GitHub data. No sign-up required.
        </p>
      </div>

      <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <Link
            key={user.id}
            href={`/demo/${user.id}`}
            className="group relative overflow-hidden rounded-2xl border border-border/80 p-6 transition-all duration-300 hover:border-foreground/15 hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)]"
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-foreground/[0.015] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            <div className="relative">
              <div className="flex items-center gap-3.5">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name ?? "User"}
                    width={44}
                    height={44}
                    className="rounded-full ring-2 ring-border"
                  />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground ring-2 ring-border">
                    {(user.name ?? "?")[0]}
                  </div>
                )}
                <div>
                  <p className="font-semibold tracking-tight">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <GitFork size={12} />
                  {user.repos} repos
                </span>
                <span className="flex items-center gap-1.5">
                  <CircleDot size={12} />
                  {user.issues} issues
                </span>
                <span className="flex items-center gap-1.5">
                  <GitPullRequest size={12} />
                  {user.prs} PRs
                </span>
              </div>

              <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-foreground/60 transition-colors duration-300 group-hover:text-foreground">
                View Dashboard
                <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {users.length === 0 && (
        <div className="mt-16 text-center">
          <p className="text-muted-foreground">
            No demo users available yet. Check back soon.
          </p>
        </div>
      )}
    </div>
  );
}
