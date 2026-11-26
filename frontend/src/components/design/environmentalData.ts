import type { Climate } from '../../types';

export interface LocationGeoData {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  elevation_m: number;
  typicalSummerDay: number; // day of year (1-365)
  typicalWinterDay: number;
  typicalMonsoonDay: number;
  prevailingWindDirDeg: number;
}

export const LOCATION_GEO: Record<string, LocationGeoData> = {
  ladakh: {
    id: 'ladakh',
    name: 'Ladakh',
    latitude: 34.15,
    longitude: 77.58,
    elevation_m: 3500,
    typicalSummerDay: 172, // June 21
    typicalWinterDay: 15,  // Jan 15
    typicalMonsoonDay: 200, // July
    prevailingWindDirDeg: 240 // WSW cold valley winds
  },
  dras: {
    id: 'dras',
    name: 'Dras',
    latitude: 34.43,
    longitude: 75.76,
    elevation_m: 3280,
    typicalSummerDay: 172,
    typicalWinterDay: 15,
    typicalMonsoonDay: 200,
    prevailingWindDirDeg: 270 // West gorge winds
  },
  jaisalmer: {
    id: 'jaisalmer',
    name: 'Jaisalmer',
    latitude: 26.91,
    longitude: 70.90,
    elevation_m: 225,
    typicalSummerDay: 140, // May 20
    typicalWinterDay: 15,
    typicalMonsoonDay: 220, // August
    prevailingWindDirDeg: 225 // SW desert winds
  },
  delhi: {
    id: 'delhi',
    name: 'Delhi / NCR',
    latitude: 28.61,
    longitude: 77.20,
    elevation_m: 216,
    typicalSummerDay: 150, // May 30
    typicalWinterDay: 15,
    typicalMonsoonDay: 210, // July end
    prevailingWindDirDeg: 290 // WNW hot loo / winter breeze
  },
  shillong: {
    id: 'shillong',
    name: 'Shillong',
    latitude: 25.57,
    longitude: 91.88,
    elevation_m: 1525,
    typicalSummerDay: 172,
    typicalWinterDay: 355,
    typicalMonsoonDay: 185, // July peak monsoon
    prevailingWindDirDeg: 160 // SSE wet monsoon clouds
  }
};

export type EnvironmentalMode = 'summer' | 'rainy' | 'winter' | 'wind';

export type WeatherScenario = 
  | 'actual'
  | 'summer_solstice'
  | 'monsoon_downpour'
  | 'winter_blizzard'
  | 'desert_heatwave';

export interface EnvironmentalState {
  hour: number; // 0.0 - 24.0
  mode: EnvironmentalMode;
  scenario: WeatherScenario;
  // Computed instant metrics
  temperature_c: number;
  solar_irradiance_w_m2: number;
  wind_speed_m_s: number;
  wind_direction_deg: number;
  rainfall_mm_h: number;
  snowfall_rate: number; // 0.0 - 1.0
  cloud_cover: number; // 0.0 - 1.0
  sun_altitude_deg: number;
  sun_azimuth_deg: number;
  sun_position_3d: { x: number; y: number; z: number };
  is_daylight: boolean;
  // Controls & visibility toggles
  showSunRays: boolean;
  showShadows: boolean;
  showRain: boolean;
  showWind: boolean;
  showHeatMap: boolean;
  showSnowAccumulation: boolean;
  showHeatLossAreas: boolean;
  showCutawayView: boolean;
  showDrainage: boolean;
  showOpeningAirflow: boolean;
}

/**
 * Calculates solar position based on geographic latitude, day of year, and solar time.
 * Standard Cooper (1969) / Spencer solar declination & hour angle model.
 */
export function calculateSolarPosition(
  latitudeDeg: number,
  dayOfYear: number,
  hourOfDay: number,
  distance: number = 18
): {
  altitudeDeg: number;
  azimuthDeg: number;
  x: number;
  y: number;
  z: number;
  isDaylight: boolean;
} {
  const latRad = (latitudeDeg * Math.PI) / 180;
  
  // Solar Declination delta (-23.45° to +23.45°)
  const declinationRad = 23.45 * (Math.PI / 180) * Math.sin(((360 / 365) * (284 + dayOfYear) * Math.PI) / 180);
  
  // Hour angle omega (15° per hour, 0 at solar noon 12:00)
  const hourAngleDeg = 15 * (hourOfDay - 12);
  const hourAngleRad = (hourAngleDeg * Math.PI) / 180;
  
  // Solar Altitude alpha (elevation above horizon)
  const sinAlpha = Math.sin(latRad) * Math.sin(declinationRad) + 
                   Math.cos(latRad) * Math.cos(declinationRad) * Math.cos(hourAngleRad);
  const altitudeRad = Math.asin(Math.max(-1, Math.min(1, sinAlpha)));
  const altitudeDeg = (altitudeRad * 180) / Math.PI;
  
  const isDaylight = altitudeDeg > 0;
  
  // Solar Azimuth gamma (measured clockwise from North = 0°, East = 90°, South = 180°, West = 270°)
  let azimuthDeg = 180;
  if (isDaylight) {
    const cosGamma = (Math.sin(altitudeRad) * Math.sin(latRad) - Math.sin(declinationRad)) / 
                     (Math.cos(altitudeRad) * Math.cos(latRad));
    const clampedCos = Math.max(-1, Math.min(1, cosGamma));
    const rawAzimuth = (Math.acos(clampedCos) * 180) / Math.PI;
    
    // In morning (hourAngle < 0), sun is in Eastern half
    if (hourAngleDeg < 0) {
      azimuthDeg = rawAzimuth;
    } else {
      azimuthDeg = 360 - rawAzimuth;
    }
  } else {
    // Night path beneath horizon
    azimuthDeg = (180 + hourAngleDeg + 360) % 360;
  }
  
  // Convert spherical (altitude, azimuth) to 3D Cartesian coordinates
  // Three.js convention: Y is up, -Z is North, +Z is South, +X is East, -X is West
  const clampedAltRad = Math.max(0.02, altitudeRad);
  const azRad = (azimuthDeg * Math.PI) / 180;
  
  const y = distance * Math.sin(clampedAltRad);
  const groundRadius = distance * Math.cos(clampedAltRad);
  const x = groundRadius * Math.sin(azRad);
  const z = -groundRadius * Math.cos(azRad);
  
  return {
    altitudeDeg,
    azimuthDeg,
    x,
    y: isDaylight ? y : -Math.abs(y),
    z,
    isDaylight
  };
}

/**
 * Linear interpolation helper for 24-hour cycle data arrays.
 */
function interpolateHourly(arr: number[], fractionalHour: number): number {
  const normalizedHour = ((fractionalHour % 24) + 24) % 24;
  const h0 = Math.floor(normalizedHour);
  const h1 = (h0 + 1) % 24;
  const frac = normalizedHour - h0;
  const v0 = arr[h0] ?? 0;
  const v1 = arr[h1] ?? 0;
  return v0 + (v1 - v0) * frac;
}

/**
 * Computes live environmental state for the 3D scene according to active mode, scenario, location, and time.
 */
export function getEnvironmentalState(
  climate: Climate,
  mode: EnvironmentalMode,
  scenario: WeatherScenario,
  hour: number,
  toggles: {
    showSunRays: boolean;
    showShadows: boolean;
    showRain: boolean;
    showWind: boolean;
    showHeatMap: boolean;
    showSnowAccumulation: boolean;
    showHeatLossAreas: boolean;
    showCutawayView: boolean;
    showDrainage: boolean;
    showOpeningAirflow: boolean;
  }
): EnvironmentalState {
  const geo = LOCATION_GEO[climate.id] || LOCATION_GEO.ladakh;
  
  // Determine Day of Year according to Mode or Scenario
  let dayOfYear = geo.typicalSummerDay;
  if (scenario === 'summer_solstice') dayOfYear = 172;
  else if (scenario === 'winter_blizzard') dayOfYear = 15;
  else if (scenario === 'monsoon_downpour') dayOfYear = geo.typicalMonsoonDay;
  else {
    if (mode === 'summer') dayOfYear = geo.typicalSummerDay;
    else if (mode === 'winter') dayOfYear = geo.typicalWinterDay;
    else if (mode === 'rainy') dayOfYear = geo.typicalMonsoonDay;
    else dayOfYear = 100; // Spring/Autumn for wind mode
  }
  
  // Calculate exact solar position
  const solar = calculateSolarPosition(geo.latitude, dayOfYear, hour, 20);
  
  // Base climate values from dataset
  let tempC = interpolateHourly(climate.hourly_outdoor_temp, hour);
  let solarW = interpolateHourly(climate.hourly_solar_irradiance, hour);
  let windSpeed = interpolateHourly(climate.hourly_wind_speed, hour);
  let windDir = geo.prevailingWindDirDeg;
  let rainMmH = 0;
  let snowfallRate = 0;
  let cloudCover = 0.1;
  
  // Apply Scenario overrides
  if (scenario === 'summer_solstice') {
    tempC += 5.5;
    solarW = Math.max(solarW * 1.15, solar.isDaylight ? 200 : 0);
    cloudCover = 0.05;
  } else if (scenario === 'desert_heatwave') {
    tempC = Math.max(42.0, tempC + 6.0);
    solarW = Math.max(solarW * 1.2, solar.isDaylight ? 250 : 0);
    windSpeed = Math.max(windSpeed, 5.5);
    cloudCover = 0.02;
  } else if (scenario === 'monsoon_downpour') {
    tempC = Math.min(tempC, 24.0);
    solarW *= 0.15; // heavy cloud filtering
    windSpeed = Math.max(windSpeed, 7.5);
    rainMmH = 38.0;
    cloudCover = 0.95;
  } else if (scenario === 'winter_blizzard') {
    tempC = Math.min(-15.0, tempC - 4.0);
    solarW *= 0.2;
    windSpeed = Math.max(10.5, windSpeed * 1.6);
    snowfallRate = 0.9;
    cloudCover = 0.9;
  } else {
    // Mode-specific defaults when scenario === 'actual'
    if (mode === 'summer') {
      cloudCover = 0.1;
    } else if (mode === 'rainy') {
      cloudCover = 0.85;
      rainMmH = climate.id === 'shillong' ? 28.0 : climate.id === 'delhi' ? 18.0 : 8.0;
      solarW *= 0.25;
      tempC -= 2.0;
    } else if (mode === 'winter') {
      cloudCover = 0.4;
      // In cold climates (Ladakh, Dras, Shillong in winter), precipitation is snow
      if (tempC <= 2.0 || climate.id === 'ladakh' || climate.id === 'dras') {
        snowfallRate = 0.65;
      }
    } else if (mode === 'wind') {
      windSpeed = Math.max(windSpeed, 6.0);
      cloudCover = 0.3;
    }
  }
  
  // Recalculate daylight solar irradiance
  if (!solar.isDaylight) {
    solarW = 0;
  }
  
  return {
    hour,
    mode,
    scenario,
    temperature_c: Number(tempC.toFixed(1)),
    solar_irradiance_w_m2: Math.round(solarW),
    wind_speed_m_s: Number(windSpeed.toFixed(1)),
    wind_direction_deg: windDir,
    rainfall_mm_h: Number(rainMmH.toFixed(1)),
    snowfall_rate: snowfallRate,
    cloud_cover: cloudCover,
    sun_altitude_deg: Number(solar.altitudeDeg.toFixed(1)),
    sun_azimuth_deg: Number(solar.azimuthDeg.toFixed(1)),
    sun_position_3d: { x: solar.x, y: solar.y, z: solar.z },
    is_daylight: solar.isDaylight,
    ...toggles
  };
}
