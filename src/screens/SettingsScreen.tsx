import React, { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, font, CURRENCIES } from '../theme';
import { PushedHeader } from '../components/Headers';
import { Kicker } from '../components/ui';
import { OptionPickerModal } from '../components/OptionPickerModal';
import { useStore, useBudgetCfg, useCurrency, useMoney } from '../store/useStore';
import { allowance } from '../store/selectors';
import { CARDS } from '../data/mock';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export function SettingsScreen({ navigation }: Props) {
  const mode = useStore((s) => s.mode);
  const setMode = useStore((s) => s.setMode);
  const tx = useStore((s) => s.tx);
  const demoEmpty = useStore((s) => s.demoEmpty);
  const hasGoal = useStore((s) => s.hasGoal);
  const replayOnboarding = useStore((s) => s.replayOnboarding);
  const setCurrency = useStore((s) => s.setCurrency);
  const currency = useCurrency();

  const c = useBudgetCfg();
  const money = useMoney();
  const budget = allowance(tx, mode, demoEmpty, c);

  const [pickingCurrency, setPickingCurrency] = useState(false);

  const rows: { name: string; hint: string; go: () => void }[] = [
    { name: 'Household — you and Bia', hint: mode === 'us' ? 'joint view on' : 'off', go: () => setMode('us') },
    { name: 'Budget & allowance', hint: `${money(budget, 0)} a day`, go: () => navigation.navigate('Budget') },
    { name: 'Goals', hint: hasGoal ? 'card ·· 8802' : 'none', go: () => navigation.navigate('Goals') },
    { name: 'Notifications & nudges', hint: '3 on', go: () => navigation.navigate('Notifications') },
    { name: 'Categories', hint: '6 in use', go: () => navigation.navigate('Budget') },
    { name: 'Currency', hint: `${currency.symbol} ${currency.code}`, go: () => setPickingCurrency(true) },
    {
      name: 'Replay onboarding',
      hint: '5 steps',
      go: () => {
        replayOnboarding();
        navigation.navigate('Onboarding');
      },
    },
    { name: 'Export a CSV', hint: 'August', go: () => {} },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <PushedHeader kicker="Account" title="Settings" onClose={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ paddingBottom: 26 }}>
        <View style={styles.section}>
          <Kicker>Wallet</Kicker>
          <View style={{ gap: 10, marginTop: 11 }}>
            {CARDS.map((c) => (
              <View key={c.name} style={styles.card}>
                <View style={{ gap: 3 }}>
                  <Text style={styles.cardName}>{c.name}</Text>
                  <Text style={styles.cardMeta}>{c.meta}</Text>
                </View>
                <View style={[styles.stateTag, { backgroundColor: c.highlight ? colors.red : colors.ink }]}>
                  <Text style={[styles.stateText, { color: c.highlight ? colors.white : colors.offWhite }]}>{c.state}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
          {rows.map((r) => (
            <Pressable key={r.name} onPress={r.go} style={styles.row}>
              <Text style={styles.rowName}>{r.name}</Text>
              <Text style={styles.rowHint}>{r.hint}</Text>
            </Pressable>
          ))}
          <Text style={styles.footnote}>
            Tally reads charge notifications from your wallet. It never holds your card numbers and can't move money out of any
            account.
          </Text>
        </View>
      </ScrollView>

      <OptionPickerModal
        visible={pickingCurrency}
        title="Currency"
        selectedKey={currency.code}
        options={CURRENCIES.map((cur) => ({ key: cur.code, label: `${cur.symbol}  ${cur.name}`, sublabel: cur.code }))}
        onSelect={(code) => {
          setCurrency(code);
          setPickingCurrency(false);
        }}
        onCancel={() => setPickingCurrency(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { padding: 20, borderBottomWidth: 2, borderBottomColor: colors.hairlineStrong },
  card: { borderWidth: 2, borderColor: colors.ink, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  cardName: { fontFamily: font.semibold, fontSize: 13.5, color: colors.ink },
  cardMeta: { fontFamily: font.regular, fontSize: 10.5, letterSpacing: 0.5, textTransform: 'uppercase', color: 'rgba(32,30,29,.45)' },
  stateTag: { paddingVertical: 6, paddingHorizontal: 8 },
  stateText: { fontFamily: font.extrabold, fontSize: 10, letterSpacing: 0.5, textTransform: 'uppercase' },
  row: { borderBottomWidth: 1, borderBottomColor: 'rgba(32,30,29,.18)', paddingVertical: 15, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 },
  rowName: { fontFamily: font.semibold, fontSize: 14, color: colors.ink },
  rowHint: { fontFamily: font.regular, fontSize: 11, color: 'rgba(32,30,29,.45)' },
  footnote: { fontFamily: font.regular, fontSize: 11, lineHeight: 16, color: 'rgba(32,30,29,.4)', marginTop: 18 },
});
