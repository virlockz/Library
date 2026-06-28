import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { FONTS } from '../constants/fonts';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (type: 'page' | 'chapter' | 'book', text: string) => void;
}

export function NoteModal({ visible, onClose, onSave }: Props) {
  const { tokens } = useTheme();
  const [type, setType] = useState<'page' | 'chapter' | 'book'>('page');
  const [text, setText] = useState('');

  const handleSave = () => {
    if (!text.trim()) return;
    onSave(type, text.trim());
    setText('');
    setType('page');
    onClose();
  };

  const typeDescriptions = {
    page: 'Note about this specific page',
    chapter: 'Note about this chapter',
    book: 'General note about this book',
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.box, { backgroundColor: tokens.page, borderColor: tokens.border }]}>
          <Text style={[styles.title, { color: tokens.accent }]}>Add a Note</Text>

          <View style={styles.typeSelector}>
            {(['page', 'chapter', 'book'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.typeBtn,
                  { borderColor: tokens.border },
                  type === t && { backgroundColor: tokens.accent, borderColor: tokens.accent },
                ]}
                onPress={() => setType(t)}
              >
                <Text style={[styles.typeBtnText, { color: type === t ? '#fff' : tokens.text2 }]}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.desc, { color: tokens.text2 }]}>{typeDescriptions[type]}</Text>

          <TextInput
            style={[styles.textarea, { color: tokens.text, backgroundColor: tokens.bg, borderColor: tokens.border }]}
            placeholder="Write your note here..."
            placeholderTextColor={tokens.text2}
            value={text}
            onChangeText={setText}
            multiline
            textAlignVertical="top"
          />

          <View style={styles.actions}>
            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: tokens.accent }]} onPress={handleSave}>
              <Text style={styles.saveText}>Save Note</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.cancelBtn, { borderColor: tokens.border }]} onPress={onClose}>
              <Text style={[styles.cancelText, { color: tokens.text2 }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', padding: 16 },
  box: { borderRadius: 12, padding: 24, borderWidth: 1 },
  title: { fontFamily: FONTS.serifBold, fontSize: 20, marginBottom: 16 },
  typeSelector: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  typeBtn: { flex: 1, borderWidth: 1.5, borderRadius: 8, padding: 8, alignItems: 'center' },
  typeBtnText: { fontFamily: FONTS.sansBold, fontSize: 13 },
  desc: { fontFamily: FONTS.sans, fontSize: 12, fontStyle: 'italic', marginBottom: 12 },
  textarea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    fontFamily: FONTS.serif,
    fontSize: 15,
    lineHeight: 24,
  },
  actions: { flexDirection: 'row', gap: 8, marginTop: 14 },
  saveBtn: { flex: 1, borderRadius: 8, padding: 10, alignItems: 'center' },
  saveText: { color: '#fff', fontFamily: FONTS.sansBold, fontSize: 14 },
  cancelBtn: { borderWidth: 1.5, borderRadius: 8, padding: 10, paddingHorizontal: 16 },
  cancelText: { fontFamily: FONTS.sansBold, fontSize: 14 },
});
