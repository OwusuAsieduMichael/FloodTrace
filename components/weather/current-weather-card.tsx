import { Droplets, Wind } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  formatObservedAt,
  formatRainMm,
  formatTemperatureC,
  formatWindMs,
  openWeatherIconUrl,
} from "@/lib/weather";
import type { WeatherData } from "@/types";

interface CurrentWeatherCardProps {
  weather: WeatherData;
  locationNote?: string;
}

export function CurrentWeatherCard({
  weather,
  locationNote,
}: CurrentWeatherCardProps) {
  const { current } = weather;
  const rainfall =
    current.rainfallMmLastHour ?? current.rainfallMmLast3Hours;

  return (
    <Card>
      <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={openWeatherIconUrl(current.condition.icon)}
            alt=""
            width={80}
            height={80}
            className="size-20"
          />
          <div>
            <p className="text-4xl font-semibold tracking-tight">
              {formatTemperatureC(current.temperatureC)}
            </p>
            <p className="capitalize text-muted-foreground">
              {current.condition.description}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Feels like {formatTemperatureC(current.feelsLikeC)}
            </p>
          </div>
        </div>

        <div className="space-y-2 sm:text-right">
          <p className="font-medium">{weather.locationName}</p>
          {locationNote ? (
            <p className="text-xs text-muted-foreground">{locationNote}</p>
          ) : null}
          <Badge variant="secondary">
            Updated {formatObservedAt(current.observedAt)}
          </Badge>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground sm:justify-end">
            <span className="inline-flex items-center gap-1">
              <Droplets className="size-3.5" />
              {rainfall === null
                ? "Rainfall not reported"
                : `Rain ${formatRainMm(rainfall)}`}
            </span>
            <span className="inline-flex items-center gap-1">
              <Wind className="size-3.5" />
              {formatWindMs(current.windSpeedMs)}
            </span>
            <span>{current.humidity}% humidity</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
