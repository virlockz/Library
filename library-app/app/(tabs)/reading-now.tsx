import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useLibrary } from '../../src/contexts/LibraryContext';
import { useRecentlyOpened } from '../../src/hooks/useRecentlyOpened';
import { useReadingPosition } from '../../src/hooks/useReadingPosition';
import { BookCover } from '../../src/components/BookCover';
import { ReadingProgressBar } from '../../src/components/ReadingProgressBar';
import { FONTS } from '../../src/constants/fonts';

function ReadingBookCard({ book, onPress }: { book: any; onPress: () => void }) {
  const { tokens } = useTheme();
  const { position } = useReadingPosition(book.id);
  const progress = book.pageCount > 0 ? (position / book.pageCount) * 100 : 0;

  return (
    <TouchableOpacity style={styles.readingCard} onPress={onPress} activeOpacity={0.7}>
      <BookCover title={book.title} coverImage={book.coverImage} size={120} />
      <View style={styles.readingInfo}>
        <Text style={[styles.readingTitle, { color: tokens.text }]} numberOfLines={2}>{book.title}</Text>
        {progress > 0 && (
          <View style={styles.progressWrap}>
            <ReadingProgressBar progress={progress} />
            <Text style={[styles.progressText, { color: tokens.text2 }]}>{Math.round(progress)}%</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function ReadingNowScreen() {
  const { tokens } = useTheme();
  const { books } = useLibrary();
  const { recent } = useRecentlyOpened();
  const router = useRouter();

  const recentBooks = recent
    .map((r) => books.find((b) => b.id === r.bookId))
    .filter(Boolean);

  const unreadBooks = books
    .filter((b) => !recent.some((r) => r.bookId === b.id))
    .slice(0, 6);

  return (
    <View style={[styles.container, { backgroundColor: tokens.bg }]}>
      <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? 40 : 50 }]}>
        <Text style={[styles.headerTitle, { color: tokens.text }]}>Reading Now</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {recentBooks.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: tokens.text2 }]}>Continue Reading</Text>
            {recentBooks.map((book) => book && (
              <ReadingBookCard
                key={book.id}
                book={book}
                onPress={() => router.push(`/reader/${book.id}`)}
              />
            ))}
          </View>
        )}

        {unreadBooks.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: tokens.text2 }]}>Books</Text>
            <View style={styles.grid}>
              {unreadBooks.map((book) => (
                <TouchableOpacity
                  key={book.id}
                  style={styles.gridItem}
                  onPress={() => router.push(`/reader/${book.id}`)}
                >
                  <BookCover title={book.title} coverImage={book.coverImage} size={110} />
                  <Text style={[styles.gridTitle, { color: tokens.text }]} numberOfLines={2}>{book.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {books.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyEmoji]}>📖</Text>
            <Text style={[styles.emptyTitle, { color: tokens.text }]}>No Books Yet</Text>
            <Text style={[styles.emptySub, { color: tokens.text2 }]}>Import a book from the Library tab to start reading</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  headerTitle: { fontFamily: FONTS.serifBold, fontSize: 34 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  section: { marginBottom: 28 },
  sectionTitle: { fontFamily: FONTS.sans, fontSize: 13, fontWeight: '600', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.5 },
  readingCard: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  readingInfo: { flex: 1 },
  readingTitle: { fontFamily: FONTS.serifBold, fontSize: 18, lineHeight: 23, marginBottom: 8 },
  progressWrap: { gap: 4 },
  progressText: { fontFamily: FONTS.sans, fontSize: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  gridItem: { width: 110 },
  gridTitle: { fontFamily: FONTS.sans, fontSize: 12, lineHeight: 16, marginTop: 6 },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontFamily: FONTS.serifBold, fontSize: 22, marginBottom: 8 },
  emptySub: { fontFamily: FONTS.sans, fontSize: 14, textAlign: 'center' },
});
