"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function AuthorityError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Authority workspace failed:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg space-y-4 py-10 text-center">
      <h2 className="text-xl font-semibold tracking-tight">
        Operations dashboard could not load
      </h2>
      <p className="text-sm text-muted-foreground">
        The workspace is still signed in. Try again, or open another operations
        page from the menu.
      </p>
      <Button type="button" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  );
}
