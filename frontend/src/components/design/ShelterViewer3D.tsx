import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useShelter } from '../../context/ShelterContext';
import {
  Sun,
  CloudRain,
  Snowflake,
  Wind,
  Play,
  Pause,
  RotateCcw,
  Compass,
  Thermometer,
  Droplets,
  Flame,
  Layers
} from 'lucide-react';
import {
  getEnvironmentalState,
  type EnvironmentalMode,
  type WeatherScenario
} from './environmentalData';
import { buildShelterGeometry } from './shelterGeometryBuilder';

export const ShelterViewer3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const { currentDesign, climates, materials } = useShelter();

  // Active Environmental Mode
  const [mode, setMode] = useState<EnvironmentalMode>('summer');
  
  // Weather Scenario
  const [scenario, setScenario] = useState<WeatherScenario>('actual');

  // Time of Day (0.0 to 24.0)
  const [hour, setHour] = useState<number>(12.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSpeed, setPlaySpeed] = useState<number>(1); // 1x, 2x, 5x

  // Visibility Toggles
  const [showSunRays, setShowSunRays] = useState<boolean>(true);
  const [showShadows, setShowShadows] = useState<boolean>(true);
  const [showRain, setShowRain] = useState<boolean>(true);
  const [showWind, setShowWind] = useState<boolean>(true);
  const [showHeatMap, setShowHeatMap] = useState<boolean>(false);
  const [showSnowAccumulation, setShowSnowAccumulation] = useState<boolean>(true);
  const [showHeatLossAreas, setShowHeatLossAreas] = useState<boolean>(false);
  const [showCutawayView, setShowCutawayView] = useState<boolean>(false);
  const [showDrainage, setShowDrainage] = useState<boolean>(true);
  const [showOpeningAirflow, setShowOpeningAirflow] = useState<boolean>(true);

  // Active microclimate
  const activeClimate = useMemo(() => {
    return climates.find(c => c.id === currentDesign.location_id) || climates[0];
  }, [climates, currentDesign.location_id]);

  // Live computed environmental metrics
  const envState = useMemo(() => {
    return getEnvironmentalState(
      activeClimate,
      mode,
      scenario,
      hour,
      {
        showSunRays,
        showShadows,
        showRain,
        showWind,
        showHeatMap,
        showSnowAccumulation,
        showHeatLossAreas,
        showCutawayView,
        showDrainage,
        showOpeningAirflow
      }
    );
  }, [
    activeClimate,
    mode,
    scenario,
    hour,
    showSunRays,
    showShadows,
    showRain,
    showWind,
    showHeatMap,
    showSnowAccumulation,
    showHeatLossAreas,
    showCutawayView,
    showDrainage,
    showOpeningAirflow
  ]);

  // Animation time-step loop when isPlaying
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setHour(prev => {
        const next = prev + (0.05 * playSpeed);
        return next >= 24 ? 0 : next;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying, playSpeed]);

  // Main Three.js Scene Setup & Render Loop
  useEffect(() => {
    const mountNode = mountRef.current;
    if (!mountNode) return;

    const width = mountNode.clientWidth || 600;
    const height = mountNode.clientHeight || 460;

    // 1. SCENE
    const scene = new THREE.Scene();

    // Environment sky background & atmospheric fog based on mode
    let bgColor = 0xF1F5F9;
    let fogNear = 15;
    let fogFar = 55;

    if (mode === 'summer') {
      bgColor = envState.is_daylight ? 0xE0F2FE : 0x0F172A; // Sky blue or night navy
    } else if (mode === 'rainy') {
      bgColor = 0x64748B; // Overcast rainy slate
      fogNear = 10;
      fogFar = 35;
    } else if (mode === 'winter') {
      bgColor = 0xE2E8F0; // Cold frosty gray-white
      fogNear = 12;
      fogFar = 40;
    } else if (mode === 'wind') {
      bgColor = 0xEEF2F6; // Clean dynamic atmosphere
    }

    scene.background = new THREE.Color(bgColor);
    scene.fog = new THREE.Fog(bgColor, fogNear, fogFar);

    // 2. CAMERA
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(8.5, 6.0, 9.5);
    camera.lookAt(0, 1.5, 0);

    // 3. RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = showShadows;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    while (mountNode.firstChild) {
      mountNode.removeChild(mountNode.firstChild);
    }
    mountNode.appendChild(renderer.domElement);

    // 4. ORBIT CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.03; // Don't flip below ground
    controls.minDistance = 3.5;
    controls.maxDistance = 30;
    controls.target.set(0, 1.3, 0);

    // 5. LIGHTING
    let ambIntensity = 0.85;
    let ambColor = 0xFFFFFF;

    if (mode === 'rainy') {
      ambIntensity = 0.55;
      ambColor = 0x94A3B8;
    } else if (mode === 'winter') {
      ambIntensity = 0.75;
      ambColor = 0xCBD5E1;
    } else if (!envState.is_daylight) {
      ambIntensity = 0.2;
      ambColor = 0x1E293B;
    }

    const ambientLight = new THREE.AmbientLight(ambColor, ambIntensity);
    scene.add(ambientLight);

    // Directional Sunlight
    const sunLight = new THREE.DirectionalLight(
      mode === 'winter' ? 0xE0F2FE : mode === 'rainy' ? 0x94A3B8 : 0xFFF3BF,
      envState.is_daylight ? (mode === 'rainy' ? 0.35 : 1.5) : 0.05
    );
    sunLight.position.set(envState.sun_position_3d.x, Math.max(0.5, envState.sun_position_3d.y), envState.sun_position_3d.z);
    sunLight.castShadow = showShadows && envState.is_daylight;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 45;
    sunLight.shadow.camera.left = -9;
    sunLight.shadow.camera.right = 9;
    sunLight.shadow.camera.top = 9;
    sunLight.shadow.camera.bottom = -9;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // Sun Visual Object in Sky (When daylight)
    let sunMeshGroup: THREE.Group | null = null;
    let sunRaysGroup: THREE.Group | null = null;

    if (envState.is_daylight) {
      sunMeshGroup = new THREE.Group();
      const sunGeo = new THREE.SphereGeometry(0.85, 24, 24);
      const sunMat = new THREE.MeshBasicMaterial({
        color: mode === 'summer' ? 0xFBBF24 : 0xFDE047
      });
      const sunSphere = new THREE.Mesh(sunGeo, sunMat);
      sunMeshGroup.position.set(envState.sun_position_3d.x * 0.9, envState.sun_position_3d.y * 0.9, envState.sun_position_3d.z * 0.9);
      sunMeshGroup.add(sunSphere);

      // Sun Corona Ring
      const coronaGeo = new THREE.RingGeometry(0.95, 1.4, 32);
      const coronaMat = new THREE.MeshBasicMaterial({
        color: 0xFDE68A,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
      });
      const corona = new THREE.Mesh(coronaGeo, coronaMat);
      corona.lookAt(camera.position);
      sunMeshGroup.add(corona);
      scene.add(sunMeshGroup);

      // Visible Sunlight Rays Beams directed towards shelter
      if (showSunRays && mode === 'summer') {
        sunRaysGroup = new THREE.Group();
        const rayCount = 6;
        const targetPos = new THREE.Vector3(0, currentDesign.height_m / 2, 0);
        const sunPos = sunMeshGroup.position.clone();

        for (let i = 0; i < rayCount; i++) {
          const spreadOffset = new THREE.Vector3(
            (Math.sin(i * 1.2) * 1.8),
            (Math.cos(i * 1.5) * 1.2),
            (Math.sin(i * 2.1) * 1.8)
          );
          const rayOrigin = sunPos.clone().add(spreadOffset.multiplyScalar(0.2));
          const rayEnd = targetPos.clone().add(spreadOffset.multiplyScalar(1.2));
          
          const rayPoints = [rayOrigin, rayEnd];
          const rayGeo = new THREE.BufferGeometry().setFromPoints(rayPoints);
          const rayMat = new THREE.LineBasicMaterial({
            color: 0xFDE047,
            transparent: true,
            opacity: 0.35 - (i * 0.03),
            linewidth: 2
          });
          const rayLine = new THREE.Line(rayGeo, rayMat);
          sunRaysGroup.add(rayLine);
        }
        scene.add(sunRaysGroup);
      }
    }

    // 6. GROUND PLANE & TERRAIN
    const groundGeo = new THREE.PlaneGeometry(24, 24);
    const groundMat = new THREE.MeshStandardMaterial({
      color: mode === 'winter' ? 0xF1F5F9 : mode === 'rainy' ? 0x64748B : 0xE2E8F0,
      roughness: mode === 'rainy' ? 0.3 : 0.85,
      metalness: mode === 'rainy' ? 0.2 : 0.05
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = showShadows;
    scene.add(ground);

    const gridHelper = new THREE.GridHelper(24, 24, 0x064C42, 0xCBD5E1);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // 7. 3D COMPASS ROSE & WIND DIRECTION VECTOR
    const compassGroup = new THREE.Group();
    compassGroup.position.set(0, 0.02, 0);

    // Circular ground guide
    const compCircleGeo = new THREE.RingGeometry(6.5, 6.6, 64);
    const compCircleMat = new THREE.MeshBasicMaterial({ color: 0x94A3B8, side: THREE.DoubleSide });
    const compCircle = new THREE.Mesh(compCircleGeo, compCircleMat);
    compCircle.rotation.x = -Math.PI / 2;
    compassGroup.add(compCircle);

    // Wind Vector Arrow (showing live wind direction)
    const windRad = (envState.wind_direction_deg * Math.PI) / 180;
    const windDir = new THREE.Vector3(-Math.sin(windRad), 0, Math.cos(windRad)).normalize();
    const windOrigin = new THREE.Vector3(Math.sin(windRad) * 6.5, 0.2, -Math.cos(windRad) * 6.5);
    const windArrow = new THREE.ArrowHelper(windDir, windOrigin, 3.2, 0x0284C7, 0.6, 0.4);
    compassGroup.add(windArrow);
    scene.add(compassGroup);

    // 8. 3D SHELTER GENERATION
    const shelterResult = buildShelterGeometry(currentDesign, materials, {
      showSnow: showSnowAccumulation && mode === 'winter',
      showCutaway: showCutawayView && mode === 'winter',
      showHeatLoss: showHeatLossAreas && mode === 'winter',
      showDrainage: showDrainage && mode === 'rainy'
    });

    const shelterGroup = shelterResult.group;
    // Apply orientation rotation (0° = North -Z, 90° = East +X, 180° = South +Z, 270° = West -X)
    const orientRad = (currentDesign.orientation_deg * Math.PI) / 180;
    shelterGroup.rotation.y = -orientRad;
    scene.add(shelterGroup);

    // 9. SOLAR EXPOSURE HEAT MAP (Summer Mode)
    if (showHeatMap && mode === 'summer' && envState.is_daylight) {
      const sunDirNormalized = new THREE.Vector3(
        envState.sun_position_3d.x,
        envState.sun_position_3d.y,
        envState.sun_position_3d.z
      ).normalize();

      shelterResult.surfaces.forEach(surf => {
        const worldNormal = surf.normal.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), -orientRad);
        const cosTheta = Math.max(0, worldNormal.dot(sunDirNormalized));
        const incidentW = envState.solar_irradiance_w_m2 * cosTheta;

        let heatMapColor = 0x1E3A8A; // Shaded blue
        if (incidentW > 700) heatMapColor = 0xDC2626;      // Red - high heat
        else if (incidentW > 450) heatMapColor = 0xF59E0B; // Orange/Amber
        else if (incidentW > 250) heatMapColor = 0x84CC16; // Green
        else if (incidentW > 80) heatMapColor = 0x06B6D4;  // Cyan

        const surfMat = surf.mesh.material as THREE.MeshStandardMaterial;
        if (surfMat) {
          surfMat.color.setHex(heatMapColor);
          surfMat.needsUpdate = true;
        }
      });
    }

    // 10. PARTICLE SYSTEMS FOR WEATHER MODES

    // --- A. RAIN PARTICLES & ROOF WATER RUNOFF ---
    let rainParticles: THREE.LineSegments | null = null;
    let rainGeo: THREE.BufferGeometry | null = null;
    let rainSplashes: THREE.Points | null = null;
    const rainCount = 1800;
    const rainPositions = new Float32Array(rainCount * 6); // 2 vertices per line streak
    const rainVelocities: number[] = [];

    if (showRain && mode === 'rainy') {
      const boundX = 14;
      const boundZ = 14;
      const topY = 16;

      for (let i = 0; i < rainCount; i++) {
        const x = (Math.random() - 0.5) * boundX;
        const y = Math.random() * topY;
        const z = (Math.random() - 0.5) * boundZ;
        const streakLen = 0.4 + Math.random() * 0.2;

        rainPositions[i * 6] = x;
        rainPositions[i * 6 + 1] = y;
        rainPositions[i * 6 + 2] = z;
        rainPositions[i * 6 + 3] = x;
        rainPositions[i * 6 + 4] = y - streakLen;
        rainPositions[i * 6 + 5] = z;

        rainVelocities.push(14.0 + Math.random() * 6.0);
      }

      rainGeo = new THREE.BufferGeometry();
      rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
      const rainMat = new THREE.LineBasicMaterial({
        color: 0x93C5FD,
        transparent: true,
        opacity: 0.65
      });
      rainParticles = new THREE.LineSegments(rainGeo, rainMat);
      scene.add(rainParticles);

      // Splash particles on roof and ground
      const splashCount = 120;
      const splashPos = new Float32Array(splashCount * 3);
      for (let i = 0; i < splashCount; i++) {
        splashPos[i * 3] = (Math.random() - 0.5) * currentDesign.length_m;
        splashPos[i * 3 + 1] = shelterResult.roofHeight + 0.05;
        splashPos[i * 3 + 2] = (Math.random() - 0.5) * currentDesign.width_m;
      }
      const splashGeo = new THREE.BufferGeometry();
      splashGeo.setAttribute('position', new THREE.BufferAttribute(splashPos, 3));
      const splashMat = new THREE.PointsMaterial({
        color: 0xBAE6FD,
        size: 0.08,
        transparent: true,
        opacity: 0.7
      });
      rainSplashes = new THREE.Points(splashGeo, splashMat);
      scene.add(rainSplashes);
    }

    // --- B. SNOW PARTICLES (Winter Mode) ---
    let snowPoints: THREE.Points | null = null;
    let snowGeo: THREE.BufferGeometry | null = null;
    const snowCount = 1200;
    const snowPositions = new Float32Array(snowCount * 3);
    const snowVelocities: { y: number; sway: number; phase: number }[] = [];

    if (mode === 'winter') {
      const boundX = 14;
      const boundZ = 14;
      for (let i = 0; i < snowCount; i++) {
        snowPositions[i * 3] = (Math.random() - 0.5) * boundX;
        snowPositions[i * 3 + 1] = Math.random() * 15;
        snowPositions[i * 3 + 2] = (Math.random() - 0.5) * boundZ;
        snowVelocities.push({
          y: 1.5 + Math.random() * 1.8,
          sway: 0.5 + Math.random() * 0.8,
          phase: Math.random() * Math.PI * 2
        });
      }
      snowGeo = new THREE.BufferGeometry();
      snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPositions, 3));
      const snowMat = new THREE.PointsMaterial({
        color: 0xFFFFFF,
        size: 0.12,
        transparent: true,
        opacity: 0.85
      });
      snowPoints = new THREE.Points(snowGeo, snowMat);
      scene.add(snowPoints);
    }

    // --- C. WIND STREAMLINES & AIRFLOW VECTORS (Wind Mode) ---
    let windStreamGroup: THREE.Group | null = null;
    const streamlineCount = 45;
    const streamParticles: { mesh: THREE.Mesh; path: THREE.Vector3[]; t: number; speed: number }[] = [];

    if (showWind && mode === 'wind') {
      windStreamGroup = new THREE.Group();
      const dotGeo = new THREE.SphereGeometry(0.06, 8, 8);
      const dotMat = new THREE.MeshBasicMaterial({ color: 0x38BDF8 });

      for (let i = 0; i < streamlineCount; i++) {
        const streamPath: THREE.Vector3[] = [];
        const startX = 8;
        const endX = -8;
        const lateralZ = (Math.random() - 0.5) * 8;
        const elevationY = 0.5 + Math.random() * 4.5;

        // Path deflecting around shelter geometry
        for (let step = 0; step <= 10; step++) {
          const px = startX - (step / 10) * (startX - endX);
          let pz = lateralZ;
          let py = elevationY;

          // Deflect around shelter obstacle
          const distToCenter = Math.sqrt(px * px + lateralZ * lateralZ);
          const shelterRadius = Math.max(currentDesign.length_m, currentDesign.width_m) * 0.65;
          if (distToCenter < shelterRadius) {
            pz = lateralZ + (lateralZ >= 0 ? 1 : -1) * (shelterRadius - distToCenter) * 0.7;
            py = elevationY + 0.4;
          }
          streamPath.push(new THREE.Vector3(px, py, pz));
        }

        // Curve Line
        const curve = new THREE.CatmullRomCurve3(streamPath);
        const curvePoints = curve.getPoints(24);
        const lineGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
        const lineMat = new THREE.LineBasicMaterial({
          color: 0x0284C7,
          transparent: true,
          opacity: 0.25
        });
        const streamLine = new THREE.Line(lineGeo, lineMat);
        windStreamGroup.add(streamLine);

        // Moving airflow particle
        const particleMesh = new THREE.Mesh(dotGeo, dotMat);
        windStreamGroup.add(particleMesh);
        streamParticles.push({
          mesh: particleMesh,
          path: curvePoints,
          t: Math.random(),
          speed: (0.15 + (envState.wind_speed_m_s * 0.02)) * (0.8 + Math.random() * 0.4)
        });
      }

      // Air entering through windward openings and exiting leeward openings
      if (showOpeningAirflow) {
        shelterResult.openings.forEach(op => {
          const worldOpNorm = op.normal.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), -orientRad);
          const isWindward = worldOpNorm.dot(windDir) < -0.15;
          const arrowDir = isWindward ? windDir.clone() : windDir.clone().negate();
          const arrowColor = isWindward ? 0x0284C7 : 0xF97316; // Blue entry, orange warm exhaust
          const arrowOrigin = op.position.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), -orientRad);
          arrowOrigin.y += 0.2;

          const ventArrow = new THREE.ArrowHelper(arrowDir, arrowOrigin, 1.2, arrowColor, 0.35, 0.25);
          windStreamGroup?.add(ventArrow);
        });
      }

      scene.add(windStreamGroup);
    }

    // 11. ANIMATION FRAME LOOP
    let animationFrameId: number;
    let prevTime = performance.now();

    const animate = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(animate);
      const dt = Math.min((currentTime - prevTime) / 1000, 0.1);
      prevTime = currentTime;

      // Update OrbitControls
      controls.update();

      // Animate Rain Particles
      if (rainParticles && rainGeo) {
        const posAttr = rainGeo.attributes.position as THREE.BufferAttribute;
        const arr = posAttr.array as Float32Array;

        for (let i = 0; i < rainCount; i++) {
          const speed = rainVelocities[i];
          arr[i * 6 + 1] -= speed * dt;
          arr[i * 6 + 4] -= speed * dt;

          const rx = arr[i * 6];
          const ry = arr[i * 6 + 1];
          const rz = arr[i * 6 + 2];

          // Check collision with shelter roof bounding box
          const hitRoof = shelterResult.roofBoundingBox.containsPoint(new THREE.Vector3(rx, ry, rz));
          const hitGround = ry <= 0;

          if (hitRoof || hitGround) {
            arr[i * 6 + 1] = 16.0;
            arr[i * 6 + 4] = 15.6;
          }
        }
        posAttr.needsUpdate = true;
      }

      // Animate Snow Particles
      if (snowPoints && snowGeo) {
        const posAttr = snowGeo.attributes.position as THREE.BufferAttribute;
        const arr = posAttr.array as Float32Array;
        for (let i = 0; i < snowCount; i++) {
          const v = snowVelocities[i];
          arr[i * 3 + 1] -= v.y * dt;
          arr[i * 3] += Math.sin(currentTime * 0.002 + v.phase) * v.sway * dt;

          if (arr[i * 3 + 1] <= 0) {
            arr[i * 3 + 1] = 15.0;
          }
        }
        posAttr.needsUpdate = true;
      }

      // Animate Wind Streamline Particles
      if (streamParticles.length > 0) {
        streamParticles.forEach(sp => {
          sp.t = (sp.t + sp.speed * dt) % 1.0;
          const index = Math.floor(sp.t * (sp.path.length - 1));
          const nextIndex = Math.min(index + 1, sp.path.length - 1);
          const frac = (sp.t * (sp.path.length - 1)) - index;
          
          const p1 = sp.path[index];
          const p2 = sp.path[nextIndex];
          if (p1 && p2) {
            sp.mesh.position.lerpVectors(p1, p2, frac);
          }
        });
      }

      // Render Scene
      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    // Cleanup on unmount or dependency re-render
    return () => {
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      renderer.dispose();
      if (mountNode && renderer.domElement) {
        try {
          mountNode.removeChild(renderer.domElement);
        } catch {
          // Ignore DOM detachment edge cases
        }
      }
    };
  }, [
    currentDesign,
    materials,
    mode,
    scenario,
    hour,
    showSunRays,
    showShadows,
    showRain,
    showWind,
    showHeatMap,
    showSnowAccumulation,
    showHeatLossAreas,
    showCutawayView,
    showDrainage,
    showOpeningAirflow,
    envState
  ]);

  const handleReset = () => {
    setHour(12.0);
    setIsPlaying(false);
    setScenario('actual');
    setShowSunRays(true);
    setShowShadows(true);
    setShowRain(true);
    setShowWind(true);
    setShowHeatMap(false);
    setShowSnowAccumulation(true);
    setShowHeatLossAreas(false);
    setShowCutawayView(false);
    setShowDrainage(true);
    setShowOpeningAirflow(true);
  };

  return (
    <div className="relative w-full rounded-3xl border border-[#E0DED3] bg-[#FAF9F5] overflow-hidden shadow-lg flex flex-col justify-between select-none">
      
      {/* TOP BAR: Mode Selector & Weather Condition Badge */}
      <div className="relative z-10 p-3.5 bg-white/95 backdrop-blur-md border-b border-[#E2DFD2] flex flex-wrap items-center justify-between gap-2.5">
        
        {/* Mode Tabs */}
        <div className="flex items-center space-x-1 bg-[#F1EFE6] p-1 rounded-2xl border border-[#D5D3C5]">
          <button
            onClick={() => setMode('summer')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
              mode === 'summer'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-gray-700 hover:text-forest hover:bg-white/60'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Summer</span>
          </button>

          <button
            onClick={() => setMode('rainy')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
              mode === 'rainy'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-gray-700 hover:text-forest hover:bg-white/60'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>Rainy</span>
          </button>

          <button
            onClick={() => setMode('winter')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
              mode === 'winter'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'text-gray-700 hover:text-forest hover:bg-white/60'
            }`}
          >
            <Snowflake className="w-3.5 h-3.5" />
            <span>Winter</span>
          </button>

          <button
            onClick={() => setMode('wind')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
              mode === 'wind'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-gray-700 hover:text-forest hover:bg-white/60'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Wind</span>
          </button>
        </div>

        {/* Live Condition & Location Metric Pill */}
        <div className="flex items-center space-x-3 text-xs font-semibold text-gray-700">
          <div className="flex items-center space-x-1 bg-white px-2.5 py-1 rounded-xl border border-[#D5D3C5] shadow-2xs">
            <Thermometer className="w-3.5 h-3.5 text-rose-500" />
            <span>{envState.temperature_c}°C</span>
          </div>

          <div className="flex items-center space-x-1 bg-white px-2.5 py-1 rounded-xl border border-[#D5D3C5] shadow-2xs">
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>{envState.solar_irradiance_w_m2} W/m²</span>
          </div>

          <div className="flex items-center space-x-1 bg-white px-2.5 py-1 rounded-xl border border-[#D5D3C5] shadow-2xs">
            <Wind className="w-3.5 h-3.5 text-sky-500" />
            <span>{envState.wind_speed_m_s} m/s</span>
          </div>

          {/* Reset Environment */}
          <button
            onClick={handleReset}
            title="Reset Environment"
            className="p-1.5 rounded-xl bg-white hover:bg-[#F3F1E7] border border-[#D5D3C5] text-gray-600 hover:text-forest shadow-2xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* 3D CANVAS MOUNT AREA */}
      <div className="relative w-full h-[430px] overflow-hidden">
        <div ref={mountRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />

        {/* Floating Scenario & Compass Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col space-y-2 pointer-events-none">
          <div className="bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-[#D5D3C5] shadow-xs text-xs font-bold text-forest flex items-center space-x-2">
            <Compass className="w-4 h-4 text-earth" />
            <span>
              Facing: {currentDesign.orientation_deg}° ({currentDesign.orientation_deg === 180 ? 'South' : currentDesign.orientation_deg === 90 ? 'East' : currentDesign.orientation_deg === 0 ? 'North' : 'West'})
            </span>
          </div>

          {/* Sun Altitude / Solar Angle Badge */}
          <div className="bg-white/90 backdrop-blur-xs px-3 py-1 rounded-xl border border-[#D5D3C5] shadow-xs text-[11px] font-semibold text-gray-700">
            {envState.is_daylight ? (
              <span>☀️ Sun Alt: {envState.sun_altitude_deg}° • Azimuth: {envState.sun_azimuth_deg}°</span>
            ) : (
              <span className="text-indigo-900">🌙 Night Time (Sub-horizon)</span>
            )}
          </div>
        </div>

        {/* Floating Weather Scenario Selector (Top Right) */}
        <div className="absolute top-3 right-3 z-10 pointer-events-auto">
          <select
            value={scenario}
            onChange={e => setScenario(e.target.value as WeatherScenario)}
            className="bg-white/95 backdrop-blur-sm border border-[#D5D3C5] text-forest font-bold text-xs rounded-xl px-2.5 py-1.5 shadow-sm outline-none cursor-pointer focus:ring-2 focus:ring-forest"
          >
            <option value="actual">📍 Location: {activeClimate.name.split(' (')[0]}</option>
            <option value="summer_solstice">☀️ Summer Solstice (Peak Sun)</option>
            <option value="monsoon_downpour">🌧️ Monsoon Downpour (38mm/h)</option>
            <option value="winter_blizzard">❄️ Himalayan Blizzard (-19°C)</option>
            <option value="desert_heatwave">🔥 Desert Heatwave (48°C)</option>
          </select>
        </div>

        {/* Mode Specific Feature Toggles Overlay (Bottom Left Inside Canvas) */}
        <div className="absolute bottom-3 left-3 z-10 flex flex-wrap gap-1.5 pointer-events-auto text-[11px] font-semibold">
          
          {mode === 'summer' && (
            <>
              <button
                onClick={() => setShowHeatMap(!showHeatMap)}
                className={`px-2.5 py-1 rounded-lg border shadow-xs flex items-center space-x-1.5 transition-all ${
                  showHeatMap
                    ? 'bg-rose-600 border-rose-700 text-white font-bold'
                    : 'bg-white/90 border-[#D5D3C5] text-gray-700 hover:bg-white'
                }`}
              >
                <Flame className="w-3 h-3 text-amber-300" />
                <span>{showHeatMap ? 'Hide Heat Map' : 'Solar Heat Map'}</span>
              </button>

              <button
                onClick={() => setShowSunRays(!showSunRays)}
                className={`px-2.5 py-1 rounded-lg border shadow-xs transition-all ${
                  showSunRays ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold' : 'bg-white/90 border-[#D5D3C5] text-gray-600'
                }`}
              >
                <span>{showSunRays ? 'Sun Rays On' : 'Sun Rays Off'}</span>
              </button>
            </>
          )}

          {mode === 'rainy' && (
            <>
              <button
                onClick={() => setShowDrainage(!showDrainage)}
                className={`px-2.5 py-1 rounded-lg border shadow-xs flex items-center space-x-1.5 transition-all ${
                  showDrainage
                    ? 'bg-blue-600 border-blue-700 text-white font-bold'
                    : 'bg-white/90 border-[#D5D3C5] text-gray-700 hover:bg-white'
                }`}
              >
                <Droplets className="w-3 h-3" />
                <span>{showDrainage ? 'Hide Roof Drainage' : 'Show Roof Runoff & Gutters'}</span>
              </button>

              <button
                onClick={() => setShowRain(!showRain)}
                className={`px-2.5 py-1 rounded-lg border shadow-xs transition-all ${
                  showRain ? 'bg-blue-100 border-blue-300 text-blue-900 font-bold' : 'bg-white/90 border-[#D5D3C5] text-gray-600'
                }`}
              >
                <span>{showRain ? 'Rain Falling' : 'Rain Paused'}</span>
              </button>
            </>
          )}

          {mode === 'winter' && (
            <>
              <button
                onClick={() => setShowSnowAccumulation(!showSnowAccumulation)}
                className={`px-2.5 py-1 rounded-lg border shadow-xs transition-all ${
                  showSnowAccumulation ? 'bg-sky-100 border-sky-300 text-sky-900 font-bold' : 'bg-white/90 border-[#D5D3C5] text-gray-600'
                }`}
              >
                <span>{showSnowAccumulation ? 'Snow on Roof: Visible' : 'Snow Layer Hidden'}</span>
              </button>

              <button
                onClick={() => setShowHeatLossAreas(!showHeatLossAreas)}
                className={`px-2.5 py-1 rounded-lg border shadow-xs flex items-center space-x-1 transition-all ${
                  showHeatLossAreas ? 'bg-red-600 border-red-700 text-white font-bold' : 'bg-white/90 border-[#D5D3C5] text-gray-700'
                }`}
              >
                <Flame className="w-3 h-3" />
                <span>{showHeatLossAreas ? 'Hide Heat Loss' : 'Highlight Heat-Loss Areas'}</span>
              </button>

              <button
                onClick={() => setShowCutawayView(!showCutawayView)}
                className={`px-2.5 py-1 rounded-lg border shadow-xs flex items-center space-x-1 transition-all ${
                  showCutawayView ? 'bg-emerald-700 border-emerald-800 text-white font-bold' : 'bg-white/90 border-[#D5D3C5] text-gray-700'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>{showCutawayView ? 'Exit Cutaway' : 'Cutaway Insulation View'}</span>
              </button>
            </>
          )}

          {mode === 'wind' && (
            <>
              <button
                onClick={() => setShowWind(!showWind)}
                className={`px-2.5 py-1 rounded-lg border shadow-xs transition-all ${
                  showWind ? 'bg-teal-100 border-teal-300 text-teal-900 font-bold' : 'bg-white/90 border-[#D5D3C5] text-gray-600'
                }`}
              >
                <span>{showWind ? 'Wind Streamlines: Active' : 'Streamlines Hidden'}</span>
              </button>

              <button
                onClick={() => setShowOpeningAirflow(!showOpeningAirflow)}
                className={`px-2.5 py-1 rounded-lg border shadow-xs transition-all ${
                  showOpeningAirflow ? 'bg-cyan-600 border-cyan-700 text-white font-bold' : 'bg-white/90 border-[#D5D3C5] text-gray-700'
                }`}
              >
                <span>{showOpeningAirflow ? 'Opening Airflow: On' : 'Opening Airflow: Off'}</span>
              </button>
            </>
          )}

          {/* Toggle Dynamic Shadows */}
          <button
            onClick={() => setShowShadows(!showShadows)}
            className={`px-2.5 py-1 rounded-lg border shadow-xs transition-all ${
              showShadows ? 'bg-white/95 border-gray-400 text-gray-800 font-semibold' : 'bg-white/60 border-gray-300 text-gray-400'
            }`}
          >
            <span>{showShadows ? 'Shadows: On' : 'Shadows: Off'}</span>
          </button>
        </div>

        {/* Orbit Hint */}
        <div className="absolute bottom-3 right-3 z-10 text-[10px] text-gray-500 bg-white/85 px-2.5 py-1 rounded-full border border-[#E5E3D8] pointer-events-none">
          Click & drag to rotate • Scroll to zoom
        </div>

      </div>

      {/* BOTTOM CONTROL BAR: Time-of-Day Slider & Animation Play/Pause */}
      <div className="relative z-10 p-3.5 bg-white/95 backdrop-blur-md border-t border-[#E2DFD2] space-y-2">
        <div className="flex items-center justify-between gap-4">
          
          {/* Play/Pause & Speed Buttons */}
          <div className="flex items-center space-x-1.5 shrink-0">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-xl bg-forest hover:bg-teal-dark text-white shadow-xs transition-all active:scale-95 flex items-center justify-center"
              title={isPlaying ? "Pause Sun Cycle" : "Play 24-Hour Cycle"}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            {/* Speed Selector */}
            <div className="flex items-center space-x-1 bg-[#F1EFE6] p-0.5 rounded-xl border border-[#D5D3C5]">
              {[1, 2, 5].map(spd => (
                <button
                  key={spd}
                  onClick={() => setPlaySpeed(spd)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                    playSpeed === spd ? 'bg-forest text-white shadow-2xs' : 'text-gray-600 hover:text-forest'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* Time Slider */}
          <div className="flex-1 flex items-center space-x-3">
            <span className="text-xs font-bold text-forest shrink-0 w-12 text-center bg-[#F1EFE6] py-1 rounded-lg border border-[#D5D3C5]">
              {String(Math.floor(hour)).padStart(2, '0')}:
              {String(Math.floor((hour % 1) * 60)).padStart(2, '0')}
            </span>

            <input
              type="range"
              min="0"
              max="24"
              step="0.1"
              value={hour}
              onChange={e => {
                setHour(parseFloat(e.target.value));
                if (isPlaying) setIsPlaying(false);
              }}
              className="w-full h-2 bg-[#E2DFD2] rounded-lg appearance-none cursor-pointer accent-forest focus:outline-none"
            />
          </div>

          {/* Quick presets */}
          <div className="hidden sm:flex items-center space-x-1 shrink-0 text-[11px] font-semibold text-gray-600">
            <button
              onClick={() => setHour(6.0)}
              className="px-2 py-1 rounded-lg bg-[#FAF9F5] hover:bg-mint hover:text-forest border border-[#E0DED3]"
            >
              Sunrise (06:00)
            </button>
            <button
              onClick={() => setHour(12.0)}
              className="px-2 py-1 rounded-lg bg-[#FAF9F5] hover:bg-mint hover:text-forest border border-[#E0DED3]"
            >
              Noon (12:00)
            </button>
            <button
              onClick={() => setHour(18.0)}
              className="px-2 py-1 rounded-lg bg-[#FAF9F5] hover:bg-mint hover:text-forest border border-[#E0DED3]"
            >
              Sunset (18:00)
            </button>
            <button
              onClick={() => setHour(2.0)}
              className="px-2 py-1 rounded-lg bg-[#FAF9F5] hover:bg-mint hover:text-forest border border-[#E0DED3]"
            >
              Cold Night (02:00)
            </button>
          </div>

        </div>

        {/* Environmental Mode Info Bar */}
        <div className="text-[11px] text-gray-500 flex items-center justify-between pt-1 border-t border-[#F0EFE6]">
          <span>
            {mode === 'summer' && '☀️ Summer Mode: Tracking solar angles, moving shadows, surface exposure & heat absorption.'}
            {mode === 'rainy' && `🌧️ Rainy Mode: Falling rain particles, roof collision, flow along slopes & drainage downspouts (${envState.rainfall_mm_h} mm/h).`}
            {mode === 'winter' && `❄️ Winter Mode: Snowfall, roof snow blanket, infrared thermal escape & insulation layer cutaway.`}
            {mode === 'wind' && `🌬️ Wind Mode: Directional aerodynamic streamlines (${envState.wind_speed_m_s} m/s @ ${envState.wind_direction_deg}°), pressure zones & window cross-ventilation.`}
          </span>
          <span className="font-semibold text-forest">
            Shelter: {currentDesign.shelter_type || 'Community Shelter'}
          </span>
        </div>

      </div>

    </div>
  );
};
