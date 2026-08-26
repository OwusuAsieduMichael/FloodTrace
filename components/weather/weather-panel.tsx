"use client";

import { useState, useTransition } from "react";
import { LocateFixed } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DEFAULT_WEATHER_LOCATION, type WeatherResult } from "@/lib/weather";

import { CurrentWeatherCard } from "./current-weather-card";
import { ForecastList } from "./forecast-list";

interface WeatherPanelProps {
  initial: WeatherResult;
}

export function WeatherPanel({ initial }: WeatherPanelProps) {
  const [result, setResult] = useState<WeatherResult>(initial);
  const [usingDeviceLocation, setUsingDeviceLocation] = useState(false);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function loadWeather(lat: number, lng: number, fromDevice: boolean) {
    startTransition(async () => {
      try {
        const response = await fetch(
          `/api/weather?lat=${encodeURIComponent(String(lat))}&lng=${encodeURIComponent(String(lng))}`
        );
        const payload = (await response.json()) as WeatherResult;
        setResult(payload);
        setUsingDeviceLocation(fromDevice && payload.ok);
        setLocationMessage(
          fromDevice && payload.ok
            ? "Showing conditions for your current location."
            : null
        );
      } catch {
        setResult({
          ok: false,
          code: "unavailable",
          message:
            "Current weather could not be loaded. Try again in a few minutes.",
        });
      }
    });
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setLocationMessage(
        "This browser does not support location. Showing the Accra map area instead."
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        loadWeather(position.coords.latitude, position.coords.longitude, true);
      },
      () => {
        setLocationMessage(
          "Location access was denied. Showing weather for the Accra map area."
        );
        setUsingDeviceLocation(false);
        loadWeather(
          DEFAULT_WEATHER_LOCATION.lat,
          DEFAULT_WEATHER_LOCATION.lng,
          false
        );
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  }

  if (!result.ok) {
    return (
      <div className="space-y-4">
        <Alert variant={result.code === "not_configured" ? "warning" : "destructive"}>
          <AlertTitle>Weather unavailable</AlertTitle>
          <AlertDescription>{result.message}</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={useMyLocation} disabled={isPending}>
          <LocateFixed className="size-4" />
          Try my location
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Conditions are from OpenWeatherMap. Rainfall is shown only when the
          provider reports it — values are never estimated.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="w-full shrink-0 sm:w-auto"
          onClick={useMyLocation}
          disabled={isPending}
        >
          <LocateFixed className="size-4" />
          {isPending ? "Updating…" : "Use my location"}
        </Button>
      </div>

      {locationMessage ? (
        <Alert variant="info">
          <AlertDescription>{locationMessage}</AlertDescription>
        </Alert>
      ) : null}

      <CurrentWeatherCard
        weather={result.data}
        locationNote={
          usingDeviceLocation
            ? "Based on your device location."
            : DEFAULT_WEATHER_LOCATION.label
        }
      />
      <ForecastList days={result.data.forecast} />
    </div>
  );
}
