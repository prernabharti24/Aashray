import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useShelter } from '../../context/ShelterContext';
import { Sun, Wind, Flame, Snowflake, Compass } from 'lucide-react';

export const ShelterViewer3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const { currentDesign } = useShelter();
  const [showVectors, setShowVectors] = useState<boolean>(true);

  // Material color mapper based on selected earth/masonry materials
  const getWallColor = (wallId: string) => {
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

  const getRoofColor = (roofId: string) => {
    switch (roofId) {
      case 'mud_straw_timber': return 0x8D6E63; // Earthen thatch/timber
      case 'thatch_bamboo': return 0xC5A059;    // Golden straw thatch
      case 'rcc_concrete': return 0x9E9E9E;     // RCC slab
      case 'cgi_sheet': return 0x78909C;        // Galvanized metal
      default: return 0x8D6E63;
    }
  };

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth || 500;
    const height = mountRef.current.clientHeight || 420;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xF8F7EF); // Calm warm cream

    // Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(7, 5, 8);
    camera.lookAt(0, 1.2, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Clear previous canvas
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    // Solar Directional Light based on orientation
    const orientRad = (currentDesign.orientation_deg * Math.PI) / 180;
    const sunDistance = 12;
    const sunX = Math.sin(orientRad) * sunDistance;
    const sunZ = Math.cos(orientRad) * sunDistance;
    const sunY = 9;

    const sunLight = new THREE.DirectionalLight(0xFFF2A8, 1.4);
    sunLight.position.set(sunX, sunY, sunZ);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    // Sun Visual Sphere
    const sunGeo = new THREE.SphereGeometry(0.6, 16, 16);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xF4A340 });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.position.set(sunX * 0.8, sunY * 0.8, sunZ * 0.8);
    scene.add(sunMesh);

    // Sun glow ring
    const sunRingGeo = new THREE.RingGeometry(0.7, 0.85, 32);
    const sunRingMat = new THREE.MeshBasicMaterial({ color: 0xFFF2A8, side: THREE.DoubleSide });
    const sunRing = new THREE.Mesh(sunRingGeo, sunRingMat);
    sunRing.position.copy(sunMesh.position);
    sunRing.lookAt(camera.position);
    scene.add(sunRing);

    // Ground Plane with grid
    const groundGeo = new THREE.PlaneGeometry(16, 16);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xE6E3D5,
      roughness: 0.9,
      metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const gridHelper = new THREE.GridHelper(16, 16, 0x064C42, 0xD4D1C3);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // Main Shelter Group
    const shelterGroup = new THREE.Group();

    const L = currentDesign.length_m;
    const W = currentDesign.width_m;
    const H = currentDesign.height_m;

    // Walls
    const wallColor = getWallColor(currentDesign.wall_material_id);
    const wallMat = new THREE.MeshStandardMaterial({
      color: wallColor,
      roughness: 0.85,
      metalness: 0.05
    });

    const wallGeo = new THREE.BoxGeometry(L, H, W);
    const wallsMesh = new THREE.Mesh(wallGeo, wallMat);
    wallsMesh.position.y = H / 2;
    wallsMesh.castShadow = true;
    wallsMesh.receiveShadow = true;
    shelterGroup.add(wallsMesh);

    // Roof (Slightly larger with overhang)
    const roofColor = getRoofColor(currentDesign.roof_material_id);
    const roofMat = new THREE.MeshStandardMaterial({
      color: roofColor,
      roughness: 0.7,
      metalness: 0.1
    });
    const roofThick = 0.25;
    const roofGeo = new THREE.BoxGeometry(L + 0.6, roofThick, W + 0.6);
    const roofMesh = new THREE.Mesh(roofGeo, roofMat);
    roofMesh.position.y = H + (roofThick / 2);
    roofMesh.castShadow = true;
    roofMesh.receiveShadow = true;
    shelterGroup.add(roofMesh);

    // Front Door
    const doorGeo = new THREE.PlaneGeometry(0.9, Math.min(2.1, H * 0.8));
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x5D4037, roughness: 0.6 });
    const doorMesh = new THREE.Mesh(doorGeo, doorMat);
    doorMesh.position.set(0, (Math.min(2.1, H * 0.8)) / 2, (W / 2) + 0.01);
    shelterGroup.add(doorMesh);

    // Windows
    const winWidth = currentDesign.window_width_m;
    const winHeight = currentDesign.window_height_m;
    const winMat = new THREE.MeshStandardMaterial({
      color: 0x80D8FF,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.75
    });

    if (currentDesign.window_count > 0) {
      const winGeo = new THREE.PlaneGeometry(winWidth, winHeight);
      
      // Left window
      const win1 = new THREE.Mesh(winGeo, winMat);
      win1.position.set(-L * 0.28, H * 0.55, (W / 2) + 0.01);
      shelterGroup.add(win1);

      if (currentDesign.window_count > 1) {
        // Right window
        const win2 = new THREE.Mesh(winGeo, winMat);
        win2.position.set(L * 0.28, H * 0.55, (W / 2) + 0.01);
        shelterGroup.add(win2);
      }
    }

    // Apply orientation rotation to entire shelter group
    shelterGroup.rotation.y = -orientRad;
    scene.add(shelterGroup);

    // Physics Vectors (Heat in, Heat out, Wind)
    if (showVectors) {
      // Wind Vector
      const windDir = new THREE.Vector3(-1, 0, -0.5).normalize();
      const windOrigin = new THREE.Vector3(5, 2.5, 3);
      const windArrow = new THREE.ArrowHelper(windDir, windOrigin, 2.8, 0x3B82F6, 0.6, 0.4);
      scene.add(windArrow);

      // Solar Heat Gain Arrow (Yellow/Orange)
      const solarDir = new THREE.Vector3(0, -1, 0).normalize();
      const solarOrigin = new THREE.Vector3(0, H + 1.8, 0);
      const solarArrow = new THREE.ArrowHelper(solarDir, solarOrigin, 1.4, 0xF4A340, 0.4, 0.3);
      scene.add(solarArrow);

      // Heat Loss Vector (Blue)
      const lossDir = new THREE.Vector3(0, 1, 0).normalize();
      const lossOrigin = new THREE.Vector3(0, H + 0.3, 0);
      const lossArrow = new THREE.ArrowHelper(lossDir, lossOrigin, 1.2, 0x2563EB, 0.4, 0.3);
      scene.add(lossArrow);
    }

    // Interaction / Animation Loop
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const domElem = renderer.domElement;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      shelterGroup.rotation.y += deltaX * 0.01;
      camera.position.y = Math.max(1.5, Math.min(10, camera.position.y - deltaY * 0.02));
      camera.lookAt(0, 1.2, 0);
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    domElem.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      domElem.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.dispose();
    };
  }, [currentDesign, showVectors]);

  return (
    <div className="relative w-full h-[440px] bg-[#FAF9F5] rounded-3xl border border-[#E0DED3] overflow-hidden shadow-inner flex flex-col justify-between p-4 select-none">
      
      {/* 3D Canvas Mount */}
      <div ref={mountRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* Top Floating Badge & Legend */}
      <div className="relative z-10 flex items-center justify-between pointer-events-none">
        <div className="bg-white/90 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-[#D5D3C5] shadow-xs flex items-center space-x-2 text-xs font-semibold text-forest">
          <Compass className="w-3.5 h-3.5 text-earth" />
          <span>Facing: {currentDesign.orientation_deg}° ({currentDesign.orientation_deg === 180 ? 'South' : currentDesign.orientation_deg === 90 ? 'East' : currentDesign.orientation_deg === 0 ? 'North' : 'West'})</span>
        </div>

        {/* Vector Toggle */}
        <button
          onClick={() => setShowVectors(!showVectors)}
          className="pointer-events-auto bg-white/90 hover:bg-white px-3 py-1.5 rounded-full border border-[#D5D3C5] shadow-xs text-xs font-bold text-gray-700 flex items-center space-x-1.5 transition-colors"
        >
          <span className="w-2 h-2 rounded-full bg-leaf" />
          <span>{showVectors ? 'Hide Physics Vectors' : 'Show Physics Vectors'}</span>
        </button>
      </div>

      {/* Bottom Physics Vector Legend */}
      {showVectors && (
        <div className="relative z-10 bg-white/95 backdrop-blur-md p-2.5 rounded-2xl border border-[#D5D3C5] shadow-md flex flex-wrap items-center justify-around gap-2 text-[11px] font-semibold text-gray-700 pointer-events-auto">
          <div className="flex items-center space-x-1">
            <Sun className="w-3.5 h-3.5 text-[#F4A340]" />
            <span>☀️ Solar Heat</span>
          </div>
          <div className="flex items-center space-x-1">
            <Wind className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span>🌬️ Wind Convection</span>
          </div>
          <div className="flex items-center space-x-1">
            <Flame className="w-3.5 h-3.5 text-[#EA580C]" />
            <span>🔥 Solar Gain</span>
          </div>
          <div className="flex items-center space-x-1">
            <Snowflake className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>❄️ Envelope Loss</span>
          </div>
        </div>
      )}

      {/* Floating Instructions */}
      <div className="absolute bottom-16 right-4 z-10 text-[10px] text-gray-500 bg-white/80 px-2.5 py-1 rounded-full border border-[#E5E3D8] pointer-events-none">
        Drag to rotate • Real-time orientation angle
      </div>

    </div>
  );
};
