import Link from "next/link";
import { CloudRain } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRainMm, formatTemperatureC, type WeatherResult } from "@/lib/weather";

interface WeatherSummaryCardProps {
  weather: WeatherResult;
}

export function WeatherSummaryCard({ weather }: WeatherSummaryCardProps) {
  if (!weather.ok) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CloudRain className="mb-2 size-5 text-primary" />
          <CardTitle className="text-base">Weather</CardTitle>
          <CardDescription>{weather.message}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" size="sm" render={<Link href="/citizen/weather" />}>
            Open weather
          </Button>
        </CardContent>
      </Card>
    );
  }

  const rainfall =
    weather.data.current.rainfallMmLastHour ??
    weather.data.current.rainfallMmLast3Hours;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CloudRain className="mb-2 size-5 text-primary" />
        <CardTitle className="text-base">
          {formatTemperatureC(weather.data.current.temperatureC)} ·{" "}
          <span className="capitalize font-normal text-muted-foreground">
            {weather.data.current.condition.description}
          </span>
        </CardTitle>
        <CardDescription>
          {weather.data.locationName}. Rain{" "}
          {rainfall === null ? "not reported" : formatRainMm(rainfall)}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" size="sm" render={<Link href="/citizen/weather" />}>
          View forecast
        </Button>
      </CardContent>
    </Card>
  );
}
