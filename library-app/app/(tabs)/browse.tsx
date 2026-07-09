import React from 'react';
import { View, Text, ScrollView, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useLibrary } from '../../src/contexts/LibraryContext';
import { FONTS } from '../../src/constants/fonts';

const GENRES = [
  { name: 'Psychology', emoji: '🧠', color: '#C96442' },
  { name: 'Philosophy', emoji: '🏛️', color: '#8B4513' },
  { name: 'Esoteric', emoji: '🔮', color: '#B8962E' },
  { name: 'Neuroscience', emoji: '🧬', color: '#00C2CC' },
  { name: 'Biography', emoji: '📜', color: '#6B5B95' },
  { name: 'Self Help', emoji: '🌱', color: '#88B04B' },
];

export default function BrowseScreen() {
  const { tokens } = useTheme();
  const { books } = useLibrary();

  const booksByGenre: Record<string, number> = {};
  for (const book of books) {
    const genre = book.sourceType === 'epub' ? 'General' : book.sourceType.toUpperCase();
    booksByGenre[genre] = (booksByGenre[genre] || 0) + 1;
  }

  return (
    <View style={[styles.container, { backgroundColor: tokens.bg }]}>
      <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? 40 : 50 }]}>
        <Text style={[styles.headerTitle, { color: tokens.text }]}>Browse</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: tokens.accentDim }]}>
            <Text style={[styles.statValue, { color: tokens.accent }]}>{books.length}</Text>
            <Text style={[styles.statLabel, { color: tokens.text2 }]}>Total Books</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: tokens.accentDim }]}>
            <Text style={[styles.statValue, { color: tokens.accent }]}>
              {books.reduce((sum, b) => sum + b.pageCount, 0)}
            </Text>
            <Text style={[styles.statLabel, { color: tokens.text2 }]}>Total Pages</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: tokens.text2 }]}>Genres</Text>
        <View style={styles.genreGrid}>
          {GENRES.map((genre) => {
            const count = books.filter((b) => {
              if (genre.name === 'General') return true;
              return b.title.toLowerCase().includes(genre.name.toLowerCase());
            }).length;
            return (
              <View key={genre.name} style={[styles.genreCard, { backgroundColor: genre.color + '15', borderColor: genre.color + '30' }]}>
                <Text style={styles.genreEmoji}>{genre.emoji}</Text>
                <Text style={[styles.genreName, { color: tokens.text }]}>{genre.name}</Text>
                <Text style={[styles.genreCount, { color: tokens.text2 }]}>{count} books</Text>
              </View>
            );
          })}
        </View>

        <View style={[styles.tipCard, { backgroundColor: tokens.accentDim, borderColor: tokens.border }]}>
          <Text style={[styles.tipTitle, { color: tokens.accent }]}>💡 Tip</Text>
          <Text style={[styles.tipText, { color: tokens.text2 }]}>
            Import EPUB files from your favorite ebook sources. The app extracts cover images and chapters automatically.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  headerTitle: { fontFamily: FONTS.serifBold, fontSize: 34 },
  content: { padding: 20, paddingBottom: 100 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  statCard: { flex: 1, borderRadius: 12, padding: 16, alignItems: 'center' },
  statValue: { fontFamily: FONTS.serifBold, fontSize: 28 },
  statLabel: { fontFamily: FONTS.sans, fontSize: 12, marginTop: 4 },
  sectionTitle: { fontFamily: FONTS.sans, fontSize: 13, fontWeight: '600', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.5 },
  genreGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28 },
  genreCard: { width: '47%', borderRadius: 12, padding: 16, borderWidth: 1 },
  genreEmoji: { fontSize: 28, marginBottom: 8 },
  genreName: { fontFamily: FONTS.sansBold, fontSize: 14, marginBottom: 2 },
  genreCount: { fontFamily: FONTS.sans, fontSize: 12 },
  tipCard: { borderRadius: 12, padding: 16, borderWidth: 1 },
  tipTitle: { fontFamily: FONTS.sansBold, fontSize: 14, marginBottom: 6 },
  tipText: { fontFamily: FONTS.sans, fontSize: 13, lineHeight: 18 },
});
