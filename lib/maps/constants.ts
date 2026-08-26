import type { IncidentSeverity } from "@/types";

/** Default map center — Accra, Ghana */
export const DEFAULT_MAP_CENTER = {
  lat: 5.6037,
  lng: -0.187,
} as const;

export const DEFAULT_MAP_ZOOM = 12;

export const SEVERITY_MARKER_COLORS: Record<IncidentSeverity, string> = {
  critical: "#dc2626",
  high: "#ea580c",
  medium: "#ca8a04",
  low: "#16a34a",
};

export const OSM_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

export const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
