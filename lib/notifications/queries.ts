import { createClient } from "@/lib/supabase/server";
import type { Notification, WeatherData } from "@/types";

import { HEAVY_RAINFALL_MM, RAINFALL_WARNING_COOLDOWN_HOURS } from "./constants";
import { insertNotifications } from "./dispatch";

export async function getNotifications(userId: string): Promise<Notification[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error || !data) {
    return [];
  }

  return data as Notification[];
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false);

  if (error || count === null) {
    return 0;
  }

  return count;
}

export async function maybeCreateRainfallWarning(
  userId: string,
  weather: WeatherData
): Promise<void> {
  const peakRainMm = Math.max(
    weather.current.rainfallMmLastHour ?? 0,
    weather.current.rainfallMmLast3Hours ?? 0,
    ...weather.forecast.map((day) => day.rainfallMm)
  );

  if (peakRainMm < HEAVY_RAINFALL_MM) {
    return;
  }

  const supabase = await createClient();
  const since = new Date(
    Date.now() - RAINFALL_WARNING_COOLDOWN_HOURS * 60 * 60 * 1000
  ).toISOString();

  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("type", "rainfall_warning")
    .gte("created_at", since);

  if (error || (count && count > 0)) {
    return;
  }

  await insertNotifications([
    {
      userId,
      type: "rainfall_warning",
      title: "Heavy rainfall warning",
      message: `OpenWeatherMap reports up to ${peakRainMm.toFixed(1)} mm of rain for ${weather.locationName}. Watch local drains and flood-prone areas.`,
    },
  ]);
}
