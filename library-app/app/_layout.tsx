import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import { LibraryProvider } from '../src/contexts/LibraryContext';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  return (
    <ThemeProvider>
      <LibraryProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: Platform.OS === 'android' ? 'slide_from_left' : 'default',
            contentStyle: { backgroundColor: 'transparent' },
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="reader/[id]"
            options={{
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="reader/notes/[id]"
            options={{
              animation: 'slide_from_right',
            }}
          />
        </Stack>
      </LibraryProvider>
    </ThemeProvider>
  );
}
