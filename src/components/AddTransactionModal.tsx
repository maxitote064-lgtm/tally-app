import React, { useEffect, useState } from 'react';
import { BackHandler, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font } from '../theme';
import { CATEGORIES, Category } from '../data/mock';
import { useCategoryLabel, useCurrency, useStore, useT } from '../store/useStore';
import { toNumber } from '../utils/number';

export function AddTransactionModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const currency = useCurrency();
  const mode = useStore((s) => s.mode);
  const addTransaction = useStore((s) => s.addTransaction);
  const t = useT();
  const catLabel = useCategoryLabel();

  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [cat, setCat] = useState<Category | null>(null);
  const [day, setDay] = useState(0);
  const [owner, setOwner] = useState<'me' | 'bia'>('me');

  function reset() {
    setMerchant('');
    setAmount('');
    setCat(null);
    setDay(0);
    setOwner('me');
  }

  function save() {
    const amt = toNumber(amount);
    if (!merchant.trim() || amt <= 0) return;
    addTransaction({ merchant: merchant.trim(), amount: amt, cat, day, owner });
    reset();
    onClose();
  }

  useEffect(() => {
    if (!visible || Platform.OS !== 'android') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    // Not React Native's <Modal> — on Android it opens a separate native
    // Dialog window that doesn't reliably resize for the keyboard, hiding
    // the Save button. Rendering in-tree lets the screen's own keyboard
    // handling apply normally.
    <View style={styles.overlay} pointerEvents="box-none">
      <Pressable style={styles.backdrop} onPress={onClose} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.kav} pointerEvents="box-none">
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <Text style={styles.title}>{t('addTx_title')}</Text>
          <ScrollView style={{ maxHeight: 420 }} contentContainerStyle={{ gap: 14 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={{ gap: 6 }}>
              <Text style={styles.label}>{t('addTx_merchant')}</Text>
              <TextInput
                value={merchant}
                onChangeText={setMerchant}
                placeholder={t('addTx_merchantPlaceholder')}
                placeholderTextColor="rgba(32,30,29,.4)"
                style={styles.input}
                autoFocus
              />
            </View>
            <View style={{ gap: 6 }}>
              <Text style={styles.label}>{t('addTx_amount', { symbol: currency.symbol })}</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="0,00"
                placeholderTextColor="rgba(32,30,29,.4)"
                style={styles.input}
              />
            </View>
            <View style={{ gap: 6 }}>
              <Text style={styles.label}>{t('addTx_when')}</Text>
              <View style={styles.chipsRow}>
                {[t('addTx_today'), t('addTx_yesterday'), t('addTx_dayBefore')].map((label, i) => (
                  <Pressable key={i} onPress={() => setDay(i)} style={[styles.chip, day === i && styles.chipOn]}>
                    <Text style={[styles.chipText, day === i && styles.chipTextOn]}>{label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <View style={{ gap: 6 }}>
              <Text style={styles.label}>{t('addTx_category')}</Text>
              <View style={styles.chipsRow}>
                <Pressable onPress={() => setCat(null)} style={[styles.chip, cat === null && styles.chipOn]}>
                  <Text style={[styles.chipText, cat === null && styles.chipTextOn]}>{t('addTx_unfiled')}</Text>
                </Pressable>
                {CATEGORIES.map((c) => (
                  <Pressable key={c} onPress={() => setCat(c)} style={[styles.chip, cat === c && styles.chipOn]}>
                    <Text style={[styles.chipText, cat === c && styles.chipTextOn]}>{catLabel(c)}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
            {mode === 'us' && (
              <View style={{ gap: 6 }}>
                <Text style={styles.label}>{t('addTx_whoseCard')}</Text>
                <View style={styles.chipsRow}>
                  <Pressable onPress={() => setOwner('me')} style={[styles.chip, owner === 'me' && styles.chipOn]}>
                    <Text style={[styles.chipText, owner === 'me' && styles.chipTextOn]}>{t('you')}</Text>
                  </Pressable>
                  <Pressable onPress={() => setOwner('bia')} style={[styles.chip, owner === 'bia' && styles.chipOn]}>
                    <Text style={[styles.chipText, owner === 'bia' && styles.chipTextOn]}>Bia</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </ScrollView>
          <View style={styles.btnRow}>
            <Pressable style={styles.saveBtn} onPress={save}>
              <Text style={styles.saveBtnText}>{t('addTx_addCharge')}</Text>
            </Pressable>
            <Pressable
              style={styles.cancelBtn}
              onPress={() => {
                reset();
                onClose();
              }}
            >
              <Text style={styles.cancelBtnText}>{t('cancel')}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(32,30,29,.45)' },
  kav: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  sheet: {
    backgroundColor: colors.bg,
    borderTopWidth: 2,
    borderTopColor: colors.ink,
    paddingHorizontal: 20,
    paddingTop: 18,
    gap: 16,
  },
  title: { fontFamily: font.extrabold, fontSize: 19, letterSpacing: -0.2, color: colors.ink },
  label: { fontFamily: font.extrabold, fontSize: 10.5, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(32,30,29,.55)' },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(32,30,29,.35)',
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontFamily: font.semibold,
    fontSize: 16,
    color: colors.ink,
  },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { borderWidth: 1, borderColor: 'rgba(32,30,29,.3)', backgroundColor: colors.white, paddingVertical: 8, paddingHorizontal: 10 },
  chipOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipText: { fontFamily: font.semibold, fontSize: 12, color: colors.ink },
  chipTextOn: { color: colors.white },
  btnRow: { flexDirection: 'row', gap: 8 },
  saveBtn: { flex: 1, backgroundColor: colors.red, paddingVertical: 14, alignItems: 'center' },
  saveBtnText: { fontFamily: font.extrabold, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.white },
  cancelBtn: { borderWidth: 1, borderColor: 'rgba(32,30,29,.35)', paddingVertical: 14, paddingHorizontal: 16, alignItems: 'center' },
  cancelBtnText: { fontFamily: font.extrabold, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.ink },
});
