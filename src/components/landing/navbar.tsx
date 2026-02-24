"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Menu, X, ArrowRight, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { marketingNav } from "@/config/navigation";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated" && !!session;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-500",
        scrolled
          ? "border-b border-border/60 bg-background/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Logo />

        <div className="hidden items-center gap-8 md:flex">
          {marketingNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative text-sm text-muted-foreground transition-colors duration-300 hover:text-foreground after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-foreground after:transition-all after:duration-300 hover:after:w-full"
            >
              {item.title}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <Button
              size="sm"
              asChild
              className="gap-1.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
            >
              <Link href="/dashboard">
                <LayoutDashboard size={14} />
                Dashboard
              </Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="transition-all duration-300 hover:bg-foreground/5">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button
                size="sm"
                asChild
                className="gap-1.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
              >
                <Link href="/login">
                  Get Started
                  <ArrowRight size={13} />
                </Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-muted md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      <div
        className={cn(
          "overflow-hidden border-b bg-background/95 backdrop-blur-xl transition-all duration-400 md:hidden",
          mobileOpen ? "max-h-72 border-border/40" : "max-h-0 border-transparent"
        )}
      >
        <div className="flex flex-col gap-4 px-6 py-5">
          {marketingNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              {item.title}
            </Link>
          ))}
          {isAuthenticated ? (
            <Button size="sm" asChild className="w-full gap-1.5">
              <Link href="/dashboard">
                <LayoutDashboard size={14} />
                Dashboard
              </Link>
            </Button>
          ) : (
            <Button size="sm" asChild className="w-full gap-1.5">
              <Link href="/login">
                Get Started
                <ArrowRight size={13} />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
