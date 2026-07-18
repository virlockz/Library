import React, { useRef, useState } from 'react';
import { View, StyleSheet, PanResponder, Text } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { FONTS } from '../constants/fonts';

interface Props {
  progress: number;
  totalPages: number;
  onSeek?: (page: number) => void;
  chapterName?: string;
}

export function ThinProgressBar({ progress, totalPages, onSeek, chapterName }: Props) {
  const { tokens } = useTheme();
  const trackRef = useRef<View>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipProgress, setTooltipProgress] = useState(progress);
  const [tooltipPage, setTooltipPage] = useState(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setShowTooltip(true);
      },
      onPanResponderMove: (_, gestureState) => {
        trackRef.current?.measure((x, y, width) => {
          const newX = Math.max(0, Math.min(width, gestureState.moveX - x));
          const pct = (newX / width) * 100;
          const page = Math.round((pct / 100) * (totalPages - 1));
          setTooltipProgress(pct);
          setTooltipPage(page);
        });
      },
      onPanResponderRelease: (_, gestureState) => {
        setShowTooltip(false);
        trackRef.current?.measure((x, y, width) => {
          const newX = Math.max(0, Math.min(width, gestureState.moveX - x));
          const pct = (newX / width) * 100;
          const page = Math.round((pct / 100) * (totalPages - 1));
          onSeek?.(page);
        });
      },
    })
  ).current;

  return (
    <View style={styles.wrapper}>
      {showTooltip && (
        <View style={[styles.tooltip, { backgroundColor: tokens.tab, borderColor: tokens.border }]}>
          <Text style={[styles.tooltipText, { color: tokens.text }]}>{Math.round(tooltipProgress)}%</Text>
          <Text style={[styles.tooltipPage, { color: tokens.text2 }]}>Page {tooltipPage + 1} of {totalPages}</Text>
          {chapterName && <Text style={[styles.tooltipChapter, { color: tokens.text2 }]} numberOfLines={1}>{chapterName}</Text>}
        </View>
      )}
      <View
        ref={trackRef}
        style={[styles.container, { backgroundColor: tokens.border }]}
        {...panResponder.panHandlers}
      >
        <View
          style={[
            styles.fill,
            {
              backgroundColor: tokens.accent,
              width: `${Math.min(100, Math.max(0, tooltipProgress))}%`,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: 'relative', width: '100%' },
  container: {
    height: 3,
    width: '100%',
  },
  fill: {
    height: 3,
  },
  tooltip: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 0.5,
    zIndex: 100,
    alignItems: 'center',
    minWidth: 80,
  },
  tooltipText: { fontFamily: FONTS.sans, fontSize: 13, fontWeight: '600' },
  tooltipPage: { fontFamily: FONTS.sans, fontSize: 10, marginTop: 2 },
  tooltipChapter: { fontFamily: FONTS.sans, fontSize: 10, marginTop: 1, maxWidth: 120 },
});
