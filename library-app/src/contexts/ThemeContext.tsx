import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeName } from '../types';
import { THEME_TOKENS, ThemeTokens } from '../themes/tokens';
import { STORAGE_KEYS } from '../constants';

interface ThemeContextType {
  theme: ThemeName;
  tokens: ThemeTokens;
  setTheme: (theme: ThemeName) => void;
  cycleTheme: (availableThemes: ThemeName[]) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>('apple');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.APP_THEME).then((saved) => {
      if (saved && THEME_TOKENS[saved as ThemeName]) {
        setThemeState(saved as ThemeName);
      }
    });
  }, []);

  const setTheme = (t: ThemeName) => {
    setThemeState(t);
    AsyncStorage.setItem(STORAGE_KEYS.APP_THEME, t);
  };

  const cycleTheme = (available: ThemeName[]) => {
    const idx = available.indexOf(theme);
    const next = available[(idx + 1) % available.length];
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, tokens: THEME_TOKENS[theme], setTheme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
