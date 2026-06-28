import { Stack } from 'expo-router';
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
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="reader/[id]" />
          <Stack.Screen name="reader/notes/[id]" />
        </Stack>
      </LibraryProvider>
    </ThemeProvider>
  );
}
