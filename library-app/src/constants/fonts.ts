import { Platform, TextStyle } from 'react-native';

interface FontDef {
  family: string;
  weight: TextStyle['fontWeight'];
}

const SERIF: FontDef = Platform.select({
  ios: { family: 'Georgia', weight: '400' },
  android: { family: 'serif', weight: 'normal' },
  default: { family: 'Georgia', weight: '400' },
})!;

const SERIF_BOLD: FontDef = Platform.select({
  ios: { family: 'Georgia', weight: '600' },
  android: { family: 'serif', weight: 'bold' },
  default: { family: 'Georgia', weight: '600' },
})!;

const SANS: FontDef = Platform.select({
  ios: { family: 'System', weight: '400' },
  android: { family: 'sans-serif', weight: 'normal' },
  default: { family: 'sans-serif', weight: '400' },
})!;

const SANS_BOLD: FontDef = Platform.select({
  ios: { family: 'System', weight: '700' },
  android: { family: 'sans-serif', weight: 'bold' },
  default: { family: 'sans-serif', weight: '700' },
})!;

export const FONTS = {
  serif: SERIF.family,
  serifBold: SERIF_BOLD.family,
  sans: SANS.family,
  sansBold: SANS_BOLD.family,
};

export const FONT_WEIGHTS = {
  serif: SERIF.weight,
  serifBold: SERIF_BOLD.weight,
  sans: SANS.weight,
  sansBold: SANS_BOLD.weight,
};
