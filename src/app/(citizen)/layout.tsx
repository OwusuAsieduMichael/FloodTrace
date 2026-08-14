"use client";

import { CirclePlus, ListChecks, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase/client";
import { useAuth } from "@/providers/auth-provider";

export default function CitizenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

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
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <span className="font-semibold">FloodTrace</span>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Sign out"
          onClick={() => signOut(auth)}
        >
          <LogOut className="size-4" />
        </Button>
      </header>

      <main className="flex flex-1 flex-col pb-16">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 flex border-t bg-background">
        <Link
          href="/reports"
          className="flex flex-1 flex-col items-center gap-1 py-3 text-xs text-muted-foreground"
        >
          <ListChecks className="size-5" />
          My Reports
        </Link>
        <Link
          href="/report/new"
          className="flex flex-1 flex-col items-center gap-1 py-3 text-xs text-muted-foreground"
        >
          <CirclePlus className="size-5" />
          Report
        </Link>
      </nav>
    </div>
  );
}
