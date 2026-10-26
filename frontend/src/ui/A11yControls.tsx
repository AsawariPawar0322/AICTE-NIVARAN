// ==========================================================================
// NIVARAN · GIGW Accessibility Controls (Language, Text-Size, Contrast)
// ==========================================================================

import React, { useState, useEffect } from 'react';
import { useI18n } from '../i18n/context';

// ── 1. Language Switch (EN / हिन्दी) ──
export const LanguageSwitch: React.FC = () => {
  const { lang, setLang } = useI18n();

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      <button
        type="button"
        onClick={() => setLang('en')}
        aria-pressed={lang === 'en'}
        style={{
          background: lang === 'en' ? 'rgba(255, 255, 255, 0.25)' : 'transparent',
          color: '#FFFFFF',
          fontWeight: lang === 'en' ? 700 : 500,
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: 'var(--fs-xs)',
          cursor: 'pointer'
        }}
      >
        English
      </button>
      <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>|</span>
      <button
        type="button"
        onClick={() => setLang('hi')}
        aria-pressed={lang === 'hi'}
        style={{
          background: lang === 'hi' ? 'rgba(255, 255, 255, 0.25)' : 'transparent',
          color: '#FFFFFF',
          fontWeight: lang === 'hi' ? 700 : 500,
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: 'var(--fs-xs)',
          cursor: 'pointer'
        }}
      >
        हिन्दी
      </button>
    </div>
  );
};

// ── 2. Text Size Control (A- A A+) ──
export const TextSizeControl: React.FC = () => {
  const [size, setSize] = useState<'90' | '100' | '115'>(() => {
    const saved = localStorage.getItem('nivaran_text_size');
    if (saved === '90' || saved === '115') return saved;
    return '100';
  });

  const applySize = (newSize: '90' | '100' | '115') => {
    setSize(newSize);
    localStorage.setItem('nivaran_text_size', newSize);
    document.documentElement.setAttribute('data-text-size', newSize);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-text-size', size);
  }, [size]);

  return (
    <div
      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
      role="group"
      aria-label="Text size controls"
    >
      <button
        type="button"
        onClick={() => applySize('90')}
        title="Decrease text size (92%)"
        aria-label="Decrease text size"
        style={{
          background: size === '90' ? 'rgba(255, 255, 255, 0.28)' : 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          color: '#FFFFFF',
          fontWeight: 600,
          padding: '2px 7px',
          borderRadius: '4px',
          fontSize: '11px',
          cursor: 'pointer'
        }}
      >
        A-
      </button>
      <button
        type="button"
        onClick={() => applySize('100')}
        title="Default text size (100%)"
        aria-label="Normal text size"
        style={{
          background: size === '100' ? 'rgba(255, 255, 255, 0.28)' : 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          color: '#FFFFFF',
          fontWeight: 600,
          padding: '2px 7px',
          borderRadius: '4px',
          fontSize: '11px',
          cursor: 'pointer'
        }}
      >
        A
      </button>
      <button
        type="button"
        onClick={() => applySize('115')}
        title="Increase text size (106%)"
        aria-label="Increase text size"
        style={{
          background: size === '115' ? 'rgba(255, 255, 255, 0.28)' : 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          color: '#FFFFFF',
          fontWeight: 600,
          padding: '2px 7px',
          borderRadius: '4px',
          fontSize: '11px',
          cursor: 'pointer'
        }}
      >
        A+
      </button>
    </div>
  );
};

// ── 3. High Contrast Toggle ──
export const ContrastToggle: React.FC = () => {
  const [isHighContrast, setIsHighContrast] = useState<boolean>(() => {
    return localStorage.getItem('nivaran_contrast') === 'high';
  });

  const toggle = () => {
    const nextVal = !isHighContrast;
    setIsHighContrast(nextVal);
    localStorage.setItem('nivaran_contrast', nextVal ? 'high' : 'standard');
    if (nextVal) {
      document.documentElement.setAttribute('data-contrast', 'high');
    } else {
      document.documentElement.removeAttribute('data-contrast');
    }
  };

  useEffect(() => {
    if (isHighContrast) {
      document.documentElement.setAttribute('data-contrast', 'high');
    } else {
      document.documentElement.removeAttribute('data-contrast');
    }
  }, [isHighContrast]);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isHighContrast}
      title="Toggle high contrast accessibility mode"
      style={{
        background: isHighContrast ? '#FFFF00' : 'rgba(255, 255, 255, 0.15)',
        color: isHighContrast ? '#000000' : '#FFFFFF',
        fontWeight: 600,
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: 'var(--fs-xs)',
        cursor: 'pointer',
        border: '1px solid rgba(255, 255, 255, 0.3)'
      }}
    >
      {isHighContrast ? 'Standard Contrast' : 'High Contrast'}
    </button>
  );
};
