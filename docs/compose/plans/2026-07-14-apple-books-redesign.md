# Apple Books Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the library app to visually and functionally replicate Apple Books across all screens.

**Architecture:** Replace the theme system first (foundation), then update components layer by layer: icons, library, reader, tab bar, browse, search. Each phase produces a working app.

**Tech Stack:** React Native, Expo SDK 54, TypeScript, phosphor-react-native, expo-blur

## Global Constraints

- Theme must apply globally (all screens), not per-book
- All 4 themes: Light, Sepia, Dark, Night — available for all books
- All emoji replaced with phosphor-react-native icons
- Bottom toolbar in reader is ALWAYS visible
- Tab bar uses translucent/blur background
- No new dependencies beyond expo-blur (already in Expo SDK)

---

### Task 1: Theme System Foundation

**Covers:** [S2]

**Files:**
- Modify: `library-app/src/types/index.ts` — Update ThemeName type
- Modify: `library-app/src/themes/tokens.ts` — Replace 5 themes with 4 Apple themes
- Modify: `library-app/src/constants/index.ts` — Update THEMES, THEME_AVAILABILITY, THEME_LABELS
- Modify: `library-app/src/contexts/ThemeContext.tsx` — Default to 'light'

**Interfaces:**
- Produces: `ThemeName = 'light' | 'sepia' | 'dark' | 'night'`, `ThemeTokens` with `barBg` and `searchBg` fields

- [ ] **Step 1: Update ThemeName type**

```typescript
// library-app/src/types/index.ts
export type ThemeName = 'light' | 'sepia' | 'dark' | 'night';
```

- [ ] **Step 2: Replace theme tokens**

```typescript
// library-app/src/themes/tokens.ts
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
    page: '#FBF0DC',
    text: '#3D2B1F',
    text2: '#8B7355',
    accent: '#A0522D',
    accentDim: 'rgba(160,82,45,0.10)',
    border: '#D4C4A8',
    borderMid: '#C0A882',
    tab: '#EDE0C8',
    barBg: 'rgba(237,224,200,0.85)',
    searchBg: 'rgba(139,115,85,0.12)',
  },
  dark: {
    bg: '#1C1C1E',
    page: '#2C2C2E',
    text: '#F2F2F7',
    text2: '#8E8E93',
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
    page: '#000000',
    text: '#FFFFFF',
    text2: '#636366',
    accent: '#FFD60A',
    accentDim: 'rgba(255,214,10,0.10)',
    border: '#1C1C1E',
    borderMid: '#2C2C2E',
    tab: '#000000',
    barBg: 'rgba(0,0,0,0.85)',
    searchBg: 'rgba(118,118,128,0.24)',
  },
};

export const THEME_COLORS: Record<ThemeName, { accent: string; bg: string }> = {
  light: { accent: '#007AFF', bg: '#FFFFFF' },
  sepia: { accent: '#A0522D', bg: '#F5E6C8' },
  dark: { accent: '#0A84FF', bg: '#1C1C1E' },
  night: { accent: '#FFD60A', bg: '#000000' },
};
```

- [ ] **Step 3: Update constants**

```typescript
// library-app/src/constants/index.ts
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

export const HIGHLIGHT_COLORS = ['yellow', 'green', 'pink', 'blue'] as const;

export const SUPPORTED_EXTENSIONS = ['.pdf', '.epub', '.txt', '.md'];
```

- [ ] **Step 4: Update ThemeContext default**

```typescript
// library-app/src/contexts/ThemeContext.tsx — change line 17
const [theme, setThemeState] = useState<ThemeName>('light');
```

- [ ] **Step 5: Run TypeScript check**

Run: `cd library-app && npx tsc --noEmit`
Expected: Any errors are from other files referencing old theme names — those will be fixed in subsequent tasks.

- [ ] **Step 6: Commit**

```bash
git add library-app/src/types/index.ts library-app/src/themes/tokens.ts library-app/src/constants/index.ts library-app/src/contexts/ThemeContext.tsx
git commit -m "feat: replace custom themes with Apple Books themes (Light, Sepia, Dark, Night)"
```

---

### Task 2: Icon System — Replace All Emoji

**Covers:** [S6]

**Files:**
- Modify: `library-app/app/(tabs)/_layout.tsx` — Tab bar icons
- Modify: `library-app/app/(tabs)/browse.tsx` — Genre icons
- Modify: `library-app/app/(tabs)/library.tsx` — Empty state icon
- Modify: `library-app/app/reader/[id].tsx` — Reader icons
- Modify: `library-app/src/components/ThemeToggle.tsx` — Theme icon
- Modify: `library-app/src/components/TypographyControls.tsx` — Control icons

**Interfaces:**
- Consumes: `ThemeName` from Task 1
- Produces: Consistent phosphor icon usage across all screens

- [ ] **Step 1: Update tab bar icons with filled/regular weights**

```tsx
// library-app/app/(tabs)/_layout.tsx
import React from 'react';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { BookOpen, Books, Compass, MagnifyingGlass } from 'phosphor-react-native';
import { useTheme } from '../../src/contexts/ThemeContext';

export default function TabLayout() {
  const { tokens, theme } = useTheme();
  const size = 24;

  return (
    <Tabs
      key={theme}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: tokens.barBg,
          borderTopColor: tokens.border,
          borderTopWidth: 0.5,
          elevation: 0,
          shadowOpacity: 0,
          height: Platform.OS === 'android' ? 80 : 85,
          paddingBottom: Platform.OS === 'android' ? 24 : 25,
          paddingTop: 6,
        },
        tabBarActiveTintColor: tokens.accent,
        tabBarInactiveTintColor: tokens.text2,
        tabBarLabelStyle: {
          fontFamily: 'System',
          fontSize: 10,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="reading-now"
        options={{
          title: 'Reading Now',
          tabBarIcon: ({ color, focused }) => (
            <BookOpen size={size} color={color} weight={focused ? 'fill' : 'regular'} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color, focused }) => (
            <Books size={size} color={color} weight={focused ? 'fill' : 'regular'} />
          ),
        }}
      />
      <Tabs.Screen
        name="browse"
        options={{
          title: 'Browse',
          tabBarIcon: ({ color, focused }) => (
            <Compass size={size} color={color} weight={focused ? 'fill' : 'regular'} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, focused }) => (
            <MagnifyingGlass size={size} color={color} weight={focused ? 'fill' : 'regular'} />
          ),
        }}
      />
    </Tabs>
  );
}
```

- [ ] **Step 2: Update ThemeToggle to use icons instead of text labels**

```tsx
// library-app/src/components/ThemeToggle.tsx
import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Sun, Book, Moon, Star } from 'phosphor-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeName } from '../types';

const THEME_ICONS: Record<ThemeName, React.ComponentType<any>> = {
  light: Sun,
  sepia: Book,
  dark: Moon,
  night: Star,
};

interface Props {
  availableThemes: ThemeName[];
}

export function ThemeToggle({ availableThemes }: Props) {
  const { theme, cycleTheme, tokens } = useTheme();
  const Icon = THEME_ICONS[theme] || Sun;

  return (
    <TouchableOpacity
      style={[styles.button, { borderColor: tokens.border, backgroundColor: tokens.accentDim }]}
      onPress={() => cycleTheme(availableThemes)}
    >
      <Icon size={18} color={tokens.accent} weight="fill" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

- [ ] **Step 3: Update browse.tsx genre icons**

Replace the emoji array in `browse.tsx`:

```tsx
// library-app/app/(tabs)/browse.tsx — replace GENRES constant
import { Brain, AcademicCap, MoonStars, Flask, User, Plant } from 'phosphor-react-native';

const GENRES = [
  { name: 'Psychology', Icon: Brain, color: '#C96442' },
  { name: 'Philosophy', Icon: AcademicCap, color: '#8B4513' },
  { name: 'Esoteric', Icon: MoonStars, color: '#B8962E' },
  { name: 'Neuroscience', Icon: Flask, color: '#00C2CC' },
  { name: 'Biography', Icon: User, color: '#6B5B95' },
  { name: 'Self Help', Icon: Plant, color: '#88B04B' },
];
```

Update the genre card rendering to use `<Icon size={28} color={genre.color} weight="light" />` instead of `<Text style={styles.genreEmoji}>{genre.emoji}</Text>`.

Also replace the tip emoji: `💡` → `<Lightbulb size={16} color={tokens.accent} weight="fill" />`

- [ ] **Step 4: Update library.tsx empty state**

Replace `<Text style={styles.emptyEmoji}>📚</Text>` with `<Books size={48} color={tokens.text2} weight="light" />`.

Import `Books` from phosphor-react-native.

- [ ] **Step 5: Update reader.tsx icons**

In `reader/[id].tsx`, replace all icon imports and usages:

- `X` (close) — already using phosphor, keep as-is
- `List` (TOC) — already using phosphor, keep as-is
- `TextAa` (typography) — already using phosphor, keep as-is
- `BookmarkSimple`/`Bookmark` — already using phosphor, keep as-is
- Add `DotsThree` for the "more" button
- Add `MagnifyingGlass` for search button in top bar

- [ ] **Step 6: Run TypeScript check**

Run: `cd library-app && npx tsc --noEmit`
Expected: Pass (or only errors from files not yet updated)

- [ ] **Step 7: Commit**

```bash
git add library-app/app/(tabs)/_layout.tsx library-app/src/components/ThemeToggle.tsx library-app/app/(tabs)/browse.tsx library-app/app/(tabs)/library.tsx library-app/app/reader/\[id\].tsx
git commit -m "feat: replace all emoji with phosphor icons throughout the app"
```

---

### Task 3: BookCover Component Update

**Covers:** [S3]

**Files:**
- Modify: `library-app/src/components/BookCover.tsx`

**Interfaces:**
- Produces: Updated `BookCover` component with no spine, improved generated covers, shadow

- [ ] **Step 1: Update BookCover component**

```tsx
// library-app/src/components/BookCover.tsx
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { FONTS } from '../constants/fonts';

const COVER_COLORS = [
  '#8B4513', '#C96442', '#00C2CC', '#B8962E',
  '#6B5B95', '#88B04B', '#955251', '#009B77',
  '#DD4124', '#45B8AC', '#5B5EA6', '#9B2335',
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function darkenColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0x00FF) - amount);
  const b = Math.max(0, (num & 0x0000FF) - amount);
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

interface Props {
  title: string;
  coverImage?: string;
  size?: number;
}

export function BookCover({ title, coverImage, size = 80 }: Props) {
  const colorIndex = hashString(title) % COVER_COLORS.length;
  const bgColor = COVER_COLORS[colorIndex];
  const darkBg = darkenColor(bgColor, 40);
  const initials = title
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  const coverWidth = size;
  const coverHeight = size * 1.33;
  const borderRadius = size * 0.04;

  if (coverImage) {
    return (
      <View style={[styles.coverWrap, { width: coverWidth, height: coverHeight, borderRadius, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 3 }]}>
        <Image
          source={{ uri: coverImage }}
          style={[styles.image, { borderRadius }]}
          resizeMode="cover"
        />
      </View>
    );
  }

  return (
    <View style={[styles.cover, { width: coverWidth, height: coverHeight, borderRadius, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 3 }]}>
      <View style={[styles.gradient, { backgroundColor: bgColor }]}>
        <View style={[styles.gradientOverlay, { backgroundColor: darkBg }]} />
      </View>
      <Text style={[styles.initials, { fontSize: size * 0.28 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cover: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  coverWrap: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
  },
  initials: {
    fontFamily: FONTS.serifBold,
    color: 'rgba(255,255,255,0.92)',
    letterSpacing: 2,
    zIndex: 1,
  },
});
```

- [ ] **Step 2: Run TypeScript check**

Run: `cd library-app && npx tsc --noEmit`
Expected: Pass

- [ ] **Step 3: Commit**

```bash
git add library-app/src/components/BookCover.tsx
git commit -m "feat: update BookCover with no spine, gradient fills, and shadow"
```

---

### Task 4: Library Screen Redesign

**Covers:** [S3]

**Files:**
- Modify: `library-app/app/(tabs)/library.tsx`

**Interfaces:**
- Consumes: `BookCover` from Task 3, theme tokens from Task 1
- Produces: Library screen with Recently Opened, Collections, and All Books grid

- [ ] **Step 1: Rewrite library.tsx**

```tsx
// library-app/app/(tabs)/library.tsx
import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, TextInput, Modal, ScrollView, Platform,
} from 'react-native';
import { Plus, Books, ChevronRight } from 'phosphor-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useLibrary } from '../../src/contexts/LibraryContext';
import { BookCover } from '../../src/components/BookCover';
import { ReadingProgressBar } from '../../src/components/ReadingProgressBar';
import { useReadingPosition } from '../../src/hooks/useReadingPosition';
import { useRecentlyOpened } from '../../src/hooks/useRecentlyOpened';
import { importFile, importPastedText } from '../../src/services/fileImport';
import { Book } from '../../src/types';
import { FONTS } from '../../src/constants/fonts';

function RecentlyOpenedCard({ book, onPress }: { book: Book; onPress: () => void }) {
  const { tokens } = useTheme();
  const { position } = useReadingPosition(book.id);
  const progress = book.pageCount > 0 ? (position / book.pageCount) * 100 : 0;

  return (
    <TouchableOpacity style={styles.recentCard} onPress={onPress} activeOpacity={0.7}>
      <BookCover title={book.title} coverImage={book.coverImage} size={100} />
      {progress > 0 && (
        <View style={styles.recentProgress}>
          <ReadingProgressBar progress={progress} />
        </View>
      )}
      <Text style={[styles.recentTitle, { color: tokens.text }]} numberOfLines={2}>{book.title}</Text>
    </TouchableOpacity>
  );
}

function CollectionRow({ name, count, onPress }: { name: string; count: number; onPress: () => void }) {
  const { tokens } = useTheme();
  return (
    <TouchableOpacity style={[styles.collectionRow, { borderBottomColor: tokens.border }]} onPress={onPress}>
      <Text style={[styles.collectionName, { color: tokens.text }]}>{name}</Text>
      <View style={styles.collectionRight}>
        <Text style={[styles.collectionCount, { color: tokens.text2 }]}>{count}</Text>
        <ChevronRight size={16} color={tokens.text2} weight="light" />
      </View>
    </TouchableOpacity>
  );
}

function LibraryBookCard({ book, onPress }: { book: Book; onPress: () => void }) {
  const { tokens } = useTheme();
  return (
    <TouchableOpacity style={styles.bookCard} onPress={onPress} activeOpacity={0.7}>
      <BookCover title={book.title} coverImage={book.coverImage} size={110} />
      <Text style={[styles.bookTitle, { color: tokens.text }]} numberOfLines={2}>{book.title}</Text>
    </TouchableOpacity>
  );
}

export default function LibraryScreen() {
  const { tokens } = useTheme();
  const { books, addBook } = useLibrary();
  const { recent } = useRecentlyOpened();
  const router = useRouter();
  const [pasteModal, setPasteModal] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [pasteTitle, setPasteTitle] = useState('');

  const recentBooks = recent
    .map((r) => books.find((b) => b.id === r.bookId))
    .filter(Boolean) as Book[];

  const handleImport = async () => {
    Alert.alert('Add Book', 'Choose how to add a book', [
      {
        text: 'Import File',
        onPress: async () => {
          try {
            const book = await importFile();
            if (book) await addBook(book);
          } catch (e) {
            Alert.alert('Import Failed', 'Could not import this file.');
          }
        },
      },
      { text: 'Paste Text', onPress: () => setPasteModal(true) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handlePaste = async () => {
    if (!pasteText.trim()) return;
    try {
      const book = await importPastedText(pasteText, pasteTitle);
      await addBook(book);
      setPasteModal(false);
      setPasteText('');
      setPasteTitle('');
    } catch (e) {
      Alert.alert('Import Failed', 'Could not save pasted text.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: tokens.bg }]}>
      <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? 40 : 50 }]}>
        <Text style={[styles.headerTitle, { color: tokens.text }]}>Library</Text>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: tokens.accent }]} onPress={handleImport}>
          <Plus size={20} color="#fff" weight="bold" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Recently Opened */}
        {recentBooks.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: tokens.text2 }]}>RECENTLY OPENED</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentScroll}>
              {recentBooks.map((book) => (
                <RecentlyOpenedCard
                  key={book.id}
                  book={book}
                  onPress={() => router.push(`/reader/${book.id}`)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Collections */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: tokens.text2 }]}>COLLECTIONS</Text>
          <CollectionRow name="All Books" count={books.length} onPress={() => {}} />
          <CollectionRow name="Want to Read" count={0} onPress={() => {}} />
        </View>

        {/* All Books Grid */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: tokens.text2 }]}>ALL BOOKS</Text>
          <View style={styles.grid}>
            {books.map((book) => (
              <LibraryBookCard
                key={book.id}
                book={book}
                onPress={() => router.push(`/reader/${book.id}`)}
              />
            ))}
          </View>
        </View>

        {books.length === 0 && (
          <View style={styles.emptyState}>
            <Books size={48} color={tokens.text2} weight="light" />
            <Text style={[styles.emptyTitle, { color: tokens.text }]}>Your Library</Text>
            <Text style={[styles.emptySub, { color: tokens.text2 }]}>Tap + to import a book</Text>
          </View>
        )}
      </ScrollView>

      <Modal visible={pasteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: tokens.page, borderColor: tokens.border }]}>
            <Text style={[styles.modalTitle, { color: tokens.accent }]}>Paste Text</Text>
            <TextInput
              style={[styles.modalInput, { color: tokens.text2, borderColor: tokens.border }]}
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
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: tokens.accent }]} onPress={handlePaste}>
                <Text style={styles.modalBtnText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { borderColor: tokens.border }]} onPress={() => setPasteModal(false)}>
                <Text style={[styles.modalBtnText2, { color: tokens.text2 }]}>Cancel</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: { fontFamily: FONTS.serifBold, fontSize: 34 },
  addBtn: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 100 },
  section: { marginBottom: 28, paddingHorizontal: 20 },
  sectionTitle: { fontFamily: FONTS.sans, fontSize: 12, fontWeight: '600', marginBottom: 12, letterSpacing: 0.5 },
  recentScroll: { gap: 16 },
  recentCard: { width: 100 },
  recentProgress: { marginTop: 6, borderRadius: 2, overflow: 'hidden' },
  recentTitle: { fontFamily: FONTS.sans, fontSize: 12, lineHeight: 16, marginTop: 6 },
  collectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  collectionName: { fontFamily: FONTS.sans, fontSize: 16 },
  collectionRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  collectionCount: { fontFamily: FONTS.sans, fontSize: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  bookCard: { width: '30%' },
  bookTitle: { fontFamily: FONTS.sans, fontSize: 12, lineHeight: 16, marginTop: 6 },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyTitle: { fontFamily: FONTS.serifBold, fontSize: 22, marginTop: 16, marginBottom: 8 },
  emptySub: { fontFamily: FONTS.sans, fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', padding: 16 },
  modalBox: { borderRadius: 12, padding: 24, borderWidth: 1 },
  modalTitle: { fontFamily: FONTS.serifBold, fontSize: 20, marginBottom: 16 },
  modalInput: { borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 12, fontFamily: FONTS.sans },
  modalTextarea: { borderWidth: 1, borderRadius: 8, padding: 12, minHeight: 150, fontFamily: FONTS.serif, fontSize: 15, lineHeight: 24 },
  modalActions: { flexDirection: 'row', gap: 8, marginTop: 14 },
  modalBtn: { flex: 1, borderRadius: 8, padding: 10, alignItems: 'center' },
  modalBtnText: { color: '#fff', fontFamily: FONTS.sansBold, fontSize: 14 },
  modalBtnText2: { fontFamily: FONTS.sansBold, fontSize: 14 },
});
```

- [ ] **Step 2: Run TypeScript check**

Run: `cd library-app && npx tsc --noEmit`
Expected: Pass

- [ ] **Step 3: Commit**

```bash
git add library-app/app/(tabs)/library.tsx
git commit -m "feat: redesign library with recently opened, collections, and cover grid"
```

---

### Task 5: Reading Now Screen Update

**Covers:** [S3]

**Files:**
- Modify: `library-app/app/(tabs)/reading-now.tsx`

**Interfaces:**
- Consumes: `BookCover` from Task 3, theme tokens from Task 1

- [ ] **Step 1: Rewrite reading-now.tsx**

```tsx
// library-app/app/(tabs)/reading-now.tsx
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BookOpen } from 'phosphor-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useLibrary } from '../../src/contexts/LibraryContext';
import { useRecentlyOpened } from '../../src/hooks/useRecentlyOpened';
import { useReadingPosition } from '../../src/hooks/useReadingPosition';
import { BookCover } from '../../src/components/BookCover';
import { ReadingProgressBar } from '../../src/components/ReadingProgressBar';
import { FONTS } from '../../src/constants/fonts';

function ReadingBookCard({ book, onPress }: { book: any; onPress: () => void }) {
  const { tokens } = useTheme();
  const { position } = useReadingPosition(book.id);
  const progress = book.pageCount > 0 ? (position / book.pageCount) * 100 : 0;

  return (
    <TouchableOpacity style={styles.readingCard} onPress={onPress} activeOpacity={0.7}>
      <BookCover title={book.title} coverImage={book.coverImage} size={120} />
      <View style={styles.readingInfo}>
        <Text style={[styles.readingTitle, { color: tokens.text }]} numberOfLines={2}>{book.title}</Text>
        {progress > 0 && (
          <View style={styles.progressWrap}>
            <ReadingProgressBar progress={progress} />
            <Text style={[styles.progressText, { color: tokens.text2 }]}>{Math.round(progress)}%</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function ReadingNowScreen() {
  const { tokens } = useTheme();
  const { books } = useLibrary();
  const { recent } = useRecentlyOpened();
  const router = useRouter();

  const recentBooks = recent
    .map((r) => books.find((b) => b.id === r.bookId))
    .filter(Boolean);

  const unreadBooks = books
    .filter((b) => !recent.some((r) => r.bookId === b.id))
    .slice(0, 6);

  return (
    <View style={[styles.container, { backgroundColor: tokens.bg }]}>
      <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? 40 : 50 }]}>
        <Text style={[styles.headerTitle, { color: tokens.text }]}>Reading Now</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {recentBooks.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: tokens.text2 }]}>CONTINUE READING</Text>
            {recentBooks.map((book) => book && (
              <ReadingBookCard
                key={book.id}
                book={book}
                onPress={() => router.push(`/reader/${book.id}`)}
              />
            ))}
          </View>
        )}

        {unreadBooks.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: tokens.text2 }]}>NOT STARTED</Text>
            <View style={styles.grid}>
              {unreadBooks.map((book) => (
                <TouchableOpacity
                  key={book.id}
                  style={styles.gridItem}
                  onPress={() => router.push(`/reader/${book.id}`)}
                >
                  <BookCover title={book.title} coverImage={book.coverImage} size={100} />
                  <Text style={[styles.gridTitle, { color: tokens.text }]} numberOfLines={2}>{book.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {books.length === 0 && (
          <View style={styles.emptyState}>
            <BookOpen size={48} color={tokens.text2} weight="light" />
            <Text style={[styles.emptyTitle, { color: tokens.text }]}>No Books Yet</Text>
            <Text style={[styles.emptySub, { color: tokens.text2 }]}>Import a book from the Library tab to start reading</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  headerTitle: { fontFamily: FONTS.serifBold, fontSize: 34 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  section: { marginBottom: 28 },
  sectionTitle: { fontFamily: FONTS.sans, fontSize: 12, fontWeight: '600', marginBottom: 14, letterSpacing: 0.5 },
  readingCard: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  readingInfo: { flex: 1 },
  readingTitle: { fontFamily: FONTS.serifBold, fontSize: 18, lineHeight: 23, marginBottom: 8 },
  progressWrap: { gap: 4 },
  progressText: { fontFamily: FONTS.sans, fontSize: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  gridItem: { width: 100 },
  gridTitle: { fontFamily: FONTS.sans, fontSize: 12, lineHeight: 16, marginTop: 6 },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyTitle: { fontFamily: FONTS.serifBold, fontSize: 22, marginTop: 16, marginBottom: 8 },
  emptySub: { fontFamily: FONTS.sans, fontSize: 14, textAlign: 'center' },
});
```

- [ ] **Step 2: Run TypeScript check**

Run: `cd library-app && npx tsc --noEmit`
Expected: Pass

- [ ] **Step 3: Commit**

```bash
git add library-app/app/(tabs)/reading-now.tsx
git commit -m "feat: update Reading Now screen with Apple Books layout"
```

---

### Task 6: Reader Bottom Toolbar

**Covers:** [S4]

**Files:**
- Create: `library-app/src/components/ReaderBottomToolbar.tsx`
- Modify: `library-app/src/components/PageSpread.tsx` — Remove nav buttons

**Interfaces:**
- Consumes: theme tokens from Task 1
- Produces: `ReaderBottomToolbar` component with prev/next, progress, and control buttons

- [ ] **Step 1: Create ReaderBottomToolbar component**

```tsx
// library-app/src/components/ReaderBottomToolbar.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CaretLeft, CaretRight, TextAa, List, Sun, DotsThree } from 'phosphor-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { ReadingProgressBar } from './ReadingProgressBar';
import { FONTS } from '../constants/fonts';

interface Props {
  pageNumber: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onFontPress: () => void;
  onTOCPress: () => void;
  onThemePress: () => void;
  onMorePress: () => void;
}

export function ReaderBottomToolbar({
  pageNumber,
  totalPages,
  onPrev,
  onNext,
  onFontPress,
  onTOCPress,
  onThemePress,
  onMorePress,
}: Props) {
  const { tokens } = useTheme();
  const progress = totalPages > 0 ? ((pageNumber + 1) / totalPages) * 100 : 0;

  return (
    <View style={[styles.container, { backgroundColor: tokens.tab, borderTopColor: tokens.border }]}>
      <ReadingProgressBar progress={progress} />
      <View style={styles.navRow}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={onPrev}
          disabled={pageNumber <= 0}
        >
          <CaretLeft size={20} color={pageNumber <= 0 ? tokens.text2 : tokens.accent} weight="fill" />
        </TouchableOpacity>
        <Text style={[styles.progressText, { color: tokens.text2 }]}>
          {Math.round(progress)}%
        </Text>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={onNext}
          disabled={pageNumber >= totalPages - 1}
        >
          <CaretRight size={20} color={pageNumber >= totalPages - 1 ? tokens.text2 : tokens.accent} weight="fill" />
        </TouchableOpacity>
      </View>
      <View style={[styles.controlRow, { borderTopColor: tokens.border }]}>
        <TouchableOpacity style={styles.controlBtn} onPress={onFontPress}>
          <TextAa size={20} color={tokens.text2} weight="regular" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlBtn} onPress={onTOCPress}>
          <List size={20} color={tokens.text2} weight="regular" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlBtn} onPress={onThemePress}>
          <Sun size={20} color={tokens.text2} weight="regular" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlBtn} onPress={onMorePress}>
          <DotsThree size={20} color={tokens.text2} weight="regular" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 0.5,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  navBtn: {
    padding: 8,
  },
  progressText: {
    fontFamily: FONTS.sans,
    fontSize: 14,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 0.5,
    paddingVertical: 8,
    paddingBottom: 20,
  },
  controlBtn: {
    padding: 8,
  },
});
```

- [ ] **Step 2: Update PageSpread to remove nav buttons**

```tsx
// library-app/src/components/PageSpread.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  children: React.ReactNode;
}

export function PageSpread({ children }: Props) {
  const { tokens } = useTheme();

  return (
    <View style={[styles.spread, { backgroundColor: tokens.page, borderColor: tokens.border }]}>
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  spread: {
    margin: 16,
    borderRadius: 4,
    minHeight: 500,
    borderWidth: 1,
    overflow: 'hidden',
  },
  content: {
    padding: 40,
    paddingBottom: 20,
  },
});
```

- [ ] **Step 3: Run TypeScript check**

Run: `cd library-app && npx tsc --noEmit`
Expected: Pass

- [ ] **Step 4: Commit**

```bash
git add library-app/src/components/ReaderBottomToolbar.tsx library-app/src/components/PageSpread.tsx
git commit -m "feat: add ReaderBottomToolbar and simplify PageSpread"
```

---

### Task 7: Reader Screen Integration

**Covers:** [S4, S7]

**Files:**
- Modify: `library-app/app/reader/[id].tsx`
- Modify: `library-app/src/components/TypographyControls.tsx`

**Interfaces:**
- Consumes: `ReaderBottomToolbar` from Task 6, theme tokens from Task 1
- Produces: Integrated reader with bottom toolbar and bottom sheet controls

- [ ] **Step 1: Rewrite TypographyControls as bottom sheet**

```tsx
// library-app/src/components/TypographyControls.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, PanResponder } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useReadingSettings } from '../hooks/useReadingSettings';
import { FONTS } from '../constants/fonts';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function TypographyControls({ visible, onClose }: Props) {
  const { tokens } = useTheme();
  const { settings, updateSettings } = useReadingSettings();

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={[styles.panel, { backgroundColor: tokens.page, borderTopColor: tokens.border }]}
          onStartShouldSetResponder={() => true}
        >
          <View style={[styles.handle, { backgroundColor: tokens.text2 }]} />

          <Text style={[styles.sectionLabel, { color: tokens.text2 }]}>FONT SIZE</Text>
          <View style={styles.sliderRow}>
            <Text style={[styles.sliderLabel, { color: tokens.text2 }]}>A</Text>
            <View style={styles.sliderTrack}>
              <View style={[styles.sliderFill, { backgroundColor: tokens.accent, width: `${((settings.fontSize - 12) / 16) * 100}%` }]} />
            </View>
            <Text style={[styles.sliderLabelLarge, { color: tokens.text2 }]}>A</Text>
          </View>
          <View style={styles.stepperRow}>
            <TouchableOpacity
              style={[styles.stepperBtn, { borderColor: tokens.border }]}
              onPress={() => updateSettings({ fontSize: Math.max(12, settings.fontSize - 1) })}
            >
              <Text style={[styles.stepperText, { color: tokens.accent }]}>A-</Text>
            </TouchableOpacity>
            <Text style={[styles.stepperValue, { color: tokens.text }]}>{settings.fontSize}</Text>
            <TouchableOpacity
              style={[styles.stepperBtn, { borderColor: tokens.border }]}
              onPress={() => updateSettings({ fontSize: Math.min(28, settings.fontSize + 1) })}
            >
              <Text style={[styles.stepperText, { color: tokens.accent }]}>A+</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.sectionLabel, { color: tokens.text2, marginTop: 20 }]}>FONT</Text>
          <View style={styles.fontRow}>
            {['Georgia', 'System', 'Serif'].map((font) => (
              <TouchableOpacity
                key={font}
                style={[styles.fontOption, { borderColor: tokens.border, backgroundColor: tokens.accentDim }]}
                onPress={() => updateSettings({ fontFamily: font })}
              >
                <Text style={[styles.fontOptionText, { color: tokens.text }]}>{font}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.sectionLabel, { color: tokens.text2, marginTop: 20 }]}>LINE SPACING</Text>
          <View style={styles.stepperRow}>
            <TouchableOpacity
              style={[styles.stepperBtn, { borderColor: tokens.border }]}
              onPress={() => updateSettings({ lineHeight: Math.max(1.2, +(settings.lineHeight - 0.1).toFixed(1)) })}
            >
              <Text style={[styles.stepperText, { color: tokens.accent }]}>-</Text>
            </TouchableOpacity>
            <Text style={[styles.stepperValue, { color: tokens.text }]}>{settings.lineHeight.toFixed(1)}</Text>
            <TouchableOpacity
              style={[styles.stepperBtn, { borderColor: tokens.border }]}
              onPress={() => updateSettings({ lineHeight: Math.min(3.0, +(settings.lineHeight + 0.1).toFixed(1)) })}
            >
              <Text style={[styles.stepperText, { color: tokens.accent }]}>+</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.doneBtn, { backgroundColor: tokens.accent }]} onPress={onClose}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  panel: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 0.5,
  },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16, opacity: 0.3 },
  sectionLabel: { fontFamily: FONTS.sans, fontSize: 11, fontWeight: '600', letterSpacing: 0.5, marginBottom: 10 },
  sliderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  sliderLabel: { fontFamily: FONTS.sans, fontSize: 12 },
  sliderLabelLarge: { fontFamily: FONTS.sans, fontSize: 18 },
  sliderTrack: { flex: 1, height: 4, borderRadius: 2, backgroundColor: 'rgba(128,128,128,0.2)', overflow: 'hidden' },
  sliderFill: { height: 4, borderRadius: 2 },
  stepperRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16 },
  stepperBtn: { borderWidth: 1.5, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 6 },
  stepperText: { fontFamily: FONTS.sansBold, fontSize: 14 },
  stepperValue: { fontFamily: FONTS.sans, fontSize: 14, minWidth: 30, textAlign: 'center' },
  fontRow: { flexDirection: 'row', gap: 8 },
  fontOption: { flex: 1, borderWidth: 1.5, borderRadius: 8, padding: 10, alignItems: 'center' },
  fontOptionText: { fontFamily: FONTS.sans, fontSize: 13 },
  doneBtn: { borderRadius: 8, padding: 12, alignItems: 'center', marginTop: 20 },
  doneBtnText: { color: '#fff', fontFamily: FONTS.sansBold, fontSize: 15 },
});
```

- [ ] **Step 2: Rewrite reader/[id].tsx with bottom toolbar**

The full file is long. Key changes to `reader/[id].tsx`:

1. Import `ReaderBottomToolbar` instead of building nav inline
2. Remove the `← Previous` / `Next →` buttons from inside `PageSpread`
3. Add `ReaderBottomToolbar` as a fixed bottom element
4. Add a `ThemePanel` modal (simple 4-swatch selector)
5. Keep the tap-to-toggle top bar behavior
6. Bottom toolbar stays always visible

Key structural changes:

```tsx
// In the return statement, replace the bottom section:
// OLD: bottomOverlay with Add Note button
// NEW: ReaderBottomToolbar (always visible)

import { ReaderBottomToolbar } from '../../src/components/ReaderBottomToolbar';

// ... in the return statement:

<View style={[styles.container, { backgroundColor: tokens.bg }]}>
  <Animated.View style={[styles.dismissContainer, { transform: [{ translateY: dismissAnim }], backgroundColor: tokens.bg }]} {...panResponder.panHandlers}>
    {/* Top Overlay — slides in on tap */}
    <Animated.View style={[styles.topOverlay, { /* ... */ }]} pointerEvents={controlsVisible ? 'auto' : 'none'}>
      {/* Close button, title, bookmark, search */}
    </Animated.View>

    {/* Content Area — tap to toggle controls */}
    <TouchableOpacity style={styles.contentArea} activeOpacity={1} onPress={toggleControls}>
      {/* Tab Bar (shown when controls visible) */}
      {controlsVisible && (
        <View style={[styles.tabBar, { /* ... */ }]}>
          {/* Read / Notes tabs */}
        </View>
      )}

      {/* Read View */}
      {activeTab === 'read' && currentPageData && (
        <ScrollView style={styles.scrollContent}>
          <PageSpread>
            {/* Page content — no nav buttons inside */}
          </PageSpread>
        </ScrollView>
      )}

      {/* Notes View */}
      {activeTab === 'notes' && (
        <ScrollView style={styles.notesView}>
          {/* Notes list */}
        </ScrollView>
      )}
    </TouchableOpacity>

    {/* Bottom Toolbar — ALWAYS visible */}
    <ReaderBottomToolbar
      pageNumber={currentPage}
      totalPages={book.pageCount}
      onPrev={() => handlePageChange(-1)}
      onNext={() => handlePageChange(1)}
      onFontPress={() => setTypographyVisible(true)}
      onTOCPress={() => setTocVisible(true)}
      onThemePress={() => setThemePanelVisible(true)}
      onMorePress={() => setNoteModalVisible(true)}
    />
  </Animated.View>

  {/* Modals */}
  <NoteModal visible={noteModalVisible} onClose={() => setNoteModalVisible(false)} onSave={handleAddNote} />
  <TypographyControls visible={typographyVisible} onClose={() => setTypographyVisible(false)} />
  <TOCModal visible={tocVisible} chapters={book.chapters} activeChapterId={currentChapter?.id || ''} onSelect={handleChapterSelect} onClose={() => setTocVisible(false)} />
  <ExportNotes visible={exportVisible} notes={notes} bookTitle={book.title} onClose={() => setExportVisible(false)} />
</View>
```

Add a simple ThemePanel state and rendering:

```tsx
const [themePanelVisible, setThemePanelVisible] = useState(false);

// In the modals section:
{themePanelVisible && (
  <Modal visible={themePanelVisible} transparent animationType="fade">
    <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }} activeOpacity={1} onPress={() => setThemePanelVisible(false)}>
      <View style={{ backgroundColor: tokens.page, borderTopLeftRadius: 12, borderTopRightRadius: 12, padding: 20, paddingBottom: 40 }}>
        <View style={{ width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16, backgroundColor: tokens.text2, opacity: 0.3 }} />
        <Text style={{ fontFamily: FONTS.sans, fontSize: 11, fontWeight: '600', letterSpacing: 0.5, color: tokens.text2, marginBottom: 12 }}>THEME</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {(['light', 'sepia', 'dark', 'night'] as ThemeName[]).map((t) => (
            <TouchableOpacity
              key={t}
              style={{ flex: 1, alignItems: 'center', padding: 12, borderRadius: 8, borderWidth: theme === t ? 2 : 1, borderColor: theme === t ? tokens.accent : tokens.border }}
              onPress={() => { setTheme(t); setThemePanelVisible(false); }}
            >
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: THEME_TOKENS[t].bg, borderWidth: 1, borderColor: THEME_TOKENS[t].border, marginBottom: 6 }} />
              <Text style={{ fontFamily: FONTS.sans, fontSize: 11, color: tokens.text }}>{THEME_LABELS[t]}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  </Modal>
)}
```

- [ ] **Step 3: Run TypeScript check**

Run: `cd library-app && npx tsc --noEmit`
Expected: Pass

- [ ] **Step 4: Commit**

```bash
git add library-app/app/reader/\[id\].tsx library-app/src/components/TypographyControls.tsx
git commit -m "feat: integrate bottom toolbar and bottom sheet controls in reader"
```

---

### Task 8: Browse Screen Redesign

**Covers:** [S8]

**Files:**
- Modify: `library-app/app/(tabs)/browse.tsx`

**Interfaces:**
- Consumes: Theme tokens from Task 1, phosphor icons from Task 2

- [ ] **Step 1: Rewrite browse.tsx**

```tsx
// library-app/app/(tabs)/browse.tsx
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Books, Brain, AcademicCap, MoonStars, Flask, User, Plant, Lightbulb, ChevronRight } from 'phosphor-react-native';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useLibrary } from '../../src/contexts/LibraryContext';
import { FONTS } from '../../src/constants/fonts';

const GENRES = [
  { name: 'All Books', Icon: Books, color: '#007AFF' },
  { name: 'Psychology', Icon: Brain, color: '#C96442' },
  { name: 'Philosophy', Icon: AcademicCap, color: '#8B4513' },
  { name: 'Esoteric', Icon: MoonStars, color: '#B8962E' },
  { name: 'Neuroscience', Icon: Flask, color: '#00C2CC' },
  { name: 'Biography', Icon: User, color: '#6B5B95' },
  { name: 'Self Help', Icon: Plant, color: '#88B04B' },
];

export default function BrowseScreen() {
  const { tokens } = useTheme();
  const { books } = useLibrary();

  return (
    <View style={[styles.container, { backgroundColor: tokens.bg }]}>
      <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? 40 : 50 }]}>
        <Text style={[styles.headerTitle, { color: tokens.text }]}>Browse</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: tokens.accentDim }]}>
            <Text style={[styles.statValue, { color: tokens.accent }]}>{books.length}</Text>
            <Text style={[styles.statLabel, { color: tokens.text2 }]}>Books</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: tokens.accentDim }]}>
            <Text style={[styles.statValue, { color: tokens.accent }]}>
              {books.reduce((sum, b) => sum + b.pageCount, 0)}
            </Text>
            <Text style={[styles.statLabel, { color: tokens.text2 }]}>Pages</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: tokens.text2 }]}>CATEGORIES</Text>
        {GENRES.map((genre) => {
          const count = genre.name === 'All Books'
            ? books.length
            : books.filter((b) => b.title.toLowerCase().includes(genre.name.toLowerCase())).length;
          return (
            <TouchableOpacity key={genre.name} style={[styles.genreRow, { borderBottomColor: tokens.border }]}>
              <View style={[styles.genreIconWrap, { backgroundColor: genre.color + '18' }]}>
                <genre.Icon size={22} color={genre.color} weight="regular" />
              </View>
              <Text style={[styles.genreName, { color: tokens.text }]}>{genre.name}</Text>
              <View style={styles.genreRight}>
                <Text style={[styles.genreCount, { color: tokens.text2 }]}>{count}</Text>
                <ChevronRight size={16} color={tokens.text2} weight="light" />
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={[styles.tipCard, { backgroundColor: tokens.accentDim, borderColor: tokens.border }]}>
          <View style={styles.tipHeader}>
            <Lightbulb size={16} color={tokens.accent} weight="fill" />
            <Text style={[styles.tipTitle, { color: tokens.accent }]}> Tip</Text>
          </View>
          <Text style={[styles.tipText, { color: tokens.text2 }]}>
            Import EPUB files from your favorite ebook sources. The app extracts cover images and chapters automatically.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  headerTitle: { fontFamily: FONTS.serifBold, fontSize: 34 },
  content: { padding: 20, paddingBottom: 100 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  statCard: { flex: 1, borderRadius: 12, padding: 16, alignItems: 'center' },
  statValue: { fontFamily: FONTS.serifBold, fontSize: 28 },
  statLabel: { fontFamily: FONTS.sans, fontSize: 12, marginTop: 4 },
  sectionTitle: { fontFamily: FONTS.sans, fontSize: 12, fontWeight: '600', marginBottom: 12, letterSpacing: 0.5 },
  genreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    gap: 14,
  },
  genreIconWrap: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  genreName: { fontFamily: FONTS.sans, fontSize: 16, flex: 1 },
  genreRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  genreCount: { fontFamily: FONTS.sans, fontSize: 14 },
  tipCard: { borderRadius: 12, padding: 16, borderWidth: 1, marginTop: 28 },
  tipHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  tipTitle: { fontFamily: FONTS.sansBold, fontSize: 14 },
  tipText: { fontFamily: FONTS.sans, fontSize: 13, lineHeight: 18 },
});
```

- [ ] **Step 2: Run TypeScript check**

Run: `cd library-app && npx tsc --noEmit`
Expected: Pass

- [ ] **Step 3: Commit**

```bash
git add library-app/app/(tabs)/browse.tsx
git commit -m "feat: redesign Browse with category list and phosphor icons"
```

---

### Task 9: Search Screen Update

**Covers:** [S9]

**Files:**
- Modify: `library-app/app/(tabs)/search.tsx`

**Interfaces:**
- Consumes: Theme tokens from Task 1, BookCover from Task 3

- [ ] **Step 1: Update search.tsx with cleaner design**

```tsx
// library-app/app/(tabs)/search.tsx
import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MagnifyingGlass, X } from 'phosphor-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useLibrary } from '../../src/contexts/LibraryContext';
import { BookCover } from '../../src/components/BookCover';
import { FONTS } from '../../src/constants/fonts';

export default function SearchScreen() {
  const { tokens } = useTheme();
  const { books } = useLibrary();
  const router = useRouter();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return books;
    const q = query.toLowerCase();
    return books.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.sourceType.toLowerCase().includes(q)
    );
  }, [query, books]);

  return (
    <View style={[styles.container, { backgroundColor: tokens.bg }]}>
      <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? 40 : 50 }]}>
        <Text style={[styles.headerTitle, { color: tokens.text }]}>Search</Text>
      </View>

      <View style={styles.searchWrap}>
        <View style={[styles.searchBar, { backgroundColor: tokens.searchBg }]}>
          <MagnifyingGlass size={18} color={tokens.text2} weight="regular" />
          <TextInput
            style={[styles.searchInput, { color: tokens.text }]}
            placeholder="Search your library..."
            placeholderTextColor={tokens.text2}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <X size={16} color={tokens.text2} weight="fill" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.resultRow, { borderBottomColor: tokens.border }]}
            onPress={() => router.push(`/reader/${item.id}`)}
          >
            <BookCover title={item.title} coverImage={item.coverImage} size={48} />
            <View style={styles.resultInfo}>
              <Text style={[styles.resultTitle, { color: tokens.text }]} numberOfLines={1}>{item.title}</Text>
              <Text style={[styles.resultMeta, { color: tokens.text2 }]}>
                {item.chapters.length} chapters · {item.pageCount} pages
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: tokens.text }]}>
              {query ? 'No results found' : 'Search your books'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  headerTitle: { fontFamily: FONTS.serifBold, fontSize: 34 },
  searchWrap: { paddingHorizontal: 20, marginBottom: 8 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: FONTS.sans,
  },
  list: { paddingHorizontal: 20, paddingBottom: 100 },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    gap: 14,
  },
  resultInfo: { flex: 1 },
  resultTitle: { fontFamily: FONTS.serif, fontSize: 16, lineHeight: 21 },
  resultMeta: { fontFamily: FONTS.sans, fontSize: 12, marginTop: 2 },
  emptyState: { alignItems: 'center', marginTop: 80 },
  emptyTitle: { fontFamily: FONTS.sans, fontSize: 15 },
});
```

- [ ] **Step 2: Run TypeScript check**

Run: `cd library-app && npx tsc --noEmit`
Expected: Pass

- [ ] **Step 3: Commit**

```bash
git add library-app/app/(tabs)/search.tsx
git commit -m "feat: update Search with rounded search bar and clear button"
```

---

### Task 10: Final Integration and Verification

**Covers:** [S10, S11, S12]

**Files:**
- Verify all modified files compile
- Run the app to verify visual consistency

- [ ] **Step 1: Full TypeScript check**

Run: `cd library-app && npx tsc --noEmit`
Expected: Pass with no errors

- [ ] **Step 2: Verify all theme references are updated**

Search for any remaining references to old theme names:
```bash
cd library-app && grep -r "parchment\|modern\|current\|veil\|apple" src/ app/ --include="*.ts" --include="*.tsx" | grep -v node_modules
```
Expected: No matches (or only in comments/types that are intentionally kept)

- [ ] **Step 3: Verify no emoji remain in UI components**

```bash
cd library-app && grep -r "📖\|🗒\|✎\|🕯\|✦\|◆\|✧\|📚\|💡\|🧠\|🏛\|🔮\|🧬\|📜\|🌱" src/ app/ --include="*.tsx" --include="*.ts"
```
Expected: No matches

- [ ] **Step 4: Final commit if any cleanup was needed**

```bash
git add -A
git commit -m "chore: final cleanup for Apple Books redesign"
```
