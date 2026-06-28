import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Book } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { THEME_COLORS } from '../themes/tokens';
import { FONTS } from '../constants/fonts';

interface Props {
  book: Book;
  onPress: () => void;
}

export function BookCard({ book, onPress }: Props) {
  const { tokens } = useTheme();
  const spineColor = THEME_COLORS[book.defaultTheme]?.accent || tokens.accent;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: tokens.page, borderColor: tokens.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.spine, { backgroundColor: spineColor }]} />
      <View style={styles.body}>
        <Text style={[styles.domain, { color: tokens.accent }]}>
          {book.sourceType.toUpperCase()}
        </Text>
        <Text style={[styles.title, { color: tokens.text }]} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={[styles.meta, { color: tokens.text2 }]}>
          {book.chapters.length} chapters · {book.pageCount} pages
        </Text>
        <Text style={[styles.open, { color: tokens.accent }]}>Open book →</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 22,
    flexDirection: 'row',
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 14,
  },
  spine: {
    width: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  body: {
    flex: 1,
  },
  domain: {
    fontFamily: FONTS.sansBold,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  title: {
    fontFamily: FONTS.serifBold,
    fontSize: 20,
    lineHeight: 25,
    marginBottom: 8,
  },
  meta: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    marginBottom: 12,
  },
  open: {
    fontFamily: FONTS.sansBold,
    fontSize: 12,
    letterSpacing: 0.5,
  },
});
