import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font } from '../theme';

export interface PickerOption {
  key: string;
  label: string;
  sublabel?: string;
}

export function OptionPickerModal({
  visible,
  title,
  options,
  selectedKey,
  onSelect,
  onCancel,
}: {
  visible: boolean;
  title: string;
  options: PickerOption[];
  selectedKey: string;
  onSelect: (key: string) => void;
  onCancel: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
        <Text style={styles.title}>{title}</Text>
        <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
          {options.map((o) => {
            const on = o.key === selectedKey;
            return (
              <Pressable key={o.key} onPress={() => onSelect(o.key)} style={styles.row}>
                <View style={{ gap: 2 }}>
                  <Text style={styles.rowLabel}>{o.label}</Text>
                  {o.sublabel && <Text style={styles.rowSub}>{o.sublabel}</Text>}
                </View>
                {on && <View style={styles.dot} />}
              </Pressable>
            );
          })}
        </ScrollView>
        <Pressable style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(32,30,29,.45)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.bg,
    borderTopWidth: 2,
    borderTopColor: colors.ink,
    paddingHorizontal: 20,
    paddingTop: 18,
    gap: 12,
  },
  title: { fontFamily: font.extrabold, fontSize: 19, letterSpacing: -0.2, color: colors.ink },
  row: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(32,30,29,.18)',
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  rowLabel: { fontFamily: font.semibold, fontSize: 14.5, color: colors.ink },
  rowSub: { fontFamily: font.regular, fontSize: 11, color: 'rgba(32,30,29,.45)' },
  dot: { width: 9, height: 9, backgroundColor: colors.red },
  cancelBtn: { borderWidth: 1, borderColor: 'rgba(32,30,29,.35)', paddingVertical: 13, alignItems: 'center' },
  cancelBtnText: { fontFamily: font.extrabold, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.ink },
});
