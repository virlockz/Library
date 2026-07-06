import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, Share, Platform } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Note } from '../types';
import { FONTS } from '../constants/fonts';

interface Props {
  visible: boolean;
  notes: Note[];
  bookTitle: string;
  onClose: () => void;
}

export function ExportNotes({ visible, notes, bookTitle, onClose }: Props) {
  const { tokens } = useTheme();

  const handleExport = async (format: 'text' | 'markdown') => {
    let content = `Notes from: ${bookTitle}\n${'='.repeat(40)}\n\n`;

    for (const note of notes) {
      if (format === 'markdown') {
        content += `### [${note.type.toUpperCase()}] ${note.chapterTitle}`;
        if (note.pageLabel) content += ` — ${note.pageLabel}`;
        content += `\n_${note.date}_\n\n${note.text}\n\n---\n\n`;
      } else {
        content += `[${note.type.toUpperCase()}] ${note.chapterTitle}`;
        if (note.pageLabel) content += ` — ${note.pageLabel}`;
        content += ` (${note.date})\n${note.text}\n\n`;
      }
    }

    await Share.share({
      message: content,
      title: `Notes - ${bookTitle}`,
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.panel, { backgroundColor: tokens.page, borderColor: tokens.border }]}>
          <Text style={[styles.title, { color: tokens.accent }]}>Export {notes.length} Notes</Text>
          <TouchableOpacity style={[styles.option, { borderColor: tokens.border }]} onPress={() => handleExport('text')}>
            <Text style={[styles.optionText, { color: tokens.text }]}>Plain Text</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.option, { borderColor: tokens.border }]} onPress={() => handleExport('markdown')}>
            <Text style={[styles.optionText, { color: tokens.text }]}>Markdown</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.cancelBtn, { borderColor: tokens.border }]} onPress={onClose}>
            <Text style={[styles.cancelText, { color: tokens.text2 }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  panel: { borderRadius: 12, padding: 20, borderWidth: 1 },
  title: { fontFamily: FONTS.serifBold, fontSize: 18, marginBottom: 16 },
  option: { borderWidth: 1.5, borderRadius: 8, padding: 12, alignItems: 'center', marginBottom: 10 },
  optionText: { fontFamily: FONTS.sansBold, fontSize: 14 },
  cancelBtn: { borderWidth: 1.5, borderRadius: 8, padding: 10, alignItems: 'center', marginTop: 4 },
  cancelText: { fontFamily: FONTS.sansBold, fontSize: 14 },
});
