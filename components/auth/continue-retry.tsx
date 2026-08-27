"use client";

import { useEffect } from "react";

import { Card, CardContent } from "@/components/ui/card";

export function ContinueRetry() {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const url = new URL(window.location.href);
      const attempt = Number(url.searchParams.get("attempt") ?? "0");

      if (attempt >= 6) {
        return;
      }

      url.searchParams.set("attempt", String(attempt + 1));
      window.location.replace(url.toString());
    }, 1200);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <Card>
      <CardContent className="pt-6 text-center text-sm text-muted-foreground">
        Setting up your account. This usually takes a moment…
      </CardContent>
    </Card>
  );
}
