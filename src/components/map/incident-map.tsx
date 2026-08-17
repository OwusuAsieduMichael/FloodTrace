"use client";

import {
  GeoJSONSource,
  Map as MapLibreMap,
  NavigationControl,
  Popup,
  type LngLatLike,
  type MapGeoJSONFeature,
  type MapLayerMouseEvent,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";
import type { IncidentReport, IncidentStatus } from "@/types/domain";

export const STATUS_COLOR: Record<IncidentStatus, string> = {
  SUBMITTED: "#eab308",
  PENDING_REVIEW: "#f97316",
  VERIFIED: "#22c55e",
  ASSIGNED: "#3b82f6",
  RESOLVED: "#6b7280",
  REJECTED: "#ef4444",
};

const ACCRA_CENTER: LngLatLike = [-0.187, 5.6037];

function toFeatureCollection(incidents: IncidentReport[]) {
  return {
    type: "FeatureCollection" as const,
    features: incidents.map((incident) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [incident.location.lng, incident.location.lat],
      },
      properties: {
        id: incident.id,
        status: incident.status,
        municipality: incident.municipality,
        description: incident.description,
      },
    })),
  };
}

export function IncidentMap({ incidents }: { incidents: IncidentReport[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new MapLibreMap({
      container: containerRef.current,
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_API_KEY}`,
      center: ACCRA_CENTER,
      zoom: 11,
    });
    mapRef.current = map;
    map.addControl(new NavigationControl(), "top-right");

    const popup = new Popup({ closeButton: false, maxWidth: "260px" });

    map.on("load", () => {
      map.addSource("incidents", {
        type: "geojson",
        data: toFeatureCollection(incidents),
        cluster: true,
        clusterRadius: 50,
        clusterMaxZoom: 14,
      });

      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "incidents",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#2563eb",
          "circle-radius": [
            "step",
            ["get", "point_count"],
            16,
            10,
            20,
            50,
            26,
          ],
          "circle-opacity": 0.85,
        },
      });

      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "incidents",
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-size": 12,
        },
        paint: { "text-color": "#ffffff" },
      });

      map.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "incidents",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": [
            "match",
            ["get", "status"],
            "SUBMITTED",
            STATUS_COLOR.SUBMITTED,
            "PENDING_REVIEW",
            STATUS_COLOR.PENDING_REVIEW,
            "VERIFIED",
            STATUS_COLOR.VERIFIED,
            "ASSIGNED",
            STATUS_COLOR.ASSIGNED,
            "RESOLVED",
            STATUS_COLOR.RESOLVED,
            "REJECTED",
            STATUS_COLOR.REJECTED,
            "#6b7280",
          ],
          "circle-radius": 8,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });

      map.on("click", "clusters", (e: MapLayerMouseEvent) => {
        const [feature] = map.queryRenderedFeatures(e.point, {
          layers: ["clusters"],
        });
        const clusterId = feature?.properties?.cluster_id;
        const source = map.getSource("incidents") as GeoJSONSource;
        if (clusterId === undefined) return;
        source.getClusterExpansionZoom(clusterId).then((zoom: number) => {
          const geometry = feature.geometry;
          if (geometry.type !== "Point") return;
          map.easeTo({
            center: geometry.coordinates as LngLatLike,
            zoom,
          });
        });
      });

      map.on("click", "unclustered-point", (e: MapLayerMouseEvent) => {
        const feature = e.features?.[0] as MapGeoJSONFeature | undefined;
        if (!feature || feature.geometry.type !== "Point") return;
        const { id, municipality, description, status } = feature.properties as {
          id: string;
          municipality: string;
          description: string;
          status: IncidentStatus;
        };

        popup
          .setLngLat(feature.geometry.coordinates as LngLatLike)
          .setHTML(
            `<div style="font-size:13px;line-height:1.4">
              <strong>${municipality}</strong> — ${status}<br/>
              ${description.slice(0, 140)}<br/>
              <a href="/reports/${id}" style="color:#2563eb;text-decoration:underline">View report</a>
            </div>`,
          )
          .addTo(map);
      });

      for (const layer of ["clusters", "unclustered-point"]) {
        map.on("mouseenter", layer, () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", layer, () => {
          map.getCanvas().style.cursor = "";
        });
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // Map is initialized once; incident updates are pushed via the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const source = map.getSource("incidents") as GeoJSONSource | undefined;
    source?.setData(toFeatureCollection(incidents));
  }, [incidents]);

  return <div ref={containerRef} className="h-full w-full" />;
}
