import { ThemeName } from '../types';

export interface ThemeTokens {
  bg: string;
  page: string;
  text: string;
  text2: string;
  accent: string;
  accentDim: string;
  border: string;
  borderMid: string;
  tab: string;
  barBg: string;
  searchBg: string;
}

export const THEME_TOKENS: Record<ThemeName, ThemeTokens> = {
  light: {
    bg: '#FFFFFF',
    page: '#FFFFFF',
    text: '#000000',
    text2: '#8E8E93',
    accent: '#007AFF',
    accentDim: 'rgba(0,122,255,0.08)',
    border: '#E5E5EA',
    borderMid: '#C6C6C8',
    tab: '#F2F2F7',
    barBg: 'rgba(242,242,247,0.85)',
    searchBg: 'rgba(118,118,128,0.12)',
  },
  sepia: {
    bg: '#F5E6C8',
    page: '#F8F1E3',
    text: '#000000',
    text2: '#8B7355',
    accent: '#007AFF',
    accentDim: 'rgba(0,122,255,0.08)',
    border: '#D4C4A8',
    borderMid: '#C0A882',
    tab: '#EDE0C8',
    barBg: 'rgba(237,224,200,0.85)',
    searchBg: 'rgba(139,115,85,0.12)',
  },
  dark: {
    bg: '#000000',
    page: '#1C1C1E',
    text: '#FFFFFF',
    text2: '#EBEBF5',
    accent: '#0A84FF',
    accentDim: 'rgba(10,132,255,0.12)',
    border: '#38383A',
    borderMid: '#48484A',
    tab: '#1C1C1E',
    barBg: 'rgba(28,28,30,0.85)',
    searchBg: 'rgba(118,118,128,0.24)',
  },
  night: {
    bg: '#000000',
    page: '#121212',
    text: '#BEBEBE',
    text2: '#636366',
    accent: '#0A84FF',
    accentDim: 'rgba(10,132,255,0.10)',
    border: '#1C1C1E',
    borderMid: '#2C2C2E',
    tab: '#000000',
    barBg: 'rgba(0,0,0,0.85)',
    searchBg: 'rgba(118,118,128,0.24)',
  },
};

export const THEME_COLORS: Record<ThemeName, { accent: string; bg: string }> = {
  light: { accent: '#007AFF', bg: '#FFFFFF' },
  sepia: { accent: '#007AFF', bg: '#F5E6C8' },
  dark: { accent: '#0A84FF', bg: '#000000' },
  night: { accent: '#0A84FF', bg: '#000000' },
};
