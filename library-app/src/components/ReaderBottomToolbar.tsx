import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CaretLeft, CaretRight, TextAa, List, Sun, MagnifyingGlass } from 'phosphor-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { ReadingProgressBar } from './ReadingProgressBar';
import { FONTS } from '../constants/fonts';

interface Props {
  pageNumber: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onFontPress: () => void;
  onTOCPress: () => void;
  onThemePress: () => void;
  onMorePress: () => void;
  onSearchPress: () => void;
}

export function ReaderBottomToolbar({
  pageNumber,
  totalPages,
  onPrev,
  onNext,
  onFontPress,
  onTOCPress,
  onThemePress,
  onMorePress,
  onSearchPress,
}: Props) {
  const { tokens } = useTheme();
  const progress = totalPages > 0 ? ((pageNumber + 1) / totalPages) * 100 : 0;

  return (
    <View style={[styles.container, { backgroundColor: tokens.tab, borderTopColor: tokens.border }]}>
      <ReadingProgressBar progress={progress} />
      <View style={styles.navRow}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={onPrev}
          disabled={pageNumber <= 0}
        >
          <CaretLeft size={20} color={pageNumber <= 0 ? tokens.text2 : tokens.accent} weight="fill" />
        </TouchableOpacity>
        <Text style={[styles.progressText, { color: tokens.text2 }]}>
          {Math.round(progress)}%
        </Text>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={onNext}
          disabled={pageNumber >= totalPages - 1}
        >
          <CaretRight size={20} color={pageNumber >= totalPages - 1 ? tokens.text2 : tokens.accent} weight="fill" />
        </TouchableOpacity>
      </View>
      <View style={[styles.controlRow, { borderTopColor: tokens.border }]}>
        <TouchableOpacity style={styles.controlBtn} onPress={onSearchPress}>
          <MagnifyingGlass size={20} color={tokens.text2} weight="regular" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlBtn} onPress={onTOCPress}>
          <List size={20} color={tokens.text2} weight="regular" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlBtn} onPress={onFontPress}>
          <TextAa size={20} color={tokens.text2} weight="regular" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlBtn} onPress={onThemePress}>
          <Sun size={20} color={tokens.text2} weight="regular" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 0.5,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  navBtn: {
    padding: 8,
  },
  progressText: {
    fontFamily: FONTS.sans,
    fontSize: 14,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 0.5,
    paddingVertical: 8,
    paddingBottom: 20,
  },
  controlBtn: {
    padding: 8,
  },
});
