"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";

import { AppLogo } from "@/components/layout/app-logo";
import { MobileIconButton } from "@/components/layout/mobile-icon-button";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { authorityNavItems } from "@/lib/navigation";
import { useUnreadNotificationCount } from "@/components/providers/notification-provider";

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
  const unread = useUnreadNotificationCount();
  const notificationBadges =
    unread > 0 ? { "/authority/notifications": unread } : undefined;

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
              <SidebarNav items={authorityNavItems} badges={notificationBadges} />
            </div>
            <div className="border-t border-border/60 p-4">
              <Badge variant="secondary" className="w-full justify-center py-1">
                {roleLabel}
              </Badge>
            </div>
          </aside>

          {mobileOpen ? (
            <>
              <button
                type="button"
                className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                aria-label="Close navigation"
                onClick={() => setMobileOpen(false)}
              />
              <aside
                className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border/60 bg-background shadow-lg lg:hidden"
                aria-label="Operations"
              >
                <div className="flex h-16 items-center justify-between border-b border-border/60 px-4">
                  <AppLogo href={homeHref} />
                  <MobileIconButton
                    label="Close menu"
                    onClick={() => setMobileOpen(false)}
                  >
                    <X className="size-5" />
                  </MobileIconButton>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <SidebarNav
                    items={authorityNavItems}
                    badges={notificationBadges}
                    onNavigate={() => setMobileOpen(false)}
                  />
                </div>
              </aside>
            </>
          ) : null}
        </>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border/60 bg-background/95 backdrop-blur-md">
          <div className="flex h-14 items-center justify-between gap-2 px-3 sm:h-16 sm:gap-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              {!limited ? (
                <MobileIconButton
                  label="Open navigation"
                  className="lg:hidden"
                  onClick={() => setMobileOpen(true)}
                >
                  <Menu className="size-5" />
                </MobileIconButton>
              ) : null}
              {limited ? <AppLogo href={homeHref} /> : null}
              <div className="hidden min-w-0 sm:block">
                <p className="truncate text-sm font-medium">Authority operations</p>
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
