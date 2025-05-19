// src/context/SchoolNameContext.tsx
'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const DEFAULT_SCHOOL_NAME = "My School"; // Default if nothing is set
const LOCAL_STORAGE_KEY = 'appSchoolName';

interface SchoolNameContextType {
  schoolName: string;
  setSchoolName: (name: string) => void;
}

const SchoolNameContext = createContext<SchoolNameContextType | undefined>(undefined);

export const SchoolNameProvider = ({ children }: { children: ReactNode }) => {
  const [schoolName, setSchoolNameState] = useState<string>(DEFAULT_SCHOOL_NAME);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedName) {
        setSchoolNameState(storedName);
      } else {
        // If no name is stored, set the default one in localStorage
        localStorage.setItem(LOCAL_STORAGE_KEY, DEFAULT_SCHOOL_NAME);
        setSchoolNameState(DEFAULT_SCHOOL_NAME);
      }
    }
  }, []);

  const setSchoolName = useCallback((name: string) => {
    const newName = name.trim() === "" ? DEFAULT_SCHOOL_NAME : name;
    setSchoolNameState(newName);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, newName);
    }
  }, []);

  return (
    <SchoolNameContext.Provider value={{ schoolName, setSchoolName }}>
      {children}
    </SchoolNameContext.Provider>
  );
};

export const useSchoolName = (): SchoolNameContextType => {
  const context = useContext(SchoolNameContext);
  if (!context) {
    throw new Error('useSchoolName must be used within a SchoolNameProvider');
  }
  return context;
};
