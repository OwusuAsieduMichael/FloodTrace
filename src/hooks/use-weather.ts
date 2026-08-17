"use client";

import { useQuery } from "@tanstack/react-query";
import type { GeoPoint } from "@/types/domain";

interface WeatherSnapshot {
  tempC: number;
  condition: string;
  rainProbability: number;
}

export function useWeather(location: GeoPoint | null) {
  return useQuery<WeatherSnapshot>({
    queryKey: ["weather", location?.lat, location?.lng],
    queryFn: async () => {
      const res = await fetch(
        `/api/weather?lat=${location!.lat}&lng=${location!.lng}`,
      );
      if (!res.ok) throw new Error("Weather lookup failed");
      return res.json();
    },
    enabled: !!location,
    staleTime: 10 * 60 * 1000,
  });
}
