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
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <BookCover title={book.title} size={150} />
      {progress > 0 && (
        <View style={styles.progressWrap}>
          <ReadingProgressBar progress={progress} />
        </View>
      )}
      <Text style={[styles.title, { color: tokens.text }]} numberOfLines={2}>
        {book.title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    marginBottom: 20,
  },
  progressWrap: {
    marginTop: 6,
    borderRadius: 2,
    overflow: 'hidden',
  },
  title: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
  },
});
