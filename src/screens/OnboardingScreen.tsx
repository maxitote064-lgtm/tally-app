import React, { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font } from '../theme';
import { STEPS } from '../data/mock';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

export function OnboardingScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const st = STEPS[step];
  const isLast = step === STEPS.length - 1;

  function finish() {
    navigation.goBack();
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headRow}>
          <Text style={styles.kicker}>Tally · setup</Text>
          <Pressable onPress={finish}>
            <Text style={styles.skip}>Skip for now</Text>
          </Pressable>
        </View>
        <View style={styles.progressRow}>
          {STEPS.map((_, i) => (
            <View key={i} style={[styles.progressSeg, { backgroundColor: i <= step ? colors.red : colors.track }]} />
          ))}
        </View>
        <Text style={styles.stepCounter}>
          Step {step + 1} of {STEPS.length}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.title}>{st.title}</Text>
        <Text style={styles.desc}>{st.body}</Text>
        <View>
          {st.rows.map((r) => (
            <View key={r[0]} style={styles.row}>
              <Text style={styles.rowKey}>{r[0]}</Text>
              <Text style={styles.rowVal}>{r[1]}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.fine}>{st.fine}</Text>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        {step > 0 && (
          <Pressable style={styles.backBtn} onPress={() => setStep((s) => Math.max(0, s - 1))}>
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        )}
        <Pressable style={styles.nextBtn} onPress={() => (isLast ? finish() : setStep((s) => s + 1))}>
          <Text style={styles.nextText}>{st.cta}</Text>
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
