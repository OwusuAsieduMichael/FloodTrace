"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

import {
  getOfflineQueueSummary,
  listOfflineReports,
  syncPendingReports,
  updatePendingReportStatus,
  type OfflineQueueSummary,
} from "@/lib/offline";

interface OfflineSyncContextValue {
  isOnline: boolean;
  isSyncing: boolean;
  summary: OfflineQueueSummary;
  refreshQueue: () => Promise<void>;
  syncNow: (options?: { includeFailed?: boolean }) => Promise<void>;
}

const OfflineSyncContext = createContext<OfflineSyncContextValue | null>(null);

const EMPTY_SUMMARY: OfflineQueueSummary = {
  pending: 0,
  syncing: 0,
  failed: 0,
  total: 0,
};

export function OfflineSyncProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [summary, setSummary] = useState<OfflineQueueSummary>(EMPTY_SUMMARY);
  const syncingRef = useRef(false);

  const refreshQueue = useCallback(async () => {
    try {
      const nextSummary = await getOfflineQueueSummary();
      setSummary(nextSummary);
    } catch {
      setSummary(EMPTY_SUMMARY);
    }
  }, []);

  const runSync = useCallback(
    async (options?: { includeFailed?: boolean }) => {
      if (syncingRef.current || typeof navigator === "undefined" || !navigator.onLine) {
        return;
      }

      syncingRef.current = true;
      setIsSyncing(true);

      try {
        const reports = await listOfflineReports();

        for (const report of reports) {
          if (report.status === "syncing") {
            await updatePendingReportStatus(report.id, "pending");
          }
        }

        if (options?.includeFailed) {
          for (const report of reports) {
            if (report.status === "failed") {
              await updatePendingReportStatus(report.id, "pending");
            }
          }
        }

        const result = await syncPendingReports();
        await refreshQueue();

        if (result.synced > 0) {
          toast.success(
            result.synced === 1
              ? "1 offline report synced."
              : `${result.synced} offline reports synced.`
          );
        }

        if (result.failed > 0) {
          toast.error(
            result.failed === 1
              ? "1 offline report could not be synced."
              : `${result.failed} offline reports could not be synced.`
          );
        }
      } catch {
        toast.error("Unable to sync offline reports right now.");
      } finally {
        syncingRef.current = false;
        setIsSyncing(false);
      }
    },
    [refreshQueue]
  );

  const syncNow = useCallback(
    async (options?: { includeFailed?: boolean }) => {
      await runSync(options);
    },
    [runSync]
  );

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
      void runSync();
    }

    function handleOffline() {
      setIsOnline(false);
    }

    function handleQueueChanged() {
      void refreshQueue().then(() => {
        if (navigator.onLine) {
          void runSync();
        }
      });
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("floodtrace:offline-queue-changed", handleQueueChanged);

    if (!navigator.onLine) {
      queueMicrotask(handleOffline);
    }

    queueMicrotask(() => {
      void refreshQueue().then(() => {
        if (navigator.onLine) {
          void runSync();
        }
      });
    });

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("floodtrace:offline-queue-changed", handleQueueChanged);
    };
  }, [refreshQueue, runSync]);

  const value = useMemo(
    () => ({
      isOnline,
      isSyncing,
      summary,
      refreshQueue,
      syncNow,
    }),
    [isOnline, isSyncing, summary, refreshQueue, syncNow]
  );

  return (
    <OfflineSyncContext.Provider value={value}>{children}</OfflineSyncContext.Provider>
  );
}

export function useOfflineSync() {
  const context = useContext(OfflineSyncContext);

  if (!context) {
    throw new Error("useOfflineSync must be used within OfflineSyncProvider.");
  }

  return context;
}

export function notifyOfflineQueueChanged() {
  window.dispatchEvent(new Event("floodtrace:offline-queue-changed"));
}
