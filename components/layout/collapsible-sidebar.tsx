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
  children: ReactNode;
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

  return (
    <div
      className={cn(
        "relative z-20 min-w-0 shrink-0 overflow-visible",
        visibleClass,
        "transition-[width] duration-300",
        open ? "w-64" : "w-0"
      )}
      style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
    >
      <aside
        id={sidebarId}
        aria-label={label}
        aria-hidden={!open}
        className={cn(
          "portal-chrome absolute inset-y-0 left-0 flex w-64 flex-col border-r",
          "transition-transform duration-300",
          open ? "translate-x-0" : "pointer-events-none -translate-x-full"
        )}
        style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
      >
        {children}
      </aside>

      <button
        type="button"
        className={cn(
          "portal-chrome absolute top-1/2 right-0 z-30 flex h-14 min-h-11 w-11 -translate-y-1/2 items-center justify-center rounded-r-xl border border-l-0 text-muted-foreground shadow-sm touch-manipulation hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
          open ? "translate-x-1/2" : "translate-x-full"
        )}
        style={{ transition: "transform 300ms cubic-bezier(0.22, 1, 0.36, 1)" }}
        aria-expanded={open}
        aria-controls={sidebarId}
        aria-label={open ? "Close side menu" : "Open side menu"}
        onClick={() => onOpenChange(!open)}
      >
        <ChevronLeft
          className={cn(
            "size-5 transition-transform duration-300",
            !open && "rotate-180"
          )}
          aria-hidden
        />
      </button>
    </div>
  );
}
