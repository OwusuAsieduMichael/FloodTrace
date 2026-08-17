"use client";

import {
  CirclePlus,
  Droplets,
  Home,
  ListChecks,
  LogOut,
  MapIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/firebase/client";
import { useAuth } from "@/providers/auth-provider";

const NAV_ITEMS = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/map", label: "Map", icon: MapIcon },
  { href: "/report/new", label: "Report", icon: CirclePlus },
  { href: "/reports", label: "My Reports", icon: ListChecks },
] as const;

export default function CitizenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex shrink-0 items-center justify-between border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-from to-brand-to text-primary-foreground shadow-sm">
            <Droplets className="size-4.5" />
          </span>
          <span className="font-heading text-base font-semibold tracking-tight">
            FloodTrace
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Sign out"
          onClick={() => signOut(auth)}
        >
          <LogOut className="size-4" />
        </Button>
      </header>

      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-[calc(4rem+env(safe-area-inset-bottom))]">
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border/60 bg-background/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname?.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className="relative flex flex-1 flex-col items-center gap-1 py-2.5 text-xs"
            >
              {active && (
                <motion.span
                  layoutId="nav-active-pill"
                  className="absolute inset-x-3 top-0.5 h-0.5 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-full transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground",
                )}
              >
                <Icon className="size-5" />
              </span>
              <span
                className={cn(
                  "font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
