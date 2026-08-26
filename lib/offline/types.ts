import type { IncidentSeverity, IncidentType } from "@/types";

export type PendingReportStatus = "pending" | "syncing" | "failed";

export interface PendingReportRecord {
  id: string;
  incident_type: IncidentType;
  severity: IncidentSeverity;
  description: string | null;
  latitude: number;
  longitude: number;
  accuracy: number;
  captured_at: string;
  photo_blob: Blob;
  photo_mime_type: string;
  photo_file_name: string;
  status: PendingReportStatus;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface OfflineQueueSummary {
  pending: number;
  syncing: number;
  failed: number;
  total: number;
}

export interface SyncPendingReportsResult {
  synced: number;
  failed: number;
  skipped: number;
}
