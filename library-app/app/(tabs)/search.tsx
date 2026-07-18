import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MagnifyingGlass, X } from 'phosphor-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useLibrary } from '../../src/contexts/LibraryContext';
import { BookCover } from '../../src/components/BookCover';
import { storage } from '../../src/services/storage';
import { Book } from '../../src/types';
import { FONTS } from '../../src/constants/fonts';

const RECENT_SEARCHES_KEY = 'recent_searches';
const MAX_RECENT = 8;

export default function SearchScreen() {
  const { tokens } = useTheme();
  const { books } = useLibrary();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, [query]);

  useEffect(() => {
    storage.get<string[]>(RECENT_SEARCHES_KEY).then((saved) => {
      if (saved) setRecentSearches(saved);
    });
  }, []);

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    const updated = [term, ...recentSearches.filter((s) => s !== term)].slice(0, MAX_RECENT);
    setRecentSearches(updated);
    storage.set(RECENT_SEARCHES_KEY, updated);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    storage.set(RECENT_SEARCHES_KEY, []);
  };

  const bookResults = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    const q = debouncedQuery.toLowerCase();
    return books.filter((b) => b.title.toLowerCase().includes(q));
  }, [debouncedQuery, books]);

  const authorResults = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    const q = debouncedQuery.toLowerCase();
    return books.filter((b) => b.sourceType.toLowerCase().includes(q));
  }, [debouncedQuery, books]);

  const hasQuery = debouncedQuery.trim().length > 0;

  return (
    <View style={[styles.container, { backgroundColor: tokens.bg }]}>
      <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? 40 : 50 }]}>
        <Text style={[styles.headerTitle, { color: tokens.text }]}>Search</Text>
      </View>

      <View style={styles.searchWrap}>
        <View style={[styles.searchBar, { backgroundColor: tokens.searchBg }]}>
          <MagnifyingGlass size={18} color={tokens.text2} weight="regular" />
          <TextInput
            style={[styles.searchInput, { color: tokens.text }]}
            placeholder="Search"
            placeholderTextColor={tokens.text2}
            value={query}
            onChangeText={setQuery}
            onFocus={() => setIsFocused(true)}
            returnKeyType="search"
            onSubmitEditing={() => query.trim() && saveRecentSearch(query.trim())}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <X size={16} color={tokens.text2} weight="fill" />
            </TouchableOpacity>
          )}
        </View>
        {isFocused && (
          <TouchableOpacity onPress={() => { setIsFocused(false); setQuery(''); }}>
            <Text style={[styles.cancelBtn, { color: tokens.accent }]}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Recent Searches (shown when no query) */}
      {!hasQuery && recentSearches.length > 0 && (
        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <Text style={[styles.recentTitle, { color: tokens.text2 }]}>Recent Searches</Text>
            <TouchableOpacity onPress={clearRecentSearches}>
              <Text style={[styles.clearBtn, { color: tokens.accent }]}>Clear</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.recentChips}>
            {recentSearches.map((term, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.recentChip, { backgroundColor: tokens.searchBg }]}
                onPress={() => setQuery(term)}
              >
                <Text style={[styles.recentChipText, { color: tokens.text }]}>{term}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Results */}
      {hasQuery ? (
        <FlatList
          data={[]}
          renderItem={() => null}
          ListHeaderComponent={
            <>
              {/* Books section */}
              {bookResults.length > 0 && (
                <View style={styles.resultSection}>
                  <Text style={[styles.resultSectionTitle, { color: tokens.text2 }]}>BOOKS</Text>
                  {bookResults.map((book) => (
                    <TouchableOpacity
                      key={book.id}
                      style={[styles.resultRow, { borderBottomColor: tokens.border }]}
                      onPress={() => { saveRecentSearch(query.trim()); router.push(`/reader/${book.id}`); }}
                    >
                      <BookCover title={book.title} coverImage={book.coverImage} size={40} />
                      <View style={styles.resultInfo}>
                        <Text style={[styles.resultTitle, { color: tokens.text }]} numberOfLines={1}>{book.title}</Text>
                        <Text style={[styles.resultMeta, { color: tokens.text2 }]}>
                          {book.chapters.length} chapters · {book.pageCount} pages
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Authors/Sources section */}
              {authorResults.length > 0 && (
                <View style={styles.resultSection}>
                  <Text style={[styles.resultSectionTitle, { color: tokens.text2 }]}>SOURCES</Text>
                  {authorResults.map((book) => (
                    <TouchableOpacity
                      key={book.id}
                      style={[styles.resultRow, { borderBottomColor: tokens.border }]}
                      onPress={() => { saveRecentSearch(query.trim()); router.push(`/reader/${book.id}`); }}
                    >
                      <BookCover title={book.title} coverImage={book.coverImage} size={40} />
                      <View style={styles.resultInfo}>
                        <Text style={[styles.resultTitle, { color: tokens.text }]} numberOfLines={1}>{book.title}</Text>
                        <Text style={[styles.resultMeta, { color: tokens.text2 }]}>{book.sourceType.toUpperCase()}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {bookResults.length === 0 && authorResults.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={[styles.emptyTitle, { color: tokens.text2 }]}>No Results</Text>
                </View>
              )}
            </>
          }
          contentContainerStyle={styles.list}
        />
      ) : (
        /* All books (when no query) */
        <FlatList
          data={books}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.resultRow, { borderBottomColor: tokens.border }]}
              onPress={() => router.push(`/reader/${item.id}`)}
            >
              <BookCover title={item.title} coverImage={item.coverImage} size={40} />
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
              <Text style={[styles.emptyTitle, { color: tokens.text2 }]}>Your Library is Empty</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  headerTitle: { fontFamily: FONTS.sansBold, fontSize: 34 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 8, gap: 10 },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: FONTS.sans,
  },
  cancelBtn: { fontFamily: FONTS.sans, fontSize: 15 },
  recentSection: { paddingHorizontal: 20, marginBottom: 16 },
  recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  recentTitle: { fontFamily: FONTS.sans, fontSize: 13, fontWeight: '600' },
  clearBtn: { fontFamily: FONTS.sans, fontSize: 13 },
  recentChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  recentChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  recentChipText: { fontFamily: FONTS.sans, fontSize: 13 },
  list: { paddingHorizontal: 20, paddingBottom: 100 },
  resultSection: { marginBottom: 20 },
  resultSectionTitle: { fontFamily: FONTS.sans, fontSize: 12, fontWeight: '600', letterSpacing: 0.5, marginBottom: 8 },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    gap: 12,
  },
  resultInfo: { flex: 1 },
  resultTitle: { fontFamily: FONTS.sans, fontSize: 16, fontWeight: '500' },
  resultMeta: { fontFamily: FONTS.sans, fontSize: 12, marginTop: 2 },
  emptyState: { alignItems: 'center', marginTop: 80 },
  emptyTitle: { fontFamily: FONTS.sans, fontSize: 15 },
});
