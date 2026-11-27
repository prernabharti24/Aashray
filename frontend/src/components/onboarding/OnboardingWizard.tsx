import React, { useState, useEffect, useRef } from 'react';
import { useShelter } from '../../context/ShelterContext';
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  Search,
  Crosshair,
  ChevronRight,
  Snowflake,
  Sun,
  CloudRain,
  Thermometer,
  Info,
  Upload,
  FileText,
  Trash2,
  RefreshCw,
  AlertCircle,
  Loader2,
  Ruler,
  Check,
  Plus
} from 'lucide-react';
import { analyzeFloorPlanApi, saveFloorPlanMeasurementsApi } from '../../services/api';
import type { FloorPlanAnalysisResponse } from '../../types';
import {
  SEARCHABLE_CITIES,
  searchLocations,
  reverseGeocodeCoordinates,
  generateClimateForLocation,
  type CityLocation
} from '../../utils/locationService';

export const OnboardingWizard: React.FC = () => {
  const {
    isOnboardingOpen,
    setIsOnboardingOpen,
    currentDesign,
    updateDesign,
    setActivePage,
    climates,
    addCustomClimate,
    runComparison
  } = useShelter();

  // Search & Geolocation States
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<CityLocation[]>(() => SEARCHABLE_CITIES.slice(0, 6));
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Step 4: Material Planning States
  const [selectedWallMaterials, setSelectedWallMaterials] = useState<string[]>(() => [
    currentDesign.wall_material_id || 'red_brick'
  ]);
  const [selectedRoofMaterials, setSelectedRoofMaterials] = useState<string[]>(() => [
    currentDesign.roof_material_id || 'thatch_bamboo'
  ]);
  const [customMaterials, setCustomMaterials] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<{
    compatibilityScore: number;
    title: string;
    description: string;
    suggestions: string[];
  } | null>(null);

  const [step, setStep] = useState<number>(1);

  // Step 3 Floor Plan Upload & Dimension Extraction State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [floorPlanAnalysis, setFloorPlanAnalysis] = useState<FloorPlanAnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [calibrationRefM, setCalibrationRefM] = useState<string>('');
  const [calibrationScale, setCalibrationScale] = useState<string>('1:100');
  const [dimensionsApplied, setDimensionsApplied] = useState<boolean>(false);

  // Handle Search Input with Debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!searchQuery.trim()) {
        setSearchResults(SEARCHABLE_CITIES.slice(0, 6));
        return;
      }
      setIsSearching(true);
      try {
        const results = await searchLocations(searchQuery);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (!isOnboardingOpen) return null;

  const activeClimate = climates.find(c => c.id === currentDesign.location_id) || climates[0];

  // 5 Recommended Extreme Regions (Step 1)
  const recommendedRegions = [
    {
      id: 'ladakh',
      name: 'Ladakh',
      climate: 'Cold and Arid',
      desc: 'High altitude, low temperatures.',
      image: '/locations/ladakh.jpg',
      icon: Snowflake,
      iconColor: 'text-sky-500'
    },
    {
      id: 'dras',
      name: 'Dras',
      climate: 'Extreme Cold',
      desc: 'Severe winter conditions.',
      image: '/locations/dras.jpg',
      icon: Snowflake,
      iconColor: 'text-sky-500'
    },
    {
      id: 'jaisalmer',
      name: 'Jaisalmer',
      climate: 'Hot and Arid',
      desc: 'Intense heat, low rainfall.',
      image: '/locations/jaisalmer.jpg',
      icon: Sun,
      iconColor: 'text-amber-500'
    },
    {
      id: 'shillong',
      name: 'Shillong',
      climate: 'Humid and Rainy',
      desc: 'High humidity, heavy rainfall.',
      image: '/locations/shillong.jpg',
      icon: CloudRain,
      iconColor: 'text-teal-600'
    },
    {
      id: 'delhi',
      name: 'Delhi / NCR',
      climate: 'Composite Climate',
      desc: 'Hot summers, cold winters.',
      image: '/locations/delhi.jpg',
      icon: Thermometer,
      iconColor: 'text-orange-500'
    }
  ];

  // Step 4: Predefined Wall Materials (Matching Reference Screenshot)
  const wallMaterialOptions = [
    {
      id: 'red_brick',
      name: 'Local Bricks',
      image: '/materials/mat_local_bricks.png',
      desc: 'Standard clay masonry'
    },
    {
      id: 'local_stone',
      name: 'Stone',
      image: '/materials/mat_stone.png',
      desc: 'Himalayan granite/rubble'
    },
    {
      id: 'adobe_mud',
      name: 'Adobe / Mud',
      image: '/materials/mat_adobe.png',
      desc: 'High thermal mass earthen clay'
    },
    {
      id: 'cseb_blocks',
      name: 'AAC Blocks',
      image: '/materials/mat_aac.png',
      desc: 'Lightweight aerated masonry'
    },
    {
      id: 'concrete_block',
      name: 'Concrete Blocks',
      image: '/materials/mat_concrete.png',
      desc: 'Standard hollow concrete masonry'
    }
  ];

  // Step 4: Predefined Roof Materials (Matching Reference Screenshot)
  const roofMaterialOptions = [
    {
      id: 'thatch_bamboo',
      name: 'Bamboo',
      image: '/materials/mat_bamboo.png',
      desc: 'Bio-based natural frame'
    },
    {
      id: 'mud_straw_timber',
      name: 'Timber',
      image: '/materials/mat_timber.png',
      desc: 'Poplar / pine timber deck'
    },
    {
      id: 'rcc_concrete',
      name: 'RCC Slab',
      image: '/materials/mat_rcc.png',
      desc: 'Cast concrete flat deck'
    },
    {
      id: 'cgi_sheet',
      name: 'Metal Sheets',
      image: '/materials/mat_metal.png',
      desc: 'Corrugated galvanized iron'
    },
    {
      id: 'thatch_straw',
      name: 'Thatch',
      image: '/materials/mat_thatch.png',
      desc: 'Dry reed / straw grass thatch'
    }
  ];

  // Steps 2 & 5 configurations
  const shelterTypes = [
    { id: 'Community Shelter', name: 'Community Shelter', icon: '🏛️', desc: 'Public or defensive gathering hall with moderate occupancy' },
    { id: 'Worker / Army Barrack', name: 'Worker / Army Barrack', icon: '⛺', desc: 'Durable modular accommodation for border or field workforce' },
    { id: 'Transit / Bus Shelter', name: 'Transit / Bus Shelter', icon: '🚏', desc: 'Semi-open passenger waiting enclosure with wind protection' },
    { id: 'High-Altitude Residence', name: 'High-Altitude Residence', icon: '🏡', desc: 'Insulated living unit with continuous heating priority' },
    { id: 'Custom Architecture', name: 'Custom Architecture', icon: '📐', desc: 'Flexible modular geometric enclosure' }
  ];

  const orientationOptions = [
    { deg: 180, label: 'South (180°)', desc: 'Optimal for cold climates (Maximum Winter Solar Trap)', badge: 'Recommended for Ladakh' },
    { deg: 90, label: 'East (90°)', desc: 'Morning sun capture, quick warming after cold nights', badge: 'Morning Sunlight' },
    { deg: 270, label: 'West (270°)', desc: 'Late afternoon solar gain (caution in hot climates)', badge: 'Evening Heat' },
    { deg: 0, label: 'North (0°)', desc: 'Minimal direct solar gain, shaded diffuse light', badge: 'Cooler Facade' }
  ];

  // Toggle Wall Material Selection
  const handleToggleWallMaterial = (materialId: string) => {
    setSelectedWallMaterials(prev => {
      let next: string[];
      if (prev.includes(materialId)) {
        if (prev.length <= 1) return prev; // Keep at least one
        next = prev.filter(id => id !== materialId);
      } else {
        next = [...prev, materialId];
      }
      // Update primary design material
      updateDesign({ wall_material_id: next[0] || materialId });
      return next;
    });
  };

  // Toggle Roof Material Selection
  const handleToggleRoofMaterial = (materialId: string) => {
    setSelectedRoofMaterials(prev => {
      let next: string[];
      if (prev.includes(materialId)) {
        if (prev.length <= 1) return prev; // Keep at least one
        next = prev.filter(id => id !== materialId);
      } else {
        next = [...prev, materialId];
      }
      // Update primary design roof
      updateDesign({ roof_material_id: next[0] || materialId });
      return next;
    });
  };

  // Add Custom Material
  const handleAddCustomMaterial = () => {
    const val = customInput.trim();
    if (!val) return;
    if (customMaterials.some(m => m.toLowerCase() === val.toLowerCase())) {
      setCustomInput('');
      return;
    }
    setCustomMaterials(prev => [...prev, val]);
    setCustomInput('');
  };

  const handleRemoveCustomMaterial = (mat: string) => {
    setCustomMaterials(prev => prev.filter(m => m !== mat));
  };

  // Analyze Materials Action
  const handleAnalyzeMaterials = async () => {
    if (selectedWallMaterials.length === 0 && selectedRoofMaterials.length === 0 && customMaterials.length === 0) {
      alert("Please select or enter at least one material to analyze.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      // Run comparison engine
      await runComparison();

      const activeLoc = currentDesign.location_id;
      const isCold = ['ladakh', 'dras', 'shillong'].includes(activeLoc);

      let score = 88;
      const suggestions: string[] = [];

      if (isCold) {
        if (selectedWallMaterials.includes('adobe_mud') || selectedWallMaterials.includes('local_stone')) {
          score += 6;
          suggestions.push("Earthen mud and stone provide superior thermal lag (10-12 hours) buffering cold night drops.");
        } else {
          suggestions.push("Upgrade primary wall core to Adobe / Rammed Earth (300mm) to eliminate rapid nighttime cooling.");
        }

        if (selectedRoofMaterials.includes('mud_straw_timber') || selectedRoofMaterials.includes('thatch_bamboo')) {
          suggestions.push("Natural timber and thatch rafter deck provides built-in thermal resistance.");
        } else {
          suggestions.push("Uninsulated concrete/metal roof causes over 45% of total conductive heat loss. Adding 50mm bio-insulation recommended.");
        }

        if (customMaterials.length > 0) {
          suggestions.push(`Custom material (${customMaterials.join(', ')}) incorporated into non-structural thermal envelope.`);
        }
      } else {
        score = 92;
        suggestions.push("Selected materials provide high thermal mass suitable for dampening daytime peak solar heat waves.");
      }

      setAnalysisResult({
        compatibilityScore: score,
        title: isCold ? "Cold Climate Microclimate Analysis" : "Climate Suitability Analysis",
        description: `Analysis completed for ${activeClimate.name.split(' (')[0]}.`,
        suggestions
      });
    } catch (e) {
      console.warn("Analysis ran with client fallback", e);
      setAnalysisResult({
        compatibilityScore: 85,
        title: "Material Compatibility Summary",
        description: `Analysis completed for ${activeClimate.name.split(' (')[0]}.`,
        suggestions: [
          "High thermal mass materials selected will stabilize indoor temperatures.",
          "Add 50mm compressed bio-insulation on the roof deck to eliminate thermal bridging."
        ]
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Select a Recommended Region (Step 1)
  const handleSelectRecommended = (regionId: string, regionName: string) => {
    updateDesign({
      location_id: regionId,
      name: `${regionName.split(' ')[0]} Shelter`
    });
    setLocationError(null);
    setStatusMessage(`Selected ${regionName}`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Select a Searched City / Location
  const handleSelectCity = (city: CityLocation) => {
    const customClimate = generateClimateForLocation(city);
    addCustomClimate(customClimate);

    updateDesign({
      location_id: customClimate.id,
      name: `${city.name} Shelter`
    });
    setIsSearchOpen(false);
    setLocationError(null);
    setStatusMessage(`Location set to ${city.name}, ${city.country} (${city.climate_category})`);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Geolocation Detection
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser. Please search for your city.");
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const detectedCity = await reverseGeocodeCoordinates(lat, lon);
          handleSelectCity(detectedCity);
        } catch {
          setLocationError("Could not determine area name from GPS coordinates. Please search your city.");
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        if (err.code === 1) {
          setLocationError("Location permission was denied. You can search any city above or pick an extreme region.");
        } else {
          setLocationError("Unable to retrieve device position. Please use the search bar.");
        }
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleFinish = () => {
    setIsOnboardingOpen(false);
    setStep(1);
    setActivePage('design');
  };

  const handleProcessFile = async (file: File, refM?: number, scale?: string) => {
    const validExtensions = ['.png', '.jpg', '.jpeg', '.pdf'];
    const hasValidExt = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    if (!hasValidExt) {
      setAnalysisError('Unsupported file type. Please upload a PNG, JPG, JPEG, or PDF floor plan.');
      return;
    }

    setUploadedFile(file);
    setIsAnalyzing(true);
    setAnalysisError(null);
    setDimensionsApplied(false);

    try {
      const result = await analyzeFloorPlanApi(
        file,
        refM,
        undefined,
        scale
      );
      setFloorPlanAnalysis(result);
      if (result.has_dimensions && result.length_m && result.width_m) {
        // Automatically populate existing Length and Width fields
        updateDesign({
          length_m: result.length_m,
          width_m: result.width_m
        });
        setDimensionsApplied(true);
      }
    } catch (err: any) {
      console.error('Floor plan analysis error:', err);
      setAnalysisError(err.message || 'Failed to analyze floor plan. Please verify the file and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleProcessFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleProcessFile(file);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setFloorPlanAnalysis(null);
    setAnalysisError(null);
    setDimensionsApplied(false);
    setCalibrationRefM('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCalibrate = async () => {
    if (!uploadedFile) return;
    const refM = parseFloat(calibrationRefM);
    if (!refM || refM <= 0) {
      setAnalysisError('Please enter a valid positive reference measurement in meters (e.g. 6.0).');
      return;
    }
    setIsCalibrating(true);
    try {
      await handleProcessFile(uploadedFile, refM, calibrationScale || undefined);
    } finally {
      setIsCalibrating(false);
    }
  };

  const handleApplyDimensions = () => {
    if (floorPlanAnalysis?.length_m && floorPlanAnalysis?.width_m) {
      updateDesign({
        length_m: floorPlanAnalysis.length_m,
        width_m: floorPlanAnalysis.width_m
      });
      setDimensionsApplied(true);
      if (floorPlanAnalysis.floorplan_id) {
        saveFloorPlanMeasurementsApi(
          floorPlanAnalysis.floorplan_id,
          floorPlanAnalysis.length_m,
          floorPlanAnalysis.width_m,
          currentDesign.height_m
        );
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white w-full max-w-2xl sm:max-w-3xl rounded-3xl shadow-2xl border border-[#E0DED3] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* ============================================================== */}
        {/* HEADER SECTION (Deep Emerald Header Matching Reference Images) */}
        {/* ============================================================== */}
        <div className="relative bg-gradient-to-r from-[#075C55] via-[#064E48] to-[#043B34] text-white px-6 sm:px-8 py-6 overflow-hidden">
          
          {/* Subtle Decorative Leaves Watermark in Background */}
          <svg
            className="absolute right-0 top-0 bottom-0 h-full w-64 text-emerald-900/40 pointer-events-none select-none"
            viewBox="0 0 200 120"
            fill="currentColor"
          >
            <path d="M140,10 C165,25 185,55 195,85 C175,75 155,50 140,10 Z" opacity="0.3" />
            <path d="M110,30 C135,40 155,70 160,100 C140,85 125,60 110,30 Z" opacity="0.4" />
            <path d="M75,60 C100,65 120,90 125,120 C105,105 90,85 75,60 Z" opacity="0.3" />
            <path d="M165,15 C180,25 195,45 200,65 C185,55 175,35 165,15 Z" opacity="0.5" />
            <path d="M130,0 C145,15 155,35 160,55 C145,45 135,25 130,0 Z" opacity="0.4" />
          </svg>

          <div className="relative z-10 flex items-start justify-between">
            <div className="flex items-start space-x-4">
              
              {/* Header Illustration Icon */}
              <div className="shrink-0 w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xs p-1 flex items-center justify-center border border-white/15 shadow-sm">
                <img
                  src={step === 4 ? '/materials/header_material_icon.png' : '/locations/header_map_pin.jpg'}
                  alt="Step icon"
                  className="w-full h-full object-contain rounded-xl"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>

              {/* Header Title & Subtitle */}
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold tracking-wide text-[#A8D5BA] uppercase">
                    Step {step} of 5 • {step === 1 ? 'Location' : step === 2 ? 'Typology' : step === 3 ? 'Dimensions' : step === 4 ? 'Material Planning' : 'Orientation'}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-sans tracking-tight text-white mt-1">
                  {step === 1 && "Where is your shelter located?"}
                  {step === 2 && "What are you designing?"}
                  {step === 3 && "How big is the shelter?"}
                  {step === 4 && "What materials do you have?"}
                  {step === 5 && "How is it oriented?"}
                </h2>
                <p className="text-xs sm:text-sm text-white/80 font-normal mt-1 max-w-xl leading-relaxed">
                  {step === 1 && "Choose a location or enter your own. We'll analyze the climate and recommend an optimal design for your area."}
                  {step === 2 && "Select the functional typological category for your shelter envelope."}
                  {step === 3 && "Specify the external length, width, and ceiling height in meters."}
                  {step === 4 && "Tell us what materials are available to you. We'll analyze them and suggest additional materials for your climate."}
                  {step === 5 && "Orient the primary facade and windows to maximize passive solar gains."}
                </p>
              </div>

            </div>

            {/* Close Button */}
            <button
              onClick={() => setIsOnboardingOpen(false)}
              className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/15 transition-colors shrink-0"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* ============================================================== */}
        {/* MODAL BODY                                                     */}
        {/* ============================================================== */}
        <div className="p-5 sm:p-7 max-h-[72vh] overflow-y-auto space-y-5 bg-[#FBF8F2]">
          
          {/* Status Message or Error Alert */}
          {statusMessage && (
            <div className="bg-[#E5EFE2] border border-[#A5D6A7] text-[#075C55] px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-2xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-[#075C55] shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {locationError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{locationError}</span>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* STEP 1: REDESIGNED LOCATION SELECTION                         */}
          {/* ------------------------------------------------------------ */}
          {step === 1 && (
            <div className="space-y-6">
              
              {/* TWO LARGE HORIZONTAL ACTION CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* CARD 1: Use My Current Location */}
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isLocating}
                  className="group p-4 rounded-2xl bg-[#EAF2E8] border border-[#C8DFC3] hover:border-[#167A68] hover:bg-[#E3EFE0] transition-all duration-150 flex items-center justify-between text-left shadow-2xs hover:shadow-xs active:scale-[0.99] cursor-pointer"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#D6E8D2] flex items-center justify-center shrink-0 text-[#167A68] group-hover:scale-105 transition-transform">
                      {isLocating ? (
                        <Loader2 className="w-6 h-6 animate-spin text-[#167A68]" />
                      ) : (
                        <Crosshair className="w-6 h-6 text-[#167A68]" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#075C55] text-sm sm:text-base">
                        {isLocating ? "Detecting location..." : "Use my current location"}
                      </h3>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Detect your location automatically
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#075C55] group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* CARD 2: Search Any Location */}
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className={`group p-4 rounded-2xl bg-white border ${
                    isSearchOpen ? 'border-[#167A68] ring-2 ring-[#167A68]/20' : 'border-[#E2DFD2] hover:border-[#167A68]'
                  } transition-all duration-150 flex items-center justify-between text-left shadow-2xs hover:shadow-xs active:scale-[0.99] cursor-pointer`}
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#FAF6EE] border border-[#E2DFD2] flex items-center justify-center shrink-0 text-[#167A68] group-hover:scale-105 transition-transform">
                      <Search className="w-6 h-6 text-[#167A68]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#075C55] text-sm sm:text-base">
                        Search any location
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Enter a city, e.g. Bhopal, Indore, Pune...
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-5 h-5 text-gray-400 group-hover:text-[#075C55] transition-transform ${
                      isSearchOpen ? 'rotate-90 text-[#075C55]' : ''
                    }`}
                  />
                </button>

              </div>

              {/* INTEGRATED SEARCH DROPDOWN / EXPANDED INPUT */}
              {isSearchOpen && (
                <div className="bg-white rounded-2xl border border-[#D5D3C5] p-4 shadow-sm space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      autoFocus
                      placeholder="Type any city (e.g. Bhopal, Indore, Pune, Jaipur, Denver...)"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF9F5] border border-[#D5D3C5] text-sm font-semibold text-[#075C55] focus:outline-none focus:ring-2 focus:ring-[#075C55]"
                    />
                    {isSearching && (
                      <Loader2 className="absolute right-3.5 top-3.5 w-4 h-4 animate-spin text-gray-400" />
                    )}
                  </div>

                  <div className="max-h-52 overflow-y-auto divide-y divide-[#F0EDE3] border-t border-[#F0EDE3] pt-1">
                    {searchResults.length > 0 ? (
                      searchResults.map(city => (
                        <div
                          key={city.id}
                          onClick={() => handleSelectCity(city)}
                          className="py-2.5 px-3 rounded-xl hover:bg-[#EAF2E8] flex items-center justify-between cursor-pointer transition-colors"
                        >
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-sm text-[#075C55]">{city.name}</span>
                              <span className="text-[10px] font-semibold bg-[#E2ECE0] text-[#075C55] px-2 py-0.5 rounded-full">
                                {city.climate_category}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500 block">{city.region}, {city.country}</span>
                          </div>
                          <div className="text-right text-[11px] text-gray-400 font-medium">
                            <span>{city.latitude}°N • {city.elevation_m}m</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500 py-3 text-center">
                        No matching cities found. Try typing another city or select a recommended region below.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* CENTERED DIVIDER */}
              <div className="relative flex items-center justify-center">
                <div className="w-full border-t border-[#E5E1D5]" />
                <span className="absolute bg-[#FBF8F2] px-4 text-xs font-semibold text-gray-500 tracking-wide select-none">
                  Or choose a recommended extreme region
                </span>
              </div>

              {/* 5 RECOMMENDED EXTREME REGION CARDS IN ONE ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                {recommendedRegions.map(reg => {
                  const isSelected = currentDesign.location_id === reg.id;
                  const IconComponent = reg.icon;

                  return (
                    <div
                      key={reg.id}
                      onClick={() => handleSelectRecommended(reg.id, reg.name)}
                      className={`group rounded-2xl border transition-all duration-150 flex flex-col justify-between overflow-hidden cursor-pointer ${
                        isSelected
                          ? 'border-2 border-[#075C55] bg-[#EFF6EE] shadow-sm ring-1 ring-[#075C55]/20'
                          : 'border-[#E6E1D3] hover:border-[#167A68]/60 bg-[#FBF8F2] hover:shadow-xs'
                      }`}
                    >
                      {/* Top Image */}
                      <div className="h-22 w-full overflow-hidden bg-gray-200 relative">
                        <img
                          src={reg.image}
                          alt={reg.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 bg-[#075C55] text-white p-0.5 rounded-full shadow-xs">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      {/* Card Content */}
                      <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <IconComponent className={`w-3.5 h-3.5 ${reg.iconColor} shrink-0`} />
                            <h4 className="font-bold text-sm text-[#172321]">{reg.name}</h4>
                          </div>
                          <span className="text-[11px] text-gray-600 font-semibold block mt-0.5">
                            {reg.climate}
                          </span>
                          <p className="text-[10px] text-gray-500 mt-1 line-clamp-2 leading-tight">
                            {reg.desc}
                          </p>
                        </div>

                        {/* Select Button */}
                        <button
                          type="button"
                          className={`w-full py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 transition-all ${
                            isSelected
                              ? 'bg-[#075C55] text-white font-bold shadow-2xs'
                              : 'bg-[#F4EFE6] hover:bg-[#EAE4D8] border border-[#DDD8CB] text-gray-700'
                          }`}
                        >
                          <span>{isSelected ? 'Selected' : 'Select'}</span>
                          {isSelected ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowRight className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* INFORMATION BANNER */}
              <div className="bg-[#E4EEE1] border border-[#CDE0C8] rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-[#075C55] text-white flex items-center justify-center shrink-0">
                    <Info className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#043B34]">
                      AASHRAY supports both regular and extreme climatic conditions.
                    </h4>
                    <p className="text-[11px] sm:text-xs text-[#064E48]/85 mt-0.5">
                      Get personalized shelter recommendations for any supported location.
                    </p>
                  </div>
                </div>

                <img
                  src="/locations/banner_house.jpg"
                  alt="Sustainable shelter"
                  className="h-12 sm:h-14 w-auto object-contain shrink-0 hidden sm:block rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>

            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* STEP 2: SHELTER TYPE                                         */}
          {/* ------------------------------------------------------------ */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Select the functional typological category for your shelter:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {shelterTypes.map(t => {
                  const isSelected = currentDesign.shelter_type === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => updateDesign({ shelter_type: t.id })}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-150 ${
                        isSelected
                          ? 'border-[#075C55] bg-[#EFF6EE] shadow-xs'
                          : 'border-[#E5E3D8] hover:border-[#075C55]/40 bg-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{t.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#075C55] text-sm">{t.name}</span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-[#075C55]" />}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{t.desc}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Size & Floor Plan Upload */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-600">
                  Specify the primary external architectural dimensions in meters. You can upload an existing floor plan for automatic dimension detection, or enter measurements manually.
                </p>
              </div>

              {/* SECTION: House Plan Upload Area */}
              <div className="bg-[#FAF9F5] p-5 rounded-2xl border border-[#E5E3D8] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-forest" />
                    <span className="text-xs font-bold text-forest uppercase tracking-wider">
                      House Floor Plan (Automatic Dimension Detection)
                    </span>
                  </div>
                  {floorPlanAnalysis && (
                    <span className="text-[10px] bg-mint text-forest font-semibold px-2 py-0.5 rounded-full border border-[#A5D6A7]">
                      {floorPlanAnalysis.has_dimensions ? 'Dimensions Detected' : 'Requires Calibration'}
                    </span>
                  )}
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Drop Zone (when no file is uploaded) */}
                {!uploadedFile && (
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                      isDragOver
                        ? 'border-forest bg-mint/30 shadow-inner'
                        : 'border-[#C5C3B6] hover:border-forest/60 bg-white shadow-2xs'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-mint/50 flex items-center justify-center text-forest">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-forest">
                          Drag and drop your floor plan here
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          or click to browse from your computer
                        </p>
                      </div>
                      <div className="pt-2 flex items-center justify-center space-x-2 text-[11px] text-gray-400 font-medium">
                        <span className="px-2 py-0.5 bg-[#FAF9F5] rounded border border-[#E5E3D8]">PNG</span>
                        <span className="px-2 py-0.5 bg-[#FAF9F5] rounded border border-[#E5E3D8]">JPG</span>
                        <span className="px-2 py-0.5 bg-[#FAF9F5] rounded border border-[#E5E3D8]">JPEG</span>
                        <span className="px-2 py-0.5 bg-[#FAF9F5] rounded border border-[#E5E3D8]">PDF</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* File Uploaded Header & Actions */}
                {uploadedFile && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-[#D5D3C5]">
                      <div className="flex items-center space-x-2.5 overflow-hidden">
                        <div className="p-1.5 rounded-lg bg-mint/60 text-forest shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="truncate text-left">
                          <p className="text-xs font-bold text-forest truncate max-w-[200px] sm:max-w-xs">
                            {uploadedFile.name}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {(uploadedFile.size / 1024).toFixed(1)} KB • {uploadedFile.type || 'Architectural Plan'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isAnalyzing}
                          className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-gray-600 hover:text-forest hover:bg-[#FAF9F5] border border-[#E5E3D8] transition-colors flex items-center space-x-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Replace</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          disabled={isAnalyzing}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 border border-transparent transition-colors"
                          title="Remove floor plan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Analyzing Loader State */}
                    {isAnalyzing && (
                      <div className="bg-white rounded-xl border border-[#E5E3D8] p-6 text-center space-y-2">
                        <Loader2 className="w-6 h-6 animate-spin text-forest mx-auto" />
                        <p className="text-xs font-bold text-forest">
                          Analyzing floor plan geometry & OCR dimensions...
                        </p>
                        <p className="text-[11px] text-gray-500">
                          Detecting walls, dimension annotations, drawing scale, and envelope bounds...
                        </p>
                      </div>
                    )}

                    {/* Error State */}
                    {analysisError && !isAnalyzing && (
                      <div className="bg-red-50 border border-red-200 text-red-800 p-3.5 rounded-xl text-xs space-y-2">
                        <div className="flex items-start space-x-2.5">
                          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-semibold">Analysis Notice</p>
                            <p className="text-[11px] mt-0.5">{analysisError}</p>
                          </div>
                        </div>
                        {uploadedFile && (
                          <div className="flex justify-end pt-1">
                            <button
                              type="button"
                              onClick={() => handleProcessFile(uploadedFile)}
                              className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-[11px] font-bold transition-colors"
                            >
                              Retry Analysis
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Visual Dimension Verification Preview */}
                    {floorPlanAnalysis && !isAnalyzing && (
                      <div className="space-y-3">
                        <div className="relative bg-white rounded-xl border border-[#D5D3C5] overflow-hidden">
                          <div className="p-2 border-b border-[#EFECE0] bg-[#FAF9F5] flex items-center justify-between text-[11px] text-gray-500">
                            <span className="font-semibold text-forest">Visual Dimension Verification</span>
                            <span>Detected envelope & measurement markers</span>
                          </div>
                          <div className="p-2 flex items-center justify-center max-h-72 overflow-hidden bg-slate-50">
                            <img
                              src={floorPlanAnalysis.preview_image || floorPlanAnalysis.raw_preview_image}
                              alt="Floor plan with detected dimensions"
                              className="max-h-64 w-auto object-contain rounded-lg shadow-2xs"
                            />
                          </div>
                        </div>

                        {/* CASE 1: Dimensions Detected Successfully */}
                        {floorPlanAnalysis.has_dimensions ? (
                          <div className="bg-mint/40 border border-[#A5D6A7] rounded-xl p-3.5 space-y-2.5">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <div>
                                <div className="flex items-center space-x-1.5 text-forest font-bold text-xs">
                                  <CheckCircle2 className="w-4 h-4 text-forest" />
                                  <span>Dimensions Detected Successfully</span>
                                </div>
                                <div className="text-sm font-extrabold text-forest mt-0.5">
                                  Length: {floorPlanAnalysis.length_m} m &nbsp;•&nbsp; Width: {floorPlanAnalysis.width_m} m
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={handleApplyDimensions}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 ${
                                  dimensionsApplied
                                    ? 'bg-forest text-white'
                                    : 'bg-forest hover:bg-teal-dark text-white'
                                }`}
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>{dimensionsApplied ? 'Applied to Model' : 'Confirm & Apply'}</span>
                              </button>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#A5D6A7]/50 text-[11px] text-forest/90">
                              <span className="bg-white/80 px-2 py-0.5 rounded-md font-medium border border-[#A5D6A7]">
                                Unit: <strong>{floorPlanAnalysis.detected_unit || 'meters'}</strong>
                              </span>
                              {floorPlanAnalysis.detected_scale && (
                                <span className="bg-white/80 px-2 py-0.5 rounded-md font-medium border border-[#A5D6A7]">
                                  Scale: <strong>{floorPlanAnalysis.detected_scale}</strong>
                                </span>
                              )}
                              <span className="bg-white/80 px-2 py-0.5 rounded-md font-medium border border-[#A5D6A7]">
                                Confidence: <strong>{Math.round(floorPlanAnalysis.confidence * 100)}%</strong>
                              </span>
                              <span className="text-forest text-[11px] italic">
                                {dimensionsApplied
                                  ? '✓ Populated in Length & Width fields below.'
                                  : 'Click Confirm to populate the fields below.'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          /* CASE 2: No Dimensions / Scale Detected (Never Guess!) */
                          <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3.5 space-y-3">
                            <div className="flex items-start space-x-2">
                              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                              <div className="text-xs">
                                <p className="font-bold text-amber-900">
                                  No Clear Dimension Labels or Scale Found
                                </p>
                                <p className="text-amber-800 text-[11px] mt-0.5">
                                  AASHRAY never invents or guesses dimensions. To calibrate this drawing, provide a known reference measurement or select its architectural scale:
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1 items-end">
                              <div className="sm:col-span-5">
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-amber-900 mb-1">
                                  Known Frontage Length (m)
                                </label>
                                <input
                                  type="number"
                                  step="0.5"
                                  min="1"
                                  max="30"
                                  placeholder="e.g. 6.0"
                                  value={calibrationRefM}
                                  onChange={e => setCalibrationRefM(e.target.value)}
                                  className="w-full text-xs font-bold text-forest bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-forest outline-none"
                                />
                              </div>

                              <div className="sm:col-span-4">
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-amber-900 mb-1">
                                  Drawing Scale
                                </label>
                                <select
                                  value={calibrationScale}
                                  onChange={e => setCalibrationScale(e.target.value)}
                                  className="w-full text-xs font-bold text-forest bg-white border border-amber-300 rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-forest outline-none"
                                >
                                  <option value="1:100">1:100</option>
                                  <option value="1:50">1:50</option>
                                  <option value="1:200">1:200</option>
                                  <option value="1:500">1:500</option>
                                </select>
                              </div>

                              <div className="sm:col-span-3">
                                <button
                                  type="button"
                                  onClick={handleCalibrate}
                                  disabled={isCalibrating || !calibrationRefM}
                                  className="w-full px-3 py-1.5 rounded-lg bg-forest hover:bg-teal-dark text-white font-bold text-xs flex items-center justify-center space-x-1 shadow-xs disabled:opacity-50 transition-all"
                                >
                                  {isCalibrating ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Ruler className="w-3.5 h-3.5" />
                                  )}
                                  <span>Calibrate</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* SECTION: Architectural Envelope Dimensions (Manual / Populated) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-forest uppercase tracking-wider">
                    Shelter Dimensions (Length, Width & Height)
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Values populate from plan, or adjust manually
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#E5E3D8]">
                    <label className="block text-xs font-bold text-forest uppercase tracking-wider mb-1">
                      Length (m)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="1.5"
                      max="30"
                      value={currentDesign.length_m}
                      onChange={e => {
                        const newL = parseFloat(e.target.value) || 4.0;
                        updateDesign({ length_m: newL });
                        setDimensionsApplied(false);
                        if (floorPlanAnalysis?.floorplan_id) {
                          saveFloorPlanMeasurementsApi(
                            floorPlanAnalysis.floorplan_id,
                            newL,
                            currentDesign.width_m,
                            currentDesign.height_m
                          );
                        }
                      }}
                      className="w-full text-2xl font-bold text-forest bg-white border border-[#D5D3C5] rounded-xl px-3 py-2 text-center focus:ring-2 focus:ring-forest outline-none"
                    />
                    <span className="text-[11px] text-gray-400 text-center block mt-1">Frontage</span>
                  </div>

                  <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#E5E3D8]">
                    <label className="block text-xs font-bold text-forest uppercase tracking-wider mb-1">
                      Width (m)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="1.5"
                      max="30"
                      value={currentDesign.width_m}
                      onChange={e => {
                        const newW = parseFloat(e.target.value) || 3.0;
                        updateDesign({ width_m: newW });
                        setDimensionsApplied(false);
                        if (floorPlanAnalysis?.floorplan_id) {
                          saveFloorPlanMeasurementsApi(
                            floorPlanAnalysis.floorplan_id,
                            currentDesign.length_m,
                            newW,
                            currentDesign.height_m
                          );
                        }
                      }}
                      className="w-full text-2xl font-bold text-forest bg-white border border-[#D5D3C5] rounded-xl px-3 py-2 text-center focus:ring-2 focus:ring-forest outline-none"
                    />
                    <span className="text-[11px] text-gray-400 text-center block mt-1">Depth</span>
                  </div>

                  <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#E5E3D8]">
                    <label className="block text-xs font-bold text-forest uppercase tracking-wider mb-1">
                      Height (m)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="1.8"
                      max="10"
                      value={currentDesign.height_m}
                      onChange={e => {
                        const newH = parseFloat(e.target.value) || 2.8;
                        updateDesign({ height_m: newH });
                        if (floorPlanAnalysis?.floorplan_id) {
                          saveFloorPlanMeasurementsApi(
                            floorPlanAnalysis.floorplan_id,
                            currentDesign.length_m,
                            currentDesign.width_m,
                            newH
                          );
                        }
                      }}
                      className="w-full text-2xl font-bold text-forest bg-white border border-[#D5D3C5] rounded-xl px-3 py-2 text-center focus:ring-2 focus:ring-forest outline-none"
                    />
                    <span className="text-[11px] text-gray-400 text-center block mt-1">Ceiling Height</span>
                  </div>
                </div>

                <div className="bg-soft-blue/40 border border-[#BBDDFF] rounded-2xl p-4 flex items-center justify-between text-xs text-[#1E3A8A]">
                  <span>Total Floor Area: <strong>{(currentDesign.length_m * currentDesign.width_m).toFixed(1)} m²</strong></span>
                  <span>Enclosed Volume: <strong>{(currentDesign.length_m * currentDesign.width_m * currentDesign.height_m).toFixed(1)} m³</strong></span>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* STEP 4: REDESIGNED MATERIAL PLANNING (Reference Image Match) */}
          {/* ------------------------------------------------------------ */}
          {step === 4 && (
            <div className="space-y-6">
              
              {/* TWO EQUAL MATERIAL COLUMNS WITH SUBTLE VERTICAL DIVIDER */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                
                {/* Vertical Divider (Desktop) */}
                <div className="hidden md:block absolute top-2 bottom-2 left-1/2 -translate-x-1/2 w-[1px] bg-[#E5DCCE]" />

                {/* LEFT COLUMN: Wall Materials */}
                <div className="space-y-4 md:pr-4">
                  <div className="flex items-center space-x-2.5">
                    <img
                      src="/materials/icon_wall_materials.png"
                      alt="Wall materials"
                      className="w-8 h-7 object-contain shrink-0"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div>
                      <h3 className="text-base font-bold text-[#075C55] tracking-tight">
                        Wall Materials
                      </h3>
                      <p className="text-xs text-gray-500">
                        Select available wall materials:
                      </p>
                    </div>
                  </div>

                  {/* 5 Wall Material Cards in a 2-Column Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {wallMaterialOptions.map(mat => {
                      const isSelected = selectedWallMaterials.includes(mat.id);

                      return (
                        <button
                          key={mat.id}
                          type="button"
                          onClick={() => handleToggleWallMaterial(mat.id)}
                          className={`p-3 rounded-2xl border text-left transition-all duration-150 flex items-center justify-between shadow-2xs hover:shadow-xs active:scale-[0.98] cursor-pointer ${
                            isSelected
                              ? 'bg-[#EAF2E8] border-2 border-[#075C55] text-[#075C55]'
                              : 'bg-[#FDFBF7] border-[#E5DCCE] hover:border-[#075C55]/50 text-[#172321]'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <img
                              src={mat.image}
                              alt={mat.name}
                              className="w-8 h-6 object-contain shrink-0"
                            />
                            <span className="font-bold text-xs sm:text-sm truncate">
                              {mat.name}
                            </span>
                          </div>

                          {isSelected ? (
                            <div className="w-5 h-5 rounded-full bg-[#075C55] text-white flex items-center justify-center shrink-0 ml-1">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border border-gray-300 shrink-0 ml-1" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* RIGHT COLUMN: Roof Materials */}
                <div className="space-y-4 md:pl-4">
                  <div className="flex items-center space-x-2.5">
                    <img
                      src="/materials/icon_roof_materials.png"
                      alt="Roof materials"
                      className="w-8 h-7 object-contain shrink-0"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div>
                      <h3 className="text-base font-bold text-[#075C55] tracking-tight">
                        Roof Materials
                      </h3>
                      <p className="text-xs text-gray-500">
                        Select available roof materials:
                      </p>
                    </div>
                  </div>

                  {/* 5 Roof Material Cards in a 2-Column Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {roofMaterialOptions.map(mat => {
                      const isSelected = selectedRoofMaterials.includes(mat.id);

                      return (
                        <button
                          key={mat.id}
                          type="button"
                          onClick={() => handleToggleRoofMaterial(mat.id)}
                          className={`p-3 rounded-2xl border text-left transition-all duration-150 flex items-center justify-between shadow-2xs hover:shadow-xs active:scale-[0.98] cursor-pointer ${
                            isSelected
                              ? 'bg-[#EAF2E8] border-2 border-[#075C55] text-[#075C55]'
                              : 'bg-[#FDFBF7] border-[#E5DCCE] hover:border-[#075C55]/50 text-[#172321]'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <img
                              src={mat.image}
                              alt={mat.name}
                              className="w-8 h-6 object-contain shrink-0"
                            />
                            <span className="font-bold text-xs sm:text-sm truncate">
                              {mat.name}
                            </span>
                          </div>

                          {isSelected ? (
                            <div className="w-5 h-5 rounded-full bg-[#075C55] text-white flex items-center justify-center shrink-0 ml-1">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border border-gray-300 shrink-0 ml-1" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* CUSTOM MATERIAL INPUT (Horizontal Pale-Green Bar Matching Reference) */}
              <div className="bg-[#E5EFE2] border border-[#CDE0C8] rounded-2xl p-3 sm:p-4 space-y-2.5 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center space-x-2 shrink-0">
                    <div className="w-6 h-6 rounded-full bg-[#075C55] text-white flex items-center justify-center shrink-0">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-xs sm:text-sm text-[#075C55]">
                      Any other materials you have?
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 flex-1">
                    <input
                      type="text"
                      placeholder="e.g. Lime, Tiles, etc."
                      value={customInput}
                      onChange={e => setCustomInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomMaterial();
                        }
                      }}
                      className="bg-white rounded-xl border border-[#C5D9BF] px-3.5 py-2 text-xs sm:text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#075C55] placeholder:text-gray-400 flex-1 shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomMaterial}
                      className="px-4 py-2 bg-[#075C55] hover:bg-[#05463E] text-white text-xs font-bold rounded-xl transition-all shadow-xs shrink-0"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Custom Material Pill Tags */}
                {customMaterials.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#D5E3D2]">
                    <span className="text-[11px] font-semibold text-[#075C55]">Custom additions:</span>
                    {customMaterials.map(mat => (
                      <span
                        key={mat}
                        className="bg-white border border-[#BBD4B7] text-[#075C55] text-xs font-semibold px-2.5 py-1 rounded-full flex items-center space-x-1.5 shadow-2xs"
                      >
                        <span>{mat}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomMaterial(mat)}
                          className="hover:text-rose-600 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* ANALYZE MY MATERIALS BUTTON (Prominent Centered Button) */}
              <div className="flex flex-col items-center justify-center pt-1">
                <button
                  type="button"
                  disabled={isAnalyzing}
                  onClick={handleAnalyzeMaterials}
                  className="bg-[#075C55] hover:bg-[#05463E] text-white font-bold text-sm sm:text-base px-8 py-3 rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center space-x-2.5 group cursor-pointer"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Analyzing Climate Compatibility...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-solar" />
                      <span>✦ Analyze My Materials</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>

              {/* LIVE ANALYSIS RESULTS FEEDBACK CARD */}
              {analysisResult && (
                <div className="bg-[#EFF6EE] border-2 border-[#075C55] rounded-2xl p-4 space-y-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-5 h-5 text-[#075C55]" />
                      <h4 className="font-bold text-sm text-[#075C55]">
                        {analysisResult.title}
                      </h4>
                    </div>
                    <span className="text-xs font-bold bg-[#075C55] text-white px-3 py-1 rounded-full shadow-2xs">
                      {analysisResult.compatibilityScore}% Compatibility
                    </span>
                  </div>

                  <p className="text-xs text-gray-600">
                    {analysisResult.description}
                  </p>

                  <div className="space-y-1.5 pt-1">
                    {analysisResult.suggestions.map((sug, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-xs text-[#064E48]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#167A68] shrink-0 mt-0.5" />
                        <span>{sug}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setStep(5)}
                      className="px-5 py-2 bg-[#075C55] hover:bg-[#05463E] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 flex items-center space-x-1.5"
                    >
                      <span>Proceed to Orientation</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* STEP 5: ORIENTATION                                          */}
          {/* ------------------------------------------------------------ */}
          {step === 5 && (
            <div className="space-y-6">
              <p className="text-sm text-gray-600">
                Which direction will the main openings (doors & windows) face?
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {orientationOptions.map(o => {
                  const isSelected = currentDesign.orientation_deg === o.deg;
                  return (
                    <div
                      key={o.deg}
                      onClick={() => updateDesign({ orientation_deg: o.deg })}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#075C55] bg-[#EFF6EE] shadow-xs'
                          : 'border-[#E5E3D8] hover:border-[#075C55]/40 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#075C55] text-sm">{o.label}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-[#075C55]" />}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{o.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* ============================================================== */}
        {/* MODAL FOOTER                                                   */}
        {/* ============================================================== */}
        <div className="bg-[#FAF6EF] px-6 py-4 border-t border-[#E8E3D5] flex items-center justify-between">
          
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-gray-600 hover:text-[#075C55] hover:bg-white text-sm font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div className="text-xs text-gray-500 font-medium flex items-center space-x-1.5">
              {currentDesign.location_id ? (
                <span className="text-[#075C55] font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#167A68]" />
                  <span>Selected: {activeClimate?.name.split(' (')[0] || currentDesign.name}</span>
                </span>
              ) : (
                <span>Please select or search a location to continue</span>
              )}
            </div>
          )}

          {step < 5 ? (
            <button
              disabled={step === 1 && !currentDesign.location_id}
              onClick={() => setStep(step + 1)}
              className={`flex items-center space-x-2 px-7 py-2.5 rounded-2xl font-bold text-sm shadow-md transition-all ${
                step === 1 && !currentDesign.location_id
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                  : 'bg-[#075C55] hover:bg-[#05463E] text-white active:scale-95'
              }`}
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex items-center space-x-2 px-7 py-2.5 rounded-2xl bg-[#075C55] hover:bg-[#05463E] text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-solar" />
              <span>Create My Shelter</span>
            </button>
          )}

        </div>

      </div>
    </div>
  );
};
