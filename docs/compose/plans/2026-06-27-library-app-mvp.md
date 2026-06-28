# Library App — MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a cross-platform mobile book reader (Android + iOS) that imports PDF/EPUB/TXT/MD files and pasted text, renders them with 4 themed views, supports offline reading with notes/highlights, and persists reading position.

**Architecture:** React Native + Expo app with file-based routing (expo-router). Books stored locally via expo-file-system. Metadata, notes, highlights, and reading positions in AsyncStorage. PDFs rendered as page images via react-native-pdf. EPUBs unzipped and parsed to HTML, rendered in WebView with injected theme CSS. TXT/MD rendered as styled text.

**Tech Stack:** Expo SDK 53, React Native 0.79, TypeScript, expo-router, react-native-pdf, expo-file-system, expo-document-picker, AsyncStorage, WebView (for EPUB)

---

## File Structure

```
library-app/
├── app/
│   ├── _layout.tsx                    # Root layout: ThemeProvider + LibraryProvider
│   ├── (tabs)/
│   │   ├── _layout.tsx                # Tab navigator: Library tab
│   │   └── index.tsx                  # Library screen (book grid + All Notes)
│   └── reader/
│       ├── [id].tsx                   # Reader screen (page view + notes view)
│       └── notes/[id].tsx             # Book notes detail screen
├── src/
│   ├── components/
│   │   ├── BookCard.tsx               # Library grid book card
│   │   ├── ThemeToggle.tsx            # Theme cycle button
│   │   ├── ChapterNav.tsx             # Horizontal scrollable chapter pills
│   │   ├── PageSpread.tsx             # PDF page display with flip zones
│   │   ├── TextReader.tsx             # Scrollable text reader (EPUB/TXT/MD)
│   │   ├── NoteModal.tsx              # Add note overlay modal
│   │   ├── NoteCard.tsx               # Note display card
│   │   └── HighlightToolbar.tsx       # Color swatch toolbar on text selection
│   ├── contexts/
│   │   ├── ThemeContext.tsx            # Theme state + persistence
│   │   └── LibraryContext.tsx          # Library state + CRUD
│   ├── hooks/
│   │   ├── useReadingPosition.ts      # Per-book page position save/restore
│   │   ├── useNotes.ts                # Notes CRUD per book
│   │   └── useHighlights.ts           # Highlights CRUD per book
│   ├── services/
│   │   ├── storage.ts                 # AsyncStorage get/set/remove helpers
│   │   ├── fileImport.ts              # Document picker + format detection
│   │   ├── epubParser.ts              # EPUB ZIP → chapter HTML array
│   │   └── textProcessor.ts           # TXT/MD → HTML conversion
│   ├── themes/
│   │   ├── tokens.ts                  # Color token definitions per theme
│   │   └── ThemeContext.tsx            # (exported from contexts/)
│   ├── types/
│   │   └── index.ts                   # Book, Chapter, Page, Note, Highlight types
│   └── constants/
│       └── index.ts                   # App name, storage keys, defaults
├── assets/
│   └── fonts/                         # EB Garamond + Lato (bundled)
├── app.json                           # Expo config
├── package.json
└── tsconfig.json
```

---

## Global Constraints

- All 4 themes (Parchment, Modern, Current, Veil) must use token-based colors from `tokens.ts` — no hardcoded hex in components
- Two font families only: EB Garamond (serif, reading content) and Lato (sans, UI chrome)
- All user data persisted in AsyncStorage (keys: `library`, `page_{id}`, `theme_{id}`, `notes_{id}`, `highlights_{id}`)
- Books stored in `FileSystem.documentDirectory` as `{bookId}/` directories
- Minimum iOS 15, Android 8 (API 26)
- TypeScript strict mode

---

### Task 1: Project Setup + Dependencies

**Covers:** Foundation scaffolding

**Files:**
- Create: `library-app/` (Expo project root)
- Create: `library-app/package.json`
- Create: `library-app/app.json`
- Create: `library-app/tsconfig.json`
- Create: `library-app/app/_layout.tsx`
- Create: `library-app/app/(tabs)/_layout.tsx`
- Create: `library-app/app/(tabs)/index.tsx`
- Create: `library-app/src/types/index.ts`
- Create: `library-app/src/constants/index.ts`

- [ ] **Step 1: Create Expo project**

```bash
cd C:\Users\W\Desktop\Book
npx create-expo-app@latest library-app --template tabs
cd library-app
```

- [ ] **Step 2: Install dependencies**

```bash
npx expo install expo-file-system expo-document-picker @react-native-async-storage/async-storage react-native-pdf react-native-webview expo-font expo-splash-screen
npm install jszip marked
```

- [ ] **Step 3: Create type definitions**

Create `library-app/src/types/index.ts`:

```typescript
export interface Book {
  id: string;
  title: string;
  sourceType: 'pdf' | 'epub' | 'txt' | 'md' | 'pasted';
  filePath: string;
  addedAt: string;
  defaultTheme: ThemeName;
  chapters: Chapter[];
  pageCount: number;
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
  body: string; // HTML content
}

export type ThemeName = 'parchment' | 'modern' | 'current' | 'veil';

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

export interface LibraryState {
  books: Book[];
}
```

- [ ] **Step 4: Create constants**

Create `library-app/src/constants/index.ts`:

```typescript
export const APP_NAME = 'My Library';

export const STORAGE_KEYS = {
  LIBRARY: 'library',
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
```

- [ ] **Step 5: Create root layout**

Create `library-app/app/_layout.tsx`:

```tsx
import { Stack } from 'expo-router';
import { LibraryProvider } from '../src/contexts/LibraryContext';
import { ThemeProvider } from '../src/contexts/ThemeContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <LibraryProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </LibraryProvider>
    </ThemeProvider>
  );
}
```

- [ ] **Step 6: Create tab layout**

Create `library-app/app/(tabs)/_layout.tsx`:

```tsx
import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Library',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📖</Text>,
        }}
      />
    </Tabs>
  );
}
```

- [ ] **Step 7: Create placeholder screens**

Create `library-app/app/(tabs)/index.tsx`:

```tsx
import { View, Text, StyleSheet } from 'react-native';

export default function LibraryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📖 My Library</Text>
      <Text style={styles.sub}>Your books will appear here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontFamily: 'EBGaramond-Bold', marginBottom: 8 },
  sub: { fontSize: 14, fontFamily: 'Lato', opacity: 0.6 },
});
```

- [ ] **Step 8: Verify project runs**

```bash
npx expo start
```

Expected: Expo dev server starts, app loads with placeholder screen.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: scaffold Expo project with types, constants, and root layout"
```

---

### Task 2: Theme System

**Covers:** All 4 themes (Parchment, Modern, Current, Veil) with token-based colors

**Files:**
- Create: `library-app/src/themes/tokens.ts`
- Create: `library-app/src/contexts/ThemeContext.tsx`
- Modify: `library-app/app/_layout.tsx`

**Interfaces:**
- Produces: `ThemeContext` with `theme`, `setTheme`, `cycleTheme(availableThemes)`

- [ ] **Step 1: Create theme tokens**

Create `library-app/src/themes/tokens.ts`:

```typescript
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
};

export const THEME_COLORS: Record<ThemeName, { accent: string; bg: string }> = {
  parchment: { accent: '#8B4513', bg: '#F5F0E8' },
  modern: { accent: '#C96442', bg: '#1C1B19' },
  current: { accent: '#00C2CC', bg: '#0D1F2D' },
  veil: { accent: '#B8962E', bg: '#0D0B14' },
};
```

- [ ] **Step 2: Create ThemeContext**

Create `library-app/src/contexts/ThemeContext.tsx`:

```tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeName } from '../types';
import { THEME_TOKENS, ThemeTokens } from '../themes/tokens';
import { STORAGE_KEYS, THEME_AVAILABILITY } from '../constants';

interface ThemeContextType {
  theme: ThemeName;
  tokens: ThemeTokens;
  setTheme: (theme: ThemeName) => void;
  cycleTheme: (available: ThemeName[]) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>('parchment');

  useEffect(() => {
    AsyncStorage.getItem('app_theme').then((saved) => {
      if (saved && THEME_TOKENS[saved as ThemeName]) {
        setThemeState(saved as ThemeName);
      }
    });
  }, []);

  const setTheme = (t: ThemeName) => {
    setThemeState(t);
    AsyncStorage.setItem('app_theme', t);
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
```

- [ ] **Step 3: Update root layout to wrap providers**

Modify `library-app/app/_layout.tsx` to import and wrap with `ThemeProvider`.

- [ ] **Step 4: Create ThemeToggle component**

Create `library-app/src/components/ThemeToggle.tsx`:

```tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { THEME_LABELS } from '../constants';
import { ThemeName } from '../types';

interface Props {
  availableThemes: ThemeName[];
}

export function ThemeToggle({ availableThemes }: Props) {
  const { theme, cycleTheme, tokens } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.button, { borderColor: tokens.border, backgroundColor: tokens.accentDim }]}
      onPress={() => cycleTheme(availableThemes)}
    >
      <Text style={[styles.label, { color: tokens.accent }]}>
        {THEME_LABELS[theme]}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  label: {
    fontFamily: 'Lato-Bold',
    fontSize: 13,
  },
});
```

- [ ] **Step 5: Verify theme toggling works**

Add a temporary `ThemeToggle` to the placeholder library screen and verify it cycles through themes.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add theme system with 4 themes and ThemeContext"
```

---

### Task 3: Storage Service + Library Context

**Covers:** Local persistence, library state management

**Files:**
- Create: `library-app/src/services/storage.ts`
- Create: `library-app/src/contexts/LibraryContext.tsx`

**Interfaces:**
- Produces: `storage.get/set/remove`, `LibraryContext` with `books`, `addBook`, `removeBook`

- [ ] **Step 1: Create storage service**

Create `library-app/src/services/storage.ts`:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  async get<T>(key: string): Promise<T | null> {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  },

  async set<T>(key: string, value: T): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },

  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },
};
```

- [ ] **Step 2: Create LibraryContext**

Create `library-app/src/contexts/LibraryContext.tsx`:

```tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as FileSystem from 'expo-file-system';
import { Book } from '../types';
import { storage } from '../services/storage';
import { STORAGE_KEYS } from '../constants';

interface LibraryContextType {
  books: Book[];
  loading: boolean;
  addBook: (book: Book) => Promise<void>;
  removeBook: (bookId: string) => Promise<void>;
  getBook: (bookId: string) => Book | undefined;
  refreshLibrary: () => Promise<void>;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshLibrary = useCallback(async () => {
    const saved = await storage.get<Book[]>(STORAGE_KEYS.LIBRARY);
    setBooks(saved || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshLibrary();
  }, [refreshLibrary]);

  const addBook = async (book: Book) => {
    const updated = [...books, book];
    setBooks(updated);
    await storage.set(STORAGE_KEYS.LIBRARY, updated);
  };

  const removeBook = async (bookId: string) => {
    const book = books.find((b) => b.id === bookId);
    if (book) {
      await FileSystem.deleteAsync(book.filePath, { imobilediskEphemeral: false }).catch(() => {});
    }
    const updated = books.filter((b) => b.id !== bookId);
    setBooks(updated);
    await storage.set(STORAGE_KEYS.LIBRARY, updated);
  };

  const getBook = (bookId: string) => books.find((b) => b.id === bookId);

  return (
    <LibraryContext.Provider value={{ books, loading, addBook, removeBook, getBook, refreshLibrary }}>
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary must be used within LibraryProvider');
  return ctx;
}
```

- [ ] **Step 3: Verify library persistence**

Add temporary buttons to add/remove a test book and verify it persists across app restarts.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add storage service and LibraryContext"
```

---

### Task 4: File Import Service

**Covers:** File picker, format detection, EPUB parsing, TXT/MD processing, paste text

**Files:**
- Create: `library-app/src/services/fileImport.ts`
- Create: `library-app/src/services/epubParser.ts`
- Create: `library-app/src/services/textProcessor.ts`

**Interfaces:**
- Consumes: `LibraryContext.addBook`, `FileSystem`, `DocumentPicker`
- Produces: `importFile()`, `importPastedText()`, `parseEpub()`, `processText()`

- [ ] **Step 1: Create EPUB parser**

Create `library-app/src/services/epubParser.ts`:

```typescript
import * as FileSystem from 'expo-file-system';
import JSZip from 'jszip';

interface EpubChapter {
  id: string;
  title: string;
  label: string;
  body: string;
}

export async function parseEpub(filePath: string): Promise<{ title: string; chapters: EpubChapter[] }> {
  const fileBase64 = await FileSystem.readAsStringAsync(filePath, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const zip = await JSZip.loadAsync(fileBase64, { base64: true });

  // Parse container.xml to find rootfile
  const containerXml = await zip.file('META-INF/container.xml')?.async('text');
  if (!containerXml) throw new Error('Invalid EPUB: missing container.xml');

  const rootfileMatch = containerXml.match(/full-path="([^"]+)"/);
  const rootfilePath = rootfileMatch?.[1] || 'OEBPS/content.opf';

  // Parse OPF manifest
  const opfContent = await zip.file(rootfilePath)?.async('text');
  if (!opfContent) throw new Error('Invalid EPUB: missing OPF file');

  const spineItems = [...opfContent.matchAll(/<item[^>]+id="([^"]+)"[^>]+href="([^"]+)"[^>]*\/>/g)];
  const spineOrder = [...opfContent.matchAll(/<itemref[^>]+idref="([^"]+)"/g)];

  const basePath = rootfilePath.substring(0, rootfilePath.lastIndexOf('/') + 1);

  const chapters: EpubChapter[] = [];
  let chapterIndex = 0;

  for (const match of spineOrder) {
    const itemId = match[1];
    const item = spineItems.find((i) => i[1] === itemId);
    if (!item) continue;

    const href = item[2];
    const fullPath = basePath + href;
    const file = zip.file(fullPath);
    if (!file) continue;

    const html = await file.async('text');
    // Extract text content from HTML, strip tags for display
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    const body = bodyMatch ? bodyMatch[1] : html;

    // Extract title from first h1/h2 or use filename
    const titleMatch = body.match(/<h[12][^>]*>([^<]+)<\/h[12]>/i);
    const title = titleMatch ? titleMatch[1].trim() : `Chapter ${chapterIndex + 1}`;

    chapters.push({
      id: `ch-${chapterIndex}`,
      title,
      label: `Chapter ${chapterIndex + 1}`,
      body: cleanHtml(body),
    });
    chapterIndex++;
  }

  // Try to get title from OPF
  const titleMatch = opfContent.match(/<dc:title[^>]*>([^<]+)<\/dc:title>/i);
  const title = titleMatch ? titleMatch[1].trim() : 'Untitled';

  return { title, chapters };
}

function cleanHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/\n\s*\n/g, '\n')
    .trim();
}
```

- [ ] **Step 2: Create text processor**

Create `library-app/src/services/textProcessor.ts`:

```typescript
import { marked } from 'marked';

export function processMarkdown(content: string): string {
  return marked.parse(content) as string;
}

export function processPlainText(content: string): string {
  return content
    .split('\n\n')
    .map((para) => `<p>${para.replace(/\n/g, '<br/>')}</p>`)
    .join('\n');
}

export function splitIntoPages(htmlContent: string, charsPerPage: number = 3000): string[] {
  // Split HTML content into pages at paragraph boundaries
  const paragraphs = htmlContent.split(/(?=<p>|<div|<h[1-6]|<ul|<ol)/gi);
  const pages: string[] = [];
  let currentPage = '';

  for (const para of paragraphs) {
    if (currentPage.length + para.length > charsPerPage && currentPage.length > 0) {
      pages.push(currentPage);
      currentPage = para;
    } else {
      currentPage += para;
    }
  }

  if (currentPage.trim()) {
    pages.push(currentPage);
  }

  return pages.length > 0 ? pages : ['<p>No content available.</p>'];
}
```

- [ ] **Step 3: Create file import service**

Create `library-app/src/services/fileImport.ts`:

```typescript
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Book, Chapter, Page, ThemeName } from '../types';
import { parseEpub } from './epubParser';
import { processMarkdown, processPlainText, splitIntoPages } from './textProcessor';
import { STORAGE_KEYS, THEME_AVAILABILITY } from '../constants';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function getDefaultTheme(ext: string): ThemeName {
  switch (ext) {
    case '.epub': return 'parchment';
    case '.pdf': return 'parchment';
    case '.md': return 'modern';
    case '.txt': return 'parchment';
    default: return 'parchment';
  }
}

function chaptersToPages(chapters: Chapter[]): Chapter[] {
  return chapters.map((ch) => ({
    ...ch,
    pages: ch.pages.length > 0 ? ch.pages : [{ heading: ch.title, label: ch.label, body: '<p>No content.</p>' }],
  }));
}

export async function importFile(): Promise<Book | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/pdf', 'application/epub+zip', 'text/plain', 'text/markdown', 'application/octet-stream'],
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets?.[0]) return null;

  const file = result.assets[0];
  const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  const bookId = generateId();
  const destDir = `${FileSystem.documentDirectory}${bookId}/`;

  await FileSystem.makeDirectoryAsync(destDir, { intermediates: true });
  await FileSystem.copyAsync({ from: file.uri, to: `${destDir}book${ext}` });

  const localPath = `${destDir}book${ext}`;
  let chapters: Chapter[] = [];
  let title = file.name.replace(/\.[^/.]+$/, '');

  switch (ext) {
    case '.epub': {
      const parsed = await parseEpub(localPath);
      title = parsed.title;
      chapters = chaptersToPages(
        parsed.chapters.map((ch, i) => ({
          id: ch.id,
          title: ch.title,
          label: ch.label,
          pages: splitIntoPages(ch.body).map((body, pi) => ({
            heading: ch.title,
            label: `${ch.label} · Part ${pi + 1}`,
            body,
          })),
        }))
      );
      break;
    }
    case '.md': {
      const content = await FileSystem.readAsStringAsync(localPath);
      const html = processMarkdown(content);
      const pages = splitIntoPages(html);
      chapters = chaptersToPages([{
        id: 'chapter-1',
        title: title,
        label: 'Content',
        pages: pages.map((body, i) => ({
          heading: title,
          label: `Part ${i + 1}`,
          body,
        })),
      }]);
      break;
    }
    case '.txt':
    default: {
      const content = await FileSystem.readAsStringAsync(localPath);
      const html = processPlainText(content);
      const pages = splitIntoPages(html);
      chapters = chaptersToPages([{
        id: 'chapter-1',
        title: title,
        label: 'Content',
        pages: pages.map((body, i) => ({
          heading: title,
          label: `Part ${i + 1}`,
          body,
        })),
      }]);
      break;
    }
  }

  return {
    id: bookId,
    title,
    sourceType: ext === '.epub' ? 'epub' : ext === '.md' ? 'md' : ext === '.txt' ? 'txt' : 'pdf',
    filePath: localPath,
    addedAt: new Date().toISOString(),
    defaultTheme: getDefaultTheme(ext),
    chapters,
    pageCount: chapters.reduce((sum, ch) => sum + ch.pages.length, 0),
  };
}

export async function importPastedText(text: string, title: string): Promise<Book> {
  const bookId = generateId();
  const html = processPlainText(text);
  const pages = splitIntoPages(html);

  const book: Book = {
    id: bookId,
    title: title || 'Pasted Text',
    sourceType: 'pasted',
    filePath: '',
    addedAt: new Date().toISOString(),
    defaultTheme: 'parchment',
    chapters: [{
      id: 'chapter-1',
      title: title || 'Pasted Text',
      label: 'Content',
      pages: pages.map((body, i) => ({
        heading: title || 'Pasted Text',
        label: `Part ${i + 1}`,
        body,
      })),
    }],
    pageCount: pages.length,
  };

  return book;
}
```

- [ ] **Step 4: Verify file import works**

Test importing a .txt file and verify it creates a Book object with correct chapters/pages.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add file import service with EPUB, TXT, MD, and paste text support"
```

---

### Task 5: Library Screen

**Covers:** Book grid, import buttons, All Notes tab

**Files:**
- Modify: `library-app/app/(tabs)/index.tsx`
- Create: `library-app/src/components/BookCard.tsx`

**Interfaces:**
- Consumes: `useLibrary`, `useTheme`, `importFile`, `importPastedText`

- [ ] **Step 1: Create BookCard component**

Create `library-app/src/components/BookCard.tsx`:

```tsx
import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Book, ThemeName } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { THEME_COLORS } from '../themes/tokens';

interface Props {
  book: Book;
  onPress: () => void;
}

export function BookCard({ book, onPress }: Props) {
  const { tokens } = useTheme();
  const spineColor = THEME_COLORS[book.defaultTheme]?.accent || tokens.accent;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: tokens.page, borderColor: tokens.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.spine, { backgroundColor: spineColor }]} />
      <View style={styles.body}>
        <Text style={[styles.domain, { color: tokens.accent }]}>
          {book.sourceType.toUpperCase()}
        </Text>
        <Text style={[styles.title, { color: tokens.text }]} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={[styles.meta, { color: tokens.text2 }]}>
          {book.chapters.length} chapters · {book.pageCount} pages
        </Text>
        <Text style={[styles.open, { color: tokens.accent }]}>Open book →</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 22,
    flexDirection: 'row',
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  spine: {
    width: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  body: {
    flex: 1,
  },
  domain: {
    fontFamily: 'Lato-Bold',
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  title: {
    fontFamily: 'EBGaramond-SemiBold',
    fontSize: 20,
    lineHeight: 25,
    marginBottom: 8,
  },
  meta: {
    fontFamily: 'Lato',
    fontSize: 12,
    marginBottom: 12,
  },
  open: {
    fontFamily: 'Lato-Bold',
    fontSize: 12,
    letterSpacing: 0.5,
  },
});
```

- [ ] **Step 2: Build Library screen**

Replace `library-app/app/(tabs)/index.tsx` with full implementation:

```tsx
import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, TextInput, Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useLibrary } from '../../src/contexts/LibraryContext';
import { BookCard } from '../../src/components/BookCard';
import { ThemeToggle } from '../../src/components/ThemeToggle';
import { importFile, importPastedText } from '../../src/services/fileImport';
import { THEME_AVAILABILITY } from '../../src/constants';

export default function LibraryScreen() {
  const { tokens } = useTheme();
  const { books, addBook } = useLibrary();
  const router = useRouter();
  const [tab, setTab] = useState<'books' | 'notes'>('books');
  const [pasteModal, setPasteModal] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [pasteTitle, setPasteTitle] = useState('');

  const handleImport = async () => {
    Alert.alert('Import Book', 'Choose how to add a book', [
      { text: 'Pick File', onPress: async () => {
        const book = await importFile();
        if (book) await addBook(book);
      }},
      { text: 'Paste Text', onPress: () => setPasteModal(true) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handlePaste = async () => {
    if (!pasteText.trim()) return;
    const book = await importPastedText(pasteText, pasteTitle);
    await addBook(book);
    setPasteModal(false);
    setPasteText('');
    setPasteTitle('');
  };

  return (
    <View style={[styles.container, { backgroundColor: tokens.bg }]}>
      {/* Top Bar */}
      <View style={[styles.topbar, { backgroundColor: tokens.tab, borderBottomColor: tokens.border }]}>
        <Text style={[styles.wordmark, { color: tokens.accent }]}>📖 My Library</Text>
        <View style={styles.topbarControls}>
          <ThemeToggle availableThemes={['parchment', 'modern'] as any} />
        </View>
      </View>

      {/* Tab Bar */}
      <View style={[styles.tabBar, { borderBottomColor: tokens.border, backgroundColor: tokens.tab }]}>
        <TouchableOpacity
          style={[styles.tab, tab === 'books' && { borderBottomColor: tokens.accent }]}
          onPress={() => setTab('books')}
        >
          <Text style={[styles.tabText, { color: tab === 'books' ? tokens.accent : tokens.text2 }]}>
            📖 Books
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'notes' && { borderBottomColor: tokens.accent }]}
          onPress={() => setTab('notes')}
        >
          <Text style={[styles.tabText, { color: tab === 'notes' ? tokens.accent : tokens.text2 }]}>
            🗒 All Notes
          </Text>
        </TouchableOpacity>
      </View>

      {/* Books Panel */}
      {tab === 'books' && (
        <View style={styles.content}>
          <Text style={[styles.heading, { color: tokens.accent }]}>Your Books</Text>
          <Text style={[styles.sub, { color: tokens.text2 }]}>
            {books.length} {books.length === 1 ? 'book' : 'books'} · Import one to start reading
          </Text>
          <FlatList
            data={books}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <BookCard
                book={item}
                onPress={() => router.push(`/reader/${item.id}`)}
              />
            )}
            contentContainerStyle={styles.grid}
            ListEmptyComponent={
              <Text style={[styles.empty, { color: tokens.text2 }]}>
                No books yet. Tap + to import.
              </Text>
            }
          />
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: tokens.accent }]}
            onPress={handleImport}
          >
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* All Notes Panel */}
      {tab === 'notes' && (
        <View style={styles.content}>
          <Text style={[styles.heading, { color: tokens.accent }]}>All Notes</Text>
          <Text style={[styles.sub, { color: tokens.text2 }]}>
            Notes across your library, grouped by book
          </Text>
          <Text style={[styles.empty, { color: tokens.text2 }]}>
            Import a book and add notes to see them here.
          </Text>
        </View>
      )}

      {/* Paste Modal */}
      <Modal visible={pasteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: tokens.page, borderColor: tokens.border }]}>
            <Text style={[styles.modalTitle, { color: tokens.accent }]}>Paste Text</Text>
            <TextInput
              style={[styles.modalInput, { color: tokens.text2 }]}
              placeholder="Book title (optional)"
              placeholderTextColor={tokens.text2}
              value={pasteTitle}
              onChangeText={setPasteTitle}
            />
            <TextInput
              style={[styles.modalTextarea, { color: tokens.text, backgroundColor: tokens.bg, borderColor: tokens.border }]}
              placeholder="Paste your text here..."
              placeholderTextColor={tokens.text2}
              value={pasteText}
              onChangeText={setPasteText}
              multiline
              textAlignVertical="top"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: tokens.accent }]}
                onPress={handlePaste}
              >
                <Text style={styles.btnSaveText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, { borderColor: tokens.border }]}
                onPress={() => setPasteModal(false)}
              >
                <Text style={[styles.btnCancelText, { color: tokens.text2 }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topbar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderBottomWidth: 1,
  },
  wordmark: { fontFamily: 'EBGaramond-SemiBold', fontSize: 22, letterSpacing: 0.5 },
  topbarControls: { flexDirection: 'row', gap: 8 },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { padding: 11, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabText: { fontFamily: 'Lato-Bold', fontSize: 13, letterSpacing: 0.3 },
  content: { flex: 1, padding: 16 },
  heading: { fontFamily: 'EBGaramond-SemiBold', fontSize: 32, marginBottom: 6 },
  sub: { fontFamily: 'Lato', fontSize: 14, opacity: 0.6, marginBottom: 24 },
  grid: { paddingBottom: 100 },
  empty: { fontFamily: 'EBGaramond', fontSize: 16, fontStyle: 'italic', textAlign: 'center', marginTop: 60 },
  fab: {
    position: 'absolute', bottom: 24, right: 24, width: 56, height: 56,
    borderRadius: 28, justifyContent: 'center', alignItems: 'center',
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25, shadowRadius: 4,
  },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 30 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', padding: 16 },
  modalBox: { borderRadius: 12, padding: 24, borderWidth: 1 },
  modalTitle: { fontFamily: 'EBGaramond-SemiBold', fontSize: 20, marginBottom: 16 },
  modalInput: { borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 12, fontFamily: 'Lato' },
  modalTextarea: { borderWidth: 1, borderRadius: 8, padding: 12, minHeight: 150, fontFamily: 'EBGaramond', fontSize: 15, lineHeight: 24 },
  modalActions: { flexDirection: 'row', gap: 8, marginTop: 14 },
  btn: { flex: 1, borderRadius: 8, padding: 10, alignItems: 'center' },
  btnSaveText: { color: '#fff', fontFamily: 'Lato-Bold', fontSize: 14 },
  btnCancelText: { fontFamily: 'Lato-Bold', fontSize: 14 },
});
```

- [ ] **Step 3: Verify library screen renders**

App should show the library screen with import button and empty state.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: implement Library screen with book grid, import, and paste text"
```

---

### Task 6: Reading Position Persistence

**Covers:** Per-book page position save/restore

**Files:**
- Create: `library-app/src/hooks/useReadingPosition.ts`

**Interfaces:**
- Consumes: `STORAGE_KEYS`, `storage`
- Produces: `useReadingPosition(bookId)` → `{ position, savePosition }`

- [ ] **Step 1: Create useReadingPosition hook**

Create `library-app/src/hooks/useReadingPosition.ts`:

```typescript
import { useState, useEffect, useCallback } from 'react';
import { storage } from '../services/storage';
import { STORAGE_KEYS } from '../constants';

export function useReadingPosition(bookId: string) {
  const [position, setPosition] = useState(0);

  useEffect(() => {
    storage.get<number>(STORAGE_KEYS.getPageKey(bookId)).then((saved) => {
      if (saved !== null) setPosition(saved);
    });
  }, [bookId]);

  const savePosition = useCallback(async (page: number) => {
    setPosition(page);
    await storage.set(STORAGE_KEYS.getPageKey(bookId), page);
  }, [bookId]);

  return { position, savePosition };
}
```

- [ ] **Step 2: Verify position persistence**

Import a book, navigate to page 3, close and reopen the app, verify it resumes at page 3.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add reading position persistence hook"
```

---

### Task 7: Reader Screen — PDF View

**Covers:** PDF page-by-page rendering with swipe navigation

**Files:**
- Create: `library-app/app/reader/[id].tsx`
- Create: `library-app/src/components/PageSpread.tsx`
- Create: `library-app/src/components/ChapterNav.tsx`

**Interfaces:**
- Consumes: `useLibrary`, `useTheme`, `useReadingPosition`, `react-native-pdf`

- [ ] **Step 1: Create ChapterNav component**

Create `library-app/src/components/ChapterNav.tsx`:

```tsx
import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Chapter } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  chapters: Chapter[];
  activeChapterId: string;
  onSelect: (chapterId: string) => void;
}

export function ChapterNav({ chapters, activeChapterId, onSelect }: Props) {
  const { tokens } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[styles.container, { backgroundColor: tokens.bg, borderBottomColor: tokens.border }]}
      contentContainerStyle={styles.content}
    >
      {chapters.map((ch) => {
        const isActive = ch.id === activeChapterId;
        return (
          <TouchableOpacity
            key={ch.id}
            style={[
              styles.pill,
              {
                backgroundColor: isActive ? tokens.accent : tokens.accentDim,
                borderColor: isActive ? tokens.accent : tokens.border,
              },
            ]}
            onPress={() => onSelect(ch.id)}
          >
            <Text style={[styles.pillText, { color: isActive ? '#fff' : tokens.text2 }]}>
              {ch.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { borderBottomWidth: 1 },
  content: { flexDirection: 'row', gap: 6, padding: 10 },
  pill: {
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5,
    borderWidth: 1.5,
  },
  pillText: { fontFamily: 'Lato-Bold', fontSize: 12 },
});
```

- [ ] **Step 2: Create PageSpread component**

Create `library-app/src/components/PageSpread.tsx`:

```tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  pageNumber: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  children: React.ReactNode;
}

export function PageSpread({ pageNumber, totalPages, onPrev, onNext, children }: Props) {
  const { tokens, theme } = useTheme();

  return (
    <View style={[styles.spread, { backgroundColor: tokens.page, borderColor: tokens.border }]}>
      {/* Spine line */}
      <View style={[styles.spine, { backgroundColor: tokens.accent }]} />

      {/* Page content */}
      <View style={styles.content}>
        {children}
      </View>

      {/* Navigation */}
      <View style={styles.nav}>
        <TouchableOpacity
          style={[styles.navBtn, { borderColor: tokens.accent, backgroundColor: tokens.accentDim }]}
          onPress={onPrev}
          disabled={pageNumber <= 0}
        >
          <Text style={[styles.navBtnText, { color: pageNumber <= 0 ? tokens.text2 : tokens.accent }]}>
            ← Previous
          </Text>
        </TouchableOpacity>

        <Text style={[styles.indicator, { color: tokens.text2 }]}>
          Page {pageNumber + 1} of {totalPages}
        </Text>

        <TouchableOpacity
          style={[styles.navBtn, { borderColor: tokens.accent, backgroundColor: tokens.accentDim }]}
          onPress={onNext}
          disabled={pageNumber >= totalPages - 1}
        >
          <Text style={[styles.navBtnText, { color: pageNumber >= totalPages - 1 ? tokens.text2 : tokens.accent }]}>
            Next →
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  spread: {
    margin: 16, borderRadius: 4, minHeight: 500, borderWidth: 1,
    overflow: 'hidden',
  },
  spine: {
    position: 'absolute', left: 40, top: 0, bottom: 0, width: 1, opacity: 0.3,
  },
  content: { padding: 40, paddingBottom: 20, flex: 1 },
  nav: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: 16, padding: 12,
  },
  navBtn: { borderWidth: 1.5, borderRadius: 8, paddingHorizontal: 18, paddingVertical: 8 },
  navBtnText: { fontFamily: 'Lato-Bold', fontSize: 14 },
  indicator: { fontFamily: 'Lato', fontSize: 13 },
});
```

- [ ] **Step 3: Create Reader screen**

Create `library-app/app/reader/[id].tsx`:

```tsx
import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, GestureResponderEvent } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Pdf from 'react-native-pdf';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useLibrary } from '../../src/contexts/LibraryContext';
import { useReadingPosition } from '../../src/hooks/useReadingPosition';
import { ThemeToggle } from '../../src/components/ThemeToggle';
import { ChapterNav } from '../../src/components/ChapterNav';
import { PageSpread } from '../../src/components/PageSpread';
import { THEME_AVAILABILITY, THEME_LABELS } from '../../src/constants';
import { ThemeName, Chapter } from '../../src/types';

export default function ReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tokens, theme } = useTheme();
  const { getBook } = useLibrary();
  const { position, savePosition } = useReadingPosition(id!);
  const router = useRouter();

  const book = getBook(id!);
  if (!book) {
    return (
      <View style={[styles.container, { backgroundColor: tokens.bg }]}>
        <Text style={{ color: tokens.text }}>Book not found</Text>
      </View>
    );
  }

  const availableThemes = (THEME_AVAILABILITY[book.defaultTheme] || ['parchment', 'modern']) as ThemeName[];
  const [activeTab, setActiveTab] = useState<'read' | 'notes'>('read');
  const [activeChapter, setActiveChapter] = useState(book.chapters[0]?.id || '');
  const [currentPage, setCurrentPage] = useState(position);

  // Find current chapter from page index
  let pageIndex = 0;
  let currentChapter: Chapter | undefined;
  for (const ch of book.chapters) {
    if (currentPage < pageIndex + ch.pages.length) {
      currentChapter = ch;
      break;
    }
    pageIndex += ch.pages.length;
  }

  const handleChapterSelect = (chapterId: string) => {
    let pageIdx = 0;
    for (const ch of book.chapters) {
      if (ch.id === chapterId) {
        setCurrentPage(pageIdx);
        savePosition(pageIdx);
        break;
      }
      pageIdx += ch.pages.length;
    }
  };

  const handlePageChange = (delta: number) => {
    const newPage = currentPage + delta;
    if (newPage >= 0 && newPage < book.pageCount) {
      setCurrentPage(newPage);
      savePosition(newPage);
    }
  };

  // Get current page content
  let pageIdx = 0;
  let currentPageData = null;
  for (const ch of book.chapters) {
    for (const p of ch.pages) {
      if (pageIdx === currentPage) {
        currentPageData = { ...p, chapter: ch };
        break;
      }
      pageIdx++;
    }
    if (currentPageData) break;
  }

  return (
    <View style={[styles.container, { backgroundColor: tokens.bg }]}>
      {/* Top Bar */}
      <View style={[styles.topbar, { backgroundColor: tokens.tab, borderBottomColor: tokens.border }]}>
        <Text style={[styles.backBtn, { color: tokens.accent }]} onPress={() => router.back()}>
          ← Library
        </Text>
        <Text style={[styles.titleBar, { color: tokens.accent }]} numberOfLines={1}>
          {book.title}
        </Text>
        <ThemeToggle availableThemes={availableThemes} />
      </View>

      {/* Tab Bar */}
      <View style={[styles.tabBar, { borderBottomColor: tokens.border }]}>
        <Text
          style={[styles.tab, { color: activeTab === 'read' ? tokens.accent : tokens.text2 }]}
          onPress={() => setActiveTab('read')}
        >
          📖 Read
        </Text>
        <Text
          style={[styles.tab, { color: activeTab === 'notes' ? tokens.accent : tokens.text2 }]}
          onPress={() => setActiveTab('notes')}
        >
          🗒 Notes
        </Text>
      </View>

      {/* Chapter Nav */}
      {activeTab === 'read' && (
        <ChapterNav
          chapters={book.chapters}
          activeChapterId={currentChapter?.id || ''}
          onSelect={handleChapterSelect}
        />
      )}

      {/* Read View */}
      {activeTab === 'read' && currentPageData && (
        <ScrollView style={styles.scrollContent}>
          <PageSpread
            pageNumber={currentPage}
            totalPages={book.pageCount}
            onPrev={() => handlePageChange(-1)}
            onNext={() => handlePageChange(1)}
          >
            <Text style={[styles.chapterLabel, { color: tokens.accent }]}>
              {currentPageData.chapter?.label}
            </Text>
            <Text style={[styles.pageHeading, { color: tokens.accent }]}>
              {currentPageData.heading}
            </Text>
            <Text style={[styles.pageLabel, { color: tokens.text2 }]}>
              {currentPageData.label}
            </Text>
            <View style={styles.pageBody}>
              <Text style={[styles.bodyText, { color: tokens.text }]}>
                {currentPageData.body.replace(/<[^>]+>/g, '')}
              </Text>
            </View>
          </PageSpread>
        </ScrollView>
      )}

      {/* Notes View */}
      {activeTab === 'notes' && (
        <View style={styles.notesView}>
          <Text style={[styles.notesHeading, { color: tokens.accent }]}>
            Your Notes
          </Text>
          <Text style={[styles.emptyNotes, { color: tokens.text2 }]}>
            No notes yet. Use the floating button to add one.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topbar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 12, paddingHorizontal: 16, borderBottomWidth: 1,
  },
  backBtn: { fontFamily: 'Lato-Bold', fontSize: 13 },
  titleBar: { fontFamily: 'EBGaramond-SemiBold', fontSize: 17, flex: 1, textAlign: 'center', marginHorizontal: 8 },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { padding: 10, paddingHorizontal: 18, fontFamily: 'Lato-Bold', fontSize: 13 },
  scrollContent: { flex: 1 },
  chapterLabel: { fontFamily: 'Lato-Bold', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 },
  pageHeading: { fontFamily: 'EBGaramond-SemiBold', fontSize: 28, lineHeight: 34, marginBottom: 20, paddingBottom: 14, borderBottomWidth: 1 },
  pageLabel: { fontFamily: 'Lato', fontSize: 12, marginBottom: 16, fontStyle: 'italic' },
  pageBody: { marginTop: 8 },
  bodyText: { fontFamily: 'EBGaramond', fontSize: 17, lineHeight: 31 },
  notesView: { flex: 1, padding: 20 },
  notesHeading: { fontFamily: 'EBGaramond-SemiBold', fontSize: 24, marginBottom: 20 },
  emptyNotes: { fontFamily: 'EBGaramond', fontSize: 16, fontStyle: 'italic', textAlign: 'center', marginTop: 40 },
});
```

- [ ] **Step 4: Verify reader screen works**

Import a TXT file, open it, verify navigation and reading position save/restore.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: implement Reader screen with chapter nav, page spread, and position persistence"
```

---

### Task 8: Notes System

**Covers:** Create, view, delete notes (Page/Chapter/Book types)

**Files:**
- Create: `library-app/src/hooks/useNotes.ts`
- Create: `library-app/src/components/NoteModal.tsx`
- Create: `library-app/src/components/NoteCard.tsx`
- Modify: `library-app/app/reader/[id].tsx`

**Interfaces:**
- Consumes: `storage`, `STORAGE_KEYS`
- Produces: `useNotes(bookId)` → `{ notes, addNote, deleteNote }`

- [ ] **Step 1: Create useNotes hook**

Create `library-app/src/hooks/useNotes.ts`:

```typescript
import { useState, useEffect, useCallback } from 'react';
import { Note } from '../types';
import { storage } from '../services/storage';
import { STORAGE_KEYS } from '../constants';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function useNotes(bookId: string) {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    storage.get<Note[]>(STORAGE_KEYS.getNotesKey(bookId)).then((saved) => {
      if (saved) setNotes(saved);
    });
  }, [bookId]);

  const addNote = useCallback(async (note: Omit<Note, 'id' | 'date'>) => {
    const newNote: Note = {
      ...note,
      id: generateId(),
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    };
    const updated = [...notes, newNote];
    setNotes(updated);
    await storage.set(STORAGE_KEYS.getNotesKey(bookId), updated);
  }, [notes, bookId]);

  const deleteNote = useCallback(async (noteId: string) => {
    const updated = notes.filter((n) => n.id !== noteId);
    setNotes(updated);
    await storage.set(STORAGE_KEYS.getNotesKey(bookId), updated);
  }, [notes, bookId]);

  return { notes, addNote, deleteNote };
}
```

- [ ] **Step 2: Create NoteModal component**

Create `library-app/src/components/NoteModal.tsx`:

```tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (type: 'page' | 'chapter' | 'book', text: string) => void;
}

export function NoteModal({ visible, onClose, onSave }: Props) {
  const { tokens } = useTheme();
  const [type, setType] = useState<'page' | 'chapter' | 'book'>('page');
  const [text, setText] = useState('');

  const handleSave = () => {
    if (!text.trim()) return;
    onSave(type, text.trim());
    setText('');
    setType('page');
    onClose();
  };

  const typeDescriptions = {
    page: 'Note about this specific page',
    chapter: 'Note about this chapter',
    book: 'General note about this book',
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.box, { backgroundColor: tokens.page, borderColor: tokens.border }]}>
          <Text style={[styles.title, { color: tokens.accent }]}>Add a Note</Text>

          <View style={styles.typeSelector}>
            {(['page', 'chapter', 'book'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.typeBtn,
                  { borderColor: tokens.border },
                  type === t && { backgroundColor: tokens.accent, borderColor: tokens.accent },
                ]}
                onPress={() => setType(t)}
              >
                <Text style={[styles.typeBtnText, { color: type === t ? '#fff' : tokens.text2 }]}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.desc, { color: tokens.text2 }]}>{typeDescriptions[type]}</Text>

          <TextInput
            style={[styles.textarea, { color: tokens.text, backgroundColor: tokens.bg, borderColor: tokens.border }]}
            placeholder="Write your note here..."
            placeholderTextColor={tokens.text2}
            value={text}
            onChangeText={setText}
            multiline
            textAlignVertical="top"
          />

          <View style={styles.actions}>
            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: tokens.accent }]} onPress={handleSave}>
              <Text style={styles.saveText}>Save Note</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.cancelBtn, { borderColor: tokens.border }]} onPress={onClose}>
              <Text style={[styles.cancelText, { color: tokens.text2 }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', padding: 16 },
  box: { borderRadius: 12, padding: 24, borderWidth: 1 },
  title: { fontFamily: 'EBGaramond-SemiBold', fontSize: 20, marginBottom: 16 },
  typeSelector: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  typeBtn: { flex: 1, borderWidth: 1.5, borderRadius: 8, padding: 8, alignItems: 'center' },
  typeBtnText: { fontFamily: 'Lato-Bold', fontSize: 13 },
  desc: { fontFamily: 'Lato', fontSize: 12, fontStyle: 'italic', marginBottom: 12 },
  textarea: {
    borderWidth: 1, borderRadius: 8, padding: 12, minHeight: 100,
    fontFamily: 'EBGaramond', fontSize: 15, lineHeight: 24,
  },
  actions: { flexDirection: 'row', gap: 8, marginTop: 14 },
  saveBtn: { flex: 1, borderRadius: 8, padding: 10, alignItems: 'center' },
  saveText: { color: '#fff', fontFamily: 'Lato-Bold', fontSize: 14 },
  cancelBtn: { borderWidth: 1.5, borderRadius: 8, padding: 10, paddingHorizontal: 16 },
  cancelText: { fontFamily: 'Lato-Bold', fontSize: 14 },
});
```

- [ ] **Step 3: Create NoteCard component**

Create `library-app/src/components/NoteCard.tsx`:

```tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Note } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  note: Note;
  onDelete: (id: string) => void;
}

export function NoteCard({ note, onDelete }: Props) {
  const { tokens } = useTheme();

  const badgeColors: Record<string, { bg: string; text: string }> = {
    page: { bg: tokens.accentDim, text: tokens.accent },
    chapter: { bg: 'rgba(80,160,80,0.15)', text: '#2D6A2D' },
    book: { bg: 'rgba(80,80,200,0.1)', text: '#3A3AA0' },
  };

  const badge = badgeColors[note.type] || badgeColors.page;

  return (
    <View style={[styles.card, { backgroundColor: tokens.page, borderColor: tokens.border }]}>
      <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(note.id)}>
        <Text style={styles.deleteText}>✕</Text>
      </TouchableOpacity>
      <View style={[styles.badge, { backgroundColor: badge.bg }]}>
        <Text style={[styles.badgeText, { color: badge.text }]}>
          {note.type === 'page' ? '🖊' : note.type === 'chapter' ? '📜' : '📖'} {note.type}
        </Text>
      </View>
      <Text style={[styles.text, { color: tokens.text }]}>{note.text}</Text>
      <Text style={[styles.meta, { color: tokens.text2 }]}>
        {note.chapterTitle}{note.pageLabel ? ` · ${note.pageLabel}` : ''} · {note.date}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 8, padding: 12, marginBottom: 10, borderWidth: 1, position: 'relative' },
  deleteBtn: { position: 'absolute', top: 8, right: 8, padding: 4 },
  deleteText: { fontSize: 16, opacity: 0.4 },
  badge: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start', marginBottom: 6 },
  badgeText: { fontFamily: 'Lato-Bold', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' },
  text: { fontFamily: 'EBGaramond', fontSize: 15, lineHeight: 24 },
  meta: { fontFamily: 'Lato', fontSize: 11, marginTop: 6 },
});
```

- [ ] **Step 4: Integrate notes into Reader screen**

Update `library-app/app/reader/[id].tsx` to:
- Import `useNotes`, `NoteModal`, `NoteCard`
- Add floating "✎ Add Note" button
- Show notes in Notes tab
- Wire up note creation with current page/chapter context

- [ ] **Step 5: Verify notes work**

Open a book, add a Page note, verify it appears in the Notes tab, delete it.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add notes system with create, view, and delete"
```

---

### Task 9: Text Highlighting

**Covers:** 4-color highlight system with toolbar

**Files:**
- Create: `library-app/src/hooks/useHighlights.ts`
- Create: `library-app/src/components/HighlightToolbar.tsx`
- Modify: `library-app/src/components/TextReader.tsx` (or reader screen)

**Interfaces:**
- Consumes: `storage`, `STORAGE_KEYS`
- Produces: `useHighlights(bookId)` → `{ highlights, addHighlight, removeHighlight }`

- [ ] **Step 1: Create useHighlights hook**

Create `library-app/src/hooks/useHighlights.ts`:

```typescript
import { useState, useEffect, useCallback } from 'react';
import { Highlight, HighlightsMap } from '../types';
import { storage } from '../services/storage';
import { STORAGE_KEYS } from '../constants';

export function useHighlights(bookId: string) {
  const [highlights, setHighlights] = useState<HighlightsMap>({});

  useEffect(() => {
    storage.get<HighlightsMap>(STORAGE_KEYS.getHighlightsKey(bookId)).then((saved) => {
      if (saved) setHighlights(saved);
    });
  }, [bookId]);

  const addHighlight = useCallback(async (pageIndex: number, highlight: Omit<Highlight, 'pageIndex'>) => {
    const newHighlight: Highlight = { ...highlight, pageIndex };
    const pageHighlights = highlights[pageIndex] || [];
    const updated = { ...highlights, [pageIndex]: [...pageHighlights, newHighlight] };
    setHighlights(updated);
    await storage.set(STORAGE_KEYS.getHighlightsKey(bookId), updated);
  }, [highlights, bookId]);

  const removeHighlight = useCallback(async (pageIndex: number, index: number) => {
    const pageHighlights = (highlights[pageIndex] || []).filter((_, i) => i !== index);
    const updated = { ...highlights, [pageIndex]: pageHighlights };
    setHighlights(updated);
    await storage.set(STORAGE_KEYS.getHighlightsKey(bookId), updated);
  }, [highlights, bookId]);

  return { highlights, addHighlight, removeHighlight };
}
```

- [ ] **Step 2: Create HighlightToolbar component**

Create `library-app/src/components/HighlightToolbar.tsx`:

```tsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface Props {
  visible: boolean;
  onHighlight: (color: 'yellow' | 'green' | 'pink' | 'blue') => void;
  onClear: () => void;
}

const COLORS = [
  { name: 'yellow' as const, bg: '#FFD700' },
  { name: 'green' as const, bg: '#50C864' },
  { name: 'pink' as const, bg: '#E060CC' },
  { name: 'blue' as const, bg: '#50A0FF' },
];

export function HighlightToolbar({ visible, onHighlight, onClear }: Props) {
  if (!visible) return null;

  return (
    <View style={styles.toolbar}>
      {COLORS.map((c) => (
        <TouchableOpacity
          key={c.name}
          style={[styles.swatch, { backgroundColor: c.bg }]}
          onPress={() => onHighlight(c.name)}
        />
      ))}
      <TouchableOpacity style={styles.clearBtn} onPress={onClear}>
        <Text style={styles.clearText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 6,
    gap: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 400,
  },
  swatch: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: 'transparent' },
  clearBtn: { padding: 4 },
  clearText: { fontSize: 16, color: '#888' },
});
```

- [ ] **Step 3: Integrate highlights into reader**

Update the reader screen to:
- Import `useHighlights` and `HighlightToolbar`
- Show toolbar on text selection (simplified: button to highlight current page)
- Apply highlight styling to page content

- [ ] **Step 4: Verify highlights work**

Open a book, select text (or use button), apply a highlight, verify it persists.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add text highlighting with 4 colors"
```

---

### Task 10: EPUB Reader + Theme Styling

**Covers:** EPUB WebView rendering with theme CSS injection, full theme support across all readers

**Files:**
- Modify: `library-app/src/services/epubParser.ts`
- Modify: `library-app/app/reader/[id].tsx`
- Create: `library-app/src/components/EpubReader.tsx`

**Interfaces:**
- Consumes: `epubParser`, `useTheme`, `WebView`

- [ ] **Step 1: Create EpubReader component**

Create `library-app/src/components/EpubReader.tsx`:

```tsx
import React from 'react';
import { WebView } from 'react-native-webview';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  html: string;
}

export function EpubReader({ html }: Props) {
  const { tokens, theme } = useTheme();

  const themedHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Lato:wght@300;400;700&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'EB Garamond', serif;
          font-size: 17px;
          line-height: 1.85;
          color: ${tokens.text};
          background: ${tokens.page};
          padding: 24px 20px;
          margin: 0;
        }
        h1, h2, h3 {
          font-family: 'EB Garamond', serif;
          font-weight: 600;
          color: ${tokens.accent};
          margin-top: 24px;
        }
        h1 { font-size: 28px; }
        h2 { font-size: 22px; }
        h3 { font-size: 17px; font-style: italic; }
        p { margin-bottom: 14px; }
        strong { color: ${tokens.accent}; }
        em { font-style: italic; }
        ul, ol { padding-left: 20px; margin-bottom: 14px; }
        li { margin-bottom: 6px; }
        a { color: ${tokens.accent}; }
        blockquote {
          border-left: 3px solid ${tokens.accent};
          padding-left: 16px;
          margin-left: 0;
          opacity: 0.8;
        }
      </style>
    </head>
    <body>${html}</body>
    </html>
  `;

  return (
    <WebView
      source={{ html: themedHtml }}
      style={{ flex: 1, backgroundColor: tokens.page }}
      originWhitelist={['*']}
    />
  );
}
```

- [ ] **Step 2: Update reader to handle EPUB files**

Modify `library-app/app/reader/[id].tsx` to:
- Check `book.sourceType`
- For PDF: show `react-native-pdf` component
- For EPUB/TXT/MD: show `TextReader` or `EpubReader` with scrollable text
- For pasted text: show `TextReader`

- [ ] **Step 3: Verify EPUB rendering**

Import an EPUB file, open it, verify themed rendering in WebView.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add EPUB WebView reader with theme CSS injection"
```

---

### Task 11: Polish + Final Integration

**Covers:** Final integration, navigation flow, empty states, responsive layout

**Files:**
- Modify: `library-app/app/reader/[id].tsx`
- Modify: `library-app/app/(tabs)/index.tsx`
- Modify: `library-app/src/components/BookCard.tsx`

- [ ] **Step 1: Add book deletion**

Add long-press on BookCard to show delete confirmation.

- [ ] **Step 2: Add All Notes panel to Library**

Show notes grouped by book in the All Notes tab with note counts.

- [ ] **Step 3: Add Book Notes Detail screen**

Create `library-app/app/reader/notes/[id].tsx` with type filter toggle (Book/Chapter/Page).

- [ ] **Step 4: Test full flow**

Import a book → read it → add notes → highlight text → check All Notes → verify position persistence.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: polish library screen, add book notes detail, test full flow"
```

---

### Task 12: Final Verification

**Covers:** End-to-end testing, build verification

- [ ] **Step 1: Run full app on device/simulator**

```bash
npx expo start --android
# or
npx expo start --ios
```

- [ ] **Step 2: Test all import types**
- [ ] **Step 3: Test all 4 themes**
- [ ] **Step 4: Test notes and highlights persistence**
- [ ] **Step 5: Test reading position save/restore**
- [ ] **Step 6: Test offline mode (airplane mode)**

- [ ] **Step 7: Final commit**

```bash
git add -A
git commit -m "feat: Library MVP complete — PDF/EPUB/TXT/MD/paste import, 4 themes, notes, highlights, offline"
```
