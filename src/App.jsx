import { useEffect, useState } from "react";
import {
  Search,
  MapPin,
  Cloud,
  Sun,
  Sunrise,
  Sunset,
  Thermometer,
  UserRound,
  Droplet,
  Gauge,
  Eye,
  Wind,
  ArrowRight,
  CloudRain,
  CloudSun,
  Navigation,
  Clock3,
} from "lucide-react";

import "./App.css";

/* ---------- NEW: pure helper functions (outside the component) ---------- */

// "clear sky" -> "Clear Sky"
const capitalize = (text = "") => text.replace(/\b\w/g, (c) => c.toUpperCase());

// OpenWeather condition id -> lucide icon
const getWeatherIcon = (id) => {
  if (id >= 200 && id < 600) return CloudRain; // thunderstorm, drizzle, rain
  if (id === 800) return Sun; // clear
  if (id === 801 || id === 802) return CloudSun; // few / scattered clouds
  return Cloud; // broken, overcast, mist, snow, etc.
};

// degrees -> "N", "NNE", "WNW" ...
const getWindDirection = (deg) => {
  const dirs = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  return dirs[Math.round(deg / 22.5) % 16];
};

const getHumidityLabel = (h) =>
  h >= 80 ? "Very high" : h >= 60 ? "High" : h >= 30 ? "Comfortable" : "Low";

const getVisibilityLabel = (v) =>
  v >= 10000
    ? "Good visibility"
    : v >= 4000
      ? "Moderate visibility"
      : "Poor visibility";

const getFeelsLikeLabel = (feels, temp) =>
  feels < temp
    ? "Feels cooler"
    : feels > temp
      ? "Feels warmer"
      : "Same as actual";

// Groups the 3-hour forecast list into daily cards (min / max + midday condition)
const getDailyForecast = (list, tz, current) => {
  const todayKey = new Date((current.dt + tz) * 1000)
    .toISOString()
    .slice(0, 10);
  const days = {};

  list.forEach((item) => {
    const local = new Date((item.dt + tz) * 1000);
    const key = local.toISOString().slice(0, 10);
    if (!days[key]) days[key] = { key, date: local, temps: [], items: [] };
    days[key].temps.push(item.main.temp_min, item.main.temp_max);
    days[key].items.push({ item, hour: local.getUTCHours() });
  });

  return Object.values(days)
    .slice(0, 5)
    .map((day) => {
      // for today, also count the real current temperatures
      if (day.key === todayKey) {
        day.temps.push(current.main.temp_min, current.main.temp_max);
      }
      // pick the entry closest to midday for the icon + label
      const best = day.items.reduce((a, b) =>
        Math.abs(b.hour - 12) < Math.abs(a.hour - 12) ? b : a,
      ).item;

      return {
        key: day.key,
        weekday: day.date.toLocaleDateString("en-GB", {
          weekday: "short",
          timeZone: "UTC",
        }),
        date: day.date.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          timeZone: "UTC",
        }),
        id: best.weather[0].id,
        label: capitalize(best.weather[0].description),
        min: Math.round(Math.min(...day.temps)),
        max: Math.round(Math.max(...day.temps)),
      };
    });
};

const Weatherapp = () => {
  //  Helper Function's
  const formatTime = (unix, tzOffset) =>
    new Date((unix + tzOffset) * 1000).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC", // the offset is already added, so read it as UTC
    });

  const formatUTC = (tzOffset) => {
    const h = tzOffset / 3600;
    return `(UTC${h >= 0 ? "+" : ""}${h})`;
  };

  const [Weatherdata, setWeatherdata] = useState();
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState("New york");
  const [error, seterror] = useState(null);
  const [search, setSearch] = useState("");
  const handleSearch = () => {
    const value = search.trim();
    if (value) setCity(value);
  };

  useEffect(() => {
    async function fetchapi() {
      const apiKey = import.meta.env.VITE_WEATHER_KEY;
      const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;
      try {
        setLoading(true);
        seterror(null);
        const [currentRes, forecastRes] = await Promise.all([
          fetch(currentWeatherUrl),
          fetch(forecastUrl),
        ]);
        if (!currentRes.ok || !forecastRes.ok) {
          throw new Error(`HTTP error! status: ${currentRes.status}`);
        }
        const [currentData, forecastData] = await Promise.all([
          currentRes.json(),
          forecastRes.json(),
        ]);

        // Combine into one state object
        setWeatherdata({
          current: currentData,
          forecast: forecastData,
        });
      } catch (err) {
        console.log(err.message);
        seterror(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchapi();
  }, [city]);

  if (loading)
    return (
      <div className="loading-container">
        <h2 className="loading-text">Loading</h2>
        <div className="loading-animation"></div>
      </div>
    );
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

  const current = Weatherdata.current;
  const forcast = Weatherdata.forecast;

  /* ---------- NEW: values computed from the API data ---------- */
  const w = current.weather[0];
  const HeroIcon = getWeatherIcon(w.id);

  const countryName =
    new Intl.DisplayNames(["en"], { type: "region" }).of(current.sys.country) ??
    current.sys.country;

  const { lat, lon } = current.coord;
  const latLabel = `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? "N" : "S"}`;
  const lonLabel = `${Math.abs(lon).toFixed(4)}° ${lon >= 0 ? "E" : "W"}`;

  const windDeg = current.wind.deg ?? 0;
  const windGust = current.wind.gust;

  const rainMm = current.rain?.["1h"] ?? current.rain?.["3h"];
  const snowMm = current.snow?.["1h"] ?? current.snow?.["3h"];

  const localNow = new Date((current.dt + current.timezone) * 1000);
  const headerDate = localNow.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

  const dailyForecast = getDailyForecast(
    forcast.list,
    forcast.city.timezone,
    current,
  );

  const mapUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=11/${lat}/${lon}`;

  return (
    <>
      <main className="weather-dashboard">
        {/* Header */}
        <header className="weather-header">
          <a className="brand" href="#">
            <span className="brand-mark">
              <span />
              <span />
            </span>
            <span className="brand-name">REACT WEATHER</span>
          </a>

          <div className="city-search">
            <Search size={26} strokeWidth={1.8} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search city, country..."
              aria-label="Search city or country"
            />
          </div>

          <div className="header-datetime">
            <span className="header-date">{headerDate}</span>
            <span className="header-time">
              {formatTime(current.dt, current.timezone)}
            </span>
            <span className="status-dot" />
          </div>
        </header>

        {/* Main Weather Overview */}
        <section className="weather-overview">
          <article className="weather-hero">
            <div className="hero-image" />

            <div className="hero-content">
              <span className="section-eyebrow">CURRENT WEATHER</span>

              <h1 className="hero-city">{current.name}</h1>

              <div className="hero-location">
                <span>
                  {current.name}, {countryName}
                </span>
                <span className="location-separator">•</span>
                <span>{current.sys.country}</span>
                <MapPin size={17} />
              </div>

              <div className="hero-condition">
                <HeroIcon size={76} strokeWidth={1.8} />
                <div>
                  <span>{w.description.toUpperCase()}</span>
                  <span className="violet-underline" />
                </div>
              </div>

              <div className="hero-temperature">
                <span className="temperature-value">
                  {Math.round(current.main.temp)}
                </span>
                <span className="temperature-unit">°C</span>
              </div>

              <p className="hero-feels-like">
                Feels like <strong>{current.main.feels_like}°C</strong>
              </p>
            </div>

            <div className="hero-weather-tag">
              <span>{w.main.toUpperCase()}</span>
              <span>OVER</span>
              <span>{current.name.toUpperCase()}</span>
              <span className="tag-line" />
            </div>
          </article>

          {/* Current Conditions */}
          <article className="condition-panel">
            <h2 className="panel-heading">WEATHER CONDITION</h2>

            <HeroIcon className="condition-icon" size={82} strokeWidth={1.8} />

            <h3 className="condition-title">{capitalize(w.description)}</h3>

            <p className="condition-description">
              {capitalize(w.description)} with {current.main.humidity}%
              humidity. Wind at {current.wind.speed} m/s from the{" "}
              {getWindDirection(windDeg)}.
            </p>
          </article>

          {/* Sunrise and Sunset */}
          <article className="sun-panel">
            <h2 className="panel-heading">SUN</h2>

            <div className="sun-event">
              <Sunrise size={36} strokeWidth={1.5} />

              <div className="sun-event-info">
                <span className="sun-event-label">Sunrise</span>
                <strong>
                  {formatTime(current.sys.sunrise, current.timezone)}
                </strong>
                <span className="sun-timezone">
                  {formatUTC(current.timezone)}
                </span>
              </div>
            </div>

            <div className="sun-event">
              <Sunset size={36} strokeWidth={1.5} />

              <div className="sun-event-info">
                <span className="sun-event-label">Sunset</span>
                <strong>
                  {formatTime(current.sys.sunset, current.timezone)}
                </strong>
                <span className="sun-timezone">
                  {formatUTC(current.timezone)}
                </span>
              </div>
            </div>
          </article>
        </section>

        {/* Primary Weather Metrics */}
        <section className="weather-metrics">
          <article className="metric-card">
            <div className="metric-heading">
              <Thermometer size={27} />
              <span>TEMPERATURE</span>
            </div>

            <strong className="metric-value">{current.main.temp}°C</strong>

            <p className="metric-description">
              Min {current.main.temp_min}° <span>|</span> Max{" "}
              {current.main.temp_max}°
            </p>
          </article>

          <article className="metric-card">
            <div className="metric-heading">
              <UserRound size={27} />
              <span>FEELS LIKE</span>
            </div>

            <strong className="metric-value">
              {current.main.feels_like}°C
            </strong>

            <p className="metric-description">
              {getFeelsLikeLabel(current.main.feels_like, current.main.temp)}
            </p>
          </article>

          <article className="metric-card">
            <div className="metric-heading">
              <Droplet size={27} />
              <span>HUMIDITY</span>
            </div>

            <strong className="metric-value">{current.main.humidity}%</strong>

            <p className="metric-description">
              {getHumidityLabel(current.main.humidity)}
            </p>
          </article>

          <article className="metric-card">
            <div className="metric-heading">
              <Gauge size={27} />
              <span>PRESSURE</span>
            </div>

            <strong className="metric-value">
              {current.main.pressure} <small>hPa</small>
            </strong>

            <p className="metric-description">
              Sea level: {current.main.sea_level ?? current.main.pressure} hPa
            </p>
          </article>

          <article className="metric-card">
            <div className="metric-heading">
              <Eye size={29} />
              <span>VISIBILITY</span>
            </div>

            <strong className="metric-value">
              {current?.visibility
                ? (current.visibility / 1000).toFixed(1)
                : "N/A"}{" "}
              <small>km</small>
            </strong>

            <p className="metric-description">
              {getVisibilityLabel(current.visibility)}
            </p>
          </article>
        </section>

        {/* Detailed Weather Analysis */}
        <section className="weather-details-grid">
          {/* Wind */}
          <article className="detail-panel wind-panel">
            <div className="panel-title-row">
              <Wind size={27} />
              <h2 className="panel-heading">WIND</h2>
            </div>

            <div className="wind-content">
              <div className="wind-statistics">
                <div className="wind-stat">
                  <strong>
                    {current.wind.speed} <small>m/s</small>
                  </strong>
                  <span>Speed</span>
                </div>

                <div className="wind-stat">
                  <strong>{windDeg}°</strong>
                  <span>Direction ({getWindDirection(windDeg)})</span>
                </div>

                <div className="wind-stat">
                  <strong>
                    {windGust ?? "—"} <small>m/s</small>
                  </strong>
                  <span>Gust</span>
                </div>
              </div>

              <div
                className="wind-compass"
                role="img"
                aria-label={`Wind direction compass pointing ${getWindDirection(windDeg)}`}
              >
                <span className="compass-label compass-n">N</span>
                <span className="compass-label compass-e">E</span>
                <span className="compass-label compass-s">S</span>
                <span className="compass-label compass-w">W</span>

                <div className="compass-circle">
                  <span
                    className="compass-needle"
                    style={{ "--wind-deg": `${windDeg}deg` }}
                  />
                  <span className="compass-center" />
                </div>
              </div>
            </div>
          </article>

          {/* Location */}
          <article className="detail-panel location-panel">
            <div className="panel-title-row">
              <MapPin size={25} />
              <h2 className="panel-heading">LOCATION</h2>
            </div>

            <div className="location-information">
              <h3>{current.name}</h3>
              <p>{countryName}</p>

              <div className="coordinates">
                <span>{latLabel}</span>
                <span>{lonLabel}</span>
              </div>

              <div className="location-divider">
                <span />
              </div>

              <span className="timezone-label">Timezone</span>
              <p className="timezone-value">{formatUTC(current.timezone)}</p>
            </div>
          </article>

          {/* Additional API Information */}
          <article className="detail-panel api-details-panel">
            <div className="panel-title-row">
              <Cloud size={28} />
              <h2 className="panel-heading">WEATHER DETAILS</h2>
            </div>

            <div className="api-detail-row">
              <span>Base</span>
              <strong>{current.base}</strong>
            </div>

            <div className="api-detail-row">
              <span>Clouds</span>
              <strong>{current.clouds.all}%</strong>
            </div>

            <div className="api-detail-row">
              <span>Visibility</span>
              <strong>
                {current.visibility
                  ? (current.visibility / 1000).toFixed(1)
                  : "N/A"}{" "}
                km
              </strong>
            </div>

            <div className="api-detail-row">
              <span>Rain</span>
              <strong>{rainMm ? `${rainMm} mm` : "—"}</strong>
            </div>

            <div className="api-detail-row">
              <span>Snow</span>
              <strong>{snowMm ? `${snowMm} mm` : "—"}</strong>
            </div>
          </article>

          {/* Map Preview */}
          <article className="map-panel">
            <div className="map-background" />

            <div className="map-information">
              <strong>{current.name}</strong>
              <span>{current.sys.country}</span>
            </div>

            <a
              className="map-link"
              href={mapUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`View ${current.name} on a map`}
            >
              <ArrowRight size={20} />
              <span>View on map</span>
            </a>
          </article>
        </section>

        {/* Five-Day Forecast */}
        <section className="forecast-panel">
          <div className="forecast-header">
            <h2 className="panel-heading">
              5 DAY FORECAST <span>(PREVIEW)</span>
            </h2>
          </div>

          <div className="forecast-content">
            {dailyForecast.map((day) => {
              const DayIcon = getWeatherIcon(day.id);
              return (
                <article className="forecast-day" key={day.key}>
                  <div className="forecast-date">
                    <strong>{day.weekday}</strong>
                    <span>{day.date}</span>
                  </div>

                  <DayIcon size={39} strokeWidth={1.7} />

                  <div className="forecast-condition">
                    <span>{day.label}</span>
                    <strong>
                      {day.min}° / {day.max}°
                    </strong>
                  </div>
                </article>
              );
            })}

            <a className="forecast-more" href="#">
              <span className="forecast-more-mark" />
              <span>MORE FORECAST DETAILS</span>
              <ArrowRight size={20} />
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="weather-footer">
          <span className="footer-brand">WEATHER ANALYZER</span>

          <span className="footer-rule" />

          <p className="footer-tagline">
            REAL DATA. &nbsp; GLOBAL CITIES. &nbsp; BETTER DECISIONS.
          </p>

          <span className="footer-accent" />
        </footer>
      </main>
    </>
  );
};

export default Weatherapp;
