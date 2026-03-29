export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ArrowRight, Star, CircleDot, GitPullRequest, Brain } from "lucide-react";

interface UserWithCounts {
  id: string;
  name: string | null;
  image: string | null;
  email: string | null;
  repos: number;
  totalStars: number;
  issues: number;
  prs: number;
  avgLoad: number;
}

async function getAllDemoUsers(): Promise<UserWithCounts[]> {
  const users = await prisma.user.findMany({
    select: {
      id: true, name: true, image: true, email: true,
      repositories: { select: { starCount: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const usersWithCounts = await Promise.all(
    users.map(async (user) => {
      const [issues, prs, latestSnapshot] = await Promise.all([
        prisma.issue.count({ where: { userId: user.id } }),
        prisma.pullRequest.count({ where: { userId: user.id } }),
        prisma.cognitiveSnapshot.findFirst({
          where: { userId: user.id },
          orderBy: { timestamp: "desc" },
          select: { score: true },
        }),
      ]);
      return {
        id: user.id,
        name: user.name,
        image: user.image,
        email: user.email,
        repos: user.repositories.length,
        totalStars: user.repositories.reduce((s, r) => s + r.starCount, 0),
        issues,
        prs,
        avgLoad: latestSnapshot ? Math.round(latestSnapshot.score) : 0,
      };
    })
  );

  return usersWithCounts;
}

const getDemoUsers = getAllDemoUsers;

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
          Select any of our {users.length}+ analyzed developers to see their Cognitive OS
          dashboard populated with real GitHub data. No sign-up required.
        </p>
      </div>

      <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <Link
            key={user.id}
            href={`/demo/${user.id}`}
            className="group relative overflow-hidden rounded-2xl border border-border/80 p-6 transition-all duration-300 hover:border-foreground/15 hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)]"
          >
            <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-foreground/1.5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

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

              <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Star size={12} />
                  {user.totalStars.toLocaleString()} stars
                </span>
                <span className="flex items-center gap-1.5">
                  <CircleDot size={12} />
                  {user.issues} issues
                </span>
                <span className="flex items-center gap-1.5">
                  <GitPullRequest size={12} />
                  {user.prs} PRs
                </span>
                <span className="flex items-center gap-1.5">
                  <Brain size={12} />
                  Load: {user.avgLoad}
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
