import { createClient } from "@/lib/supabase/server";
import type { DuplicateDetectionConfig, EmergencyContact } from "@/types";

export async function getEmergencyContacts(): Promise<EmergencyContact[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("app_config")
    .select("value")
    .eq("key", "emergency_contacts")
    .maybeSingle();

  if (error || !data?.value) {
    return [];
  }

  return data.value as EmergencyContact[];
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
