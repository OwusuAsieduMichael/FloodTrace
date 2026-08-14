import Dexie, { type EntityTable } from "dexie";
import type { IncidentReport } from "@/types/domain";

export interface QueuedReport extends IncidentReport {
  syncStatus: "pending" | "syncing" | "failed";
  retryCount: number;
}

class FloodTraceDB extends Dexie {
  queuedReports!: EntityTable<QueuedReport, "id">;

  constructor() {
    super("floodtrace");
    this.version(1).stores({
      queuedReports: "id, syncStatus, createdAt",
    });
  }
}

export const db = new FloodTraceDB();
