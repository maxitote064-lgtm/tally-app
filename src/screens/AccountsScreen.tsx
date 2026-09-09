import React, { useMemo } from 'react';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, font } from '../theme';
import { RootHeader } from '../components/Headers';
import { Btn, Kicker } from '../components/ui';
import { useCategoryLabel, useLang, useMoney, useStore, useT } from '../store/useStore';
import { OF_ACCOUNTS, OF_CARDS, OFAccountKind, INSTALLMENTS } from '../data/openFinance';
import { monthFull } from '../i18n/calendar';
import { Key } from '../i18n/translations';
import { RootStackParamList, TabParamList } from '../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Accounts'>,
  NativeStackScreenProps<RootStackParamList>
>;

const ACCT_KIND_KEYS: Record<OFAccountKind, Key> = {
  checking: 'of_acctChecking',
  savings: 'of_acctSavings',
  payment: 'of_acctPayment',
  investment: 'of_acctInvestment',
};

export function AccountsScreen({ navigation }: Props) {
  const mode = useStore((s) => s.mode);
  const setMode = useStore((s) => s.setMode);
  const institutions = useStore((s) => s.institutions);
  const tx = useStore((s) => s.tx);
  const t = useT();
  const lang = useLang();
  const money = useMoney();
  const catLabel = useCategoryLabel();

  const connectedIds = useMemo(() => institutions.filter((i) => i.connected).map((i) => i.id), [institutions]);
  const accounts = useMemo(() => OF_ACCOUNTS.filter((a) => connectedIds.includes(a.institutionId)), [connectedIds]);
  const cards = useMemo(() => OF_CARDS.filter((c) => connectedIds.includes(c.institutionId)), [connectedIds]);
  const instName = (id: string) => institutions.find((i) => i.id === id)?.name ?? '';

  const cashOnHand = accounts.filter((a) => a.kind === 'checking' || a.kind === 'savings').reduce((s, a) => s + a.balance, 0);
  const openBillsTotal = cards.reduce((s, c) => s + c.openBill, 0);

  // Pick the highest-open-bill card that actually has matching demo charges, so the
  // breakdown below is never a header with nothing under it.
  const biggestCard = useMemo(
    () =>
      [...cards]
        .filter((c) => tx.some((t2) => t2.method.includes(c.digits)))
        .sort((a, b) => b.openBill - a.openBill)[0],
    [cards, tx]
  );
  const billBreakdown = useMemo(() => {
    if (!biggestCard) return [] as { cat: string; amount: number }[];
    const billTx = tx.filter((t2) => t2.method.includes(biggestCard.digits));
    const map = new Map<string, number>();
    for (const t2 of billTx) {
      const key = t2.cat ?? '__none';
      map.set(key, (map.get(key) ?? 0) + t2.amount);
    }
    return [...map.entries()].map(([cat, amount]) => ({ cat, amount })).sort((a, b) => b.amount - a.amount);
  }, [tx, biggestCard]);
  const billMax = Math.max(...billBreakdown.map((b) => b.amount), 1);

  const months = useMemo(() => {
    const maxRemaining = Math.max(...INSTALLMENTS.map((p) => p.total - p.paid), 0);
    const out: { y: number; m: number; total: number }[] = [];
    for (let k = 0; k < maxRemaining; k++) {
      const d = new Date(2026, 8 + k, 1);
      const total = INSTALLMENTS.filter((p) => p.total - p.paid > k).reduce((s, p) => s + p.perMonth, 0);
      out.push({ y: d.getFullYear(), m: d.getMonth(), total });
    }
    return out;
  }, []);
  const monthMax = Math.max(...months.map((m) => m.total), 1);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <RootHeader
        kicker={mode === 'us' ? `Tally · ${t('household').toLowerCase()}` : 'Tally'}
        title={t('tabAccounts')}
        mode={mode}
        onSetMode={setMode}
        onSettings={() => navigation.navigate('Settings')}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.hero}>
          <Kicker color="rgba(243,242,242,.7)">{t('of_cashOnHand')}</Kicker>
          <Text style={styles.heroAmount}>{money(cashOnHand, 0)}</Text>
          <Text style={styles.heroSub}>{t('of_investmentsExcluded')}</Text>
          <View style={styles.heroDivider} />
          <View style={styles.heroRow}>
            <Kicker color="rgba(243,242,242,.7)">{t('of_openBills')}</Kicker>
            <Text style={styles.heroSecondary}>{money(openBillsTotal)}</Text>
          </View>
        </View>

        <View style={styles.sectionHead}>
          <Kicker>{t('of_accountsAndCards')}</Kicker>
        </View>
        {accounts.map((a) => (
          <View key={a.id} style={styles.row}>
            <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
              <Text style={styles.rowLeft}>
                {t(ACCT_KIND_KEYS[a.kind])} ·· {a.digits}
              </Text>
              <Text style={styles.rowSub}>{instName(a.institutionId)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 2 }}>
              <Text style={styles.rowRight}>{money(a.balance)}</Text>
              {a.kind === 'investment' && <Text style={styles.rowSub}>{t('of_investmentLabel')}</Text>}
            </View>
          </View>
        ))}
        {cards.map((c) => (
          <View key={c.id} style={styles.row}>
            <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
              <Text style={styles.rowLeft}>
                {c.name} ·· {c.digits}
              </Text>
              <Text style={styles.rowSub}>
                {instName(c.institutionId)} · {t('of_openBill')}
              </Text>
            </View>
            <Text style={styles.rowRight}>{money(c.openBill)}</Text>
          </View>
        ))}
        <View style={styles.divider} />

        {biggestCard && (
          <>
            <View style={styles.sectionHead}>
              <Kicker>{t('of_openBillByCategory')}</Kicker>
              <Text style={styles.sectionHeadRight}>·· {biggestCard.digits}</Text>
            </View>
            {billBreakdown.map((b) => (
              <View key={b.cat} style={{ paddingHorizontal: 20, paddingVertical: 11, gap: 6, borderTopWidth: 1, borderTopColor: 'rgba(32,30,29,.18)' }}>
                <View style={styles.breakRow}>
                  <Text style={styles.breakName}>{b.cat === '__none' ? t('filterUnfiled') : catLabel(b.cat as any)}</Text>
                  <Text style={styles.breakVal}>{money(b.amount)}</Text>
                </View>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${(b.amount / billMax) * 100}%`, backgroundColor: b.cat === '__none' ? colors.red : colors.ink }]} />
                </View>
              </View>
            ))}
            <View style={styles.divider} />
          </>
        )}

        <View style={styles.sectionHead}>
          <Kicker>{t('of_committed')}</Kicker>
          <Text style={styles.sectionHeadRight}>{t('of_committedNote')}</Text>
        </View>
        {months.map((m) => (
          <View key={`${m.y}-${m.m}`} style={styles.monthRow}>
            <Text style={styles.monthLabel}>{monthFull(lang, m.m)}</Text>
            <View style={styles.monthBarTrack}>
              <View style={[styles.monthBarFill, { width: `${(m.total / monthMax) * 100}%` }]} />
            </View>
            <Text style={styles.monthVal}>{money(m.total)}</Text>
          </View>
        ))}
        <View style={styles.divider} />
        {INSTALLMENTS.map((p) => (
          <View key={p.id} style={styles.row}>
            <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
              <Text style={styles.rowLeft}>
                {p.merchant} · {p.label} — {p.paid}/{p.total}
              </Text>
              <Text style={styles.rowSub}>
                {p.total - p.paid} {t('of_remaining')}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 2 }}>
              <Text style={styles.rowRight}>{money(p.perMonth)}</Text>
              <Text style={styles.rowSub}>{t('of_perMonth')}</Text>
            </View>
          </View>
        ))}

        <View style={{ padding: 20 }}>
          <Btn variant="dark" style={{ alignItems: 'center' }} onPress={() => navigation.navigate('Institutions')}>
            {t('of_connect')} · {t('of_openFinance')}
          </Btn>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.ink, padding: 20, gap: 8 },
  heroAmount: { fontFamily: font.extrabold, fontSize: 46, lineHeight: 46, color: colors.white, letterSpacing: -1 },
  heroSub: { fontFamily: font.extrabold, fontSize: 10, letterSpacing: 0.6, textTransform: 'uppercase', color: 'rgba(243,242,242,.5)' },
  heroDivider: { height: 1, backgroundColor: 'rgba(243,242,242,.3)', marginTop: 6 },
  heroRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingTop: 6 },
  heroSecondary: { fontFamily: font.extrabold, fontSize: 20, letterSpacing: -0.3, color: colors.white },
  sectionHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 8, borderBottomWidth: 2, borderBottomColor: colors.hairlineStrong },
  sectionHeadRight: { fontFamily: font.regular, fontSize: 11, color: 'rgba(32,30,29,.5)' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingHorizontal: 20, paddingVertical: 11, borderTopWidth: 1, borderTopColor: 'rgba(32,30,29,.18)' },
  rowLeft: { fontFamily: font.semibold, fontSize: 13.5, color: colors.ink },
  rowSub: { fontFamily: font.regular, fontSize: 10.5, color: 'rgba(32,30,29,.5)' },
  rowRight: { fontFamily: font.extrabold, fontSize: 13.5, color: colors.ink },
  divider: { height: 2, backgroundColor: colors.hairlineStrong },
  breakRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  breakName: { fontFamily: font.semibold, fontSize: 13, color: colors.ink },
  breakVal: { fontFamily: font.semibold, fontSize: 13, color: colors.ink },
  barTrack: { height: 6, backgroundColor: colors.track },
  barFill: { height: '100%' },
  monthRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 9, borderTopWidth: 1, borderTopColor: 'rgba(32,30,29,.18)' },
  monthLabel: { width: 90, fontFamily: font.extrabold, fontSize: 10, letterSpacing: 0.5, textTransform: 'uppercase', color: 'rgba(32,30,29,.55)' },
  monthBarTrack: { flex: 1, height: 6, backgroundColor: colors.track },
  monthBarFill: { height: '100%', backgroundColor: colors.ink },
  monthVal: { fontFamily: font.semibold, fontSize: 13, color: colors.ink },
});
