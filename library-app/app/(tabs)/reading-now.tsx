import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BookOpen } from 'phosphor-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useLibrary } from '../../src/contexts/LibraryContext';
import { useRecentlyOpened } from '../../src/hooks/useRecentlyOpened';
import { useReadingPosition } from '../../src/hooks/useReadingPosition';
import { BookCover } from '../../src/components/BookCover';
import { ReadingProgressBar } from '../../src/components/ReadingProgressBar';
import { Book } from '../../src/types';
import { FONTS } from '../../src/constants/fonts';

function CarouselCard({ book, onPress }: { book: Book; onPress: () => void }) {
  const { tokens } = useTheme();
  const { position } = useReadingPosition(book.id);
  const progress = book.pageCount > 0 ? (position / book.pageCount) * 100 : 0;

  return (
    <TouchableOpacity style={styles.carouselCard} onPress={onPress} activeOpacity={0.7}>
      <BookCover title={book.title} coverImage={book.coverImage} size={120} />
      {progress > 0 && (
        <View style={styles.carouselProgress}>
          <ReadingProgressBar progress={progress} />
        </View>
      )}
      <Text style={[styles.carouselTitle, { color: tokens.text }]} numberOfLines={2}>{book.title}</Text>
    </TouchableOpacity>
  );
}

function HorizontalCarousel({ books, onBookPress }: { books: Book[]; onBookPress: (book: Book) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselScroll}>
      {books.map((book) => (
        <CarouselCard key={book.id} book={book} onPress={() => onBookPress(book)} />
      ))}
    </ScrollView>
  );
}

export default function ReadingNowScreen() {
  const { tokens } = useTheme();
  const { books } = useLibrary();
  const { recent } = useRecentlyOpened();
  const router = useRouter();

  const continueReading = recent
    .map((r) => books.find((b) => b.id === r.bookId))
    .filter(Boolean) as Book[];

  // "Want to Read" — books with no reading progress
  const wantToRead = books
    .filter((b) => !recent.some((r) => r.bookId === b.id))
    .slice(0, 10);

  // "Finished" — empty for now (would need reading position to determine)
  const finished: Book[] = [];

  return (
    <View style={[styles.container, { backgroundColor: tokens.bg }]}>
      <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? 40 : 50 }]}>
        <Text style={[styles.headerTitle, { color: tokens.text }]}>Reading Now</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Continue Reading — horizontal carousel */}
        {continueReading.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: tokens.text }]}>Continue Reading</Text>
              <TouchableOpacity>
                <Text style={[styles.seeAll, { color: tokens.accent }]}>See All</Text>
              </TouchableOpacity>
            </View>
            <HorizontalCarousel books={continueReading} onBookPress={(b) => router.push(`/reader/${b.id}`)} />
          </View>
        )}

        {/* Want to Read — horizontal carousel */}
        {wantToRead.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: tokens.text }]}>Want to Read</Text>
              <TouchableOpacity>
                <Text style={[styles.seeAll, { color: tokens.accent }]}>See All</Text>
              </TouchableOpacity>
            </View>
            <HorizontalCarousel books={wantToRead} onBookPress={(b) => router.push(`/reader/${b.id}`)} />
          </View>
        )}

        {/* Finished — horizontal carousel */}
        {finished.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: tokens.text }]}>Finished</Text>
              <TouchableOpacity>
                <Text style={[styles.seeAll, { color: tokens.accent }]}>See All</Text>
              </TouchableOpacity>
            </View>
            <HorizontalCarousel books={finished} onBookPress={(b) => router.push(`/reader/${b.id}`)} />
          </View>
        )}

        {books.length === 0 && (
          <View style={styles.emptyState}>
            <BookOpen size={48} color={tokens.text2} weight="light" />
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
  headerTitle: { fontFamily: FONTS.sansBold, fontSize: 34 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  section: { marginBottom: 28 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingHorizontal: 20, marginBottom: 14 },
  sectionTitle: { fontFamily: FONTS.sansBold, fontSize: 20 },
  seeAll: { fontFamily: FONTS.sans, fontSize: 15 },
  carouselScroll: { paddingHorizontal: 20, gap: 16 },
  carouselCard: { width: 120 },
  carouselProgress: { marginTop: 6, borderRadius: 2, overflow: 'hidden' },
  carouselTitle: { fontFamily: FONTS.sans, fontSize: 12, lineHeight: 16, marginTop: 6 },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyTitle: { fontFamily: FONTS.sansBold, fontSize: 22, marginTop: 16, marginBottom: 8 },
  emptySub: { fontFamily: FONTS.sans, fontSize: 14, textAlign: 'center' },
});
