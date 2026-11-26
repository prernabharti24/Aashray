import React, { useState, useRef } from 'react';
import { useShelter } from '../../context/ShelterContext';
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  Upload,
  FileText,
  Trash2,
  RefreshCw,
  AlertCircle,
  Loader2,
  Ruler,
  Check
} from 'lucide-react';
import { analyzeFloorPlanApi, saveFloorPlanMeasurementsApi } from '../../services/api';
import type { FloorPlanAnalysisResponse } from '../../types';

export const OnboardingWizard: React.FC = () => {
  const {
    isOnboardingOpen,
    setIsOnboardingOpen,
    currentDesign,
    updateDesign,
    setActivePage,
    climates,
    materials
  } = useShelter();

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

  if (!isOnboardingOpen) return null;

  const shelterTypes = [
    { id: 'Community Shelter', name: 'Community Shelter', icon: '🏛️', desc: 'Public or defensive gathering hall with moderate occupancy' },
    { id: 'Worker Shelter', name: 'Worker / Army Barrack', icon: '⛺', desc: 'Durable modular accommodation for border or field workforce' },
    { id: 'Bus Shelter', name: 'Transit / Bus Shelter', icon: '🚏', desc: 'Semi-open passenger waiting enclosure with wind protection' },
    { id: 'Residential Shelter', name: 'High-Altitude Residence', icon: '🏡', desc: 'Insulated living unit with continuous heating priority' },
    { id: 'Custom Shelter', name: 'Custom Architecture', icon: '📐', desc: 'Flexible modular geometric enclosure' },
  ];

  const orientationOptions = [
    { deg: 180, label: 'South (180°)', desc: 'Optimal for cold climates (Maximum Winter Solar Trap)', badge: 'Recommended for Ladakh' },
    { deg: 90, label: 'East (90°)', desc: 'Morning sun capture, quick warming after cold nights', badge: 'Morning Sunlight' },
    { deg: 270, label: 'West (270°)', desc: 'Late afternoon solar gain (caution in hot climates)', badge: 'Evening Heat' },
    { deg: 0, label: 'North (0°)', desc: 'Minimal direct solar gain, shaded diffuse light', badge: 'Cooler Facade' },
  ];

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
        
        {/* Modal Top Bar */}
        <div className="bg-forest px-6 py-5 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase font-bold tracking-widest text-solar">Step {step} of 5</span>
              <span className="text-white/40">•</span>
              <span className="text-xs text-white/80 font-medium">Fast Shelter Onboarding</span>
            </div>
            <h2 className="text-xl font-bold font-sans mt-0.5">
              {step === 1 && "Where is your shelter located?"}
              {step === 2 && "What are you designing?"}
              {step === 3 && "How big is the shelter?"}
              {step === 4 && "What is it made of?"}
              {step === 5 && "How is it oriented?"}
            </h2>
          </div>
          <button
            onClick={() => setIsOnboardingOpen(false)}
            className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#E5E3D8] h-1.5">
          <div
            className="bg-leaf h-1.5 transition-all duration-300 ease-out"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 max-h-[70vh] overflow-y-auto">
          
          {/* STEP 1: Location */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Choose the microclimate location. AASHRAY will automatically load local solar radiation, wind speed, and extreme temperature curves.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {climates.map(c => {
                  const isSelected = currentDesign.location_id === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => updateDesign({ location_id: c.id, name: `${c.name.split(' ')[0]} Shelter` })}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-150 flex flex-col justify-between ${
                        isSelected
                          ? 'border-forest bg-mint/40 shadow-xs'
                          : 'border-[#E5E3D8] hover:border-forest/40 bg-[#FAF9F5]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-forest text-base">{c.name.split(' (')[0]}</span>
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-forest shrink-0" />}
                        </div>
                        <span className="text-xs text-earth font-medium block mb-2">{c.region}</span>
                        <p className="text-xs text-gray-500 line-clamp-2">{c.description}</p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-[#EFECE0] text-[11px] font-semibold text-gray-600 flex justify-between">
                        <span>Altitude: {c.altitude_m}m</span>
                        <span className="text-forest">Tmin: {Math.min(...c.hourly_outdoor_temp)}°C</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Shelter Type */}
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
                          ? 'border-forest bg-mint/40 shadow-xs'
                          : 'border-[#E5E3D8] hover:border-forest/40 bg-[#FAF9F5]'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{t.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-forest text-sm">{t.name}</span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-forest" />}
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

          {/* STEP 4: Materials */}
          {step === 4 && (
            <div className="space-y-5">
              <p className="text-sm text-gray-600">
                Pick your initial construction materials. (Local earth materials with high thermal mass are marked with a leaf):
              </p>

              <div>
                <label className="block text-xs font-bold text-forest uppercase tracking-wider mb-2">
                  Wall Material
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {materials.wall_materials.slice(0, 4).map(w => {
                    const isSelected = currentDesign.wall_material_id === w.id;
                    return (
                      <div
                        key={w.id}
                        onClick={() => updateDesign({ wall_material_id: w.id })}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-colors flex items-center justify-between ${
                          isSelected
                            ? 'border-forest bg-mint/50 font-semibold text-forest'
                            : 'border-[#E0DED3] hover:border-forest/40 bg-[#FAF9F5]'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          {w.is_local_earth && <span className="text-leaf">🌱</span>}
                          <span>{w.name.split(' (')[0]}</span>
                        </div>
                        {w.is_local_earth && (
                          <span className="text-[10px] bg-white px-2 py-0.5 rounded-full text-earth font-bold border border-[#E0DED3]">
                            Local Earth
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-forest uppercase tracking-wider mb-2">
                  Roof Material
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {materials.roof_materials.map(r => {
                    const isSelected = currentDesign.roof_material_id === r.id;
                    return (
                      <div
                        key={r.id}
                        onClick={() => updateDesign({ roof_material_id: r.id })}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-colors flex items-center justify-between ${
                          isSelected
                            ? 'border-forest bg-mint/50 font-semibold text-forest'
                            : 'border-[#E0DED3] hover:border-forest/40 bg-[#FAF9F5]'
                        }`}
                      >
                        <span>{r.name.split(' (')[0]}</span>
                        {r.is_local_earth && <span className="text-leaf text-xs">🌱 Local</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-forest uppercase tracking-wider mb-2">
                  Thermal Insulation
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {materials.insulation_materials.map(i => {
                    const isSelected = currentDesign.insulation_id === i.id;
                    return (
                      <div
                        key={i.id}
                        onClick={() => updateDesign({ insulation_id: i.id })}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-colors flex items-center justify-between ${
                          isSelected
                            ? 'border-forest bg-mint/50 font-semibold text-forest'
                            : 'border-[#E0DED3] hover:border-forest/40 bg-[#FAF9F5]'
                        }`}
                      >
                        <span>{i.name.split(' (')[0]}</span>
                        {i.id === 'straw_woodwool' && <span className="text-earth text-[10px] font-bold">🌾 Bio-Straw</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Orientation */}
          {step === 5 && (
            <div className="space-y-5">
              <p className="text-sm text-gray-600">
                Choose the facing orientation of the primary facade and windows to align with solar trajectory:
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
                          ? 'border-forest bg-mint/50 shadow-xs'
                          : 'border-[#E5E3D8] hover:border-forest/40 bg-[#FAF9F5]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-forest text-sm">{o.label}</span>
                        <span className="text-[10px] bg-white px-2 py-0.5 rounded-full text-forest font-semibold border border-[#D5D3C5]">
                          {o.badge}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{o.desc}</p>
                    </div>
                  );
                })}
              </div>

              {/* Compass visualizer helper */}
              <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#E5E3D8] flex items-center justify-center space-x-6">
                <div className="relative w-24 h-24 rounded-full border-2 border-dashed border-[#B8B6A8] flex items-center justify-center">
                  <span className="absolute top-1 text-[10px] font-bold text-gray-400">N</span>
                  <span className="absolute bottom-1 text-[10px] font-bold text-forest">S</span>
                  <span className="absolute right-1 text-[10px] font-bold text-gray-400">E</span>
                  <span className="absolute left-1 text-[10px] font-bold text-gray-400">W</span>
                  
                  {/* Arrow indicator */}
                  <div
                    className="w-1 h-14 bg-linear-to-b from-transparent via-forest to-earth rounded-full origin-center transition-transform duration-300"
                    style={{ transform: `rotate(${currentDesign.orientation_deg}deg)` }}
                  />
                  <div className="absolute w-3 h-3 bg-solar rounded-full border-2 border-forest shadow-xs" />
                </div>
                <div className="text-xs text-gray-600">
                  <p className="font-bold text-forest text-sm">Facing {currentDesign.orientation_deg}°</p>
                  <p className="text-gray-500 mt-0.5">South orientation captures maximum low-angle winter sunlight.</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Actions Footer */}
        <div className="bg-[#FAF9F5] px-6 py-4 border-t border-[#E5E3D8] flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-gray-600 hover:text-forest hover:bg-white text-sm font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : <div />}

          {step < 5 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-forest hover:bg-teal-dark text-white font-semibold text-sm shadow-md transition-all active:scale-95"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex items-center space-x-2 px-7 py-2.5 rounded-xl bg-forest hover:bg-teal-dark text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all active:scale-95 bg-linear-to-r from-forest to-teal-dark"
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
