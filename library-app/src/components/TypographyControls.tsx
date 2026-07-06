import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useReadingSettings, ReadingSettings } from '../hooks/useReadingSettings';
import { FONTS } from '../constants/fonts';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function TypographyControls({ visible, onClose }: Props) {
  const { tokens } = useTheme();
  const { settings, updateSettings } = useReadingSettings();

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={[styles.panel, { backgroundColor: tokens.page, borderColor: tokens.border }]}>
          <Text style={[styles.title, { color: tokens.accent }]}>Reading Settings</Text>

          {/* Font Size */}
          <View style={styles.row}>
            <Text style={[styles.label, { color: tokens.text2 }]}>Font Size</Text>
            <View style={styles.controls}>
              <TouchableOpacity
                style={[styles.btn, { borderColor: tokens.border }]}
                onPress={() => updateSettings({ fontSize: Math.max(12, settings.fontSize - 1) })}
              >
                <Text style={[styles.btnText, { color: tokens.accent }]}>A-</Text>
              </TouchableOpacity>
              <Text style={[styles.value, { color: tokens.text }]}>{settings.fontSize}</Text>
              <TouchableOpacity
                style={[styles.btn, { borderColor: tokens.border }]}
                onPress={() => updateSettings({ fontSize: Math.min(28, settings.fontSize + 1) })}
              >
                <Text style={[styles.btnText, { color: tokens.accent }]}>A+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Line Height */}
          <View style={styles.row}>
            <Text style={[styles.label, { color: tokens.text2 }]}>Line Spacing</Text>
            <View style={styles.controls}>
              <TouchableOpacity
                style={[styles.btn, { borderColor: tokens.border }]}
                onPress={() => updateSettings({ lineHeight: Math.max(1.2, +(settings.lineHeight - 0.1).toFixed(1)) })}
              >
                <Text style={[styles.btnText, { color: tokens.accent }]}>≡-</Text>
              </TouchableOpacity>
              <Text style={[styles.value, { color: tokens.text }]}>{settings.lineHeight.toFixed(1)}</Text>
              <TouchableOpacity
                style={[styles.btn, { borderColor: tokens.border }]}
                onPress={() => updateSettings({ lineHeight: Math.min(3.0, +(settings.lineHeight + 0.1).toFixed(1)) })}
              >
                <Text style={[styles.btnText, { color: tokens.accent }]}>≡+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Margins */}
          <View style={styles.row}>
            <Text style={[styles.label, { color: tokens.text2 }]}>Margins</Text>
            <View style={styles.controls}>
              <TouchableOpacity
                style={[styles.btn, { borderColor: tokens.border }]}
                onPress={() => updateSettings({ margins: Math.max(16, settings.margins - 8) })}
              >
                <Text style={[styles.btnText, { color: tokens.accent }]}>◁</Text>
              </TouchableOpacity>
              <Text style={[styles.value, { color: tokens.text }]}>{settings.margins}</Text>
              <TouchableOpacity
                style={[styles.btn, { borderColor: tokens.border }]}
                onPress={() => updateSettings({ margins: Math.min(80, settings.margins + 8) })}
              >
                <Text style={[styles.btnText, { color: tokens.accent }]}>▷</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={[styles.closeBtn, { backgroundColor: tokens.accent }]} onPress={onClose}>
            <Text style={styles.closeBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 },
  panel: { borderRadius: 12, padding: 20, borderWidth: 1 },
  title: { fontFamily: FONTS.serifBold, fontSize: 18, marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  label: { fontFamily: FONTS.sans, fontSize: 14 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  btn: { borderWidth: 1.5, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  btnText: { fontFamily: FONTS.sansBold, fontSize: 14 },
  value: { fontFamily: FONTS.sans, fontSize: 14, minWidth: 30, textAlign: 'center' },
  closeBtn: { borderRadius: 8, padding: 10, alignItems: 'center', marginTop: 8 },
  closeBtnText: { color: '#fff', fontFamily: FONTS.sansBold, fontSize: 14 },
});
