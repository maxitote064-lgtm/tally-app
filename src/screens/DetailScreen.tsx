import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, font } from '../theme';
import { PushedHeader } from '../components/Headers';
import { Kicker } from '../components/ui';
import { useCatMeta, useCategoryLabel, useLang, useStore, useBudgetCfg, useMoney, useT } from '../store/useStore';
import { allowance, spentToday } from '../store/selectors';
import { CATEGORIES } from '../data/mock';
import { weekdayShort, monthShort } from '../i18n/calendar';
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
  const removeTransaction = useStore((s) => s.removeTransaction);
  const setEditTarget = useStore((s) => s.setEditTarget);
  const c = useBudgetCfg();
  const money = useMoney();
  const t = useT();
  const lang = useLang();
  const catLabel = useCategoryLabel();
  const catMeta = useCatMeta();

  const tx_ = tx.find((x) => x.id === txId);
  if (!tx_) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <PushedHeader kicker={t('detail_kicker')} title={t('detail_title')} onClose={() => navigation.goBack()} />
      </View>
    );
  }

  const m = catMeta(tx_);
  const budget = allowance(tx, mode, demoEmpty, c);
  const spent = spentToday(tx, mode, demoEmpty);
  const splitOpen = split?.txId === tx_.id;
  const dayLabel = `${weekdayShort(lang, 3)} 26 ${monthShort(lang, 7)}`;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <PushedHeader kicker={t('detail_kicker')} title={t('detail_title')} onClose={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ paddingBottom: 26 }}>
        <Pressable
          style={styles.section}
          onPress={() => {
            setEditTarget({ kind: 'charge', txId: tx_.id });
            navigation.navigate('EditFields');
          }}
        >
          <View style={styles.headRow}>
            <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
              <Text style={styles.merchant}>{tx_.merchant}</Text>
              <Text style={styles.meta}>
                {tx_.time} · {dayLabel} · {tx_.method}
              </Text>
            </View>
            <Text style={styles.amount}>{money(tx_.amount)}</Text>
          </View>
          <View style={styles.tagRow}>
            <View style={[styles.tag, { backgroundColor: tx_.cat ? colors.ink : colors.red }]}>
              <Text style={styles.tagText}>{m.label}</Text>
            </View>
            <View style={styles.tagOutline}>
              <Text style={styles.tagOutlineText}>{tx_.joint ? t('joint') : tx_.owner === 'bia' ? 'Bia' : t('personal')}</Text>
            </View>
            <Text style={styles.tapHint}>{t('detail_tapToEdit')}</Text>
          </View>
        </Pressable>

        <View style={styles.section}>
          <Kicker>{t('detail_category')}</Kicker>
          <View style={styles.catGrid}>
            {CATEGORIES.map((cat) => {
              const on = tx_.cat === cat;
              return (
                <Pressable
                  key={cat}
                  onPress={() => assign(tx_.id, cat)}
                  style={[styles.catBtn, { borderColor: on ? colors.ink : 'rgba(32,30,29,.3)', backgroundColor: on ? colors.ink : colors.white }]}
                >
                  <Text style={[styles.catBtnText, { color: on ? colors.white : colors.ink }]}>{catLabel(cat)}</Text>
                </Pressable>
              );
            })}
          </View>
          <Pressable
            style={styles.splitOpenBtn}
            onPress={() => openSplit(tx_.id, tx_.cat ?? tx_.guess ?? 'Groceries', 'Household')}
          >
            <Text style={styles.splitOpenText}>{t('detail_splitBetweenTwo')}</Text>
          </Pressable>
          {splitOpen && split && (
            <View style={styles.splitPanel}>
              <View style={styles.splitLabelsRow}>
                <Text style={styles.splitLabelText}>
                  {catLabel(split.a)} · {money((tx_.amount * split.ratio) / 100)}
                </Text>
                <Text style={styles.splitLabelText}>
                  {money((tx_.amount * (100 - split.ratio)) / 100)} · {catLabel(split.b)}
                </Text>
              </View>
              <SplitRatioBar ratio={split.ratio} onChange={setSplitRatio} />
              <Pressable style={styles.saveBtn} onPress={commitSplit}>
                <Text style={styles.saveBtnText}>{t('detail_saveSplit')}</Text>
              </Pressable>
            </View>
          )}
        </View>

        <View style={styles.section}>
          {[
            { k: t('detail_terminal'), v: t('detail_tapToPayContactless') },
            { k: t('detail_card'), v: tx_.method.replace('Wallet · ', '').replace('Autopay · ', '') },
            { k: t('detail_countsToward'), v: t('detail_countsTowardValue', { day: dayLabel, amount: money(budget, 0) }) },
            { k: t('detail_shareOfToday'), v: `${Math.round((tx_.amount / Math.max(spent, 1)) * 100)}%` },
          ].map((r) => (
            <View key={r.k} style={styles.metaRow}>
              <Text style={styles.metaKey}>{r.k}</Text>
              <Text style={styles.metaVal}>{r.v}</Text>
            </View>
          ))}
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 16, gap: 9 }}>
          <Pressable style={styles.wideOutline} onPress={() => toggleJoint(tx_.id)}>
            <Text style={styles.wideOutlineText}>{tx_.joint ? t('detail_makePersonal') : t('detail_markJoint')}</Text>
          </Pressable>
          <Pressable style={styles.wideOutline} onPress={() => navigation.goBack()}>
            <Text style={[styles.wideOutlineText, { color: colors.redDark }]}>{t('detail_disputeCharge')}</Text>
          </Pressable>
          <Pressable
            style={styles.wideOutline}
            onPress={() => {
              removeTransaction(tx_.id);
              navigation.goBack();
            }}
          >
            <Text style={[styles.wideOutlineText, { color: colors.redDark }]}>{t('detail_deleteCharge')}</Text>
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
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 7 },
  tag: { paddingVertical: 6, paddingHorizontal: 8 },
  tagText: { fontFamily: font.extrabold, fontSize: 10, letterSpacing: 0.5, textTransform: 'uppercase', color: colors.white },
  tagOutline: { paddingVertical: 6, paddingHorizontal: 8, borderWidth: 1, borderColor: 'rgba(32,30,29,.3)' },
  tagOutlineText: { fontFamily: font.extrabold, fontSize: 10, letterSpacing: 0.5, textTransform: 'uppercase', color: 'rgba(32,30,29,.6)' },
  tapHint: { fontFamily: font.regular, fontSize: 10.5, color: 'rgba(32,30,29,.4)' },
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
