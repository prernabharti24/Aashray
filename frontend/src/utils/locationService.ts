import type { Climate } from '../types';

export interface CityLocation {
  id: string;
  name: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  elevation_m: number;
  climate_category: 'Cold and Arid' | 'Extreme Cold' | 'Hot and Arid' | 'Humid and Rainy' | 'Composite Climate' | 'Moderate / Temperate';
  description: string;
}

export const SEARCHABLE_CITIES: CityLocation[] = [
  // Primary Reference Cities
  {
    id: 'ladakh',
    name: 'Ladakh',
    region: 'Northern Himalayas, Ladakh',
    country: 'India',
    latitude: 34.15,
    longitude: 77.58,
    elevation_m: 3500,
    climate_category: 'Cold and Arid',
    description: 'High altitude cold desert with sub-zero nights, extreme diurnal temperature range and intense solar baking.'
  },
  {
    id: 'dras',
    name: 'Dras',
    region: 'Kargil, Ladakh',
    country: 'India',
    latitude: 34.43,
    longitude: 75.76,
    elevation_m: 3280,
    climate_category: 'Extreme Cold',
    description: 'Second coldest inhabited valley with severe freezing winter shock and high cold winds.'
  },
  {
    id: 'jaisalmer',
    name: 'Jaisalmer',
    region: 'Thar Desert, Rajasthan',
    country: 'India',
    latitude: 26.91,
    longitude: 70.90,
    elevation_m: 225,
    climate_category: 'Hot and Arid',
    description: 'Intense daytime desert baking, high ambient heat waves and cool desert nights with large diurnal range.'
  },
  {
    id: 'shillong',
    name: 'Shillong',
    region: 'Meghalaya, North East',
    country: 'India',
    latitude: 25.57,
    longitude: 91.88,
    elevation_m: 1525,
    climate_category: 'Humid and Rainy',
    description: 'High cloud cover, dense monsoon rainfall, high humidity and damp mountain chill year-round.'
  },
  {
    id: 'delhi',
    name: 'Delhi / NCR',
    region: 'Northern Plains',
    country: 'India',
    latitude: 28.61,
    longitude: 77.20,
    elevation_m: 216,
    climate_category: 'Composite Climate',
    description: 'Hot summers, cold winter snaps, and seasonal monsoon humidity with high diurnal variation.'
  },
  // Indian Cities Requested (Bhopal, Indore, Pune, etc.)
  {
    id: 'bhopal',
    name: 'Bhopal',
    region: 'Madhya Pradesh',
    country: 'India',
    latitude: 23.25,
    longitude: 77.41,
    elevation_m: 527,
    climate_category: 'Composite Climate',
    description: 'Central plateau climate with warm summers, moderate winters, and July-August monsoon precipitation.'
  },
  {
    id: 'indore',
    name: 'Indore',
    region: 'Malwa, Madhya Pradesh',
    country: 'India',
    latitude: 22.71,
    longitude: 75.85,
    elevation_m: 553,
    climate_category: 'Composite Climate',
    description: 'Pleasant Malwa plateau elevation with hot dry pre-monsoon summers and cool evenings (Shab-e-Malwa).'
  },
  {
    id: 'pune',
    name: 'Pune',
    region: 'Maharashtra',
    country: 'India',
    latitude: 18.52,
    longitude: 73.85,
    elevation_m: 560,
    climate_category: 'Moderate / Temperate',
    description: 'Deccan plateau leeward climate with pleasant year-round temperatures and moderate seasonal monsoon.'
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    region: 'Konkan Coast, Maharashtra',
    country: 'India',
    latitude: 19.07,
    longitude: 72.87,
    elevation_m: 14,
    climate_category: 'Humid and Rainy',
    description: 'Warm humid coastal climate with maritime moderation, high relative humidity and heavy coastal monsoon.'
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    region: 'Karnataka',
    country: 'India',
    latitude: 12.97,
    longitude: 77.59,
    elevation_m: 920,
    climate_category: 'Moderate / Temperate',
    description: 'High plateau elevation offering mild subtropical weather, moderate diurnal swings and cool breezes.'
  },
  {
    id: 'jaipur',
    name: 'Jaipur',
    region: 'Rajasthan',
    country: 'India',
    latitude: 26.91,
    longitude: 75.78,
    elevation_m: 431,
    climate_category: 'Hot and Arid',
    description: 'Semi-arid desert edge climate with scorching summer peaks, low humidity and clear starry cold winter nights.'
  },
  {
    id: 'shimla',
    name: 'Shimla',
    region: 'Himachal Pradesh',
    country: 'India',
    latitude: 31.10,
    longitude: 77.17,
    elevation_m: 2276,
    climate_category: 'Cold and Arid',
    description: 'Sub-alpine Himalayan climate with winter snowfall, chilly mountain air and heavy monsoon cloudbursts.'
  },
  {
    id: 'srinagar',
    name: 'Srinagar',
    region: 'Kashmir Valley',
    country: 'India',
    latitude: 34.08,
    longitude: 74.79,
    elevation_m: 1585,
    climate_category: 'Cold and Arid',
    description: 'Inter-montane valley climate with severe sub-zero winters, autumn chills, and moderate summer warmth.'
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad',
    region: 'Telangana',
    country: 'India',
    latitude: 17.38,
    longitude: 78.48,
    elevation_m: 542,
    climate_category: 'Composite Climate',
    description: 'Semi-arid tropical plateau with hot dry summers and mild winters.'
  },
  {
    id: 'ahmedabad',
    name: 'Ahmedabad',
    region: 'Gujarat',
    country: 'India',
    latitude: 23.02,
    longitude: 72.57,
    elevation_m: 53,
    climate_category: 'Hot and Arid',
    description: 'Hot semi-arid climate with intense dry summer months and sudden monsoon downpours.'
  },
  {
    id: 'kolkata',
    name: 'Kolkata',
    region: 'West Bengal',
    country: 'India',
    latitude: 22.57,
    longitude: 88.36,
    elevation_m: 9,
    climate_category: 'Humid and Rainy',
    description: 'Tropical wet-and-dry climate with high ambient humidity and prolonged monsoon storms.'
  },
  {
    id: 'chennai',
    name: 'Chennai',
    region: 'Tamil Nadu',
    country: 'India',
    latitude: 13.08,
    longitude: 80.27,
    elevation_m: 6,
    climate_category: 'Humid and Rainy',
    description: 'Tropical maritime climate with heavy Northeast retreating monsoon rains and high coastal humidity.'
  },
  {
    id: 'denver',
    name: 'Denver',
    region: 'Colorado',
    country: 'USA',
    latitude: 39.73,
    longitude: -104.99,
    elevation_m: 1609,
    climate_category: 'Cold and Arid',
    description: 'Mile High continental semi-arid climate with intense sunshine, winter snow storms and low humidity.'
  },
  {
    id: 'zurich',
    name: 'Zurich',
    region: 'Central Switzerland',
    country: 'Switzerland',
    latitude: 47.37,
    longitude: 8.54,
    elevation_m: 408,
    climate_category: 'Cold and Arid',
    description: 'Temperate oceanic-continental transition with cold winters, frequent cloud cover and Alpine mountain breezes.'
  },
  {
    id: 'cairo',
    name: 'Cairo',
    region: 'Nile Valley',
    country: 'Egypt',
    latitude: 30.04,
    longitude: 31.23,
    elevation_m: 23,
    climate_category: 'Hot and Arid',
    description: 'Extreme hot desert climate with virtually zero annual precipitation and intense solar irradiation.'
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    region: 'Kanto Plain',
    country: 'Japan',
    latitude: 35.67,
    longitude: 139.65,
    elevation_m: 40,
    climate_category: 'Humid and Rainy',
    description: 'Humid subtropical climate with hot wet summers, typhoons and cool dry winters.'
  }
];

/**
 * Searches locations matching query string.
 * First queries local curated index, then attempts online geocoding if online.
 */
export async function searchLocations(query: string): Promise<CityLocation[]> {
  const clean = query.trim().toLowerCase();
  if (!clean) return [];

  // 1. Search local curated cities
  const localMatches = SEARCHABLE_CITIES.filter(c => 
    c.name.toLowerCase().includes(clean) ||
    c.region.toLowerCase().includes(clean) ||
    c.country.toLowerCase().includes(clean) ||
    c.climate_category.toLowerCase().includes(clean)
  );

  // If we already have strong local matches, return them immediately
  if (localMatches.length >= 2 || clean.length < 3) {
    return localMatches;
  }

  // 2. Online Geocoding attempt with short timeout (fallback to empty)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(clean)}&limit=5`, {
      signal: controller.signal,
      headers: { 'Accept-Language': 'en' }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const onlineResults: CityLocation[] = data.map((item: { display_name: string; lat: string; lon: string }, idx: number) => {
          const lat = parseFloat(item.lat);
          const lon = parseFloat(item.lon);
          const parts = item.display_name.split(',').map((s: string) => s.trim());
          const name = parts[0] || 'Unknown Location';
          const country = parts[parts.length - 1] || '';
          const region = parts.slice(1, -1).slice(0, 2).join(', ');

          // Infer climate category from latitude and elevation
          let cat: CityLocation['climate_category'] = 'Composite Climate';
          if (Math.abs(lat) > 40 || lat > 32) cat = 'Cold and Arid';
          else if (Math.abs(lat) < 28 && Math.abs(lat) > 20) cat = 'Hot and Arid';

          return {
            id: `online_${idx}_${Date.now()}`,
            name,
            region: region || country,
            country,
            latitude: Number(lat.toFixed(2)),
            longitude: Number(lon.toFixed(2)),
            elevation_m: 250,
            climate_category: cat,
            description: `Geographical coordinates (${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E). Custom microclimate loaded.`
          };
        });

        // Merge without duplicates
        const combined = [...localMatches];
        onlineResults.forEach(o => {
          if (!combined.some(c => c.name.toLowerCase() === o.name.toLowerCase())) {
            combined.push(o);
          }
        });
        return combined;
      }
    }
  } catch {
    // Network unavailable or aborted, return local matches
  }

  return localMatches;
}

/**
 * Finds closest known location via Haversine distance.
 */
export function getNearestLocation(lat: number, lon: number): CityLocation {
  let closest = SEARCHABLE_CITIES[0];
  let minDistance = Infinity;

  for (const city of SEARCHABLE_CITIES) {
    const dLat = (city.latitude - lat) * (Math.PI / 180);
    const dLon = (city.longitude - lon) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat * (Math.PI / 180)) * Math.cos(city.latitude * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = 6371 * c; // km

    if (dist < minDistance) {
      minDistance = dist;
      closest = city;
    }
  }

  return closest;
}

/**
 * Reverse geocodes latitude/longitude into a location name, with offline nearest-city fallback.
 */
export async function reverseGeocodeCoordinates(lat: number, lon: number): Promise<CityLocation> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`, {
      signal: controller.signal,
      headers: { 'Accept-Language': 'en' }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.address) {
        const city = data.address.city || data.address.town || data.address.village || data.address.suburb || data.address.county || 'Detected Area';
        const state = data.address.state || data.address.region || '';
        const country = data.address.country || '';

        const nearest = getNearestLocation(lat, lon);

        return {
          id: `gps_${Date.now()}`,
          name: city,
          region: state ? `${state}, ${country}` : country,
          country,
          latitude: Number(lat.toFixed(2)),
          longitude: Number(lon.toFixed(2)),
          elevation_m: nearest.elevation_m,
          climate_category: nearest.climate_category,
          description: `Automatically detected via device GPS (${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E).`
        };
      }
    }
  } catch {
    // Offline or timeout
  }

  // Fallback to nearest city
  const nearest = getNearestLocation(lat, lon);
  return {
    ...nearest,
    id: `gps_${Date.now()}`,
    name: `${nearest.name} (Near Your GPS)`,
    latitude: Number(lat.toFixed(2)),
    longitude: Number(lon.toFixed(2)),
    description: `Detected approximate coordinate: ${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E.`
  };
}

/**
 * Generates an accurate, physically plausible 24-hour diurnal Climate profile for any custom city worldwide.
 */
export function generateClimateForLocation(city: CityLocation): Climate {
  const lat = city.latitude;
  const alt = city.elevation_m;
  const cat = city.climate_category;

  let baseMiddayTemp = Math.abs(lat) > 30 ? 28.0 : 32.0;
  let diurnalSwing = 14.0;
  let baseSolarPeak = 950;
  let baseWind = 3.5;
  let groundT = 20.0;
  let focus = "Balanced high thermal mass and cross-ventilation flexibility.";

  if (cat === 'Cold and Arid' || cat === 'Extreme Cold') {
    baseMiddayTemp = Math.max(-10.0, 4.0 - (alt / 1000) * 4.5);
    diurnalSwing = 18.0;
    baseSolarPeak = 920;
    baseWind = 6.0;
    groundT = Math.min(2.0, baseMiddayTemp - 4.0);
    focus = "High thermal mass for night heat retention, heavy roof insulation, double glazed south-facing windows for solar heat trap.";
  } else if (cat === 'Hot and Arid') {
    baseMiddayTemp = 44.0;
    diurnalSwing = 19.0;
    baseSolarPeak = 1040;
    baseWind = 4.2;
    groundT = 30.0;
    focus = "Thick sandstone/earth walls for time-lag thermal damping, shaded roof overhangs, minimal west glazed openings.";
  } else if (cat === 'Humid and Rainy') {
    baseMiddayTemp = 24.0;
    diurnalSwing = 8.0;
    baseSolarPeak = 580;
    baseWind = 3.0;
    groundT = 18.0;
    focus = "Moisture barrier with local bamboo-timber hybrid walls, steep slope roof drainage and extended overhangs.";
  } else if (cat === 'Moderate / Temperate') {
    baseMiddayTemp = 29.0;
    diurnalSwing = 11.0;
    baseSolarPeak = 880;
    baseWind = 3.2;
    groundT = 22.0;
    focus = "Cross-ventilation priority, breathable earthen plaster, shaded pergolas.";
  }

  // 24-hour sinusoidal outdoor temperature curve
  const hourlyOutdoorTemp: number[] = [];
  const hourlySolar: number[] = [];
  const hourlyWind: number[] = [];

  for (let h = 0; h < 24; h++) {
    // Temperature peaks around 14:00 (2 PM), minimum around 05:00 (5 AM)
    const tCycle = Math.sin(((h - 8) / 24) * 2 * Math.PI);
    const temp = (baseMiddayTemp - diurnalSwing / 2) + (diurnalSwing / 2) * tCycle;
    hourlyOutdoorTemp.push(Number(temp.toFixed(1)));

    // Solar irradiance curve (positive between 06:00 and 18:00)
    let solarVal = 0;
    if (h >= 6 && h <= 18) {
      const solarFrac = Math.sin(((h - 6) / 12) * Math.PI);
      solarVal = Math.round(baseSolarPeak * Math.max(0, solarFrac));
    }
    hourlySolar.push(solarVal);

    // Wind speed slightly higher in afternoon
    const windFrac = 0.75 + 0.35 * Math.sin(((h - 10) / 24) * 2 * Math.PI);
    hourlyWind.push(Number((baseWind * windFrac).toFixed(1)));
  }

  return {
    id: city.id,
    name: `${city.name} (${city.climate_category})`,
    region: city.region,
    altitude_m: city.elevation_m,
    description: city.description,
    latitude: city.latitude,
    design_day: "Microclimate Peak Assessment",
    hourly_outdoor_temp: hourlyOutdoorTemp,
    hourly_solar_irradiance: hourlySolar,
    hourly_wind_speed: hourlyWind,
    ground_temp: groundT,
    recommended_focus: focus
  };
}
