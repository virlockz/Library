# Library v2

A personal book reading application built with React Native + Expo, designed to replicate Apple Books as closely as possible for personal use.

## Features

### Reading Experience
- **Import books** — EPUB, PDF, TXT, Markdown, or pasted text
- **4 themes** — Light, Sepia, Dark, Night (matching Apple Books exactly)
- **9 fonts** — New York, Georgia, Athelas, Charter, Palatino, Times New Roman, Iowan, System, Avenir Next
- **Typography controls** — Font size, line spacing, margins, word/character spacing, bold, justify
- **Page turn animation** — Smooth slide transition between pages
- **Progress scrubber** — Draggable progress bar with percentage tooltip
- **Auto-hide controls** — Reader toolbar hides after 4 seconds of inactivity

### Library Management
- **Grid & list views** — Toggle between cover grid and detailed list
- **Sort options** — By recent, title, or author
- **Collections** — Create custom collections, built-in "Want to Read"
- **Edit mode** — Multi-select and batch delete books
- **Animated header** — Large title transitions to small title on scroll

### Navigation & Search
- **Blur effects** — Translucent tab bar on iOS
- **Scroll to top** — Tap active tab to scroll to top
- **Search** — Debounced search with recent searches and categories
- **Full-screen TOC** — Table of contents with segmented control (Contents/Bookmarks/Notes)

### Annotations
- **5 highlight colors** — Yellow, Green, Blue, Pink, Purple + Underline
- **Notes** — Page, Chapter, or Book-level notes
- **Bookmarks** — Quick bookmark toggle with haptic feedback
- **Export** — Export notes as plain text or Markdown

### Settings
- **Auto-Night** — Time-based theme switching (7 PM - 7 AM)
- **Match Device** — Follows system light/dark mode
- **Brightness control** — Adjustable brightness slider
- **Haptic feedback** — Subtle haptics on interactions

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React Native | 0.79.2 | Cross-platform mobile framework |
| Expo | SDK 54 | Development platform |
| TypeScript | 5.3 | Type safety |
| Expo Router | 5.1 | File-based navigation |
| React Native WebView | 13.13 | Renders book content |
| Phosphor Icons | 3.0 | Icon library |
| Expo Blur | 15.0 | Translucent effects |
| Expo Haptics | 15.0 | Haptic feedback |
| AsyncStorage | 2.1 | Local persistence |
| JSZip | 3.10 | EPUB parsing |
| pdfjs-dist | 3.11 | PDF text extraction |
| marked | 18.0 | Markdown to HTML |

## Project Structure

```
library-app/
├── app/                          # Expo Router file-based routes
│   ├── _layout.tsx              # Root layout with ThemeProvider
│   ├── (tabs)/                  # Tab navigator
│   │   ├── _layout.tsx          # Tab bar configuration
│   │   ├── reading-now.tsx      # Continue reading carousel
│   │   ├── library.tsx          # Book grid with collections
│   │   ├── browse.tsx           # Categories and stats
│   │   └── search.tsx           # Search with recent searches
│   └── reader/
│       ├── [id].tsx             # Main reader screen
│       └── notes/[id].tsx       # Book notes detail
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── AnimatedHeader.tsx   # Scroll-based title animation
│   │   ├── BookCover.tsx        # Book cover with gradient
│   │   ├── ChapterNav.tsx       # Horizontal chapter pills
│   │   ├── EpubReader.tsx       # WebView content renderer
│   │   ├── ExportNotes.tsx      # Notes export modal
│   │   ├── HighlightToolbar.tsx # Text highlight colors
│   │   ├── NoteCard.tsx         # Note display card
│   │   ├── NoteModal.tsx        # Note creation modal
│   │   ├── PageSpread.tsx       # Page container
│   │   ├── ReaderBottomToolbar.tsx # Reader controls
│   │   ├── ReadingProgressBar.tsx  # Reading progress bar
│   │   ├── ThinProgressBar.tsx  # Draggable scrubber
│   │   ├── ThemeToggle.tsx      # Theme cycle button
│   │   ├── TOCModal.tsx         # Table of contents
│   │   └── TypographyControls.tsx # Font settings panel
│   ├── contexts/                # React Context providers
│   │   ├── ThemeContext.tsx      # Theme state + modes
│   │   └── LibraryContext.tsx    # Book collection state
│   ├── hooks/                   # Custom React hooks
│   │   ├── useBookmarks.ts
│   │   ├── useCollections.ts
│   │   ├── useHighlights.ts
│   │   ├── useNotes.ts
│   │   ├── useReadingPosition.ts
│   │   ├── useReadingSettings.ts
│   │   ├── useReadingStats.ts
│   │   └── useRecentlyOpened.ts
│   ├── services/                # Business logic
│   │   ├── epubParser.ts        # EPUB file parser
│   │   ├── fileImport.ts        # Document picker
│   │   ├── pdfParser.ts         # PDF text extraction
│   │   ├── storage.ts           # AsyncStorage wrapper
│   │   └── textProcessor.ts     # Markdown/text to HTML
│   ├── themes/
│   │   └── tokens.ts            # Theme color definitions
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces
│   └── constants/
│       ├── index.ts             # App constants
│       └── fonts.ts             # Font definitions
├── assets/                      # Images, fonts
├── preview.html                 # HTML preview (localhost:3000)
└── serve.js                     # Preview server
```

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator or Android Emulator (or Expo Go app)

### Installation

```bash
cd library-app
npm install
```

### Running

```bash
# Start the development server
npx expo start

# Run on iOS
npx expo start --ios

# Run on Android
npx expo start --android

# Run on web
npx expo start --web
```

### Preview Server

The HTML preview is available at `http://localhost:3000`:

```bash
node serve.js
```

## Design System

### Theme Colors

| Token | Light | Sepia | Dark | Night |
|-------|-------|-------|------|-------|
| Background | `#FFFFFF` | `#F5E6C8` | `#000000` | `#000000` |
| Page | `#FFFFFF` | `#F8F1E3` | `#1C1C1E` | `#121212` |
| Text | `#000000` | `#000000` | `#FFFFFF` | `#BEBEBE` |
| Accent | `#007AFF` | `#007AFF` | `#0A84FF` | `#0A84FF` |

### Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Header | SF Pro | 34pt | Bold |
| Section | SF Pro | 20pt | Bold |
| Body | System | 16pt | Regular |
| Tab Label | System | 11pt | Regular |

## Key Behaviors

### Reader Controls
- **Tap center 60%** — Toggle toolbar visibility
- **Tap left 20%** — Previous page
- **Tap right 20%** — Next page
- **Swipe down** — Dismiss reader

### Keyboard Shortcuts
- **A-/A+** — Decrease/increase font size
- **Left/Right arrows** — Navigate pages

## License

Personal use only. Not for distribution.
