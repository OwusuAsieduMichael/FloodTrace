import { formatTemperatureC, openWeatherIconUrl } from "@/lib/weather";
import type { WeatherData } from "@/types";

interface MapWeatherChipProps {
  weather: WeatherData;
}

export function MapWeatherChip({ weather }: MapWeatherChipProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-background/95 px-2.5 py-1.5 text-xs shadow-sm backdrop-blur-sm">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={openWeatherIconUrl(weather.current.condition.icon)}
        alt=""
        width={28}
        height={28}
        className="size-7"
      />
      <div>
        <p className="font-medium">
          {formatTemperatureC(weather.current.temperatureC)}
        </p>
        <p className="max-w-[9rem] truncate capitalize text-muted-foreground">
          {weather.current.condition.description}
        </p>
      </div>
    </div>
  );
}
