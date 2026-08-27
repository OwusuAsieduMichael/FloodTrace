"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, MoreHorizontal } from "lucide-react";
import { useState } from "react";

import { AppLogo } from "@/components/layout/app-logo";
import { PortalBackdrop } from "@/components/layout/portal-backdrop";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { HEADER_SAFE_TOP, MOBILE_LAYER_TOP } from "@/components/layout/use-open-layer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  citizenMobilePrimaryItems,
  citizenNavItems,
  citizenSecondaryItems,
  isNavItemActive,
} from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { useUnreadNotificationCount } from "@/components/providers/notification-provider";

interface CitizenAppShellProps {
  children: React.ReactNode;
  userMenu: React.ReactNode;
  fullName?: string | null;
}

export function CitizenAppShell({
  children,
  userMenu,
  fullName,
}: CitizenAppShellProps) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const unread = useUnreadNotificationCount();
  const notificationBadges =
    unread > 0 ? { "/citizen/notifications": unread } : undefined;

  return (
    <div className="portal-interface relative isolate flex min-h-screen min-h-dvh">
      <PortalBackdrop />
      <aside className="relative z-10 hidden w-64 shrink-0 border-r border-border/60 bg-background md:flex md:flex-col">
        <div className="flex h-16 items-center border-b border-border/60 px-4">
          <AppLogo href="/citizen/dashboard" />
        </div>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <SidebarNav items={citizenNavItems} badges={notificationBadges} />
        </div>
      </aside>

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <header
          className={`sticky top-0 z-[60] isolate border-b border-border/60 bg-background ${HEADER_SAFE_TOP}`}
        >
          <div className="flex h-14 items-center justify-between gap-2 px-3 sm:h-16 sm:gap-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-3 md:hidden">
              <AppLogo href="/citizen/dashboard" showWordmark={false} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {fullName ? `Hi, ${fullName.split(" ")[0]}` : "Citizen"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  Flood & drainage reporting
                </p>
              </div>
            </div>
            <div className="hidden md:block">
              <p className="text-sm text-muted-foreground">
                {fullName ? `Welcome back, ${fullName.split(" ")[0]}` : "Citizen portal"}
              </p>
            </div>
            <div className="flex items-center gap-2">{userMenu}</div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:px-6 md:pb-8">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </main>

        <nav
          className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background md:hidden"
          aria-label="Primary"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="mx-auto grid max-w-lg grid-cols-5">
            {citizenMobilePrimaryItems.map((item) => {
              const active = isNavItemActive(pathname, item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-1 px-2 py-2.5 text-[10px] font-medium transition-colors",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="size-5" aria-hidden />
                  <span className="truncate">{item.mobileTitle ?? item.title}</span>
                </Link>
              );
            })}

            <button
              type="button"
              onClick={() => setMoreOpen((open) => !open)}
              className={cn(
                "flex flex-col items-center gap-1 px-2 py-2.5 text-[10px] font-medium transition-colors",
                moreOpen ? "text-primary" : "text-muted-foreground"
              )}
              aria-expanded={moreOpen}
              aria-controls="citizen-more-menu"
            >
              <MoreHorizontal className="size-5" aria-hidden />
              <span>More</span>
            </button>
          </div>
        </nav>

        {moreOpen ? (
          <>
            <button
              type="button"
              className={`fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-40 bg-black/40 md:hidden ${MOBILE_LAYER_TOP}`}
              aria-label="Close menu"
              onClick={() => setMoreOpen(false)}
            />
            <div
              id="citizen-more-menu"
              className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-50 mx-4 rounded-xl border border-border bg-background p-4 shadow-lg md:hidden"
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold">More options</p>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setMoreOpen(false)}
                  aria-label="Close"
                >
                  <Menu className="size-4" />
                </Button>
              </div>
              <Separator className="mb-3" />
              <SidebarNav
                items={citizenSecondaryItems}
                badges={notificationBadges}
                onNavigate={() => setMoreOpen(false)}
              />
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
