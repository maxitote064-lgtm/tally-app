import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font } from '../theme';

export interface EditField {
  key: string;
  label: string;
  value: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
  placeholder?: string;
}

export function EditFieldsModal({
  visible,
  title,
  fields,
  onCancel,
  onSave,
  onDelete,
  deleteLabel = 'Delete',
}: {
  visible: boolean;
  title: string;
  fields: EditField[];
  onCancel: () => void;
  onSave: (values: Record<string, string>) => void;
  onDelete?: () => void;
  deleteLabel?: string;
}) {
  const insets = useSafeAreaInsets();
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.key, f.value]))
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 24 }]}>
        <Text style={styles.title}>{title}</Text>
        <View style={{ gap: 14 }}>
          {fields.map((f) => (
            <View key={f.key} style={{ gap: 6 }}>
              <Text style={styles.label}>{f.label}</Text>
              <TextInput
                value={values[f.key]}
                onChangeText={(t) => setValues((v) => ({ ...v, [f.key]: t }))}
                keyboardType={f.keyboardType === 'numeric' || f.keyboardType === 'decimal-pad' ? 'decimal-pad' : 'default'}
                placeholder={f.placeholder}
                placeholderTextColor="rgba(32,30,29,.4)"
                style={styles.input}
                autoFocus={fields[0].key === f.key}
              />
            </View>
          ))}
        </View>
        <View style={styles.btnRow}>
          <Pressable style={styles.saveBtn} onPress={() => onSave(values)}>
            <Text style={styles.saveBtnText}>Save</Text>
          </Pressable>
          <Pressable style={styles.cancelBtn} onPress={onCancel}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </Pressable>
        </View>
        {onDelete && (
          <Pressable style={styles.deleteBtn} onPress={onDelete}>
            <Text style={styles.deleteBtnText}>{deleteLabel}</Text>
          </Pressable>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(32,30,29,.45)' },
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
    gap: 18,
  },
  title: {
    fontFamily: font.extrabold,
    fontSize: 19,
    letterSpacing: -0.2,
    color: colors.ink,
  },
  label: {
    fontFamily: font.extrabold,
    fontSize: 10.5,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: 'rgba(32,30,29,.55)',
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(32,30,29,.35)',
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontFamily: font.semibold,
    fontSize: 16,
    color: colors.ink,
  },
  btnRow: { flexDirection: 'row', gap: 8 },
  saveBtn: { flex: 1, backgroundColor: colors.red, paddingVertical: 14, alignItems: 'center' },
  saveBtnText: { fontFamily: font.extrabold, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.white },
  cancelBtn: { borderWidth: 1, borderColor: 'rgba(32,30,29,.35)', paddingVertical: 14, paddingHorizontal: 16, alignItems: 'center' },
  cancelBtnText: { fontFamily: font.extrabold, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.ink },
  deleteBtn: { paddingVertical: 4, alignItems: 'center' },
  deleteBtnText: { fontFamily: font.extrabold, fontSize: 10.5, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.redDark },
});
