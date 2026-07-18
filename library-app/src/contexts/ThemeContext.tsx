import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance, Platform } from 'react-native';
import { ThemeName } from '../types';
import { THEME_TOKENS, ThemeTokens } from '../themes/tokens';
import { STORAGE_KEYS } from '../constants';

export type ThemeMode = 'manual' | 'auto-night' | 'device';

interface ThemeContextType {
  theme: ThemeName;
  tokens: ThemeTokens;
  themeMode: ThemeMode;
  setTheme: (theme: ThemeName) => void;
  setThemeMode: (mode: ThemeMode) => void;
  cycleTheme: (availableThemes: ThemeName[]) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemTheme(): ThemeName {
  const colorScheme = Appearance.getColorScheme();
  return colorScheme === 'dark' ? 'dark' : 'light';
}

function getAutoNightTheme(): ThemeName {
  const hour = new Date().getHours();
  // Night mode from 7 PM to 7 AM
  return (hour >= 19 || hour < 7) ? 'night' : 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [manualTheme, setManualThemeState] = useState<ThemeName>('light');
  const [themeMode, setThemeModeState] = useState<ThemeMode>('manual');

  // Resolve the actual theme based on mode
  const getResolvedTheme = useCallback((mode: ThemeMode, manual: ThemeName): ThemeName => {
    switch (mode) {
      case 'auto-night':
        return getAutoNightTheme();
      case 'device':
        return getSystemTheme();
      default:
        return manual;
    }
  }, []);

  const theme = getResolvedTheme(themeMode, manualTheme);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.APP_THEME).then((saved) => {
      if (saved && THEME_TOKENS[saved as ThemeName]) {
        setManualThemeState(saved as ThemeName);
      }
    });
    AsyncStorage.getItem('theme_mode').then((saved) => {
      if (saved && ['manual', 'auto-night', 'device'].includes(saved)) {
        setThemeModeState(saved as ThemeMode);
      }
    });
  }, []);

  // Listen for system appearance changes in device mode
  useEffect(() => {
    if (themeMode !== 'device') return;
    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      // Force re-render by toggling a state
      setThemeModeState((prev) => prev);
    });
    return () => listener.remove();
  }, [themeMode]);

  // Update theme when auto-night timer ticks
  useEffect(() => {
    if (themeMode !== 'auto-night') return;
    const interval = setInterval(() => {
      // Force re-check by toggling state
      setThemeModeState((prev) => prev);
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [themeMode]);

  const setTheme = (t: ThemeName) => {
    setManualThemeState(t);
    AsyncStorage.setItem(STORAGE_KEYS.APP_THEME, t);
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    AsyncStorage.setItem('theme_mode', mode);
  };

  const cycleTheme = (available: ThemeName[]) => {
    const idx = available.indexOf(manualTheme);
    const next = available[(idx + 1) % available.length];
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, tokens: THEME_TOKENS[theme], themeMode, setTheme, setThemeMode, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
