import {
  deletePendingReport,
  getAllPendingReports,
  getPendingReport,
  putPendingReport,
} from "./db";
import type {
  OfflineQueueSummary,
  PendingReportRecord,
  PendingReportStatus,
} from "./types";
import type { IncidentSeverity, IncidentType } from "@/types";

function summarizeQueue(reports: PendingReportRecord[]): OfflineQueueSummary {
  return reports.reduce<OfflineQueueSummary>(
    (summary, report) => {
      summary.total += 1;

      if (report.status === "syncing") {
        summary.syncing += 1;
      } else if (report.status === "failed") {
        summary.failed += 1;
      } else {
        summary.pending += 1;
      }

      return summary;
    },
    { pending: 0, syncing: 0, failed: 0, total: 0 }
  );
}

export async function getOfflineQueueSummary(): Promise<OfflineQueueSummary> {
  const reports = await getAllPendingReports();
  return summarizeQueue(reports);
}

export async function listOfflineReports(): Promise<PendingReportRecord[]> {
  const reports = await getAllPendingReports();
  return reports.sort(
    (left, right) =>
      new Date(left.created_at).getTime() - new Date(right.created_at).getTime()
  );
}

export interface EnqueuePendingReportInput {
  incidentType: IncidentType;
  severity: IncidentSeverity;
  description: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  capturedAt: string;
  photo: File | Blob;
  photoMimeType: string;
  photoFileName: string;
}

export async function enqueuePendingReport(
  input: EnqueuePendingReportInput
): Promise<string> {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  const record: PendingReportRecord = {
    id,
    incident_type: input.incidentType,
    severity: input.severity,
    description: input.description.trim() || null,
    latitude: input.latitude,
    longitude: input.longitude,
    accuracy: input.accuracy,
    captured_at: input.capturedAt,
    photo_blob: input.photo,
    photo_mime_type: input.photoMimeType,
    photo_file_name: input.photoFileName,
    status: "pending",
    error_message: null,
    created_at: now,
    updated_at: now,
  };

  await putPendingReport(record);
  return id;
}

export async function updatePendingReportStatus(
  id: string,
  status: PendingReportStatus,
  errorMessage: string | null = null
): Promise<void> {
  const record = await getPendingReport(id);

  if (!record) {
    return;
  }

  await putPendingReport({
    ...record,
    status,
    error_message: errorMessage,
    updated_at: new Date().toISOString(),
  });
}

export async function removePendingReport(id: string): Promise<void> {
  await deletePendingReport(id);
}

export function buildReportFormData(report: PendingReportRecord): FormData {
  const formData = new FormData();
  const photoFile =
    report.photo_blob instanceof File
      ? report.photo_blob
      : new File([report.photo_blob], report.photo_file_name, {
          type: report.photo_mime_type,
        });

  formData.append("photo", photoFile);
  formData.append("incident_type", report.incident_type);
  formData.append("severity", report.severity);

  if (report.description) {
    formData.append("description", report.description);
  }

  formData.append("latitude", String(report.latitude));
  formData.append("longitude", String(report.longitude));
  formData.append("accuracy", String(report.accuracy));
  formData.append("captured_at", report.captured_at);

  return formData;
}

export function isOfflineEnvironment(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

export function isLikelyNetworkError(error: unknown): boolean {
  if (isOfflineEnvironment()) {
    return true;
  }

  if (error instanceof TypeError) {
    return true;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("network") ||
      message.includes("fetch") ||
      message.includes("failed to fetch")
    );
  }

  return false;
}
