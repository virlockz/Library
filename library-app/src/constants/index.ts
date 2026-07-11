import { ThemeName } from '../types';

export const APP_NAME = 'My Library';

export const STORAGE_KEYS = {
  LIBRARY: 'library',
  APP_THEME: 'app_theme',
  getPageKey: (bookId: string) => `page_${bookId}`,
  getThemeKey: (bookId: string) => `theme_${bookId}`,
  getNotesKey: (bookId: string) => `notes_${bookId}`,
  getHighlightsKey: (bookId: string) => `highlights_${bookId}`,
  getBookmarksKey: (bookId: string) => `bookmarks_${bookId}`,
  getReadingSettingsKey: () => `reading_settings`,
  getReadingStatsKey: () => `reading_stats`,
  getRecentlyOpenedKey: () => `recently_opened`,
  getCollectionsKey: () => `collections`,
};

export const THEMES = ['parchment', 'modern', 'current', 'veil', 'apple'] as const;

export const THEME_AVAILABILITY: Record<ThemeName, ThemeName[]> = {
  parchment: ['parchment', 'modern'],
  modern: ['parchment', 'modern'],
  current: ['parchment', 'current'],
  veil: ['parchment', 'veil'],
  apple: ['apple', 'parchment'],
};

export const THEME_LABELS: Record<ThemeName, string> = {
  parchment: '🕯 Parchment',
  modern: '✦ Modern',
  current: '◆ Current',
  veil: '✧ Veil',
  apple: '🍎 Clean',
};

export const HIGHLIGHT_COLORS = ['yellow', 'green', 'pink', 'blue'] as const;

export const SUPPORTED_EXTENSIONS = ['.pdf', '.epub', '.txt', '.md'];
