import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, font, money } from '../theme';
import { PushedHeader } from '../components/Headers';
import { Kicker } from '../components/ui';
import { useStore, useBudgetCfg } from '../store/useStore';
import { allowance, catMeta, spentToday } from '../store/selectors';
import { CATEGORIES } from '../data/mock';
import { SplitRatioBar } from '../components/SplitRatioBar';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Detail'>;

export function DetailScreen({ route, navigation }: Props) {
  const { txId } = route.params;
  const mode = useStore((s) => s.mode);
  const tx = useStore((s) => s.tx);
  const demoEmpty = useStore((s) => s.demoEmpty);
  const assign = useStore((s) => s.assign);
  const toggleJoint = useStore((s) => s.toggleJoint);
  const split = useStore((s) => s.split);
  const openSplit = useStore((s) => s.openSplit);
  const setSplitRatio = useStore((s) => s.setSplitRatio);
  const commitSplit = useStore((s) => s.commitSplit);
  const c = useBudgetCfg();

  const t = tx.find((x) => x.id === txId);
  if (!t) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <PushedHeader kicker="Charge" title="Detail" onClose={() => navigation.goBack()} />
      </View>
    );
  }

  const m = catMeta(t);
  const budget = allowance(tx, mode, demoEmpty, c);
  const spent = spentToday(tx, mode, demoEmpty);
  const splitOpen = split?.txId === t.id;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <PushedHeader kicker="Charge" title="Detail" onClose={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ paddingBottom: 26 }}>
        <View style={styles.section}>
          <View style={styles.headRow}>
            <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
              <Text style={styles.merchant}>{t.merchant}</Text>
              <Text style={styles.meta}>
                {t.time} · Wed 26 Aug · {t.method}
              </Text>
            </View>
            <Text style={styles.amount}>{money(t.amount)}</Text>
          </View>
          <View style={styles.tagRow}>
            <View style={[styles.tag, { backgroundColor: t.cat ? colors.ink : colors.red }]}>
              <Text style={styles.tagText}>{m.label}</Text>
            </View>
            <View style={styles.tagOutline}>
              <Text style={styles.tagOutlineText}>{t.joint ? 'Joint' : t.owner === 'bia' ? 'Bia' : 'Personal'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Kicker>Category</Kicker>
          <View style={styles.catGrid}>
            {CATEGORIES.map((c) => {
              const on = t.cat === c;
              return (
                <Pressable
                  key={c}
                  onPress={() => assign(t.id, c)}
                  style={[styles.catBtn, { borderColor: on ? colors.ink : 'rgba(32,30,29,.3)', backgroundColor: on ? colors.ink : colors.white }]}
                >
                  <Text style={[styles.catBtnText, { color: on ? colors.white : colors.ink }]}>{c}</Text>
                </Pressable>
              );
            })}
          </View>
          <Pressable
            style={styles.splitOpenBtn}
            onPress={() => openSplit(t.id, t.cat ?? t.guess ?? 'Groceries', 'Household')}
          >
            <Text style={styles.splitOpenText}>Split between two categories</Text>
          </Pressable>
          {splitOpen && split && (
            <View style={styles.splitPanel}>
              <View style={styles.splitLabelsRow}>
                <Text style={styles.splitLabelText}>
                  {split.a} · {money((t.amount * split.ratio) / 100)}
                </Text>
                <Text style={styles.splitLabelText}>
                  {money((t.amount * (100 - split.ratio)) / 100)} · {split.b}
                </Text>
              </View>
              <SplitRatioBar ratio={split.ratio} onChange={setSplitRatio} />
              <Pressable style={styles.saveBtn} onPress={commitSplit}>
                <Text style={styles.saveBtnText}>Save split</Text>
              </Pressable>
            </View>
          )}
        </View>

        <View style={styles.section}>
          {[
            { k: 'Terminal', v: 'Tap-to-pay · contactless' },
            { k: 'Card', v: t.method.replace('Wallet · ', '').replace('Autopay · ', '') },
            { k: 'Counts toward', v: `Wed 26 Aug · ${money(budget, 0)} allowance` },
            { k: 'Share of today', v: `${Math.round((t.amount / Math.max(spent, 1)) * 100)}%` },
          ].map((r) => (
            <View key={r.k} style={styles.metaRow}>
              <Text style={styles.metaKey}>{r.k}</Text>
              <Text style={styles.metaVal}>{r.v}</Text>
            </View>
          ))}
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 16, gap: 9 }}>
          <Pressable style={styles.wideOutline} onPress={() => toggleJoint(t.id)}>
            <Text style={styles.wideOutlineText}>{t.joint ? 'Make this personal again' : 'Mark as a joint charge'}</Text>
          </Pressable>
          <Pressable style={styles.wideOutline} onPress={() => navigation.goBack()}>
            <Text style={[styles.wideOutlineText, { color: colors.redDark }]}>Not mine — dispute this charge</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { padding: 20, borderBottomWidth: 2, borderBottomColor: colors.hairlineStrong, gap: 12 },
  headRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 },
  merchant: { fontFamily: font.extrabold, fontSize: 19, letterSpacing: -0.3, color: colors.ink },
  meta: { fontFamily: font.regular, fontSize: 11.5, color: 'rgba(32,30,29,.55)' },
  amount: { fontFamily: font.extrabold, fontSize: 40, letterSpacing: -0.5, color: colors.ink },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  tag: { paddingVertical: 6, paddingHorizontal: 8 },
  tagText: { fontFamily: font.extrabold, fontSize: 10, letterSpacing: 0.5, textTransform: 'uppercase', color: colors.white },
  tagOutline: { paddingVertical: 6, paddingHorizontal: 8, borderWidth: 1, borderColor: 'rgba(32,30,29,.3)' },
  tagOutlineText: { fontFamily: font.extrabold, fontSize: 10, letterSpacing: 0.5, textTransform: 'uppercase', color: 'rgba(32,30,29,.6)' },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  catBtn: { width: '48.5%', borderWidth: 1, paddingVertical: 11, paddingHorizontal: 11 },
  catBtnText: { fontFamily: font.semibold, fontSize: 13 },
  splitOpenBtn: { borderWidth: 1, borderColor: 'rgba(32,30,29,.35)', paddingVertical: 11, alignItems: 'center' },
  splitOpenText: { fontFamily: font.extrabold, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.ink },
  splitPanel: { borderWidth: 2, borderColor: colors.ink, padding: 12, gap: 10 },
  splitLabelsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  splitLabelText: { fontFamily: font.semibold, fontSize: 12, color: colors.ink },
  saveBtn: { backgroundColor: colors.ink, paddingVertical: 11, alignItems: 'center' },
  saveBtnText: { fontFamily: font.extrabold, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.offWhite },
  metaRow: { borderTopWidth: 1, borderTopColor: 'rgba(32,30,29,.18)', paddingVertical: 11, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 },
  metaKey: { fontFamily: font.regular, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', color: 'rgba(32,30,29,.45)' },
  metaVal: { fontFamily: font.semibold, fontSize: 13, color: colors.ink, textAlign: 'right' },
  wideOutline: { borderWidth: 1, borderColor: 'rgba(32,30,29,.35)', paddingVertical: 13, alignItems: 'flex-start', paddingHorizontal: 4 },
  wideOutlineText: { fontFamily: font.extrabold, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.ink },
});
