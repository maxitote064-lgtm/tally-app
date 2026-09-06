import React, { useMemo } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, font, money } from '../theme';
import { RootHeader } from '../components/Headers';
import { Btn, Divider, Kicker, Section } from '../components/ui';
import { useStore } from '../store/useStore';
import { allowance, cfg, catMeta, spentToday, todayTx } from '../store/selectors';
import { SwipeCard } from '../components/SwipeCard';
import { RootStackParamList, TabParamList } from '../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Today'>,
  NativeStackScreenProps<RootStackParamList>
>;

const WEEK_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export function TodayScreen({ navigation }: Props) {
  const mode = useStore((s) => s.mode);
  const setMode = useStore((s) => s.setMode);
  const tx = useStore((s) => s.tx);
  const demoEmpty = useStore((s) => s.demoEmpty);
  const simulate = useStore((s) => s.simulate);

  const c = cfg(mode);
  const budget = allowance(tx, mode, demoEmpty);
  const spent = spentToday(tx, mode, demoEmpty);
  const today = todayTx(tx, mode, demoEmpty);
  const left = budget - spent;
  const uncat = today.filter((t) => !t.cat);

  const week = useMemo(() => {
    const weekVals = mode === 'us' ? [482, 705, 1044] : [318, 470, 692];
    const raw = [
      { day: 'SUN', v: weekVals[0], isToday: false },
      { day: 'MON', v: weekVals[1], isToday: false },
      { day: 'TUE', v: weekVals[2], isToday: false },
      { day: 'WED', v: spent, isToday: true },
      { day: 'THU', v: 0, isToday: false },
      { day: 'FRI', v: 0, isToday: false },
      { day: 'SAT', v: 0, isToday: false },
    ];
    const max = Math.max(...raw.map((d) => d.v), budget);
    return raw.map((d) => ({
      ...d,
      h: Math.max(2, Math.round((d.v / max) * 50)),
      fill: d.isToday ? colors.red : d.v ? colors.ink : colors.track,
      labelColor: d.isToday ? colors.red : colors.mutedFaint,
    }));
  }, [mode, spent, budget]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <RootHeader
        kicker={c.label === 'Household' ? 'Tally · household' : 'Tally'}
        title="Wed 26 August"
        mode={mode}
        onSetMode={setMode}
        onSettings={() => navigation.navigate('Settings')}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Section bottomRule style={{ gap: 13 }}>
          <View style={styles.spentTop}>
            <Kicker>{c.label === 'Household' ? 'Joint spend today' : 'Spent today'}</Kicker>
            <Pressable onPress={() => navigation.navigate('Budget')}>
              <Text style={styles.allowanceLink}>allowance</Text>
            </Pressable>
          </View>
          <View style={styles.spentRow}>
            <Text style={styles.spentAmount}>{money(spent)}</Text>
            <Text style={styles.spentNote}>
              of {money(budget, 0)}
              {'\n'}
              {left >= 0 ? `${money(left)} left` : `${money(Math.abs(left))} over`}
            </Text>
          </View>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { backgroundColor: left >= 0 ? colors.red : colors.ink, width: `${Math.min(100, (spent / budget) * 100)}%` }]} />
          </View>
          <View style={styles.weekRow}>
            {week.map((d) => (
              <View key={d.day} style={styles.weekCol}>
                <View style={[styles.weekBar, { height: d.h, backgroundColor: d.fill }]} />
                <Text style={[styles.weekLabel, { color: d.labelColor }]}>{d.day}</Text>
              </View>
            ))}
          </View>
        </Section>

        {today.length === 0 && (
          <Section style={{ gap: 14, alignItems: 'flex-start', paddingTop: 34, paddingBottom: 30 }}>
            <View style={styles.emptyMark} />
            <Text style={styles.emptyTitle}>Nothing spent yet today</Text>
            <Text style={styles.emptyBody}>
              Charges appear here the moment you pay with your wallet — usually before you've put your phone away. Your full{' '}
              {money(budget, 0)} is intact.
            </Text>
            <View style={{ flexDirection: 'row', gap: 8, paddingTop: 4 }}>
              <Btn variant="primary" onPress={simulate}>
                Simulate a tap
              </Btn>
              <Btn variant="outline" onPress={() => navigation.navigate('Budget')}>
                Review allowance
              </Btn>
            </View>
          </Section>
        )}

        {uncat.length > 0 && (
          <View style={[styles.uncatWrap]}>
            <View style={styles.uncatHead}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
                <Kicker color={colors.ink}>Needs a category</Kicker>
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{uncat.length}</Text>
                </View>
              </View>
              <Text style={styles.gestureHint}>→ accept · ← pick · ↑ split</Text>
            </View>
            <View style={{ gap: 10 }}>
              {uncat.map((t) => (
                <SwipeCard key={t.id} t={t} />
              ))}
            </View>
          </View>
        )}

        {today.length > 0 && (
          <Section style={{ paddingTop: 14 }}>
            <View style={styles.allHeadRow}>
              <Kicker>All of today</Kicker>
              <Text style={styles.countLabel}>
                {today.length} {today.length === 1 ? 'charge' : 'charges'}
              </Text>
            </View>
            {today.map((t) => {
              const m = catMeta(t);
              return (
                <Pressable
                  key={t.id}
                  onPress={() => navigation.navigate('Detail', { txId: t.id })}
                  style={styles.txRow}
                >
                  <View style={{ minWidth: 0, gap: 3, flex: 1 }}>
                    <Text style={styles.txMerchant} numberOfLines={1}>
                      {t.merchant}
                    </Text>
                    <Text style={[styles.txCat, { color: m.color === 'need' ? colors.redDark : colors.muted }]}>
                      {m.label}
                    </Text>
                  </View>
                  <Text style={styles.txAmount}>{money(t.amount)}</Text>
                </Pressable>
              );
            })}
            <View style={styles.totalRow}>
              <Kicker>Total</Kicker>
              <Text style={styles.totalAmount}>{money(spent)}</Text>
            </View>
            <Btn variant="outline" style={{ marginTop: 16, width: '100%', alignItems: 'center' }} onPress={simulate}>
              Simulate a tap-to-pay
            </Btn>
          </Section>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  spentTop: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  allowanceLink: { fontFamily: font.semibold, fontSize: 11, color: colors.redDark, textDecorationLine: 'underline' },
  spentRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  spentAmount: { fontFamily: font.extrabold, fontSize: 54, lineHeight: 54, color: colors.ink, letterSpacing: -1 },
  spentNote: { fontFamily: font.regular, fontSize: 12.5, lineHeight: 17, color: 'rgba(32,30,29,.6)', paddingBottom: 5 },
  barTrack: { height: 8, backgroundColor: colors.track, flexDirection: 'row' },
  barFill: { height: '100%' },
  weekRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: 'rgba(32,30,29,.2)' },
  weekCol: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    gap: 6,
    minHeight: 66,
    paddingTop: 8,
    paddingLeft: 6,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(32,30,29,.12)',
  },
  weekBar: { width: 10 },
  weekLabel: { fontFamily: font.extrabold, fontSize: 9.5, letterSpacing: 0.5 },
  emptyMark: { width: 40, height: 40, borderWidth: 2, borderColor: 'rgba(32,30,29,.3)' },
  emptyTitle: { fontFamily: font.extrabold, fontSize: 19, letterSpacing: -0.2, color: colors.ink, maxWidth: 270 },
  emptyBody: { fontFamily: font.regular, fontSize: 13, lineHeight: 20, color: 'rgba(32,30,29,.6)', maxWidth: 290 },
  uncatWrap: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: colors.rowPress, borderBottomWidth: 2, borderBottomColor: colors.hairlineStrong, gap: 11 },
  uncatHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 },
  countBadge: { backgroundColor: colors.red, paddingHorizontal: 6, paddingVertical: 4 },
  countBadgeText: { fontFamily: font.extrabold, fontSize: 10, color: colors.white },
  gestureHint: { fontFamily: font.regular, fontSize: 10.5, color: 'rgba(32,30,29,.5)' },
  allHeadRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingBottom: 6 },
  countLabel: { fontFamily: font.regular, fontSize: 10.5, letterSpacing: 0.5, textTransform: 'uppercase', color: 'rgba(32,30,29,.4)' },
  txRow: { borderTopWidth: 1, borderTopColor: 'rgba(32,30,29,.2)', paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  txMerchant: { fontFamily: font.semibold, fontSize: 14.5, color: colors.ink },
  txCat: { fontFamily: font.regular, fontSize: 10.5, letterSpacing: 0.5, textTransform: 'uppercase' },
  txAmount: { fontFamily: font.extrabold, fontSize: 15, color: colors.ink },
  totalRow: { borderTopWidth: 2, borderTopColor: colors.ink, paddingTop: 11, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  totalAmount: { fontFamily: font.extrabold, fontSize: 17, color: colors.ink },
});
