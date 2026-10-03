import React from 'react';
import { useShelter } from '../../context/ShelterContext';
import {
  X,
  Sparkles,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export const ComparisonModal: React.FC = () => {
  const {
    isComparisonOpen,
    setIsComparisonOpen,
    comparisonResult,
    applyRecommendedDesign,
    materials
  } = useShelter();

  if (!isComparisonOpen || !comparisonResult) return null;

  const { current_design, recommended_design, current_result, recommended_result, metrics, architectural_reasoning } = comparisonResult;

  const getWallName = (id: string) => materials.wall_materials.find(m => m.id === id)?.name || id;
  const getRoofName = (id: string) => materials.roof_materials.find(m => m.id === id)?.name || id;
  const getInsulName = (id: string) => materials.insulation_materials.find(m => m.id === id)?.name || id;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-[#E0DED3] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-forest px-6 py-5 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase font-bold tracking-widest text-solar">Architectural Optimization</span>
              <span className="text-white/40">•</span>
              <span className="text-xs text-white/80 font-medium">Calculated Physics Comparison</span>
            </div>
            <h2 className="text-2xl font-bold font-sans mt-0.5">
              Can we improve this shelter?
            </h2>
          </div>
          <button
            onClick={() => setIsComparisonOpen(false)}
            className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto space-y-8">
          
          {/* SIDE-BY-SIDE DESIGN SPECIFICATIONS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* CURRENT DESIGN */}
            <div className="bg-[#FAF9F5] p-5 rounded-2xl border border-[#E2DFD2] space-y-3">
              <div className="flex items-center justify-between border-b border-[#E8E6DB] pb-2">
                <span className="text-xs uppercase font-bold text-gray-500 tracking-wider">Baseline Model</span>
                <span className="text-xs font-bold text-forest bg-white px-2.5 py-0.5 rounded-full border border-[#D5D3C5]">Current</span>
              </div>
              
              <h3 className="font-bold text-forest text-base">
                {current_design.name}
              </h3>

              <div className="space-y-1.5 text-xs text-gray-700">
                <p><strong>Wall:</strong> {getWallName(current_design.wall_material_id)}</p>
                <p><strong>Roof:</strong> {getRoofName(current_design.roof_material_id)}</p>
                <p><strong>Insulation:</strong> {getInsulName(current_design.insulation_id)}</p>
                <p><strong>Orientation:</strong> {current_design.orientation_deg}°</p>
              </div>

              <div className="mt-3 pt-3 border-t border-[#E8E6DB] bg-white p-3 rounded-xl flex items-center justify-between text-xs">
                <span className="text-gray-500">2 AM Night Temp:</span>
                <span className="font-extrabold text-forest text-base">{current_result.temp_at_2am}°C</span>
              </div>
            </div>

            {/* RECOMMENDED DESIGN */}
            <div className="bg-mint/40 p-5 rounded-2xl border-2 border-[#A5D6A7] space-y-3 relative shadow-xs">
              <div className="flex items-center justify-between border-b border-[#C8E6C9] pb-2">
                <span className="text-xs uppercase font-bold text-forest tracking-wider">AASHRAY Optimized</span>
                <span className="text-xs font-bold text-white bg-forest px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-solar" />
                  <span>Recommended</span>
                </span>
              </div>
              
              <h3 className="font-bold text-forest text-base">
                {recommended_design.name}
              </h3>

              <div className="space-y-1.5 text-xs text-forest">
                <p><strong>Wall:</strong> 🌱 {getWallName(recommended_design.wall_material_id)}</p>
                <p><strong>Roof:</strong> 🌱 {getRoofName(recommended_design.roof_material_id)}</p>
                <p><strong>Insulation:</strong> 🌾 {getInsulName(recommended_design.insulation_id)}</p>
                <p><strong>Orientation:</strong> {recommended_design.orientation_deg}° (Solar Axis)</p>
              </div>

              <div className="mt-3 pt-3 border-t border-[#C8E6C9] bg-white p-3 rounded-xl flex items-center justify-between text-xs">
                <span className="text-forest font-semibold">2 AM Night Temp:</span>
                <span className="font-extrabold text-leaf text-base">{recommended_result.temp_at_2am}°C</span>
              </div>
            </div>

          </div>

          {/* CALCULATED PERFORMANCE METRIC DELTAS */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-forest uppercase tracking-wider">
              Exact Calculated Thermal Improvements
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {metrics.map((m, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white border border-[#E2DFD2] shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-500 font-bold block">{m.metric}</span>
                    <div className="flex items-baseline space-x-2 mt-0.5">
                      <span className="text-gray-400 line-through text-xs">{m.current_value} {m.unit}</span>
                      <span className="text-forest font-extrabold text-lg">→ {m.recommended_value} {m.unit}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 block mt-0.5">{m.explanation}</span>
                  </div>

                  <div className={`px-3 py-1.5 rounded-xl font-extrabold text-xs flex items-center space-x-1 ${
                    m.is_better ? 'bg-mint text-forest' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {m.difference > 0 ? '+' : ''}{m.difference} {m.unit}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* "WHY THIS DESIGN?" ARCHITECTURAL PHYSICS EXPLANATIONS */}
          <div className="bg-[#FAF9F5] p-5 rounded-2xl border border-[#E5E3D8] space-y-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-earth" />
              <h4 className="text-xs font-bold text-forest uppercase tracking-wider">
                Why this design works (Architectural Physics Rationale)
              </h4>
            </div>

            <div className="space-y-2">
              {architectural_reasoning.map((reason, i) => (
                <div key={i} className="flex items-start space-x-2.5 text-xs text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-leaf shrink-0 mt-0.5" />
                  <span className="font-medium">{reason}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Actions */}
        <div className="bg-[#FAF9F5] px-6 py-4 border-t border-[#E5E3D8] flex items-center justify-between">
          <button
            onClick={() => setIsComparisonOpen(false)}
            className="px-4 py-2 rounded-xl text-gray-600 hover:text-forest text-xs font-bold"
          >
            Close Comparison
          </button>

          <button
            onClick={() => applyRecommendedDesign(recommended_design)}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-forest hover:bg-teal-dark text-white font-bold text-xs shadow-md transition-all active:scale-95 bg-linear-to-r from-forest to-teal-dark"
          >
            <Sparkles className="w-4 h-4 text-solar" />
            <span>Apply Recommended Design to Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
