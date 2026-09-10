import React, { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, font } from '../theme';
import { PushedHeader } from '../components/Headers';
import { CATEGORIES, Category } from '../data/mock';
import { useCategoryLabel, useCurrency, useStore, useT } from '../store/useStore';
import { toNumber } from '../utils/number';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'AddTransaction'>;

// Full-screen pushed route, same rationale as EditFieldsScreen: a plain
// header-then-KeyboardAvoidingView(flex:1) layout with nothing absolutely
// positioned competing for the keyboard math, and no autoFocus.
export function AddTransactionScreen({ navigation }: Props) {
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

  function save() {
    const amt = toNumber(amount);
    if (!merchant.trim() || amt <= 0) return;
    addTransaction({ merchant: merchant.trim(), amount: amt, cat, day, owner });
    navigation.goBack();
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <PushedHeader kicker={t('addTx_kicker')} title={t('addTx_title')} onClose={() => navigation.goBack()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={{ gap: 6 }}>
            <Text style={styles.label}>{t('addTx_merchant')}</Text>
            <TextInput
              value={merchant}
              onChangeText={setMerchant}
              placeholder={t('addTx_merchantPlaceholder')}
              placeholderTextColor="rgba(32,30,29,.4)"
              style={styles.input}
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
        <View style={styles.footer}>
          <Pressable style={styles.saveBtn} onPress={save}>
            <Text style={styles.saveBtnText}>{t('addTx_addCharge')}</Text>
          </Pressable>
          <Pressable style={styles.cancelBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelBtnText}>{t('cancel')}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 14 },
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
  footer: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 2,
    borderTopColor: colors.ink,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
    backgroundColor: colors.bg,
  },
  saveBtn: { flex: 1, backgroundColor: colors.red, paddingVertical: 14, alignItems: 'center' },
  saveBtnText: { fontFamily: font.extrabold, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.white },
  cancelBtn: { borderWidth: 1, borderColor: 'rgba(32,30,29,.35)', paddingVertical: 14, paddingHorizontal: 16, alignItems: 'center' },
  cancelBtnText: { fontFamily: font.extrabold, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.ink },
});
