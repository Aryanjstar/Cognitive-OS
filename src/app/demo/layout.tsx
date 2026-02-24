import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "Demo",
  description: "Explore Cognitive OS with real developer data",
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-xl">
        <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Logo />
            <span className="rounded-full border border-border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Demo
            </span>
          </div>
          <Button size="sm" asChild className="gap-1.5">
            <Link href="/login">
              Get Your Dashboard
              <ArrowRight size={13} />
            </Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
