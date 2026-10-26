import React from 'react';
import { useApp } from '../context/AppContext';
import { Globe, Type, Eye, Volume2 } from 'lucide-react';
import { NationalEmblem, AicteNivaranLogo, DigitalIndiaBadge, NationalTricolorRibbon } from './GovLogos';

export const HeaderStrip: React.FC = () => {
  const { language, setLanguage, textSize, setTextSize, highContrast, toggleHighContrast, t } = useApp();

  return (
    <>
      <a href="#main-content" className="skip-link">
        {t('skip_to_content')}
      </a>

      {/* ========================================================
          1. GIGW TOP CITIZEN & ACCESSIBILITY UTILITY STRIP
          ======================================================== */}
      <div className="w-full bg-[#071D3F] text-white border-b border-white/10 text-[11px] select-none z-40">
        <div className="max-w-[1600px] mx-auto px-4 py-1 flex flex-wrap items-center justify-between gap-2">
          
          {/* Left: Government of India & Ministry Identifiers */}
          <div className="flex items-center gap-2 text-white/90 font-medium">
            <span className="inline-block text-xs" role="img" aria-label="Indian Tricolor">🇮🇳</span>
            <span className="font-semibold">{t('gov_of_india')}</span>
            <span className="text-white/40">|</span>
            <span className="text-white/80">{t('ministry_of_edu')}</span>
            <span className="hidden lg:inline text-white/40">|</span>
            <span className="hidden lg:inline text-[#FCD34D] font-mono text-[10px]">
              GIGW 3.0 Standard
            </span>
          </div>

          {/* Right: Accessibility Controls */}
          <div className="flex items-center gap-3">
            {/* Screen Reader Access link */}
            <a
              href="#main-content"
              className="hidden sm:flex items-center gap-1 text-white/80 hover:text-white hover:underline focus:outline-none"
              title="Skip directly to page content"
            >
              <Volume2 className="w-3 h-3 text-[#FCD34D]" aria-hidden="true" />
              <span>{t('screen_reader')}</span>
            </a>

            <span className="hidden sm:inline text-white/30">|</span>

            {/* Font Size Resizer */}
            <div className="flex items-center gap-1 bg-black/25 px-1.5 py-0.5 rounded border border-white/10">
              <Type className="w-3 h-3 text-white/70" aria-hidden="true" />
              <button
                onClick={() => setTextSize('sm')}
                className={`px-1.5 py-0.2 rounded font-bold transition-colors ${
                  textSize === 'sm' ? 'bg-[#C2570C] text-white' : 'text-white/70 hover:text-white'
                }`}
                aria-label="Decrease text size"
                title="Small text (A-)"
              >
                A-
              </button>
              <button
                onClick={() => setTextSize('md')}
                className={`px-1.5 py-0.2 rounded font-bold transition-colors ${
                  textSize === 'md' ? 'bg-[#C2570C] text-white' : 'text-white/70 hover:text-white'
                }`}
                aria-label="Default text size"
                title="Default text (A)"
              >
                A
              </button>
              <button
                onClick={() => setTextSize('lg')}
                className={`px-1.5 py-0.2 rounded font-bold transition-colors ${
                  textSize === 'lg' ? 'bg-[#C2570C] text-white' : 'text-white/70 hover:text-white'
                }`}
                aria-label="Increase text size"
                title="Large text (A+)"
              >
                A+
              </button>
            </div>

            {/* High Contrast Mode Toggle */}
            <button
              onClick={toggleHighContrast}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10.5px] font-semibold transition-colors ${
                highContrast
                  ? 'bg-yellow-400 text-black border-yellow-300'
                  : 'bg-black/25 text-white/80 hover:text-white border-white/10'
              }`}
              title="Toggle High Contrast for Visual Accessibility"
              aria-pressed={highContrast}
            >
              <Eye className="w-3 h-3" aria-hidden="true" />
              <span className="hidden md:inline">{t('contrast_toggle')}</span>
            </button>

            <span className="text-white/30">|</span>

            {/* Bilingual Language Switcher */}
            <div className="flex items-center gap-0.5 bg-black/25 px-1 py-0.5 rounded border border-white/10">
              <Globe className="w-3 h-3 text-[#CBD2DC] mr-0.5" aria-hidden="true" />
              <button
                onClick={() => setLanguage('en')}
                className={`px-1.5 py-0.2 rounded text-[10.5px] font-semibold transition-colors ${
                  language === 'en'
                    ? 'bg-[#C2570C] text-white'
                    : 'text-white/70 hover:text-white'
                }`}
                aria-pressed={language === 'en'}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-1.5 py-0.2 rounded text-[10.5px] font-semibold transition-colors ${
                  language === 'hi'
                    ? 'bg-[#C2570C] text-white'
                    : 'text-white/70 hover:text-white'
                }`}
                aria-pressed={language === 'hi'}
              >
                हिन्दी
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. OFFICIAL GOVERNMENT BRAND MASTHEAD (WHITE / NAVY)
          ======================================================== */}
      <header className="w-full bg-white text-[#0B2A5B] border-b border-[#CBD2DC] select-none z-30 shadow-xs">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          
          {/* Left: National Emblem + AICTE NIVARAN Official Insignia + Department Lockup */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Lion Capital of Ashoka (National Emblem) */}
            <div className="flex flex-col items-center flex-shrink-0 text-[#0B2A5B]" title="State Emblem of India">
              <NationalEmblem className="w-9 h-11 md:w-11 md:h-13" />
            </div>

            {/* Vertical Divider */}
            <div className="h-12 w-[1px] bg-[#CBD2DC] hidden sm:block" aria-hidden="true" />

            {/* AICTE NIVARAN Official Insignia */}
            <div className="flex items-center flex-shrink-0" title="AICTE NIVARAN - All India Council for Technical Education">
              <AicteNivaranLogo className="w-12 h-12 md:w-14 md:h-14 drop-shadow-xs hover:scale-105 transition-transform" />
            </div>

            {/* Ministry & Council Typography */}
            <div className="space-y-0.5">
              <div className="text-xs md:text-sm font-bold text-[#0B2A5B] tracking-wide leading-tight flex items-center gap-2">
                <span>अखिल भारतीय तकनीकी शिक्षा परिषद</span>
                <span className="hidden lg:inline-block text-[10px] font-bold px-1.5 py-0.2 bg-[#800020]/10 text-[#800020] rounded border border-[#800020]/20">
                  निवारण पोर्टल
                </span>
              </div>
              <div className="text-base md:text-lg font-black text-[#0B2A5B] tracking-tight leading-tight uppercase font-sans flex items-center gap-2">
                <span>AICTE NIVARAN</span>
                <span className="text-[11px] font-bold text-[#C2570C] normal-case bg-amber-50 px-2 py-0.5 rounded border border-amber-200 hidden sm:inline-block">
                  National Grievance Portal
                </span>
              </div>
              <div className="text-[10px] md:text-[11px] text-[#4B5565] font-medium leading-none">
                शिक्षा मंत्रालय, भारत सरकार का सांविधिक निकाय · A Statutory Body of the Government of India
              </div>
            </div>
          </div>

          {/* Right: Portal Authority Branding & Trust Badges */}
          <div className="flex items-center gap-3 ml-auto lg:ml-0">
            {/* Portal Title Box */}
            <div className="text-right hidden sm:block">
              <div className="text-xs font-black text-[#800020] uppercase tracking-wider font-mono flex items-center justify-end gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                AICTE NIVARAN
              </div>
              <div className="text-xs md:text-sm font-bold text-[#0B2A5B] leading-tight">
                {t('official_portal_title')}
              </div>
              <div className="text-[10px] text-[#4B5565]">
                Central Bureau Redressal &amp; Coordination Desk
              </div>
            </div>

            {/* Digital India Badge */}
            <div className="hidden md:flex flex-col items-end gap-1">
              <DigitalIndiaBadge />
              <span className="text-[9px] font-semibold text-[#166534] bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                STQC Certified
              </span>
            </div>
          </div>

        </div>
      </header>

      {/* ========================================================
          3. NATIONAL TRICOLOR ACCENT RIBBON
          ======================================================== */}
      <NationalTricolorRibbon height="h-1.5" />
    </>
  );
};
