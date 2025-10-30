import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const weatherTool = createTool({
  id: "get-weather",
  description: "Get current weather for a location",
  inputSchema: z.object({
    location: z.string().describe("City name")
  }),
  outputSchema: z.object({
    temperature: z.number(),
    feelsLike: z.number(),
    humidity: z.number(),
    windSpeed: z.number(),
    windGust: z.number(),
    conditions: z.string(),
    location: z.string()
  }),
  execute: async ({ context }) => {
    const geocodeURL = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      context.location
    )}&count=1`;
    const geoRes = await fetch(geocodeURL);
    const geoData = await geoRes.json();

    if (!geoData.results?.[0]) {
      throw new Error(`Location '${context.location}' not found`);
    }

    const { latitude, longitude, name } = geoData.results[0];

    const weatherURL = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_gusts_10m,weather_code`;
    const response = await fetch(weatherURL);
    const data = await response.json();

    return {
      temperature: data.current.temperature_2m,
      feelsLike: data.current.apparent_temperature,
      humidity: data.current.relative_humidity_2m,
      windSpeed: data.current.wind_speed_10m,
      windGust: data.current.wind_gusts_10m,
      conditions: getWeatherCondition(data.current.weather_code),
      location: name
    };
  }
});

function getWeatherCondition(code: number): string {
  const map: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Rime fog",
    51: "Light drizzle",
    61: "Rain",
    71: "Snowfall",
    80: "Rain showers",
    95: "Thunderstorm"
  };
  return map[code] || "Unknown conditions";
}
