import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Chapter } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { FONTS } from '../constants/fonts';

interface Props {
  chapters: Chapter[];
  activeChapterId: string;
  onSelect: (chapterId: string) => void;
}

export function ChapterNav({ chapters, activeChapterId, onSelect }: Props) {
  const { tokens } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[styles.container, { backgroundColor: tokens.bg, borderBottomColor: tokens.border }]}
      contentContainerStyle={styles.content}
    >
      {chapters.map((ch) => {
        const isActive = ch.id === activeChapterId;
        return (
          <TouchableOpacity
            key={ch.id}
            style={[
              styles.pill,
              {
                backgroundColor: isActive ? tokens.accent : tokens.accentDim,
                borderColor: isActive ? tokens.accent : tokens.border,
              },
            ]}
            onPress={() => onSelect(ch.id)}
          >
            <Text style={[styles.pillText, { color: isActive ? '#fff' : tokens.text2 }]}>
              {ch.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { borderBottomWidth: 1, maxHeight: 44 },
  content: { flexDirection: 'row', gap: 6, padding: 10, alignItems: 'center' },
  pill: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: { fontFamily: FONTS.sansBold, fontSize: 12, textAlign: 'center' },
});
