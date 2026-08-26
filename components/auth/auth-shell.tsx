"use client";

import Link from "next/link";
import { Droplets } from "lucide-react";

import { cn } from "@/lib/utils";

interface AuthShellProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  className?: string;
}

export function AuthShell({
  children,
  title,
  description,
  className,
}: AuthShellProps) {
  return (
    <div className="flex min-h-full flex-col bg-muted/30">
      <header className="border-b border-border/60 bg-background">
        <div className="mx-auto flex h-16 max-w-lg items-center px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold tracking-tight"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Droplets className="size-4" aria-hidden />
            </span>
            <span>FloodTrace</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-8 sm:px-6 sm:py-10">
        <div className={cn("space-y-6", className)}>
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
