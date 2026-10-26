import React from 'react';

/**
 * National Emblem of India (State Emblem - Lion Capital of Ashoka with Satyameva Jayate)
 * Renders the authentic official high-resolution government insignia.
 */
export const NationalEmblem: React.FC<{ className?: string; alt?: string }> = ({
  className = 'w-9 h-12',
  alt = 'State Emblem of India',
}) => (
  <img
    src="/emblem-india.png"
    alt={alt}
    className={`object-contain ${className}`}
  />
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
