import React, { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, font, money } from '../theme';
import { PushedHeader } from '../components/Headers';
import { Kicker } from '../components/ui';
import { EditFieldsModal } from '../components/EditFieldsModal';
import { useStore, useBudgetCfg } from '../store/useStore';
import { remainder, spentBeforeToday } from '../store/selectors';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Budget'>;

function toNumber(s: string): number {
  const n = parseFloat(s.replace(/\./g, '').replace(',', '.').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

export function BudgetScreen({ navigation }: Props) {
  const mode = useStore((s) => s.mode);
  const tx = useStore((s) => s.tx);
  const demoEmpty = useStore((s) => s.demoEmpty);
  const bills = useStore((s) => s.bills);
  const caps = useStore((s) => s.caps);
  const setIncome = useStore((s) => s.setIncome);
  const addBill = useStore((s) => s.addBill);
  const updateBill = useStore((s) => s.updateBill);
  const removeBill = useStore((s) => s.removeBill);
  const addCap = useStore((s) => s.addCap);
  const updateCap = useStore((s) => s.updateCap);
  const removeCap = useStore((s) => s.removeCap);

  const c = useBudgetCfg();
  const rem = remainder(tx, mode, demoEmpty, c);
  const budget = Math.max(20, Math.round(rem / 6));
  const before = spentBeforeToday(tx, mode, demoEmpty);

  const [editingIncome, setEditingIncome] = useState(false);
  const [editingBillId, setEditingBillId] = useState<string | 'new' | null>(null);
  const [editingCapId, setEditingCapId] = useState<string | 'new' | null>(null);

  const editingBill = editingBillId && editingBillId !== 'new' ? bills.find((b) => b.id === editingBillId) : null;
  const editingCap = editingCapId && editingCapId !== 'new' ? caps.find((cp) => cp.id === editingCapId) : null;

  const mathRows = [
    { k: c.who, v: money(c.income, 0), bold: false, onPress: () => setEditingIncome(true) },
    { k: 'Fixed bills', v: `−${money(c.bills, 0)}`, bold: false },
    { k: 'Spent 1–25 Aug', v: `−${money(before, 0)}`, bold: false },
    { k: 'Left for the 6 days remaining', v: money(rem, 0), bold: true, thickTop: true },
    { k: "Today's allowance", v: money(budget, 0), bold: true, red: true },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <PushedHeader kicker="Allowance" title="Budget setup" onClose={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ paddingBottom: 26 }}>
        <View style={styles.section}>
          <Kicker>Today's allowance</Kicker>
          <Text style={styles.hero}>{money(budget, 0)}</Text>
          <Text style={styles.explainer}>
            {money(c.income, 0)} income less {money(c.bills, 0)} of fixed bills leaves {money(c.income - c.bills, 0)} for the
            month. Take off the {money(before, 0)} already spent and divide the {money(rem, 0)} that's left by the 6 days
            remaining: {money(budget, 0)} for today. It recalculates every night.
          </Text>
        </View>

        <View style={styles.section}>
          <Kicker>The maths</Kicker>
          <Text style={styles.tapHint}>Tap your income to change it</Text>
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
            <Kicker>Fixed bills this month</Kicker>
            <Text style={styles.billsTotal}>{money(c.bills, 0)}</Text>
          </View>
          <View style={{ marginTop: 4 }}>
            {bills.map((b) => (
              <Pressable key={b.id} onPress={() => setEditingBillId(b.id)} style={styles.billRow}>
                <View style={{ gap: 3, flex: 1 }}>
                  <Text style={styles.billName}>{b.name}</Text>
                  <Text style={[styles.billDue, { color: b.urgent ? colors.red : 'rgba(32,30,29,.45)' }]}>{b.due}</Text>
                </View>
                <Text style={styles.billAmount}>{money(mode === 'us' ? b.householdAmount : b.personalAmount, b.urgent ? 2 : 0)}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable style={styles.addBtn} onPress={() => setEditingBillId('new')}>
            <Text style={styles.addBtnText}>+ Add a bill</Text>
          </Pressable>
          <Text style={styles.footnote}>
            Bills are taken out of the pot up front, then still counted on the day they hit — so a bill day looks like a spike
            and the following days don't shrink. Tap a bill to edit or remove it.
          </Text>
        </View>

        <View style={[styles.section, { borderBottomWidth: 0 }]}>
          <Kicker>Soft caps per category</Kicker>
          <View style={{ gap: 12, marginTop: 11 }}>
            {caps.map((cap) => (
              <Pressable key={cap.id} onPress={() => setEditingCapId(cap.id)} style={{ gap: 6 }}>
                <View style={styles.rowBetween}>
                  <Text style={styles.capName}>{cap.name}</Text>
                  <Text style={styles.capUsed}>
                    {money(cap.used, 0)} of {money(cap.cap, 0)}
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
          <Pressable style={[styles.addBtn, { marginTop: 14 }]} onPress={() => setEditingCapId('new')}>
            <Text style={styles.addBtnText}>+ Add a category cap</Text>
          </Pressable>
        </View>
      </ScrollView>

      <EditFieldsModal
        key={editingIncome ? `income-${mode}` : 'income-closed'}
        visible={editingIncome}
        title={c.who}
        fields={[{ key: 'value', label: 'Monthly amount (R$)', value: String(c.income), keyboardType: 'decimal-pad' }]}
        onCancel={() => setEditingIncome(false)}
        onSave={(v) => {
          setIncome(mode, toNumber(v.value));
          setEditingIncome(false);
        }}
      />

      <EditFieldsModal
        key={editingBillId ? `bill-${editingBillId}` : 'bill-closed'}
        visible={editingBillId !== null}
        title={editingBill ? 'Edit bill' : 'Add a bill'}
        fields={[
          { key: 'name', label: 'Name', value: editingBill?.name ?? '', placeholder: 'e.g. Internet' },
          { key: 'personalAmount', label: 'Personal amount (R$)', value: editingBill ? String(editingBill.personalAmount) : '', keyboardType: 'decimal-pad' },
          { key: 'householdAmount', label: 'Household amount (R$)', value: editingBill ? String(editingBill.householdAmount) : '', keyboardType: 'decimal-pad' },
          { key: 'due', label: 'Due note', value: editingBill?.due ?? '', placeholder: 'e.g. due 5th' },
        ]}
        onCancel={() => setEditingBillId(null)}
        onSave={(v) => {
          const patch = {
            name: v.name || 'Bill',
            personalAmount: toNumber(v.personalAmount),
            householdAmount: toNumber(v.householdAmount),
            due: v.due || '',
          };
          if (editingBill) updateBill(editingBill.id, patch);
          else addBill(patch);
          setEditingBillId(null);
        }}
        onDelete={editingBill ? () => { removeBill(editingBill.id); setEditingBillId(null); } : undefined}
      />

      <EditFieldsModal
        key={editingCapId ? `cap-${editingCapId}` : 'cap-closed'}
        visible={editingCapId !== null}
        title={editingCap ? 'Edit category cap' : 'Add a category cap'}
        fields={[
          { key: 'name', label: 'Category', value: editingCap?.name ?? '', placeholder: 'e.g. Groceries' },
          { key: 'used', label: 'Spent so far (R$)', value: editingCap ? String(editingCap.used) : '0', keyboardType: 'decimal-pad' },
          { key: 'cap', label: 'Monthly cap (R$)', value: editingCap ? String(editingCap.cap) : '', keyboardType: 'decimal-pad' },
        ]}
        onCancel={() => setEditingCapId(null)}
        onSave={(v) => {
          const patch = { name: v.name || 'Category', used: toNumber(v.used), cap: Math.max(1, toNumber(v.cap)) };
          if (editingCap) updateCap(editingCap.id, patch);
          else addCap(patch);
          setEditingCapId(null);
        }}
        onDelete={editingCap ? () => { removeCap(editingCap.id); setEditingCapId(null); } : undefined}
      />
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
