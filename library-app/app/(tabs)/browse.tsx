import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Books, Brain, GraduationCap, MoonStars, Flask, User, Plant, Lightbulb, CaretRight } from 'phosphor-react-native';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useLibrary } from '../../src/contexts/LibraryContext';
import { FONTS } from '../../src/constants/fonts';

const GENRES = [
  { name: 'All Books', Icon: Books, color: '#007AFF' },
  { name: 'Psychology', Icon: Brain, color: '#C96442' },
  { name: 'Philosophy', Icon: GraduationCap, color: '#8B4513' },
  { name: 'Esoteric', Icon: MoonStars, color: '#B8962E' },
  { name: 'Neuroscience', Icon: Flask, color: '#00C2CC' },
  { name: 'Biography', Icon: User, color: '#6B5B95' },
  { name: 'Self Help', Icon: Plant, color: '#88B04B' },
];

export default function BrowseScreen() {
  const { tokens } = useTheme();
  const { books } = useLibrary();

  return (
    <View style={[styles.container, { backgroundColor: tokens.bg }]}>
      <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? 40 : 50 }]}>
        <Text style={[styles.headerTitle, { color: tokens.text }]}>Browse</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: tokens.accentDim }]}>
            <Text style={[styles.statValue, { color: tokens.accent }]}>{books.length}</Text>
            <Text style={[styles.statLabel, { color: tokens.text2 }]}>Books</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: tokens.accentDim }]}>
            <Text style={[styles.statValue, { color: tokens.accent }]}>
              {books.reduce((sum, b) => sum + b.pageCount, 0)}
            </Text>
            <Text style={[styles.statLabel, { color: tokens.text2 }]}>Pages</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: tokens.text2 }]}>CATEGORIES</Text>
        {GENRES.map((genre) => {
          const count = genre.name === 'All Books'
            ? books.length
            : books.filter((b) => b.title.toLowerCase().includes(genre.name.toLowerCase())).length;
          return (
            <TouchableOpacity key={genre.name} style={[styles.genreRow, { borderBottomColor: tokens.border }]}>
              <View style={[styles.genreIconWrap, { backgroundColor: genre.color + '18' }]}>
                <genre.Icon size={22} color={genre.color} weight="regular" />
              </View>
              <Text style={[styles.genreName, { color: tokens.text }]}>{genre.name}</Text>
              <View style={styles.genreRight}>
                <Text style={[styles.genreCount, { color: tokens.text2 }]}>{count}</Text>
                <CaretRight size={16} color={tokens.text2} weight="light" />
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={[styles.tipCard, { backgroundColor: tokens.accentDim, borderColor: tokens.border }]}>
          <View style={styles.tipHeader}>
            <Lightbulb size={16} color={tokens.accent} weight="fill" />
            <Text style={[styles.tipTitle, { color: tokens.accent }]}> Tip</Text>
          </View>
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
  headerTitle: { fontFamily: FONTS.sansBold, fontSize: 34 },
  content: { padding: 20, paddingBottom: 100 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  statCard: { flex: 1, borderRadius: 12, padding: 16, alignItems: 'center' },
  statValue: { fontFamily: FONTS.serifBold, fontSize: 28 },
  statLabel: { fontFamily: FONTS.sans, fontSize: 12, marginTop: 4 },
  sectionTitle: { fontFamily: FONTS.sansBold, fontSize: 20, marginBottom: 12 },
  genreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    gap: 14,
  },
  genreIconWrap: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  genreName: { fontFamily: FONTS.sans, fontSize: 16, flex: 1 },
  genreRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  genreCount: { fontFamily: FONTS.sans, fontSize: 14 },
  tipCard: { borderRadius: 12, padding: 16, borderWidth: 1, marginTop: 28 },
  tipHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  tipTitle: { fontFamily: FONTS.sansBold, fontSize: 14 },
  tipText: { fontFamily: FONTS.sans, fontSize: 13, lineHeight: 18 },
});
