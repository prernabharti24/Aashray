import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MapPin,
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  CloudSnow,
  CloudFog,
  RefreshCw,
  Droplets,
  Wind,
  ChevronDown,
  Navigation,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useShelter } from '../../context/ShelterContext';

interface WeatherData {
  city: string;
  state: string;
  compactLocation: string;
  fullLocation: string;
  temperature: number | null;
  apparentTemperature: number | null;
  weatherCode: number | null;
  isDay: boolean;
  humidity: number | null;
  windSpeed: number | null;
  isLive: boolean;
  lastUpdated: Date | null;
  coords: { lat: number; lon: number };
}

interface FallbackClimateInfo {
  city: string;
  state: string;
  region: string;
  lat: number;
  lon: number;
}

const STATE_ABBRS: Record<string, string> = {
  'Madhya Pradesh': 'MP',
  'Uttar Pradesh': 'UP',
  'Himachal Pradesh': 'HP',
  'Andhra Pradesh': 'AP',
  'Arunachal Pradesh': 'AR',
  'Tamil Nadu': 'TN',
  'West Bengal': 'WB',
  'Jammu and Kashmir': 'J&K',
  'Ladakh': 'Ladakh',
  'Rajasthan': 'RJ',
  'Maharashtra': 'MH',
  'Gujarat': 'GJ',
  'Karnataka': 'KA',
  'Kerala': 'KL',
  'Punjab': 'PB',
  'Haryana': 'HR',
  'Delhi': 'Delhi',
  'National Capital Territory of Delhi': 'NCR',
  'Uttarakhand': 'UK',
  'Bihar': 'BR',
  'Assam': 'AS',
  'Meghalaya': 'ML',
  'Goa': 'GA',
  'Odisha': 'OD',
  'Telangana': 'TS',
  'Chhattisgarh': 'CG',
  'Jharkhand': 'JH',
  'Chandigarh': 'CH',
  'Puducherry': 'PY',
};

const CLIMATE_COORDS: Record<string, FallbackClimateInfo> = {
  ladakh: {
    city: 'Leh',
    state: 'Ladakh',
    region: 'Northern Himalayas, India',
    lat: 34.1526,
    lon: 77.5771,
  },
  dras: {
    city: 'Dras',
    state: 'Ladakh',
    region: 'Kargil, Ladakh',
    lat: 34.4293,
    lon: 75.7594,
  },
  jaisalmer: {
    city: 'Jaisalmer',
    state: 'Rajasthan',
    region: 'Thar Desert, Rajasthan',
    lat: 26.9157,
    lon: 70.9083,
  },
  delhi: {
    city: 'New Delhi',
    state: 'Delhi',
    region: 'Northern Plains, India',
    lat: 28.6139,
    lon: 77.2090,
  },
  shillong: {
    city: 'Shillong',
    state: 'Meghalaya',
    region: 'North East, India',
    lat: 25.5788,
    lon: 91.8933,
  },
};

function formatStateAbbr(state: string): string {
  if (!state) return '';
  return STATE_ABBRS[state] || (state.length > 12 ? state.slice(0, 10) + '…' : state);
}

function getWeatherDetails(code: number | null, isDay = true) {
  if (code === null || code === undefined) {
    return { condition: 'Clear', Icon: Sun, color: 'text-amber-500' };
  }
  switch (code) {
    case 0:
      return { condition: isDay ? 'Sunny' : 'Clear Sky', Icon: Sun, color: 'text-amber-500' };
    case 1:
      return { condition: isDay ? 'Mainly Sunny' : 'Mainly Clear', Icon: CloudSun, color: 'text-amber-500' };
    case 2:
      return { condition: 'Partly Cloudy', Icon: CloudSun, color: 'text-amber-500' };
    case 3:
      return { condition: 'Overcast', Icon: Cloud, color: 'text-slate-500' };
    case 45:
    case 48:
      return { condition: 'Foggy', Icon: CloudFog, color: 'text-slate-400' };
    case 51:
    case 53:
    case 55:
      return { condition: 'Light Drizzle', Icon: CloudDrizzle, color: 'text-sky-500' };
    case 56:
    case 57:
      return { condition: 'Freezing Drizzle', Icon: CloudDrizzle, color: 'text-sky-400' };
    case 61:
    case 63:
      return { condition: 'Rainy', Icon: CloudRain, color: 'text-blue-500' };
    case 65:
      return { condition: 'Heavy Rain', Icon: CloudRain, color: 'text-blue-600' };
    case 66:
    case 67:
      return { condition: 'Freezing Rain', Icon: CloudRain, color: 'text-indigo-400' };
    case 71:
    case 73:
    case 75:
    case 77:
      return { condition: 'Snowfall', Icon: CloudSnow, color: 'text-sky-300' };
    case 80:
    case 81:
    case 82:
      return { condition: 'Rain Showers', Icon: CloudRain, color: 'text-blue-500' };
    case 85:
    case 86:
      return { condition: 'Snow Showers', Icon: CloudSnow, color: 'text-sky-300' };
    case 95:
      return { condition: 'Thunderstorm', Icon: CloudLightning, color: 'text-amber-600' };
    case 96:
    case 99:
      return { condition: 'Hailstorm', Icon: CloudLightning, color: 'text-purple-500' };
    default:
      return { condition: 'Clear', Icon: Sun, color: 'text-amber-500' };
  }
}

async function reverseGeocodeCoords(lat: number, lon: number): Promise<{ city: string; state: string; full: string }> {
  // 1. Primary: BigDataCloud client API (free, reliable, CORS enabled, no API key needed)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      const city = data.city || data.locality || data.principalSubdivision || '';
      const state = data.principalSubdivision || '';
      const country = data.countryName || '';
      if (city || state) {
        const full = [city, state, country].filter(Boolean).join(', ');
        return { city: city || state, state, full };
      }
    }
  } catch {
    // Continue to next fallback
  }

  // 2. Secondary: Nominatim OpenStreetMap
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=12&addressdetails=1`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const city = addr.city || addr.town || addr.village || addr.municipality || addr.county || '';
      const state = addr.state || '';
      const country = addr.country || '';
      if (city || state) {
        const full = [city, state, country].filter(Boolean).join(', ');
        return { city: city || state, state, full };
      }
    }
  } catch {
    // Continue
  }

  // 3. Fallback to coordinate representation
  return {
    city: `${lat.toFixed(2)}°N`,
    state: `${lon.toFixed(2)}°E`,
    full: `Coordinates: ${lat.toFixed(3)}°N, ${lon.toFixed(3)}°E`,
  };
}

export const LiveWeatherIndicator: React.FC = () => {
  const { currentDesign, climates } = useShelter();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  
  const [weatherData, setWeatherData] = useState<WeatherData>({
    city: 'Detecting...',
    state: '',
    compactLocation: 'Locating...',
    fullLocation: 'Locating current area...',
    temperature: null,
    apparentTemperature: null,
    weatherCode: null,
    isDay: true,
    humidity: null,
    windSpeed: null,
    isLive: false,
    lastUpdated: null,
    coords: { lat: 34.1526, lon: 77.5771 },
  });

  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close dropdown on outside click or escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Determine active project fallback location
  const getProjectFallback = useCallback((): FallbackClimateInfo => {
    const locId = currentDesign?.location_id || 'ladakh';
    if (CLIMATE_COORDS[locId]) {
      return CLIMATE_COORDS[locId];
    }
    const matchedClimate = climates?.find(c => c.id === locId);
    if (matchedClimate) {
      return {
        city: matchedClimate.name.split(' ')[0] || 'Project Site',
        state: matchedClimate.region.split(',')[0] || '',
        region: matchedClimate.region,
        lat: matchedClimate.latitude || 28.6139,
        lon: 77.2090,
      };
    }
    return CLIMATE_COORDS.ladakh;
  }, [currentDesign?.location_id, climates]);

  // Fetch Open-Meteo weather data
  const fetchOpenMeteo = async (lat: number, lon: number) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&timezone=auto`;
    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) throw new Error(`Weather API HTTP error ${res.status}`);
      const json = await res.json();
      return json.current;
    } catch (err) {
      clearTimeout(timeout);
      throw err;
    }
  };

  // Main loader: attempts browser Geolocation first, falls back gracefully to project location
  const loadWeatherData = useCallback(
    async (forceRefresh = false) => {
      if (forceRefresh) {
        setIsRefreshing(true);
        setErrorNotice(null);
      }

      const handleFallback = async (reasonNotice?: string) => {
        const fallback = getProjectFallback();
        let currentW: any = null;
        try {
          currentW = await fetchOpenMeteo(fallback.lat, fallback.lon);
        } catch {
          // If completely offline or API unreachable, use estimate from active climate
          const activeClimate = climates?.find(c => c.id === (currentDesign?.location_id || 'ladakh'));
          const currentHour = new Date().getHours();
          const estTemp = activeClimate?.hourly_outdoor_temp?.[currentHour] ?? 24;
          currentW = {
            temperature_2m: estTemp,
            apparent_temperature: estTemp,
            weather_code: 0,
            is_day: currentHour >= 6 && currentHour <= 18 ? 1 : 0,
            relative_humidity_2m: 45,
            wind_speed_10m: activeClimate?.hourly_wind_speed?.[currentHour] ?? 5,
          };
        }

        const stateAbbr = formatStateAbbr(fallback.state);
        const compact = stateAbbr ? `${fallback.city}, ${stateAbbr}` : fallback.city;

        setWeatherData({
          city: fallback.city,
          state: fallback.state,
          compactLocation: compact,
          fullLocation: fallback.region ? `${fallback.city}, ${fallback.region}` : fallback.city,
          temperature: currentW ? Math.round(currentW.temperature_2m) : null,
          apparentTemperature: currentW?.apparent_temperature !== undefined ? Math.round(currentW.apparent_temperature) : null,
          weatherCode: currentW?.weather_code ?? 0,
          isDay: currentW?.is_day === 1,
          humidity: currentW?.relative_humidity_2m !== undefined ? Math.round(currentW.relative_humidity_2m) : null,
          windSpeed: currentW?.wind_speed_10m !== undefined ? Math.round(currentW.wind_speed_10m * 10) / 10 : null,
          isLive: false,
          lastUpdated: new Date(),
          coords: { lat: fallback.lat, lon: fallback.lon },
        });

        if (reasonNotice) {
          setErrorNotice(reasonNotice);
        }
        setIsLoading(false);
        setIsRefreshing(false);
      };

      // Check if geolocation is supported
      if (typeof window === 'undefined' || !navigator.geolocation) {
        await handleFallback('Geolocation not supported by your browser. Using project location.');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async position => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          try {
            // Concurrent fetch of reverse geocoding and Open-Meteo weather
            const [geoRes, weatherRes] = await Promise.allSettled([
              reverseGeocodeCoords(lat, lon),
              fetchOpenMeteo(lat, lon),
            ]);

            const geo =
              geoRes.status === 'fulfilled'
                ? geoRes.value
                : { city: `${lat.toFixed(2)}°N`, state: `${lon.toFixed(2)}°E`, full: `Lat ${lat.toFixed(2)}°, Lon ${lon.toFixed(2)}°` };

            const weather = weatherRes.status === 'fulfilled' ? weatherRes.value : null;

            const stateAbbr = formatStateAbbr(geo.state);
            const compact = geo.city && stateAbbr ? `${geo.city}, ${stateAbbr}` : (geo.city || 'Live Location');

            setWeatherData({
              city: geo.city,
              state: geo.state,
              compactLocation: compact,
              fullLocation: geo.full || `${geo.city}, ${geo.state}`,
              temperature: weather ? Math.round(weather.temperature_2m) : null,
              apparentTemperature: weather?.apparent_temperature !== undefined ? Math.round(weather.apparent_temperature) : null,
              weatherCode: weather?.weather_code ?? 0,
              isDay: weather ? weather.is_day === 1 : true,
              humidity: weather?.relative_humidity_2m !== undefined ? Math.round(weather.relative_humidity_2m) : null,
              windSpeed: weather?.wind_speed_10m !== undefined ? Math.round(weather.wind_speed_10m * 10) / 10 : null,
              isLive: true,
              lastUpdated: new Date(),
              coords: { lat, lon },
            });
            setErrorNotice(null);
          } catch {
            await handleFallback('Could not retrieve live weather. Showing project location.');
          } finally {
            setIsLoading(false);
            setIsRefreshing(false);
          }
        },
        async error => {
          let notice = 'Showing project location';
          if (error.code === error.PERMISSION_DENIED) {
            notice = 'Location access denied. Using project location.';
          } else if (error.code === error.TIMEOUT) {
            notice = 'Location request timed out. Using project location.';
          }
          await handleFallback(notice);
        },
        { timeout: 7000, enableHighAccuracy: false, maximumAge: 300000 }
      );
    },
    [getProjectFallback, climates, currentDesign?.location_id]
  );

  // Initial load
  useEffect(() => {
    let isMounted = true;
    const runInitialLoad = async () => {
      // Yield to event loop to avoid synchronous cascading render warning
      await Promise.resolve();
      if (isMounted) {
        loadWeatherData(false);
      }
    };
    runInitialLoad();
    return () => {
      isMounted = false;
    };
  }, [loadWeatherData]);

  // Periodic refresh approximately every 12 minutes (720,000 ms)
  useEffect(() => {
    const interval = setInterval(() => {
      loadWeatherData(false);
    }, 12 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadWeatherData]);

  const { condition, Icon: WeatherConditionIcon, color: iconColor } = getWeatherDetails(
    weatherData.weatherCode,
    weatherData.isDay
  );

  const formattedTime = weatherData.lastUpdated
    ? weatherData.lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className="relative inline-block text-left">
      {/* Navbar Weather Badge Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="View live location & weather details"
        className={`group flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3 py-1.5 rounded-xl border transition-all duration-200 select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-forest/30 ${
          isOpen
            ? 'bg-[#EFECE1] border-[#C8C4B5] shadow-xs'
            : 'bg-[#FAF8F2]/90 hover:bg-[#F2EFE6] border-[#E2DFD2] hover:border-[#D1CDBD]'
        }`}
      >
        {/* Location Icon & Text */}
        <div className="flex items-center text-[#233530] group-hover:text-forest transition-colors">
          <MapPin className="w-3.5 h-3.5 mr-1 text-earth shrink-0" />
          <span className="text-xs font-semibold tracking-tight truncate max-w-[85px] sm:max-w-[130px] md:max-w-[140px] lg:max-w-[180px]">
            {isLoading ? 'Locating...' : weatherData.compactLocation}
          </span>
        </div>

        {/* Divider */}
        <span className="text-[#D0CBBF] text-xs font-light">|</span>

        {/* Weather Icon & Temp */}
        <div className="flex items-center space-x-1 shrink-0">
          {isLoading ? (
            <div className="w-3.5 h-3.5 rounded-full border border-forest border-t-transparent animate-spin" />
          ) : (
            <WeatherConditionIcon className={`w-3.5 h-3.5 ${iconColor}`} />
          )}
          <span className="text-xs font-bold text-forest tracking-tight">
            {weatherData.temperature !== null ? `${weatherData.temperature}°C` : '--°C'}
          </span>
        </div>

        {/* Down Arrow */}
        <ChevronDown
          className={`w-3 h-3 text-[#718096] transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-forest' : ''
          }`}
        />
      </button>

      {/* Popover Card */}
      {isOpen && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label="Location and Weather Details"
          className="absolute right-0 top-full mt-2 w-72 sm:w-80 max-w-[calc(100vw-1.5rem)] bg-white/98 backdrop-blur-md rounded-2xl border border-[#E2DFD2] shadow-xl z-50 p-4 transition-all duration-150"
        >
          {/* Popover Header */}
          <div className="flex items-start justify-between pb-3 border-b border-[#ECE8DC]">
            <div className="flex items-start space-x-2">
              <div className="w-8 h-8 rounded-lg bg-mint flex items-center justify-center text-forest shrink-0 mt-0.5">
                <MapPin className="w-4 h-4 text-earth" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5">
                  <h4 className="text-sm font-bold text-forest truncate max-w-[160px]">
                    {weatherData.city || 'Location'}
                  </h4>
                  {weatherData.isLive ? (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />
                      Live GPS
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                      Project Site
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#5C6E67] truncate max-w-[190px]" title={weatherData.fullLocation}>
                  {weatherData.fullLocation}
                </p>
              </div>
            </div>

            {/* Refresh Icon Button */}
            <button
              onClick={() => loadWeatherData(true)}
              disabled={isRefreshing}
              title="Refresh weather data"
              className="p-1.5 text-[#5C6E67] hover:text-forest hover:bg-[#F2EFE6] rounded-lg transition-colors duration-150 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-forest' : ''}`} />
            </button>
          </div>

          {/* Temperature & Condition Main Display */}
          <div className="my-3.5 flex items-center justify-between px-1">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-[#FAF8F2] border border-[#EBE7DA]">
                <WeatherConditionIcon className={`w-8 h-8 ${iconColor}`} />
              </div>
              <div>
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-extrabold text-forest tracking-tight">
                    {weatherData.temperature !== null ? `${weatherData.temperature}°` : '--'}
                  </span>
                  <span className="text-sm font-bold text-[#5C6E67]">C</span>
                </div>
                <p className="text-xs font-semibold text-[#2C3E38]">{condition}</p>
              </div>
            </div>

            {weatherData.apparentTemperature !== null && (
              <div className="text-right">
                <span className="text-[11px] font-medium text-[#7A8A83] block">Feels like</span>
                <span className="text-sm font-bold text-forest">
                  {weatherData.apparentTemperature}°C
                </span>
              </div>
            )}
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 my-3">
            <div className="flex items-center space-x-2 p-2 rounded-xl bg-[#FBF9F4] border border-[#ECE8DC]">
              <Droplets className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <div>
                <span className="text-[10px] text-[#7A8A83] block leading-tight">Humidity</span>
                <span className="text-xs font-bold text-[#2C3E38]">
                  {weatherData.humidity !== null ? `${weatherData.humidity}%` : 'N/A'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 p-2 rounded-xl bg-[#FBF9F4] border border-[#ECE8DC]">
              <Wind className="w-3.5 h-3.5 text-teal-dark shrink-0" />
              <div>
                <span className="text-[10px] text-[#7A8A83] block leading-tight">Wind Speed</span>
                <span className="text-xs font-bold text-[#2C3E38]">
                  {weatherData.windSpeed !== null ? `${weatherData.windSpeed} km/h` : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Notice / Status if Fallback */}
          {errorNotice && (
            <div className="mb-2.5 px-2.5 py-1.5 rounded-lg bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 flex items-center space-x-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate">{errorNotice}</span>
            </div>
          )}

          {/* Footer Info & Refresh */}
          <div className="pt-2.5 border-t border-[#ECE8DC] flex items-center justify-between text-[11px] text-[#7A8A83]">
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3 text-[#A0A9A4]" />
              <span>{formattedTime ? `Updated ${formattedTime}` : 'Updating...'}</span>
            </div>

            {!weatherData.isLive && (
              <button
                onClick={() => loadWeatherData(true)}
                className="text-forest hover:text-teal-dark font-semibold hover:underline flex items-center space-x-1"
              >
                <Navigation className="w-2.5 h-2.5" />
                <span>Retry GPS</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
