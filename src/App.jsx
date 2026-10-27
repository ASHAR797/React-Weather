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
  const [city, setCity] = useState("london"); 
  const [error, seterror] = useState(null)



  useEffect(() => {
    async function fetchapi() {
      const apiKey = import.meta.env.VITE_WEATHER_KEY;
      const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;
      try {
        setLoading(true)
        seterror(null)
         const [currentRes, forecastRes] = await Promise.all([
          fetch(currentWeatherUrl),
          fetch(forecastUrl)
        ]);
        if (!currentRes.ok || !forecastRes.ok) {
          throw new Error(`HTTP error! status: ${currentRes.status}`);
        }
        const [currentData, forecastData] = await Promise.all([
          currentRes.json(),
          forecastRes.json()
        ]);
      
          // Combine into one state object
        setWeatherdata({
          current: currentData,
          forecast: forecastData
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
    if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  console.log(Weatherdata);
  const current = Weatherdata.current
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
              placeholder="Search city, country..."
              aria-label="Search city or country"
            />
          </div>

          <div className="header-datetime">
            <span className="header-date">Sun, 26 Oct 2025</span>
            <span className="header-time"></span>
            <span className="status-dot" />
          </div>
        </header>

        {/* Main Weather Overview */}
        <section className="weather-overview">
          <article className="weather-hero">
            <div className="hero-image" />

            <div className="hero-content">
              <span className="section-eyebrow">CURRENT WEATHER</span>

              <h1 className="hero-city">New york</h1>

              <div className="hero-location">
                <span>New york, United States</span>
                <span className="location-separator">•</span>
                <span>US</span>
                <MapPin size={17} />
              </div>

              <div className="hero-condition">
                <Cloud size={76} strokeWidth={1.8} />
                <div>
                  <span>{(current.weather[0].description).toUpperCase()}</span>
                  <span className="violet-underline" />
                </div>
              </div>

              <div className="hero-temperature">
                <span className="temperature-value">17</span>
                <span className="temperature-unit">°C</span>
              </div>

              <p className="hero-feels-like">
                Feels like <strong>{current.main.feels_like}°C</strong>
              </p>
            </div>

            <div className="hero-weather-tag">
              <span>CLOUDS</span>
              <span>OVER</span>
              <span>{current.name}</span>
              <span className="tag-line" />
            </div>
          </article>

          {/* Current Conditions */}
          <article className="condition-panel">
            <h2 className="panel-heading">WEATHER CONDITION</h2>

            <Cloud className="condition-icon" size={82} strokeWidth={1.8} />

            <h3 className="condition-title">{current.weather[0].description}</h3>

            <p className="condition-description">
              Mostly cloudy skies with high humidity. Expect cool and calm
              conditions throughout the day.
            </p>
          </article>

          {/* Sunrise and Sunset */}
          <article className="sun-panel">
            <h2 className="panel-heading">SUN</h2>

            <div className="sun-event">
              <Sunrise size={36} strokeWidth={1.5} />

              <div className="sun-event-info">
                <span className="sun-event-label">Sunrise</span>
                <strong>{formatTime(current.sys.sunrise, current.timezone)}</strong>
                <span className="sun-timezone">{formatUTC(current.timezone)}</span>
              </div>
            </div>

            <div className="sun-event">
              <Sunset size={36} strokeWidth={1.5} />

              <div className="sun-event-info">
                <span className="sun-event-label">Sunset</span>
                <strong>{formatTime(current.sys.sunset, current.timezone)}</strong>
                <span className="sun-timezone">{formatUTC(current.timezone)}</span>
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
              {current.main.temp_min}°C <span>|</span> {current.main.temp_max}°C
            </p>
          </article>

          <article className="metric-card">
            <div className="metric-heading">
              <UserRound size={27} />
              <span>FEELS LIKE</span>
            </div>

            <strong className="metric-value">{current.main.feels_like}°C</strong>

            <p className="metric-description">Feels cooler</p>
          </article>

          <article className="metric-card">
            <div className="metric-heading">
              <Droplet size={27} />
              <span>HUMIDITY</span>
            </div>

            <strong className="metric-value">{current.main.humidity}%</strong>

            <p className="metric-description">Very high</p>
          </article>

          <article className="metric-card">
            <div className="metric-heading">
              <Gauge size={27} />
              <span>PRESSURE</span>
            </div>

            <strong className="metric-value">
              {current.main.pressure} <small>hPa</small>
            </strong>

            <p className="metric-description">Sea level: {current.main.sea_level} hPa</p>
          </article>

          <article className="metric-card">
            <div className="metric-heading">
              <Eye size={29} />
              <span>VISIBILITY</span>
            </div>

            <strong className="metric-value">
              {current?.visibility ? (current.visibility / 1000).toFixed(1) : 'N/A'} <small>km</small>
            </strong>

            <p className="metric-description">Good visibility</p>
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
                    5.12 <small>m/s</small>
                  </strong>
                  <span>Speed</span>
                </div>

                <div className="wind-stat">
                  <strong>284°</strong>
                  <span>Direction (WNW)</span>
                </div>

                <div className="wind-stat">
                  <strong>
                    12.24 <small>m/s</small>
                  </strong>
                  <span>Gust</span>
                </div>
              </div>

              <div
                className="wind-compass"
                role="img"
                aria-label="Wind direction compass pointing west-northwest"
              >
                <span className="compass-label compass-n">N</span>
                <span className="compass-label compass-e">E</span>
                <span className="compass-label compass-s">S</span>
                <span className="compass-label compass-w">W</span>

                <div className="compass-circle">
                  <span className="compass-needle" />
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
              <h3>New york</h3>
              <p>United States</p>

              <div className="coordinates">
                <span>40.7128° N</span>
                <span>-74.0060° E</span>
              </div>

              <div className="location-divider">
                <span />
              </div>

              <span className="timezone-label">Timezone</span>
              <p className="timezone-value">America/New_York (UTC-5)</p>
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
              <strong>stations</strong>
            </div>

            <div className="api-detail-row">
              <span>Clouds</span>
              <strong>100%</strong>
            </div>

            <div className="api-detail-row">
              <span>Visibility</span>
              <strong>10.0 km</strong>
            </div>

            <div className="api-detail-row">
              <span>Rain</span>
              <strong>—</strong>
            </div>

            <div className="api-detail-row">
              <span>Snow</span>
              <strong>—</strong>
            </div>
          </article>

          {/* Map Preview */}
          <article className="map-panel">
            <div className="map-background" />

            <div className="map-marker">
              <MapPin size={34} fill="currentColor" />
            </div>

            <div className="map-information">
              <strong>New york</strong>
              <span>US</span>
            </div>

            <a
              className="map-link"
              href="#"
              aria-label="View New York on a map"
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
            <article className="forecast-day">
              <div className="forecast-date">
                <strong>Mon</strong>
                <span>26 Oct</span>
              </div>

              <Cloud size={39} strokeWidth={1.7} />

              <div className="forecast-condition">
                <span>Cloudy</span>
                <strong>14° / 18°</strong>
              </div>
            </article>

            <article className="forecast-day">
              <div className="forecast-date">
                <strong>Tue</strong>
                <span>27 Oct</span>
              </div>

              <CloudRain size={39} strokeWidth={1.7} />

              <div className="forecast-condition">
                <span>Light Rain</span>
                <strong>13° / 17°</strong>
              </div>
            </article>

            <article className="forecast-day">
              <div className="forecast-date">
                <strong>Wed</strong>
                <span>28 Oct</span>
              </div>

              <CloudSun size={39} strokeWidth={1.7} />

              <div className="forecast-condition">
                <span>Partly Cloudy</span>
                <strong>12° / 16°</strong>
              </div>
            </article>

            <article className="forecast-day">
              <div className="forecast-date">
                <strong>Thu</strong>
                <span>29 Oct</span>
              </div>

              <Cloud size={39} strokeWidth={1.7} />

              <div className="forecast-condition">
                <span>Cloudy</span>
                <strong>13° / 17°</strong>
              </div>
            </article>

            <article className="forecast-day">
              <div className="forecast-date">
                <strong>Fri</strong>
                <span>30 Oct</span>
              </div>

              <Sun size={39} strokeWidth={1.7} />

              <div className="forecast-condition">
                <span>Sunny</span>
                <strong>14° / 19°</strong>
              </div>
            </article>

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
