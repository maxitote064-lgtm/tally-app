import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, font } from '../theme';
import { PushedHeader } from '../components/Headers';
import { Kicker } from '../components/ui';
import { useStore, useBudgetCfg, useMoney, useT } from '../store/useStore';
import { remainder, spentBeforeToday } from '../store/selectors';
import { Key } from '../i18n/translations';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Budget'>;

const DEFAULT_BILL_DUE_KEYS: Record<string, Key> = {
  b1: 'budget_bill1_due', b2: 'budget_bill2_due', b3: 'budget_bill3_due',
  b4: 'budget_bill4_due', b5: 'budget_bill5_due',
};

export function BudgetScreen({ navigation }: Props) {
  const mode = useStore((s) => s.mode);
  const tx = useStore((s) => s.tx);
  const demoEmpty = useStore((s) => s.demoEmpty);
  const bills = useStore((s) => s.bills);
  const caps = useStore((s) => s.caps);
  const setEditTarget = useStore((s) => s.setEditTarget);
  const money = useMoney();
  const t = useT();

  const c = useBudgetCfg();
  const rem = remainder(tx, mode, demoEmpty, c);
  const budget = Math.max(20, Math.round(rem / 6));
  const before = spentBeforeToday(tx, mode, demoEmpty);

  function editIncome() {
    setEditTarget({ kind: 'income' });
    navigation.navigate('EditFields');
  }

  function editBill(id: string | null) {
    setEditTarget({ kind: 'bill', id });
    navigation.navigate('EditFields');
  }

  function editCap(id: string | null) {
    setEditTarget({ kind: 'cap', id });
    navigation.navigate('EditFields');
  }

  const whoLabel = mode === 'us' ? t('budget_householdIncome') : t('budget_yourMonthlyIncome');

  const mathRows = [
    { k: whoLabel, v: money(c.income, 0), bold: false, onPress: editIncome },
    { k: t('budget_fixedBillsRow'), v: `−${money(c.bills, 0)}`, bold: false },
    { k: t('budget_spentRange'), v: `−${money(before, 0)}`, bold: false },
    { k: t('budget_leftForDays', { days: 6 }), v: money(rem, 0), bold: true, thickTop: true },
    { k: t('budget_todaysAllowance'), v: money(budget, 0), bold: true, red: true },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <PushedHeader kicker={t('budget_kicker')} title={t('budget_title')} onClose={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ paddingBottom: 26 }}>
        <View style={styles.section}>
          <Kicker>{t('budget_todaysAllowance')}</Kicker>
          <Text style={styles.hero}>{money(budget, 0)}</Text>
          <Text style={styles.explainer}>
            {t('budget_explainer', {
              income: money(c.income, 0),
              bills: money(c.bills, 0),
              left: money(c.income - c.bills, 0),
              spent: money(before, 0),
              remainder: money(rem, 0),
              days: 6,
              budget: money(budget, 0),
            })}
          </Text>
        </View>

        <View style={styles.section}>
          <Kicker>{t('budget_theMaths')}</Kicker>
          <Text style={styles.tapHint}>{t('budget_tapIncomeHint')}</Text>
          <View style={{ marginTop: 6 }}>
            {mathRows.map((r) => {
              const Row = r.onPress ? Pressable : View;
              return (
                <Row
                  key={r.k}
                  onPress={r.onPress}
                  style={[
                    styles.mathRow,
                    { borderTopWidth: r.thickTop ? 2 : 1, borderTopColor: r.thickTop ? colors.ink : 'rgba(32,30,29,.2)' },
                  ]}
                >
                  <Text style={[styles.mathKey, r.bold && { fontFamily: font.extrabold, color: r.red ? colors.red : colors.ink }, r.onPress && styles.editableText]}>
                    {r.k}
                  </Text>
                  <Text style={[styles.mathVal, { color: r.red ? colors.red : colors.ink }, r.onPress && styles.editableText]}>{r.v}</Text>
                </Row>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Kicker>{t('budget_fixedBillsThisMonth')}</Kicker>
            <Text style={styles.billsTotal}>{money(c.bills, 0)}</Text>
          </View>
          <View style={{ marginTop: 4 }}>
            {bills.map((b) => (
              <Pressable key={b.id} onPress={() => editBill(b.id)} style={styles.billRow}>
                <View style={{ gap: 3, flex: 1 }}>
                  <Text style={styles.billName}>{b.name}</Text>
                  <Text style={[styles.billDue, { color: b.urgent ? colors.red : 'rgba(32,30,29,.45)' }]}>
                    {DEFAULT_BILL_DUE_KEYS[b.id] ? t(DEFAULT_BILL_DUE_KEYS[b.id]) : b.due}
                  </Text>
                </View>
                <Text style={styles.billAmount}>{money(mode === 'us' ? b.householdAmount : b.personalAmount, b.urgent ? 2 : 0)}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable style={styles.addBtn} onPress={() => editBill(null)}>
            <Text style={styles.addBtnText}>{t('budget_addBill')}</Text>
          </Pressable>
          <Text style={styles.footnote}>{t('budget_billsFootnote')}</Text>
        </View>

        <View style={[styles.section, { borderBottomWidth: 0 }]}>
          <Kicker>{t('budget_softCaps')}</Kicker>
          <View style={{ gap: 12, marginTop: 11 }}>
            {caps.map((cap) => (
              <Pressable key={cap.id} onPress={() => editCap(cap.id)} style={{ gap: 6 }}>
                <View style={styles.rowBetween}>
                  <Text style={styles.capName}>{cap.name}</Text>
                  <Text style={styles.capUsed}>
                    {money(cap.used, 0)} {t('budget_of')} {money(cap.cap, 0)}
                  </Text>
                </View>
                <View style={styles.capTrack}>
                  <View
                    style={[
                      styles.capFill,
                      { width: `${Math.min(100, (cap.used / cap.cap) * 100)}%`, backgroundColor: cap.used / cap.cap > 0.85 ? colors.red : colors.ink },
                    ]}
                  />
                </View>
              </Pressable>
            ))}
          </View>
          <Pressable style={[styles.addBtn, { marginTop: 14 }]} onPress={() => editCap(null)}>
            <Text style={styles.addBtnText}>{t('budget_addCap')}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { padding: 20, borderBottomWidth: 2, borderBottomColor: colors.hairlineStrong },
  hero: { fontFamily: font.extrabold, fontSize: 50, letterSpacing: -0.8, color: colors.ink, marginTop: 4 },
  explainer: { fontFamily: font.regular, fontSize: 12.5, lineHeight: 19, color: 'rgba(32,30,29,.65)', marginTop: 8 },
  tapHint: { fontFamily: font.regular, fontSize: 11, color: 'rgba(32,30,29,.45)', marginTop: 2 },
  mathRow: { paddingVertical: 11, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 },
  mathKey: { fontFamily: font.semibold, fontSize: 13, color: colors.ink },
  mathVal: { fontFamily: font.extrabold, fontSize: 14 },
  editableText: { textDecorationLine: 'underline' },
  rowBetween: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  billsTotal: { fontFamily: font.extrabold, fontSize: 12, color: colors.ink },
  billRow: { borderTopWidth: 1, borderTopColor: 'rgba(32,30,29,.18)', paddingVertical: 10, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 },
  billName: { fontFamily: font.semibold, fontSize: 13.5, color: colors.ink },
  billDue: { fontFamily: font.regular, fontSize: 10.5, letterSpacing: 0.5, textTransform: 'uppercase' },
  billAmount: { fontFamily: font.extrabold, fontSize: 13.5, color: colors.ink },
  footnote: { fontFamily: font.regular, fontSize: 11.5, lineHeight: 17, color: 'rgba(32,30,29,.5)', marginTop: 12 },
  capName: { fontFamily: font.semibold, fontSize: 13, color: colors.ink },
  capUsed: { fontFamily: font.regular, fontSize: 11.5, color: 'rgba(32,30,29,.55)' },
  capTrack: { height: 6, backgroundColor: colors.track },
  capFill: { height: '100%' },
  addBtn: { borderWidth: 1, borderColor: 'rgba(32,30,29,.35)', paddingVertical: 11, alignItems: 'center', marginTop: 12 },
  addBtnText: { fontFamily: font.extrabold, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.ink },
});
