import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Modal } from 'react-native';
import { X } from 'phosphor-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Chapter } from '../types';
import { FONTS } from '../constants/fonts';

interface Props {
  visible: boolean;
  chapters: Chapter[];
  activeChapterId: string;
  onSelect: (chapterId: string) => void;
  onClose: () => void;
}

export function TOCModal({ visible, chapters, activeChapterId, onSelect, onClose }: Props) {
  const { tokens } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.panel, { backgroundColor: tokens.page, borderColor: tokens.border }]}>
          <View style={[styles.header, { borderBottomColor: tokens.border }]}>
            <Text style={[styles.title, { color: tokens.accent }]}>Table of Contents</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={20} color={tokens.accent} weight="bold" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={chapters}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const isActive = item.id === activeChapterId;
              return (
                <TouchableOpacity
                  style={[styles.row, isActive && { backgroundColor: tokens.accentDim }]}
                  onPress={() => { onSelect(item.id); onClose(); }}
                >
                  <Text style={[styles.chapterLabel, { color: isActive ? tokens.accent : tokens.text }]}>
                    {item.label}
                  </Text>
                  <Text style={[styles.chapterTitle, { color: tokens.text2 }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  panel: { borderTopLeftRadius: 16, borderTopRightRadius: 16, borderWidth: 1, maxHeight: '70%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  title: { fontFamily: FONTS.serifBold, fontSize: 18 },
  close: { fontSize: 20, padding: 4 },
  row: { padding: 14, paddingHorizontal: 16, borderBottomWidth: 0.5 },
  chapterLabel: { fontFamily: FONTS.sansBold, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 },
  chapterTitle: { fontFamily: FONTS.serif, fontSize: 15 },
});
