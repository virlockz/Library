import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useReadingStats } from '../hooks/useReadingStats';
import { FONTS } from '../constants/fonts';

export function StatsDisplay() {
  const { tokens } = useTheme();
  const { stats } = useReadingStats();

  const hours = Math.floor(stats.totalReadingTimeMs / 3600000);
  const minutes = Math.floor((stats.totalReadingTimeMs % 3600000) / 60000);

  return (
    <View style={styles.container}>
      <View style={[styles.stat, { backgroundColor: tokens.accentDim }]}>
        <Text style={[styles.statValue, { color: tokens.accent }]}>{stats.totalBooksOpened}</Text>
        <Text style={[styles.statLabel, { color: tokens.text2 }]}>Books</Text>
      </View>
      <View style={[styles.stat, { backgroundColor: tokens.accentDim }]}>
        <Text style={[styles.statValue, { color: tokens.accent }]}>{stats.totalPagesRead}</Text>
        <Text style={[styles.statLabel, { color: tokens.text2 }]}>Pages</Text>
      </View>
      <View style={[styles.stat, { backgroundColor: tokens.accentDim }]}>
        <Text style={[styles.statValue, { color: tokens.accent }]}>{hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`}</Text>
        <Text style={[styles.statLabel, { color: tokens.text2 }]}>Reading</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  stat: { flex: 1, borderRadius: 10, padding: 12, alignItems: 'center' },
  statValue: { fontFamily: FONTS.serifBold, fontSize: 20 },
  statLabel: { fontFamily: FONTS.sans, fontSize: 11, marginTop: 2 },
});
