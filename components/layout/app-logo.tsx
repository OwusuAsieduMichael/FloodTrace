import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

export const BRAND_MARK_SRC = "/favicon-512x512.png";

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
      className={cn(
        "flex min-h-11 min-w-0 items-center gap-2 font-semibold tracking-tight",
        className
      )}
    >
      <Image
        src={BRAND_MARK_SRC}
        alt={showWordmark ? "" : "FloodTrace"}
        width={32}
        height={32}
        className="size-8 shrink-0 rounded-lg"
        priority
      />
      {showWordmark ? <span className="truncate">FloodTrace</span> : null}
    </Link>
  );
}
