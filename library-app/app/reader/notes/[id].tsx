import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { useLibrary } from '../../../src/contexts/LibraryContext';
import { useNotes } from '../../../src/hooks/useNotes';
import { NoteCard } from '../../../src/components/NoteCard';
import { FONTS } from '../../../src/constants/fonts';

type FilterType = 'book' | 'chapter' | 'page';

export default function BookNotesDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tokens } = useTheme();
  const { getBook } = useLibrary();
  const bookId = id || '';
  const { notes, deleteNote } = useNotes(bookId);
  const router = useRouter();
  const [filter, setFilter] = useState<FilterType>('book');

  const book = getBook(bookId);

  const filteredNotes = notes.filter((n) => {
    if (filter === 'book') return n.type === 'book';
    if (filter === 'chapter') return n.type === 'chapter';
    return n.type === 'page';
  });

  return (
    <View style={[styles.container, { backgroundColor: tokens.bg }]}>
      {/* Top Bar */}
      <View style={[styles.topbar, { backgroundColor: tokens.tab, borderBottomColor: tokens.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.backBtn, { color: tokens.accent }]}>← All Notes</Text>
        </TouchableOpacity>
        <Text style={[styles.titleBar, { color: tokens.accent }]} numberOfLines={1}>
          {book?.title || 'Book Notes'}
        </Text>
        <View style={{ width: 90 }} />
      </View>

      {/* Toggle Bar */}
      <View style={[styles.toggleBar, { backgroundColor: tokens.bg, borderBottomColor: tokens.border }]}>
        {(['book', 'chapter', 'page'] as FilterType[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.toggleBtn,
              { borderColor: tokens.border },
              filter === f && { backgroundColor: tokens.accentDim, borderColor: tokens.accent },
            ]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.toggleText, { color: filter === f ? tokens.accent : tokens.text2 }]}>
              {f === 'book' ? 'Book' : f === 'chapter' ? 'Chapter' : 'Page'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {filteredNotes.length === 0 ? (
          <Text style={[styles.empty, { color: tokens.text2 }]}>
            No {filter} notes yet.
          </Text>
        ) : (
          filteredNotes.map((note) => (
            <NoteCard key={note.id} note={note} onDelete={deleteNote} />
          ))
        )}
      </ScrollView>
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
  toggleBar: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  toggleBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    maxWidth: 140,
  },
  toggleText: { fontFamily: FONTS.sansBold, fontSize: 13 },
  content: { flex: 1, padding: 20 },
  empty: {
    fontFamily: FONTS.serif,
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 60,
  },
});
