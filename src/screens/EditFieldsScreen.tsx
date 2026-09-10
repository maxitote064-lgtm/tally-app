import React, { useEffect, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, font } from '../theme';
import { PushedHeader } from '../components/Headers';
import { useStore, useBudgetCfg, useCurrency, useT } from '../store/useStore';
import { toNumber } from '../utils/number';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'EditFields'>;

interface FieldDef {
  key: string;
  label: string;
  value: string;
  keyboardType?: 'default' | 'decimal-pad';
  placeholder?: string;
}

// A full-screen pushed route (not a floating overlay) so KeyboardAvoidingView
// gets a plain, unambiguous full-screen layout to work with — the header is
// a sibling ABOVE it, never a competing absolutely-positioned view. No field
// is autoFocused: opening the keyboard before this screen finishes its first
// layout pass is what threw off the old overlay's padding math.
export function EditFieldsScreen({ navigation }: Props) {
  const t = useT();
  const currency = useCurrency();
  const mode = useStore((s) => s.mode);
  const editTarget = useStore((s) => s.editTarget);
  const setEditTarget = useStore((s) => s.setEditTarget);
  const bills = useStore((s) => s.bills);
  const caps = useStore((s) => s.caps);
  const tx = useStore((s) => s.tx);
  const c = useBudgetCfg();

  const setIncome = useStore((s) => s.setIncome);
  const addBill = useStore((s) => s.addBill);
  const updateBill = useStore((s) => s.updateBill);
  const removeBill = useStore((s) => s.removeBill);
  const addCap = useStore((s) => s.addCap);
  const updateCap = useStore((s) => s.updateCap);
  const removeCap = useStore((s) => s.removeCap);
  const updateTransaction = useStore((s) => s.updateTransaction);

  useEffect(() => {
    return () => setEditTarget(null);
  }, [setEditTarget]);

  const bill = editTarget?.kind === 'bill' && editTarget.id ? bills.find((b) => b.id === editTarget.id) ?? null : null;
  const cap = editTarget?.kind === 'cap' && editTarget.id ? caps.find((cp) => cp.id === editTarget.id) ?? null : null;
  const chargeTx = editTarget?.kind === 'charge' ? tx.find((x) => x.id === editTarget.txId) ?? null : null;

  const whoLabel = mode === 'us' ? t('budget_householdIncome') : t('budget_yourMonthlyIncome');

  let kicker = t('budget_kicker');
  let title = '';
  let fields: FieldDef[] = [];
  let canDelete = false;

  if (editTarget?.kind === 'income') {
    title = whoLabel;
    fields = [{ key: 'value', label: t('budget_monthlyAmount', { symbol: currency.symbol }), value: String(c.income), keyboardType: 'decimal-pad' }];
  } else if (editTarget?.kind === 'bill') {
    title = bill ? t('budget_editBill') : t('budget_addBillTitle');
    fields = [
      { key: 'name', label: t('budget_name'), value: bill?.name ?? '', placeholder: t('budget_namePlaceholder') },
      { key: 'personalAmount', label: t('budget_personalAmount', { symbol: currency.symbol }), value: bill ? String(bill.personalAmount) : '', keyboardType: 'decimal-pad' },
      { key: 'householdAmount', label: t('budget_householdAmount', { symbol: currency.symbol }), value: bill ? String(bill.householdAmount) : '', keyboardType: 'decimal-pad' },
      { key: 'due', label: t('budget_dueNote'), value: bill?.due ?? '', placeholder: t('budget_dueNotePlaceholder') },
    ];
    canDelete = !!bill;
  } else if (editTarget?.kind === 'cap') {
    title = cap ? t('budget_editCap') : t('budget_addCapTitle');
    fields = [
      { key: 'name', label: t('budget_category'), value: cap?.name ?? '', placeholder: t('budget_categoryPlaceholder') },
      { key: 'used', label: t('budget_spentSoFar', { symbol: currency.symbol }), value: cap ? String(cap.used) : '0', keyboardType: 'decimal-pad' },
      { key: 'cap', label: t('budget_monthlyCap', { symbol: currency.symbol }), value: cap ? String(cap.cap) : '', keyboardType: 'decimal-pad' },
    ];
    canDelete = !!cap;
  } else if (editTarget?.kind === 'charge' && chargeTx) {
    kicker = t('detail_kicker');
    title = t('detail_editCharge');
    fields = [
      { key: 'merchant', label: t('detail_merchant'), value: chargeTx.merchant },
      { key: 'amount', label: t('detail_amount', { symbol: currency.symbol }), value: String(chargeTx.amount), keyboardType: 'decimal-pad' },
    ];
  }

  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(fields.map((f) => [f.key, f.value])));

  function save() {
    if (editTarget?.kind === 'income') {
      setIncome(mode, toNumber(values.value));
    } else if (editTarget?.kind === 'bill') {
      const patch = {
        name: values.name || 'Bill',
        personalAmount: toNumber(values.personalAmount),
        householdAmount: toNumber(values.householdAmount),
        due: values.due || '',
      };
      if (bill) updateBill(bill.id, patch);
      else addBill(patch);
    } else if (editTarget?.kind === 'cap') {
      const patch = { name: values.name || 'Category', used: toNumber(values.used), cap: Math.max(1, toNumber(values.cap)) };
      if (cap) updateCap(cap.id, patch);
      else addCap(patch);
    } else if (editTarget?.kind === 'charge' && chargeTx) {
      updateTransaction(chargeTx.id, { merchant: values.merchant || chargeTx.merchant, amount: toNumber(values.amount) });
    }
    navigation.goBack();
  }

  function handleDelete() {
    if (editTarget?.kind === 'bill' && bill) removeBill(bill.id);
    else if (editTarget?.kind === 'cap' && cap) removeCap(cap.id);
    navigation.goBack();
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <PushedHeader kicker={kicker} title={title} onClose={() => navigation.goBack()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {fields.map((f) => (
            <View key={f.key} style={{ gap: 6 }}>
              <Text style={styles.label}>{f.label}</Text>
              <TextInput
                value={values[f.key]}
                onChangeText={(txt) => setValues((v) => ({ ...v, [f.key]: txt }))}
                keyboardType={f.keyboardType === 'decimal-pad' ? 'decimal-pad' : 'default'}
                placeholder={f.placeholder}
                placeholderTextColor="rgba(32,30,29,.4)"
                style={styles.input}
              />
            </View>
          ))}
        </ScrollView>
        <View style={styles.footer}>
          <View style={styles.btnRow}>
            <Pressable style={styles.saveBtn} onPress={save}>
              <Text style={styles.saveBtnText}>{t('save')}</Text>
            </Pressable>
            <Pressable style={styles.cancelBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.cancelBtnText}>{t('cancel')}</Text>
            </Pressable>
          </View>
          {canDelete && (
            <Pressable style={styles.deleteBtn} onPress={handleDelete}>
              <Text style={styles.deleteBtnText}>{t('delete')}</Text>
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 16 },
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
  footer: {
    borderTopWidth: 2,
    borderTopColor: colors.ink,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
    gap: 10,
    backgroundColor: colors.bg,
  },
  btnRow: { flexDirection: 'row', gap: 8 },
  saveBtn: { flex: 1, backgroundColor: colors.red, paddingVertical: 14, alignItems: 'center' },
  saveBtnText: { fontFamily: font.extrabold, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.white },
  cancelBtn: { borderWidth: 1, borderColor: 'rgba(32,30,29,.35)', paddingVertical: 14, paddingHorizontal: 16, alignItems: 'center' },
  cancelBtnText: { fontFamily: font.extrabold, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.ink },
  deleteBtn: { paddingVertical: 4, alignItems: 'center' },
  deleteBtnText: { fontFamily: font.extrabold, fontSize: 10.5, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.redDark },
});
