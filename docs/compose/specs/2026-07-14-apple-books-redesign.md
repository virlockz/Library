# Apple Books Redesign — Design Spec

> Date: 2026-07-14
> Status: Approved
> Scope: Full visual and UX overhaul to replicate Apple Books

---

## [S1] Problem

The current app has a functional reading experience but diverges significantly from Apple Books in visual design, interaction patterns, and feature set. The goal is to make the app look and feel as close to Apple Books as possible for personal use.

**Key gaps:**
- Custom themes (Parchment, Modern, Current, Veil) instead of Apple's standard themes (Light, Sepia, Dark, Night)
- Emoji icons throughout instead of clean, consistent iconography
- Metadata-heavy library cards instead of cover-focused grid
- No dedicated reader control toolbar (Apple Books has a bottom bar with font/theme/brightness)
- Basic page turn animation instead of realistic curl effect
- No translucent tab bar
- Typography controls buried in modal instead of accessible bottom sheet
- Reading progress shown as text only, not a visual bar with percentage

---

## [S2] Theme System Redesign

Replace the 5 custom themes with Apple Books' 4 standard themes. All themes share the same structure; only colors change.

### Theme Tokens

| Token | Light | Sepia | Dark | Night |
|-------|-------|-------|------|-------|
| `bg` | `#FFFFFF` | `#F5E6C8` | `#1C1C1E` | `#000000` |
| `page` | `#FFFFFF` | `#FBF0DC` | `#2C2C2E` | `#000000` |
| `text` | `#000000` | `#3D2B1F` | `#F2F2F7` | `#FFFFFF` |
| `text2` | `#8E8E93` | `#8B7355` | `#8E8E93` | `#636366` |
| `accent` | `#007AFF` | `#A0522D` | `#0A84FF` | `#FFD60A` |
| `accentDim` | `rgba(0,122,255,0.08)` | `rgba(160,82,45,0.10)` | `rgba(10,132,255,0.12)` | `rgba(255,214,10,0.10)` |
| `border` | `#E5E5EA` | `#D4C4A8` | `#38383A` | `#1C1C1E` |
| `borderMid` | `#C6C6C8` | `#C0A882` | `#48484A` | `#2C2C2E` |
| `tab` | `#F2F2F7` | `#EDE0C8` | `#1C1C1E` | `#000000` |
| `barBg` | `rgba(242,242,247,0.85)` | `rgba(237,224,200,0.85)` | `rgba(28,28,30,0.85)` | `rgba(0,0,0,0.85)` |
| `searchBg` | `rgba(118,118,128,0.12)` | `rgba(139,115,85,0.12)` | `rgba(118,118,128,0.24)` | `rgba(118,118,128,0.24)` |

### Theme Names

```typescript
type ThemeName = 'light' | 'sepia' | 'dark' | 'night';
```

### Theme Availability

All 4 themes are available globally — applied to every screen in the app (Library, Reader, Browse, Search, Tab Bar, modals). No per-book restrictions.

### Theme Labels

| Theme | Label | Icon |
|-------|-------|------|
| light | Light | (sun icon) |
| sepia | Sepia | (book icon) |
| dark | Dark | (moon icon) |
| night | Night | (stars icon) |

---

## [S3] Library Screen Redesign

### Layout Structure

```
┌─────────────────────────────┐
│  Library              [+]   │  ← Large title, clean
├─────────────────────────────┤
│                             │
│  RECENTLY OPENED            │  ← Section header
│  ┌─────┐ ┌─────┐ ┌─────┐  │  ← Horizontal scroll of large covers
│  │     │ │     │ │     │  │
│  │     │ │     │ │     │  │
│  └─────┘ └─────┘ └─────┘  │
│  Title    Title    Title    │
│  42%                         │
│                             │
│  COLLECTIONS                │  ← Section header
│  All Books (N)              │  ← Collection row
│  Want to Read (N)           │
│                             │
│  ALL BOOKS                  │  ← Section header
│  ┌─────┐ ┌─────┐ ┌─────┐  │  ← 3-column grid
│  │     │ │     │ │     │  │
│  │     │ │     │ │     │  │
│  └─────┘ └─────┘ └─────┘  │
│  Title    Title    Title    │
│                             │
└─────────────────────────────┘
```

### Key Changes

1. **"Recently Opened" section** — horizontal scroll of large book covers (like Apple Books' "Continue Reading"). Shows last 5 opened books with progress bar underneath.

2. **"Collections" section** — list of collections (All Books, Want to Read, custom). Each row shows collection name and book count.

3. **"All Books" grid** — 3-column grid of book covers. Minimal text below each cover (title only, 2 lines max). No metadata (chapters, pages, notes, date) visible on the card.

4. **Book cards** — Large cover image (or generated cover) with title below. Progress bar shown if book has been opened. No spines, no domain labels, no theme badges.

5. **Import button** — "+" in top-right corner (same as current, but cleaner).

6. **Search** — Integrate search into the library header or keep as separate tab.

### Book Cover Component Updates

- Remove the spine line from generated covers
- Use larger, more prominent initials
- Add subtle shadow/depth to covers
- Cover aspect ratio: 3:4 (standard book ratio)
- Generated covers: use a gradient from the hash color to a darker shade

---

## [S4] Reader Screen Redesign

### Layout Structure

```
┌─────────────────────────────┐
│         (tap area)          │  ← Tap to show/hide controls
│                             │
│                             │
│     Chapter heading         │
│                             │
│     Page content...         │
│                             │
│                             │
│                             │
├─────────────────────────────┤
│  ◀  32%  ━━━━━━━━━  ▶     │  ← Bottom toolbar (always visible)
│     Aa   📑   🌙   ⋯      │  ← Control buttons
└─────────────────────────────┘
```

### Top Bar (appears on tap)

- **Left**: X (close) button — circles back to library
- **Center**: Book title (truncated)
- **Right**: Bookmark toggle, Search button

### Bottom Toolbar (always visible)

- **Left**: Previous page arrow
- **Center**: Reading progress percentage + thin progress bar
- **Right**: Next page arrow
- **Below**: Control row with:
  - `Aa` — Typography controls (font size, face, spacing)
  - `📑` — Table of contents
  - Theme toggle icon — Cycle through themes
  - `⋯` — More options (notes, export, brightness)

The top bar hides/shows on tap. The bottom toolbar is ALWAYS visible.

### Control Panels (slide up from bottom)

When a control button is tapped, a panel slides up from the bottom (like Apple Books):

1. **Typography Panel**: Font size slider, font face selector (Georgia, System, Serif), line height slider
2. **Theme Panel**: 4 theme swatches (Light, Sepia, Dark, Night) as tappable circles
3. **TOC Panel**: Chapter list with current chapter highlighted
4. **Notes Panel**: Notes list with add button

### Page Turn Animation

Replace the current slide+fade with a more realistic page curl:
- Use `Animated` with a combination of:
  - Horizontal translate (slight, 20px max)
  - Opacity fade (0.3 → 1.0)
  - Subtle scale (0.97 → 1.0)
  - Shadow opacity shift during transition
- Duration: 300ms ease-out
- The page should feel like it's being "pushed" rather than "slid"

### Reading Progress

- Bottom toolbar shows percentage (e.g., "32%")
- Thin progress bar fills across the bottom of the toolbar
- Progress bar color matches theme accent

---

## [S5] Tab Bar Redesign

### Current State
- Solid themed background
- 4 tabs: Reading Now, Library, Browse, Search
- Phosphor icons at weight="light"

### Target State (Apple Books style)
- Translucent/blur background effect
- 4 tabs: Reading Now, Library, Browse, Search
- Phosphor icons at weight="regular" (slightly heavier for visibility)
- Active state: filled icon + accent color
- Inactive state: outline icon + text2 color
- Tab labels: smaller font (10px), tighter spacing

### Implementation

Use `expo-blur` for the translucent effect on iOS. On Android, use a semi-opaque background as fallback.

```tsx
tabBarStyle: {
  backgroundColor: tokens.barBg, // translucent
  // On iOS, add blur effect
}
```

---

## [S6] Icon System

Replace all emoji with phosphor-react-native icons.

### Mapping

| Current Emoji | New Icon | Context |
|--------------|----------|---------|
| 📖 | `BookOpen` | Reading Now tab |
| 📚 | `Books` | Library tab (grid view) |
| 🧭 | `Compass` | Browse tab |
| 🔍 | `MagnifyingGlass` | Search tab |
| ✎ | `PencilLine` | Add note |
| 🕯/✦/◆/✧ | `Sun`/`Book`/`Moon`/`Star` | Theme toggle |
| 📑 | `List` | Table of contents |
| Aa | `TextAa` | Typography controls |
| ⋯ | `DotsThree` | More options |
| 💡 | `Lightbulb` | Tips |
| ❤️ | `BookmarkSimple`/`Bookmark` | Bookmark |
| ← | `CaretLeft` | Back/previous |
| → | `CaretRight` | Next |
| ✕ | `X` | Close |

### Icon Weights
- Tab bar icons: `weight="regular"` (not light)
- Inline UI icons: `weight="light"` or `weight="regular"`
- Action buttons: `weight="fill"` for active states

---

## [S7] Typography Controls Redesign

Replace the centered modal with a bottom sheet panel.

### Current State
- Centered modal with font size +/-, line height +/-, margins +/-
- "Done" button at bottom

### Target State
- Bottom sheet that slides up (like Apple Books)
- Font size: horizontal slider with A- and A+ at ends
- Font face: horizontal scroll of font options (Georgia, System, Serif)
- Line height: horizontal slider
- Margins: horizontal slider
- Background: theme page color with rounded top corners
- Handle bar at top for dismiss gesture

### Layout

```
┌─────────────────────────────┐
│          ━━━━━              │  ← Handle bar
│                             │
│  FONT SIZE                  │
│  A ━━━━━●━━━━━━━ A+        │  ← Slider
│                             │
│  FONT                       │
│  [Georgia] [System] [Serif] │  ← Horizontal scroll
│                             │
│  LINE SPACING               │
│  ≡ ━━━━━━●━━━━━━ ≡         │  ← Slider
│                             │
│  MARGINS                    │
│  ◁ ━━━━●━━━━━━━━▷          │  ← Slider
│                             │
└─────────────────────────────┘
```

---

## [S8] Browse Screen Redesign

### Current State
- Stats cards (Total Books, Total Pages)
- Genre grid with emoji
- Tip card

### Target State (Apple Books "Categories" style)
- Clean list of categories/genres
- Each row: icon + genre name + book count
- No emoji — use phosphor icons for each genre
- Stats integrated into header or removed

### Categories

| Category | Icon | Color |
|----------|------|-------|
| All Books | `Books` | accent |
| Psychology | `Brain` | `#C96442` |
| Philosophy | `AcademicCap` | `#8B4513` |
| Esoteric | `MoonStars` | `#B8962E` |
| Neuroscience | `Flask` | `#00C2CC` |
| Biography | `User` | `#6B5B95` |
| Self Help | `Plant` | `#88B04B` |

---

## [S9] Search Screen Redesign

### Current State
- Title search only
- Simple list of matching books

### Target State
- Full-text search within books (search body content, not just titles)
- Search results show matching excerpt with highlighted query
- Recent searches (stored in AsyncStorage)
- Search scope selector: "All Books", "Current Book" (in reader)

### Implementation
- Build a search index from book content on import
- Store index in AsyncStorage (key: `search_index`)
- Search across all book bodies for query matches
- Return results with context (surrounding text with query highlighted)

---

## [S10] Component-by-Component Changes

### Files to Modify

| File | Changes |
|------|---------|
| `src/types/index.ts` | Update `ThemeName` to `'light' | 'sepia' | 'dark' | 'night'` |
| `src/themes/tokens.ts` | Replace 5 themes with 4 Apple themes, add `barBg` and `searchBg` tokens |
| `src/constants/index.ts` | Update `THEMES`, `THEME_AVAILABILITY` (all 4 for all books), `THEME_LABELS` |
| `src/contexts/ThemeContext.tsx` | Update default theme to `'light'`, remove `cycleTheme` restrictions |
| `app/(tabs)/_layout.tsx` | Translucent tab bar, updated icons, active/filled state |
| `app/(tabs)/library.tsx` | Complete redesign: recently opened section, collections, 3-column grid |
| `app/(tabs)/reading-now.tsx` | Redesign: large cover cards, progress, cleaner layout |
| `app/(tabs)/browse.tsx` | Redesign: category list with phosphor icons |
| `app/(tabs)/search.tsx` | Full-text search, recent searches, excerpt display |
| `app/reader/[id].tsx` | Bottom toolbar, control panels, updated controls |
| `src/components/BookCover.tsx` | Remove spine, improve generated covers, larger size |
| `src/components/PageSpread.tsx` | Remove page nav buttons (moved to bottom toolbar), remove spine line |
| `src/components/ThemeToggle.tsx` | Redesign as icon-based toggle (not text label) |
| `src/components/TypographyControls.tsx` | Bottom sheet with sliders instead of centered modal |
| `src/components/ChapterNav.tsx` | Move to TOC bottom sheet panel |
| `src/components/ReadingProgressBar.tsx` | Integrate into bottom toolbar |

### New Components

| Component | Purpose |
|-----------|---------|
| `ReaderBottomToolbar.tsx` | Bottom toolbar with progress + nav + controls |
| `ControlPanel.tsx` | Base component for bottom sheet control panels |
| `ThemePanel.tsx` | Theme selection panel (4 swatches) |
| `FontPanel.tsx` | Typography controls panel with sliders |
| `TOCPanel.tsx` | Table of contents bottom sheet |
| `SearchModal.tsx` | Full-text search overlay |

---

## [S11] Implementation Phases

### Phase 1: Theme System
- Replace theme tokens
- Update ThemeContext
- Update ThemeName type
- Update constants

### Phase 2: Library Screen
- Redesign library.tsx with recently opened, collections, grid
- Update BookCover component
- Update reading-now.tsx

### Phase 3: Reader Screen
- Build ReaderBottomToolbar
- Build control panels (Font, Theme, TOC)
- Update reader/[id].tsx layout
- Update PageSpread (remove nav buttons)
- Update page turn animation

### Phase 4: Tab Bar & Icons
- Translucent tab bar
- Replace all emoji with phosphor icons
- Update icon weights

### Phase 5: Browse & Search
- Redesign browse.tsx with category list
- Implement full-text search
- Update search.tsx

---

## [S12] Success Criteria

1. App visually matches Apple Books in layout, spacing, and color
2. All 4 themes (Light, Sepia, Dark, Night) work correctly
3. Reader has a functional bottom toolbar with font/theme/TOC controls
4. Tab bar has translucent/blur effect
5. All emoji replaced with consistent phosphor icons
6. Library shows book covers prominently in a clean grid
7. Page turn animation feels smooth and natural
8. Reading progress is visible as a percentage and bar
9. Typography controls are accessible via bottom sheet
10. No regressions in existing functionality (book import, notes, highlights, bookmarks)
