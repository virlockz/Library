import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Book } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useReadingPosition } from '../hooks/useReadingPosition';
import { BookCover } from './BookCover';
import { ReadingProgressBar } from './ReadingProgressBar';
import { FONTS } from '../constants/fonts';

interface Props {
  book: Book;
  onPress: () => void;
}

export function BookCard({ book, onPress }: Props) {
  const { tokens } = useTheme();
  const { position } = useReadingPosition(book.id);
  const progress = book.pageCount > 0 ? (position / book.pageCount) * 100 : 0;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: tokens.page, borderColor: tokens.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.row}>
        <BookCover title={book.title} size={60} />
        <View style={styles.body}>
          <Text style={[styles.domain, { color: tokens.accent }]}>
            {book.sourceType.toUpperCase()}
          </Text>
          <Text style={[styles.title, { color: tokens.text }]} numberOfLines={2}>
            {book.title}
          </Text>
          <Text style={[styles.meta, { color: tokens.text2 }]}>
            {book.chapters.length} ch · {book.pageCount} pages
          </Text>
          {progress > 0 && (
            <Text style={[styles.progressText, { color: tokens.text2 }]}>
              {Math.round(progress)}% read
            </Text>
          )}
        </View>
      </View>
      {progress > 0 && <ReadingProgressBar progress={progress} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginBottom: 14,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    gap: 14,
  },
  body: {
    flex: 1,
  },
  domain: {
    fontFamily: FONTS.sansBold,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  title: {
    fontFamily: FONTS.serifBold,
    fontSize: 17,
    lineHeight: 22,
    marginBottom: 4,
  },
  meta: {
    fontFamily: FONTS.sans,
    fontSize: 12,
  },
  progressText: {
    fontFamily: FONTS.sans,
    fontSize: 11,
    marginTop: 4,
  },
});
