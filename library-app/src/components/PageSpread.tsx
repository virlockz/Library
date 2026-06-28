import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { FONTS } from '../constants/fonts';

interface Props {
  pageNumber: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  children: React.ReactNode;
}

export function PageSpread({ pageNumber, totalPages, onPrev, onNext, children }: Props) {
  const { tokens } = useTheme();

  return (
    <View style={[styles.spread, { backgroundColor: tokens.page, borderColor: tokens.border }]}>
      <View style={[styles.spine, { backgroundColor: tokens.accent }]} />
      <View style={styles.content}>
        {children}
      </View>
      <View style={[styles.nav, { borderTopColor: tokens.border }]}>
        <TouchableOpacity
          style={[styles.navBtn, { borderColor: tokens.accent, backgroundColor: tokens.accentDim }]}
          onPress={onPrev}
          disabled={pageNumber <= 0}
        >
          <Text style={[styles.navBtnText, { color: pageNumber <= 0 ? tokens.text2 : tokens.accent }]}>
            ← Previous
          </Text>
        </TouchableOpacity>
        <Text style={[styles.indicator, { color: tokens.text2 }]}>
          Page {pageNumber + 1} of {totalPages}
        </Text>
        <TouchableOpacity
          style={[styles.navBtn, { borderColor: tokens.accent, backgroundColor: tokens.accentDim }]}
          onPress={onNext}
          disabled={pageNumber >= totalPages - 1}
        >
          <Text style={[styles.navBtnText, { color: pageNumber >= totalPages - 1 ? tokens.text2 : tokens.accent }]}>
            Next →
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  spread: {
    margin: 16,
    borderRadius: 4,
    minHeight: 500,
    borderWidth: 1,
    overflow: 'hidden',
  },
  spine: {
    position: 'absolute',
    left: 40,
    top: 0,
    bottom: 0,
    width: 1,
    opacity: 0.3,
  },
  content: {
    padding: 40,
    paddingBottom: 20,
  },
  nav: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 12,
    borderTopWidth: 1,
  },
  navBtn: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  navBtnText: { fontFamily: FONTS.sansBold, fontSize: 14 },
  indicator: { fontFamily: FONTS.sans, fontSize: 13 },
});
