import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { THEME_LABELS } from '../constants';
import { ThemeName } from '../types';
import { FONTS } from '../constants/fonts';

interface Props {
  availableThemes: ThemeName[];
}

export function ThemeToggle({ availableThemes }: Props) {
  const { theme, cycleTheme, tokens } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.button, { borderColor: tokens.border, backgroundColor: tokens.accentDim }]}
      onPress={() => cycleTheme(availableThemes)}
    >
      <Text style={[styles.label, { color: tokens.accent }]}>
        {THEME_LABELS[theme]}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  label: {
    fontFamily: FONTS.sansBold,
    fontSize: 13,
  },
});
