import type { ShelterDesign, Climate, MaterialsDB, SimulationResult, ComparisonResponse } from '../types';

const API_BASE = 'http://localhost:8000/api';

// Fallback embedded datasets for client-side resilience
export const DEFAULT_CLIMATES: Climate[] = [
  {
    id: "ladakh",
    name: "Ladakh (High-Altitude Cold Desert)",
    region: "Northern Himalayas, India",
    altitude_m: 3500,
    description: "Sub-zero night temperatures, extreme diurnal swings, high solar irradiance due to thin atmosphere, strong cold winds.",
    latitude: 34.15,
    design_day: "Winter Peak (January)",
    hourly_outdoor_temp: [-12.0, -13.5, -14.2, -14.8, -15.0, -14.5, -13.0, -9.5, -5.0, -1.0, 2.0, 3.5, 4.0, 3.0, 0.5, -2.5, -6.0, -8.5, -9.8, -10.5, -11.0, -11.5, -11.8, -12.0],
    hourly_solar_irradiance: [0, 0, 0, 0, 0, 0, 80, 320, 580, 780, 920, 980, 950, 840, 650, 410, 150, 0, 0, 0, 0, 0, 0, 0],
    hourly_wind_speed: [3.5, 3.2, 3.0, 2.8, 3.0, 3.5, 4.2, 5.0, 6.2, 7.5, 8.0, 8.5, 8.0, 7.2, 6.5, 5.8, 5.0, 4.5, 4.0, 3.8, 3.6, 3.5, 3.5, 3.5],
    ground_temp: -2.0,
    recommended_focus: "High thermal mass for night heat retention, heavy roof insulation, double glazed south-facing windows for solar heat trap."
  },
  {
    id: "dras",
    name: "Dras (Extreme Cold / High Altitude)",
    region: "Kargil, Ladakh",
    altitude_m: 3280,
    description: "Second coldest inhabited place on earth. Severe freezing winds and extreme night thermal shock.",
    latitude: 34.43,
    design_day: "Winter Peak (January)",
    hourly_outdoor_temp: [-22.0, -23.5, -24.5, -25.0, -25.2, -24.8, -23.0, -18.5, -14.0, -9.0, -5.5, -3.0, -2.5, -4.0, -7.5, -11.0, -15.0, -18.0, -19.5, -20.5, -21.0, -21.5, -21.8, -22.0],
    hourly_solar_irradiance: [0, 0, 0, 0, 0, 0, 50, 280, 520, 710, 850, 900, 870, 760, 580, 350, 100, 0, 0, 0, 0, 0, 0, 0],
    hourly_wind_speed: [4.5, 4.2, 4.0, 3.8, 4.0, 4.5, 5.5, 6.8, 8.0, 9.5, 10.0, 10.5, 10.0, 9.0, 8.0, 7.0, 6.0, 5.5, 5.0, 4.8, 4.6, 4.5, 4.5, 4.5],
    ground_temp: -6.0,
    recommended_focus: "Maximum envelope airtightness, multi-layer earth/straw composite walls, super-insulated roof."
  },
  {
    id: "jaisalmer",
    name: "Jaisalmer (Hot & Dry Desert)",
    region: "Thar Desert, Rajasthan",
    altitude_m: 225,
    description: "Intense daytime solar baking, high ambient temperatures, cool desert nights with large diurnal range.",
    latitude: 26.91,
    design_day: "Summer Peak (May)",
    hourly_outdoor_temp: [28.0, 27.0, 26.2, 25.5, 25.0, 25.5, 28.0, 32.0, 36.5, 40.0, 43.0, 45.5, 46.5, 46.0, 44.5, 42.0, 39.0, 36.0, 33.5, 31.8, 30.5, 29.5, 28.8, 28.2],
    hourly_solar_irradiance: [0, 0, 0, 0, 0, 0, 120, 380, 650, 850, 980, 1040, 1010, 910, 740, 500, 240, 40, 0, 0, 0, 0, 0, 0],
    hourly_wind_speed: [2.5, 2.2, 2.0, 1.8, 2.0, 2.5, 3.0, 3.8, 4.5, 5.2, 5.8, 6.0, 5.8, 5.5, 5.0, 4.5, 4.0, 3.5, 3.0, 2.8, 2.6, 2.5, 2.5, 2.5],
    ground_temp: 30.0,
    recommended_focus: "Thick sandstone/earth walls for time-lag thermal damping, shaded roof overhangs, minimal west glazed openings."
  },
  {
    id: "delhi",
    name: "Delhi / NCR (Composite Climate)",
    region: "Northern Plains",
    altitude_m: 216,
    description: "Extreme seasons: intensely hot summers, cold winter snaps, high humidity during monsoon.",
    latitude: 28.61,
    design_day: "Winter / Spring Transition",
    hourly_outdoor_temp: [7.0, 6.2, 5.5, 4.8, 4.5, 5.0, 7.5, 11.0, 15.0, 18.5, 21.0, 23.0, 23.8, 23.0, 21.5, 19.0, 16.0, 13.5, 11.5, 10.0, 9.0, 8.2, 7.6, 7.2],
    hourly_solar_irradiance: [0, 0, 0, 0, 0, 0, 60, 250, 480, 680, 820, 880, 850, 740, 560, 340, 110, 0, 0, 0, 0, 0, 0, 0],
    hourly_wind_speed: [1.5, 1.2, 1.0, 1.0, 1.2, 1.5, 2.0, 2.5, 3.0, 3.5, 3.8, 4.0, 3.8, 3.5, 3.0, 2.5, 2.0, 1.8, 1.5, 1.4, 1.3, 1.2, 1.2, 1.2],
    ground_temp: 14.0,
    recommended_focus: "Balanced insulation and cross-ventilation flexibility with moderate thermal mass."
  },
  {
    id: "shillong",
    name: "Shillong (Cold & Cloudy Mountain)",
    region: "Meghalaya, North East",
    altitude_m: 1525,
    description: "High humidity, overcast skies, cool temperatures year-round, damp chill.",
    latitude: 25.57,
    design_day: "Winter Cloud (December)",
    hourly_outdoor_temp: [4.0, 3.5, 3.0, 2.5, 2.2, 2.8, 4.5, 7.0, 9.8, 12.0, 13.5, 14.5, 14.8, 14.0, 12.5, 10.5, 8.5, 7.0, 6.0, 5.2, 4.8, 4.5, 4.2, 4.0],
    hourly_solar_irradiance: [0, 0, 0, 0, 0, 0, 40, 180, 340, 460, 540, 580, 560, 490, 380, 220, 70, 0, 0, 0, 0, 0, 0, 0],
    hourly_wind_speed: [2.0, 1.8, 1.8, 1.5, 1.8, 2.2, 2.8, 3.5, 4.0, 4.5, 4.8, 5.0, 4.8, 4.2, 3.8, 3.2, 2.8, 2.5, 2.2, 2.0, 2.0, 2.0, 2.0, 2.0],
    ground_temp: 8.0,
    recommended_focus: "Moisture barrier with local bamboo-timber hybrid walls, insulated sloping roof."
  }
];

export const DEFAULT_MATERIALS: MaterialsDB = {
  wall_materials: [
    {
      id: "adobe_mud",
      name: "Adobe / Sun-Dried Mud Brick (300mm)",
      category: "earth",
      is_local_earth: true,
      description: "Traditional high thermal mass earthen brick with excellent diurnal thermal damping and zero embodied carbon.",
      thickness_m: 0.30,
      conductivity_w_mk: 0.55,
      density_kg_m3: 1700,
      specific_heat_j_kgk: 1150,
      solar_absorptance: 0.65,
      emissivity: 0.90,
      u_value_w_m2k: 1.45,
      thermal_mass_rating: "High (10-12h lag)"
    },
    {
      id: "rammed_earth",
      name: "Stabilized Rammed Earth (350mm)",
      category: "earth",
      is_local_earth: true,
      description: "Compacted monolithic earth wall offering superb heat retention for cold nights and thermal flywheels.",
      thickness_m: 0.35,
      conductivity_w_mk: 0.70,
      density_kg_m3: 1950,
      specific_heat_j_kgk: 1260,
      solar_absorptance: 0.70,
      emissivity: 0.90,
      u_value_w_m2k: 1.60,
      thermal_mass_rating: "Very High (12-14h lag)"
    },
    {
      id: "cseb_blocks",
      name: "Compressed Stabilized Earth Block - CSEB (230mm)",
      category: "earth",
      is_local_earth: true,
      description: "Engineered local soil blocks stabilized with 5% lime/cement for high durability and thermal capacitance.",
      thickness_m: 0.23,
      conductivity_w_mk: 0.85,
      density_kg_m3: 1850,
      specific_heat_j_kgk: 1000,
      solar_absorptance: 0.68,
      emissivity: 0.88,
      u_value_w_m2k: 2.30,
      thermal_mass_rating: "Moderate-High (8-10h lag)"
    },
    {
      id: "local_stone",
      name: "Local Rubble / Granite Masonry (350mm)",
      category: "stone",
      is_local_earth: true,
      description: "Traditional Himalayan / desert stone construction. Extreme thermal mass, high conductivity.",
      thickness_m: 0.35,
      conductivity_w_mk: 1.80,
      density_kg_m3: 2300,
      specific_heat_j_kgk: 880,
      solar_absorptance: 0.75,
      emissivity: 0.92,
      u_value_w_m2k: 2.85,
      thermal_mass_rating: "High mass, needs insulation in cold"
    },
    {
      id: "red_brick",
      name: "Standard Red Clay Brick (230mm)",
      category: "masonry",
      is_local_earth: false,
      description: "Standard kiln-fired clay brick with mortar plaster.",
      thickness_m: 0.23,
      conductivity_w_mk: 0.80,
      density_kg_m3: 1800,
      specific_heat_j_kgk: 840,
      solar_absorptance: 0.70,
      emissivity: 0.90,
      u_value_w_m2k: 2.20,
      thermal_mass_rating: "Moderate (6-8h lag)"
    },
    {
      id: "concrete_block",
      name: "Concrete Block Wall (200mm)",
      category: "masonry",
      is_local_earth: false,
      description: "Cast hollow or dense concrete masonry block.",
      thickness_m: 0.20,
      conductivity_w_mk: 1.30,
      density_kg_m3: 2100,
      specific_heat_j_kgk: 880,
      solar_absorptance: 0.65,
      emissivity: 0.90,
      u_value_w_m2k: 3.10,
      thermal_mass_rating: "Moderate mass, poor insulation"
    }
  ],
  roof_materials: [
    {
      id: "mud_straw_timber",
      name: "Mud-Plastered Timber / Poplar Twig Roof (150mm)",
      category: "earth",
      is_local_earth: true,
      description: "Traditional Ladakhi flat roof composed of local poplar rafters, willow twigs, dry straw, and compacted clay silt.",
      thickness_m: 0.15,
      conductivity_w_mk: 0.35,
      density_kg_m3: 1200,
      specific_heat_j_kgk: 1300,
      solar_absorptance: 0.60,
      emissivity: 0.90,
      u_value_w_m2k: 1.60
    },
    {
      id: "thatch_bamboo",
      name: "Thatch & Bamboo Sloped Roof (120mm)",
      category: "bio",
      is_local_earth: true,
      description: "Bio-based local thatch grass / reed on bamboo frame. Natural micro-porous insulating layer.",
      thickness_m: 0.12,
      conductivity_w_mk: 0.15,
      density_kg_m3: 350,
      specific_heat_j_kgk: 1600,
      solar_absorptance: 0.50,
      emissivity: 0.85,
      u_value_w_m2k: 1.10
    },
    {
      id: "rcc_concrete",
      name: "RCC Concrete Slab (150mm)",
      category: "masonry",
      is_local_earth: false,
      description: "Reinforced cement concrete flat slab. Rapid night cooling without insulation.",
      thickness_m: 0.15,
      conductivity_w_mk: 1.40,
      density_kg_m3: 2400,
      specific_heat_j_kgk: 900,
      solar_absorptance: 0.70,
      emissivity: 0.90,
      u_value_w_m2k: 3.40
    },
    {
      id: "cgi_sheet",
      name: "Corrugated Galvanized Iron (CGI) Sheet (1.5mm)",
      category: "metal",
      is_local_earth: false,
      description: "Uninsulated corrugated tin/sheet metal roof. Extremely high thermal conductivity and rapid heat loss.",
      thickness_m: 0.0015,
      conductivity_w_mk: 45.0,
      density_kg_m3: 7800,
      specific_heat_j_kgk: 480,
      solar_absorptance: 0.75,
      emissivity: 0.25,
      u_value_w_m2k: 5.80
    }
  ],
  insulation_materials: [
    {
      id: "none",
      name: "None (Uninsulated)",
      category: "none",
      is_local_earth: false,
      description: "Direct envelope heat transfer without thermal resistance layer.",
      thickness_m: 0.0,
      conductivity_w_mk: 1.0,
      density_kg_m3: 0,
      specific_heat_j_kgk: 0,
      u_reduction_factor: 1.0
    },
    {
      id: "straw_woodwool",
      name: "Compressed Straw / Wood-Wool Board (50mm)",
      category: "bio",
      is_local_earth: true,
      description: "Agricultural bio-waste straw insulation board bonded with natural mineral binders.",
      thickness_m: 0.05,
      conductivity_w_mk: 0.055,
      density_kg_m3: 280,
      specific_heat_j_kgk: 1800,
      u_reduction_factor: 0.45
    },
    {
      id: "eps_50",
      name: "Expanded Polystyrene - EPS (50mm)",
      category: "synthetic",
      is_local_earth: false,
      description: "Rigid closed-cell lightweight thermal insulation board.",
      thickness_m: 0.05,
      conductivity_w_mk: 0.036,
      density_kg_m3: 25,
      specific_heat_j_kgk: 1450,
      u_reduction_factor: 0.32
    },
    {
      id: "xps_100",
      name: "Extruded Polystyrene - High Performance XPS (100mm)",
      category: "synthetic",
      is_local_earth: false,
      description: "High-density moisture-resistant insulation for severe sub-zero cold climates.",
      thickness_m: 0.10,
      conductivity_w_mk: 0.028,
      density_kg_m3: 35,
      specific_heat_j_kgk: 1500,
      u_reduction_factor: 0.18
    }
  ],
  glazing_types: [
    {
      id: "single_clear",
      name: "Single Glazed Clear (4mm)",
      category: "glazing",
      is_local_earth: false,
      description: "Standard 4mm single pane float glass.",
      u_value: 5.7,
      shgc: 0.82
    },
    {
      id: "double_clear",
      name: "Double Glazed Air Gap (4-12-4mm)",
      category: "glazing",
      is_local_earth: false,
      description: "Insulated double pane unit with air spacer.",
      u_value: 2.8,
      shgc: 0.70
    },
    {
      id: "double_low_e",
      name: "Double Glazed Low-E Argon (4-12-4mm)",
      category: "glazing",
      is_local_earth: false,
      description: "High performance Low-E coating with argon gas fill.",
      u_value: 1.6,
      shgc: 0.55
    }
  ]
};

export const DEFAULT_SHELTER: ShelterDesign = {
  id: "ladakh_winter_shelter_01",
  name: "Ladakh Winter Shelter",
  location_id: "ladakh",
  shelter_type: "Community Shelter",
  length_m: 4.0,
  width_m: 3.0,
  height_m: 2.8,
  orientation_deg: 180.0,
  wall_material_id: "red_brick",
  roof_material_id: "rcc_concrete",
  insulation_id: "none",
  window_count: 2,
  window_width_m: 1.2,
  window_height_m: 1.0,
  glazing_id: "single_clear",
  advanced_settings: {
    internal_convection_coeff: 8.0,
    external_convection_coeff: 22.0,
    infiltration_rate_ach: 1.0,
    internal_heat_gain_w: 150.0,
    ground_coupling_factor: 0.7,
    time_step_sec: 3600
  }
};

export async function fetchClimates(): Promise<Climate[]> {
  try {
    const res = await fetch(`${API_BASE}/climates`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("Using fallback climates", e);
  }
  return DEFAULT_CLIMATES;
}

export async function fetchMaterials(): Promise<MaterialsDB> {
  try {
    const res = await fetch(`${API_BASE}/materials`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("Using fallback materials", e);
  }
  return DEFAULT_MATERIALS;
}

export async function runSimulationApi(
  design: ShelterDesign,
  initialTemp?: number,
  engineType: string = "reduced_order"
): Promise<SimulationResult> {
  try {
    const res = await fetch(`${API_BASE}/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        design,
        initial_temp_c: initialTemp,
        engine_type: engineType,
        duration_hours: 24
      })
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("Backend API unavailable, computing client-side transient physics", e);
  }
  return runClientTransientSimulation(design, initialTemp);
}

export async function fetchRecommendationApi(design: ShelterDesign): Promise<ComparisonResponse> {
  try {
    const res = await fetch(`${API_BASE}/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(design)
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("Backend API unavailable, generating client recommendation", e);
  }
  return generateClientRecommendation(design);
}

// Client-side transient physics engine fallback for offline / instant client experience
function runClientTransientSimulation(design: ShelterDesign, initialTemp?: number): SimulationResult {
  const climate = DEFAULT_CLIMATES.find(c => c.id === design.location_id) || DEFAULT_CLIMATES[0];
  const wallMat = DEFAULT_MATERIALS.wall_materials.find(m => m.id === design.wall_material_id) || DEFAULT_MATERIALS.wall_materials[0];
  const roofMat = DEFAULT_MATERIALS.roof_materials.find(m => m.id === design.roof_material_id) || DEFAULT_MATERIALS.roof_materials[0];
  const insulMat = DEFAULT_MATERIALS.insulation_materials.find(m => m.id === design.insulation_id) || DEFAULT_MATERIALS.insulation_materials[0];
  const glazing = DEFAULT_MATERIALS.glazing_types.find(g => g.id === design.glazing_id) || DEFAULT_MATERIALS.glazing_types[0];

  const L = design.length_m;
  const W = design.width_m;
  const H = design.height_m;
  const volume = L * W * H;
  const areaRoof = L * W;
  const areaFloor = L * W;
  const areaWin = design.window_count * design.window_width_m * design.window_height_m;
  const areaGrossWalls = 2.0 * (L + W) * H;
  const areaNetWalls = Math.max(1.0, areaGrossWalls - areaWin);

  const hIn = design.advanced_settings?.internal_convection_coeff || 8.0;
  const hOut = design.advanced_settings?.external_convection_coeff || 22.0;
  const rInsul = (insulMat.thickness_m && insulMat.conductivity_w_mk) ? (insulMat.thickness_m / insulMat.conductivity_w_mk) : 0.0;

  const rWall = (wallMat.thickness_m || 0.23) / (wallMat.conductivity_w_mk || 0.8);
  const uWall = 1.0 / ((1.0 / hIn) + rWall + rInsul + (1.0 / hOut));

  const rRoof = (roofMat.thickness_m || 0.15) / (roofMat.conductivity_w_mk || 1.4);
  const uRoof = 1.0 / ((1.0 / hIn) + rRoof + rInsul + (1.0 / hOut));

  const uWin = glazing.u_value || 5.7;
  const shgc = glazing.shgc || 0.82;
  const uFloor = 0.8 * (design.advanced_settings?.ground_coupling_factor || 0.7);

  const cAir = 1.204 * 1005.0 * volume;
  const effFrac = 0.35;
  const mWall = areaNetWalls * (wallMat.thickness_m || 0.23) * effFrac * (wallMat.density_kg_m3 || 1800);
  const cWall = mWall * (wallMat.specific_heat_j_kgk || 900);
  const mRoof = areaRoof * (roofMat.thickness_m || 0.15) * effFrac * (roofMat.density_kg_m3 || 2400);
  const cRoof = mRoof * (roofMat.specific_heat_j_kgk || 900);
  const cTotal = cAir + cWall + cRoof;

  const hourlyTOut = climate.hourly_outdoor_temp;
  const hourlySolar = climate.hourly_solar_irradiance;
  const tGround = climate.ground_temp;
  const ach = design.advanced_settings?.infiltration_rate_ach || 1.0;
  const mDotInfil = (ach * volume * 1.204) / 3600.0;
  const cpAir = 1005.0;

  const orientRad = (design.orientation_deg * Math.PI) / 180.0;
  const alphaRoof = roofMat.solar_absorptance || 0.7;
  const alphaWall = wallMat.solar_absorptance || 0.65;
  const qInternal = design.advanced_settings?.internal_heat_gain_w || 150.0;

  let tIndoor = initialTemp !== undefined ? initialTemp : (hourlyTOut.reduce((a, b) => a + b, 0) / 24 + 4.0);

  // Warmup cycles
  const subSteps = 10;
  const dtSub = 3600.0 / subSteps;
  for (let cycle = 0; cycle < 3; cycle++) {
    for (let h = 0; h < 24; h++) {
      const tOut = hourlyTOut[h];
      const iGlo = hourlySolar[h];
      const tSolRoof = iGlo > 0 ? (tOut + (alphaRoof * iGlo / hOut) - 2.5) : (tOut - 3.5);
      const solarWallFactor = 0.55 + 0.35 * Math.cos(orientRad - Math.PI);
      const iWall = iGlo * Math.max(0.0, solarWallFactor);
      const tSolWall = iWall > 0 ? (tOut + (alphaWall * iWall / hOut) - 1.5) : (tOut - 1.5);
      const qSolWin = areaWin * shgc * iGlo * Math.max(0.1, Math.cos(orientRad - Math.PI) * 0.7);

      for (let s = 0; s < subSteps; s++) {
        const qRoof = areaRoof * uRoof * (tSolRoof - tIndoor);
        const qWall = areaNetWalls * uWall * (tSolWall - tIndoor);
        const qWin = areaWin * uWin * (tOut - tIndoor);
        const qFloor = areaFloor * uFloor * (tGround - tIndoor);
        const qInfil = mDotInfil * cpAir * (tOut - tIndoor);

        const qNet = qRoof + qWall + qWin + qFloor + qInfil + qSolWin + qInternal;
        tIndoor += (qNet * dtSub) / cTotal;
      }
    }
  }

  // Final 24h cycle
  const hourlyData = [];
  let lossRoof = 0, lossWalls = 0, lossWin = 0, lossInfil = 0, lossFloor = 0, totalSolarJ = 0;

  for (let h = 0; h < 24; h++) {
    const tOut = hourlyTOut[h];
    const iGlo = hourlySolar[h];
    const tSolRoof = iGlo > 0 ? (tOut + (alphaRoof * iGlo / hOut) - 2.5) : (tOut - 3.5);
    const solarWallFactor = 0.55 + 0.35 * Math.cos(orientRad - Math.PI);
    const iWall = iGlo * Math.max(0.0, solarWallFactor);
    const tSolWall = iWall > 0 ? (tOut + (alphaWall * iWall / hOut) - 1.5) : (tOut - 1.5);
    const qSolWin = areaWin * shgc * iGlo * Math.max(0.1, Math.cos(orientRad - Math.PI) * 0.7);
    totalSolarJ += qSolWin * 3600.0;

    let hourlyMaxLoss = 0;

    for (let s = 0; s < subSteps; s++) {
      const qRoof = areaRoof * uRoof * (tSolRoof - tIndoor);
      const qWall = areaNetWalls * uWall * (tSolWall - tIndoor);
      const qWin = areaWin * uWin * (tOut - tIndoor);
      const qFloor = areaFloor * uFloor * (tGround - tIndoor);
      const qInfil = mDotInfil * cpAir * (tOut - tIndoor);

      if (qRoof < 0) lossRoof += Math.abs(qRoof) * dtSub;
      if (qWall < 0) lossWalls += Math.abs(qWall) * dtSub;
      if (qWin < 0) lossWin += Math.abs(qWin) * dtSub;
      if (qInfil < 0) lossInfil += Math.abs(qInfil) * dtSub;
      if (qFloor < 0) lossFloor += Math.abs(qFloor) * dtSub;

      const currentInstantLoss = (qRoof < 0 ? Math.abs(qRoof) : 0) + (qWall < 0 ? Math.abs(qWall) : 0) + (qWin < 0 ? Math.abs(qWin) : 0) + (qInfil < 0 ? Math.abs(qInfil) : 0);
      if (currentInstantLoss > hourlyMaxLoss) hourlyMaxLoss = currentInstantLoss;

      const qNet = qRoof + qWall + qWin + qFloor + qInfil + qSolWin + qInternal;
      tIndoor += (qNet * dtSub) / cTotal;
    }

    hourlyData.push({
      hour: h,
      time_label: `${String(h).padStart(2, '0')}:00`,
      outdoor_temp: Number(tOut.toFixed(1)),
      indoor_temp: Number(tIndoor.toFixed(1)),
      solar_irradiance: Math.round(iGlo),
      solar_gain_w: Number(qSolWin.toFixed(1)),
      heat_loss_w: Number(hourlyMaxLoss.toFixed(1)),
      is_sunset: h === 18,
      is_2am: h === 2,
      is_sunrise: h === 6
    });
  }

  const inTemps = hourlyData.map(d => d.indoor_temp);
  const meanIndoor = inTemps.reduce((a, b) => a + b, 0) / 24;
  const minIndoor = Math.min(...inTemps);
  const maxIndoor = Math.max(...inTemps);
  const temp2am = hourlyData[2].indoor_temp;
  const out2am = hourlyData[2].outdoor_temp;

  const deltaIn = maxIndoor - minIndoor;
  const deltaOut = Math.max(...hourlyTOut) - Math.min(...hourlyTOut);
  const dampingRatio = Math.max(0.0, Math.min(0.95, 1.0 - (deltaIn / Math.max(0.1, deltaOut))));

  const totalLossJ = Math.max(1.0, lossRoof + lossWalls + lossWin + lossInfil + lossFloor);
  const roofPct = (lossRoof / totalLossJ) * 100.0;
  const wallsPct = (lossWalls / totalLossJ) * 100.0;
  const winPct = (lossWin / totalLossJ) * 100.0;
  const infilPct = (lossInfil / totalLossJ) * 100.0;
  const groundPct = (lossFloor / totalLossJ) * 100.0;

  const totalLossKwh = totalLossJ / 3.6e6;
  const peakLossKw = Math.max(...hourlyData.map(d => d.heat_loss_w)) / 1000.0;
  const totalSolarKwh = totalSolarJ / 3.6e6;

  const suggestions: string[] = [];
  if (roofPct >= 30.0) suggestions.push(`Roof accounts for ${roofPct.toFixed(1)}% of total heat loss: Add 50-100mm strawboard or EPS insulation.`);
  if (winPct >= 20.0 && glazing.id === 'single_clear') suggestions.push('Windows account for high conductive loss: Upgrade to double-glazed units.');
  if (wallsPct >= 30.0 && !wallMat.is_local_earth) suggestions.push('Switch to high thermal mass local Adobe or Rammed Earth walls (300mm+).');
  if (infilPct >= 18.0) suggestions.push('Infiltration is significant: Install airtight window gaskets and an entry airlock.');
  if (suggestions.length === 0) suggestions.push('The shelter envelope is well-balanced for this microclimate.');

  const dominant = roofPct >= wallsPct && roofPct >= winPct ? `Roof (${roofPct.toFixed(1)}%)` : `Walls (${wallsPct.toFixed(1)}%)`;

  let verdict = "Thermally Comfortable — Indoor temperature remains well-buffered within the comfort envelope.";
  if (minIndoor < 10.0) verdict = "Severe Cold Discomfort — Urgent thermal insulation required to maintain habitable conditions.";
  else if (minIndoor < 16.0) verdict = "Moderately Cool — Good thermal mass buffering, but night heat retention needs enhancement.";
  else if (maxIndoor > 32.0) verdict = "Overheating Risk — Consider shading and high-mass passive night ventilation.";

  return {
    design_id: design.id,
    design_name: design.name,
    engine_used: "Reduced-Order Transient Model",
    is_reduced_order: true,
    transparency_disclaimer: "Simulation results depend on input climate data, material properties, and boundary-condition assumptions.",
    mean_indoor_temp: Number(meanIndoor.toFixed(1)),
    min_indoor_temp: Number(minIndoor.toFixed(1)),
    max_indoor_temp: Number(maxIndoor.toFixed(1)),
    temp_at_2am: Number(temp2am.toFixed(1)),
    outdoor_temp_at_2am: Number(out2am.toFixed(1)),
    total_heat_loss_kwh: Number(totalLossKwh.toFixed(2)),
    peak_heat_loss_kw: Number(peakLossKw.toFixed(2)),
    total_solar_gain_kwh: Number(totalSolarKwh.toFixed(2)),
    thermal_damping_ratio: Number(dampingRatio.toFixed(2)),
    thermal_lag_hours: 6.0,
    comfort_verdict: verdict,
    hourly_data: hourlyData,
    heat_loss_breakdown: {
      roof_percent: Number(roofPct.toFixed(1)),
      roof_watts: Number((lossRoof / 86400).toFixed(1)),
      walls_percent: Number(wallsPct.toFixed(1)),
      walls_watts: Number((lossWalls / 86400).toFixed(1)),
      windows_percent: Number(winPct.toFixed(1)),
      windows_watts: Number((lossWin / 86400).toFixed(1)),
      ventilation_percent: Number(infilPct.toFixed(1)),
      ventilation_watts: Number((lossInfil / 86400).toFixed(1)),
      ground_percent: Number(groundPct.toFixed(1)),
      ground_watts: Number((lossFloor / 86400).toFixed(1)),
      dominant_path: dominant
    },
    design_suggestions: suggestions
  };
}

function generateClientRecommendation(currentDesign: ShelterDesign): ComparisonResponse {
  const currentResult = runClientTransientSimulation(currentDesign);
  const isCold = ["ladakh", "dras", "shillong"].includes(currentDesign.location_id);

  const rec: ShelterDesign = JSON.parse(JSON.stringify(currentDesign));
  rec.id = `${currentDesign.id}_optimized`;
  rec.name = `AASHRAY Climate-Optimized Design (${currentDesign.shelter_type})`;

  const reasons: string[] = [];

  if (isCold) {
    rec.wall_material_id = "adobe_mud";
    reasons.push("Replaced standard masonry with 300mm Sun-Dried Adobe Mud bricks to boost thermal mass and nighttime heat retention.");
    rec.roof_material_id = "mud_straw_timber";
    reasons.push("Upgraded roof to traditional multi-layer Mud-Plastered Timber deck with high thermal resistance.");
    rec.insulation_id = currentDesign.location_id === "dras" ? "xps_100" : "straw_woodwool";
    reasons.push("Added natural compressed strawboard / bio-insulation layer to eliminate roof thermal bridges.");
    rec.glazing_id = "double_clear";
    reasons.push("Upgraded windows to double-glazed air cavity units to reduce nighttime conductive window heat loss.");
    rec.orientation_deg = 180.0;
    reasons.push("Oriented main openings due South (180°) for passive solar heat capture throughout the day.");
    rec.advanced_settings.infiltration_rate_ach = 0.6;
  } else {
    rec.wall_material_id = "rammed_earth";
    reasons.push("Used Stabilized Rammed Earth (350mm) to delay external peak heat wave arrival by 10-12 hours.");
    rec.roof_material_id = "mud_straw_timber";
    rec.insulation_id = "straw_woodwool";
    rec.glazing_id = "double_low_e";
    reasons.push("Added wood-wool roof insulation and Low-E glazing to deflect excessive midday solar radiation.");
  }

  const recResult = runClientTransientSimulation(rec);
  const tempDiff = Number((recResult.temp_at_2am - currentResult.temp_at_2am).toFixed(1));
  const heatLossDiff = Number((recResult.total_heat_loss_kwh - currentResult.total_heat_loss_kwh).toFixed(2));
  const solarGainDiff = Number((recResult.total_solar_gain_kwh - currentResult.total_solar_gain_kwh).toFixed(2));

  return {
    current_design: currentDesign,
    recommended_design: rec,
    current_result: currentResult,
    recommended_result: recResult,
    metrics: [
      {
        metric: "Night-time Temp (2 AM)",
        unit: "°C",
        current_value: currentResult.temp_at_2am,
        recommended_value: recResult.temp_at_2am,
        difference: tempDiff,
        is_better: isCold ? tempDiff > 0 : tempDiff < 0,
        explanation: "Calculated minimum temperature inside shelter during the coldest night hour."
      },
      {
        metric: "Total 24h Heat Loss",
        unit: "kWh",
        current_value: currentResult.total_heat_loss_kwh,
        recommended_value: recResult.total_heat_loss_kwh,
        difference: heatLossDiff,
        is_better: heatLossDiff < 0,
        explanation: "Integrated 24-hour thermal energy escaping through envelope."
      },
      {
        metric: "Passive Solar Heat Gain",
        unit: "kWh",
        current_value: currentResult.total_solar_gain_kwh,
        recommended_value: recResult.total_solar_gain_kwh,
        difference: solarGainDiff,
        is_better: isCold ? solarGainDiff > 0 : solarGainDiff < 0,
        explanation: "Useful solar radiation captured through orientation-aligned glazed openings."
      },
      {
        metric: "Thermal Damping Ratio",
        unit: "%",
        current_value: Math.round(currentResult.thermal_damping_ratio * 100),
        recommended_value: Math.round(recResult.thermal_damping_ratio * 100),
        difference: Math.round((recResult.thermal_damping_ratio - currentResult.thermal_damping_ratio) * 100),
        is_better: recResult.thermal_damping_ratio >= currentResult.thermal_damping_ratio,
        explanation: "Capacity of local earth thermal mass to flatten indoor temperature swings."
      }
    ],
    architectural_reasoning: reasons
  };
}
