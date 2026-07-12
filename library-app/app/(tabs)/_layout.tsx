import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Book, Bookmarks, Compass, MagnifyingGlass } from 'phosphor-react-native';
import { useTheme } from '../../src/contexts/ThemeContext';

export default function TabLayout() {
  const { tokens, theme } = useTheme();
  const size = 24;

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
          height: Platform.OS === 'android' ? 80 : 85,
          paddingBottom: Platform.OS === 'android' ? 24 : 25,
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
          tabBarIcon: ({ color }) => <Book size={size} color={color} weight="light" />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color }) => <Bookmarks size={size} color={color} weight="light" />,
        }}
      />
      <Tabs.Screen
        name="browse"
        options={{
          title: 'Browse',
          tabBarIcon: ({ color }) => <Compass size={size} color={color} weight="light" />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <MagnifyingGlass size={size} color={color} weight="light" />,
        }}
      />
    </Tabs>
  );
}
