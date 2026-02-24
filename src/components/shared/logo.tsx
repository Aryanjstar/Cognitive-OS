import Image from "next/image";
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
      <div className="flex items-center justify-center rounded-lg bg-foreground" style={{ width: iconSize + 8, height: iconSize + 8, padding: 4 }}>
        <Image
          src="/logo.png"
          alt="Cognitive OS"
          width={iconSize}
          height={iconSize}
          className="invert"
          priority
        />
      </div>
      {showText && (
        <span className="text-lg font-semibold tracking-tight">
          Cognitive<span className="font-light">OS</span>
        </span>
      )}
    </Link>
  );
}
