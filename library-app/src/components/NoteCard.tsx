import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Note } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { FONTS } from '../constants/fonts';

interface Props {
  note: Note;
  onDelete: (id: string) => void;
}

export function NoteCard({ note, onDelete }: Props) {
  const { tokens } = useTheme();

  const badgeColors: Record<string, { bg: string; text: string }> = {
    page: { bg: tokens.accentDim, text: tokens.accent },
    chapter: { bg: 'rgba(80,160,80,0.15)', text: tokens.text2 },
    book: { bg: 'rgba(80,80,200,0.1)', text: tokens.text2 },
  };

  const badge = badgeColors[note.type] || badgeColors.page;

  return (
    <View style={[styles.card, { backgroundColor: tokens.page, borderColor: tokens.border }]}>
      <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(note.id)}>
        <Text style={styles.deleteText}>✕</Text>
      </TouchableOpacity>
      <View style={[styles.badge, { backgroundColor: badge.bg }]}>
        <Text style={[styles.badgeText, { color: badge.text }]}>
          {note.type === 'page' ? '🖊' : note.type === 'chapter' ? '📜' : '📖'} {note.type}
        </Text>
      </View>
      <Text style={[styles.text, { color: tokens.text }]}>{note.text}</Text>
      <Text style={[styles.meta, { color: tokens.text2 }]}>
        {note.chapterTitle}{note.pageLabel ? ` · ${note.pageLabel}` : ''} · {note.date}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 8, padding: 12, marginBottom: 10, borderWidth: 1, position: 'relative' },
  deleteBtn: { position: 'absolute', top: 8, right: 8, padding: 4 },
  deleteText: { fontSize: 16, opacity: 0.4 },
  badge: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start', marginBottom: 6 },
  badgeText: { fontFamily: FONTS.sansBold, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' },
  text: { fontFamily: FONTS.serif, fontSize: 15, lineHeight: 24 },
  meta: { fontFamily: FONTS.sans, fontSize: 11, marginTop: 6 },
});
