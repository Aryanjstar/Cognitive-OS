import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { SettingsClient } from "./settings-client";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requireAuth();

  const [repoCount, account] = await Promise.all([
    prisma.repository.count({ where: { userId: user.id } }),
    prisma.account.findFirst({
      where: { userId: user.id, provider: "github" },
      select: { providerAccountId: true },
    }),
  ]);

  return (
    <SettingsClient
      user={{
        name: user.name ?? "",
        email: user.email ?? "",
        image: user.image ?? "",
      }}
      githubConnected={!!account}
      repoCount={repoCount}
    />
  );
}
