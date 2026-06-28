import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, TextInput, Modal, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useLibrary } from '../../src/contexts/LibraryContext';
import { BookCard } from '../../src/components/BookCard';
import { ThemeToggle } from '../../src/components/ThemeToggle';
import { importFile, importPastedText } from '../../src/services/fileImport';
import { ThemeName } from '../../src/types';
import { FONTS } from '../../src/constants/fonts';

export default function LibraryScreen() {
  const { tokens } = useTheme();
  const { books, addBook } = useLibrary();
  const router = useRouter();
  const [tab, setTab] = useState<'books' | 'notes'>('books');
  const [pasteModal, setPasteModal] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [pasteTitle, setPasteTitle] = useState('');

  const handleImport = async () => {
    Alert.alert('Import Book', 'Choose how to add a book', [
      {
        text: 'Pick File',
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
      {/* Top Bar */}
      <View style={[styles.topbar, { backgroundColor: tokens.tab, borderBottomColor: tokens.border }]}>
        <Text style={[styles.wordmark, { color: tokens.accent }]}>📖 My Library</Text>
        <View style={styles.topbarControls}>
          <ThemeToggle availableThemes={['parchment', 'modern'] as ThemeName[]} />
        </View>
      </View>

      {/* Tab Bar */}
      <View style={[styles.tabBar, { borderBottomColor: tokens.border, backgroundColor: tokens.tab }]}>
        <TouchableOpacity
          style={[styles.tab, tab === 'books' && { borderBottomColor: tokens.accent }]}
          onPress={() => setTab('books')}
        >
          <Text style={[styles.tabText, { color: tab === 'books' ? tokens.accent : tokens.text2 }]}>
            📖 Books
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'notes' && { borderBottomColor: tokens.accent }]}
          onPress={() => setTab('notes')}
        >
          <Text style={[styles.tabText, { color: tab === 'notes' ? tokens.accent : tokens.text2 }]}>
            🗒 All Notes
          </Text>
        </TouchableOpacity>
      </View>

      {/* Books Panel */}
      {tab === 'books' && (
        <View style={styles.content}>
          <Text style={[styles.heading, { color: tokens.accent }]}>Your Books</Text>
          <Text style={[styles.sub, { color: tokens.text2 }]}>
            {books.length} {books.length === 1 ? 'book' : 'books'} · Import one to start reading
          </Text>
          <FlatList
            data={books}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <BookCard
                book={item}
                onPress={() => router.push(`/reader/${item.id}`)}
              />
            )}
            contentContainerStyle={styles.grid}
            ListEmptyComponent={
              <Text style={[styles.empty, { color: tokens.text2 }]}>
                No books yet. Tap + to import.
              </Text>
            }
          />
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: tokens.accent }]}
            onPress={handleImport}
          >
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* All Notes Panel */}
      {tab === 'notes' && (
        <View style={styles.content}>
          <Text style={[styles.heading, { color: tokens.accent }]}>All Notes</Text>
          <Text style={[styles.sub, { color: tokens.text2 }]}>
            Notes across your library, grouped by book
          </Text>
          <Text style={[styles.empty, { color: tokens.text2 }]}>
            Import a book and add notes to see them here.
          </Text>
        </View>
      )}

      {/* Paste Modal */}
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
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: tokens.accent }]}
                onPress={handlePaste}
              >
                <Text style={styles.btnSaveText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, { borderColor: tokens.border }]}
                onPress={() => setPasteModal(false)}
              >
                <Text style={[styles.btnCancelText, { color: tokens.text2 }]}>Cancel</Text>
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
  topbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 40 : 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  wordmark: { fontFamily: FONTS.serifBold, fontSize: 22, letterSpacing: 0.5 },
  topbarControls: { flexDirection: 'row', gap: 8 },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { padding: 11, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabText: { fontFamily: FONTS.sansBold, fontSize: 13, letterSpacing: 0.3 },
  content: { flex: 1, padding: 16 },
  heading: { fontFamily: FONTS.serifBold, fontSize: 32, marginBottom: 6 },
  sub: { fontFamily: FONTS.sans, fontSize: 14, opacity: 0.6, marginBottom: 24 },
  grid: { paddingBottom: 24 },
  empty: {
    fontFamily: FONTS.serif,
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 60,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 30 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', padding: 16 },
  modalBox: { borderRadius: 12, padding: 24, borderWidth: 1 },
  modalTitle: { fontFamily: FONTS.serifBold, fontSize: 20, marginBottom: 16 },
  modalInput: { borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 12, fontFamily: FONTS.sans },
  modalTextarea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 150,
    fontFamily: FONTS.serif,
    fontSize: 15,
    lineHeight: 24,
  },
  modalActions: { flexDirection: 'row', gap: 8, marginTop: 14 },
  btn: { flex: 1, borderRadius: 8, padding: 10, alignItems: 'center' },
  btnSaveText: { color: '#fff', fontFamily: FONTS.sansBold, fontSize: 14 },
  btnCancelText: { fontFamily: FONTS.sansBold, fontSize: 14 },
});
