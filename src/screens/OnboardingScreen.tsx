import React, { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font } from '../theme';
import { useT } from '../store/useStore';
import { Key } from '../i18n/translations';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

interface StepKeys {
  title: Key;
  body: Key;
  rows: [Key, Key][];
  fine: Key;
  cta: Key;
}

const STEP_KEYS: StepKeys[] = [
  {
    title: 'ob1_title',
    body: 'ob1_body',
    rows: [
      ['ob1_row1k', 'ob1_row1v'],
      ['ob1_row2k', 'ob1_row2v'],
      ['ob1_row3k', 'ob1_row3v'],
    ],
    fine: 'ob1_fine',
    cta: 'ob1_cta',
  },
  {
    title: 'ob2_title',
    body: 'ob2_body',
    rows: [
      ['ob2_row1k', 'ob2_row1v'],
      ['ob2_row2k', 'ob2_row2v'],
      ['ob2_row3k', 'ob2_row3v'],
    ],
    fine: 'ob2_fine',
    cta: 'ob2_cta',
  },
  {
    title: 'ob3_title',
    body: 'ob3_body',
    rows: [
      ['ob3_row1k', 'ob3_row1v'],
      ['ob3_row2k', 'ob3_row2v'],
      ['ob3_row3k', 'ob3_row3v'],
    ],
    fine: 'ob3_fine',
    cta: 'ob3_cta',
  },
  {
    title: 'ob4_title',
    body: 'ob4_body',
    rows: [
      ['ob4_row1k', 'ob4_row1v'],
      ['ob4_row2k', 'ob4_row2v'],
      ['ob4_row3k', 'ob4_row3v'],
    ],
    fine: 'ob4_fine',
    cta: 'ob4_cta',
  },
  {
    title: 'ob5_title',
    body: 'ob5_body',
    rows: [
      ['ob5_row1k', 'ob5_row1v'],
      ['ob5_row2k', 'ob5_row2v'],
      ['ob5_row3k', 'ob5_row3v'],
    ],
    fine: 'ob5_fine',
    cta: 'ob5_cta',
  },
  {
    title: 'ob6_title',
    body: 'ob6_body',
    rows: [
      ['ob6_row1k', 'ob6_row1v'],
      ['ob6_row2k', 'ob6_row2v'],
      ['ob6_row3k', 'ob6_row3v'],
    ],
    fine: 'ob6_fine',
    cta: 'ob6_cta',
  },
];

export function OnboardingScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const t = useT();
  const [step, setStep] = useState(0);
  const st = STEP_KEYS[step];
  const isLast = step === STEP_KEYS.length - 1;

  function finish() {
    navigation.goBack();
  }

  function finishToInstitutions() {
    navigation.goBack();
    navigation.navigate('Institutions');
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headRow}>
          <Text style={styles.kicker}>{t('ob_setupKicker')}</Text>
          <Pressable onPress={finish}>
            <Text style={styles.skip}>{t('ob_skip')}</Text>
          </Pressable>
        </View>
        <View style={styles.progressRow}>
          {STEP_KEYS.map((_, i) => (
            <View key={i} style={[styles.progressSeg, { backgroundColor: i <= step ? colors.red : colors.track }]} />
          ))}
        </View>
        <Text style={styles.stepCounter}>{t('ob_stepCounter', { n: step + 1, total: STEP_KEYS.length })}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.title}>{t(st.title)}</Text>
        <Text style={styles.desc}>{t(st.body)}</Text>
        <View>
          {st.rows.map((r) => (
            <View key={r[0]} style={styles.row}>
              <Text style={styles.rowKey}>{t(r[0])}</Text>
              <Text style={styles.rowVal}>{t(r[1])}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.fine}>{t(st.fine)}</Text>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        {step > 0 && (
          <Pressable style={styles.backBtn} onPress={() => setStep((s) => Math.max(0, s - 1))}>
            <Text style={styles.backText}>{t('back')}</Text>
          </Pressable>
        )}
        <Pressable style={styles.nextBtn} onPress={() => (isLast ? finishToInstitutions() : setStep((s) => s + 1))}>
          <Text style={styles.nextText}>{t(st.cta)}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 12, gap: 12, borderBottomWidth: 2, borderBottomColor: colors.ink },
  headRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  kicker: { fontFamily: font.extrabold, fontSize: 10.5, letterSpacing: 1.2, textTransform: 'uppercase', color: colors.red },
  skip: { fontFamily: font.semibold, fontSize: 11.5, color: 'rgba(32,30,29,.5)', textDecorationLine: 'underline' },
  progressRow: { flexDirection: 'row', gap: 4 },
  progressSeg: { flex: 1, height: 4 },
  stepCounter: { fontFamily: font.regular, fontSize: 10.5, letterSpacing: 0.5, textTransform: 'uppercase', color: 'rgba(32,30,29,.45)' },
  body: { padding: 20, paddingTop: 22, gap: 16 },
  title: { fontFamily: font.extrabold, fontSize: 30, lineHeight: 32, letterSpacing: -0.5, color: colors.ink },
  desc: { fontFamily: font.regular, fontSize: 13.5, lineHeight: 20, color: 'rgba(32,30,29,.65)' },
  row: { borderTopWidth: 1, borderTopColor: 'rgba(32,30,29,.2)', paddingVertical: 13, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 },
  rowKey: { fontFamily: font.semibold, fontSize: 13.5, color: colors.ink, flexShrink: 1 },
  rowVal: { fontFamily: font.extrabold, fontSize: 13.5, color: colors.ink, textAlign: 'right' },
  fine: { fontFamily: font.regular, fontSize: 11.5, lineHeight: 17, color: 'rgba(32,30,29,.45)' },
  footer: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 2, borderTopColor: colors.ink },
  backBtn: { borderWidth: 1, borderColor: 'rgba(32,30,29,.35)', paddingVertical: 14, paddingHorizontal: 13, justifyContent: 'center' },
  backText: { fontFamily: font.extrabold, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.ink },
  nextBtn: { flex: 1, backgroundColor: colors.red, paddingVertical: 14, alignItems: 'flex-start', paddingHorizontal: 4, justifyContent: 'center' },
  nextText: { fontFamily: font.extrabold, fontSize: 12, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.white, paddingLeft: 10 },
});
