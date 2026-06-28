import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useLibrary } from '../../src/contexts/LibraryContext';
import { useReadingPosition } from '../../src/hooks/useReadingPosition';
import { useNotes } from '../../src/hooks/useNotes';
import { useHighlights } from '../../src/hooks/useHighlights';
import { ThemeToggle } from '../../src/components/ThemeToggle';
import { ChapterNav } from '../../src/components/ChapterNav';
import { PageSpread } from '../../src/components/PageSpread';
import { NoteModal } from '../../src/components/NoteModal';
import { NoteCard } from '../../src/components/NoteCard';
import { EpubReader } from '../../src/components/EpubReader';
import { THEME_AVAILABILITY } from '../../src/constants';
import { FONTS } from '../../src/constants/fonts';
import { ThemeName, Chapter, Page } from '../../src/types';

export default function ReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tokens } = useTheme();
  const { getBook } = useLibrary();
  const { position, savePosition } = useReadingPosition(id!);
  const { notes, addNote, deleteNote } = useNotes(id!);
  const { highlights, addHighlight } = useHighlights(id!);
  const router = useRouter();

  const book = getBook(id!);
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
  const [currentPage, setCurrentPage] = useState(position);
  const [noteModalVisible, setNoteModalVisible] = useState(false);

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
              {(book.sourceType === 'epub' || book.sourceType === 'pdf') ? (
                <EpubReader html={currentPageData.body} />
              ) : (
                <Text style={[styles.bodyText, { color: tokens.text }]}>
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
          <Text style={[styles.notesHeading, { color: tokens.accent }]}>
            Your Notes
          </Text>
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
        <View style={[styles.fab, { backgroundColor: tokens.accent }]}>
          <Text style={styles.fabText} onPress={() => setNoteModalVisible(true)}>
            ✎ Add Note
          </Text>
        </View>
      )}

      {/* Note Modal */}
      <NoteModal
        visible={noteModalVisible}
        onClose={() => setNoteModalVisible(false)}
        onSave={handleAddNote}
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
    padding: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backBtn: { fontFamily: FONTS.sansBold, fontSize: 13 },
  titleBar: {
    fontFamily: FONTS.serifBold,
    fontSize: 17,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { padding: 10, paddingHorizontal: 18, fontFamily: FONTS.sansBold, fontSize: 13 },
  scrollContent: { flex: 1 },
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
  notesHeading: { fontFamily: FONTS.serifBold, fontSize: 24, marginBottom: 20 },
  emptyNotes: {
    fontFamily: FONTS.serif,
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 40,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
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
