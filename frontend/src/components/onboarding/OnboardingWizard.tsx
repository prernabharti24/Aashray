import React, { useState } from 'react';
import { useShelter } from '../../context/ShelterContext';
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles
} from 'lucide-react';

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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-[#E0DED3] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
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

          {/* STEP 3: Size */}
          {step === 3 && (
            <div className="space-y-6">
              <p className="text-sm text-gray-600">
                Specify the primary external architectural dimensions in meters:
              </p>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#E5E3D8]">
                  <label className="block text-xs font-bold text-forest uppercase tracking-wider mb-1">
                    Length (m)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="2"
                    max="20"
                    value={currentDesign.length_m}
                    onChange={e => updateDesign({ length_m: parseFloat(e.target.value) || 4.0 })}
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
                    step="0.5"
                    min="2"
                    max="20"
                    value={currentDesign.width_m}
                    onChange={e => updateDesign({ width_m: parseFloat(e.target.value) || 3.0 })}
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
                    min="2"
                    max="6"
                    value={currentDesign.height_m}
                    onChange={e => updateDesign({ height_m: parseFloat(e.target.value) || 2.8 })}
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
