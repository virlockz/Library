import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useLibrary } from '../../src/contexts/LibraryContext';
import { useReadingPosition } from '../../src/hooks/useReadingPosition';
import { useNotes } from '../../src/hooks/useNotes';
import { useHighlights } from '../../src/hooks/useHighlights';
import { useBookmarks } from '../../src/hooks/useBookmarks';
import { useReadingSettings } from '../../src/hooks/useReadingSettings';
import { useReadingStats } from '../../src/hooks/useReadingStats';
import { useRecentlyOpened } from '../../src/hooks/useRecentlyOpened';
import { ThemeToggle } from '../../src/components/ThemeToggle';
import { ChapterNav } from '../../src/components/ChapterNav';
import { PageSpread } from '../../src/components/PageSpread';
import { NoteModal } from '../../src/components/NoteModal';
import { NoteCard } from '../../src/components/NoteCard';
import { EpubReader } from '../../src/components/EpubReader';
import { ReadingProgressBar } from '../../src/components/ReadingProgressBar';
import { TypographyControls } from '../../src/components/TypographyControls';
import { TOCModal } from '../../src/components/TOCModal';
import { ExportNotes } from '../../src/components/ExportNotes';
import { THEME_AVAILABILITY } from '../../src/constants';
import { FONTS } from '../../src/constants/fonts';
import { ThemeName, Chapter, Page } from '../../src/types';

export default function ReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tokens } = useTheme();
  const { getBook } = useLibrary();
  const bookId = id || '';
  const { position, savePosition } = useReadingPosition(bookId);
  const { notes, addNote, deleteNote } = useNotes(bookId);
  const { highlights, addHighlight } = useHighlights(bookId);
  const { bookmarks, addBookmark, removeBookmark, isBookmarked } = useBookmarks(bookId);
  const { settings } = useReadingSettings();
  const { recordPageRead, recordBookOpened, recordReadingTime } = useReadingStats();
  const { recordOpen } = useRecentlyOpened();
  const router = useRouter();
  const readingStartTime = useRef(Date.now());

  const book = getBook(bookId);

  useEffect(() => {
    if (book) recordBookOpened();
    return () => {
      const elapsed = Date.now() - readingStartTime.current;
      if (elapsed > 5000) recordReadingTime(elapsed);
    };
  }, []);

  useEffect(() => {
    if (book) recordOpen(bookId);
  }, [bookId]);

  if (!book) {
    return (
      <View style={[styles.container, { backgroundColor: tokens.bg, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: tokens.text }}>Book not found</Text>
      </View>
    );
  }

  const availableThemes = (THEME_AVAILABILITY[book.defaultTheme] || ['parchment', 'modern']) as ThemeName[];
  const [activeTab, setActiveTab] = useState<'read' | 'notes'>('read');
  const [activeChapter, setActiveChapter] = useState(book.chapters[0]?.id || '');
  const [currentPage, setCurrentPage] = useState(0);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [typographyVisible, setTypographyVisible] = useState(false);
  const [tocVisible, setTocVisible] = useState(false);
  const [exportVisible, setExportVisible] = useState(false);

  useEffect(() => {
    if (position > 0 && position < book.pageCount) {
      setCurrentPage(position);
    }
  }, [position, book.pageCount]);

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
      recordPageRead();
    }
  };

  let pageIdx = 0;
  let currentPageData: (Page & { chapter: Chapter }) | null = null;
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

  const handleAddNote = async (type: 'page' | 'chapter' | 'book', text: string) => {
    await addNote({
      type,
      text,
      bookId: id!,
      chapterId: currentChapter?.id || '',
      chapterTitle: currentChapter?.title || '',
      pageLabel: currentPageData?.label || null,
      pageIndex: currentPage,
    });
  };

  const handleToggleBookmark = () => {
    if (isBookmarked(currentPage)) {
      const bm = bookmarks.find((b) => b.pageIndex === currentPage);
      if (bm) removeBookmark(bm.id);
    } else {
      addBookmark(currentPage, currentPageData?.heading || `Page ${currentPage + 1}`);
    }
  };

  const progress = book.pageCount > 0 ? ((currentPage + 1) / book.pageCount) * 100 : 0;
  const bookmarked = isBookmarked(currentPage);

  return (
    <View style={[styles.container, { backgroundColor: tokens.bg }]}>
      <ReadingProgressBar progress={progress} />

      {/* Top Bar */}
      <View style={[styles.topbar, { backgroundColor: tokens.tab, borderBottomColor: tokens.border }]}>
        <TouchableOpacity style={[styles.backBtn, { borderColor: tokens.border }]} onPress={() => router.back()}>
          <Text style={{ color: tokens.accent, fontFamily: FONTS.sansBold, fontSize: 13 }}>← Library</Text>
        </TouchableOpacity>
        <View style={styles.topbarRight}>
          <TouchableOpacity style={[styles.iconBtn, { borderColor: tokens.border }]} onPress={() => setTocVisible(true)}>
            <Text style={{ color: tokens.accent, fontSize: 16 }}>☰</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, { borderColor: tokens.border }]} onPress={() => setTypographyVisible(true)}>
            <Text style={{ color: tokens.accent, fontSize: 16 }}>Aa</Text>
          </TouchableOpacity>
          <ThemeToggle availableThemes={availableThemes} />
        </View>
      </View>
      <View style={[styles.titleBar, { backgroundColor: tokens.tab, borderBottomColor: tokens.border }]}>
        <Text style={[styles.titleBarText, { color: tokens.accent }]} numberOfLines={1}>
          {book.title}
        </Text>
      </View>

      {/* Tab Bar */}
      <View style={[styles.tabBar, { borderBottomColor: tokens.border }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'read' && { borderBottomColor: tokens.accent }]}
          onPress={() => setActiveTab('read')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'read' ? tokens.accent : tokens.text2 }]}>
            📖 Read
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'notes' && { borderBottomColor: tokens.accent }]}
          onPress={() => setActiveTab('notes')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'notes' ? tokens.accent : tokens.text2 }]}>
            🗒 Notes ({notes.length})
          </Text>
        </TouchableOpacity>
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
            <View style={styles.pageHeader}>
              <View style={styles.pageHeaderLeft}>
                <Text style={[styles.chapterLabel, { color: tokens.accent }]}>
                  {currentPageData.chapter?.label}
                </Text>
                <Text style={[styles.pageHeading, { color: tokens.accent }]}>
                  {currentPageData.heading}
                </Text>
                <Text style={[styles.pageLabel, { color: tokens.text2 }]}>
                  {currentPageData.label}
                </Text>
              </View>
              <TouchableOpacity onPress={handleToggleBookmark}>
                <Text style={{ fontSize: 22 }}>{bookmarked ? '🔖' : '📑'}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.pageBody}>
              {(book.sourceType === 'epub' || book.sourceType === 'pdf') ? (
                <EpubReader
                  html={currentPageData.body}
                  fontSize={settings.fontSize}
                  lineHeight={settings.lineHeight}
                />
              ) : (
                <Text style={[styles.bodyText, {
                  color: tokens.text,
                  fontSize: settings.fontSize,
                  lineHeight: settings.fontSize * settings.lineHeight,
                }]}>
                  {currentPageData.body.replace(/<[^>]+>/g, '')}
                </Text>
              )}
            </View>
          </PageSpread>
        </ScrollView>
      )}

      {/* Notes View */}
      {activeTab === 'notes' && (
        <ScrollView style={styles.notesView}>
          <View style={styles.notesHeader}>
            <Text style={[styles.notesHeading, { color: tokens.accent }]}>
              Your Notes
            </Text>
            {notes.length > 0 && (
              <TouchableOpacity onPress={() => setExportVisible(true)}>
                <Text style={[styles.exportBtn, { color: tokens.accent }]}>Export</Text>
              </TouchableOpacity>
            )}
          </View>
          {bookmarks.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: tokens.accent }]}>🔖 Bookmarks</Text>
              {bookmarks.map((bm) => (
                <TouchableOpacity
                  key={bm.id}
                  style={[styles.bookmarkRow, { borderBottomColor: tokens.border }]}
                  onPress={() => { setCurrentPage(bm.pageIndex); savePosition(bm.pageIndex); setActiveTab('read'); }}
                >
                  <Text style={[styles.bookmarkText, { color: tokens.text }]}>{bm.label}</Text>
                  <Text style={[styles.bookmarkMeta, { color: tokens.text2 }]}>Page {bm.pageIndex + 1} · {bm.date}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {notes.length === 0 ? (
            <Text style={[styles.emptyNotes, { color: tokens.text2 }]}>
              No notes yet. Use the floating button to add one.
            </Text>
          ) : (
            notes.map((note) => (
              <NoteCard key={note.id} note={note} onDelete={deleteNote} />
            ))
          )}
        </ScrollView>
      )}

      {/* Floating Add Note Button */}
      {activeTab === 'read' && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: tokens.accent }]}
          onPress={() => setNoteModalVisible(true)}
        >
          <Text style={styles.fabText}>✎ Add Note</Text>
        </TouchableOpacity>
      )}

      {/* Modals */}
      <NoteModal
        visible={noteModalVisible}
        onClose={() => setNoteModalVisible(false)}
        onSave={handleAddNote}
      />
      <TypographyControls
        visible={typographyVisible}
        onClose={() => setTypographyVisible(false)}
      />
      <TOCModal
        visible={tocVisible}
        chapters={book.chapters}
        activeChapterId={currentChapter?.id || ''}
        onSelect={handleChapterSelect}
        onClose={() => setTocVisible(false)}
      />
      <ExportNotes
        visible={exportVisible}
        notes={notes}
        bookTitle={book.title}
        onClose={() => setExportVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 40 : 50,
    paddingBottom: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backBtn: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  topbarRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  titleBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  titleBarText: {
    fontFamily: FONTS.serifBold,
    fontSize: 17,
    textAlign: 'center',
  },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { padding: 10, paddingHorizontal: 18, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabText: { fontFamily: FONTS.sansBold, fontSize: 13 },
  scrollContent: { flex: 1 },
  pageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  pageHeaderLeft: { flex: 1 },
  chapterLabel: {
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  pageHeading: {
    fontFamily: FONTS.serifBold,
    fontSize: 28,
    lineHeight: 34,
    marginBottom: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  pageLabel: { fontFamily: FONTS.sans, fontSize: 12, marginBottom: 16, fontStyle: 'italic' },
  pageBody: { marginTop: 8 },
  bodyText: { fontFamily: FONTS.serif, fontSize: 17, lineHeight: 31 },
  notesView: { flex: 1, padding: 20 },
  notesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  notesHeading: { fontFamily: FONTS.serifBold, fontSize: 24 },
  exportBtn: { fontFamily: FONTS.sansBold, fontSize: 13 },
  section: { marginBottom: 20 },
  sectionTitle: { fontFamily: FONTS.sansBold, fontSize: 13, letterSpacing: 1, marginBottom: 8 },
  bookmarkRow: { paddingVertical: 10, borderBottomWidth: 0.5 },
  bookmarkText: { fontFamily: FONTS.serif, fontSize: 15 },
  bookmarkMeta: { fontFamily: FONTS.sans, fontSize: 11, marginTop: 2 },
  emptyNotes: {
    fontFamily: FONTS.serif,
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 40,
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 24,
    borderRadius: 50,
    paddingHorizontal: 20,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    color: '#fff',
    fontFamily: FONTS.sansBold,
    fontSize: 14,
  },
});
