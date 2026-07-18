import React, { useRef } from 'react';
import { Platform, View, StyleSheet, ScrollView } from 'react-native';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { BookOpen, Books, Compass, MagnifyingGlass } from 'phosphor-react-native';
import { useTheme } from '../../src/contexts/ThemeContext';

// Scroll reference for each tab (used for scroll-to-top)
export const tabScrollRefs: Record<string, React.RefObject<ScrollView | null>> = {
  'reading-now': React.createRef(),
  library: React.createRef(),
  browse: React.createRef(),
  search: React.createRef(),
};

export default function TabLayout() {
  const { tokens, theme } = useTheme();
  const size = 24;

  const handleTabPress = (tabName: string) => {
    // Scroll to top when tapping the already-active tab
    const ref = tabScrollRefs[tabName];
    if (ref?.current && 'scrollToOffset' in ref.current) {
      (ref.current as any).scrollToOffset({ offset: 0, animated: true });
    }
  };

  return (
    <Tabs
      key={theme}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : tokens.barBg,
          borderTopColor: tokens.border,
          borderTopWidth: 0.5,
          elevation: 0,
          shadowOpacity: 0,
          height: Platform.OS === 'android' ? 80 : 85,
          paddingBottom: Platform.OS === 'android' ? 24 : 25,
          paddingTop: 6,
          position: 'absolute',
        },
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView
              intensity={80}
              tint={theme === 'light' || theme === 'sepia' ? 'light' : 'dark'}
              style={StyleSheet.absoluteFill}
            />
          ) : null
        ),
        tabBarActiveTintColor: tokens.accent,
        tabBarInactiveTintColor: tokens.text2,
        tabBarLabelStyle: {
          fontFamily: 'System',
          fontSize: 11,
          fontWeight: '400',
        },
      }}
    >
      <Tabs.Screen
        name="reading-now"
        options={{
          title: 'Reading Now',
          tabBarIcon: ({ color, focused }) => (
            <BookOpen size={size} color={color} weight={focused ? 'fill' : 'regular'} />
          ),
        }}
        listeners={{
          tabPress: () => handleTabPress('reading-now'),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color, focused }) => (
            <Books size={size} color={color} weight={focused ? 'fill' : 'regular'} />
          ),
        }}
        listeners={{
          tabPress: () => handleTabPress('library'),
        }}
      />
      <Tabs.Screen
        name="browse"
        options={{
          title: 'Browse',
          tabBarIcon: ({ color, focused }) => (
            <Compass size={size} color={color} weight={focused ? 'fill' : 'regular'} />
          ),
        }}
        listeners={{
          tabPress: () => handleTabPress('browse'),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, focused }) => (
            <MagnifyingGlass size={size} color={color} weight={focused ? 'fill' : 'regular'} />
          ),
        }}
        listeners={{
          tabPress: () => handleTabPress('search'),
        }}
      />
    </Tabs>
  );
}
