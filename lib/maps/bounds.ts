import type { PublicMapIncident } from "@/lib/incidents/public";

import { DEFAULT_MAP_CENTER } from "./constants";

export type LatLngBounds = [[number, number], [number, number]];

/** Fit bounds for incidents, or a single-point padding around the default center. */
export function getIncidentMapBounds(
  incidents: Pick<PublicMapIncident, "latitude" | "longitude">[]
): LatLngBounds | null {
  if (incidents.length === 0) {
    return null;
  }

  let minLat = incidents[0].latitude;
  let maxLat = incidents[0].latitude;
  let minLng = incidents[0].longitude;
  let maxLng = incidents[0].longitude;

  for (const incident of incidents.slice(1)) {
    minLat = Math.min(minLat, incident.latitude);
    maxLat = Math.max(maxLat, incident.latitude);
    minLng = Math.min(minLng, incident.longitude);
    maxLng = Math.max(maxLng, incident.longitude);
  }

  if (incidents.length === 1) {
    const pad = 0.02;
    return [
      [minLat - pad, minLng - pad],
      [maxLat + pad, maxLng + pad],
    ];
  }

  return [
    [minLat, minLng],
    [maxLat, maxLng],
  ];
}

export function getMapCenter(
  incidents: Pick<PublicMapIncident, "latitude" | "longitude">[]
): [number, number] {
  if (incidents.length === 0) {
    return [DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng];
  }

  const sum = incidents.reduce(
    (acc, incident) => ({
      lat: acc.lat + incident.latitude,
      lng: acc.lng + incident.longitude,
    }),
    { lat: 0, lng: 0 }
  );

  return [sum.lat / incidents.length, sum.lng / incidents.length];
}
