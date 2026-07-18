import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  progress: number;
}

export function ReadingProgressBar({ progress }: Props) {
  const { tokens } = useTheme();

  return (
    <View style={[styles.track, { backgroundColor: tokens.border }]}>
      <View
        style={[
          styles.fill,
          {
            backgroundColor: tokens.accent,
            width: `${Math.min(100, Math.max(0, progress))}%`,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 2,
    width: '100%',
  },
  fill: {
    height: 2,
  },
});
