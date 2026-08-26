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
}

export function SidebarNav({
  items,
  onNavigate,
  className,
  badges,
}: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex flex-col gap-1", className)} aria-label="Main">
      {items.map((item) => {
        const active = isNavItemActive(pathname, item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            <span className="flex-1 truncate">{item.title}</span>
            {badges?.[item.href] ? (
              <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                {badges[item.href] > 99 ? "99+" : badges[item.href]}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
