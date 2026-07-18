import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useReadingSettings } from '../hooks/useReadingSettings';
import { FONTS } from '../constants/fonts';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const FONT_OPTIONS = [
  { name: 'New York', family: 'NewYork', label: 'New York' },
  { name: 'Georgia', family: 'Georgia', label: 'Georgia' },
  { name: 'Athelas', family: 'Athelas', label: 'Athelas' },
  { name: 'Charter', family: 'Charter', label: 'Charter' },
  { name: 'Palatino', family: 'Palatino', label: 'Palatino' },
  { name: 'Times New Roman', family: 'Times New Roman', label: 'Times New Roman' },
  { name: 'Iowan', family: 'IowanOldStyle', label: 'Iowan' },
  { name: 'System', family: 'System', label: 'San Francisco' },
  { name: 'Avenir Next', family: 'AvenirNext', label: 'Avenir Next' },
];

export function TypographyControls({ visible, onClose }: Props) {
  const { tokens } = useTheme();
  const { settings, updateSettings } = useReadingSettings();

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={[styles.panel, { backgroundColor: tokens.page, borderTopColor: tokens.border }]}
          onStartShouldSetResponder={() => true}
        >
          <View style={[styles.handle, { backgroundColor: tokens.text2 }]} />

          <Text style={[styles.sectionLabel, { color: tokens.text2 }]}>FONT SIZE</Text>
          <View style={styles.sliderRow}>
            <Text style={[styles.sliderLabel, { color: tokens.text2 }]}>A</Text>
            <View style={styles.sliderTrack}>
              <View style={[styles.sliderFill, { backgroundColor: tokens.accent, width: `${((settings.fontSize - 12) / 28) * 100}%` }]} />
            </View>
            <Text style={[styles.sliderLabelLarge, { color: tokens.text2 }]}>A</Text>
          </View>
          <View style={styles.stepperRow}>
            <TouchableOpacity
              style={[styles.stepperBtn, { borderColor: tokens.border }]}
              onPress={() => updateSettings({ fontSize: Math.max(12, settings.fontSize - 1) })}
            >
              <Text style={[styles.stepperText, { color: tokens.accent }]}>A-</Text>
            </TouchableOpacity>
            <Text style={[styles.stepperValue, { color: tokens.text }]}>{settings.fontSize}</Text>
            <TouchableOpacity
              style={[styles.stepperBtn, { borderColor: tokens.border }]}
              onPress={() => updateSettings({ fontSize: Math.min(40, settings.fontSize + 1) })}
            >
              <Text style={[styles.stepperText, { color: tokens.accent }]}>A+</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.sectionLabel, { color: tokens.text2, marginTop: 20 }]}>FONT</Text>
          <ScrollView style={styles.fontList} showsVerticalScrollIndicator={false}>
            {FONT_OPTIONS.map((font) => {
              const isActive = settings.fontFamily === font.family;
              return (
                <TouchableOpacity
                  key={font.family}
                  style={[styles.fontRow, { borderBottomColor: tokens.border }, isActive && { backgroundColor: tokens.accentDim }]}
                  onPress={() => updateSettings({ fontFamily: font.family })}
                >
                  <Text style={[styles.fontName, { color: isActive ? tokens.accent : tokens.text, fontFamily: font.family === 'System' ? 'System' : font.family }]}>
                    {font.label}
                  </Text>
                  {isActive && <Text style={[styles.checkmark, { color: tokens.accent }]}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={[styles.sectionLabel, { color: tokens.text2, marginTop: 16 }]}>LINE SPACING</Text>
          <View style={styles.stepperRow}>
            <TouchableOpacity
              style={[styles.stepperBtn, { borderColor: tokens.border }]}
              onPress={() => updateSettings({ lineHeight: Math.max(1.2, +(settings.lineHeight - 0.1).toFixed(1)) })}
            >
              <Text style={[styles.stepperText, { color: tokens.accent }]}>-</Text>
            </TouchableOpacity>
            <Text style={[styles.stepperValue, { color: tokens.text }]}>{settings.lineHeight.toFixed(1)}</Text>
            <TouchableOpacity
              style={[styles.stepperBtn, { borderColor: tokens.border }]}
              onPress={() => updateSettings({ lineHeight: Math.min(3.0, +(settings.lineHeight + 0.1).toFixed(1)) })}
            >
              <Text style={[styles.stepperText, { color: tokens.accent }]}>+</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.sectionLabel, { color: tokens.text2, marginTop: 16 }]}>MARGINS</Text>
          <View style={styles.stepperRow}>
            <TouchableOpacity
              style={[styles.stepperBtn, { borderColor: tokens.border }]}
              onPress={() => updateSettings({ margins: Math.max(16, settings.margins - 4) })}
            >
              <Text style={[styles.stepperText, { color: tokens.accent }]}>◁</Text>
            </TouchableOpacity>
            <Text style={[styles.stepperValue, { color: tokens.text }]}>{settings.margins}</Text>
            <TouchableOpacity
              style={[styles.stepperBtn, { borderColor: tokens.border }]}
              onPress={() => updateSettings({ margins: Math.min(60, settings.margins + 4) })}
            >
              <Text style={[styles.stepperText, { color: tokens.accent }]}>▷</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.sectionLabel, { color: tokens.text2, marginTop: 16 }]}>WORD SPACING</Text>
          <View style={styles.stepperRow}>
            <TouchableOpacity
              style={[styles.stepperBtn, { borderColor: tokens.border }]}
              onPress={() => updateSettings({ wordSpacing: Math.max(-2, settings.wordSpacing - 1) })}
            >
              <Text style={[styles.stepperText, { color: tokens.accent }]}>-</Text>
            </TouchableOpacity>
            <Text style={[styles.stepperValue, { color: tokens.text }]}>{settings.wordSpacing}</Text>
            <TouchableOpacity
              style={[styles.stepperBtn, { borderColor: tokens.border }]}
              onPress={() => updateSettings({ wordSpacing: Math.min(5, settings.wordSpacing + 1) })}
            >
              <Text style={[styles.stepperText, { color: tokens.accent }]}>+</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.sectionLabel, { color: tokens.text2, marginTop: 16 }]}>CHARACTER SPACING</Text>
          <View style={styles.stepperRow}>
            <TouchableOpacity
              style={[styles.stepperBtn, { borderColor: tokens.border }]}
              onPress={() => updateSettings({ characterSpacing: Math.max(-2, settings.characterSpacing - 0.5) })}
            >
              <Text style={[styles.stepperText, { color: tokens.accent }]}>-</Text>
            </TouchableOpacity>
            <Text style={[styles.stepperValue, { color: tokens.text }]}>{settings.characterSpacing.toFixed(1)}</Text>
            <TouchableOpacity
              style={[styles.stepperBtn, { borderColor: tokens.border }]}
              onPress={() => updateSettings({ characterSpacing: Math.min(5, settings.characterSpacing + 0.5) })}
            >
              <Text style={[styles.stepperText, { color: tokens.accent }]}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Toggle rows */}
          <View style={[styles.toggleRow, { borderTopColor: tokens.border, marginTop: 16 }]}>
            <Text style={[styles.toggleLabel, { color: tokens.text }]}>Bold Text</Text>
            <TouchableOpacity
              style={[styles.toggleBtn, { backgroundColor: settings.bold ? tokens.accent : tokens.border }]}
              onPress={() => updateSettings({ bold: !settings.bold })}
            >
              <View style={[styles.toggleThumb, { transform: [{ translateX: settings.bold ? 18 : 0 }] }]} />
            </TouchableOpacity>
          </View>

          <View style={[styles.toggleRow, { borderTopColor: tokens.border }]}>
            <Text style={[styles.toggleLabel, { color: tokens.text }]}>Justify Text</Text>
            <TouchableOpacity
              style={[styles.toggleBtn, { backgroundColor: settings.justify ? tokens.accent : tokens.border }]}
              onPress={() => updateSettings({ justify: !settings.justify })}
            >
              <View style={[styles.toggleThumb, { transform: [{ translateX: settings.justify ? 18 : 0 }] }]} />
            </TouchableOpacity>
          </View>

          <View style={[styles.toggleRow, { borderTopColor: tokens.border }]}>
            <Text style={[styles.toggleLabel, { color: tokens.text }]}>Both Margins Advance</Text>
            <TouchableOpacity
              style={[styles.toggleBtn, { backgroundColor: settings.bothMarginsAdvance ? tokens.accent : tokens.border }]}
              onPress={() => updateSettings({ bothMarginsAdvance: !settings.bothMarginsAdvance })}
            >
              <View style={[styles.toggleThumb, { transform: [{ translateX: settings.bothMarginsAdvance ? 18 : 0 }] }]} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.doneBtn, { backgroundColor: tokens.accent }]} onPress={onClose}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  panel: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 0.5,
    maxHeight: '80%',
  },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16, opacity: 0.3 },
  sectionLabel: { fontFamily: FONTS.sans, fontSize: 11, fontWeight: '600', letterSpacing: 0.5, marginBottom: 10 },
  sliderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  sliderLabel: { fontFamily: FONTS.sans, fontSize: 12 },
  sliderLabelLarge: { fontFamily: FONTS.sans, fontSize: 18 },
  sliderTrack: { flex: 1, height: 4, borderRadius: 2, backgroundColor: 'rgba(128,128,128,0.2)', overflow: 'hidden' },
  sliderFill: { height: 4, borderRadius: 2 },
  stepperRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16 },
  stepperBtn: { borderWidth: 1.5, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 6 },
  stepperText: { fontFamily: FONTS.sansBold, fontSize: 14 },
  stepperValue: { fontFamily: FONTS.sans, fontSize: 14, minWidth: 30, textAlign: 'center' },
  fontList: { maxHeight: 200 },
  fontRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 0.5 },
  fontName: { fontSize: 16 },
  checkmark: { fontSize: 16, fontWeight: '600' },
  doneBtn: { borderRadius: 8, padding: 12, alignItems: 'center', marginTop: 20 },
  doneBtnText: { color: '#fff', fontFamily: FONTS.sansBold, fontSize: 15 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderTopWidth: 0.5 },
  toggleLabel: { fontFamily: FONTS.sans, fontSize: 15 },
  toggleBtn: { width: 44, height: 26, borderRadius: 13, padding: 2, justifyContent: 'center' },
  toggleThumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff' },
});
