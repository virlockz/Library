import React, { useRef } from 'react';
import { View, Text, Animated, StyleSheet, Platform, ScrollViewProps } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { FONTS } from '../constants/fonts';

interface Props {
  title: string;
  rightAction?: React.ReactNode;
  scrollY: Animated.Value;
}

export function AnimatedHeader({ title, rightAction, scrollY }: Props) {
  const { tokens } = useTheme();

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [100, 56],
    extrapolate: 'clamp',
  });

  const titleSize = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [34, 17],
    extrapolate: 'clamp',
  });

  const titleOpacity = scrollY.interpolate({
    inputRange: [0, 60, 80],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  const smallTitleOpacity = scrollY.interpolate({
    inputRange: [60, 80],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, { backgroundColor: tokens.bg, paddingTop: Platform.OS === 'android' ? 40 : 50 }]}>
      {/* Large title */}
      <Animated.View style={[styles.largeTitleWrap, { opacity: titleOpacity }]}>
        <Animated.Text style={[styles.largeTitle, { color: tokens.text, fontSize: titleSize }]}>
          {title}
        </Animated.Text>
      </Animated.View>

      {/* Small title (appears on scroll) */}
      <Animated.View style={[styles.smallTitleWrap, { opacity: smallTitleOpacity }]}>
        <Text style={[styles.smallTitle, { color: tokens.text }]}>{title}</Text>
        {rightAction}
      </Animated.View>
    </View>
  );
}

// Helper to create scroll event handler
export function createScrollHandler(scrollY: Animated.Value) {
  return Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  largeTitleWrap: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  largeTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 34,
  },
  smallTitleWrap: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 40 : 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  smallTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 17,
  },
});
