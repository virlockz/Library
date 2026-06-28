import { Platform } from 'react-native';

export const FONTS = {
  serif: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' })!,
  serifBold: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' })!,
  sans: Platform.select({ ios: 'System', android: 'sans-serif', default: 'sans-serif' })!,
  sansBold: Platform.select({ ios: 'System', android: 'sans-serif', default: 'sans-serif' })!,
};
