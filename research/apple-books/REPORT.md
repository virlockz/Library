# Apple Books Research Report

> Date: 2026-07-15
> Depth: Standard (6 parallel sub-agents)

## Summary

Researched Apple Books iPhone app across 6 angles: library screen, reader screen, control panels, theme system, highlights/notes, and search/navigation. Key findings were implemented into both the React Native app and the HTML preview.

---

## Key Findings Implemented

### 1. Theme Colors (Corrected)
- **Night theme**: Page `#121212`, text `#BEBEBE`, accent `#0A84FF` (was: page `#000000`, text `#FFFFFF`, accent `#FFD60A`)
- **Sepia theme**: Page `#F8F1E3`, text `#000000`, accent `#007AFF` (was: page `#FBF0DC`, text `#3D2B1F`, accent `#A0522D`)

### 2. Reader UX (Critical Changes)
- **Bottom toolbar now hidden by default** — appears on center-screen tap (Apple Books behavior)
- **Tap zones implemented**: Left 20% = prev page, Center 60% = toggle controls, Right 20% = next page
- **Thin progress bar at absolute bottom** (2pt height) — always visible even when toolbar is hidden

### 3. Library Grid
- **No titles under book covers** in grid view — Apple Books shows only covers
- **Grid gap reduced** to 10pt (was 16pt)
- **Book cover aspect ratio** changed to 2:3 (was 3:4)
- **Cover shadows** updated: 2-4pt offset, 8-12pt blur, 18% opacity

### 4. Highlight Colors
- **Added Purple** as 5th highlight color (Apple Books has 5: Yellow, Green, Blue, Pink, Purple)
- Updated Highlight type, constants, and HighlightToolbar component

### 5. ReadingProgressBar
- **Reduced to 2pt height** (was 3pt) — matches Apple Books' thin line style

### 6. Preview Updated
- All screens in preview.html updated to match the app changes
- Added "Reader (Clean)" screen showing toolbar hidden with thin progress bar
- Added highlight swatches with 5 colors (including Purple)
- Book covers use 2:3 aspect ratio
- Library grid shows no titles under covers

---

## Research Sources

1. Apple Support - iPhone User Guide (Books sections)
2. Apple Human Interface Guidelines - Color, Typography, Tab Bars, Navigation Bars
3. MacRumors - iOS 16 Books redesign coverage
4. Ebooks Stack Exchange - epub theme color measurements
5. Apple Developer Forums - Focus theme hex values
6. WWDC20 "The details of UI typography"
7. WWDC25 "Build a UIKit app with the new design" (Liquid Glass)
8. 9to5Mac, iMore - Apple Books feature analyses
9. Apple Books Asset Guide - epub CSS dark mode support

---

## Files Modified

### App (library-app/)
- `src/themes/tokens.ts` — Updated Sepia and Night theme colors
- `src/types/index.ts` — Added 'purple' to Highlight color type
- `src/constants/index.ts` — Updated HIGHLIGHT_COLORS array
- `src/components/BookCover.tsx` — 2:3 ratio, improved shadows
- `src/components/HighlightToolbar.tsx` — Added purple swatch
- `src/components/ReadingProgressBar.tsx` — Reduced to 2pt height
- `src/components/ThinProgressBar.tsx` — NEW: thin progress bar at absolute bottom
- `app/(tabs)/library.tsx` — Removed titles from grid, reduced gap
- `app/reader/[id].tsx` — Tap zones, hidden toolbar, thin progress bar

### Preview
- `preview.html` — Updated all screens to match app changes

### Research
- `research/apple-books/REPORT.md` — This report
- `research/apple-books/findings/F1-F6.md` — Raw research findings
