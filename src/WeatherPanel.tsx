import { useEffect, useMemo, useState } from "react";
import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSun,
  Clock3,
  Droplets,
  ExternalLink,
  RefreshCw,
  Sun,
  Wind,
} from "lucide-react";
import {
  fetchMalaybalayWeather,
  type MalaybalayWeather,
  weatherCondition,
} from "./weather";

type WeatherState =
  | { status: "loading" }
  | { status: "ready"; data: MalaybalayWeather }
  | { status: "error" };

const localDate = (value: string) => new Date(`${value}:00+08:00`);

const formatHour = (value: string) =>
  new Intl.DateTimeFormat("en-PH", {
    hour: "numeric",
    timeZone: "Asia/Manila",
  }).format(localDate(value));

const formatUpdated = (value: string) =>
  new Intl.DateTimeFormat("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    weekday: "short",
    timeZone: "Asia/Manila",
  }).format(localDate(value));

function WeatherIcon({ code }: { code: number }) {
  if (code === 0) return <Sun aria-hidden="true" />;
  if (code <= 2) return <CloudSun aria-hidden="true" />;
  if (code <= 3) return <Cloud aria-hidden="true" />;
  if (code === 45 || code === 48) return <CloudFog aria-hidden="true" />;
  if (code >= 95) return <CloudLightning aria-hidden="true" />;
  return <CloudRain aria-hidden="true" />;
}

function WeatherSkeleton() {
  return (
    <section className="section container weather-section" aria-label="Loading Malaybalay weather">
      <div className="weather-skeleton" role="status">
        <span className="sr-only">Loading Malaybalay weather forecast</span>
        <i />
        <i />
        <i />
      </div>
    </section>
  );
}

export default function WeatherPanel() {
  const [state, setState] = useState<WeatherState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [selectedHourTime, setSelectedHourTime] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchMalaybalayWeather(controller.signal)
      .then((data) => setState({ status: "ready", data }))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setState({ status: "error" });
      });
    return () => controller.abort();
  }, [attempt]);

  const summary = useMemo(() => {
    if (state.status !== "ready") return null;
    const temperatures = state.data.hourly.temperature_2m;
    const rain = state.data.hourly.precipitation_probability;
    const peakRain = Math.max(...rain);
    const peakRainIndex = rain.indexOf(peakRain);
    const outlook =
      peakRain >= 70
        ? "Rain is likely during part of the next 24 hours."
        : peakRain >= 40
          ? "Scattered showers are possible during the next 24 hours."
          : "Rain chances remain relatively low during the next 24 hours.";
    return {
      low: Math.round(Math.min(...temperatures)),
      high: Math.round(Math.max(...temperatures)),
      peakRain,
      peakRainTime: formatHour(state.data.hourly.time[peakRainIndex]),
      outlook,
    };
  }, [state]);

  if (state.status === "loading") return <WeatherSkeleton />;

  if (state.status === "error") {
    return (
      <section className="section container weather-section">
        <div className="weather-error" role="alert">
          <CloudSun aria-hidden="true" />
          <div>
            <strong>Weather is temporarily unavailable</strong>
            <p>The rest of BetterMC remains available. Try the forecast again.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setState({ status: "loading" });
              setAttempt((value) => value + 1);
            }}
          >
            <RefreshCw aria-hidden="true" /> Retry
          </button>
        </div>
      </section>
    );
  }

  const { current, current_units: units, hourly, hourly_units: hourlyUnits } =
    state.data;
  const hourlySamples = hourly.time
    .map((time, index) => ({
      time,
      temperature: hourly.temperature_2m[index],
      rain: hourly.precipitation_probability[index],
      code: hourly.weather_code[index],
      wind: hourly.wind_speed_10m[index],
    }))
    .filter((_, index) => index % 3 === 0);
  const currentTimestamp = localDate(current.time).getTime();
  const activeHourIndex = hourlySamples.reduce(
    (activeIndex, hour, index) =>
      localDate(hour.time).getTime() <= currentTimestamp ? index : activeIndex,
    0,
  );
  const selectedHour =
    hourlySamples.find((hour) => hour.time === selectedHourTime) ??
    hourlySamples[activeHourIndex];

  return (
    <section className="section container weather-section" aria-labelledby="weather-title">
      <div className="weather-heading">
        <div>
          <span className="eyebrow">Malaybalay weather</span>
          <h2 id="weather-title">Current conditions and the next 24 hours</h2>
        </div>
        <span className="weather-updated">Updated {formatUpdated(current.time)} · Malaybalay time</span>
      </div>

      <div className="weather-layout">
        <article className="weather-current">
          <span className="weather-current-icon"><WeatherIcon code={current.weather_code} /></span>
          <div className="weather-temperature">
            <strong>{Math.round(current.temperature_2m)}°</strong>
            <span>{units.temperature_2m.replace("°", "")}</span>
          </div>
          <div className="weather-condition">
            <h3>{weatherCondition(current.weather_code)}</h3>
            <p>Feels like {Math.round(current.apparent_temperature)}{units.apparent_temperature}</p>
          </div>
          <dl>
            <div><dt><Droplets aria-hidden="true" /> Humidity</dt><dd>{current.relative_humidity_2m}{units.relative_humidity_2m}</dd></div>
            <div><dt><CloudRain aria-hidden="true" /> Rain now</dt><dd>{current.precipitation}{units.precipitation}</dd></div>
            <div><dt><Wind aria-hidden="true" /> Wind</dt><dd>{Math.round(current.wind_speed_10m)} {units.wind_speed_10m}</dd></div>
          </dl>
        </article>

        <article className="weather-outlook">
          <span>What to expect</span>
          <h3>{summary?.outlook}</h3>
          <p>
            Temperatures are forecast between <strong>{summary?.low}°C</strong> and <strong>{summary?.high}°C</strong>. The highest modeled rain chance is <strong>{summary?.peakRain}%</strong> around <strong>{summary?.peakRainTime}</strong>.
          </p>
          <small>Forecast values are model-based and may change as new data arrives.</small>
        </article>
      </div>

      <div className="weather-hourly" aria-label="Three-hour weather forecast intervals">
        {hourlySamples.map((hour, index) => {
          const isCurrent = index === activeHourIndex;
          const isSelected = hour.time === selectedHour.time;
          return (
            <button
              type="button"
              key={hour.time}
              className={`${isCurrent ? "is-current " : ""}${isSelected ? "is-selected" : ""}`.trim()}
              aria-current={isCurrent ? "time" : undefined}
              aria-pressed={isSelected}
              aria-label={`${formatHour(hour.time)} forecast: ${weatherCondition(hour.code)}, ${Math.round(hour.temperature)}${hourlyUnits.temperature_2m}, ${hour.rain}${hourlyUnits.precipitation_probability} chance of rain, wind ${Math.round(hour.wind)} ${hourlyUnits.wind_speed_10m}${isCurrent ? ", current hour" : ""}`}
              onClick={() => setSelectedHourTime(hour.time)}
            >
              <time dateTime={hour.time}>{formatHour(hour.time)}</time>
              {isCurrent && <em className="weather-hour-badge">Now</em>}
              <WeatherIcon code={hour.code} />
              <strong>{Math.round(hour.temperature)}{hourlyUnits.temperature_2m}</strong>
              <span><Droplets aria-hidden="true" /> {hour.rain}{hourlyUnits.precipitation_probability}</span>
              <small>{Math.round(hour.wind)} {hourlyUnits.wind_speed_10m}</small>
            </button>
          );
        })}
      </div>

      <div className="weather-selected-detail" role="status" aria-live="polite">
        <Clock3 aria-hidden="true" />
        <div>
          <span>{selectedHour.time === hourlySamples[activeHourIndex].time ? "Current-hour details" : "Selected forecast"}</span>
          <strong>{formatHour(selectedHour.time)} · {weatherCondition(selectedHour.code)}</strong>
        </div>
        <dl>
          <div><dt>Temperature</dt><dd>{Math.round(selectedHour.temperature)}{hourlyUnits.temperature_2m}</dd></div>
          <div><dt>Rain chance</dt><dd>{selectedHour.rain}{hourlyUnits.precipitation_probability}</dd></div>
          <div><dt>Wind</dt><dd>{Math.round(selectedHour.wind)} {hourlyUnits.wind_speed_10m}</dd></div>
        </dl>
      </div>

      <p className="weather-source">
        Open-Meteo model forecast for Malaybalay City at 8.1575° N, 125.12778° E—not an official severe-weather warning.
        <a href="https://open-meteo.com/en/docs" target="_blank" rel="noreferrer">
          Forecast methodology <ExternalLink aria-hidden="true" />
        </a>
      </p>
    </section>
  );
}
