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
}

export const THEME_TOKENS: Record<ThemeName, ThemeTokens> = {
  parchment: {
    bg: '#F5F0E8',
    page: '#FBF7EF',
    text: '#2C2416',
    text2: '#5C4A2A',
    accent: '#8B4513',
    accentDim: 'rgba(139,69,19,0.12)',
    border: '#C8A96E',
    borderMid: '#C8A96E',
    tab: '#E8DFC8',
  },
  modern: {
    bg: '#1C1B19',
    page: '#242320',
    text: '#F0EDE6',
    text2: '#7A7870',
    accent: '#C96442',
    accentDim: 'rgba(201,100,66,0.15)',
    border: 'rgba(255,255,255,0.08)',
    borderMid: 'rgba(255,255,255,0.13)',
    tab: '#1C1B19',
  },
  current: {
    bg: '#0D1F2D',
    page: '#112233',
    text: '#E8F4F8',
    text2: '#5B8FA8',
    accent: '#00C2CC',
    accentDim: 'rgba(0,194,204,0.12)',
    border: 'rgba(0,194,204,0.15)',
    borderMid: 'rgba(0,194,204,0.25)',
    tab: '#0A1A26',
  },
  veil: {
    bg: '#0D0B14',
    page: '#14111E',
    text: '#D8D4E8',
    text2: '#6E6880',
    accent: '#B8962E',
    accentDim: 'rgba(184,150,46,0.14)',
    border: 'rgba(255,255,255,0.07)',
    borderMid: 'rgba(255,255,255,0.12)',
    tab: '#100E18',
  },
  apple: {
    bg: '#000000',
    page: '#1C1C1E',
    text: '#FFFFFF',
    text2: '#8E8E93',
    accent: '#FF6B35',
    accentDim: 'rgba(255,107,53,0.12)',
    border: 'rgba(255,255,255,0.08)',
    borderMid: 'rgba(255,255,255,0.15)',
    tab: '#1C1C1E',
  },
};

export const THEME_COLORS: Record<ThemeName, { accent: string; bg: string }> = {
  parchment: { accent: '#8B4513', bg: '#F5F0E8' },
  modern: { accent: '#C96442', bg: '#1C1B19' },
  current: { accent: '#00C2CC', bg: '#0D1F2D' },
  veil: { accent: '#B8962E', bg: '#0D0B14' },
  apple: { accent: '#FF6B35', bg: '#000000' },
};
