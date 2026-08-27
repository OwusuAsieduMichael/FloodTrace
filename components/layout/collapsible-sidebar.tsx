"use client";

import { ChevronLeft } from "lucide-react";
import { useId, type ReactNode } from "react";

import { cn } from "@/lib/utils";

interface CollapsibleSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  label: string;
  id?: string;
  /** Tailwind breakpoint where the desktop rail appears. */
  showFrom?: "md" | "lg";
  children: ReactNode | ((collapsed: boolean) => ReactNode);
}

export function CollapsibleSidebar({
  open,
  onOpenChange,
  label,
  id,
  showFrom = "lg",
  children,
}: CollapsibleSidebarProps) {
  const generatedId = useId();
  const sidebarId = id ?? generatedId;
  const visibleClass = showFrom === "md" ? "hidden md:block" : "hidden lg:block";
  const collapsed = !open;

  return (
    <div
      className={cn(
        "relative z-20 min-w-0 shrink-0 overflow-visible",
        visibleClass,
        "transition-[width] duration-300",
        open ? "w-64" : "w-16"
      )}
      style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
    >
      <aside
        id={sidebarId}
        aria-label={label}
        className="portal-chrome flex h-full w-full flex-col overflow-hidden border-r"
      >
        {typeof children === "function" ? children(collapsed) : children}
      </aside>

      <button
        type="button"
        className="portal-chrome absolute top-1/2 right-0 z-30 flex h-14 min-h-11 w-11 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-r-xl border border-l-0 text-muted-foreground shadow-sm touch-manipulation hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        aria-expanded={open}
        aria-controls={sidebarId}
        aria-label={open ? "Show icons only" : "Show full side menu"}
        onClick={() => onOpenChange(!open)}
      >
        <ChevronLeft
          className={cn(
            "size-5 transition-transform duration-300",
            collapsed && "rotate-180"
          )}
          aria-hidden
        />
      </button>
    </div>
  );
}
