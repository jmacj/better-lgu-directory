import { fireEvent, render, screen } from "@testing-library/react";
import WeatherPanel from "./WeatherPanel";

const forecast = {
  timezone: "Asia/Manila",
  current: {
    time: "2026-11-07T01:00",
    temperature_2m: 20,
    apparent_temperature: 23.1,
    relative_humidity_2m: 93,
    precipitation: 0,
    weather_code: 1,
    wind_speed_10m: 1.4,
  },
  current_units: {
    temperature_2m: "°C",
    apparent_temperature: "°C",
    relative_humidity_2m: "%",
    precipitation: "mm",
    wind_speed_10m: "km/h",
  },
  hourly: {
    time: Array.from({ length: 24 }, (_, index) =>
      `2026-11-07T${String(index + 1).padStart(2, "0")}:00`,
    ),
    temperature_2m: Array.from({ length: 24 }, (_, index) => 20 + index / 4),
    precipitation_probability: Array.from(
      { length: 24 },
      (_, index) => (index === 11 ? 75 : 20),
    ),
    weather_code: Array.from({ length: 24 }, () => 2),
    wind_speed_10m: Array.from({ length: 24 }, () => 4),
  },
  hourly_units: {
    temperature_2m: "°C",
    precipitation_probability: "%",
    wind_speed_10m: "km/h",
  },
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Malaybalay weather", () => {
  it("renders current conditions and a complete 24-hour outlook", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => forecast,
      }),
    );

    render(<WeatherPanel />);
    expect(
      screen.getByLabelText(/Loading Malaybalay weather/i),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", {
        name: /Current conditions and the next 24 hours/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Mainly clear")).toBeInTheDocument();
    expect(screen.getByText(/Rain is likely/i)).toBeInTheDocument();
    expect(screen.getAllByText(/km\/h/i).length).toBeGreaterThan(1);
    const forecastRail = screen.getByLabelText(
      /Three-hour weather forecast intervals/i,
    );
    expect(forecastRail.children).toHaveLength(8);
    const currentHour = screen.getByRole("button", {
      name: /1 AM forecast.*current hour/i,
    });
    expect(currentHour).toHaveAttribute("aria-current", "time");
    expect(currentHour).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Now")).toBeInTheDocument();

    const laterHour = screen.getByRole("button", {
      name: /4 AM forecast/i,
    });
    fireEvent.click(laterHour);
    expect(laterHour).toHaveAttribute("aria-pressed", "true");
    expect(currentHour).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText("Selected forecast")).toBeInTheDocument();
    expect(screen.getByText(/4 AM · Partly cloudy/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Forecast methodology/i }),
    ).toHaveAttribute("href", "https://open-meteo.com/en/docs");
  });

  it("shows a recoverable error when the forecast service is unavailable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 503 }),
    );

    render(<WeatherPanel />);
    expect(
      await screen.findByText(/Weather is temporarily unavailable/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Retry/i })).toBeInTheDocument();
  });
});
