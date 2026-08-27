import Link from "next/link";
import { Suspense } from "react";

import { AppLogo } from "@/components/layout/app-logo";
import { HeaderAuthActions } from "@/components/layout/header-auth-actions";
import { SiteMobileNav } from "@/components/layout/site-mobile-nav";
import { HEADER_SAFE_TOP } from "@/components/layout/use-open-layer";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  return (
    <header
      className={cn(
        "sticky top-0 z-[60] isolate overflow-visible border-b border-border/60 bg-background",
        HEADER_SAFE_TOP
      )}
    >
      <div className="relative mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4 sm:h-16 sm:px-6">
        <AppLogo className="min-w-0 flex-1 overflow-hidden" />

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link href="/#features" className="touch-manipulation transition-colors hover:text-foreground">
            Features
          </Link>
          <Link href="/#how-it-works" className="touch-manipulation transition-colors hover:text-foreground">
            How it works
          </Link>
          <Link href="/map" className="touch-manipulation transition-colors hover:text-foreground">
            Live Map
          </Link>
        </nav>

        <div className="relative z-10 flex shrink-0 items-center gap-1 sm:gap-2">
          <Suspense
            fallback={
              <div className="flex items-center gap-2">
                <Skeleton className="h-11 w-16 sm:h-7" />
                <Skeleton className="hidden h-7 w-24 sm:block" />
              </div>
            }
          >
            <HeaderAuthActions />
          </Suspense>
          <SiteMobileNav />
        </div>
      </div>
    </header>
  );
}
