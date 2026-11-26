import React from 'react';
import { useShelter } from '../../context/ShelterContext';
import {
  Layers,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Leaf,
  ShieldCheck
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* ILLUSTRATION 1: Stacked Earth Bricks with Sprouting Green Plant           */
/* -------------------------------------------------------------------------- */
const EarthBricksIllustration: React.FC = () => {
  return (
    <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center shrink-0">
      {/* Soft Light-Green Decorative Organic Blob Background */}
      <svg
        viewBox="0 0 160 160"
        className="absolute inset-0 w-full h-full text-[#EAF5EC] drop-shadow-xs transition-transform duration-500 group-hover:scale-105"
        fill="currentColor"
      >
        <path d="M125.8,36.5 C145.2,55.1 154.6,83.9 146.4,108.7 C138.2,133.5 112.4,154.3 84.8,156.7 C57.2,159.1 27.8,143.1 13.6,119.3 C-0.6,95.5 0.4,63.9 17.5,42.5 C34.6,21.1 67.8,9.9 96.8,14.6 C107.5,16.3 117.8,24.8 125.8,36.5 Z" />
      </svg>

      {/* 3D Stacked Earth Blocks + Plant Vector */}
      <svg
        viewBox="0 0 140 140"
        className="relative z-10 w-28 h-28 sm:w-32 sm:h-32 transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-105"
      >
        <defs>
          {/* Earth Brick Shading Gradients */}
          <linearGradient id="topFace1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DFAC6C" />
            <stop offset="100%" stopColor="#CCA060" />
          </linearGradient>
          <linearGradient id="frontFace1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#C48847" />
            <stop offset="100%" stopColor="#B07433" />
          </linearGradient>
          <linearGradient id="sideFace1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#A46B2D" />
            <stop offset="100%" stopColor="#87531E" />
          </linearGradient>

          <linearGradient id="topFace2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E5B578" />
            <stop offset="100%" stopColor="#D5A566" />
          </linearGradient>
          <linearGradient id="frontFace2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#CB8F4E" />
            <stop offset="100%" stopColor="#B87B3B" />
          </linearGradient>

          {/* Plant Leaf Gradients */}
          <linearGradient id="leafGrad1" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1E7A38" />
            <stop offset="100%" stopColor="#4CAF50" />
          </linearGradient>
          <linearGradient id="leafGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2E8B45" />
            <stop offset="100%" stopColor="#66BB6A" />
          </linearGradient>
          <linearGradient id="leafHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A5D6A7" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#A5D6A7" stopOpacity="0" />
          </linearGradient>

          {/* Soft Ground Shadow */}
          <radialGradient id="brickShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3E2714" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#3E2714" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Cast shadow under blocks */}
        <ellipse cx="68" cy="118" rx="46" ry="10" fill="url(#brickShadow)" />

        {/* ----------------- TIER 1 (BOTTOM BLOCKS) ----------------- */}
        {/* Bottom Left Block */}
        <g>
          {/* Top */}
          <polygon points="32,84 48,76 64,84 48,92" fill="url(#topFace1)" stroke="#B07B3E" strokeWidth="0.5" />
          {/* Front */}
          <polygon points="32,84 48,92 48,110 32,102" fill="url(#frontFace1)" stroke="#8F5922" strokeWidth="0.5" />
          {/* Right side */}
          <polygon points="48,92 64,84 64,102 48,110" fill="url(#sideFace1)" stroke="#7A4917" strokeWidth="0.5" />
        </g>

        {/* Bottom Right Block */}
        <g>
          {/* Top */}
          <polygon points="64,84 80,76 96,84 80,92" fill="url(#topFace2)" stroke="#B07B3E" strokeWidth="0.5" />
          {/* Front */}
          <polygon points="64,84 80,92 80,110 64,102" fill="url(#frontFace2)" stroke="#8F5922" strokeWidth="0.5" />
          {/* Right side */}
          <polygon points="80,92 96,84 96,102 80,110" fill="url(#sideFace1)" stroke="#7A4917" strokeWidth="0.5" />
        </g>

        {/* Far Right Block */}
        <g>
          {/* Top */}
          <polygon points="80,76 96,68 112,76 96,84" fill="url(#topFace1)" stroke="#B07B3E" strokeWidth="0.5" />
          {/* Front */}
          <polygon points="96,84 96,102 80,110 80,92" fill="url(#frontFace1)" opacity="0.9" />
          {/* Right side */}
          <polygon points="96,84 112,76 112,94 96,102" fill="url(#sideFace1)" stroke="#7A4917" strokeWidth="0.5" />
        </g>

        {/* ----------------- TIER 2 (MIDDLE BLOCKS) ----------------- */}
        {/* Middle Block */}
        <g>
          {/* Top */}
          <polygon points="48,66 64,58 80,66 64,74" fill="url(#topFace2)" stroke="#B07B3E" strokeWidth="0.5" />
          {/* Front */}
          <polygon points="48,66 64,74 64,92 48,84" fill="url(#frontFace2)" stroke="#8F5922" strokeWidth="0.5" />
          {/* Right side */}
          <polygon points="64,74 80,66 80,84 64,92" fill="url(#sideFace1)" stroke="#7A4917" strokeWidth="0.5" />
        </g>

        {/* Middle Right Block */}
        <g>
          {/* Top */}
          <polygon points="64,58 80,50 96,58 80,66" fill="url(#topFace1)" stroke="#B07B3E" strokeWidth="0.5" />
          {/* Front */}
          <polygon points="80,66 80,84 64,92 64,74" fill="url(#frontFace1)" opacity="0.85" />
          {/* Right side */}
          <polygon points="80,66 96,58 96,76 80,84" fill="url(#sideFace1)" stroke="#7A4917" strokeWidth="0.5" />
        </g>

        {/* ----------------- TIER 3 (TOP CROWN BLOCK) ----------------- */}
        <g>
          {/* Top */}
          <polygon points="64,50 80,42 96,50 80,58" fill="url(#topFace2)" stroke="#C89758" strokeWidth="0.5" />
          {/* Front */}
          <polygon points="64,50 80,58 80,72 64,64" fill="url(#frontFace2)" stroke="#8F5922" strokeWidth="0.5" />
          {/* Right side */}
          <polygon points="80,58 96,50 96,64 80,72" fill="url(#sideFace1)" stroke="#7A4917" strokeWidth="0.5" />
        </g>

        {/* ----------------- ORGANIC SPROUTING PLANT ----------------- */}
        {/* Main Stem */}
        <path
          d="M86,52 Q94,40 96,28"
          fill="none"
          stroke="#2E7D32"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Large Leaf 1 (Top Left) */}
        <path
          d="M96,28 C86,22 84,36 94,40 C95,36 96,30 96,28 Z"
          fill="url(#leafGrad1)"
          stroke="#1B5E20"
          strokeWidth="0.5"
        />
        <path d="M96,28 Q90,32 94,40" stroke="#81C784" strokeWidth="0.6" fill="none" />

        {/* Leaf 2 (Top Right) */}
        <path
          d="M96,28 C104,18 114,26 102,36 C99,33 97,30 96,28 Z"
          fill="url(#leafGrad2)"
          stroke="#1B5E20"
          strokeWidth="0.5"
        />
        <path d="M96,28 Q102,26 102,36" stroke="#A5D6A7" strokeWidth="0.6" fill="none" />

        {/* Leaf 3 (Small Sprout Bud) */}
        <path
          d="M92,42 C85,42 86,48 92,47 Z"
          fill="#4CAF50"
        />

        {/* Floating Green Accent Leaves */}
        <path
          d="M108,46 C113,44 116,48 111,51 C108,50 107,48 108,46 Z"
          fill="#66BB6A"
          opacity="0.9"
        />
        <path
          d="M26,98 C22,96 23,101 27,100 Z"
          fill="#81C784"
          opacity="0.8"
        />
      </svg>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* ILLUSTRATION 2: Illustrated Diurnal Temperature Graph with Golden Sun     */
/* -------------------------------------------------------------------------- */
const DiurnalGraphIllustration: React.FC = () => {
  return (
    <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center shrink-0">
      {/* Soft Sky-Blue Decorative Organic Blob Background */}
      <svg
        viewBox="0 0 160 160"
        className="absolute inset-0 w-full h-full text-[#EEF7FF] drop-shadow-xs transition-transform duration-500 group-hover:scale-105"
        fill="currentColor"
      >
        <path d="M128.5,35.2 C146.8,53.8 153.2,82.4 144.1,106.3 C135,130.2 110.3,149.3 83.2,152.1 C56.1,154.9 26.5,141.4 13.2,118.1 C-0.1,94.8 2.8,61.8 20.3,41.2 C37.8,20.6 69.8,12.5 97.4,16.5 C108.9,18.2 119.8,25.8 128.5,35.2 Z" />
      </svg>

      {/* Vector Temperature Graph with Sun and Dual Transient Curves */}
      <svg
        viewBox="0 0 140 140"
        className="relative z-10 w-28 h-28 sm:w-32 sm:h-32 transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-105"
      >
        <defs>
          {/* Outdoor Temperature Curve Gradient (Orange/Amber) */}
          <linearGradient id="outdoorCurveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="50%" stopColor="#EA580C" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>

          {/* Indoor Temperature Curve Gradient (Deep Teal/Emerald) */}
          <linearGradient id="indoorCurveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0D9488" />
            <stop offset="50%" stopColor="#047857" />
            <stop offset="100%" stopColor="#0D9488" />
          </linearGradient>

          {/* Golden Sun Gradient */}
          <linearGradient id="sunGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>

          {/* Under-curve Solar Warmth Gradient */}
          <linearGradient id="outdoorAreaFill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F97316" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#F97316" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Axes System */}
        {/* Y Axis */}
        <line x1="22" y1="26" x2="22" y2="108" stroke="#BFDBFE" strokeWidth="1.5" strokeLinecap="round" />
        <polyline points="19,30 22,25 25,30" fill="none" stroke="#BFDBFE" strokeWidth="1.5" strokeLinecap="round" />

        {/* X Axis (24-Hour Timeline) */}
        <line x1="22" y1="108" x2="124" y2="108" stroke="#BFDBFE" strokeWidth="1.5" strokeLinecap="round" />

        {/* Subtle timeline grid ticks */}
        <line x1="47" y1="108" x2="47" y2="112" stroke="#93C5FD" strokeWidth="1" />
        <line x1="73" y1="108" x2="73" y2="112" stroke="#93C5FD" strokeWidth="1" />
        <line x1="99" y1="108" x2="99" y2="112" stroke="#93C5FD" strokeWidth="1" />

        {/* Critical Peak Indicator (Dashed line at 2 PM Solar Peak) */}
        <line
          x1="86"
          y1="38"
          x2="86"
          y2="108"
          stroke="#38BDF8"
          strokeWidth="1.2"
          strokeDasharray="3 3"
          opacity="0.85"
        />

        {/* Area fill under outdoor curve */}
        <path
          d="M23,90 C45,86 65,38 86,38 C104,38 116,74 124,76 L124,108 L23,108 Z"
          fill="url(#outdoorAreaFill)"
        />

        {/* Outdoor Temperature Curve (Peak Solar Exposure) */}
        <path
          d="M22,90 C45,86 65,38 86,38 C104,38 116,74 124,76"
          fill="none"
          stroke="url(#outdoorCurveGrad)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Indoor Temperature Flywheel Curve (Damped & Stabilized) */}
        <path
          d="M22,70 C45,71 68,66 84,60 C98,54 112,64 124,66"
          fill="none"
          stroke="url(#indoorCurveGrad)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Golden Sun Vector above the Peak */}
        <g transform="translate(86, 26)">
          {/* Sun Rays */}
          <line x1="0" y1="-12" x2="0" y2="-9" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
          <line x1="8.5" y1="-8.5" x2="6.4" y2="-6.4" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
          <line x1="12" y1="0" x2="9" y2="0" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
          <line x1="8.5" y1="8.5" x2="6.4" y2="6.4" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
          <line x1="0" y1="12" x2="0" y2="9" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
          <line x1="-8.5" y1="8.5" x2="-6.4" y2="6.4" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
          <line x1="-12" y1="0" x2="-9" y2="0" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
          <line x1="-8.5" y1="-8.5" x2="-6.4" y2="-6.4" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />

          {/* Sun Core Disc */}
          <circle cx="0" cy="0" r="6.5" fill="url(#sunGlowGrad)" stroke="#F59E0B" strokeWidth="1" />
        </g>

        {/* Key Curve Peak Markers */}
        <circle cx="86" cy="38" r="3" fill="#EA580C" stroke="#FFFFFF" strokeWidth="1.2" />
        <circle cx="98" cy="54" r="3" fill="#047857" stroke="#FFFFFF" strokeWidth="1.2" />
      </svg>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* ILLUSTRATION 3: Sustainable Passive House with Living Plant Inside         */
/* -------------------------------------------------------------------------- */
const SustainableHouseIllustration: React.FC = () => {
  return (
    <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center shrink-0">
      {/* Soft Warm-Yellow Decorative Organic Blob Background */}
      <svg
        viewBox="0 0 160 160"
        className="absolute inset-0 w-full h-full text-[#FEF5E7] drop-shadow-xs transition-transform duration-500 group-hover:scale-105"
        fill="currentColor"
      >
        <path d="M126.8,37.1 C144.5,56.2 152.1,84.7 143.2,108.8 C134.3,132.9 108.9,152.6 81.9,154.9 C54.9,157.2 26.3,142.1 13.1,118.8 C-0.1,95.5 2.1,64 19.4,43.2 C36.7,22.4 69.1,12.3 97.4,16.8 C108.6,18.6 118.9,26.7 126.8,37.1 Z" />
      </svg>

      {/* Architectural Green House Silhouette with Biophilic Interior Leaf */}
      <svg
        viewBox="0 0 140 140"
        className="relative z-10 w-28 h-28 sm:w-32 sm:h-32 transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-105"
      >
        <defs>
          {/* House Outline Gradient */}
          <linearGradient id="houseStrokeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0B6257" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>

          {/* Plant Leaves Gradients */}
          <linearGradient id="plantLeafGrad1" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#15803D" />
            <stop offset="100%" stopColor="#22C55E" />
          </linearGradient>
          <linearGradient id="plantLeafGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#166534" />
            <stop offset="100%" stopColor="#4ADE80" />
          </linearGradient>

          {/* Interior Ambient Glow */}
          <radialGradient id="houseGlow" cx="50%" cy="65%" r="45%">
            <stop offset="0%" stopColor="#86EFAC" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#86EFAC" stopOpacity="0.0" />
          </radialGradient>
        </defs>

        {/* Warm Ambient House Interior */}
        <polygon
          points="70,30 114,64 106,64 106,108 34,108 34,64 26,64"
          fill="url(#houseGlow)"
        />

        {/* Chimney / Thermal Ventilation Shaft */}
        <path
          d="M92,48 L92,34 L102,34 L102,56"
          fill="none"
          stroke="url(#houseStrokeGrad)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Sustainable Pitched Roof Outline */}
        <path
          d="M26,64 L70,30 L114,64"
          fill="none"
          stroke="url(#houseStrokeGrad)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* House Walls & Ground Foundation */}
        <path
          d="M34,64 L34,108 L106,108 L106,64"
          fill="none"
          stroke="url(#houseStrokeGrad)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Interior Thermal Mass / Air Quality Living Plant */}
        <g transform="translate(70, 78)">
          {/* Plant Central Stem */}
          <path
            d="M0,30 L0,8"
            stroke="#15803D"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Left Large Sprout Leaf */}
          <path
            d="M0,18 C-14,14 -18,2 -6,-2 C-1,6 -1,14 0,18 Z"
            fill="url(#plantLeafGrad1)"
            stroke="#166534"
            strokeWidth="0.8"
          />

          {/* Right Large Sprout Leaf */}
          <path
            d="M0,18 C14,14 18,2 6,-2 C1,6 1,14 0,18 Z"
            fill="url(#plantLeafGrad2)"
            stroke="#166534"
            strokeWidth="0.8"
          />

          {/* Center Top Fresh Leaf Bud */}
          <path
            d="M0,8 C-5,2 0,-8 0,-8 C0,-8 5,2 0,8 Z"
            fill="#4ADE80"
          />

          {/* Delicate Leaf Center Vein */}
          <path d="M-6,-2 Q-2,8 0,18" stroke="#BBF7D0" strokeWidth="0.6" fill="none" />
          <path d="M6,-2 Q2,8 0,18" stroke="#BBF7D0" strokeWidth="0.6" fill="none" />
        </g>

        {/* Floating Green Accent Leaf (Bottom-Right outside house) */}
        <path
          d="M116,98 C122,95 125,101 119,104 C115,103 114,100 116,98 Z"
          fill="#22C55E"
          opacity="0.85"
        />
      </svg>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* MAIN FEATURE CARDS COMPONENT                                               */
/* -------------------------------------------------------------------------- */
export const FeatureCards: React.FC = () => {
  const { setActivePage } = useShelter();

  const cards = [
    {
      id: 'materials',
      icon: Layers,
      iconBg: 'bg-mint text-forest',
      title: 'Local Earth Materials',
      description:
        'Prioritizes Adobe mud, Rammed Earth, Poplar twig decks, and strawboard insulation. Evaluates thermal mass flywheels that store daytime warmth for cold nights.',
      illustration: <EarthBricksIllustration />,
      page: 'design',
    },
    {
      id: 'diurnal',
      icon: BarChart3,
      iconBg: 'bg-soft-blue text-[#1E3A8A]',
      title: 'Diurnal Transient Analysis',
      description:
        'Clear 24-hour indoor vs outdoor temperature curves highlighting critical 2 AM minimums, sunset heat retention, and dominant heat-loss pathways.',
      illustration: <DiurnalGraphIllustration />,
      page: 'simulation',
    },
    {
      id: 'recommendations',
      icon: CheckCircle2,
      iconBg: 'bg-solar/50 text-forest',
      title: 'Calculated Recommendations',
      description:
        'No guesswork or arbitrary scores. Real transient thermal deltas (e.g. +6.4°C higher 2 AM temperature) explain exactly why a recommended modification works.',
      illustration: <SustainableHouseIllustration />,
      page: 'results',
    },
  ];

  return (
    <div className="space-y-10">
      {/* 3 Rich Feature Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-7 items-stretch">
        {cards.map(card => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => setActivePage(card.page)}
              role="button"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setActivePage(card.page);
                }
              }}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E2DFD2] hover:border-[#BEDEC6] shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group cursor-pointer select-none text-left min-h-[300px] sm:min-h-[320px]"
            >
              {/* Card Body: Split Content + Vibrant Illustration */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                
                {/* Left Text Column */}
                <div className="flex-1 min-w-0 pr-1">
                  {/* Icon Badge */}
                  <div className={`w-11 h-11 rounded-2xl ${card.iconBg} flex items-center justify-center mb-4 shadow-2xs group-hover:scale-105 transition-transform duration-300`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-forest group-hover:text-teal-dark transition-colors tracking-tight font-sans">
                    {card.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-[13px] text-[#4A5D56] leading-relaxed mt-2.5">
                    {card.description}
                  </p>
                </div>

                {/* Right Illustration */}
                <div className="self-center sm:self-auto shrink-0">
                  {card.illustration}
                </div>
              </div>

              {/* Bottom "Learn More →" Link */}
              <div className="mt-5 pt-4 border-t border-[#F2EFE6] flex items-center">
                <span className="text-xs sm:text-sm font-bold text-forest group-hover:text-teal-dark flex items-center gap-1.5 group-hover:underline transition-colors">
                  <span>Learn More</span>
                  <ArrowRight className="w-4 h-4 text-forest group-hover:translate-x-1.5 transition-transform duration-200" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Benefits Strip below feature cards matching reference UI */}
      <div className="max-w-4xl mx-auto py-3 px-6 rounded-full bg-[#EBF4EC]/80 border border-[#D5EAD8] flex flex-wrap items-center justify-around gap-3 sm:gap-4 text-xs sm:text-sm font-bold text-forest shadow-2xs backdrop-blur-xs">
        <div className="flex items-center space-x-2">
          <Leaf className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Eco-Friendly Design</span>
        </div>
        <div className="hidden sm:block h-4 w-px bg-[#C8DFCC]" />
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-teal-dark shrink-0" />
          <span>Data-Driven Insights</span>
        </div>
        <div className="hidden sm:block h-4 w-px bg-[#C8DFCC]" />
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-4 h-4 text-forest shrink-0" />
          <span>Sustainable Future</span>
        </div>
      </div>
    </div>
  );
};
