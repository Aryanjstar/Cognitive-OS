import { BrainCircuit } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconSize?: number;
  showText?: boolean;
}

export function Logo({ className, iconSize = 24, showText = true }: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
        <BrainCircuit className="text-background" size={iconSize} strokeWidth={1.5} />
      </div>
      {showText && (
        <span className="text-lg font-semibold tracking-tight">
          Cognitive<span className="font-light">OS</span>
        </span>
      )}
    </Link>
  );
}
