import React from 'react';
import { Text, View, StyleSheet, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';

function TabIcon({ label, focused, color }: { label: string; focused: boolean; color: string }) {
  const icons: Record<string, string> = {
    'Reading Now': '📖',
    Library: '📚',
    Browse: '🔍',
    Search: '🔎',
  };
  return (
    <View style={styles.tabIcon}>
      <Text style={[styles.tabEmoji, { opacity: focused ? 1 : 0.5 }]}>{icons[label] || '📄'}</Text>
    </View>
  );
}

export default function TabLayout() {
  const { tokens, theme } = useTheme();

  return (
    <Tabs
      key={theme}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: tokens.tab,
          borderTopColor: tokens.border,
          borderTopWidth: 0.5,
          elevation: 0,
          shadowOpacity: 0,
          height: Platform.OS === 'android' ? 60 : 85,
          paddingBottom: Platform.OS === 'android' ? 8 : 25,
          paddingTop: 6,
        },
        tabBarActiveTintColor: tokens.accent,
        tabBarInactiveTintColor: tokens.text2,
        tabBarLabelStyle: {
          fontFamily: 'System',
          fontSize: 10,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="reading-now"
        options={{
          title: 'Reading Now',
          tabBarIcon: ({ focused, color }) => <TabIcon label="Reading Now" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ focused, color }) => <TabIcon label="Library" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="browse"
        options={{
          title: 'Browse',
          tabBarIcon: ({ focused, color }) => <TabIcon label="Browse" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ focused, color }) => <TabIcon label="Search" focused={focused} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIcon: { alignItems: 'center', justifyContent: 'center' },
  tabEmoji: { fontSize: 22 },
});
