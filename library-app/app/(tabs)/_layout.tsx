import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { useTheme } from '../../src/contexts/ThemeContext';

export default function TabLayout() {
  const { tokens } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: tokens.tab,
          borderTopColor: tokens.border,
          borderTopWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
          position: 'absolute' as const,
        },
        tabBarActiveTintColor: tokens.accent,
        tabBarInactiveTintColor: tokens.text2,
        tabBarBackground: () => (
          <View style={{ flex: 1, backgroundColor: tokens.tab }} />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Library',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📖</Text>,
        }}
      />
    </Tabs>
  );
}
