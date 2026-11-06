export const MALAYBALAY_COORDINATES = {
  latitude: 8.1575,
  longitude: 125.12778,
} as const;

const weatherParameters = new URLSearchParams({
  latitude: String(MALAYBALAY_COORDINATES.latitude),
  longitude: String(MALAYBALAY_COORDINATES.longitude),
  current:
    "temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m",
  hourly:
    "temperature_2m,precipitation_probability,weather_code,wind_speed_10m",
  forecast_hours: "24",
  timezone: "Asia/Manila",
});

export const MALAYBALAY_WEATHER_URL =
  `https://api.open-meteo.com/v1/forecast?${weatherParameters.toString()}`;

export type MalaybalayWeather = {
  timezone: string;
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    precipitation: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  current_units: {
    temperature_2m: string;
    apparent_temperature: string;
    relative_humidity_2m: string;
    precipitation: string;
    wind_speed_10m: string;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation_probability: number[];
    weather_code: number[];
    wind_speed_10m: number[];
  };
  hourly_units: {
    temperature_2m: string;
    precipitation_probability: string;
    wind_speed_10m: string;
  };
};

const isNumberArray = (value: unknown): value is number[] =>
  Array.isArray(value) && value.every((item) => typeof item === "number");

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

function isMalaybalayWeather(value: unknown): value is MalaybalayWeather {
  if (!value || typeof value !== "object") return false;
  const data = value as Partial<MalaybalayWeather>;
  return Boolean(
    data.timezone === "Asia/Manila" &&
      data.current &&
      typeof data.current.time === "string" &&
      typeof data.current.temperature_2m === "number" &&
      typeof data.current.apparent_temperature === "number" &&
      typeof data.current.relative_humidity_2m === "number" &&
      typeof data.current.precipitation === "number" &&
      typeof data.current.weather_code === "number" &&
      typeof data.current.wind_speed_10m === "number" &&
      data.hourly &&
      isStringArray(data.hourly.time) &&
      data.hourly.time.length === 24 &&
      isNumberArray(data.hourly.temperature_2m) &&
      isNumberArray(data.hourly.precipitation_probability) &&
      isNumberArray(data.hourly.weather_code) &&
      isNumberArray(data.hourly.wind_speed_10m) &&
      data.hourly.temperature_2m.length === data.hourly.time.length &&
      data.hourly.precipitation_probability.length === data.hourly.time.length &&
      data.current_units &&
      typeof data.current_units.temperature_2m === "string" &&
      typeof data.current_units.apparent_temperature === "string" &&
      typeof data.current_units.relative_humidity_2m === "string" &&
      typeof data.current_units.precipitation === "string" &&
      typeof data.current_units.wind_speed_10m === "string" &&
      data.hourly_units &&
      typeof data.hourly_units.temperature_2m === "string" &&
      typeof data.hourly_units.precipitation_probability === "string" &&
      typeof data.hourly_units.wind_speed_10m === "string",
  );
}

export async function fetchMalaybalayWeather(signal?: AbortSignal) {
  const response = await fetch(MALAYBALAY_WEATHER_URL, {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Weather service returned ${response.status}`);
  }
  const data: unknown = await response.json();
  if (!isMalaybalayWeather(data)) {
    throw new Error("Weather service returned an incomplete forecast");
  }
  return data;
}

export function weatherCondition(code: number) {
  if (code === 0) return "Clear sky";
  if (code <= 3) return code === 1 ? "Mainly clear" : "Partly cloudy";
  if (code === 45 || code === 48) return "Foggy";
  if (code >= 51 && code <= 57) return "Drizzle";
  if (code >= 61 && code <= 67) return "Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Rain showers";
  if (code >= 85 && code <= 86) return "Snow showers";
  if (code >= 95) return "Thunderstorms";
  return "Variable conditions";
}
