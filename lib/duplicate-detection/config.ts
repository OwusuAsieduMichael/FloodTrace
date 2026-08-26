import { getDuplicateDetectionConfig } from "@/lib/config/app-config";
import { getServerEnv } from "@/lib/env";
import type { DuplicateDetectionConfig } from "@/types";

export async function resolveDuplicateDetectionConfig(): Promise<DuplicateDetectionConfig> {
  const fromDatabase = await getDuplicateDetectionConfig();

  if (fromDatabase) {
    return fromDatabase;
  }

  const env = getServerEnv();

  return {
    radius_meters: env.DUPLICATE_RADIUS_METERS,
    time_window_minutes: env.DUPLICATE_TIME_WINDOW_MINUTES,
  };
}
