import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, TextInput, Modal, Platform,
} from 'react-native';
import { Plus } from 'phosphor-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useLibrary } from '../../src/contexts/LibraryContext';
import { BookCover } from '../../src/components/BookCover';
import { ReadingProgressBar } from '../../src/components/ReadingProgressBar';
import { useReadingPosition } from '../../src/hooks/useReadingPosition';
import { importFile, importPastedText } from '../../src/services/fileImport';
import { Book } from '../../src/types';
import { FONTS } from '../../src/constants/fonts';

function LibraryBookCard({ book, onPress }: { book: Book; onPress: () => void }) {
  const { tokens } = useTheme();
  const { position } = useReadingPosition(book.id);
  const progress = book.pageCount > 0 ? (position / book.pageCount) * 100 : 0;

  return (
    <TouchableOpacity style={styles.bookCard} onPress={onPress} activeOpacity={0.7}>
      <BookCover title={book.title} coverImage={book.coverImage} size={150} />
      {progress > 0 && (
        <View style={styles.progressWrap}>
          <ReadingProgressBar progress={progress} />
        </View>
      )}
      <Text style={[styles.bookTitle, { color: tokens.text }]} numberOfLines={2}>{book.title}</Text>
    </TouchableOpacity>
  );
}

export default function LibraryScreen() {
  const { tokens } = useTheme();
  const { books, addBook } = useLibrary();
  const router = useRouter();
  const [pasteModal, setPasteModal] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [pasteTitle, setPasteTitle] = useState('');

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

      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.gridContent}
        renderItem={({ item }) => (
          <LibraryBookCard
            book={item}
            onPress={() => router.push(`/reader/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📚</Text>
            <Text style={[styles.emptyTitle, { color: tokens.text }]}>Your Library</Text>
            <Text style={[styles.emptySub, { color: tokens.text2 }]}>Tap + to import a book</Text>
          </View>
        }
      />

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
  addBtnText: { color: '#fff', fontSize: 20, lineHeight: 22 },
  gridContent: { padding: 20, paddingBottom: 100 },
  gridRow: { justifyContent: 'space-between', marginBottom: 20 },
  bookCard: { width: '48%' },
  progressWrap: { marginTop: 6, borderRadius: 2, overflow: 'hidden' },
  bookTitle: { fontFamily: FONTS.sans, fontSize: 13, lineHeight: 18, marginTop: 6 },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontFamily: FONTS.serifBold, fontSize: 22, marginBottom: 8 },
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
