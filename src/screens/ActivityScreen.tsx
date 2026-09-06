import React, { useMemo, useState } from 'react';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, font } from '../theme';
import { RootHeader } from '../components/Headers';
import { Kicker } from '../components/ui';
import { AddTransactionModal } from '../components/AddTransactionModal';
import { useStore, useBudgetCfg, useMoney } from '../store/useStore';
import { catMeta, filterTx, FILTERS } from '../store/selectors';
import { DAY_LABELS } from '../data/mock';
import { RootStackParamList, TabParamList } from '../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Activity'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function ActivityScreen({ navigation }: Props) {
  const mode = useStore((s) => s.mode);
  const setMode = useStore((s) => s.setMode);
  const tx = useStore((s) => s.tx);
  const demoEmpty = useStore((s) => s.demoEmpty);
  const filter = useStore((s) => s.filter);
  const setFilter = useStore((s) => s.setFilter);

  const c = useBudgetCfg();
  const money = useMoney();
  const [adding, setAdding] = useState(false);
  const filtered = filterTx(tx, mode, demoEmpty, filter as any);

  const groups = useMemo(
    () =>
      [0, 1, 2]
        .map((d) => {
          const items = filtered.filter((t) => t.day === d);
          return {
            label: DAY_LABELS[d],
            total: money(items.reduce((a, t) => a + t.amount, 0)),
            items,
          };
        })
        .filter((g) => g.items.length),
    [filtered]
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <RootHeader
        kicker={c.label === 'Household' ? 'Tally · household' : 'Tally'}
        title="Activity"
        mode={mode}
        onSetMode={setMode}
        onSettings={() => navigation.navigate('Settings')}
      />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 14 }}>
        <View style={styles.search}>
          <View style={styles.searchDot} />
          <Text style={styles.searchText}>Search merchant, category, amount</Text>
        </View>

        <Pressable style={styles.addBtn} onPress={() => setAdding(true)}>
          <Text style={styles.addBtnText}>+ Add a charge</Text>
        </Pressable>

        <View style={styles.filterRow}>
          {FILTERS.map((f) => {
            const on = filter === f;
            return (
              <Pressable
                key={f}
                onPress={() => setFilter(f)}
                style={[styles.filterChip, { borderColor: on ? colors.ink : 'rgba(32,30,29,.3)', backgroundColor: on ? colors.ink : 'transparent' }]}
              >
                <Text style={[styles.filterText, { color: on ? colors.white : colors.ink }]}>{f}</Text>
              </Pressable>
            );
          })}
        </View>

        {groups.map((g) => (
          <View key={g.label} style={{ gap: 0 }}>
            <View style={styles.groupHead}>
              <Text style={styles.groupLabel}>{g.label}</Text>
              <Text style={styles.groupTotal}>{g.total}</Text>
            </View>
            {g.items.map((t) => {
              const m = catMeta(t);
              const ownerTag = mode === 'us' ? (t.owner === 'bia' ? ' · Bia' : ' · You') : '';
              return (
                <Pressable key={t.id} onPress={() => navigation.navigate('Detail', { txId: t.id })} style={styles.row}>
                  <Text style={styles.time}>{t.time}</Text>
                  <View style={{ minWidth: 0, flex: 1, gap: 3 }}>
                    <Text style={styles.merchant} numberOfLines={1}>
                      {t.merchant}
                    </Text>
                    <Text style={[styles.cat, { color: m.color === 'need' ? colors.redDark : colors.muted }]}>
                      {m.label}
                      {ownerTag}
                    </Text>
                  </View>
                  <Text style={styles.amount}>{money(t.amount)}</Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </ScrollView>
      <AddTransactionModal visible={adding} onClose={() => setAdding(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  search: { flexDirection: 'row', alignItems: 'center', gap: 9, borderWidth: 1, borderColor: 'rgba(32,30,29,.3)', paddingVertical: 11, paddingHorizontal: 12 },
  searchDot: { width: 11, height: 11, borderRadius: 9, borderWidth: 2, borderColor: 'rgba(32,30,29,.4)' },
  searchText: { fontFamily: font.regular, fontSize: 13, color: 'rgba(32,30,29,.45)' },
  addBtn: { borderWidth: 1, borderColor: 'rgba(32,30,29,.35)', paddingVertical: 11, alignItems: 'center' },
  addBtnText: { fontFamily: font.extrabold, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.ink },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  filterChip: { borderWidth: 1, paddingVertical: 8, paddingHorizontal: 10 },
  filterText: { fontFamily: font.semibold, fontSize: 11.5 },
  groupHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', borderBottomWidth: 2, borderBottomColor: colors.ink, paddingBottom: 7 },
  groupLabel: { fontFamily: font.extrabold, fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.ink },
  groupTotal: { fontFamily: font.extrabold, fontSize: 12, color: colors.ink },
  row: { borderTopWidth: 1, borderTopColor: 'rgba(32,30,29,.18)', paddingVertical: 11, flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  time: { width: 42, fontFamily: font.regular, fontSize: 10.5, color: 'rgba(32,30,29,.42)' },
  merchant: { fontFamily: font.semibold, fontSize: 14, color: colors.ink },
  cat: { fontFamily: font.regular, fontSize: 10.5, letterSpacing: 0.5, textTransform: 'uppercase' },
  amount: { fontFamily: font.extrabold, fontSize: 14.5, color: colors.ink },
});
