"use client";

import { Loader2, MapPin, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { formatCoordinates } from "@/lib/incidents/format";

export interface CapturedLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  capturedAt: string;
}

interface LocationCaptureProps {
  location: CapturedLocation | null;
  onCapture: (location: CapturedLocation) => void;
}

export function LocationCapture({ location, onCapture }: LocationCaptureProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Location services are not supported in this browser.");
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onCapture({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          capturedAt: new Date().toISOString(),
        });
        setIsLoading(false);
      },
      (geoError) => {
        setIsLoading(false);

        switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            setError(
              "Location permission was denied. Allow location access to submit a report."
            );
            break;
          case geoError.POSITION_UNAVAILABLE:
            setError(
              "Your location could not be determined. Move to an open area and try again."
            );
            break;
          default:
            setError("Location detection timed out. Please try again.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }, [onCapture]);

  useEffect(() => {
    if (!location) {
      detectLocation();
    }
  }, [location, detectLocation]);

  if (location) {
    return (
      <div className="space-y-4 rounded-xl border border-success/30 bg-success/5 p-4">
        <div className="flex items-start gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-success/15 text-success">
            <MapPin className="size-5" />
          </span>
          <div className="space-y-1">
            <p className="font-medium text-success">Location detected</p>
            <p className="font-mono text-sm">
              {formatCoordinates(location.latitude, location.longitude)}
            </p>
            <p className="text-xs text-muted-foreground">
              Accuracy ±{Math.round(location.accuracy)}m ·{" "}
              {new Date(location.capturedAt).toLocaleTimeString()}
            </p>
          </div>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={detectLocation}>
          <RefreshCw className="size-4" />
          Refresh location
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Location unavailable</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <Alert variant="info">
          <MapPin className="size-4" />
          <AlertTitle>Detecting your location</AlertTitle>
          <AlertDescription>
            GPS coordinates are captured automatically. Reports cannot be submitted
            without a verified location.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-center rounded-xl border border-dashed border-border py-10">
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Detecting location…
          </div>
        ) : (
          <Button type="button" onClick={detectLocation}>
            <RefreshCw className="size-4" />
            Try again
          </Button>
        )}
      </div>
    </div>
  );
}
