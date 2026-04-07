export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createChildLogger, logError } from "@/lib/logger";

const log = createChildLogger("api:user:profile");

export async function GET() {
  const start = Date.now();
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const [repoCount, account] = await Promise.all([
      prisma.repository.count({ where: { userId } }),
      prisma.account.findFirst({
        where: { userId, provider: "github" },
        select: { providerAccountId: true },
      }),
    ]);

    const durationMs = Date.now() - start;
    log.info({ userId, repoCount, githubConnected: !!account, durationMs }, "Profile loaded");

    return NextResponse.json({
      user: {
        name: session.user.name ?? null,
        email: session.user.email ?? null,
        image: session.user.image ?? null,
      },
      githubConnected: !!account,
      repoCount,
      _meta: {
        source: "session + Prisma repository, account → GET /api/user/profile",
      },
    });
  } catch (error) {
    logError("api:user:profile", error, { route: "GET /api/user/profile" });
    return NextResponse.json(
      { error: "Failed to load user profile" },
      { status: 500 }
    );
  }
}
