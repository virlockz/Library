import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface Props {
  visible: boolean;
  onHighlight: (color: 'yellow' | 'green' | 'pink' | 'blue') => void;
  onClear: () => void;
}

const COLORS = [
  { name: 'yellow' as const, bg: '#FFD700' },
  { name: 'green' as const, bg: '#50C864' },
  { name: 'pink' as const, bg: '#E060CC' },
  { name: 'blue' as const, bg: '#50A0FF' },
];

export function HighlightToolbar({ visible, onHighlight, onClear }: Props) {
  if (!visible) return null;

  return (
    <View style={styles.toolbar}>
      {COLORS.map((c) => (
        <TouchableOpacity
          key={c.name}
          style={[styles.swatch, { backgroundColor: c.bg }]}
          onPress={() => onHighlight(c.name)}
        />
      ))}
      <TouchableOpacity style={styles.clearBtn} onPress={onClear}>
        <Text style={styles.clearText}>✕</Text>
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
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 6,
    gap: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 400,
  },
  swatch: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: 'transparent' },
  clearBtn: { padding: 4 },
  clearText: { fontSize: 16, color: '#888' },
});
