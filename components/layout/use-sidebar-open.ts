"use client";

import { useCallback, useEffect, useState } from "react";

export function useSidebarOpen(storageKey: string) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(storageKey) === "closed") {
        setOpen(false);
      }
    } catch {
      // Private browsing can block storage.
    }
  }, [storageKey]);

  const setSidebarOpen = useCallback(
    (next: boolean) => {
      setOpen(next);
      try {
        window.localStorage.setItem(storageKey, next ? "open" : "closed");
      } catch {
        // Ignore persistence failures.
      }
    },
    [storageKey]
  );

  return [open, setSidebarOpen] as const;
}
