export interface Book {
  id: string;
  title: string;
  sourceType: 'pdf' | 'epub' | 'txt' | 'md' | 'pasted';
  filePath: string;
  addedAt: string;
  defaultTheme: ThemeName;
  chapters: Chapter[];
  pageCount: number;
  coverImage?: string;
}

export interface Chapter {
  id: string;
  title: string;
  label: string;
  pages: Page[];
}

export interface Page {
  heading: string;
  label: string;
  body: string;
}

export type ThemeName = 'parchment' | 'modern' | 'current' | 'veil' | 'apple';

export interface Note {
  id: string;
  type: 'page' | 'chapter' | 'book';
  text: string;
  bookId: string;
  chapterId: string;
  chapterTitle: string;
  pageLabel: string | null;
  pageIndex: number;
  date: string;
}

export interface Highlight {
  color: 'yellow' | 'green' | 'pink' | 'blue';
  text: string;
  pageIndex: number;
}

export interface HighlightsMap {
  [pageIndex: number]: Highlight[];
}

export interface Bookmark {
  id: string;
  pageIndex: number;
  label: string;
  date: string;
}
