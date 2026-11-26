import * as THREE from 'three';
import type { ShelterDesign, MaterialsDB } from '../../types';

export interface SurfaceData {
  id: string;
  name: string;
  normal: THREE.Vector3; // in shelter local space
  area_m2: number;
  mesh: THREE.Mesh;
  baseColor: number;
}

export interface OpeningData {
  id: string;
  type: 'door' | 'window';
  position: THREE.Vector3; // in world space relative to shelter group
  normal: THREE.Vector3; // outward normal vector
  width: number;
  height: number;
  isExposedToRain: boolean;
  mesh: THREE.Mesh;
}

export interface ShelterGeometryResult {
  group: THREE.Group;
  surfaces: SurfaceData[];
  openings: OpeningData[];
  roofHeight: number;
  roofBoundingBox: THREE.Box3;
  waterFlowPaths: THREE.Vector3[][];
  gutterPoints: THREE.Vector3[];
  snowMesh: THREE.Group | null;
  cutawayGroup: THREE.Group | null;
  heatLossMeshGroup: THREE.Group | null;
  drainageRunoffGroup: THREE.Group | null;
}

// Material color mapper
export const getWallColor = (wallId: string): number => {
  switch (wallId) {
    case 'adobe_mud': return 0xC89D7C;       // Warm earthen clay
    case 'rammed_earth': return 0xB27A56;     // Terracotta earth
    case 'cseb_blocks': return 0xD6B89A;      // Sandstone earth
    case 'local_stone': return 0x9E9B93;      // Himalayan gray stone
    case 'red_brick': return 0xBF5B45;        // Red brick
    case 'concrete_block': return 0xB0B3B2;   // Concrete gray
    default: return 0xC89D7C;
  }
};

export const getRoofColor = (roofId: string): number => {
  switch (roofId) {
    case 'mud_straw_timber': return 0x8D6E63; // Earthen thatch/timber
    case 'thatch_bamboo': return 0xC5A059;    // Golden straw thatch
    case 'rcc_concrete': return 0x9E9E9E;     // RCC slab
    case 'cgi_sheet': return 0x78909C;        // Galvanized metal
    default: return 0x8D6E63;
  }
};

export const getInsulationColor = (insulId: string): number => {
  switch (insulId) {
    case 'straw_woodwool': return 0xD2B48C; // Natural straw board
    case 'eps_50': return 0xBAE6FD;         // Light blue EPS foam
    case 'xps_100': return 0xFB923C;        // Bright orange XPS board
    default: return 0xCCCCCC;
  }
};

/**
 * Builds the complete 3D shelter with all functional geometries, dynamic typologies,
 * drainage paths, snow blankets, and cutaway insulation sections.
 */
export function buildShelterGeometry(
  design: ShelterDesign,
  _materials: MaterialsDB,
  options: {
    showSnow: boolean;
    showCutaway: boolean;
    showHeatLoss: boolean;
    showDrainage: boolean;
  }
): ShelterGeometryResult {
  const group = new THREE.Group();
  const surfaces: SurfaceData[] = [];
  const openings: OpeningData[] = [];
  const waterFlowPaths: THREE.Vector3[][] = [];
  const gutterPoints: THREE.Vector3[] = [];

  const L = design.length_m;
  const W = design.width_m;
  const H = design.height_m;
  const shelterType = design.shelter_type || 'Community Shelter';

  const wallColor = getWallColor(design.wall_material_id);
  const roofColor = getRoofColor(design.roof_material_id);
  const insulColor = getInsulationColor(design.insulation_id);

  // Foundation Plinth (Raised earthen/stone plinth for flood protection)
  const plinthHeight = 0.25;
  const plinthGeo = new THREE.BoxGeometry(L + 0.5, plinthHeight, W + 0.5);
  const plinthMat = new THREE.MeshStandardMaterial({
    color: 0x78716C,
    roughness: 0.9,
    metalness: 0.1
  });
  const plinthMesh = new THREE.Mesh(plinthGeo, plinthMat);
  plinthMesh.position.y = plinthHeight / 2;
  plinthMesh.receiveShadow = true;
  group.add(plinthMesh);

  // Common Wall Material
  const wallMat = new THREE.MeshStandardMaterial({
    color: wallColor,
    roughness: 0.85,
    metalness: 0.05
  });

  let totalRoofApexY = H + plinthHeight + 0.25;

  // -------------------------------------------------------------
  // TYPOLOGY SPECIFIC GEOMETRY BUILDERS
  // -------------------------------------------------------------

  if (shelterType.includes('Transit') || shelterType.includes('Bus')) {
    // 3. TRANSIT / BUS SHELTER (Semi-open pavilion, rear windbreak, cantilevered canopy)
    // Rear wall (North/Back)
    const backWallGeo = new THREE.BoxGeometry(L, H, 0.25);
    const backWallMesh = new THREE.Mesh(backWallGeo, wallMat);
    backWallMesh.position.set(0, plinthHeight + H / 2, -W / 2 + 0.125);
    backWallMesh.castShadow = true;
    backWallMesh.receiveShadow = true;
    group.add(backWallMesh);
    surfaces.push({
      id: 'back_wall',
      name: 'Rear Windbreak Wall',
      normal: new THREE.Vector3(0, 0, -1),
      area_m2: L * H,
      mesh: backWallMesh,
      baseColor: wallColor
    });

    // Left and Right Partial Side Walls (Wind deflectors)
    const sideWallGeo = new THREE.BoxGeometry(0.2, H, W * 0.7);
    const leftWallMesh = new THREE.Mesh(sideWallGeo, wallMat);
    leftWallMesh.position.set(-L / 2 + 0.1, plinthHeight + H / 2, -W * 0.15);
    leftWallMesh.castShadow = true;
    group.add(leftWallMesh);
    surfaces.push({
      id: 'left_wall',
      name: 'West Wing Wall',
      normal: new THREE.Vector3(-1, 0, 0),
      area_m2: (W * 0.7) * H,
      mesh: leftWallMesh,
      baseColor: wallColor
    });

    const rightWallMesh = new THREE.Mesh(sideWallGeo, wallMat);
    rightWallMesh.position.set(L / 2 - 0.1, plinthHeight + H / 2, -W * 0.15);
    rightWallMesh.castShadow = true;
    group.add(rightWallMesh);
    surfaces.push({
      id: 'right_wall',
      name: 'East Wing Wall',
      normal: new THREE.Vector3(1, 0, 0),
      area_m2: (W * 0.7) * H,
      mesh: rightWallMesh,
      baseColor: wallColor
    });

    // Front Support Columns
    const colGeo = new THREE.CylinderGeometry(0.08, 0.08, H, 16);
    const colMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6, roughness: 0.3 });
    const col1 = new THREE.Mesh(colGeo, colMat);
    col1.position.set(-L * 0.42, plinthHeight + H / 2, W / 2 - 0.15);
    col1.castShadow = true;
    group.add(col1);
    const col2 = new THREE.Mesh(colGeo, colMat);
    col2.position.set(L * 0.42, plinthHeight + H / 2, W / 2 - 0.15);
    col2.castShadow = true;
    group.add(col2);

    // Passenger Waiting Bench
    const benchGeo = new THREE.BoxGeometry(L * 0.75, 0.45, 0.45);
    const benchMat = new THREE.MeshStandardMaterial({ color: 0x92400E, roughness: 0.7 });
    const bench = new THREE.Mesh(benchGeo, benchMat);
    bench.position.set(0, plinthHeight + 0.225, -W / 2 + 0.55);
    bench.castShadow = true;
    group.add(bench);

    // Sloped Cantilevered Canopy Roof (Tilted slightly backward for rear rainwater harvesting)
    const roofThick = 0.15;
    const roofOverhang = 0.6;
    const roofL = L + roofOverhang * 2;
    const roofW = W + roofOverhang * 2;
    const roofGeo = new THREE.BoxGeometry(roofL, roofThick, roofW);
    const roofMat = new THREE.MeshStandardMaterial({
      color: roofColor,
      roughness: 0.6,
      metalness: 0.15
    });
    const roofMesh = new THREE.Mesh(roofGeo, roofMat);
    roofMesh.position.set(0, plinthHeight + H + roofThick / 2, 0);
    roofMesh.rotation.x = 0.08; // Slopes down toward rear
    roofMesh.castShadow = true;
    roofMesh.receiveShadow = true;
    group.add(roofMesh);

    totalRoofApexY = plinthHeight + H + roofThick + 0.2;

    surfaces.push({
      id: 'roof_surface',
      name: 'Sloped Canopy Deck',
      normal: new THREE.Vector3(0, Math.cos(0.08), -Math.sin(0.08)),
      area_m2: roofL * roofW,
      mesh: roofMesh,
      baseColor: roofColor
    });

    // Rear Gutter along back edge
    const gutterGeo = new THREE.BoxGeometry(roofL, 0.08, 0.08);
    const gutterMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
    const gutter = new THREE.Mesh(gutterGeo, gutterMat);
    gutter.position.set(0, plinthHeight + H - 0.05, -roofW / 2);
    group.add(gutter);
    gutterPoints.push(
      new THREE.Vector3(-roofL / 2, plinthHeight + H - 0.05, -roofW / 2),
      new THREE.Vector3(roofL / 2, plinthHeight + H - 0.05, -roofW / 2)
    );

    // Water flow paths running from front canopy edge to rear gutter
    for (let i = -0.4; i <= 0.4; i += 0.2) {
      waterFlowPaths.push([
        new THREE.Vector3(roofL * i, plinthHeight + H + 0.12, roofW / 2 - 0.1),
        new THREE.Vector3(roofL * i, plinthHeight + H + 0.02, 0),
        new THREE.Vector3(roofL * i, plinthHeight + H - 0.06, -roofW / 2 + 0.05)
      ]);
    }

    // Main Open Facade (Registered as wide passenger opening)
    openings.push({
      id: 'transit_main_opening',
      type: 'door',
      position: new THREE.Vector3(0, plinthHeight + H / 2, W / 2),
      normal: new THREE.Vector3(0, 0, 1),
      width: L * 0.85,
      height: H,
      isExposedToRain: true,
      mesh: bench
    });

  } else if (shelterType.includes('Barrack') || shelterType.includes('Worker')) {
    // 2. WORKER / ARMY BARRACK (Elongated modular structure, mono-pitch/low gable, end door, repeated vents)
    // Main Enclosed Body
    const wallGeo = new THREE.BoxGeometry(L, H, W);
    const wallMesh = new THREE.Mesh(wallGeo, wallMat);
    wallMesh.position.set(0, plinthHeight + H / 2, 0);
    wallMesh.castShadow = true;
    wallMesh.receiveShadow = true;
    group.add(wallMesh);

    surfaces.push(
      { id: 'front_wall', name: 'South Long Facade', normal: new THREE.Vector3(0, 0, 1), area_m2: L * H, mesh: wallMesh, baseColor: wallColor },
      { id: 'back_wall', name: 'North Long Facade', normal: new THREE.Vector3(0, 0, -1), area_m2: L * H, mesh: wallMesh, baseColor: wallColor },
      { id: 'left_wall', name: 'West End Gable', normal: new THREE.Vector3(-1, 0, 0), area_m2: W * H, mesh: wallMesh, baseColor: wallColor },
      { id: 'right_wall', name: 'East End Door Facade', normal: new THREE.Vector3(1, 0, 0), area_m2: W * H, mesh: wallMesh, baseColor: wallColor }
    );

    // Shallow Gable Roof with ribbed CGI appearance
    const gableHeight = 0.6;
    const roofShape = new THREE.Shape();
    roofShape.moveTo(-W / 2 - 0.3, 0);
    roofShape.lineTo(0, gableHeight);
    roofShape.lineTo(W / 2 + 0.3, 0);
    roofShape.closePath();

    const extrudeSettings = { depth: L + 0.6, bevelEnabled: false };
    const roofGeo = new THREE.ExtrudeGeometry(roofShape, extrudeSettings);
    roofGeo.center();

    const roofMat = new THREE.MeshStandardMaterial({
      color: roofColor,
      roughness: 0.5,
      metalness: 0.3
    });
    const roofMesh = new THREE.Mesh(roofGeo, roofMat);
    roofMesh.rotation.y = Math.PI / 2;
    roofMesh.position.set(0, plinthHeight + H + gableHeight / 2, 0);
    roofMesh.castShadow = true;
    roofMesh.receiveShadow = true;
    group.add(roofMesh);

    totalRoofApexY = plinthHeight + H + gableHeight;

    surfaces.push({
      id: 'roof_gable_south',
      name: 'South Roof Pitch',
      normal: new THREE.Vector3(0, Math.cos(Math.atan2(gableHeight, W / 2)), Math.sin(Math.atan2(gableHeight, W / 2))),
      area_m2: (L + 0.6) * Math.sqrt((W / 2) ** 2 + gableHeight ** 2),
      mesh: roofMesh,
      baseColor: roofColor
    });

    // End Entry Door (East Side)
    const doorGeo = new THREE.PlaneGeometry(0.9, Math.min(2.1, H * 0.85));
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x3E2723, roughness: 0.6 });
    const doorMesh = new THREE.Mesh(doorGeo, doorMat);
    doorMesh.rotation.y = Math.PI / 2;
    doorMesh.position.set(L / 2 + 0.01, plinthHeight + Math.min(2.1, H * 0.85) / 2, 0);
    group.add(doorMesh);

    openings.push({
      id: 'barrack_end_door',
      type: 'door',
      position: doorMesh.position.clone(),
      normal: new THREE.Vector3(1, 0, 0),
      width: 0.9,
      height: Math.min(2.1, H * 0.85),
      isExposedToRain: false,
      mesh: doorMesh
    });

    // Series of 4 rhythmic side ventilation windows along long side
    const winGeo = new THREE.PlaneGeometry(0.8, 0.7);
    const winMat = new THREE.MeshStandardMaterial({ color: 0x80D8FF, roughness: 0.1, transparent: true, opacity: 0.75 });
    const winOffsets = [-L * 0.35, -L * 0.12, L * 0.12, L * 0.35];
    winOffsets.forEach((xPos, idx) => {
      const winMesh = new THREE.Mesh(winGeo, winMat);
      winMesh.position.set(xPos, plinthHeight + H * 0.58, W / 2 + 0.01);
      group.add(winMesh);

      openings.push({
        id: `barrack_win_${idx}`,
        type: 'window',
        position: winMesh.position.clone(),
        normal: new THREE.Vector3(0, 0, 1),
        width: 0.8,
        height: 0.7,
        isExposedToRain: true,
        mesh: winMesh
      });
    });

    // Gutters along long south and north eaves
    const gutterGeo = new THREE.BoxGeometry(L + 0.7, 0.07, 0.07);
    const gutterMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
    const gSouth = new THREE.Mesh(gutterGeo, gutterMat);
    gSouth.position.set(0, plinthHeight + H, W / 2 + 0.32);
    group.add(gSouth);
    const gNorth = new THREE.Mesh(gutterGeo, gutterMat);
    gNorth.position.set(0, plinthHeight + H, -W / 2 - 0.32);
    group.add(gNorth);

    gutterPoints.push(
      new THREE.Vector3(-L / 2 - 0.3, plinthHeight + H, W / 2 + 0.32),
      new THREE.Vector3(L / 2 + 0.3, plinthHeight + H, W / 2 + 0.32),
      new THREE.Vector3(-L / 2 - 0.3, plinthHeight + H, -W / 2 - 0.32),
      new THREE.Vector3(L / 2 + 0.3, plinthHeight + H, -W / 2 - 0.32)
    );

    // Water flow lines down both gable pitches
    [-0.3, 0, 0.3].forEach(pct => {
      waterFlowPaths.push([
        new THREE.Vector3(L * pct, plinthHeight + H + gableHeight, 0),
        new THREE.Vector3(L * pct, plinthHeight + H + gableHeight * 0.5, W * 0.25),
        new THREE.Vector3(L * pct, plinthHeight + H, W / 2 + 0.3)
      ]);
      waterFlowPaths.push([
        new THREE.Vector3(L * pct, plinthHeight + H + gableHeight, 0),
        new THREE.Vector3(L * pct, plinthHeight + H + gableHeight * 0.5, -W * 0.25),
        new THREE.Vector3(L * pct, plinthHeight + H, -W / 2 - 0.3)
      ]);
    });

  } else if (shelterType.includes('Residence') || shelterType.includes('Residential')) {
    // 4. HIGH-ALTITUDE RESIDENCE (Steep dual-pitch roof for snow shedding, stone plinth, vestibule porch, chimney)
    const wallGeo = new THREE.BoxGeometry(L, H, W);
    const wallMesh = new THREE.Mesh(wallGeo, wallMat);
    wallMesh.position.set(0, plinthHeight + H / 2, 0);
    wallMesh.castShadow = true;
    wallMesh.receiveShadow = true;
    group.add(wallMesh);

    surfaces.push(
      { id: 'front_wall', name: 'South Wall (Solar Facade)', normal: new THREE.Vector3(0, 0, 1), area_m2: L * H, mesh: wallMesh, baseColor: wallColor },
      { id: 'back_wall', name: 'North Protected Wall', normal: new THREE.Vector3(0, 0, -1), area_m2: L * H, mesh: wallMesh, baseColor: wallColor },
      { id: 'left_wall', name: 'West Wall', normal: new THREE.Vector3(-1, 0, 0), area_m2: W * H, mesh: wallMesh, baseColor: wallColor },
      { id: 'right_wall', name: 'East Wall', normal: new THREE.Vector3(1, 0, 0), area_m2: W * H, mesh: wallMesh, baseColor: wallColor }
    );

    // Steep High-Pitch Gable Roof (40° snow-shedding angle)
    const gableHeight = Math.min(2.0, (W / 2) * Math.tan(40 * Math.PI / 180));
    const roofShape = new THREE.Shape();
    roofShape.moveTo(-W / 2 - 0.45, 0);
    roofShape.lineTo(0, gableHeight);
    roofShape.lineTo(W / 2 + 0.45, 0);
    roofShape.closePath();

    const extrudeSettings = { depth: L + 0.7, bevelEnabled: false };
    const roofGeo = new THREE.ExtrudeGeometry(roofShape, extrudeSettings);
    roofGeo.center();

    const roofMat = new THREE.MeshStandardMaterial({
      color: roofColor,
      roughness: 0.75,
      metalness: 0.1
    });
    const roofMesh = new THREE.Mesh(roofGeo, roofMat);
    roofMesh.rotation.y = Math.PI / 2;
    roofMesh.position.set(0, plinthHeight + H + gableHeight / 2, 0);
    roofMesh.castShadow = true;
    roofMesh.receiveShadow = true;
    group.add(roofMesh);

    totalRoofApexY = plinthHeight + H + gableHeight;

    surfaces.push({
      id: 'steep_roof_south',
      name: 'Steep South Snow Pitch',
      normal: new THREE.Vector3(0, Math.cos(40 * Math.PI / 180), Math.sin(40 * Math.PI / 180)),
      area_m2: (L + 0.7) * Math.sqrt((W / 2) ** 2 + gableHeight ** 2),
      mesh: roofMesh,
      baseColor: roofColor
    });

    // Chimney Stack on Roof
    const chimneyGeo = new THREE.BoxGeometry(0.4, 1.1, 0.4);
    const chimneyMat = new THREE.MeshStandardMaterial({ color: 0x78716C, roughness: 0.9 });
    const chimney = new THREE.Mesh(chimneyGeo, chimneyMat);
    chimney.position.set(L * 0.28, plinthHeight + H + gableHeight + 0.35, 0);
    chimney.castShadow = true;
    group.add(chimney);

    // Entryway Vestibule (Airlock Porch)
    const porchL = 1.2;
    const porchW = 0.9;
    const porchH = Math.min(2.2, H * 0.8);
    const porchGeo = new THREE.BoxGeometry(porchL, porchH, porchW);
    const porchMat = new THREE.MeshStandardMaterial({ color: wallColor * 0.95 });
    const porchMesh = new THREE.Mesh(porchGeo, porchMat);
    porchMesh.position.set(0, plinthHeight + porchH / 2, W / 2 + porchW / 2);
    porchMesh.castShadow = true;
    group.add(porchMesh);

    // Front Door inside porch
    const doorGeo = new THREE.PlaneGeometry(0.85, 1.95);
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x4E342E, roughness: 0.5 });
    const doorMesh = new THREE.Mesh(doorGeo, doorMat);
    doorMesh.position.set(0, plinthHeight + 1.95 / 2, W / 2 + porchW + 0.01);
    group.add(doorMesh);

    openings.push({
      id: 'residence_airlock_door',
      type: 'door',
      position: doorMesh.position.clone(),
      normal: new THREE.Vector3(0, 0, 1),
      width: 0.85,
      height: 1.95,
      isExposedToRain: true,
      mesh: doorMesh
    });

    // South Windows (Large solar gain windows)
    const winGeo = new THREE.PlaneGeometry(1.2, 1.1);
    const winMat = new THREE.MeshStandardMaterial({ color: 0x80D8FF, roughness: 0.1, transparent: true, opacity: 0.75 });
    [-L * 0.28, L * 0.28].forEach((xPos, idx) => {
      const winMesh = new THREE.Mesh(winGeo, winMat);
      winMesh.position.set(xPos, plinthHeight + H * 0.55, W / 2 + 0.01);
      group.add(winMesh);

      openings.push({
        id: `residence_solar_win_${idx}`,
        type: 'window',
        position: winMesh.position.clone(),
        normal: new THREE.Vector3(0, 0, 1),
        width: 1.2,
        height: 1.1,
        isExposedToRain: true,
        mesh: winMesh
      });
    });

    // Water flow lines down steep pitch
    [-0.3, 0.3].forEach(pct => {
      waterFlowPaths.push([
        new THREE.Vector3(L * pct, plinthHeight + H + gableHeight, 0),
        new THREE.Vector3(L * pct, plinthHeight + H + gableHeight * 0.45, W * 0.28),
        new THREE.Vector3(L * pct, plinthHeight + H, W / 2 + 0.45)
      ]);
      waterFlowPaths.push([
        new THREE.Vector3(L * pct, plinthHeight + H + gableHeight, 0),
        new THREE.Vector3(L * pct, plinthHeight + H + gableHeight * 0.45, -W * 0.28),
        new THREE.Vector3(L * pct, plinthHeight + H, -W / 2 - 0.45)
      ]);
    });

    gutterPoints.push(
      new THREE.Vector3(-L / 2 - 0.35, plinthHeight + H, W / 2 + 0.45),
      new THREE.Vector3(L / 2 + 0.35, plinthHeight + H, W / 2 + 0.45)
    );

  } else {
    // 1. COMMUNITY SHELTER & 5. CUSTOM ARCHITECTURE
    // Classic robust public hall or parametric box
    const wallGeo = new THREE.BoxGeometry(L, H, W);
    const wallMesh = new THREE.Mesh(wallGeo, wallMat);
    wallMesh.position.set(0, plinthHeight + H / 2, 0);
    wallMesh.castShadow = true;
    wallMesh.receiveShadow = true;
    group.add(wallMesh);

    surfaces.push(
      { id: 'front_wall', name: 'South Wall (Front)', normal: new THREE.Vector3(0, 0, 1), area_m2: L * H, mesh: wallMesh, baseColor: wallColor },
      { id: 'back_wall', name: 'North Wall (Rear)', normal: new THREE.Vector3(0, 0, -1), area_m2: L * H, mesh: wallMesh, baseColor: wallColor },
      { id: 'left_wall', name: 'West Wall', normal: new THREE.Vector3(-1, 0, 0), area_m2: W * H, mesh: wallMesh, baseColor: wallColor },
      { id: 'right_wall', name: 'East Wall', normal: new THREE.Vector3(1, 0, 0), area_m2: W * H, mesh: wallMesh, baseColor: wallColor }
    );

    // Gabled Roof for Community, or Flat Overhang for Custom
    const isCustom = shelterType.includes('Custom');
    const roofThick = 0.25;
    const roofOverhang = 0.55;

    if (!isCustom) {
      // Community Gable Roof
      const gableH = 0.9;
      const roofShape = new THREE.Shape();
      roofShape.moveTo(-W / 2 - roofOverhang, 0);
      roofShape.lineTo(0, gableH);
      roofShape.lineTo(W / 2 + roofOverhang, 0);
      roofShape.closePath();

      const extrudeSettings = { depth: L + roofOverhang * 2, bevelEnabled: false };
      const roofGeo = new THREE.ExtrudeGeometry(roofShape, extrudeSettings);
      roofGeo.center();

      const roofMat = new THREE.MeshStandardMaterial({
        color: roofColor,
        roughness: 0.7,
        metalness: 0.1
      });
      const roofMesh = new THREE.Mesh(roofGeo, roofMat);
      roofMesh.rotation.y = Math.PI / 2;
      roofMesh.position.set(0, plinthHeight + H + gableH / 2, 0);
      roofMesh.castShadow = true;
      roofMesh.receiveShadow = true;
      group.add(roofMesh);

      totalRoofApexY = plinthHeight + H + gableH;

      surfaces.push({
        id: 'community_roof_south',
        name: 'South Roof Slope',
        normal: new THREE.Vector3(0, Math.cos(Math.atan2(gableH, W / 2)), Math.sin(Math.atan2(gableH, W / 2))),
        area_m2: (L + roofOverhang * 2) * Math.sqrt((W / 2) ** 2 + gableH ** 2),
        mesh: roofMesh,
        baseColor: roofColor
      });

      // Flow lines
      [-0.3, 0, 0.3].forEach(pct => {
        waterFlowPaths.push([
          new THREE.Vector3(L * pct, plinthHeight + H + gableH, 0),
          new THREE.Vector3(L * pct, plinthHeight + H + gableH * 0.5, W * 0.25),
          new THREE.Vector3(L * pct, plinthHeight + H, W / 2 + roofOverhang)
        ]);
        waterFlowPaths.push([
          new THREE.Vector3(L * pct, plinthHeight + H + gableH, 0),
          new THREE.Vector3(L * pct, plinthHeight + H + gableH * 0.5, -W * 0.25),
          new THREE.Vector3(L * pct, plinthHeight + H, -W / 2 - roofOverhang)
        ]);
      });
    } else {
      // Custom Modular Flat Roof with Overhang
      const roofGeo = new THREE.BoxGeometry(L + roofOverhang * 2, roofThick, W + roofOverhang * 2);
      const roofMat = new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.7 });
      const roofMesh = new THREE.Mesh(roofGeo, roofMat);
      roofMesh.position.set(0, plinthHeight + H + roofThick / 2, 0);
      roofMesh.castShadow = true;
      roofMesh.receiveShadow = true;
      group.add(roofMesh);

      totalRoofApexY = plinthHeight + H + roofThick;

      surfaces.push({
        id: 'custom_flat_roof',
        name: 'Roof Deck Surface',
        normal: new THREE.Vector3(0, 1, 0),
        area_m2: (L + roofOverhang * 2) * (W + roofOverhang * 2),
        mesh: roofMesh,
        baseColor: roofColor
      });

      // Drainage towards corners
      [-0.4, 0.4].forEach(x => {
        [-0.4, 0.4].forEach(z => {
          waterFlowPaths.push([
            new THREE.Vector3(0, plinthHeight + H + roofThick, 0),
            new THREE.Vector3(L * x, plinthHeight + H + roofThick, W * z),
            new THREE.Vector3(L * (x > 0 ? 0.52 : -0.52), plinthHeight + H, W * (z > 0 ? 0.52 : -0.52))
          ]);
        });
      });
    }

    // Front Grand Entrance Door
    const doorH = Math.min(2.3, H * 0.85);
    const doorW = 1.1;
    const doorGeo = new THREE.PlaneGeometry(doorW, doorH);
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x4A2E1B, roughness: 0.5 });
    const doorMesh = new THREE.Mesh(doorGeo, doorMat);
    doorMesh.position.set(0, plinthHeight + doorH / 2, W / 2 + 0.01);
    group.add(doorMesh);

    openings.push({
      id: 'comm_front_door',
      type: 'door',
      position: doorMesh.position.clone(),
      normal: new THREE.Vector3(0, 0, 1),
      width: doorW,
      height: doorH,
      isExposedToRain: true,
      mesh: doorMesh
    });

    // Windows based on design.window_count
    const winWidth = design.window_width_m || 1.2;
    const winHeight = design.window_height_m || 1.0;
    const winCount = design.window_count ?? 2;
    const winMat = new THREE.MeshStandardMaterial({
      color: 0x80D8FF,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.75
    });

    if (winCount > 0) {
      const winGeo = new THREE.PlaneGeometry(winWidth, winHeight);
      const step = L / (winCount + 1);
      for (let i = 1; i <= winCount; i++) {
        const xOffset = -L / 2 + step * i;
        // Don't collide directly with center door
        if (Math.abs(xOffset) < doorW / 2 + winWidth / 2) continue;
        
        const winMesh = new THREE.Mesh(winGeo, winMat);
        winMesh.position.set(xOffset, plinthHeight + H * 0.55, W / 2 + 0.01);
        group.add(winMesh);

        openings.push({
          id: `win_${i}`,
          type: 'window',
          position: winMesh.position.clone(),
          normal: new THREE.Vector3(0, 0, 1),
          width: winWidth,
          height: winHeight,
          isExposedToRain: true,
          mesh: winMesh
        });
      }
    }

    gutterPoints.push(
      new THREE.Vector3(-L / 2 - roofOverhang, plinthHeight + H, W / 2 + roofOverhang),
      new THREE.Vector3(L / 2 + roofOverhang, plinthHeight + H, W / 2 + roofOverhang),
      new THREE.Vector3(-L / 2 - roofOverhang, plinthHeight + H, -W / 2 - roofOverhang),
      new THREE.Vector3(L / 2 + roofOverhang, plinthHeight + H, -W / 2 - roofOverhang)
    );
  }

  // -------------------------------------------------------------
  // DRAINAGE & RAIN RUNOFF CASCADE MESHES (Rainy Mode)
  // -------------------------------------------------------------
  let drainageRunoffGroup: THREE.Group | null = null;
  if (options.showDrainage) {
    drainageRunoffGroup = new THREE.Group();
    // Gutters downspouts at building corners
    const downspoutGeo = new THREE.CylinderGeometry(0.04, 0.04, H, 8);
    const downspoutMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
    gutterPoints.forEach(pt => {
      const sp = new THREE.Mesh(downspoutGeo, downspoutMat);
      sp.position.set(pt.x, plinthHeight + H / 2, pt.z);
      drainageRunoffGroup?.add(sp);

      // Splash pool at base of downspout
      const poolGeo = new THREE.CircleGeometry(0.25, 16);
      const poolMat = new THREE.MeshBasicMaterial({ color: 0x38BDF8, transparent: true, opacity: 0.6 });
      const pool = new THREE.Mesh(poolGeo, poolMat);
      pool.rotation.x = -Math.PI / 2;
      pool.position.set(pt.x, plinthHeight + 0.02, pt.z);
      drainageRunoffGroup?.add(pool);
    });
    group.add(drainageRunoffGroup);
  }

  // -------------------------------------------------------------
  // OPTIONAL SNOW ACCUMULATION BLANKET (Winter Mode)
  // -------------------------------------------------------------
  let snowMesh: THREE.Group | null = null;
  if (options.showSnow) {
    snowMesh = new THREE.Group();
    const snowMat = new THREE.MeshStandardMaterial({
      color: 0xF8FAFC,
      roughness: 0.95,
      metalness: 0.05
    });

    const snowThick = 0.12;
    // Layer of snow on roof
    const snowGeo = new THREE.BoxGeometry(L + 0.65, snowThick, W + 0.65);
    const snowSlab = new THREE.Mesh(snowGeo, snowMat);
    snowSlab.position.set(0, totalRoofApexY + snowThick / 2, 0);
    snowMesh.add(snowSlab);

    // Minor snow accumulation on window sills
    openings.filter(o => o.type === 'window').forEach(win => {
      const sillSnowGeo = new THREE.BoxGeometry(win.width + 0.1, 0.05, 0.08);
      const sillSnow = new THREE.Mesh(sillSnowGeo, snowMat);
      sillSnow.position.set(win.position.x, win.position.y - win.height / 2 + 0.02, win.position.z + 0.04);
      snowMesh?.add(sillSnow);
    });

    group.add(snowMesh);
  }

  // -------------------------------------------------------------
  // CUTAWAY INSULATION LAYER VIEW (Winter Mode)
  // -------------------------------------------------------------
  let cutawayGroup: THREE.Group | null = null;
  if (options.showCutaway) {
    cutawayGroup = new THREE.Group();
    
    // Front-Right Corner Cutaway reveal
    const cornerCutX = L / 4;
    const cornerCutH = H * 0.7;
    const cornerCutW = 0.25;

    // 1. Insulation Layer (Core)
    const insulGeo = new THREE.BoxGeometry(cornerCutX * 0.8, cornerCutH, cornerCutW * 0.4);
    const insulMat = new THREE.MeshStandardMaterial({
      color: insulColor,
      roughness: 0.7
    });
    const insulMesh = new THREE.Mesh(insulGeo, insulMat);
    insulMesh.position.set(L * 0.35, plinthHeight + cornerCutH / 2 + 0.2, W / 2 + 0.05);
    cutawayGroup.add(insulMesh);

    // 2. Interior Finish Layer (Wood/Plaster)
    const intGeo = new THREE.BoxGeometry(cornerCutX * 0.7, cornerCutH * 0.9, 0.05);
    const intMat = new THREE.MeshStandardMaterial({ color: 0xFDE68A, roughness: 0.4 });
    const intMesh = new THREE.Mesh(intGeo, intMat);
    intMesh.position.set(L * 0.35, plinthHeight + cornerCutH / 2 + 0.2, W / 2 - 0.02);
    cutawayGroup.add(intMesh);

    // Visual cutaway wireframe indicator
    const cutEdges = new THREE.EdgesGeometry(insulGeo);
    const cutLine = new THREE.LineSegments(cutEdges, new THREE.LineBasicMaterial({ color: 0xF59E0B }));
    cutLine.position.copy(insulMesh.position);
    cutawayGroup.add(cutLine);

    group.add(cutawayGroup);
  }

  // -------------------------------------------------------------
  // HEAT-LOSS HIGHLIGHT AREAS (Winter Mode)
  // -------------------------------------------------------------
  let heatLossMeshGroup: THREE.Group | null = null;
  if (options.showHeatLoss) {
    heatLossMeshGroup = new THREE.Group();
    // Highlight windows (high conductive heat loss) in vibrant infrared magenta/orange
    openings.filter(o => o.type === 'window').forEach(win => {
      const hlGeo = new THREE.PlaneGeometry(win.width + 0.05, win.height + 0.05);
      const hlMat = new THREE.MeshBasicMaterial({
        color: 0xEF4444, // Red heat escape
        transparent: true,
        opacity: 0.75,
        side: THREE.DoubleSide
      });
      const hlMesh = new THREE.Mesh(hlGeo, hlMat);
      hlMesh.position.set(win.position.x, win.position.y, win.position.z + 0.02);
      heatLossMeshGroup?.add(hlMesh);
    });

    // Roof perimeter heat escape (thermal bridge)
    const roofRingGeo = new THREE.BoxGeometry(L + 0.6, 0.1, W + 0.6);
    const roofRingMat = new THREE.MeshBasicMaterial({
      color: 0xF97316, // Orange thermal bridge
      transparent: true,
      opacity: 0.6
    });
    const roofRing = new THREE.Mesh(roofRingGeo, roofRingMat);
    roofRing.position.set(0, plinthHeight + H, 0);
    heatLossMeshGroup.add(roofRing);

    group.add(heatLossMeshGroup);
  }

  // Bounding box for rain collisions
  const roofBoundingBox = new THREE.Box3(
    new THREE.Vector3(-L / 2 - 0.6, plinthHeight + H - 0.2, -W / 2 - 0.6),
    new THREE.Vector3(L / 2 + 0.6, totalRoofApexY + 0.2, W / 2 + 0.6)
  );

  return {
    group,
    surfaces,
    openings,
    roofHeight: totalRoofApexY,
    roofBoundingBox,
    waterFlowPaths,
    gutterPoints,
    snowMesh,
    cutawayGroup,
    heatLossMeshGroup,
    drainageRunoffGroup
  };
}
