import React, { useState, useEffect } from 'react';
import { useShelter } from '../../context/ShelterContext';
import { fetchTemperatureGraphApi } from '../../services/api';
import {
  Thermometer,
  Moon,
  Snowflake,
  Sparkles,
  ArrowRight,
  FileText,
  Info,
  Sun
} from 'lucide-react';

export const ResultsPage: React.FC = () => {
  const {
    currentDesign,
    simulationResult,
    runComparison,
    setIsComparisonOpen,
    setIsReportOpen,
    setActivePage
  } = useShelter();

  const [graphUrl, setGraphUrl] = useState<string | null>(null);
  const [graphLoading, setGraphLoading] = useState<boolean>(false);
  const [graphError, setGraphError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let createdUrl: string | null = null;

    if (simulationResult?.hourly_data && simulationResult.hourly_data.length > 0) {
      setGraphLoading(true);
      setGraphError(null);

      fetchTemperatureGraphApi(simulationResult.hourly_data)
        .then((url) => {
          if (active) {
            createdUrl = url;
            setGraphUrl(url);
            setGraphLoading(false);
          } else {
            URL.revokeObjectURL(url);
          }
        })
        .catch((err) => {
          if (active) {
            console.error('Failed to generate Matplotlib graph:', err);
            setGraphError('Unable to generate Matplotlib graph from backend.');
            setGraphLoading(false);
          }
        });
    }

    return () => {
      active = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [simulationResult?.hourly_data]);

  if (!simulationResult) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-mint text-forest flex items-center justify-center mx-auto text-2xl">
          🌡️
        </div>
        <h2 className="text-2xl font-bold text-forest">No Simulation Results Yet</h2>
        <p className="text-sm text-gray-600">
          Run the transient thermal model to analyze indoor temperatures and heat loss paths.
        </p>
        <button
          onClick={() => setActivePage('simulation')}
          className="px-6 py-3 rounded-2xl bg-forest text-white font-bold text-sm shadow-md"
        >
          Go to Simulation
        </button>
      </div>
    );
  }

  const breakdown = simulationResult.heat_loss_breakdown;

  const barData = [
    { name: 'Roof', percent: breakdown.roof_percent, watts: breakdown.roof_watts, color: '#9A4E16' },
    { name: 'Walls', percent: breakdown.walls_percent, watts: breakdown.walls_watts, color: '#0B6257' },
    { name: 'Windows', percent: breakdown.windows_percent, watts: breakdown.windows_watts, color: '#3B82F6' },
    { name: 'Ventilation / Infil', percent: breakdown.ventilation_percent, watts: breakdown.ventilation_watts, color: '#64748B' },
    { name: 'Ground', percent: breakdown.ground_percent, watts: breakdown.ground_watts, color: '#A16207' },
  ];

  const handleOpenSuggestions = async () => {
    await runComparison();
    setIsComparisonOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E2DFD2] pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-earth uppercase tracking-widest">
              Performance Analysis
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-xs text-forest font-semibold">{currentDesign.name}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-forest mt-0.5 font-sans">
            Thermal Performance
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            24-hour diurnal thermal cycle results and envelope heat-loss pathways.
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsReportOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#FAF9F5] text-forest border border-[#D5D3C5] font-bold text-xs shadow-2xs transition-all active:scale-95 flex items-center space-x-1.5"
          >
            <FileText className="w-4 h-4 text-earth" />
            <span>Generate Design Report</span>
          </button>

          <button
            onClick={handleOpenSuggestions}
            className="px-5 py-2.5 rounded-xl bg-forest hover:bg-teal-dark text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4 text-solar" />
            <span>See Design Suggestions</span>
          </button>
        </div>
      </div>

      {/* TRANSPARENCY NOTICE (As mandated by DRDO specifications) */}
      <div className="bg-mint/40 border border-[#C8E6C9] p-4 rounded-2xl flex items-start space-x-3">
        <Info className="w-5 h-5 text-forest shrink-0 mt-0.5" />
        <div className="text-xs text-forest space-y-0.5">
          <div className="flex items-center space-x-2">
            <span className="font-bold uppercase tracking-wider text-[10px] bg-forest text-white px-2 py-0.5 rounded-md">
              {simulationResult.engine_used}
            </span>
            <span className="text-gray-500 font-medium">SIH26051 Physics Engine</span>
          </div>
          <p className="text-gray-600">
            {simulationResult.transparency_disclaimer}
          </p>
        </div>
      </div>

      {/* 4 PRIMARY RESULT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* CARD 1: Indoor Temperature (Mean) */}
        <div className="bg-white rounded-3xl p-6 border border-[#E2DFD2] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Mean Indoor Temp
            </span>
            <div className="w-9 h-9 rounded-xl bg-mint flex items-center justify-center text-forest">
              <Thermometer className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-forest font-sans">
              {simulationResult.mean_indoor_temp}°C
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Range: {simulationResult.min_indoor_temp}°C to {simulationResult.max_indoor_temp}°C
            </p>
          </div>
        </div>

        {/* CARD 2: Temperature at 2 AM (Critical cold hour) */}
        <div className="bg-white rounded-3xl p-6 border border-[#E2DFD2] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Temperature at 2 AM
            </span>
            <div className="w-9 h-9 rounded-xl bg-soft-blue flex items-center justify-center text-[#1E3A8A]">
              <Moon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-forest font-sans">
              {simulationResult.temp_at_2am}°C
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Outdoor: <strong className="text-blue-600">{simulationResult.outdoor_temp_at_2am}°C</strong> (Delta: +{(simulationResult.temp_at_2am - simulationResult.outdoor_temp_at_2am).toFixed(1)}°C)
            </p>
          </div>
        </div>

        {/* CARD 3: Total / Peak Heat Loss */}
        <div className="bg-white rounded-3xl p-6 border border-[#E2DFD2] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Peak Heat Loss
            </span>
            <div className="w-9 h-9 rounded-xl bg-solar/30 flex items-center justify-center text-earth">
              <Snowflake className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-earth font-sans">
              {simulationResult.peak_heat_loss_kw} kW
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Total 24h Loss: <strong>{simulationResult.total_heat_loss_kwh} kWh</strong>
            </p>
          </div>
        </div>

        {/* CARD 4: Solar Heat Gain */}
        <div className="bg-white rounded-3xl p-6 border border-[#E2DFD2] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Solar Heat Gain
            </span>
            <div className="w-9 h-9 rounded-xl bg-solar flex items-center justify-center text-[#B45309]">
              <Sun className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-forest font-sans">
              {simulationResult.total_solar_gain_kwh} kWh
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Thermal Damping: <strong>{Math.round(simulationResult.thermal_damping_ratio * 100)}%</strong>
            </p>
          </div>
        </div>

      </div>

      {/* MAIN GRAPH: INDOOR vs OUTDOOR TEMPERATURE (24 Hours) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2DFD2] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-forest font-sans">
              Indoor vs. Outdoor Temperature (24-Hour Cycle)
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Identifies the critical nighttime hours when the shelter loses heat and requires thermal buffering.
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs font-semibold">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-forest" />
              <span>Indoor Temp (°C)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-[#3B82F6]" />
              <span>Outdoor Temp (°C)</span>
            </div>
          </div>
        </div>

        {/* Matplotlib Diurnal Temperature Curve */}
        <div className="w-full h-80 pt-4 flex items-center justify-center">
          {graphLoading && !graphUrl && (
            <div className="flex flex-col items-center justify-center space-y-2 text-forest/70">
              <div className="w-8 h-8 border-3 border-forest border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold">Generating Matplotlib graph...</span>
            </div>
          )}
          {graphError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs text-center space-y-1">
              <p className="font-semibold">Graph generation failed</p>
              <p className="text-[11px] text-red-600">{graphError}</p>
            </div>
          )}
          {graphUrl && (
            <img
              src={graphUrl}
              alt="Indoor vs. Outdoor Temperature (24-Hour Cycle)"
              className="w-full h-full object-contain rounded-2xl"
            />
          )}
        </div>

        {/* Explanatory Caption */}
        <div className="bg-[#FAF9F5] p-3.5 rounded-2xl border border-[#EBE8DC] flex items-center justify-between text-xs text-gray-600">
          <span>
            💡 <strong>Observation:</strong> The shelter temperature drops during night hours (20:00 to 06:00), reaching its minimum at <strong>2 AM ({simulationResult.temp_at_2am}°C)</strong>.
          </span>
          <span className="text-forest font-bold shrink-0 ml-2">Thermal Lag: ~{simulationResult.thermal_lag_hours}h</span>
        </div>
      </div>

      {/* HEAT LOSS BREAKDOWN ("Where is the heat going?") */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Horizontal Bar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#E2DFD2] shadow-sm space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-earth">Envelope Pathways</span>
            <h2 className="text-xl font-bold text-forest font-sans mt-0.5">
              Where is the heat going?
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Component-wise breakdown of conductive, convective, and air infiltration heat loss.
            </p>
          </div>

          <div className="space-y-4">
            {barData.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-gray-700">{item.name}</span>
                  <span className="text-forest">{item.percent}%</span>
                </div>
                <div className="w-full bg-[#EFECE0] h-3.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Dominant loss callout */}
          <div className="bg-soft-blue/50 border border-[#BBDDFF] p-4 rounded-2xl text-xs text-[#1E3A8A] flex items-start justify-between">
            <div>
              <p className="font-bold text-sm">
                Your largest heat-loss path is the {breakdown.dominant_path}.
              </p>
              <p className="mt-0.5 text-gray-600">
                Targeting this specific envelope component will give the highest thermal comfort return.
              </p>
            </div>
            
            <button
              onClick={handleOpenSuggestions}
              className="shrink-0 px-4 py-2 rounded-xl bg-forest hover:bg-teal-dark text-white font-bold text-xs shadow-xs transition-all flex items-center space-x-1 ml-4"
            >
              <span>See Suggestions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Design Suggestions Box (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-[#E2DFD2] shadow-sm space-y-5">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-earth" />
            <h3 className="text-lg font-bold text-forest font-sans">
              Physics-Based Design Suggestions
            </h3>
          </div>

          <div className="space-y-3">
            {simulationResult.design_suggestions.map((sug, i) => (
              <div key={i} className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#EBE8DC] flex items-start space-x-3 text-xs">
                <span className="w-5 h-5 rounded-full bg-mint text-forest font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-gray-700 leading-relaxed font-medium">
                  {sug}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={handleOpenSuggestions}
              className="w-full py-3.5 rounded-2xl bg-forest hover:bg-teal-dark text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-solar" />
              <span>Compare Current vs. Improved Design</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
