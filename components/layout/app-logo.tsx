import Link from "next/link";
import { Droplets } from "lucide-react";

import { cn } from "@/lib/utils";

interface AppLogoProps {
  href?: string;
  className?: string;
  showWordmark?: boolean;
}

export function AppLogo({
  href = "/",
  className,
  showWordmark = true,
}: AppLogoProps) {
  return (
    <Link
      href={href}
      className={cn("flex items-center gap-2 font-semibold tracking-tight", className)}
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Droplets className="size-4" aria-hidden />
      </span>
      {showWordmark ? <span>FloodTrace</span> : null}
    </Link>
  );
}
