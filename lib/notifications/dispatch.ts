import { createAdminClient } from "@/lib/supabase/admin";
import type { Notification } from "@/types";

import type { NotificationType } from "./constants";

export interface NotificationDraft {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  incidentId?: string | null;
}

function tryCreateAdminClient() {
  try {
    return createAdminClient();
  } catch (error) {
    console.error("Notification dispatch skipped (admin client unavailable):", error);
    return null;
  }
}

export async function insertNotifications(
  drafts: NotificationDraft[]
): Promise<void> {
  if (drafts.length === 0) {
    return;
  }

  const admin = tryCreateAdminClient();

  if (!admin) {
    return;
  }

  const { error } = await admin.from("notifications").insert(
    drafts.map((draft) => ({
      user_id: draft.userId,
      incident_id: draft.incidentId ?? null,
      type: draft.type,
      title: draft.title,
      message: draft.message,
    }))
  );

  if (error) {
    console.error("Failed to insert notifications:", error);
  }
}

export async function getOperationalStaffIds(): Promise<string[]> {
  const admin = tryCreateAdminClient();

  if (!admin) {
    return [];
  }

  const { data, error } = await admin
    .from("profiles")
    .select("id, role, authority_status")
    .in("role", ["admin", "authority"]);

  if (error || !data) {
    console.error("Failed to load operational staff for notifications:", error);
    return [];
  }

  return data
    .filter(
      (row) =>
        row.role === "admin" ||
        (row.role === "authority" && row.authority_status === "approved")
    )
    .map((row) => row.id);
}

export function shortIncidentId(incidentId: string): string {
  return incidentId.slice(0, 8).toUpperCase();
}

export type { Notification };
