import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  children: React.ReactNode;
}

export function PageSpread({ children }: Props) {
  const { tokens } = useTheme();

  return (
    <View style={[styles.spread, { backgroundColor: tokens.page, borderColor: tokens.border }]}>
      <View style={styles.content}>
        {children}
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
  content: {
    padding: 40,
    paddingBottom: 20,
  },
});
