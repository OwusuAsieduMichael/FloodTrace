"use client";

import { useCallback, useState } from "react";
import type { GeoPoint } from "@/types/domain";

interface GeolocationState {
  location: GeoPoint | null;
  loading: boolean;
  error: string | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    loading: false,
    error: null,
  });

  const capture = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setState({ location: null, loading: false, error: "Geolocation is not supported on this device." });
      return;
    }

    setState((s) => ({ ...s, loading: true, error: null }));
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          loading: false,
          error: null,
        });
      },
      () => {
        setState({
          location: null,
          loading: false,
          error: "Couldn't get your location. Enable location access and try again.",
        });
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }, []);

  return { ...state, capture };
}
