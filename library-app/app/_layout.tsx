import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { Platform, Linking } from 'react-native';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import { LibraryProvider, useLibrary } from '../src/contexts/LibraryContext';
import { importFileFromUri } from '../src/services/fileImport';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

function IntentHandler() {
  const { addBook } = useLibrary();

  useEffect(() => {
    const handleUrl = async (url: string | null) => {
      if (!url) return;
      if (url.endsWith('.epub') || url.endsWith('.pdf') || url.endsWith('.txt') || url.endsWith('.md')) {
        try {
          const book = await importFileFromUri(url);
          if (book) await addBook(book);
        } catch (e) {
          // Silent fail on intent import
        }
      }
    };

    Linking.getInitialURL().then(handleUrl);
    const sub = Linking.addEventListener('url', (e) => handleUrl(e.url));
    return () => sub.remove();
  }, []);

  return null;
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <LibraryProvider>
        <IntentHandler />
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
