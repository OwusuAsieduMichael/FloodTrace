"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";

import { AppLogo } from "@/components/layout/app-logo";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { authorityNavItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";

interface AuthorityAppShellProps {
  children: React.ReactNode;
  userMenu: React.ReactNode;
  roleLabel: string;
  homeHref: string;
  limited?: boolean;
}

export function AuthorityAppShell({
  children,
  userMenu,
  roleLabel,
  homeHref,
  limited = false,
}: AuthorityAppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-dvh bg-background">
      {!limited ? (
        <>
          <aside className="hidden w-64 shrink-0 border-r border-border/60 bg-muted/15 lg:flex lg:flex-col">
            <div className="flex h-16 items-center border-b border-border/60 px-4">
              <AppLogo href={homeHref} />
            </div>
            <div className="flex flex-1 flex-col gap-2 p-4">
              <p className="px-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Operations
              </p>
              <SidebarNav items={authorityNavItems} />
            </div>
            <div className="border-t border-border/60 p-4">
              <Badge variant="secondary" className="w-full justify-center py-1">
                {roleLabel}
              </Badge>
            </div>
          </aside>

          {mobileOpen ? (
            <button
              type="button"
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              aria-label="Close navigation"
              onClick={() => setMobileOpen(false)}
            />
          ) : null}

          <aside
            className={cn(
              "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border/60 bg-background transition-transform lg:hidden",
              mobileOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <div className="flex h-16 items-center justify-between border-b border-border/60 px-4">
              <AppLogo href={homeHref} />
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X className="size-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <SidebarNav
                items={authorityNavItems}
                onNavigate={() => setMobileOpen(false)}
              />
            </div>
          </aside>
        </>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border/60 bg-background/95 backdrop-blur-md">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              {!limited ? (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="lg:hidden"
                  onClick={() => setMobileOpen(true)}
                  aria-label="Open navigation"
                >
                  <Menu className="size-4" />
                </Button>
              ) : null}
              {limited ? <AppLogo href={homeHref} /> : null}
              <div className="hidden sm:block">
                <p className="text-sm font-medium">Authority operations</p>
                <p className="text-xs text-muted-foreground">
                  Incident verification & response
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="hidden sm:inline-flex">
                {roleLabel}
              </Badge>
              {userMenu}
            </div>
          </div>
          {!limited ? <Separator /> : null}
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
