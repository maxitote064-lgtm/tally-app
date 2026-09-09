import React, { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, font, CURRENCIES } from '../theme';
import { PushedHeader } from '../components/Headers';
import { Kicker } from '../components/ui';
import { OptionPickerModal } from '../components/OptionPickerModal';
import { useStore, useBudgetCfg, useCurrency, useLang, useMoney, useT } from '../store/useStore';
import { allowance } from '../store/selectors';
import { CARDS } from '../data/mock';
import { LANGUAGES } from '../i18n/translations';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const CARD_META_KEYS = ['settings_card1_meta', 'settings_card2_meta', 'settings_card3_meta'] as const;
const CARD_STATE_KEYS = { Linked: 'settings_state_linked', 'Goal only': 'settings_state_goalOnly' } as const;

export function SettingsScreen({ navigation }: Props) {
  const mode = useStore((s) => s.mode);
  const setMode = useStore((s) => s.setMode);
  const tx = useStore((s) => s.tx);
  const demoEmpty = useStore((s) => s.demoEmpty);
  const hasGoal = useStore((s) => s.hasGoal);
  const replayOnboarding = useStore((s) => s.replayOnboarding);
  const setCurrency = useStore((s) => s.setCurrency);
  const setLanguage = useStore((s) => s.setLanguage);
  const currency = useCurrency();
  const lang = useLang();
  const t = useT();

  const c = useBudgetCfg();
  const money = useMoney();
  const budget = allowance(tx, mode, demoEmpty, c);

  const [pickingCurrency, setPickingCurrency] = useState(false);
  const [pickingLanguage, setPickingLanguage] = useState(false);

  const rows: { name: string; hint: string; go: () => void }[] = [
    { name: t('settings_householdRow'), hint: mode === 'us' ? t('settings_jointViewOn') : t('settings_off'), go: () => setMode('us') },
    { name: t('settings_budgetAllowance'), hint: t('settings_aDayHint', { amount: money(budget, 0) }), go: () => navigation.navigate('Budget') },
    { name: t('settings_goals'), hint: hasGoal ? 'card ·· 8802' : t('settings_none'), go: () => navigation.navigate('Goals') },
    { name: t('settings_notificationsNudges'), hint: t('settings_onCount', { n: 3 }), go: () => navigation.navigate('Notifications') },
    { name: t('settings_categories'), hint: t('settings_inUse', { n: 6 }), go: () => navigation.navigate('Budget') },
    { name: t('settings_currency'), hint: `${currency.symbol} ${currency.code}`, go: () => setPickingCurrency(true) },
    { name: t('settings_language'), hint: LANGUAGES.find((l) => l.code === lang)?.label ?? '', go: () => setPickingLanguage(true) },
    {
      name: t('settings_replayOnboarding'),
      hint: t('settings_stepsCount', { n: 5 }),
      go: () => {
        replayOnboarding();
        navigation.navigate('Onboarding');
      },
    },
    { name: t('settings_exportCsv'), hint: t('settings_exportHint'), go: () => {} },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <PushedHeader kicker={t('settings_kicker')} title={t('settings_title')} onClose={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ paddingBottom: 26 }}>
        <View style={styles.section}>
          <Kicker>{t('settings_wallet')}</Kicker>
          <View style={{ gap: 10, marginTop: 11 }}>
            {CARDS.map((card, i) => (
              <View key={card.name} style={styles.card}>
                <View style={{ gap: 3 }}>
                  <Text style={styles.cardName}>{card.name}</Text>
                  <Text style={styles.cardMeta}>{t(CARD_META_KEYS[i])}</Text>
                </View>
                <View style={[styles.stateTag, { backgroundColor: card.highlight ? colors.red : colors.ink }]}>
                  <Text style={[styles.stateText, { color: card.highlight ? colors.white : colors.offWhite }]}>
                    {t(CARD_STATE_KEYS[card.state as keyof typeof CARD_STATE_KEYS])}
                  </Text>
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
          <Text style={styles.footnote}>{t('settings_footnote')}</Text>
        </View>
      </ScrollView>

      <OptionPickerModal
        visible={pickingCurrency}
        title={t('settings_currency')}
        selectedKey={currency.code}
        options={CURRENCIES.map((cur) => ({ key: cur.code, label: `${cur.symbol}  ${cur.name}`, sublabel: cur.code }))}
        onSelect={(code) => {
          setCurrency(code);
          setPickingCurrency(false);
        }}
        onCancel={() => setPickingCurrency(false)}
      />

      <OptionPickerModal
        visible={pickingLanguage}
        title={t('settings_language')}
        selectedKey={lang}
        options={LANGUAGES.map((l) => ({ key: l.code, label: l.label }))}
        onSelect={(code) => {
          setLanguage(code as typeof lang);
          setPickingLanguage(false);
        }}
        onCancel={() => setPickingLanguage(false)}
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
