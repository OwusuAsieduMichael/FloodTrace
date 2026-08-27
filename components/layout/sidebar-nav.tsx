"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { isNavItemActive, type NavItem } from "@/lib/navigation";

interface SidebarNavProps {
  items: NavItem[];
  onNavigate?: () => void;
  className?: string;
  badges?: Record<string, number>;
  collapsed?: boolean;
}

export function SidebarNav({
  items,
  onNavigate,
  className,
  badges,
  collapsed = false,
}: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex flex-col gap-1", className)} aria-label="Main">
      {items.map((item) => {
        const active = isNavItemActive(pathname, item.href);
        const Icon = item.icon;
        const count = badges?.[item.href];

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            title={collapsed ? item.title : undefined}
            className={cn(
              "relative flex items-center rounded-lg text-sm font-medium touch-manipulation transition-colors",
              collapsed
                ? "h-11 w-11 justify-center self-center"
                : "gap-3 px-3 py-2.5",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            aria-current={active ? "page" : undefined}
            aria-label={collapsed ? item.title : undefined}
          >
            <Icon className={cn("shrink-0", collapsed ? "size-5" : "size-4")} aria-hidden />
            <span className={cn("flex-1 truncate", collapsed && "sr-only")}>
              {item.title}
            </span>
            {count ? (
              <span
                className={cn(
                  "inline-flex items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground",
                  collapsed
                    ? "absolute top-1 right-1 min-h-4 min-w-4 px-1 text-[9px] leading-none"
                    : "min-w-5 px-1.5 text-[10px]"
                )}
              >
                {count > 99 ? "99+" : count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
