import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Modal, Platform } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useNotes } from '../hooks/useNotes';
import { useBookmarks } from '../hooks/useBookmarks';
import { Chapter } from '../types';
import { FONTS } from '../constants/fonts';

interface Props {
  visible: boolean;
  chapters: Chapter[];
  activeChapterId: string;
  bookId: string;
  onSelect: (chapterId: string) => void;
  onClose: () => void;
  onPageJump?: (pageIndex: number) => void;
}

export function TOCModal({ visible, chapters, activeChapterId, bookId, onSelect, onClose, onPageJump }: Props) {
  const { tokens } = useTheme();
  const [activeSegment, setActiveSegment] = useState<'contents' | 'bookmarks' | 'notes'>('contents');
  const { notes } = useNotes(bookId);
  const { bookmarks } = useBookmarks(bookId);
  const flatListRef = useRef<FlatList>(null);

  // Auto-scroll to current chapter when modal opens
  useEffect(() => {
    if (visible && activeSegment === 'contents') {
      const idx = chapters.findIndex((ch) => ch.id === activeChapterId);
      if (idx >= 0) {
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({ index: idx, animated: true, viewPosition: 0.3 });
        }, 300);
      }
    }
  }, [visible, activeSegment, activeChapterId, chapters]);

  const segments = [
    { key: 'contents' as const, label: 'Contents' },
    { key: 'bookmarks' as const, label: 'Bookmarks' },
    { key: 'notes' as const, label: 'Notes' },
  ];

  return (
    <Modal visible={visible} animationType="slide">
      <View style={[styles.container, { backgroundColor: tokens.bg }]}>
        <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? 40 : 50, borderBottomColor: tokens.border }]}>
          <Text style={[styles.title, { color: tokens.text }]}>Table of Contents</Text>
          <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { borderColor: tokens.border }]}>
            <Text style={[styles.doneText, { color: tokens.accent }]}>Done</Text>
          </TouchableOpacity>
        </View>

        {/* Segmented Control */}
        <View style={[styles.segmentBar, { backgroundColor: tokens.border }]}>
          {segments.map((seg) => (
            <TouchableOpacity
              key={seg.key}
              style={[styles.segment, activeSegment === seg.key && { backgroundColor: tokens.tab }]}
              onPress={() => setActiveSegment(seg.key)}
            >
              <Text style={[styles.segmentText, { color: activeSegment === seg.key ? tokens.text : tokens.text2 }]}>
                {seg.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        {activeSegment === 'contents' && (
          <FlatList
            ref={flatListRef}
            data={chapters}
            keyExtractor={(item) => item.id}
            onScrollToIndexFailed={() => {}}
            renderItem={({ item }) => {
              const isActive = item.id === activeChapterId;
              return (
                <TouchableOpacity
                  style={[styles.row, { borderBottomColor: tokens.border }, isActive && { backgroundColor: tokens.accentDim }]}
                  onPress={() => { onSelect(item.id); onClose(); }}
                >
                  {isActive && <View style={[styles.activeIndicator, { backgroundColor: tokens.accent }]} />}
                  <View style={styles.rowContent}>
                    <Text style={[styles.chapterLabel, { color: isActive ? tokens.accent : tokens.text2 }]}>
                      {item.label}
                    </Text>
                    <Text style={[styles.chapterTitle, { color: isActive ? tokens.accent : tokens.text }]} numberOfLines={1}>
                      {item.title}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}

        {activeSegment === 'bookmarks' && (
          <FlatList
            data={bookmarks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.row, { borderBottomColor: tokens.border }]}
                onPress={() => { onPageJump?.(item.pageIndex); onClose(); }}
              >
                <View style={styles.rowContent}>
                  <Text style={[styles.chapterTitle, { color: tokens.text }]} numberOfLines={1}>{item.label}</Text>
                  <Text style={[styles.chapterLabel, { color: tokens.text2 }]}>Page {item.pageIndex + 1}</Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={[styles.emptyText, { color: tokens.text2 }]}>No bookmarks yet</Text>
            }
          />
        )}

        {activeSegment === 'notes' && (
          <FlatList
            data={notes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.row, { borderBottomColor: tokens.border }]}
                onPress={() => { onPageJump?.(item.pageIndex); onClose(); }}
              >
                <View style={styles.rowContent}>
                  <Text style={[styles.chapterTitle, { color: tokens.text }]} numberOfLines={2}>{item.text}</Text>
                  <Text style={[styles.chapterLabel, { color: tokens.text2 }]}>{item.chapterTitle} · Page {item.pageIndex + 1}</Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={[styles.emptyText, { color: tokens.text2 }]}>No notes yet</Text>
            }
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
  },
  title: { fontFamily: FONTS.serifBold, fontSize: 20 },
  closeBtn: { borderWidth: 1.5, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  doneText: { fontFamily: FONTS.sansBold, fontSize: 14 },
  segmentBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 8,
    padding: 2,
  },
  segment: { flex: 1, paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  segmentText: { fontFamily: FONTS.sans, fontSize: 13, fontWeight: '600' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
  },
  activeIndicator: { width: 3, height: 32, borderRadius: 1.5, marginRight: 12 },
  rowContent: { flex: 1 },
  chapterLabel: { fontFamily: FONTS.sans, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 },
  chapterTitle: { fontFamily: FONTS.serif, fontSize: 16 },
  emptyText: { fontFamily: FONTS.serif, fontSize: 16, fontStyle: 'italic', textAlign: 'center', marginTop: 60 },
});
