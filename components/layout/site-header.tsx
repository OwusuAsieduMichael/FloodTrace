import Link from "next/link";
import { Suspense } from "react";

import { AppLogo } from "@/components/layout/app-logo";
import { HeaderAuthActions } from "@/components/layout/header-auth-actions";
import { Skeleton } from "@/components/ui/skeleton";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <AppLogo />

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link href="/#features" className="transition-colors hover:text-foreground">
            Features
          </Link>
          <Link href="/#how-it-works" className="transition-colors hover:text-foreground">
            How it works
          </Link>
          <Link href="/map" className="transition-colors hover:text-foreground">
            Live Map
          </Link>
        </nav>

        <Suspense
          fallback={
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-7 w-24" />
            </div>
          }
        >
          <HeaderAuthActions />
        </Suspense>
      </div>
    </header>
  );
}
