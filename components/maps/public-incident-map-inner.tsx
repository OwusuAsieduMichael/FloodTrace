"use client";

import { useEffect } from "react";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

import type { PublicMapIncident } from "@/lib/incidents/public";
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  getIncidentMapBounds,
  getMapCenter,
  OSM_ATTRIBUTION,
  OSM_TILE_URL,
  SEVERITY_MARKER_COLORS,
  type LatLngBounds,
} from "@/lib/maps";

import { MapIncidentPopup } from "./map-incident-popup";

import "leaflet/dist/leaflet.css";

interface PublicIncidentMapInnerProps {
  incidents: PublicMapIncident[];
  detailHrefBase?: string;
}

function FitBounds({ bounds }: { bounds: LatLngBounds | null }) {
  const map = useMap();

  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [bounds, map]);

  return null;
}

export function PublicIncidentMapInner({
  incidents,
  detailHrefBase,
}: PublicIncidentMapInnerProps) {
  const bounds = getIncidentMapBounds(incidents);
  const center = getMapCenter(incidents);
  const zoom = incidents.length === 0 ? DEFAULT_MAP_ZOOM : undefined;

  return (
    <MapContainer
      center={center ?? [DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng]}
      zoom={zoom ?? DEFAULT_MAP_ZOOM}
      className="h-full w-full rounded-xl"
      scrollWheelZoom
    >
      <TileLayer attribution={OSM_ATTRIBUTION} url={OSM_TILE_URL} />
      <FitBounds bounds={bounds} />
      {incidents.map((incident) => (
        <CircleMarker
          key={incident.id}
          center={[incident.latitude, incident.longitude]}
          radius={9}
          pathOptions={{
            color: "#ffffff",
            weight: 2,
            fillColor: SEVERITY_MARKER_COLORS[incident.severity],
            fillOpacity: 0.9,
          }}
        >
          <Popup maxWidth={260} minWidth={180}>
            <MapIncidentPopup
              incident={incident}
              href={detailHrefBase ? `${detailHrefBase}/${incident.id}` : undefined}
            />
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
