// src/context/LanguageContext.tsx
'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations, defaultLanguage, supportedLanguages, type SupportedLanguage, type TranslationKey, type TranslationVariables } from '@/lib/i18n';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: TranslationKey, variables?: TranslationVariables) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(defaultLanguage);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedLang = localStorage.getItem('appLanguage') as SupportedLanguage;
      if (storedLang && supportedLanguages.includes(storedLang)) {
        setLanguageState(storedLang);
      } else {
        // If no language is stored, set the default one in localStorage
        localStorage.setItem('appLanguage', defaultLanguage);
      }
    }
  }, []);

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    if (supportedLanguages.includes(lang)) {
      setLanguageState(lang);
      if (typeof window !== 'undefined') {
        localStorage.setItem('appLanguage', lang);
      }
    }
  }, []);

  const t = useCallback((key: TranslationKey, variables?: TranslationVariables): string => {
    const langTranslations = translations[language] || translations[defaultLanguage];
    const defaultLangTranslations = translations[defaultLanguage];
    let translatedString = langTranslations[key] || defaultLangTranslations[key] || String(key); // Fallback to the key itself

    if (variables && typeof variables === 'object' && Object.keys(variables).length > 0) {
      Object.keys(variables).forEach((variableKey) => {
        // Escape curly braces for literal matching and ensure variableKey is a simple string
        const escapedVariableKey = variableKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\{${escapedVariableKey}\\}`, 'g');
        translatedString = translatedString.replace(regex, String(variables[variableKey]));
      });
    }
    return translatedString;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
