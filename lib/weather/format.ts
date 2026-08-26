import { format, parseISO } from "date-fns";

export function roundCoordinate(value: number, precision = 3): number {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

export function formatTemperatureC(value: number): string {
  return `${Math.round(value)}°C`;
}

export function formatRainMm(value: number): string {
  if (value <= 0) {
    return "0 mm";
  }

  return `${value < 10 ? value.toFixed(1) : Math.round(value)} mm`;
}

export function formatWindMs(value: number | null): string {
  if (value === null) {
    return "Not reported";
  }

  return `${value.toFixed(1)} m/s`;
}

export function formatForecastDayLabel(date: string): string {
  const parsed = parseISO(`${date}T12:00:00`);
  return format(parsed, "EEE d MMM");
}

export function formatObservedAt(iso: string): string {
  return format(new Date(iso), "h:mm a");
}

export function openWeatherIconUrl(icon: string): string {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
}
