import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Sun, Book, Moon, Star } from 'phosphor-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeName } from '../types';

const THEME_ICONS: Record<ThemeName, React.ComponentType<any>> = {
  light: Sun,
  sepia: Book,
  dark: Moon,
  night: Star,
};

interface Props {
  availableThemes: ThemeName[];
}

export function ThemeToggle({ availableThemes }: Props) {
  const { theme, cycleTheme, tokens } = useTheme();
  const Icon = THEME_ICONS[theme] || Sun;

  return (
    <TouchableOpacity
      style={[styles.button, { borderColor: tokens.border, backgroundColor: tokens.accentDim }]}
      onPress={() => cycleTheme(availableThemes)}
    >
      <Icon size={18} color={tokens.accent} weight="fill" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
