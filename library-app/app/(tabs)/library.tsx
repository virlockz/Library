import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, TextInput, Modal, ScrollView, Platform, Animated,
} from 'react-native';
import { Plus, Books, CaretRight, Trash, GridFour, List, ArrowsDownUp } from 'phosphor-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { AnimatedHeader, createScrollHandler } from '../../src/components/AnimatedHeader';
import { useLibrary } from '../../src/contexts/LibraryContext';
import { Book } from '../../src/types';
import { BookCover } from '../../src/components/BookCover';
import { ReadingProgressBar } from '../../src/components/ReadingProgressBar';
import { useReadingPosition } from '../../src/hooks/useReadingPosition';
import { useRecentlyOpened } from '../../src/hooks/useRecentlyOpened';
import { useCollections } from '../../src/hooks/useCollections';
import { importFile, importPastedText } from '../../src/services/fileImport';
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

function CollectionRow({ name, count, onPress, onDelete }: { name: string; count: number; onPress: () => void; onDelete?: () => void }) {
  const { tokens } = useTheme();
  return (
    <TouchableOpacity style={[styles.collectionRow, { borderBottomColor: tokens.border }]} onPress={onPress}>
      <Text style={[styles.collectionName, { color: tokens.text }]}>{name}</Text>
      <View style={styles.collectionRight}>
        <Text style={[styles.collectionCount, { color: tokens.text2 }]}>{count}</Text>
        {onDelete ? (
          <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Trash size={14} color={tokens.text2} weight="light" />
          </TouchableOpacity>
        ) : (
          <CaretRight size={16} color={tokens.text2} weight="light" />
        )}
      </View>
    </TouchableOpacity>
  );
}

function LibraryBookCard({ book, onPress, selected, editMode }: { book: Book; onPress: () => void; selected?: boolean; editMode?: boolean }) {
  const { tokens } = useTheme();
  return (
    <TouchableOpacity style={styles.bookCard} onPress={onPress} activeOpacity={0.7}>
      {editMode && (
        <View style={[styles.selectCircle, { borderColor: selected ? tokens.accent : tokens.border, backgroundColor: selected ? tokens.accent : 'transparent' }]}>
          {selected && <Text style={styles.checkmark}>✓</Text>}
        </View>
      )}
      <BookCover title={book.title} coverImage={book.coverImage} size={110} />
    </TouchableOpacity>
  );
}

export default function LibraryScreen() {
  const { tokens } = useTheme();
  const { books, addBook, removeBook } = useLibrary();
  const { recent } = useRecentlyOpened();
  const { collections, addCollection, removeCollection } = useCollections();
  const router = useRouter();
  const [pasteModal, setPasteModal] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [pasteTitle, setPasteTitle] = useState('');
  const [newCollectionModal, setNewCollectionModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'recent' | 'title' | 'author'>('recent');
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedBooks, setSelectedBooks] = useState<Set<string>>(new Set());
  const scrollY = useRef(new Animated.Value(0)).current;
  const viewAnim = useRef(new Animated.Value(1)).current;
  const scrollHandler = createScrollHandler(scrollY);

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

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;
    await addCollection(newCollectionName.trim());
    setNewCollectionModal(false);
    setNewCollectionName('');
  };

  const handleDeleteCollection = (collectionId: string, collectionName: string) => {
    Alert.alert('Delete Collection', `Delete "${collectionName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeCollection(collectionId) },
    ]);
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
    setSelectedBooks(new Set());
  };

  const toggleBookSelection = (bookId: string) => {
    setSelectedBooks((prev) => {
      const next = new Set(prev);
      if (next.has(bookId)) next.delete(bookId);
      else next.add(bookId);
      return next;
    });
  };

  const handleBatchDelete = () => {
    if (selectedBooks.size === 0) return;
    Alert.alert('Delete Books', `Delete ${selectedBooks.size} book(s)?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          for (const id of selectedBooks) {
            await removeBook(id);
          }
          setSelectedBooks(new Set());
          setEditMode(false);
        }
      },
    ]);
  };

  const handleViewModeChange = (newMode: 'grid' | 'list') => {
    Animated.sequence([
      Animated.timing(viewAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(viewAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
    setViewMode(newMode);
  };

  const wantToReadCount = collections.find((c) => c.name === 'Want to Read')?.bookIds.length || 0;

  const sortedBooks = [...books].sort((a, b) => {
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    if (sortBy === 'author') return (a.sourceType || '').localeCompare(b.sourceType || '');
    return 0; // recent = default order
  });

  return (
    <View style={[styles.container, { backgroundColor: tokens.bg }]}>
      <AnimatedHeader
        title="Library"
        rightAction={
          editMode ? (
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={() => {
                if (selectedBooks.size === sortedBooks.length) setSelectedBooks(new Set());
                else setSelectedBooks(new Set(sortedBooks.map((b) => b.id)));
              }}>
                <Text style={{ color: tokens.accent, fontFamily: FONTS.sans, fontSize: 14 }}>
                  {selectedBooks.size === sortedBooks.length ? 'Deselect All' : 'Select All'}
                </Text>
              </TouchableOpacity>
              {selectedBooks.size > 0 && (
                <TouchableOpacity onPress={handleBatchDelete}>
                  <Trash size={18} color="#FF3B30" weight="regular" />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={toggleEditMode}>
                <Text style={{ color: tokens.accent, fontFamily: FONTS.sans, fontSize: 14 }}>Done</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.headerActions}>
              <TouchableOpacity style={[styles.iconBtn, { borderColor: tokens.border }]} onPress={() => setSortModalVisible(true)}>
                <ArrowsDownUp size={16} color={tokens.text2} weight="regular" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.iconBtn, { borderColor: tokens.border }]} onPress={() => handleViewModeChange(viewMode === 'grid' ? 'list' : 'grid')}>
                {viewMode === 'grid' ? (
                  <List size={16} color={tokens.text2} weight="regular" />
                ) : (
                  <GridFour size={16} color={tokens.text2} weight="regular" />
                )}
              </TouchableOpacity>
              <TouchableOpacity style={[styles.iconBtn, { borderColor: tokens.border }]} onPress={toggleEditMode}>
                <Text style={{ color: tokens.text2, fontFamily: FONTS.sans, fontSize: 13, fontWeight: '600' }}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.addBtn, { backgroundColor: tokens.accent }]} onPress={handleImport}>
                <Plus size={20} color="#fff" weight="bold" />
              </TouchableOpacity>
            </View>
          )
        }
        scrollY={scrollY}
      />

      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {recentBooks.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: tokens.text }]}>RECENTLY OPENED</Text>
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

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: tokens.text, marginBottom: 0 }]}>COLLECTIONS</Text>
            <TouchableOpacity onPress={() => setNewCollectionModal(true)}>
              <Plus size={18} color={tokens.accent} weight="bold" />
            </TouchableOpacity>
          </View>
          <CollectionRow name="All Books" count={books.length} onPress={() => {}} />
          <CollectionRow name="Want to Read" count={wantToReadCount} onPress={() => {}} />
          {collections.filter((c) => c.name !== 'Want to Read').map((collection) => (
            <CollectionRow
              key={collection.id}
              name={collection.name}
              count={collection.bookIds.length}
              onPress={() => {}}
              onDelete={() => handleDeleteCollection(collection.id, collection.name)}
            />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: tokens.text }]}>ALL BOOKS</Text>
          {viewMode === 'grid' ? (
            <Animated.View style={[styles.grid, { opacity: viewAnim }]}>
              {sortedBooks.map((book) => (
                <LibraryBookCard
                  key={book.id}
                  book={book}
                  onPress={() => editMode ? toggleBookSelection(book.id) : router.push(`/reader/${book.id}`)}
                  selected={selectedBooks.has(book.id)}
                  editMode={editMode}
                />
              ))}
            </Animated.View>
          ) : (
            <Animated.View style={{ opacity: viewAnim }}>
              {sortedBooks.map((book) => (
                <TouchableOpacity
                  key={book.id}
                  style={[styles.listRow, { borderBottomColor: tokens.border }, selectedBooks.has(book.id) && { backgroundColor: tokens.accentDim }]}
                  onPress={() => editMode ? toggleBookSelection(book.id) : router.push(`/reader/${book.id}`)}
                >
                  <BookCover title={book.title} coverImage={book.coverImage} size={48} />
                  <View style={styles.listInfo}>
                    <Text style={[styles.listTitle, { color: tokens.text }]} numberOfLines={1}>{book.title}</Text>
                    <Text style={[styles.listMeta, { color: tokens.text2 }]}>{book.sourceType.toUpperCase()}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </Animated.View>
          )}
        </View>

        {books.length === 0 && (
          <View style={styles.emptyState}>
            <Books size={48} color={tokens.text2} weight="light" />
            <Text style={[styles.emptyTitle, { color: tokens.text }]}>Your Library</Text>
            <Text style={[styles.emptySub, { color: tokens.text2 }]}>Tap + to import a book</Text>
          </View>
        )}
      </Animated.ScrollView>

      <Modal visible={newCollectionModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: tokens.page, borderColor: tokens.border }]}>
            <Text style={[styles.modalTitle, { color: tokens.accent }]}>New Collection</Text>
            <TextInput
              style={[styles.modalInput, { color: tokens.text, borderColor: tokens.border }]}
              placeholder="Collection name"
              placeholderTextColor={tokens.text2}
              value={newCollectionName}
              onChangeText={setNewCollectionName}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: tokens.accent }]} onPress={handleCreateCollection}>
                <Text style={styles.modalBtnText}>Create</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { borderColor: tokens.border }]} onPress={() => setNewCollectionModal(false)}>
                <Text style={[styles.modalBtnText2, { color: tokens.text2 }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Sort Modal */}
      <Modal visible={sortModalVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSortModalVisible(false)}>
          <View style={[styles.modalBox, { backgroundColor: tokens.page, borderColor: tokens.border }]}>
            <Text style={[styles.modalTitle, { color: tokens.accent }]}>Sort By</Text>
            {(['recent', 'title', 'author'] as const).map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.sortOption, { borderBottomColor: tokens.border }, sortBy === option && { backgroundColor: tokens.accentDim }]}
                onPress={() => { setSortBy(option); setSortModalVisible(false); }}
              >
                <Text style={[styles.sortOptionText, { color: sortBy === option ? tokens.accent : tokens.text }]}>
                  {option === 'recent' ? 'Recent' : option === 'title' ? 'Title' : 'Author'}
                </Text>
                {sortBy === option && <Text style={{ color: tokens.accent }}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

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
  headerTitle: { fontFamily: FONTS.sansBold, fontSize: 34 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { width: 32, height: 32, borderRadius: 8, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
  addBtn: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 100 },
  section: { marginBottom: 28, paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontFamily: FONTS.sansBold, fontSize: 20, marginBottom: 4 },
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  bookCard: { width: '30%', position: 'relative' },
  selectCircle: { position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: 11, borderWidth: 2, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  checkmark: { color: '#fff', fontSize: 12, fontWeight: '700' },
  listRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 0.5, gap: 12 },
  listInfo: { flex: 1 },
  listTitle: { fontFamily: FONTS.serif, fontSize: 16 },
  listMeta: { fontFamily: FONTS.sans, fontSize: 11, marginTop: 2 },
  sortOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 4, borderBottomWidth: 0.5 },
  sortOptionText: { fontFamily: FONTS.sans, fontSize: 16 },
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
