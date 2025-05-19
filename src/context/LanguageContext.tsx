// src/context/LanguageContext.tsx
'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations, defaultLanguage, supportedLanguages, type SupportedLanguage, type TranslationKey, type TranslationVariables } from '@/lib/i18n';

const USER_LANGUAGE_KEY = 'appLanguage';
const ADMIN_GLOBAL_LANGUAGE_KEY = 'adminGlobalAppLanguage';

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
      const userStoredLang = localStorage.getItem(USER_LANGUAGE_KEY) as SupportedLanguage;
      const adminStoredGlobalLang = localStorage.getItem(ADMIN_GLOBAL_LANGUAGE_KEY) as SupportedLanguage;

      let effectiveLang = defaultLanguage; // Fallback to hardcoded default

      if (userStoredLang && supportedLanguages.includes(userStoredLang)) {
        effectiveLang = userStoredLang; // User's preference takes highest priority
      } else if (adminStoredGlobalLang && supportedLanguages.includes(adminStoredGlobalLang)) {
        effectiveLang = adminStoredGlobalLang; // Admin's global setting is next
        localStorage.setItem(USER_LANGUAGE_KEY, effectiveLang); // Set this as the user's preference if they had none
      } else {
        // No user preference, no admin global preference, use hardcoded default
        localStorage.setItem(USER_LANGUAGE_KEY, defaultLanguage); // And store it as user's preference
      }
      setLanguageState(effectiveLang);
    }
  }, []);

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    if (supportedLanguages.includes(lang)) {
      setLanguageState(lang);
      if (typeof window !== 'undefined') {
        localStorage.setItem(USER_LANGUAGE_KEY, lang); // Always update the user's specific preference
      }
    }
  }, []);

  const t = useCallback((key: TranslationKey, variables?: TranslationVariables): string => {
    const langTranslations = translations[language] || translations[defaultLanguage];
    const defaultLangTranslations = translations[defaultLanguage];
    let translatedString = langTranslations[key] || defaultLangTranslations[key] || String(key); 

    if (variables && typeof variables === 'object' && Object.keys(variables).length > 0) {
      Object.keys(variables).forEach((variableKey) => {
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
