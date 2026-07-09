import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { FONTS } from '../constants/fonts';

const COVER_COLORS = [
  '#8B4513', '#C96442', '#00C2CC', '#B8962E',
  '#6B5B95', '#88B04B', '#955251', '#009B77',
  '#DD4124', '#45B8AC', '#5B5EA6', '#9B2335',
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

interface Props {
  title: string;
  coverImage?: string;
  size?: number;
}

export function BookCover({ title, coverImage, size = 80 }: Props) {
  const { tokens } = useTheme();
  const colorIndex = hashString(title) % COVER_COLORS.length;
  const bgColor = COVER_COLORS[colorIndex];
  const initials = title
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  if (coverImage) {
    return (
      <View style={[styles.coverWrap, { width: size, height: size * 1.4, borderRadius: size * 0.06 }]}>
        <Image
          source={{ uri: coverImage }}
          style={[styles.image, { borderRadius: size * 0.06 }]}
          resizeMode="cover"
        />
        <View style={[styles.spine, { backgroundColor: 'rgba(0,0,0,0.1)' }]} />
      </View>
    );
  }

  return (
    <View style={[styles.cover, { width: size, height: size * 1.4, backgroundColor: bgColor, borderRadius: size * 0.06 }]}>
      <Text style={[styles.initials, { fontSize: size * 0.3 }]}>{initials}</Text>
      <View style={[styles.spine, { backgroundColor: 'rgba(255,255,255,0.15)' }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  cover: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  coverWrap: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initials: {
    fontFamily: FONTS.serifBold,
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 2,
  },
  spine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
});
