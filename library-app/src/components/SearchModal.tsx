import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { BookOpen, Note as NoteIcon } from 'phosphor-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useLibrary } from '../contexts/LibraryContext';
import { useNotes } from '../hooks/useNotes';
import { Note, Book } from '../types';
import { FONTS } from '../constants/fonts';

interface Props {
  visible: boolean;
  onClose: () => void;
  onOpenBook: (bookId: string, pageIndex?: number) => void;
}

interface SearchResult {
  type: 'book' | 'note';
  bookId: string;
  bookTitle: string;
  text: string;
  pageIndex?: number;
}

export function SearchModal({ visible, onClose, onOpenBook }: Props) {
  const { tokens } = useTheme();
  const { books } = useLibrary();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const items: SearchResult[] = [];

    for (const book of books) {
      if (book.title.toLowerCase().includes(q)) {
        items.push({ type: 'book', bookId: book.id, bookTitle: book.title, text: book.title });
      }
      for (const ch of book.chapters) {
        if (ch.title.toLowerCase().includes(q)) {
          items.push({ type: 'book', bookId: book.id, bookTitle: book.title, text: ch.title });
        }
      }
    }

    return items.slice(0, 20);
  }, [query, books]);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={[styles.overlay, { backgroundColor: tokens.bg }]}>
        <View style={[styles.header, { borderBottomColor: tokens.border, backgroundColor: tokens.tab, paddingTop: 50 }]}>
          <TextInput
            style={[styles.input, { color: tokens.text, borderColor: tokens.border, backgroundColor: tokens.page }]}
            placeholder="Search books, chapters..."
            placeholderTextColor={tokens.text2}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.cancel, { color: tokens.accent }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={results}
          keyExtractor={(item, i) => `${item.bookId}-${item.type}-${i}`}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.row, { borderBottomColor: tokens.border }]}
              onPress={() => { onOpenBook(item.bookId, item.pageIndex); onClose(); }}
            >
              <View style={styles.rowType}>
                {item.type === 'book' ? <BookOpen size={18} color={tokens.accent} weight="light" /> : <NoteIcon size={18} color={tokens.accent} weight="light" />}
              </View>
              <View style={styles.rowBody}>
                <Text style={[styles.rowText, { color: tokens.text }]} numberOfLines={1}>{item.text}</Text>
                <Text style={[styles.rowMeta, { color: tokens.text2 }]}>{item.bookTitle}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            query.length > 0 ? (
              <Text style={[styles.empty, { color: tokens.text2 }]}>No results found</Text>
            ) : null
          }
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, gap: 10, borderBottomWidth: 1 },
  input: { flex: 1, borderWidth: 1, borderRadius: 8, padding: 10, fontFamily: FONTS.sans, fontSize: 15 },
  cancel: { fontFamily: FONTS.sansBold, fontSize: 14 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, paddingHorizontal: 16, borderBottomWidth: 0.5, gap: 12 },
  rowType: { width: 24, alignItems: 'center' },
  rowBody: { flex: 1 },
  rowText: { fontFamily: FONTS.serif, fontSize: 15 },
  rowMeta: { fontFamily: FONTS.sans, fontSize: 12, marginTop: 2 },
  empty: { fontFamily: FONTS.serif, fontSize: 15, fontStyle: 'italic', textAlign: 'center', marginTop: 60 },
});
