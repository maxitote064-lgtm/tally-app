import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, font } from '../theme';
import { PushedHeader } from '../components/Headers';
import { Kicker } from '../components/ui';
import { useStore, useBudgetCfg, useLang, useMoney, useT } from '../store/useStore';
import { allowance, spentToday } from '../store/selectors';
import { SWEEPS } from '../data/mock';
import { weekdayShort, monthShort } from '../i18n/calendar';
import { Key } from '../i18n/translations';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Goals'>;

const SWEEP_DAYS_WD = [2, 1, 0, 6];
const SWEEP_NOTE_KEYS: Key[] = ['goals_cameInUnder', 'goals_overNothingSwept', 'goals_cameInUnder', 'goals_cameInUnder'];

export function GoalsScreen({ navigation }: Props) {
  const mode = useStore((s) => s.mode);
  const tx = useStore((s) => s.tx);
  const demoEmpty = useStore((s) => s.demoEmpty);
  const hasGoal = useStore((s) => s.hasGoal);
  const addGoal = useStore((s) => s.addGoal);
  const removeGoal = useStore((s) => s.removeGoal);

  const c = useBudgetCfg();
  const money = useMoney();
  const t = useT();
  const lang = useLang();
  const budget = allowance(tx, mode, demoEmpty, c);
  const spent = spentToday(tx, mode, demoEmpty);
  const left = budget - spent;
  const sweepStr = left > 0 ? money(left) : t('goals_nothingYet');

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <PushedHeader kicker={t('goals_kicker')} title={t('goals_title')} onClose={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ paddingBottom: 26 }}>
        {hasGoal ? (
          <>
            <View style={styles.hero}>
              <Text style={styles.heroKicker}>{t('goals_remainingBalance')}</Text>
              <Text style={styles.heroAmount}>{money(4180, 0)}</Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: '38%' }]} />
              </View>
              <View style={styles.progressRow}>
                <Text style={styles.progressText}>{t('goals_cleared', { amount: money(2560, 0) })}</Text>
                <Text style={styles.progressText}>{t('goals_clearBy', { date: `${monthShort(lang, 5)} 2027` })}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Kicker>{t('goals_fedByUnderspending')}</Kicker>
              <Text style={styles.body}>{t('goals_sweptBody', { amount: sweepStr })}</Text>
              {SWEEPS.map((s, i) => (
                <View key={s.day} style={styles.sweepRow}>
                  <View style={{ gap: 3 }}>
                    <Text style={styles.sweepDay}>
                      {weekdayShort(lang, SWEEP_DAYS_WD[i])} {s.day.split(' ')[1]} {monthShort(lang, 7)}
                    </Text>
                    <Text style={styles.sweepNote}>{t(SWEEP_NOTE_KEYS[i])}</Text>
                  </View>
                  <Text style={[styles.sweepAmount, { color: s.positive ? colors.ink : 'rgba(32,30,29,.4)' }]}>
                    {s.amount === 0 ? money(0) : `+${money(s.amount)}`}
                  </Text>
                </View>
              ))}
              <View style={styles.sweepRow}>
                <View style={{ gap: 3 }}>
                  <Text style={styles.sweepDay}>{t('goals_augustSoFar')}</Text>
                  <Text style={styles.sweepNote}>{t('goals_sweptAtBalance')}</Text>
                </View>
                <Text style={[styles.sweepAmount, { color: colors.red }]}>+{money(268, 0)}</Text>
              </View>
            </View>

            <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
              <Pressable style={styles.outlineBtn} onPress={removeGoal}>
                <Text style={styles.outlineBtnText}>{t('goals_pauseGoal')}</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyMark} />
            <Text style={styles.emptyTitle}>{t('goals_noGoalTitle')}</Text>
            <Text style={styles.emptyBody}>{t('goals_noGoalBody')}</Text>
            <Pressable style={styles.primaryBtn} onPress={addGoal}>
              <Text style={styles.primaryBtnText}>{t('goals_chooseBalance')}</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.red, padding: 20, gap: 14 },
  heroKicker: { fontFamily: font.extrabold, fontSize: 10.5, letterSpacing: 1.2, textTransform: 'uppercase', color: 'rgba(255,255,255,.75)' },
  heroAmount: { fontFamily: font.extrabold, fontSize: 52, letterSpacing: -1, color: colors.white },
  progressTrack: { height: 8, backgroundColor: 'rgba(255,255,255,.3)' },
  progressFill: { height: '100%', backgroundColor: colors.white },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressText: { fontFamily: font.regular, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', color: 'rgba(255,255,255,.8)' },
  section: { padding: 20, borderBottomWidth: 2, borderBottomColor: colors.hairlineStrong, gap: 11 },
  body: { fontFamily: font.regular, fontSize: 12.5, lineHeight: 19, color: 'rgba(32,30,29,.7)' },
  sweepRow: { borderTopWidth: 1, borderTopColor: 'rgba(32,30,29,.18)', paddingTop: 10, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 },
  sweepDay: { fontFamily: font.semibold, fontSize: 13.5, color: colors.ink },
  sweepNote: { fontFamily: font.regular, fontSize: 10.5, letterSpacing: 0.5, textTransform: 'uppercase', color: 'rgba(32,30,29,.45)' },
  sweepAmount: { fontFamily: font.extrabold, fontSize: 13.5 },
  outlineBtn: { borderWidth: 1, borderColor: 'rgba(32,30,29,.35)', paddingVertical: 13, paddingHorizontal: 4, alignItems: 'flex-start' },
  outlineBtnText: { fontFamily: font.extrabold, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.ink },
  emptyWrap: { padding: 20, paddingTop: 30, gap: 14, alignItems: 'flex-start' },
  emptyMark: { width: 40, height: 40, borderWidth: 2, borderColor: 'rgba(32,30,29,.3)' },
  emptyTitle: { fontFamily: font.extrabold, fontSize: 20, letterSpacing: -0.3, color: colors.ink, maxWidth: 280 },
  emptyBody: { fontFamily: font.regular, fontSize: 13, lineHeight: 20, color: 'rgba(32,30,29,.62)', maxWidth: 290 },
  primaryBtn: { backgroundColor: colors.red, paddingVertical: 12, paddingHorizontal: 14 },
  primaryBtnText: { fontFamily: font.extrabold, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.white },
});
