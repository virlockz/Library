# Library v2 — Product Requirements Document

> Version 1.1 · June 2026
> Status: MVP (current implementation) → Recommended rebuild stack below

---

## 1. Product Vision

Library v2 is a personal book reading application that provides a beautiful, themed reading experience for curated literary content. It combines the aesthetic pleasure of physical books — paper textures, page-flip animations, spine lines — with digital conveniences: notes, highlights, cross-book note browsing, and reading position persistence.

The app is designed for readers who value the *experience* of reading as much as the content — people who want their digital reading environment to feel intentional, warm, and personal rather than utilitarian.

---

## 2. Target Audience

- **Primary**: Individual readers who consume curated, long-form content (essays, philosophy, psychology, esoteric texts)
- **Secondary**: Content creators / authors who want to present their work in a beautiful reader format
- **Use case**: Personal reading library with annotation capability, not a commercial ebook store

---

## 3. Feature Inventory

### 3.1 MVP Features (Implemented)

| Feature | Description |
|---|---|
| **Multi-book library** | Grid view of available books with metadata (domain, chapters, pages, notes, date) |
| **Themed reading** | Four visual themes (Parchment, Modern, Current, Veil) with per-book default |
| **Page-by-page reading** | Paginated content with chapter navigation, prev/next buttons, and page indicators |
| **Page flip animation** | CSS-driven slide+fade transitions between pages |
| **Chapter navigation** | Horizontal scrollable pill buttons for quick chapter jumping |
| **Note system** | Three note types: Page, Chapter, Book. Created via modal, persisted in localStorage |
| **Text highlighting** | Four-color highlight system (yellow, green, pink, blue) with toolbar on text selection |
| **Cross-book notes** | "All Notes" tab in library showing notes across all books, grouped by book |
| **Book notes detail** | Dedicated screen for browsing notes within a book, filterable by type |
| **"Open in Book"** | From notes detail, jump directly to the note's location in the reader |
| **Reading position persistence** | Page position saved per book in localStorage |
| **Theme persistence** | Theme preference saved per book in localStorage |
| **Touch swipe** | Horizontal swipe on page-spread for page flipping on mobile |
| **Responsive design** | Mobile-optimized layout at < 600px breakpoint |

### 3.2 Features NOT in MVP

- User-added books / file import
- Search across books or notes
- Export notes or highlights
- Book covers / cover images
- Reading progress percentage
- Dark mode toggle independent of theme
- Keyboard navigation
- Print-friendly view
- Multi-device sync
- User accounts / authentication

---

## 4. Screen Inventory

### 4.1 Library Screen
**URL state**: Default / root view
**Purpose**: Browse available books and access cross-book notes

| Element | Description |
|---|---|
| Top bar | Wordmark "📖 My Library" + theme toggle (Parchment ↔ Modern) |
| Tab bar | "📖 Books" / "🗒 All Notes" |
| Books panel | Heading, subtitle with book count, responsive book grid |
| All Notes panel | Heading, subtitle, list of books with note counts, clickable rows |

**Book card contents**: spine accent, domain label, title, theme badge, metadata (chapters, pages, notes, date), "Open book →" link

### 4.2 Reader Screen
**URL state**: Active when a book is open
**Purpose**: Read book content with notes and highlights

| Element | Description |
|---|---|
| Top bar | "← Library" back button, book title, theme toggle |
| Tab bar | "📖 Read" / "🗒 Notes" |
| Chapter nav | Horizontal pill buttons, one per chapter |
| Page view | Page spread with content, flip zones, page navigation |
| Notes view | Notes grouped by chapter, with "← Back" inline button |
| Floating button | "✎ Add Note" (visible on Read tab only) |
| Note modal | Overlay with type selector, textarea, save/cancel |
| Highlight toolbar | Color swatches + clear button, appears on text selection |

### 4.3 Book Notes Detail Screen
**URL state**: Active when viewing notes for a specific book
**Purpose**: Browse and filter notes within a single book

| Element | Description |
|---|---|
| Top bar | "← All Notes" back button, book title |
| Toggle bar | "📖 Book" / "📜 Chapter" / "🖊 Page" filter buttons |
| Content area | Filtered notes with "Open in Book →" buttons |

---

## 5. User Flows

### 5.1 Open a Book
```
Library → Click book card → Reader screen opens
  → Book's default theme applied
  → Last read page restored (or page 0)
  → Chapter nav populated
  → First visible page rendered
```

### 5.2 Read and Navigate
```
Reader → Click chapter pill → Jump to chapter's first page
Reader → Click "Next" / swipe right → Advance one page (with animation)
Reader → Click "Previous" / swipe left → Go back one page (with animation)
Reader → Click flip zone edges → Page flip in that direction
```

### 5.3 Add a Note
```
Reader (Read tab) → Click "✎ Add Note" → Modal opens
  → Select note type (Page/Chapter/Book)
  → Type note text
  → Click "Save Note" → Note saved to localStorage
  → Modal closes, page re-renders with note count badge
```

### 5.4 Highlight Text
```
Reader → Select text in page body → Highlight toolbar appears
  → Click color swatch → Highlight applied as <mark> element
  → Highlight saved per page in localStorage
  → On page revisit, highlights restored via text matching
```

### 5.5 Browse All Notes
```
Library → Click "🗒 All Notes" tab → All Notes panel
  → See list of books with note counts
  → Click book row → Book Notes Detail screen
  → Toggle between Book/Chapter/Page filters
  → Click "Open in Book →" → Reader opens at note's page
```

### 5.6 Switch Theme
```
Reader → Click theme toggle → Cycles to next available theme
  → Theme applied instantly (0.4s background transition)
  → Theme preference saved to localStorage
  → Button label updates
```

### 5.7 Return to Library
```
Reader → Click "← Library" → Page position saved
  → Library theme restored
  → Library screen shown with book grid
```

---

## 6. Data Model

### 6.1 Book Data (Currently Hardcoded)

```
Book {
  id: string              // "higher-intelligences", "hermetic-path", etc.
  title: string           // Display title
  domain: string          // Category label
  date: string            // Publication date string
  defaultTheme: string    // "parchment" | "modern" | "current" | "veil"
  chapters: Chapter[]
}

Chapter {
  id: string              // "abstract", "metacognition", etc.
  title: string           // Display title
  label: string           // "Chapter I", "Intro · Part 1"
  pages: Page[]
}

Page {
  heading: string         // Page title
  label: string           // "Chapter I · Part 1"
  body: string            // HTML content string
}
```

### 6.2 User Data (localStorage)

| Key Pattern | Type | Description |
|---|---|---|
| `page_{bookId}` | `number` | Current page index for the book |
| `theme_{bookId}` | `string` | User's chosen theme for the book |
| `notes_{bookId}` | `Note[]` | Array of note objects |
| `highlights_{bookId}` | `Object` | Map of page index → highlight array |

### 6.3 Note Object

```
Note {
  type: "page" | "chapter" | "book"
  text: string                // User's note content
  chapterId: string           // ID of the chapter
  chapterTitle: string        // Display title of the chapter
  pageLabel: string | null    // Page label (null for chapter/book notes)
  date: string                // "7 Jun 2026" (en-GB format)
}
```

### 6.4 Highlight Object

```
Highlight {
  color: "yellow" | "green" | "pink" | "blue"
  text: string                // The highlighted text content
}
```

Stored as: `{ "page_0": [{color, text}, ...], "page_1": [...] }`

---

## 7. Current Book Inventory

| ID | Title | Domain | Theme | Chapters | Pages |
|---|---|---|---|---|---|
| `higher-intelligences` | The Higher Intelligences | Psychology & Philosophy | Parchment | 6 | 12 |
| `hermetic-path` | The Hermetic Path | Esoteric & Hermetic | Veil | 10 | 20 |
| `jung-teachings` | The Architecture of the Soul | Psychology · Philosophy | Modern | 5 | 10 |
| `jung-life` | The Man in the Depths | Biography · Psychology | Parchment | 4 | 8 |
| `kybalion` | The Kybalion Decoded | Esoteric & Hermetic | Veil | 7 | 14 |
| `art-of-hermetics` | The Art of Hermetics | Esoteric & Philosophy | Veil | 7 | 14 |
| `in-the-zone` | In The Zone | Neuroscience & Performance | Current | 8 | 15 |

---

## 8. Technology Stack

### 8.1 Current Implementation
- **Single HTML file**: All HTML, CSS, and JavaScript in one file (`library_v2.html`)
- **No build system**: Vanilla HTML/CSS/JS, no framework
- **No server**: Purely client-side
- **External dependency**: Google Fonts only (EB Garamond + Lato)

### 8.2 Recommended Rebuild Stack

| Layer | Choice | Rationale |
|---|---|---|
| **Framework** | React 18+ | Component model maps to app's UI (BookCard, PageSpread, NoteModal, etc.). Theme system via Context. Massive ecosystem. |
| **Build tool** | Vite | Fast dev server, simple config, ESM-native. Replaces manual script tags. |
| **Routing** | React Router | Screen navigation (Library → Reader → Notes Detail) with clean URL states. |
| **Styling** | CSS Modules + CSS Custom Properties | Preserves the existing token system (`--parch-*`, `--mod-*`, etc.). Component-scoped styles prevent leaks. |
| **State** | useState + useContext | App state is moderate (current book, page, notes, theme). No Redux needed. |
| **Persistence** | localStorage via custom hooks | Direct port of current `getStorage`/`setStorage` pattern. |
| **Content** | JSON files or MDX | Book content moves out of JS arrays into importable JSON/MDX files. Enables future user import. |

### 8.3 Why Not Other Options

| Option | Why not |
|---|---|
| **Kotlin** | Android-only or thin web ecosystem. Wrong tool for a web reading app. |
| **Vue** | Viable alternative, slightly simpler syntax. But React has larger ecosystem and more learning resources. |
| **Svelte** | Excellent for this app (lighter, faster). Choose if simplicity > ecosystem. Smaller community. |
| **Flutter** | Overkill. Cross-platform mobile focus, web support feels secondary. |
| **Vanilla JS** (current) | Works now, but hard to scale. Adding import/search/routing gets messy without component boundaries. |

### 8.4 Key Migration Paths

The current vanilla JS code translates directly to React:

| Current Pattern | React Equivalent |
|---|---|
| `showScreen('reader')` | `<Route path="/book/:id" element={<Reader />} />` |
| `applyTheme('parchment')` | `<ThemeContext.Provider value={theme}>` + class swap |
| `getStorage('notes_'+bookId)` | `useLocalStorage('notes_' + bookId)` custom hook |
| `renderPage()` | `<PageSpread page={currentPage} />` component |
| `renderChapterNav()` | `<ChapterNav chapters={chapters} active={currentChapter} />` |
| `openNoteModal()` | `useState` boolean + `<NoteModal isOpen={...} />` |

---

## 9. Technical Constraints

### 9.1 Storage
- **localStorage only**: All user data persisted in browser localStorage
- **Per-book isolation**: Each book's data is namespaced by book ID
- **No sync**: Data is device-local only, no cloud backup
- **No export**: No mechanism to export notes or highlights

### 9.2 Content
- **Hardcoded books**: Book content is embedded in the JavaScript `BOOKS` array
- **HTML body content**: Page bodies contain HTML strings (not plain text)
- **No images**: All content is text-only; no book covers, illustrations, or embedded media
- **No lazy loading**: All book data loaded into memory on page load

### 9.3 Performance
- **Single-page rendering**: One page displayed at a time (no virtual scrolling)
- **CSS animations**: All transitions use CSS keyframes (no JS animation libraries)
- **No code splitting**: Entire app loads in one request

### 9.4 Browser Support
- Modern browsers with CSS custom properties, flexbox, grid, and CSS animations support
- Touch events for mobile swipe support
- localStorage API required for persistence

---

## 10. Design System Reference

See `design_guidelines.md` for the complete design system, including:
- Four-theme color token system
- Typography scale and typeface contract
- Component patterns (buttons, cards, modals, tabs, etc.)
- Layout rules and spacing
- Interaction patterns and animations
- Accessibility requirements

---

## 11. Future Considerations

> These are noted for awareness but are NOT part of the MVP scope. They should be documented separately when prioritized.

- User-added books via file import (HTML or structured format)
- Search functionality across books and notes
- Note and highlight export
- Book cover images
- Reading progress tracking
- Keyboard navigation
- Multi-device synchronization
- User accounts
