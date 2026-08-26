import { PageHeader } from "@/components/layout/page-header";
import { WeatherPanel } from "@/components/weather/weather-panel";
import { getCurrentProfile } from "@/lib/auth/session";
import { maybeCreateRainfallWarning } from "@/lib/notifications";
import { getWeather } from "@/lib/weather";

export const metadata = {
  title: "Weather",
  description: "Current conditions, rainfall, and forecast for your area.",
};

export default async function CitizenWeatherPage() {
  const [weather, profile] = await Promise.all([
    getWeather(),
    getCurrentProfile(),
  ]);

  if (weather.ok && profile) {
    await maybeCreateRainfallWarning(profile.id, weather.data);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Weather"
        description="Current conditions and rainfall context for the Accra map area. You can switch to your device location."
      />
      <WeatherPanel initial={weather} />
    </div>
  );
}
