import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
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

function darkenColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0x00FF) - amount);
  const b = Math.max(0, (num & 0x0000FF) - amount);
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

interface Props {
  title: string;
  coverImage?: string;
  size?: number;
}

export function BookCover({ title, coverImage, size = 80 }: Props) {
  const colorIndex = hashString(title) % COVER_COLORS.length;
  const bgColor = COVER_COLORS[colorIndex];
  const darkBg = darkenColor(bgColor, 40);
  const initials = title
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  const coverWidth = size;
  const coverHeight = size * 1.5;
  const borderRadius = 3;

  const shadowStyle = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  };

  if (coverImage) {
    return (
      <View style={[styles.coverWrap, { width: coverWidth, height: coverHeight, borderRadius, ...shadowStyle }]}>
        <Image
          source={{ uri: coverImage }}
          style={[styles.image, { borderRadius }]}
          resizeMode="cover"
        />
      </View>
    );
  }

  return (
    <View style={[styles.cover, { width: coverWidth, height: coverHeight, borderRadius, ...shadowStyle }]}>
      <View style={[styles.gradient, { backgroundColor: bgColor }]}>
        <View style={[styles.gradientOverlay, { backgroundColor: darkBg }]} />
      </View>
      <Text style={[styles.initials, { fontSize: size * 0.28 }]}>{initials}</Text>
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
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
  },
  initials: {
    fontFamily: FONTS.serifBold,
    color: 'rgba(255,255,255,0.92)',
    letterSpacing: 2,
    zIndex: 1,
  },
});
