import React from 'react';

/**
 * National Emblem of India (State Emblem - Lion Capital of Ashoka with Satyameva Jayate)
 * Scalable vector SVG formatted with authentic government iconography.
 */
export const NationalEmblem: React.FC<{ className?: string }> = ({ className = 'w-10 h-12' }) => (
  <svg
    viewBox="0 0 100 120"
    className={className}
    fill="currentColor"
    aria-label="State Emblem of India"
    role="img"
  >
    {/* Central Ashoka Lion Profile & Pedestal Silhouette */}
    <g fill="currentColor">
      {/* Central Lion Head & Mane */}
      <path d="M50 8 C44 8 40 12 39 16 C37 14 34 14 32 16 C30 18 31 22 33 24 C31 25 29 27 29 30 C29 34 32 37 36 38 C35 40 35 43 36 46 C38 52 44 56 50 56 C56 52 62 46 64 46 C65 43 65 40 64 38 C68 37 71 34 71 30 C71 27 69 25 67 24 C69 22 70 18 68 16 C66 14 63 14 61 16 C60 12 56 8 50 8 Z" />
      {/* Left Lion Mane Profile */}
      <path d="M30 28 C25 28 20 32 18 36 C16 40 17 44 20 46 C18 48 17 51 18 54 C20 59 25 62 30 63 C32 63 35 62 37 60 C36 57 36 53 37 50 C34 49 32 46 32 43 C30 42 29 39 30 36 C28 35 28 32 30 28 Z" />
      {/* Right Lion Mane Profile */}
      <path d="M70 28 C75 28 80 32 82 36 C84 40 83 44 80 46 C82 48 83 51 82 54 C80 59 75 62 70 63 C68 63 65 62 63 60 C64 57 64 53 63 50 C66 49 68 46 68 43 C70 42 71 39 70 36 C72 35 72 32 70 28 Z" />
      {/* Pedestal / Abacus Upper Tier */}
      <rect x="22" y="66" width="56" height="5" rx="1.5" />
      
      {/* Ashoka Chakra in Center of Abacus */}
      <circle cx="50" cy="78" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="50" cy="78" r="1.5" fill="currentColor" />
      {/* 24 Spoke representation */}
      <path d="M50 71 L50 85 M43 78 L57 78 M45 73 L55 83 M45 83 L55 73" stroke="currentColor" strokeWidth="0.8" />

      {/* Galloping Horse (Left) & Bull (Right) representations */}
      {/* Left Horse */}
      <path d="M28 75 C25 74 24 76 25 78 C26 80 29 81 32 80 C33 79 34 77 33 75 Z" />
      {/* Right Bull */}
      <path d="M72 75 C75 74 76 76 75 78 C74 80 71 81 68 80 C67 79 66 77 67 75 Z" />

      {/* Pedestal Lower Base */}
      <rect x="18" y="86" width="64" height="4" rx="1" />
      <rect x="24" y="91" width="52" height="3" rx="0.5" />

      {/* Bell Capital / Lotus Base */}
      <path d="M30 95 C38 99 44 100 50 100 C56 100 62 99 70 95 C68 98 60 102 50 102 C40 102 32 98 30 95 Z" />

      {/* Satyameva Jayate Script (सत्यमेव जयते) */}
      <text
        x="50"
        y="114"
        textAnchor="middle"
        fontSize="8.5"
        fontWeight="bold"
        fontFamily="sans-serif, Noto Sans Devanagari"
        letterSpacing="0.8"
      >
        सत्यमेव जयते
      </text>
    </g>
  </svg>
);

/**
 * AICTE Official Emblem (Torch of Knowledge, Gear of Technical Education, and Lotus Base)
 */
export const AicteEmblem: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <svg
    viewBox="0 0 100 100"
    className={className}
    fill="currentColor"
    aria-label="All India Council for Technical Education Official Insignia"
    role="img"
  >
    {/* Outer Ring with Cog Teeth for Technical Education */}
    <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="2.5" />
    <circle cx="50" cy="50" r="41" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" />

    {/* Central Torch / Flame of Enlightenment */}
    <path
      d="M50 16 C53 22 57 26 56 32 C55 37 51 40 50 44 C49 40 45 37 44 32 C43 26 47 22 50 16 Z"
      fill="#C2570C"
    />
    <path
      d="M50 22 C51.5 25 53 28 52 32 C51 35 49 37 50 40 C49 37 48 35 48 32 C47 28 48.5 25 50 22 Z"
      fill="#FCD34D"
    />

    {/* Torch Holder / Base */}
    <path d="M46 44 L54 44 L52 54 L48 54 Z" fill="currentColor" />

    {/* Open Book of Learning */}
    <path
      d="M50 56 C44 52 34 52 26 55 L26 72 C34 69 44 69 50 73 C56 69 66 69 74 72 L74 55 C66 52 56 52 50 56 Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
    <line x1="50" y1="56" x2="50" y2="73" stroke="currentColor" strokeWidth="2" />

    {/* Motto Arc / Banner: योगः कर्मसु कौशलम् */}
    <path d="M22 78 Q50 88 78 78" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <text
      x="50"
      y="92"
      textAnchor="middle"
      fontSize="6.5"
      fontWeight="bold"
      fontFamily="sans-serif, Noto Sans Devanagari"
    >
      योगः कर्मसु कौशलम्
    </text>
  </svg>
);

/**
 * Official AICTE NIVARAN Insignia (Circular Golden Cog with Lotus & Tricolor Lamp)
 */
export const AicteNivaranLogo: React.FC<{ className?: string; alt?: string }> = ({
  className = 'w-12 h-12',
  alt = 'AICTE NIVARAN - All India Council For Technical Education',
}) => (
  <img
    src="/aicte-nivaran-logo.png"
    alt={alt}
    className={`object-contain rounded-full ${className}`}
  />
);

/**
 * Digital India Official Initiative Badge
 */
export const DigitalIndiaBadge: React.FC<{ className?: string }> = ({ className = 'h-8' }) => (
  <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded bg-white border border-[#CBD2DC] shadow-xs select-none ${className}`}>
    <div className="flex flex-col text-left leading-none">
      <span className="text-[9px] font-black tracking-tight text-[#1D4ED8] uppercase">Digital India</span>
      <span className="text-[7.5px] font-bold text-[#166534]">Power To Empower</span>
    </div>
  </div>
);

/**
 * Indian National Tricolor Ribbon
 */
export const NationalTricolorRibbon: React.FC<{ height?: string }> = ({ height = 'h-1.5' }) => (
  <div className={`w-full flex ${height} shadow-xs select-none`} aria-hidden="true">
    <div className="flex-1 bg-[#FF9933]" title="Saffron (Courage & Sacrifice)" />
    <div className="flex-1 bg-[#FFFFFF] relative flex items-center justify-center">
      <div className="w-1.5 h-1.5 rounded-full border border-[#000080]" />
    </div>
    <div className="flex-1 bg-[#138808]" title="Green (Prosperity & Faith)" />
  </div>
);
