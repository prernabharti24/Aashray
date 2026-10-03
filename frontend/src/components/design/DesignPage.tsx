import React, { useState } from 'react';
import { useShelter } from '../../context/ShelterContext';
import { ShelterViewer3D } from './ShelterViewer3D';
import {
  Compass,
  MapPin,
  Layers,
  Maximize2,
  Sliders,
  ChevronDown,
  ChevronUp,
  Thermometer,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export const DesignPage: React.FC = () => {
  const {
    currentDesign,
    updateDesign,
    setActivePage,
    climates,
    materials
  } = useShelter();

  const [isAdvancedOpen, setIsAdvancedOpen] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<boolean>(false);

  const activeClimate = climates.find(c => c.id === currentDesign.location_id) || climates[0];
  const wallMat = materials.wall_materials.find(m => m.id === currentDesign.wall_material_id) || materials.wall_materials[0];
  const roofMat = materials.roof_materials.find(m => m.id === currentDesign.roof_material_id) || materials.roof_materials[0];

  const handleSave = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleSimulate = () => {
    setActivePage('simulation');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E2DFD2] pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-earth uppercase tracking-widest">
              Architectural Studio
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-xs text-forest font-semibold">Climate-Responsive Geometry</span>
          </div>
          <h1 className="text-3xl font-extrabold text-forest mt-0.5 font-sans">
            Design Your Shelter
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Configure local earth materials, geometric envelope, solar orientation, and openings.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-[#FAF9F5] text-forest font-bold text-xs border border-[#D5D3C5] shadow-2xs transition-all active:scale-95 flex items-center space-x-1.5"
          >
            <CheckCircle2 className="w-4 h-4 text-leaf" />
            <span>Save Design</span>
          </button>

          <button
            onClick={handleSimulate}
            className="px-6 py-2.5 rounded-xl bg-forest hover:bg-teal-dark text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center space-x-2"
          >
            <Thermometer className="w-4 h-4 text-solar" />
            <span>Simulate This Shelter</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {saveToast && (
        <div className="bg-mint border border-[#A5D6A7] text-forest px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-forest" />
          <span>Shelter configuration successfully saved to active workspace.</span>
        </div>
      )}

      {/* TWO-COLUMN LAYOUT (Responsive) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Parameters Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. LOCATION */}
          <div className="bg-white rounded-3xl p-6 border border-[#E2DFD2] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-forest" />
                <h2 className="text-base font-bold text-forest">LOCATION & MICROCLIMATE</h2>
              </div>
              <span className="text-xs text-earth font-bold">{activeClimate.design_day}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {climates.map(c => {
                const isSelected = currentDesign.location_id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => updateDesign({ location_id: c.id })}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-forest bg-mint/50 font-bold text-forest shadow-xs'
                        : 'border-[#E5E3D8] hover:border-forest/40 bg-[#FAF9F5] text-gray-700'
                    }`}
                  >
                    <span className="text-xs block font-bold">{c.name.split(' (')[0]}</span>
                    <span className="text-[10px] text-gray-500">{c.region.split(',')[0]}</span>
                  </button>
                );
              })}
            </div>

            <p className="text-xs text-gray-500 bg-[#FAF9F5] p-3 rounded-xl border border-[#EBE8DC]">
              <strong>Climate Context:</strong> {activeClimate.description}
            </p>
          </div>

          {/* 2. SHELTER SIZE */}
          <div className="bg-white rounded-3xl p-6 border border-[#E2DFD2] shadow-sm space-y-4">
            <div className="flex items-center space-x-2">
              <Maximize2 className="w-5 h-5 text-forest" />
              <h2 className="text-base font-bold text-forest">SHELTER SIZE & GEOMETRY</h2>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-forest uppercase mb-1">
                  Length (m)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="2"
                  max="20"
                  value={currentDesign.length_m}
                  onChange={e => updateDesign({ length_m: parseFloat(e.target.value) || 4.0 })}
                  className="w-full text-base font-bold text-forest bg-[#FAF9F5] border border-[#D5D3C5] rounded-xl px-3 py-2 text-center focus:ring-2 focus:ring-forest outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-forest uppercase mb-1">
                  Width (m)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="2"
                  max="20"
                  value={currentDesign.width_m}
                  onChange={e => updateDesign({ width_m: parseFloat(e.target.value) || 3.0 })}
                  className="w-full text-base font-bold text-forest bg-[#FAF9F5] border border-[#D5D3C5] rounded-xl px-3 py-2 text-center focus:ring-2 focus:ring-forest outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-forest uppercase mb-1">
                  Height (m)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="2"
                  max="6"
                  value={currentDesign.height_m}
                  onChange={e => updateDesign({ height_m: parseFloat(e.target.value) || 2.8 })}
                  className="w-full text-base font-bold text-forest bg-[#FAF9F5] border border-[#D5D3C5] rounded-xl px-3 py-2 text-center focus:ring-2 focus:ring-forest outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 bg-[#FAF9F5] px-3.5 py-2 rounded-xl border border-[#EBE8DC]">
              <span>Floor Area: <strong>{(currentDesign.length_m * currentDesign.width_m).toFixed(1)} m²</strong></span>
              <span>Gross Wall Area: <strong>{(2 * (currentDesign.length_m + currentDesign.width_m) * currentDesign.height_m).toFixed(1)} m²</strong></span>
            </div>
          </div>

          {/* 3. ORIENTATION (VISUAL COMPASS) */}
          <div className="bg-white rounded-3xl p-6 border border-[#E2DFD2] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Compass className="w-5 h-5 text-forest" />
                <h2 className="text-base font-bold text-forest">ORIENTATION (SOLAR AXIS)</h2>
              </div>
              <span className="text-xs font-bold text-forest bg-mint px-2.5 py-0.5 rounded-full">
                {currentDesign.orientation_deg}° ({currentDesign.orientation_deg === 180 ? 'South Facing' : currentDesign.orientation_deg === 90 ? 'East Facing' : currentDesign.orientation_deg === 0 ? 'North Facing' : 'West Facing'})
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { deg: 0, label: 'North' },
                { deg: 90, label: 'East' },
                { deg: 180, label: 'South (Recommended)' },
                { deg: 270, label: 'West' }
              ].map(dir => (
                <button
                  key={dir.deg}
                  onClick={() => updateDesign({ orientation_deg: dir.deg })}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                    currentDesign.orientation_deg === dir.deg
                      ? 'border-forest bg-forest text-white shadow-xs'
                      : 'border-[#E5E3D8] hover:border-forest/40 bg-[#FAF9F5] text-gray-700'
                  }`}
                >
                  {dir.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. MATERIALS */}
          <div className="bg-white rounded-3xl p-6 border border-[#E2DFD2] shadow-sm space-y-5">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-forest" />
              <h2 className="text-base font-bold text-forest">ENVELOPE MATERIALS</h2>
            </div>

            {/* Wall Material */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-forest uppercase">
                  Wall Construction
                </label>
                {wallMat.is_local_earth && (
                  <span className="text-[10px] font-bold text-earth bg-solar/40 px-2 py-0.5 rounded-full">
                    🌱 Local High Thermal Mass
                  </span>
                )}
              </div>
              <select
                value={currentDesign.wall_material_id}
                onChange={e => updateDesign({ wall_material_id: e.target.value })}
                className="w-full bg-[#FAF9F5] border border-[#D5D3C5] rounded-xl px-3.5 py-2.5 text-xs font-bold text-forest focus:ring-2 focus:ring-forest outline-none"
              >
                {materials.wall_materials.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.is_local_earth ? '🌱 ' : ''}{w.name}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-gray-500 mt-1">{wallMat.description}</p>
            </div>

            {/* Roof Material */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-forest uppercase">
                  Roof Deck
                </label>
                {roofMat.is_local_earth && (
                  <span className="text-[10px] font-bold text-earth bg-solar/40 px-2 py-0.5 rounded-full">
                    🌱 Local Bio-Structure
                  </span>
                )}
              </div>
              <select
                value={currentDesign.roof_material_id}
                onChange={e => updateDesign({ roof_material_id: e.target.value })}
                className="w-full bg-[#FAF9F5] border border-[#D5D3C5] rounded-xl px-3.5 py-2.5 text-xs font-bold text-forest focus:ring-2 focus:ring-forest outline-none"
              >
                {materials.roof_materials.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.is_local_earth ? '🌱 ' : ''}{r.name}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-gray-500 mt-1">{roofMat.description}</p>
            </div>

            {/* Insulation */}
            <div>
              <label className="block text-xs font-bold text-forest uppercase mb-1.5">
                Thermal Insulation Layer
              </label>
              <select
                value={currentDesign.insulation_id}
                onChange={e => updateDesign({ insulation_id: e.target.value })}
                className="w-full bg-[#FAF9F5] border border-[#D5D3C5] rounded-xl px-3.5 py-2.5 text-xs font-bold text-forest focus:ring-2 focus:ring-forest outline-none"
              >
                {materials.insulation_materials.map(i => (
                  <option key={i.id} value={i.id}>
                    {i.id === 'straw_woodwool' ? '🌾 ' : ''}{i.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 5. OPENINGS (WINDOWS) */}
          <div className="bg-white rounded-3xl p-6 border border-[#E2DFD2] shadow-sm space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-xl">🪟</span>
              <h2 className="text-base font-bold text-forest">OPENINGS & GLAZING</h2>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-forest uppercase mb-1">
                  Windows Count
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={currentDesign.window_count}
                  onChange={e => updateDesign({ window_count: parseInt(e.target.value) || 0 })}
                  className="w-full text-base font-bold text-forest bg-[#FAF9F5] border border-[#D5D3C5] rounded-xl px-3 py-2 text-center focus:ring-2 focus:ring-forest outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-forest uppercase mb-1">
                  Width (m)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.4"
                  max="3.0"
                  value={currentDesign.window_width_m}
                  onChange={e => updateDesign({ window_width_m: parseFloat(e.target.value) || 1.2 })}
                  className="w-full text-base font-bold text-forest bg-[#FAF9F5] border border-[#D5D3C5] rounded-xl px-3 py-2 text-center focus:ring-2 focus:ring-forest outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-forest uppercase mb-1">
                  Height (m)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.4"
                  max="2.5"
                  value={currentDesign.window_height_m}
                  onChange={e => updateDesign({ window_height_m: parseFloat(e.target.value) || 1.0 })}
                  className="w-full text-base font-bold text-forest bg-[#FAF9F5] border border-[#D5D3C5] rounded-xl px-3 py-2 text-center focus:ring-2 focus:ring-forest outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-forest uppercase mb-1.5">
                Glass Specification
              </label>
              <select
                value={currentDesign.glazing_id}
                onChange={e => updateDesign({ glazing_id: e.target.value })}
                className="w-full bg-[#FAF9F5] border border-[#D5D3C5] rounded-xl px-3.5 py-2.5 text-xs font-bold text-forest focus:ring-2 focus:ring-forest outline-none"
              >
                {materials.glazing_types.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.name} (U={g.u_value} W/m²K)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 6. ADVANCED ENGINEERING SETTINGS (COLLAPSED BY DEFAULT) */}
          <div className="bg-white rounded-3xl border border-[#E2DFD2] shadow-sm overflow-hidden">
            <button
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-[#FAF9F5] transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-forest" />
                <span className="text-xs font-bold text-forest uppercase tracking-wider">
                  Advanced Engineering Settings (Optional)
                </span>
              </div>
              {isAdvancedOpen ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {isAdvancedOpen && (
              <div className="p-6 pt-2 border-t border-[#E8E6DB] bg-[#FAF9F5] space-y-4">
                <p className="text-xs text-gray-500">
                  Physics boundary conditions and numerical solver parameters for transient heat transfer:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-forest mb-1">
                      Infiltration Rate (ACH)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.2"
                      max="5.0"
                      value={currentDesign.advanced_settings.infiltration_rate_ach}
                      onChange={e => updateDesign({
                        advanced_settings: {
                          ...currentDesign.advanced_settings,
                          infiltration_rate_ach: parseFloat(e.target.value) || 1.0
                        }
                      })}
                      className="w-full bg-white border border-[#D5D3C5] rounded-xl px-3 py-2 font-semibold"
                    />
                    <span className="text-[10px] text-gray-400">Air changes per hour (Default: 1.0)</span>
                  </div>

                  <div>
                    <label className="block font-bold text-forest mb-1">
                      Internal Convection (W/m²K)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={currentDesign.advanced_settings.internal_convection_coeff}
                      onChange={e => updateDesign({
                        advanced_settings: {
                          ...currentDesign.advanced_settings,
                          internal_convection_coeff: parseFloat(e.target.value) || 8.0
                        }
                      })}
                      className="w-full bg-white border border-[#D5D3C5] rounded-xl px-3 py-2 font-semibold"
                    />
                    <span className="text-[10px] text-gray-400">Surface coefficient hin (Default: 8.0)</span>
                  </div>

                  <div>
                    <label className="block font-bold text-forest mb-1">
                      External Convection (W/m²K)
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={currentDesign.advanced_settings.external_convection_coeff}
                      onChange={e => updateDesign({
                        advanced_settings: {
                          ...currentDesign.advanced_settings,
                          external_convection_coeff: parseFloat(e.target.value) || 22.0
                        }
                      })}
                      className="w-full bg-white border border-[#D5D3C5] rounded-xl px-3 py-2 font-semibold"
                    />
                    <span className="text-[10px] text-gray-400">Wind coefficient hout (Default: 22.0)</span>
                  </div>

                  <div>
                    <label className="block font-bold text-forest mb-1">
                      Internal Heat Gain (Watts)
                    </label>
                    <input
                      type="number"
                      step="10"
                      value={currentDesign.advanced_settings.internal_heat_gain_w}
                      onChange={e => updateDesign({
                        advanced_settings: {
                          ...currentDesign.advanced_settings,
                          internal_heat_gain_w: parseFloat(e.target.value) || 150.0
                        }
                      })}
                      className="w-full bg-white border border-[#D5D3C5] rounded-xl px-3 py-2 font-semibold"
                    />
                    <span className="text-[10px] text-gray-400">Occupants + equipment (Default: 150W)</span>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: 3D Visualization & Geometry Spec (5 cols sticky) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          
          {/* 3D Conceptual Shelter Viewer */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-forest uppercase tracking-wider">
                3D Architectural Conceptual Model
              </span>
              <span className="text-[11px] text-earth font-bold">Interactive Orbit</span>
            </div>
            
            <ShelterViewer3D />
          </div>

          {/* Quick Property Summary Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#E2DFD2] shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-forest uppercase tracking-wider">
              Calculated Physical Metrics
            </h3>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#F0EFE6]">
                <span className="text-gray-500">Wall Transmittance (U-Value):</span>
                <span className="font-bold text-forest">{wallMat.u_value_w_m2k || '2.2'} W/m²K</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F0EFE6]">
                <span className="text-gray-500">Roof Transmittance (U-Value):</span>
                <span className="font-bold text-forest">{roofMat.u_value_w_m2k || '3.4'} W/m²K</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F0EFE6]">
                <span className="text-gray-500">Thermal Mass Rating:</span>
                <span className="font-bold text-earth">{wallMat.thermal_mass_rating || 'Moderate'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Solar Orientation:</span>
                <span className="font-bold text-forest">{currentDesign.orientation_deg}° ({currentDesign.orientation_deg === 180 ? 'South' : 'Custom'})</span>
              </div>
            </div>

            <div className="pt-3">
              <button
                onClick={handleSimulate}
                className="w-full py-3.5 rounded-2xl bg-forest hover:bg-teal-dark text-white font-bold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center space-x-2"
              >
                <Thermometer className="w-4 h-4 text-solar" />
                <span>Simulate This Shelter</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
