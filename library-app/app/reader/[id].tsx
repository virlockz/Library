import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, Animated, PanResponder, Dimensions, Modal, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { X, BookmarkSimple, Bookmark, MagnifyingGlass, Sun } from 'phosphor-react-native';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useLibrary } from '../../src/contexts/LibraryContext';
import { useReadingPosition } from '../../src/hooks/useReadingPosition';
import { useNotes } from '../../src/hooks/useNotes';
import { useHighlights } from '../../src/hooks/useHighlights';
import { useBookmarks } from '../../src/hooks/useBookmarks';
import { useReadingSettings } from '../../src/hooks/useReadingSettings';
import { useReadingStats } from '../../src/hooks/useReadingStats';
import { useRecentlyOpened } from '../../src/hooks/useRecentlyOpened';
import { ReaderBottomToolbar } from '../../src/components/ReaderBottomToolbar';
import { ThinProgressBar } from '../../src/components/ThinProgressBar';
import { ThemeToggle } from '../../src/components/ThemeToggle';
import { ChapterNav } from '../../src/components/ChapterNav';
import { PageSpread } from '../../src/components/PageSpread';
import { NoteModal } from '../../src/components/NoteModal';
import { NoteCard } from '../../src/components/NoteCard';
import { EpubReader } from '../../src/components/EpubReader';
import { TypographyControls } from '../../src/components/TypographyControls';
import { TOCModal } from '../../src/components/TOCModal';
import { ExportNotes } from '../../src/components/ExportNotes';
import { THEME_AVAILABILITY, THEME_LABELS } from '../../src/constants';
import { THEME_TOKENS } from '../../src/themes/tokens';
import { FONTS } from '../../src/constants/fonts';
import { ThemeName, Chapter, Page } from '../../src/types';

export default function ReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tokens, theme, setTheme } = useTheme();
  const { getBook } = useLibrary();
  const bookId = id || '';
  const { position, savePosition } = useReadingPosition(bookId);
  const { notes, addNote, deleteNote } = useNotes(bookId);
  useHighlights(bookId);
  const { bookmarks, addBookmark, removeBookmark, isBookmarked } = useBookmarks(bookId);
  const { settings } = useReadingSettings();
  const { recordPageRead, recordBookOpened, recordReadingTime } = useReadingStats();
  const { recordOpen } = useRecentlyOpened();
  const router = useRouter();
  const readingStartTime = useRef(Date.now());

  const topBarAnim = useRef(new Animated.Value(0)).current;
  const dismissAnim = useRef(new Animated.Value(0)).current;
  const pageAnim = useRef(new Animated.Value(0)).current;
  const [controlsVisible, setControlsVisible] = useState(false);
  const scrollOffsetY = useRef(0);
  const isDismissing = useRef(false);
  const isAnimating = useRef(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const AUTO_HIDE_DELAY = 4000; // 4 seconds

  const startHideTimer = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setControlsVisible(false);
      Animated.timing(topBarAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    }, AUTO_HIDE_DELAY);
  };

  const stopHideTimer = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const dismissThreshold = Dimensions.get('window').height * 0.25;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 10 && Math.abs(gestureState.dx) < Math.abs(gestureState.dy) * 0.5 && scrollOffsetY.current <= 0 && !isDismissing.current;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          dismissAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > dismissThreshold) {
          isDismissing.current = true;
          Animated.timing(dismissAnim, {
            toValue: Dimensions.get('window').height,
            duration: 250,
            useNativeDriver: true,
          }).start(() => {
            const elapsed = Date.now() - readingStartTime.current;
            if (elapsed > 5000) recordReadingTime(elapsed);
            router.back();
          });
        } else {
          Animated.spring(dismissAnim, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 8,
          }).start();
        }
      },
    })
  ).current;

  const book = getBook(bookId);

  // ALL useState calls MUST be before any early return (Rules of Hooks)
  const availableThemes = (THEME_AVAILABILITY[book?.defaultTheme || 'light'] || ['light', 'sepia', 'dark', 'night']) as ThemeName[];
  const [activeTab, setActiveTab] = useState<'read' | 'notes'>('read');
  const [activeChapter, setActiveChapter] = useState(book?.chapters?.[0]?.id || '');
  const [currentPage, setCurrentPage] = useState(0);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [typographyVisible, setTypographyVisible] = useState(false);
  const [tocVisible, setTocVisible] = useState(false);
  const [exportVisible, setExportVisible] = useState(false);
  const [themePanelVisible, setThemePanelVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [brightness, setBrightness] = useState(100);
  const [contextMenuVisible, setContextMenuVisible] = useState(false);

  useEffect(() => {
    if (book) recordBookOpened();
    return () => {
      stopHideTimer();
      const elapsed = Date.now() - readingStartTime.current;
      if (elapsed > 5000) recordReadingTime(elapsed);
    };
  }, []);

  useEffect(() => {
    if (book) recordOpen(bookId);
  }, [bookId]);

  useEffect(() => {
    if (book && position > 0 && position < book.pageCount) {
      setCurrentPage(position);
    }
  }, [position, book?.pageCount]);

  if (!book) {
    return (
      <View style={[styles.container, { backgroundColor: tokens.bg, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: tokens.text }}>Book not found</Text>
      </View>
    );
  }

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
    if (isAnimating.current) return;
    const newPage = currentPage + delta;
    if (newPage >= 0 && newPage < book.pageCount) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      resetHideTimer();
      isAnimating.current = true;
      // Slide out current page
      Animated.timing(pageAnim, {
        toValue: delta > 0 ? -30 : 30,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        setCurrentPage(newPage);
        savePosition(newPage);
        recordPageRead();
        pageAnim.setValue(delta > 0 ? 30 : -30);
        // Slide in new page
        Animated.timing(pageAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          isAnimating.current = false;
        });
      });
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isBookmarked(currentPage)) {
      const bm = bookmarks.find((b) => b.pageIndex === currentPage);
      if (bm) removeBookmark(bm.id);
    } else {
      addBookmark(currentPage, currentPageData?.heading || `Page ${currentPage + 1}`);
    }
  };

  const toggleControls = () => {
    const show = !controlsVisible;
    setControlsVisible(show);
    Animated.timing(topBarAnim, { toValue: show ? 1 : 0, duration: 200, useNativeDriver: true }).start();
    if (show) startHideTimer();
    else stopHideTimer();
  };

  const resetHideTimer = () => {
    if (controlsVisible) startHideTimer();
  };

  const bookmarked = isBookmarked(currentPage);

  return (
    <View style={[styles.container, { backgroundColor: tokens.bg }]}>
      <Animated.View
        style={[
          styles.dismissContainer,
          {
            transform: [{ translateY: dismissAnim }],
            backgroundColor: tokens.bg,
          },
        ]}
        {...panResponder.panHandlers}
      >
        {/* Top Overlay — slides in on tap */}
        <Animated.View
          style={[
            styles.topOverlay,
            {
              backgroundColor: tokens.tab,
              borderBottomColor: tokens.border,
              opacity: topBarAnim,
              transform: [{ translateY: topBarAnim.interpolate({ inputRange: [0, 1], outputRange: [-80, 0] }) }],
            },
          ]}
          pointerEvents={controlsVisible ? 'auto' : 'none'}
        >
          <View style={styles.topOverlayRow}>
            <TouchableOpacity style={[styles.closeBtn, { borderColor: tokens.border }]} onPress={() => router.back()}>
              <X size={18} color={tokens.accent} weight="bold" />
            </TouchableOpacity>
            <Text style={[styles.topOverlayTitle, { color: tokens.text }]} numberOfLines={1}>
              {book.title}
            </Text>
            <View style={styles.topOverlayRight}>
              <TouchableOpacity style={[styles.iconBtn, { borderColor: tokens.border }]} onPress={handleToggleBookmark}>
                {bookmarked ? (
                  <Bookmark size={18} color={tokens.accent} weight="fill" />
                ) : (
                  <BookmarkSimple size={18} color={tokens.text2} weight="light" />
                )}
              </TouchableOpacity>
              <ThemeToggle availableThemes={availableThemes} />
            </View>
          </View>
        </Animated.View>

        {/* Content Area — tap zones: left 20% prev, center 60% toggle, right 20% next */}
        <View style={styles.contentArea}>
          <View style={styles.tapZoneLeft}>
            <TouchableOpacity style={styles.tapZone} activeOpacity={1} onPress={() => handlePageChange(-1)} />
          </View>
          <View style={styles.tapZoneCenter}>
            <TouchableOpacity style={styles.tapZone} activeOpacity={1} onPress={toggleControls} />
          </View>
          <View style={styles.tapZoneRight}>
            <TouchableOpacity style={styles.tapZone} activeOpacity={1} onPress={() => handlePageChange(1)} />
          </View>
          {/* Tab Bar (shown when controls visible) */}
          {controlsVisible && (
            <View style={[styles.tabBar, { borderBottomColor: tokens.border, backgroundColor: tokens.tab }]}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'read' && { borderBottomColor: tokens.accent }]}
                onPress={() => setActiveTab('read')}
              >
                <Text style={[styles.tabText, { color: activeTab === 'read' ? tokens.accent : tokens.text2 }]}>
                  Read
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'notes' && { borderBottomColor: tokens.accent }]}
                onPress={() => setActiveTab('notes')}
              >
                <Text style={[styles.tabText, { color: activeTab === 'notes' ? tokens.accent : tokens.text2 }]}>
                  Notes ({notes.length})
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Chapter Nav (shown when controls visible) */}
          {controlsVisible && activeTab === 'read' && (
            <ChapterNav
              chapters={book.chapters}
              activeChapterId={currentChapter?.id || ''}
              onSelect={(chId) => {
                handleChapterSelect(chId);
                setControlsVisible(false);
                Animated.timing(topBarAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
              }}
            />
          )}

          {/* Read View */}
          {activeTab === 'read' && currentPageData && (
            <ScrollView
              style={styles.scrollContent}
              contentContainerStyle={styles.scrollContentInner}
              onScroll={(e) => { scrollOffsetY.current = e.nativeEvent.contentOffset.y; }}
              scrollEventThrottle={16}
            >
              <Animated.View style={{ transform: [{ translateX: pageAnim }] }}>
              <PageSpread>
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
              </Animated.View>
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
                  <Text style={[styles.sectionTitle, { color: tokens.accent }]}>Bookmarks</Text>
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
                  No notes yet. Tap screen to add one.
                </Text>
              ) : (
                notes.map((note) => (
                  <NoteCard key={note.id} note={note} onDelete={deleteNote} />
                ))
              )}
            </ScrollView>
          )}
        </View>

        {/* Bottom Toolbar — hidden by default, appears on tap */}
        {controlsVisible && (
          <ReaderBottomToolbar
            pageNumber={currentPage}
            totalPages={book.pageCount}
            onPrev={() => handlePageChange(-1)}
            onNext={() => handlePageChange(1)}
            onFontPress={() => setTypographyVisible(true)}
            onTOCPress={() => setTocVisible(true)}
            onThemePress={() => setThemePanelVisible(true)}
            onMorePress={() => setContextMenuVisible(true)}
            onSearchPress={() => setSearchVisible(true)}
          />
        )}

        {/* Thin progress bar — ALWAYS visible at absolute bottom */}
        <ThinProgressBar
          progress={book.pageCount > 0 ? ((currentPage + 1) / book.pageCount) * 100 : 0}
          totalPages={book.pageCount}
          onSeek={(page) => { setCurrentPage(page); savePosition(page); }}
          chapterName={currentChapter?.title}
        />
      </Animated.View>

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
        bookId={bookId}
        onSelect={handleChapterSelect}
        onClose={() => setTocVisible(false)}
        onPageJump={(pageIndex) => { setCurrentPage(pageIndex); savePosition(pageIndex); }}
      />
      <ExportNotes
        visible={exportVisible}
        notes={notes}
        bookTitle={book.title}
        onClose={() => setExportVisible(false)}
      />

      {/* Theme Panel — 5 swatches + brightness slider */}
      <Modal visible={themePanelVisible} transparent animationType="slide">
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}
          activeOpacity={1}
          onPress={() => setThemePanelVisible(false)}
        >
          <View style={[styles.themePanel, { backgroundColor: tokens.page, borderTopColor: tokens.border }]}
            onStartShouldSetResponder={() => true}
          >
            <View style={[styles.handle, { backgroundColor: tokens.text2 }]} />

            <Text style={[styles.themeLabel, { color: tokens.text2 }]}>BRIGHTNESS</Text>
            <View style={styles.brightnessRow}>
              <Sun size={16} color={tokens.text2} weight="fill" />
              <View style={styles.brightnessTrack}>
                <View style={[styles.brightnessFill, { backgroundColor: tokens.accent, width: `${brightness}%` }]} />
              </View>
              <Sun size={20} color={tokens.text2} weight="fill" />
            </View>
            <View style={styles.brightnessStepper}>
              <TouchableOpacity onPress={() => setBrightness(Math.max(10, brightness - 10))}>
                <Text style={{ color: tokens.accent, fontFamily: FONTS.sansBold, fontSize: 14 }}>-</Text>
              </TouchableOpacity>
              <Text style={{ color: tokens.text, fontFamily: FONTS.sans, fontSize: 14 }}>{brightness}%</Text>
              <TouchableOpacity onPress={() => setBrightness(Math.min(100, brightness + 10))}>
                <Text style={{ color: tokens.accent, fontFamily: FONTS.sansBold, fontSize: 14 }}>+</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.themeLabel, { color: tokens.text2, marginTop: 20 }]}>THEME</Text>
            <View style={styles.themeSwatches}>
              {(['light', 'sepia', 'dark', 'night'] as ThemeName[]).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={styles.themeSwatchWrap}
                  onPress={() => { setTheme(t); setThemePanelVisible(false); }}
                >
                  <View style={[
                    styles.themeSwatch,
                    { backgroundColor: THEME_TOKENS[t].page, borderColor: THEME_TOKENS[t].border },
                    theme === t && { borderColor: tokens.accent, borderWidth: 3 },
                  ]} />
                  <Text style={[styles.themeSwatchLabel, { color: tokens.text }]}>{THEME_LABELS[t]}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Search in Book */}
      <Modal visible={searchVisible} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
          <View style={[styles.themePanel, { backgroundColor: tokens.page, borderTopColor: tokens.border }]}
            onStartShouldSetResponder={() => true}
          >
            <View style={[styles.handle, { backgroundColor: tokens.text2 }]} />
            <View style={[styles.searchBar, { backgroundColor: tokens.searchBg }]}>
              <MagnifyingGlass size={18} color={tokens.text2} weight="regular" />
              <TextInput
                style={[styles.searchInput, { color: tokens.text }]}
                placeholder="Search in book..."
                placeholderTextColor={tokens.text2}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <X size={16} color={tokens.text2} weight="fill" />
                </TouchableOpacity>
              )}
            </View>
            <Text style={[styles.searchResults, { color: tokens.text2 }]}>
              {searchQuery ? 'No results found' : 'Type to search'}
            </Text>
            <TouchableOpacity style={[styles.doneBtn, { backgroundColor: tokens.accent }]} onPress={() => setSearchVisible(false)}>
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Context Menu */}
      <Modal visible={contextMenuVisible} transparent animationType="fade">
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}
          activeOpacity={1}
          onPress={() => setContextMenuVisible(false)}
        >
          <View style={[styles.themePanel, { backgroundColor: tokens.page, borderTopColor: tokens.border }]}
            onStartShouldSetResponder={() => true}
          >
            <View style={[styles.handle, { backgroundColor: tokens.text2 }]} />
            {[
              { icon: '📋', label: 'Copy', action: () => {} },
              { icon: '🎨', label: 'Highlight', action: () => { setContextMenuVisible(false); } },
              { icon: '📝', label: 'Add Note', action: () => { setContextMenuVisible(false); setNoteModalVisible(true); } },
              { icon: '🔗', label: 'Share', action: () => {} },
              { icon: '📖', label: 'Search in Book', action: () => { setContextMenuVisible(false); setSearchVisible(true); } },
            ].map((item, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.contextMenuItem, { borderBottomColor: tokens.border }]}
                onPress={item.action}
              >
                <Text style={styles.contextMenuIcon}>{item.icon}</Text>
                <Text style={[styles.contextMenuLabel, { color: tokens.text }]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden' },
  dismissContainer: { flex: 1 },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingTop: Platform.OS === 'android' ? 40 : 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  topOverlayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeBtn: {
    borderWidth: 1.5,
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topOverlayTitle: {
    fontFamily: FONTS.serifBold,
    fontSize: 16,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  topOverlayRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  contentArea: {
    flex: 1,
    flexDirection: 'row',
  },
  tapZoneLeft: { width: '20%', height: '100%' },
  tapZoneCenter: { width: '60%', height: '100%' },
  tapZoneRight: { width: '20%', height: '100%' },
  tapZone: { flex: 1 },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { padding: 10, paddingHorizontal: 18, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabText: { fontFamily: FONTS.sansBold, fontSize: 13 },
  scrollContent: { flex: 1 },
  scrollContentInner: { flexGrow: 1 },
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
  // Theme panel styles
  themePanel: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 0.5,
  },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16, opacity: 0.3 },
  themeLabel: { fontFamily: FONTS.sans, fontSize: 11, fontWeight: '600', letterSpacing: 0.5, marginBottom: 12 },
  brightnessRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  brightnessTrack: { flex: 1, height: 4, borderRadius: 2, backgroundColor: 'rgba(128,128,128,0.2)', overflow: 'hidden' },
  brightnessFill: { height: 4, borderRadius: 2 },
  brightnessStepper: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 20 },
  themeSwatches: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  themeSwatchWrap: { flex: 1, alignItems: 'center', gap: 6 },
  themeSwatch: { width: 40, height: 40, borderRadius: 20, borderWidth: 2 },
  themeSwatchLabel: { fontFamily: FONTS.sans, fontSize: 10 },
  // Search styles
  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, gap: 8, marginBottom: 12 },
  searchInput: { flex: 1, fontSize: 16, fontFamily: FONTS.sans },
  searchResults: { fontFamily: FONTS.sans, fontSize: 14, textAlign: 'center', marginBottom: 16 },
  doneBtn: { borderRadius: 8, padding: 12, alignItems: 'center', marginTop: 8 },
  doneBtnText: { color: '#fff', fontFamily: FONTS.sansBold, fontSize: 15 },
  contextMenuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 4, borderBottomWidth: 0.5, gap: 12 },
  contextMenuIcon: { fontSize: 20 },
  contextMenuLabel: { fontFamily: FONTS.sans, fontSize: 16 },
});
