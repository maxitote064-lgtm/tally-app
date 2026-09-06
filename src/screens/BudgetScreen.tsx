import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, font, money } from '../theme';
import { PushedHeader } from '../components/Headers';
import { Kicker } from '../components/ui';
import { useStore } from '../store/useStore';
import { allowance, cfg, remainder, spentBeforeToday } from '../store/selectors';
import { BILLS, CAPS } from '../data/mock';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Budget'>;

export function BudgetScreen({ navigation }: Props) {
  const mode = useStore((s) => s.mode);
  const tx = useStore((s) => s.tx);
  const demoEmpty = useStore((s) => s.demoEmpty);

  const c = cfg(mode);
  const budget = allowance(tx, mode, demoEmpty);
  const rem = remainder(tx, mode, demoEmpty);
  const before = spentBeforeToday(tx, mode, demoEmpty);

  const mathRows = [
    { k: c.who, v: money(c.income, 0), bold: false },
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
          <View style={{ marginTop: 6 }}>
            {mathRows.map((r) => (
              <View
                key={r.k}
                style={[
                  styles.mathRow,
                  { borderTopWidth: r.thickTop ? 2 : 1, borderTopColor: r.thickTop ? colors.ink : 'rgba(32,30,29,.2)' },
                ]}
              >
                <Text style={[styles.mathKey, r.bold && { fontFamily: font.extrabold, color: r.red ? colors.red : colors.ink }]}>
                  {r.k}
                </Text>
                <Text style={[styles.mathVal, { fontFamily: r.bold ? font.extrabold : font.extrabold, color: r.red ? colors.red : colors.ink }]}>
                  {r.v}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Kicker>Fixed bills this month</Kicker>
            <Text style={styles.billsTotal}>{money(c.bills, 0)}</Text>
          </View>
          <View style={{ marginTop: 4 }}>
            {BILLS.map((b) => (
              <View key={b.name} style={styles.billRow}>
                <View style={{ gap: 3 }}>
                  <Text style={styles.billName}>{b.name}</Text>
                  <Text style={[styles.billDue, { color: b.urgent ? colors.red : 'rgba(32,30,29,.45)' }]}>{b.due}</Text>
                </View>
                <Text style={styles.billAmount}>{money(mode === 'us' ? b.householdAmount : b.personalAmount, b.urgent ? 2 : 0)}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.footnote}>
            Bills are taken out of the pot up front, then still counted on the day they hit — so a bill day looks like a spike
            and the following days don't shrink.
          </Text>
        </View>

        <View style={[styles.section, { borderBottomWidth: 0 }]}>
          <Kicker>Soft caps per category</Kicker>
          <View style={{ gap: 12, marginTop: 11 }}>
            {CAPS.map((cap) => (
              <View key={cap.name} style={{ gap: 6 }}>
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
                      { width: `${(cap.used / cap.cap) * 100}%`, backgroundColor: cap.used / cap.cap > 0.85 ? colors.red : colors.ink },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { padding: 20, borderBottomWidth: 2, borderBottomColor: colors.hairlineStrong },
  hero: { fontFamily: font.extrabold, fontSize: 50, letterSpacing: -0.8, color: colors.ink, marginTop: 4 },
  explainer: { fontFamily: font.regular, fontSize: 12.5, lineHeight: 19, color: 'rgba(32,30,29,.65)', marginTop: 8 },
  mathRow: { paddingVertical: 11, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 },
  mathKey: { fontFamily: font.semibold, fontSize: 13, color: colors.ink },
  mathVal: { fontSize: 14 },
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
});
