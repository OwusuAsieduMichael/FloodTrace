"use client";

import { CheckCircle2, CloudOff, Loader2, RefreshCw, WifiOff } from "lucide-react";

import { useOfflineSync } from "@/components/providers/offline-sync-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function OfflineSyncBanner() {
  const { isOnline, isSyncing, summary, syncNow } = useOfflineSync();

  if (!isOnline) {
    return (
      <Alert variant="warning">
        <WifiOff className="size-4" />
        <AlertTitle>You are offline</AlertTitle>
        <AlertDescription>
          {summary.total > 0
            ? `${summary.total} report${summary.total === 1 ? "" : "s"} saved locally and will sync when connectivity returns.`
            : "New reports can still be captured and will be saved on this device until you are back online."}
        </AlertDescription>
      </Alert>
    );
  }

  if (isSyncing || summary.syncing > 0) {
    return (
      <Alert variant="info">
        <Loader2 className="size-4 animate-spin" />
        <AlertTitle>Syncing offline reports</AlertTitle>
        <AlertDescription>
          Uploading locally saved reports to FloodTrace…
        </AlertDescription>
      </Alert>
    );
  }

  if (summary.failed > 0) {
    return (
      <Alert variant="destructive">
        <CloudOff className="size-4" />
        <AlertTitle>
          {summary.failed} offline report{summary.failed === 1 ? "" : "s"} need
          attention
        </AlertTitle>
        <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span>Some saved reports could not be uploaded. Try again when ready.</span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => void syncNow({ includeFailed: true })}
          >
            <RefreshCw className="size-4" />
            Retry sync
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (summary.pending > 0) {
    return (
      <Alert variant="warning">
        <CloudOff className="size-4" />
        <AlertTitle>
          {summary.pending} report{summary.pending === 1 ? "" : "s"} waiting to
          sync
        </AlertTitle>
        <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span>Reports captured offline are ready to upload.</span>
          <Button type="button" size="sm" variant="outline" onClick={() => void syncNow()}>
            <RefreshCw className="size-4" />
            Sync now
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="success">
      <CheckCircle2 className="size-4" />
      <AlertTitle>All reports synced</AlertTitle>
      <AlertDescription>
        Offline reports on this device are up to date. Reports saved without
        connectivity will upload automatically when you are back online.
      </AlertDescription>
    </Alert>
  );
}
