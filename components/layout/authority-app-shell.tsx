"use client";

import { Menu, PanelLeft, PanelLeftClose, X } from "lucide-react";
import { useCallback, useState } from "react";

import { AppLogo } from "@/components/layout/app-logo";
import { ClientPortal } from "@/components/layout/client-portal";
import { CollapsibleSidebar } from "@/components/layout/collapsible-sidebar";
import { PortalBackdrop } from "@/components/layout/portal-backdrop";
import { MobileIconButton } from "@/components/layout/mobile-icon-button";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  HEADER_SAFE_TOP,
  MOBILE_LAYER_TOP,
  useOpenLayer,
} from "@/components/layout/use-open-layer";
import { useSidebarOpen } from "@/components/layout/use-sidebar-open";
import { authorityNavItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";
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
  const closeMobile = useCallback(() => setMobileOpen(false), []);
  useOpenLayer(mobileOpen, closeMobile);
  const [sidebarOpen, setSidebarOpen] = useSidebarOpen("floodtrace.authority.sidebar");
  const unread = useUnreadNotificationCount();
  const notificationBadges =
    unread > 0 ? { "/authority/notifications": unread } : undefined;

  return (
    <div className="portal-interface relative isolate flex min-h-screen min-h-dvh">
      <PortalBackdrop />
      {!limited ? (
        <CollapsibleSidebar
          id="authority-sidebar"
          open={sidebarOpen}
          onOpenChange={setSidebarOpen}
          label="Operations"
          showFrom="lg"
        >
          {(collapsed) => (
            <>
              <div
                className={cn(
                  "flex h-16 items-center border-b border-border/60",
                  collapsed ? "justify-center px-2" : "px-4"
                )}
              >
                <AppLogo
                  href={homeHref}
                  showWordmark={!collapsed}
                  className={collapsed ? "justify-center" : undefined}
                />
              </div>
              <div
                className={cn(
                  "flex flex-1 flex-col overflow-y-auto",
                  collapsed ? "gap-2 p-2" : "gap-2 p-4"
                )}
              >
                {collapsed ? null : (
                  <p className="px-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Operations
                  </p>
                )}
                <SidebarNav
                  items={authorityNavItems}
                  badges={notificationBadges}
                  collapsed={collapsed}
                />
              </div>
              {collapsed ? null : (
                <div className="border-t border-border/60 p-4">
                  <Badge variant="secondary" className="w-full justify-center py-1">
                    {roleLabel}
                  </Badge>
                </div>
              )}
            </>
          )}
        </CollapsibleSidebar>
      ) : null}

      {!limited ? (
        <ClientPortal>
          <button
            type="button"
            className={cn(
              "fixed inset-x-0 bottom-0 z-40 bg-black/40 transition-opacity duration-300 lg:hidden",
              MOBILE_LAYER_TOP,
              mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
            )}
            data-tap="none"
            aria-label="Close navigation"
            tabIndex={mobileOpen ? 0 : -1}
            onClick={closeMobile}
          />
          <aside
            className={cn(
              "portal-chrome fixed bottom-0 left-0 z-50 flex w-[min(18rem,calc(100vw-2.5rem))] flex-col border-r shadow-lg transition-transform duration-300 lg:hidden",
              MOBILE_LAYER_TOP,
              mobileOpen ? "translate-x-0" : "pointer-events-none -translate-x-full"
            )}
            style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
            aria-label="Operations"
            aria-hidden={!mobileOpen}
          >
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
              <AppLogo href={homeHref} />
              <MobileIconButton label="Close menu" onClick={closeMobile}>
                <X className="size-5" />
              </MobileIconButton>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <SidebarNav
                items={authorityNavItems}
                badges={notificationBadges}
                onNavigate={closeMobile}
              />
            </div>
          </aside>
        </ClientPortal>
      ) : null}

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <header
          className={`portal-chrome sticky top-0 z-[60] isolate border-b ${HEADER_SAFE_TOP}`}
        >
          <div className="flex h-14 items-center justify-between gap-2 px-3 sm:h-16 sm:gap-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              {!limited ? (
                <>
                  <MobileIconButton
                    label={mobileOpen ? "Close navigation" : "Open navigation"}
                    className="lg:hidden"
                    aria-expanded={mobileOpen}
                    onClick={() => setMobileOpen((value) => !value)}
                  >
                    {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                  </MobileIconButton>
                  <MobileIconButton
                    label={sidebarOpen ? "Show icons only" : "Show full side menu"}
                    className="hidden lg:inline-flex"
                    aria-expanded={sidebarOpen}
                    aria-controls="authority-sidebar"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                  >
                    {sidebarOpen ? (
                      <PanelLeftClose className="size-5" />
                    ) : (
                      <PanelLeft className="size-5" />
                    )}
                  </MobileIconButton>
                </>
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
