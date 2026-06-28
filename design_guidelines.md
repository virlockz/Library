# Library v2 — Design Guidelines

> The design system for a multi-theme book reader application. Parchment mode is the primary reference — a warm, bookish, paper-inspired aesthetic. Modern, Current, and Veil are theme variations that swap tokens while sharing the same structural layout, typography rules, spacing, and interaction patterns.

---

## 1. Product Overview

Library v2 is a single-page reading application with three screens: **Library** (book grid + all-notes), **Reader** (paginated book reading with notes/highlights), and **Book Notes Detail** (cross-book note browsing). It supports four visual themes and persists reading position, notes, highlights, and theme preference per book in localStorage.

---

## 2. Design System Architecture

### 2.1 Theme-First, Not Component-First

Every visual component is theme-aware through CSS custom properties. The app root (`#app`) carries a class (`parchment`, `modern`, `current`, or `veil`) that activates the corresponding token set. No component hardcodes hex values — all colors come from `--{theme}-*` variables.

### 2.2 Shared Structural Rules

These rules are **theme-invariant** — they apply across all four themes:

- **Two-typeface contract**: `EB Garamond` (serif) for all reading content; `Lato` (sans-serif) for all UI chrome. No third family.
- **Generous reading line-height**: `1.85` on `page-body`, `1.6` on `note-text` and `note-textarea`.
- **Border-radius vocabulary**: `4px` on page-spread, `8px` on buttons/cards/inputs, `12px` on modal/book-card, `20px` on chapter pills, `50px` on floating button. Never above `12px` for desk-sitting surfaces.
- **Transition timing**: All button hovers `0.2s`. Page flip `~250ms`. Theme switch `0.4s` on background only. No bounce/spring animations.
- **Emoji as icons**: No icon font, no SVG. Emoji accompany all interactive controls (never alone).
- **Text selection**: `user-select: text` on `.page-spread` only; not on UI chrome.
- **Disabled controls**: `opacity: 0.3`, no hover effect via `:hover:not(:disabled)`.

### 2.3 CSS Token Convention

Each theme defines 7 base tokens under its class:

| Token Role | Parchment | Modern | Current | Veil |
|---|---|---|---|---|
| `--{t}-bg` | App background (desk) | App background | App background | App background |
| `--{t}-page` | Page surface (paper) | Page surface | Page surface | Page surface |
| `--{t}-text` | Primary reading text | Primary reading text | Primary reading text | Primary reading text |
| `--{t}-text2` | Secondary/meta text | Secondary/meta text | Secondary/meta text | Secondary/meta text |
| `--{t}-accent` | Dominant accent (ink) | Dominant accent | Dominant accent | Dominant accent |
| `--{t}-border` | Border/divider color | Border/divider color | Border/divider color | Border/divider color |
| `--{t}-tab` | Top bar chrome bg | Top bar chrome bg | Top bar chrome bg | Top bar chrome bg |

**Rule**: `page` must always be lighter than `bg`. The page sits on the desk; it is not darker than the surface beneath it.

---

## 3. Parchment Mode — Primary Reference

> A warm, bookish, paper-inspired aesthetic. Evokes an antique leather-bound volume: aged parchment pages, sepia ink, brass-leaf borders, and the soft glow of candlelight. Every visual choice should feel like reading from an old-but-loved book — generous with margins, never rushed, always tactile.

### 3.1 Core Aesthetic Principles

- **Paper-first, not screen-first.** Surfaces look like physical paper, not digital cards. Corners are subtly rounded (4px on the page-spread), borders are thin, and shadows are soft and warm (no cold grays anywhere).
- **Two-tone typography.** A literary serif (EB Garamond) carries all reading content; a clean humanist sans (Lato) carries all UI chrome. Never mix in a third family.
- **Warmth over contrast.** The palette is monochrome-on-warm rather than black-on-white. Text is dark brown on cream, never pure black.
- **Hardware metaphors.** A vertical "spine" line divides each page. Box-shadow on the page-spread simulates a sheet resting on a table. Theme toggle is symbolized by a candle (`🕯`).
- **Motion is gentle.** All transitions are 200–400ms, eases, no bouncy springs. Page flips slide 30px horizontally with a fade.

### 3.2 Color Palette

Defined as CSS custom properties under `:root`; consumed via `.parchment` class. **Never hardcode hex values** — always use variables.

| Token | Hex | Role |
|---|---|---|
| `--parch-bg` | `#F5F0E8` | App background (the "desk") |
| `--parch-page` | `#FBF7EF` | Page surface (the "paper") |
| `--parch-text` | `#2C2416` | Primary reading text. Near-black brown, never pure black |
| `--parch-text2` | `#5C4A2A` | Secondary text (meta, footnotes, captions) |
| `--parch-accent` | `#8B4513` | Saddle brown — headings, active states, dividers, ink color |
| `--parch-border` | `#C8A96E` | Antique gold/brass for borders, dividers, card outlines |
| `--parch-tab` | `#E8DFC8` | Top bar / chrome background |

**Overlay tints** (translucent accent fills):
- `rgba(139,69,19,0.07)` — faint fill for secondary buttons
- `rgba(139,69,19,0.08)` — faint fill for icon buttons
- `rgba(139,69,19,0.12)` — mid fill for chapter pills, inactive chips
- `rgba(139,69,19,0.15)` — strong fill for chips, badge backgrounds

Rule: anything tinted in parchment mode is `--parch-accent` × some transparency. Never invent a fresh color.

### 3.3 Typography

**Font stacks:**
- **Serif (content):** `'EB Garamond', serif` — page-heading, sub-heading, page-body, note-text, notes-heading, modal-title, modal-desc, note-textarea, empty-notes.
- **Sans (UI):** `'Lato', sans-serif` — weights 300, 400, 700. Tabs, buttons, badges, meta text, book-title, chapter labels, page indicators.

**Type Scale:**

| Element | Family | Size | Weight | Line-height | Other |
|---|---|---|---|---|---|
| `lib-wordmark` | EB Garamond | 22px | 600 | — | letter-spacing 0.5px |
| `lib-heading` | EB Garamond | 32px | 600 | — | — |
| `lib-sub` | Lato | 14px | — | — | opacity 0.6 |
| `book-card-domain` | Lato | 10px | 700 | — | uppercase, letter-spacing 2px |
| `book-card-title` | EB Garamond | 20px | 600 | 1.25 | — |
| `book-card-meta` | Lato | 12px | — | — | — |
| `book-card-open` | Lato | 12px | 700 | — | letter-spacing 0.5px |
| `theme-badge` | Lato | 10px | 700 | — | — |
| `book-title-bar` | EB Garamond | 17px | 600 | — | letter-spacing 0.3px |
| `tab` | Lato | 13px | 700 | — | letter-spacing 0.3px |
| `chapter-label` | Lato | 11px | 700 | — | uppercase, letter-spacing 2px |
| `page-heading` | EB Garamond | 28px | 600 | 1.2 | — |
| `sub-heading` | EB Garamond | 17px | 600 | — | italic |
| `page-body` | EB Garamond | 17px | — | **1.85** | paragraphs mb 14px; list items 6px |
| `page-footer` | Lato | 12px | — | — | — |
| `notes-heading` | EB Garamond | 24px | 600 | — | — |
| `all-notes-heading` | EB Garamond | 28px | 600 | — | — |
| `notes-chapter-title` | Lato | 13px | 700 | — | uppercase, letter-spacing 1.5px |
| `note-text` | EB Garamond | 15px | — | 1.6 | — |
| `note-meta` | Lato | 11px | — | — | — |
| `note-type-badge` | Lato | 10px | 700 | — | uppercase, letter-spacing 1px |
| `icon-btn` | Lato | 13px | 700 | — | — |
| `back-btn` | Lato | 13px | 700 | — | — |
| `pnav-btn` | Lato | 14px | 700 | — | — |
| `ch-btn` | Lato | 12px | 700 | — | — |
| Floating note btn | Lato | 14px | 700 | — | — |
| Modal title | EB Garamond | 20px | 600 | — | — |
| Modal desc | Lato | 12px | — | — | italic |
| Note textarea | EB Garamond | 15px | — | 1.6 | — |
| Page indicator | Lato | 13px | — | — | — |
| `bnr-domain` | Lato | 10px | 700 | — | uppercase, letter-spacing 2px |
| `bnr-title` | EB Garamond | 19px | 600 | — | — |
| `bnr-counts` | Lato | 12px | — | — | — |
| `bnr-open` | Lato | 12px | 700 | — | — |
| `bntog` | Lato | 13px | 700 | — | — |
| `open-in-book-btn` | Lato | 11px | 700 | — | — |

---

## 4. Theme Variations

### 4.1 Modern

A dark, minimal, editorial aesthetic. Think: dark-mode reading app with warm terracotta accents.

| Token | Hex | Personality |
|---|---|---|
| `--mod-bg` | `#1C1B19` | Near-black warm gray (desk) |
| `--mod-page` | `#242320` | Slightly lighter warm gray (page) |
| `--mod-text` | `#F0EDE6` | Off-white, warm (reading text) |
| `--mod-text2` | `#7A7870` | Mid gray (secondary) |
| `--mod-accent` | `#C96442` | Terracotta/rust (ink, headings, active states) |
| `--mod-border` | `rgba(255,255,255,0.08)` | Very faint white (borders, dividers) |
| `--mod-border-mid` | `rgba(255,255,255,0.13)` | Slightly more visible white (interactive borders) |
| `--mod-tab` | `#1C1B19` | Same as bg (top bar blends into background) |

**Key differences from Parchment:**
- Borders are `0.5px solid` (not `1px`) — subtler, more modern feel
- No box-shadow on page-spread (flat aesthetic)
- Hover states: background shifts to `#2E2D2A` (cards) or `rgba(201,100,66,0.15)` (accent dim fill)
- Active tabs use terracotta accent with transparent bottom border
- Chapter pills use transparent fills with `0.5px` borders
- Theme toggle symbol: `✦ Modern`
- **Not available for books with `defaultTheme: 'veil'`** — veil books can only use Veil and Parchment

**Overlay tints:**
- `rgba(201,100,66,0.15)` — accent dim fill for buttons, chips, active states

### 4.2 Current

A deep blue, tech-forward aesthetic. Evokes a focused, slightly futuristic reading environment.

| Token | Hex | Personality |
|---|---|---|
| `--flow-bg` | `#0D1F2D` | Deep navy (desk) |
| `--flow-page` | `#112233` | Slightly lighter navy (page) |
| `--flow-text` | `#E8F4F8` | Cool white (reading text) |
| `--flow-text2` | `#5B8FA8` | Muted teal (secondary) |
| `--flow-accent` | `#00C2CC` | Bright cyan/teal (ink, headings, active states) |
| `--flow-border` | `rgba(0,194,204,0.15)` | Faint cyan (borders) |
| `--flow-border-mid` | `rgba(0,194,204,0.25)` | Medium cyan (interactive borders) |
| `--flow-tab` | `#0A1A26` | Darkest navy (top bar) |

**Key differences from Parchment:**
- Borders are `0.5px solid`
- Page-spread gets a subtle glow shadow: `box-shadow: 0 0 32px rgba(0,194,204,0.05)`
- Accent is a vibrant cyan, not a muted brown — much higher contrast
- Hover states use `rgba(0,194,204,0.12)` dim fills
- Active tabs: bright cyan text with cyan bottom border
- Chapter pills: transparent with cyan tinted fills
- Theme toggle symbol: `◆ Current`
- **Only available for books with `defaultTheme: 'current'`**

**Overlay tints:**
- `rgba(0,194,204,0.12)` — accent dim fill
- `rgba(0,194,204,0.05)` — very faint fill for buttons
- `rgba(0,194,204,0.1)` — mid fill for flip indicators

### 4.3 Veil

A mystical, dark purple with gold accents. Evokes esoteric manuscripts and ceremonial aesthetics.

| Token | Hex | Personality |
|---|---|---|
| `--veil-bg` | `#0D0B14` | Near-black with purple undertone (desk) |
| `--veil-page` | `#14111E` | Dark purple-gray (page) |
| `--veil-text` | `#D8D4E8` | Lavender white (reading text) |
| `--veil-text2` | `#6E6880` | Muted purple (secondary) |
| `--veil-accent` | `#B8962E` | Old gold (ink, headings, active states) |
| `--veil-border` | `rgba(255,255,255,0.07)` | Very faint white (borders) |
| `--veil-border-mid` | `rgba(255,255,255,0.12)` | Slightly visible white (interactive borders) |
| `--veil-tab` | `#100E18` | Darkest purple-black (top bar) |

**Key differences from Parchment:**
- Borders are `0.5px solid`
- No box-shadow on page-spread (flat, like Modern)
- Gold accent (`#B8962E`) replaces saddle brown — regal, esoteric feel
- Hover states use `rgba(184,150,46,0.14)` dim fills
- Active tabs: gold text with gold bottom border
- Chapter pills: gold-tinted transparent fills
- Theme toggle symbol: `✧ Veil`
- **Only available for books with `defaultTheme: 'veil'`**

**Overlay tints:**
- `rgba(184,150,46,0.14)` — accent dim fill
- `rgba(184,150,46,0.05)` — very faint fill for back buttons
- `rgba(184,150,46,0.12)` — mid fill for flip indicators
- `rgba(184,150,46,0.18)` — strong fill for page note badges
- `rgba(184,150,46,0.22)` — hover fill for buttons and chips

### 4.4 Theme Availability Matrix

| Book Theme | Available Reader Themes |
|---|---|
| `parchment` | Parchment, Modern |
| `modern` | Parchment, Modern |
| `current` | Parchment, Current |
| `veil` | Parchment, Veil |

The library screen cycles only between Parchment and Modern. The reader screen cycles through themes available for the current book's default.

---

## 5. Screen Inventory

### 5.1 Library Screen

The top-level view. Contains:
- **Top bar**: sticky, wordmark "📖 My Library" (left), theme toggle button (right)
- **Tab bar**: "📖 Books" / "🗒 All Notes" — switches between two panels
- **Books panel**: heading, subtitle (book count + instruction), responsive book grid
- **All Notes panel**: heading, subtitle, list of books with note counts

#### Book Card
- Responsive grid: `grid-template-columns: repeat(auto-fill, minmax(240px, 1fr))`, 18px gap
- Each card has: left spine (4px wide, colored by book's default theme), domain label, title, theme badge (dot + label), metadata row (chapters, pages, notes, date), "Open book →" link
- Hover: `translateY(-3px)`, border color shift, gap increase on "Open book" text
- Cards are clickable, opening the reader

#### All Notes List
- Book-level rows: each row shows book domain, title, note counts by type (📖 book, 📜 chapter, 🖊 page), "View notes →"
- Rows are clickable, opening the Book Notes Detail screen
- Empty state: centered italic serif text

### 5.2 Book Notes Detail Screen

Dedicated screen for browsing notes within a specific book. Contains:
- **Top bar**: "← All Notes" back button, book title, spacer
- **Toggle bar**: three `bntog` buttons — "📖 Book" / "📜 Chapter" / "🖊 Page" — filters notes by type
- **Content area**: notes grouped by the selected filter, each with "Open in Book →" button

#### Note Detail Card
- Same visual structure as in-reader notes
- Footer includes: meta text (location + date) and "Open in Book →" button
- "Open in Book →" opens the reader at the note's page

### 5.3 Reader Screen

The main reading interface. Contains:
- **Top bar**: "← Library" back button, book title, theme toggle
- **Tab bar**: "📖 Read" / "🗒 Notes"
- **Chapter nav**: horizontal scrollable row of pill buttons (one per chapter)
- **View area**: switches between page-view and notes-view

#### Page View
- **Page spread**: the centerpiece. Contains flip zones (left/right invisible hit areas with ‹ › indicators), page content, and the vertical spine line
- **Page content**: chapter label → page heading (with optional inline note count button) → page body (prose) → footer (page label + "Page X of Y")
- **Page navigation**: prev/next buttons + page indicator

#### Notes View
- Heading with "← Back" inline button
- Notes grouped by chapter, with "Book Notes" section at bottom
- Empty state: centered italic serif text

---

## 6. Component Patterns

### 6.1 Top Bars (Shared)

Three top bars exist: library top bar, reader top bar, book-notes-detail top bar. All share:
- Sticky at `top: 0`, `z-index: 100`
- `padding: 12–16px 16px`, bottom border (1px in parchment, 0.5px in dark themes)
- `display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px`
- Background from theme's `--{t}-tab` token

### 6.2 Buttons

**Back button (`back-btn`)**: serif label, 1.5px border, 8px radius, 6px 12px padding.
- Parchment: border + text in accent. Hover: full accent fill, white text.
- Modern/Veil: border in mid-border, text in text2. Hover: accent dim fill + accent text + border shift.
- Current: same pattern with cyan.

**Icon button (`icon-btn`)**: 8px radius, 1.5px border, translucent fill, 6px 10px padding. Same hover inversion pattern.

**Chapter pill (`ch-btn`)**: `border-radius: 20px`, `padding: 5px 14px`, font-size 12px, horizontal scrollable row with `scrollbar-width: none`.
- Parchment: `rgba(139,69,19,0.12)` bg, `1.5px #A0722A` border, `#3A2008` text. Hover/active: accent fill, white text.
- Modern: transparent bg, `0.5px mod-border` border, text2 text. Hover/active: accent dim fill, accent text, accent border.
- Current/Veil: same pattern with their respective accent colors.

**Prev/Next (`pnav-btn`)**: same inversion pattern as icon buttons, 18px horizontal padding, 14px font. Disabled: 30% opacity.

**Note type selector (`note-type-btn`)**: equal-flex row of three. Default: border + text2 text. Selected: accent fill + accent text (parchment) or accent dim fill + accent text (dark themes).

**Save / Cancel**: Save is `flex: 1`, solid accent fill, theme-appropriate text. Cancel is bordered ghost.

**Floating "Add Note" button**: fixed bottom-right (24px/24px), `border-radius: 50px`, `padding: 12px 20px`, accent fill, shadow, `z-index: 200`. Hides on Notes tab. Hover: `scale(1.05)`.

**Toggle buttons (`bntog`)**: flex 1, `max-width: 140px`, 8px radius, border. Active state mirrors chapter pill active pattern.

**Open in Book button (`open-in-book-btn`)**: 11px, 700 weight, 8px radius, 4px 11px padding. Same border/fill inversion pattern.

### 6.3 Tabs

**Reader tabs**: full-width bar with 2px bottom border (parchment) or 0.5px (dark themes). Each tab: 10px 18px padding, 13px bold Lato, no background. Active: accent text + `border-bottom: 3px solid accent` with `margin-bottom: -2px` to sit inside the bar's border.

**Library tabs**: identical pattern, applied at the library level.

### 6.4 Book Cards

- `border-radius: 12px`, `padding: 22px 20px`, `cursor: pointer`, `transition: all 0.22s`
- 4px left spine colored by book's default theme accent
- Theme badge: inline-flex, 10px font, dot + label, background uses theme accent at 22% opacity with 55% opacity border
- Hover: `translateY(-3px)`, border color shifts to accent or mid-border

### 6.5 Page Spread (Centerpiece)

- `margin: 20px 16px`, `padding: 40px 48px`, `min-height: 65vh`, `border-radius: 4px`
- `::before` pseudo-element: vertical spine line at `left: 40px` (`16px` on mobile), 1px wide, 30% opacity, accent color
- Contains: flip zones (invisible, pointer-events, z-index 10), page content, page navigation
- Parchment only: `box-shadow: 3px 3px 12px rgba(139,69,19,0.15)`
- Current only: `box-shadow: 0 0 32px rgba(0,194,204,0.05)`
- Modern/Veil: no shadow (flat)

### 6.6 Note Cards

- `border-radius: 8px`, `padding: 12px 14px`, `margin-bottom: 10px`
- Type badge: 10px uppercase pill above body text
- Color coding:
  - Page: brown tint (parchment) / cyan tint (current) / theme accent tint (modern/veil)
  - Chapter: green tint `rgba(80,160,80,0.15)` / `rgba(93,202,165,0.12)` (dark themes)
  - Book: blue tint `rgba(80,80,200,0.1)` / `rgba(133,183,235,0.12)` (dark themes)
- Delete button: absolute top-right, 16px, 40% opacity, 100% on hover

### 6.7 Note Modal

- Full-screen overlay `rgba(0,0,0,0.55)`, flex-centered, `z-index: 300`
- 420px max-width, `border-radius: 12px`, `padding: 24px`
- Sections: title → 3-way note type selector → italic description → textarea → save/cancel
- Textarea: theme background, theme text, theme border. Focus ring: accent color

### 6.8 Highlight Toolbar

- Fixed position, `z-index: 400`, appears above text selection
- White background (only white surface in any theme — purposeful for action surface)
- 4 swatch buttons (22px circles): yellow `#FFD700`, green `#50C864`, pink `#E060CC`, blue `#50A0FF`
- Clear button (×)
- Applied highlights: `<mark>` elements with `border-radius: 2px` and semi-transparent fills

---

## 7. Layout & Spacing

### 7.1 Reading Column
- `.book-container`: `max-width: 780px`, centered, `padding: 0 0 80px`
- `.page-spread`: `margin: 20px 16px`, `padding: 40px 48px`, `min-height: 65vh`
- Library container: `max-width: 860px`, centered, `padding: 0 16px 60px`

### 7.2 Mobile (< 600px)
- Page padding shrinks to `24px 20px`, margin to `12px 8px`
- Spine line: `left: 16px`
- Heading: 22px, body: 16px, book-title-bar: 14px
- Floating button: `bottom: 16px; right: 16px; padding: 10px 16px; font-size: 13px`
- Chapter nav: `padding: 8px 10px`
- Book grid: single column (`grid-template-columns: 1fr`)
- Library heading: 24px

---

## 8. Interactive Behavior

### 8.1 Page Flip Animation
- CSS keyframe animations: `exitLeft`, `exitRight`, `enterLeft`, `enterRight`
- Exit: `0.18s cubic-bezier(0.4,0,1,1)` — slides content out + fades + scales to 0.97
- Enter: `0.28s cubic-bezier(0,0,0.2,1)` — slides content in from opposite side + fades in + scales from 0.98
- Direction: `'left'` for forward flip, `'right'` for backward

### 8.2 Touch Swipe
- Horizontal swipe on page-spread, 40px threshold, must dominate vertical delta
- Calls `flipPage(1)` or `flipPage(-1)` based on direction

### 8.3 Theme Switching
- Reader: cycles through available themes for the book (see availability matrix)
- Library: cycles between Parchment and Modern only
- `0.4s transition` on `background` property only
- Button label updates: `🕯 Parchment` ↔ `✦ Modern` ↔ `◆ Current` ↔ `✧ Veil`
- Theme preference persisted per book in localStorage

### 8.4 Text Selection → Highlight
- Mouseup on `.page-body` with non-empty selection shows the highlight toolbar
- Toolbar positions above the selection range, centered horizontally
- Selection outside page content or on toolbar click dismisses it
- Highlights saved per page index, restored on page render

### 8.5 Note System
- Three note types: Page (attached to current page), Chapter (attached to current chapter), Book (general)
- Notes persisted per book in localStorage as JSON array
- Note count badge appears on page headings when chapter has notes
- Floating "Add Note" button visible only on Read tab

### 8.6 Screen Transitions
- Library → Reader: `openBook()` sets up state, shows reader screen
- Reader → Library: `goToLibrary()` saves position, restores library theme, shows library
- Library → Book Notes Detail: `openBookNotesDetail()` applies book's default theme
- Book Notes Detail → Library: `goToAllNotes()` restores library theme, ensures All Notes tab active
- Book Notes Detail → Reader: `openBookAtPage()` opens book and jumps to specific page

---

## 9. Data Model

### 9.1 Book Structure (Hardcoded → Future: User Import)
```
Book {
  id: string           // unique identifier
  title: string
  domain: string       // e.g. "Psychology & Philosophy"
  date: string         // e.g. "Jun 2025"
  defaultTheme: string // "parchment" | "modern" | "current" | "veil"
  chapters: Chapter[]
}

Chapter {
  id: string
  title: string
  label: string        // e.g. "Chapter I", "Intro · Part 1"
  pages: Page[]
}

Page {
  heading: string
  label: string        // e.g. "Chapter I · Part 1"
  body: string         // HTML content
}
```

### 9.2 Persisted State (localStorage)
| Key | Value | Scope |
|---|---|---|
| `page_{bookId}` | number (page index) | Per book |
| `theme_{bookId}` | string (theme name) | Per book |
| `notes_{bookId}` | Note[] JSON | Per book |
| `highlights_{bookId}` | `{page_N: [{color, text}]}` | Per book |

### 9.3 Note Structure
```
Note {
  type: "page" | "chapter" | "book"
  text: string
  chapterId: string
  chapterTitle: string
  pageLabel: string | null   // null for chapter/book notes
  date: string               // "7 Jun 2026" format (en-GB)
}
```

---

## 10. Accessibility & Semantics

- Text is selectable on page-spread (`user-select: text`), not on UI chrome
- Disabled controls: 30% opacity, `:hover:not(:disabled)` prevents hover
- Modal: `display: none` → `.open` → `display: flex` (not opacity-based)
- Highlight toolbar: `display: none` ↔ `display: flex` (never leaks behind closed state)
- Color contrast: dark brown `#2C2416` on cream `#FBF7EF` exceeds WCAG AA for body text
- Dark themes: light text on dark backgrounds achieve similar contrast ratios
- Modal actions: full-width-tap on mobile via `flex: 1` on primary button

---

## 11. Iconography & Microcopy

**Emoji inventory (all themes):**
- 📖 → Read tab, book cards
- 🗒 → Notes tab, all notes
- ✎ → Add Note (floating button)
- 🕯 → Parchment theme toggle
- ✦ → Modern theme toggle
- ◆ → Current theme toggle
- ✧ → Veil theme toggle
- ‹ › → page-flip indicators
- ← → → Previous / Next / Back buttons
- ✕ → delete note / clear highlight
- 📜 → Chapter notes badge
- 🖊 → Page notes badge
- 📅 → Date in metadata

**Text labels always accompany emoji** — never use emoji alone for interactive controls.

**Date format**: British (`en-GB`): `{ day: 'numeric', month: 'short', year: 'numeric' }` → "7 Jun 2026"

**Number formatting**: Pluralized inline: "2 notes" / "1 note"

---

## 12. Do / Don't Summary

**Do**
- Use `--{theme}-*` CSS variables, never hex literals, in component code
- Pair EB Garamond with Lato — maintain the two-family contract
- Use `1.85` line-height on body prose and `1.6` on shorter passages
- Keep pages lighter than the desk (page > bg in lightness)
- Preserve the spine line on every page surface
- Invert to accent-fill + white/text on primary hover states
- Persist all user state in localStorage per book
- Show note count badges on chapter headings when notes exist

**Don't**
- Don't introduce pure black, pure white, or cool grays into parchment surfaces
- Don't add a third font family
- Don't use rounded corners above `12px` for desk-sitting surfaces (floating pills are the exception)
- Don't animate scale, bounce, or springy transitions — all motion is linear or eased, under 400ms
- Don't use bright, saturated colors for highlights — semi-transparent `<mark>` fills are the only non-palette colors in content
- Don't hardcode hex values — always derive from CSS variables
- Don't mix theme tokens across themes (e.g., `--parch-accent` in a `.modern` context)
