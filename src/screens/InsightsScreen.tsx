import React, { useMemo } from 'react';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, font, CAT_COLORS } from '../theme';
import { RootHeader } from '../components/Headers';
import { Kicker } from '../components/ui';
import { useCategoryLabel, useLang, useMoney, useStore, useT } from '../store/useStore';
import { monthSpent, visibleTx } from '../store/selectors';
import { CATEGORIES, RECURRING } from '../data/mock';
import { monthFull } from '../i18n/calendar';
import { Key } from '../i18n/translations';
import { RootStackParamList, TabParamList } from '../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Insights'>,
  NativeStackScreenProps<RootStackParamList>
>;

const RECURRING_NOTE_KEYS: Key[] = ['recurring1_note', 'recurring2_note', 'recurring3_note'];

export function InsightsScreen({ navigation }: Props) {
  const mode = useStore((s) => s.mode);
  const setMode = useStore((s) => s.setMode);
  const tx = useStore((s) => s.tx);
  const demoEmpty = useStore((s) => s.demoEmpty);
  const hasGoal = useStore((s) => s.hasGoal);

  const money = useMoney();
  const t = useT();
  const lang = useLang();
  const catLabel = useCategoryLabel();
  const mSpent = monthSpent(tx, mode, demoEmpty);
  const visible = visibleTx(tx, mode, demoEmpty);
  const monthBaseVal = mode === 'us' ? 6400 : 3200;

  const catTotals = useMemo(() => {
    const totals = CATEGORIES.map((cat) => {
      const base = cat === 'Bills' ? monthBaseVal * 0.42 : monthBaseVal * 0.1;
      const amt = visible.filter((t) => t.cat === cat).reduce((a, t) => a + t.amount, 0) + base;
      return { name: cat, color: CAT_COLORS[cat], amt };
    }).sort((a, b) => b.amt - a.amt);
    return totals;
  }, [visible, monthBaseVal]);
  const catMax = catTotals[0]?.amt || 1;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <RootHeader
        kicker={mode === 'us' ? `Tally · ${t('household').toLowerCase()}` : 'Tally'}
        title={t('tabInsights')}
        mode={mode}
        onSetMode={setMode}
        onSettings={() => navigation.navigate('Settings')}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.hero}>
          <Text style={styles.heroKicker}>
            {monthFull(lang, 7)} 1–26 · {mode === 'us' ? t('household') : t('personal')}
          </Text>
          <View style={styles.heroRow}>
            <Text style={styles.heroAmount}>{money(mSpent, 0)}</Text>
            <Text style={styles.heroDelta}>
              {t('insights_belowSamePoint', { amount: mode === 'us' ? 'R$ 1.040' : 'R$ 480', month: monthFull(lang, 6) })}
            </Text>
          </View>
          <View style={styles.heroStats}>
            <View>
              <Text style={styles.heroStatVal}>{money(mSpent / 26, 0)}</Text>
              <Text style={styles.heroStatLabel}>{t('insights_aDay')}</Text>
            </View>
            <View>
              <Text style={styles.heroStatVal}>{money((mSpent / 26) * 31, 0)}</Text>
              <Text style={styles.heroStatLabel}>{t('insights_projected')}</Text>
            </View>
            <View>
              <Text style={styles.heroStatVal}>{mode === 'us' ? '16' : '18'}</Text>
              <Text style={styles.heroStatLabel}>{t('insights_daysOnPlan')}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Kicker>{t('insights_whereItWent')}</Kicker>
          <View style={{ gap: 11, marginTop: 13 }}>
            {catTotals.map((b) => (
              <View key={b.name} style={{ gap: 6 }}>
                <View style={styles.breakRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={[styles.dot, { backgroundColor: b.color }]} />
                    <Text style={styles.breakName}>{catLabel(b.name)}</Text>
                  </View>
                  <Text style={styles.breakVal}>
                    {money(b.amt, 0)} · {Math.round((b.amt / mSpent) * 100)}%
                  </Text>
                </View>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${Math.max(3, (b.amt / catMax) * 100)}%`, backgroundColor: b.color }]} />
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
            <Kicker color={colors.ink}>{t('insights_quietlyRecurring')}</Kicker>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </View>
          <View style={{ marginTop: 11 }}>
            {RECURRING.map((r, i) => (
              <View key={r.name} style={styles.recurringRow}>
                <View style={{ gap: 3 }}>
                  <Text style={styles.recurringName}>{r.name}</Text>
                  <Text style={styles.recurringNote}>{t(RECURRING_NOTE_KEYS[i])}</Text>
                </View>
                <Text style={styles.recurringAmount}>{money(r.amount)}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.recurringFooter}>{t('insights_billsSpikeNote')}</Text>
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 6, paddingBottom: 26 }}>
          <Pressable onPress={() => navigation.navigate('Budget')} style={styles.moreRow}>
            <Text style={styles.moreName}>{t('insights_budgetAllowance')}</Text>
            <Text style={styles.moreHint}>{t('insights_aDay')}</Text>
          </Pressable>
          <Pressable onPress={() => navigation.navigate('Goals')} style={styles.moreRow}>
            <Text style={styles.moreName}>{t('insights_goals')}</Text>
            <Text style={styles.moreHint}>{hasGoal ? 'card ·· 8802' : t('insights_noneSet')}</Text>
          </Pressable>
          <Pressable onPress={() => navigation.navigate('Notifications')} style={[styles.moreRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.moreName}>{t('insights_notificationsNudges')}</Text>
            <Text style={styles.moreHint}>{t('insights_onCount', { n: 3 })}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.ink, padding: 20, paddingBottom: 20, gap: 14 },
  heroKicker: { fontFamily: font.extrabold, fontSize: 10.5, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(243,242,242,.55)' },
  heroRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  heroAmount: { fontFamily: font.extrabold, fontSize: 46, lineHeight: 46, color: colors.white, letterSpacing: -1 },
  heroDelta: { fontFamily: font.regular, fontSize: 12, color: 'rgba(243,242,242,.6)', paddingBottom: 5, flexShrink: 1 },
  heroStats: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: 'rgba(243,242,242,.22)', paddingTop: 12, gap: 8 },
  heroStatVal: { fontFamily: font.extrabold, fontSize: 15, color: colors.white },
  heroStatLabel: { fontFamily: font.regular, fontSize: 10, letterSpacing: 0.5, textTransform: 'uppercase', color: 'rgba(243,242,242,.5)' },
  section: { padding: 20, borderBottomWidth: 2, borderBottomColor: colors.hairlineStrong },
  breakRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  dot: { width: 7, height: 7 },
  breakName: { fontFamily: font.semibold, fontSize: 13, color: colors.ink },
  breakVal: { fontFamily: font.regular, fontSize: 12, color: 'rgba(32,30,29,.6)' },
  barTrack: { height: 6, backgroundColor: colors.track },
  barFill: { height: '100%' },
  badge: { backgroundColor: colors.ink, paddingHorizontal: 6, paddingVertical: 4 },
  badgeText: { fontFamily: font.extrabold, fontSize: 10, color: colors.white },
  recurringRow: { borderTopWidth: 1, borderTopColor: colors.hairline, paddingTop: 10, marginTop: 10, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  recurringName: { fontFamily: font.semibold, fontSize: 14, color: colors.ink },
  recurringNote: { fontFamily: font.regular, fontSize: 10.5, letterSpacing: 0.5, textTransform: 'uppercase', color: 'rgba(32,30,29,.45)' },
  recurringAmount: { fontFamily: font.extrabold, fontSize: 14, color: colors.ink },
  recurringFooter: { fontFamily: font.regular, fontSize: 11.5, lineHeight: 17, color: 'rgba(32,30,29,.5)', marginTop: 12 },
  moreRow: { borderBottomWidth: 1, borderBottomColor: colors.hairline, paddingVertical: 15, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  moreName: { fontFamily: font.semibold, fontSize: 14, color: colors.ink },
  moreHint: { fontFamily: font.regular, fontSize: 11, color: 'rgba(32,30,29,.45)' },
});
