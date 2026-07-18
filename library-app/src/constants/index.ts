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

export const THEMES = ['light', 'sepia', 'dark', 'night'] as const;

export const THEME_AVAILABILITY: Record<ThemeName, ThemeName[]> = {
  light: ['light', 'sepia', 'dark', 'night'],
  sepia: ['light', 'sepia', 'dark', 'night'],
  dark: ['light', 'sepia', 'dark', 'night'],
  night: ['light', 'sepia', 'dark', 'night'],
};

export const THEME_LABELS: Record<ThemeName, string> = {
  light: 'Light',
  sepia: 'Sepia',
  dark: 'Dark',
  night: 'Night',
};

export const HIGHLIGHT_COLORS = ['yellow', 'green', 'blue', 'pink', 'purple'] as const;

export const SUPPORTED_EXTENSIONS = ['.pdf', '.epub', '.txt', '.md'];
