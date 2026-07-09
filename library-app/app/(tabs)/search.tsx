import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useLibrary } from '../../src/contexts/LibraryContext';
import { BookCover } from '../../src/components/BookCover';
import { FONTS } from '../../src/constants/fonts';

export default function SearchScreen() {
  const { tokens } = useTheme();
  const { books } = useLibrary();
  const router = useRouter();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return books;
    const q = query.toLowerCase();
    return books.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.sourceType.toLowerCase().includes(q)
    );
  }, [query, books]);

  return (
    <View style={[styles.container, { backgroundColor: tokens.bg }]}>
      <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? 40 : 50 }]}>
        <Text style={[styles.headerTitle, { color: tokens.text }]}>Search</Text>
      </View>

      <View style={styles.searchWrap}>
        <TextInput
          style={[styles.searchInput, { color: tokens.text, backgroundColor: tokens.accentDim, borderColor: tokens.border }]}
          placeholder="Search your library..."
          placeholderTextColor={tokens.text2}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.resultRow, { borderBottomColor: tokens.border }]}
            onPress={() => router.push(`/reader/${item.id}`)}
          >
            <BookCover title={item.title} coverImage={item.coverImage} size={50} />
            <View style={styles.resultInfo}>
              <Text style={[styles.resultTitle, { color: tokens.text }]} numberOfLines={1}>{item.title}</Text>
              <Text style={[styles.resultMeta, { color: tokens.text2 }]}>
                {item.chapters.length} chapters · {item.pageCount} pages
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: tokens.text }]}>
              {query ? 'No results found' : 'Search your books'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  headerTitle: { fontFamily: FONTS.serifBold, fontSize: 34 },
  searchWrap: { paddingHorizontal: 20, marginBottom: 8 },
  searchInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    fontFamily: FONTS.sans,
  },
  list: { paddingHorizontal: 20, paddingBottom: 100 },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    gap: 14,
  },
  resultInfo: { flex: 1 },
  resultTitle: { fontFamily: FONTS.serif, fontSize: 16, lineHeight: 21 },
  resultMeta: { fontFamily: FONTS.sans, fontSize: 12, marginTop: 2 },
  emptyState: { alignItems: 'center', marginTop: 80 },
  emptyTitle: { fontFamily: FONTS.sans, fontSize: 15 },
});
