"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";

import { AppLogo } from "@/components/layout/app-logo";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminNavItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";

interface AdminAppShellProps {
  children: React.ReactNode;
  userMenu: React.ReactNode;
}

export function AdminAppShell({ children, userMenu }: AdminAppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-dvh bg-background">
      <aside className="hidden w-64 shrink-0 border-r border-border/60 bg-muted/15 lg:flex lg:flex-col">
        <div className="flex h-16 items-center border-b border-border/60 px-4">
          <AppLogo href="/admin/dashboard" />
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <p className="px-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Administration
          </p>
          <SidebarNav items={adminNavItems} />
        </div>
        <div className="border-t border-border/60 p-4">
          <Badge variant="secondary" className="w-full justify-center py-1">
            Administrator
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
          <AppLogo href="/admin/dashboard" />
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
            items={adminNavItems}
            onNavigate={() => setMobileOpen(false)}
          />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border/60 bg-background/95 backdrop-blur-md">
          <div className="flex h-14 items-center justify-between gap-2 px-3 sm:h-16 sm:gap-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <Button
                variant="ghost"
                size="icon-sm"
                className="lg:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation"
              >
                <Menu className="size-4" />
              </Button>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">System administration</p>
                <p className="hidden text-xs text-muted-foreground sm:block">
                  Users, approvals, and configuration
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="hidden sm:inline-flex">
                Admin
              </Badge>
              {userMenu}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
