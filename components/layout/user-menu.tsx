"use client";

import Link from "next/link";
import { ChevronDown, LogOut, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { signOutToLanding } from "@/lib/auth/sign-out-client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UserMenuProps {
  fullName: string | null;
  email: string;
  dashboardHref: string;
  roleLabel: string;
}

export function UserMenu({
  fullName,
  email,
  dashboardHref,
  roleLabel,
}: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("pointerdown", handlePointerDown);
    }

    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  const initials = (fullName ?? email)
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="outline"
        size="sm"
        className="h-11 min-h-11 gap-2 pl-2 touch-manipulation sm:h-8 sm:min-h-8"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
          {initials}
        </span>
        <span className="hidden max-w-28 truncate sm:inline">{fullName ?? "Account"}</span>
        <ChevronDown className={cn("size-4 shrink-0 transition-transform", open && "rotate-180")} />
      </Button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-[min(14rem,calc(100vw-1.5rem))] rounded-xl border border-border bg-popover p-1 shadow-lg"
        >
          <div className="border-b border-border px-3 py-2.5">
            <p className="truncate text-sm font-medium">{fullName ?? "Account"}</p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
            <p className="mt-1 text-xs text-muted-foreground">{roleLabel}</p>
          </div>

          <Link
            href={dashboardHref}
            role="menuitem"
            className="flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
            onClick={() => setOpen(false)}
          >
            <User className="size-4" />
            Dashboard
          </Link>

          <button
            type="button"
            role="menuitem"
            disabled={isSigningOut}
            className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive touch-manipulation hover:bg-destructive/10 disabled:opacity-60"
            onClick={async () => {
              setIsSigningOut(true);
              await signOutToLanding();
            }}
          >
            <LogOut className="size-4" />
            {isSigningOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
