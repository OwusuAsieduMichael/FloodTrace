import { format, formatDistanceToNow } from "date-fns";

import { INCIDENT_TYPE_LABELS } from "./constants";

export function formatIncidentType(type: keyof typeof INCIDENT_TYPE_LABELS): string {
  return INCIDENT_TYPE_LABELS[type];
}

export function formatIncidentDate(iso: string): string {
  return format(new Date(iso), "MMM d, yyyy · h:mm a");
}

export function formatRelativeDate(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true });
}

export function formatShortId(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

export function formatCoordinates(latitude: number, longitude: number): string {
  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}

/** Prefer a readable place name; fall back to GPS only when no name was resolved. */
export function formatIncidentLocation(
  locationName: string | null | undefined,
  latitude?: number,
  longitude?: number
): string {
  const name = locationName?.trim();

  if (name) {
    return name;
  }

  if (
    typeof latitude === "number" &&
    Number.isFinite(latitude) &&
    typeof longitude === "number" &&
    Number.isFinite(longitude)
  ) {
    return formatCoordinates(latitude, longitude);
  }

  return "Unknown location";
}
