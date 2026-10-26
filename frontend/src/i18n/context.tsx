// ==========================================================================
// NIVARAN · i18n Context & Provider (context.tsx)
// Persisted in localStorage, updates document lang attribute
// ==========================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from './en';
import { hi } from './hi';

export type Language = 'en' | 'hi';

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: typeof en;
}

const I18nContext = createContext<I18nContextType | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('nivaran_lang');
    return (saved === 'hi' || saved === 'en') ? saved : 'en';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('nivaran_lang', newLang);
    document.documentElement.setAttribute('lang', newLang);
  };

  useEffect(() => {
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  const t = lang === 'hi' ? hi : en;

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export function useI18n(): I18nContextType {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return ctx;
}
