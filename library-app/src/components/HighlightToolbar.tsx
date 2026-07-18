import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { X } from 'phosphor-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { FONTS } from '../constants/fonts';

interface Props {
  visible: boolean;
  onHighlight: (color: 'yellow' | 'green' | 'blue' | 'pink' | 'purple' | 'underline') => void;
  onClear: () => void;
}

const COLORS = [
  { name: 'yellow' as const, bg: '#FFD700' },
  { name: 'green' as const, bg: '#50C864' },
  { name: 'blue' as const, bg: '#50A0FF' },
  { name: 'pink' as const, bg: '#E060CC' },
  { name: 'purple' as const, bg: '#AF52DE' },
];

export function HighlightToolbar({ visible, onHighlight, onClear }: Props) {
  const { tokens } = useTheme();
  if (!visible) return null;

  return (
    <View style={[styles.toolbar, { backgroundColor: tokens.page, borderColor: tokens.border }]}>
      {COLORS.map((c) => (
        <TouchableOpacity
          key={c.name}
          style={[styles.swatch, { backgroundColor: c.bg }]}
          onPress={() => onHighlight(c.name)}
        />
      ))}
      <TouchableOpacity
        style={[styles.underlineBtn, { borderColor: tokens.border }]}
        onPress={() => onHighlight('underline')}
      >
        <Text style={[styles.underlineText, { color: tokens.text }]}>U</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.clearBtn} onPress={onClear}>
        <X size={16} color={tokens.text2} weight="bold" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    flexDirection: 'row',
    borderRadius: 8,
    padding: 6,
    gap: 8,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 400,
  },
  swatch: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: 'transparent' },
  underlineBtn: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  underlineText: {
    fontSize: 12,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  clearBtn: { padding: 4 },
});
