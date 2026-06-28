export const APP_NAME = 'My Library';

export const STORAGE_KEYS = {
  LIBRARY: 'library',
  APP_THEME: 'app_theme',
  getPageKey: (bookId: string) => `page_${bookId}`,
  getThemeKey: (bookId: string) => `theme_${bookId}`,
  getNotesKey: (bookId: string) => `notes_${bookId}`,
  getHighlightsKey: (bookId: string) => `highlights_${bookId}`,
};

export const THEMES = ['parchment', 'modern', 'current', 'veil'] as const;

export const THEME_AVAILABILITY: Record<string, string[]> = {
  parchment: ['parchment', 'modern'],
  modern: ['parchment', 'modern'],
  current: ['parchment', 'current'],
  veil: ['parchment', 'veil'],
};

export const THEME_LABELS: Record<string, string> = {
  parchment: '🕯 Parchment',
  modern: '✦ Modern',
  current: '◆ Current',
  veil: '✧ Veil',
};

export const HIGHLIGHT_COLORS = ['yellow', 'green', 'pink', 'blue'] as const;

export const SUPPORTED_EXTENSIONS = ['.pdf', '.epub', '.txt', '.md'];
