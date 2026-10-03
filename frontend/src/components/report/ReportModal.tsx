import React from 'react';
import { useShelter } from '../../context/ShelterContext';
import { X, Printer, FileText } from 'lucide-react';

export const ReportModal: React.FC = () => {
  const {
    isReportOpen,
    setIsReportOpen,
    currentDesign,
    simulationResult,
    climates,
    materials
  } = useShelter();

  if (!isReportOpen || !simulationResult) return null;

  const activeClimate = climates.find(c => c.id === currentDesign.location_id) || climates[0];
  const wallMat = materials.wall_materials.find(m => m.id === currentDesign.wall_material_id) || materials.wall_materials[0];
  const roofMat = materials.roof_materials.find(m => m.id === currentDesign.roof_material_id) || materials.roof_materials[0];
  const insulMat = materials.insulation_materials.find(m => m.id === currentDesign.insulation_id) || materials.insulation_materials[0];
  const glazing = materials.glazing_types.find(g => g.id === currentDesign.glazing_id) || materials.glazing_types[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-[#E0DED3] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Control Bar (Hidden on print) */}
        <div className="no-print bg-forest px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-solar" />
            <span className="font-bold text-sm font-sans">AASHRAY Architectural Thermal Dossier</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-white text-forest hover:bg-mint font-bold text-xs shadow-xs flex items-center space-x-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={() => setIsReportOpen(false)}
              className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Dossier Content */}
        <div className="p-8 sm:p-12 max-h-[80vh] overflow-y-auto space-y-8 print-page">
          
          {/* Header of Dossier */}
          <div className="border-b-2 border-forest pb-6 flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-black text-forest font-sans">AASHRAY</span>
                <span className="text-xs font-bold text-earth uppercase tracking-widest">• Mitti Se Mausam Tak</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Software Based Model Development for Design of Area Specific Shelter for Thermal Comfort Maintenance
              </p>
              <h1 className="text-xl font-bold text-forest mt-3">
                Architectural Thermal Performance & Comfort Dossier
              </h1>
            </div>

            <div className="text-right text-xs text-gray-500">
              <span className="font-bold text-forest block">SIH26051 • DRDO</span>
              <span>Generated: {new Date().toLocaleDateString()}</span>
            </div>
          </div>

          {/* Section 1: Project & Microclimate */}
          <div className="grid grid-cols-2 gap-6 text-xs">
            <div className="bg-[#FAF9F5] p-4 rounded-xl border border-[#E5E3D8] space-y-2">
              <h3 className="font-bold text-forest uppercase tracking-wider text-[11px] border-b pb-1">
                1. Shelter Specification
              </h3>
              <p><strong>Project Name:</strong> {currentDesign.name}</p>
              <p><strong>Typology:</strong> {currentDesign.shelter_type}</p>
              <p><strong>Dimensions:</strong> {currentDesign.length_m}m (L) × {currentDesign.width_m}m (W) × {currentDesign.height_m}m (H)</p>
              <p><strong>Floor Area / Volume:</strong> {(currentDesign.length_m * currentDesign.width_m).toFixed(1)} m² / {(currentDesign.length_m * currentDesign.width_m * currentDesign.height_m).toFixed(1)} m³</p>
              <p><strong>Orientation:</strong> {currentDesign.orientation_deg}° ({currentDesign.orientation_deg === 180 ? 'South' : 'Custom'})</p>
            </div>

            <div className="bg-[#FAF9F5] p-4 rounded-xl border border-[#E5E3D8] space-y-2">
              <h3 className="font-bold text-forest uppercase tracking-wider text-[11px] border-b pb-1">
                2. Microclimate Environment
              </h3>
              <p><strong>Location:</strong> {activeClimate.name}</p>
              <p><strong>Region / Altitude:</strong> {activeClimate.region} ({activeClimate.altitude_m}m)</p>
              <p><strong>Design Peak:</strong> {activeClimate.design_day}</p>
              <p><strong>Diurnal Ambient Range:</strong> {Math.min(...activeClimate.hourly_outdoor_temp)}°C to {Math.max(...activeClimate.hourly_outdoor_temp)}°C</p>
              <p><strong>Peak Solar Irradiance:</strong> {Math.max(...activeClimate.hourly_solar_irradiance)} W/m²</p>
            </div>
          </div>

          {/* Section 2: Materials & Assembly */}
          <div className="space-y-3 text-xs">
            <h3 className="font-bold text-forest uppercase tracking-wider text-[11px] border-b pb-1">
              3. Envelope Construction Assemblies
            </h3>
            <table className="w-full text-left border-collapse border border-[#E0DED3]">
              <thead>
                <tr className="bg-[#FAF9F5] text-forest font-bold">
                  <th className="p-2 border border-[#E0DED3]">Component</th>
                  <th className="p-2 border border-[#E0DED3]">Specified Material</th>
                  <th className="p-2 border border-[#E0DED3]">Transmittance (U)</th>
                  <th className="p-2 border border-[#E0DED3]">Thermal Mass / Property</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border border-[#E0DED3] font-bold">Exterior Walls</td>
                  <td className="p-2 border border-[#E0DED3]">{wallMat.name}</td>
                  <td className="p-2 border border-[#E0DED3]">{wallMat.u_value_w_m2k || '2.2'} W/m²K</td>
                  <td className="p-2 border border-[#E0DED3]">{wallMat.thermal_mass_rating || 'Moderate'}</td>
                </tr>
                <tr>
                  <td className="p-2 border border-[#E0DED3] font-bold">Roof Deck</td>
                  <td className="p-2 border border-[#E0DED3]">{roofMat.name}</td>
                  <td className="p-2 border border-[#E0DED3]">{roofMat.u_value_w_m2k || '3.4'} W/m²K</td>
                  <td className="p-2 border border-[#E0DED3]">Overhead Radiation Surface</td>
                </tr>
                <tr>
                  <td className="p-2 border border-[#E0DED3] font-bold">Thermal Insulation</td>
                  <td className="p-2 border border-[#E0DED3]">{insulMat.name}</td>
                  <td className="p-2 border border-[#E0DED3]">Factor: {insulMat.u_reduction_factor || 1.0}</td>
                  <td className="p-2 border border-[#E0DED3]">{insulMat.is_local_earth ? 'Bio-Based Straw' : 'Synthetic / None'}</td>
                </tr>
                <tr>
                  <td className="p-2 border border-[#E0DED3] font-bold">Fenestration</td>
                  <td className="p-2 border border-[#E0DED3]">{currentDesign.window_count} Windows ({glazing.name})</td>
                  <td className="p-2 border border-[#E0DED3]">{glazing.u_value} W/m²K</td>
                  <td className="p-2 border border-[#E0DED3]">SHGC: {glazing.shgc}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 3: 24h Thermal Performance KPIs */}
          <div className="space-y-3 text-xs">
            <h3 className="font-bold text-forest uppercase tracking-wider text-[11px] border-b pb-1">
              4. 24-Hour Transient Thermal Performance Indicators
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-[#FAF9F5] p-3 rounded-xl border border-[#E5E3D8]">
                <span className="text-gray-400 block text-[10px]">Mean Indoor Temp</span>
                <span className="text-xl font-bold text-forest">{simulationResult.mean_indoor_temp}°C</span>
              </div>
              <div className="bg-[#FAF9F5] p-3 rounded-xl border border-[#E5E3D8]">
                <span className="text-gray-400 block text-[10px]">Critical 2 AM Night Temp</span>
                <span className="text-xl font-bold text-forest">{simulationResult.temp_at_2am}°C</span>
              </div>
              <div className="bg-[#FAF9F5] p-3 rounded-xl border border-[#E5E3D8]">
                <span className="text-gray-400 block text-[10px]">Peak Heat Loss</span>
                <span className="text-xl font-bold text-earth">{simulationResult.peak_heat_loss_kw} kW</span>
              </div>
              <div className="bg-[#FAF9F5] p-3 rounded-xl border border-[#E5E3D8]">
                <span className="text-gray-400 block text-[10px]">Solar Heat Gain</span>
                <span className="text-xl font-bold text-forest">{simulationResult.total_solar_gain_kwh} kWh</span>
              </div>
            </div>
          </div>

          {/* Section 4: Heat Loss Breakdown & Verdict */}
          <div className="bg-[#FAF9F5] p-4 rounded-xl border border-[#E5E3D8] space-y-2 text-xs">
            <h3 className="font-bold text-forest uppercase tracking-wider text-[11px]">
              5. Heat Loss Pathway Breakdown & Comfort Verdict
            </h3>
            <p><strong>Primary Loss Channel:</strong> {simulationResult.heat_loss_breakdown.dominant_path}</p>
            <p><strong>Breakdown:</strong> Roof ({simulationResult.heat_loss_breakdown.roof_percent}%), Walls ({simulationResult.heat_loss_breakdown.walls_percent}%), Windows ({simulationResult.heat_loss_breakdown.windows_percent}%), Ventilation/Infiltration ({simulationResult.heat_loss_breakdown.ventilation_percent}%), Ground ({simulationResult.heat_loss_breakdown.ground_percent}%)</p>
            <p><strong>Comfort Verdict:</strong> {simulationResult.comfort_verdict}</p>
          </div>

          {/* Section 5: Engineering Assumptions & Limitations */}
          <div className="border-t border-[#E8E6DB] pt-4 space-y-2 text-[11px] text-gray-500">
            <h4 className="font-bold text-forest uppercase tracking-wider">
              6. Model Assumptions & Limitations (DRDO SIH26051)
            </h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Calculations performed using AASHRAY 1D Reduced-Order Transient Thermal Solver (sol-air surface boundary conditions, multi-layer thermal resistance, and dynamic inner-layer thermal mass capacitance).</li>
              <li>Results reflect unheated passive thermal response under typical peak design days.</li>
              <li>ANSYS Finite Element / CFD bridge connector architecture is enabled for future high-resolution meshed validation.</li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
};
