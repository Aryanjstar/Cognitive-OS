"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Github, RefreshCw, LogOut, Loader2 } from "lucide-react";

interface SettingsClientProps {
  user: { name: string; email: string; image: string };
  githubConnected: boolean;
  repoCount: number;
}

export function SettingsClient({
  user,
  githubConnected,
  repoCount,
}: SettingsClientProps) {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);

  const handleSync = useCallback(async () => {
    setSyncing(true);
    try {
      await fetch("/api/github/sync", { method: "POST" });
      router.refresh();
    } catch {
      // Handle error
    } finally {
      setSyncing(false);
    }
  }, [router]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.image} />
              <AvatarFallback className="text-lg">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">GitHub Integration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Github size={20} />
              <div>
                <p className="text-sm font-medium">GitHub Account</p>
                <p className="text-xs text-muted-foreground">
                  {githubConnected
                    ? `Connected · ${repoCount} repos synced`
                    : "Not connected"}
                </p>
              </div>
            </div>
            <Badge variant={githubConnected ? "default" : "secondary"}>
              {githubConnected ? "Connected" : "Disconnected"}
            </Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Sync Repositories</Label>
              <p className="text-xs text-muted-foreground">
                Pull latest issues, PRs, and commits from GitHub
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleSync}
              disabled={syncing || !githubConnected}
            >
              {syncing ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <RefreshCw size={14} />
              )}
              Sync Now
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cognitive Load Weights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "Context Switch Cost", value: 5, desc: "Points added per switch" },
            { label: "PR Review Weight", value: 3, desc: "Points per open review" },
            { label: "Urgency Multiplier", value: 8, desc: "Points per overdue task" },
            { label: "Fatigue Rate", value: 2, desc: "Points per hour without break" },
            { label: "Staleness Factor", value: 1, desc: "Points per avg day of task age" },
          ].map((weight) => (
            <div key={weight.label} className="flex items-center justify-between">
              <div>
                <Label className="text-sm">{weight.label}</Label>
                <p className="text-xs text-muted-foreground">{weight.desc}</p>
              </div>
              <Badge variant="secondary" className="font-mono">
                {weight.value}
              </Badge>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            Weight customization coming soon in Pro tier.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="gap-2 text-destructive hover:text-destructive"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut size={14} />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
