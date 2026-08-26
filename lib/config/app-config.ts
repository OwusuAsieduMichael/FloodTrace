import { createClient } from "@/lib/supabase/server";
import type { DuplicateDetectionConfig, EmergencyContact } from "@/types";

import {
  configuredEmergencyContacts,
  GHANA_EMERGENCY_CONTACTS,
} from "./emergency-contacts";

export async function getEmergencyContacts(): Promise<EmergencyContact[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("app_config")
    .select("value")
    .eq("key", "emergency_contacts")
    .maybeSingle();

  if (error || !data?.value) {
    return GHANA_EMERGENCY_CONTACTS;
  }

  const stored = data.value as EmergencyContact[];
  const configured = configuredEmergencyContacts(stored);

  return configured.length > 0 ? stored : GHANA_EMERGENCY_CONTACTS;
}

export async function getDuplicateDetectionConfig(): Promise<DuplicateDetectionConfig | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("app_config")
    .select("value")
    .eq("key", "duplicate_detection")
    .maybeSingle();

  if (error || !data?.value) {
    return null;
  }

  return data.value as DuplicateDetectionConfig;
}
