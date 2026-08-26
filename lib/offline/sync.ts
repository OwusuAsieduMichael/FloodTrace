import { submitIncidentReport } from "@/lib/incidents/submit-report";

import {
  buildReportFormData,
  isLikelyNetworkError,
  isOfflineEnvironment,
  listOfflineReports,
  removePendingReport,
  updatePendingReportStatus,
} from "./queue";
import type { SyncPendingReportsResult } from "./types";

export async function syncPendingReports(): Promise<SyncPendingReportsResult> {
  if (isOfflineEnvironment()) {
    return { synced: 0, failed: 0, skipped: 0 };
  }

  const initialReports = await listOfflineReports();

  for (const report of initialReports) {
    if (report.status === "syncing") {
      await updatePendingReportStatus(report.id, "pending");
    }
  }

  const reports = await listOfflineReports();
  let synced = 0;
  let failed = 0;
  let skipped = 0;

  for (const report of reports) {
    if (report.status !== "pending") {
      skipped += 1;
      continue;
    }

    await updatePendingReportStatus(report.id, "syncing");

    try {
      const result = await submitIncidentReport(buildReportFormData(report));

      if (result.success) {
        await removePendingReport(report.id);
        synced += 1;
        continue;
      }

      await updatePendingReportStatus(report.id, "failed", result.error);
      failed += 1;
    } catch (error) {
      if (isLikelyNetworkError(error)) {
        await updatePendingReportStatus(report.id, "pending");
        break;
      }

      const message =
        error instanceof Error ? error.message : "Unexpected sync error.";
      await updatePendingReportStatus(report.id, "failed", message);
      failed += 1;
    }
  }

  return { synced, failed, skipped };
}
