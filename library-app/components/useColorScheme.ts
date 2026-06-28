import { useColorScheme as useColorSchemeCore, ColorSchemeName } from 'react-native';

export const useThemeColorScheme = (): 'light' | 'dark' => {
  const coreScheme = useColorSchemeCore();
  return coreScheme === 'dark' ? 'dark' : 'light';
};
