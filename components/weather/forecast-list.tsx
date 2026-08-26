import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatForecastDayLabel,
  formatRainMm,
  formatTemperatureC,
  openWeatherIconUrl,
} from "@/lib/weather";
import type { WeatherForecastDay } from "@/types";

interface ForecastListProps {
  days: WeatherForecastDay[];
}

export function ForecastList({ days }: ForecastListProps) {
  if (days.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            A multi-day forecast was not available for this location.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">5-day forecast</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {days.map((day) => (
          <div
            key={day.date}
            className="flex items-center gap-3 rounded-lg border border-border/80 p-3 lg:flex-col lg:items-start lg:text-left"
          >
            <p className="text-sm font-medium">{formatForecastDayLabel(day.date)}</p>
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={openWeatherIconUrl(day.condition.icon)}
                alt=""
                width={40}
                height={40}
                className="size-10"
              />
              <p className="capitalize text-sm text-muted-foreground">
                {day.condition.description}
              </p>
            </div>
            <p className="text-sm">
              {formatTemperatureC(day.minC)} – {formatTemperatureC(day.maxC)}
            </p>
            <p className="text-xs text-muted-foreground">
              Rain {formatRainMm(day.rainfallMm)}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
