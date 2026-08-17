"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AlertTriangle, Camera, ChevronRight, MapPin } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { IncidentMap, STATUS_COLOR } from "@/components/map/incident-map";
import { Skeleton } from "@/components/ui/skeleton";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useWeather } from "@/hooks/use-weather";
import { getIncidents } from "@/lib/firebase/incidents";
import { distanceKm, MUNICIPALITY_CENTER } from "@/lib/geo";
import { STATUS_LABEL } from "@/lib/incident-status";
import { useAuth } from "@/providers/auth-provider";

const RAIN_ALERT_THRESHOLD = 50;

export default function HomePage() {
  const { appUser } = useAuth();
  const { location, capture } = useGeolocation();

  useEffect(() => {
    capture();
    // Only auto-capture once, on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const municipality = appUser?.municipality ?? "Accra";
  const effectiveLocation =
    location ?? MUNICIPALITY_CENTER[municipality] ?? MUNICIPALITY_CENTER.Accra;

  const { data: weather, isLoading: weatherLoading } = useWeather(effectiveLocation);

  const { data: incidents } = useQuery({
    queryKey: ["incidents"],
    queryFn: getIncidents,
  });

  const nearby = useMemo(() => {
    if (!incidents) return [];
    return incidents
      .map((incident) => ({
        incident,
        km: distanceKm(effectiveLocation, incident.location),
      }))
      .sort((a, b) => a.km - b.km)
      .slice(0, 2);
  }, [incidents, effectiveLocation]);

  const showRainAlert = (weather?.rainProbability ?? 0) >= RAIN_ALERT_THRESHOLD;

  return (
    <div className="flex flex-1 flex-col gap-4 pb-4">
      <div className="bg-gradient-to-br from-brand-from to-brand-to px-4 pt-2 pb-5 text-primary-foreground">
        <div className="flex items-center gap-1.5 text-xs opacity-90">
          <MapPin className="size-3.5" />
          Your location
        </div>
        <div className="text-lg font-semibold tracking-tight">{municipality}</div>
      </div>

      <div className="flex flex-col gap-4 px-4">
        {showRainAlert && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2.5 rounded-xl border border-amber-300/60 bg-amber-50 px-3.5 py-3 text-amber-900 dark:border-amber-400/20 dark:bg-amber-950/40 dark:text-amber-200"
          >
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <p className="text-sm leading-snug">
              <strong className="font-semibold">Heavy rainfall expected</strong>{" "}
              in your area. {weather?.rainProbability}% chance of rain in the
              next 3 hours
              {nearby.length > 0 && ` · ${nearby.length} active reports nearby`}
              .
            </p>
          </motion.div>
        )}

        <div className="flex gap-3">
          <div className="flex-1 rounded-xl bg-card p-3.5 ring-1 ring-foreground/10">
            <p className="text-xs text-muted-foreground">Now</p>
            {weatherLoading ? (
              <Skeleton className="mt-1 h-7 w-16" />
            ) : (
              <p className="text-2xl font-semibold">{weather?.tempC ?? "–"}°C</p>
            )}
            <p className="text-xs text-muted-foreground">
              {weather?.condition ?? "—"}
            </p>
          </div>
          <div className="flex-1 rounded-xl bg-card p-3.5 ring-1 ring-foreground/10">
            <p className="text-xs text-muted-foreground">Rain probability</p>
            {weatherLoading ? (
              <Skeleton className="mt-1 h-7 w-16" />
            ) : (
              <p className="text-2xl font-semibold text-primary">
                {weather?.rainProbability ?? "–"}%
              </p>
            )}
            <p className="text-xs text-muted-foreground">Next 3 hours</p>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Nearby conditions</h2>
            <Link href="/map" className="text-xs font-medium text-primary">
              See all
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {nearby.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No nearby reports right now.
              </p>
            )}
            {nearby.map(({ incident, km }) => (
              <Link
                key={incident.id}
                href={`/reports/${incident.id}`}
                className="flex items-center gap-2.5 rounded-lg bg-card px-3.5 py-3 ring-1 ring-foreground/10 transition-shadow hover:shadow-sm"
              >
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: STATUS_COLOR[incident.status] }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {incident.municipality} — {incident.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {km.toFixed(1)} km away · {STATUS_LABEL[incident.status]}
                    {incident.supportingReportIds.length > 0 &&
                      ` · ${incident.supportingReportIds.length + 1} reports`}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <Link
          href="/report/new"
          className="flex items-center gap-3.5 rounded-2xl bg-gradient-to-br from-brand-from to-brand-to p-4 text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/15">
            <Camera className="size-5" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold">
              Report a flood or blocked drain
            </p>
            <p className="text-xs opacity-85">Takes about a minute</p>
          </div>
          <ChevronRight className="size-5 opacity-90" />
        </Link>

        <div>
          <h2 className="mb-2 text-sm font-semibold">Map</h2>
          <Link
            href="/map"
            className="relative block h-36 overflow-hidden rounded-xl ring-1 ring-foreground/10"
          >
            <div className="pointer-events-none absolute inset-0">
              <IncidentMap incidents={incidents ?? []} />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
