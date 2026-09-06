import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, money } from '../theme';
import { useStore, useBudgetCfg } from '../store/useStore';
import { allowance, spentToday } from '../store/selectors';
import { CATEGORIES, CATEGORY_HINTS } from '../data/mock';

export function PostPaymentSheet() {
  const sheet = useStore((s) => s.sheet);
  const dismissSheet = useStore((s) => s.dismissSheet);
  const filePending = useStore((s) => s.filePending);
  const mode = useStore((s) => s.mode);
  const tx = useStore((s) => s.tx);
  const demoEmpty = useStore((s) => s.demoEmpty);
  const insets = useSafeAreaInsets();

  const c = useBudgetCfg();
  const p = sheet.pending;
  const budget = allowance(tx, mode, demoEmpty, c);
  const spent = spentToday(tx, mode, demoEmpty);

  return (
    <Modal visible={sheet.open && !!p} transparent animationType="fade" onRequestClose={dismissSheet}>
      <Pressable style={styles.backdrop} onPress={dismissSheet} />
      {p && (
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 24 }]}>
          <View style={styles.kickerRow}>
            <View style={styles.dot} />
            <Text style={styles.kicker}>Paid with your wallet · just now</Text>
          </View>
          <View style={styles.amountRow}>
            <View style={{ gap: 3 }}>
              <Text style={styles.merchant}>{p.merchant}</Text>
              <Text style={styles.location}>{p.location}</Text>
            </View>
            <Text style={styles.amount}>{money(p.amount)}</Text>
          </View>
          <Pressable style={styles.acceptBtn} onPress={() => filePending(p.guess)}>
            <Text style={styles.acceptText}>Yes — {p.guess}</Text>
          </Pressable>
          <View>
            {CATEGORIES.filter((c) => c !== p.guess).map((c) => (
              <Pressable key={c} style={styles.chipRow} onPress={() => filePending(c)}>
                <Text style={styles.chipName}>{c}</Text>
                <Text style={styles.chipHint}>{CATEGORY_HINTS[c]}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.footerRow}>
            <Text style={styles.afterLine}>
              Filing puts today at {money(spent + p.amount)} of {money(budget, 0)}.
            </Text>
            <Pressable style={styles.laterBtn} onPress={dismissSheet}>
              <Text style={styles.laterText}>Later</Text>
            </Pressable>
          </View>
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(32,30,29,.45)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.bg,
    borderTopWidth: 2,
    borderTopColor: colors.ink,
    paddingHorizontal: 20,
    paddingTop: 18,
    gap: 15,
  },
  kickerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, backgroundColor: colors.red },
  kicker: { fontFamily: font.extrabold, fontSize: 10.5, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(32,30,29,.6)' },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
    borderBottomWidth: 2,
    borderBottomColor: colors.hairlineStrong,
    paddingBottom: 13,
  },
  merchant: { fontFamily: font.extrabold, fontSize: 18, letterSpacing: -0.2, color: colors.ink },
  location: { fontFamily: font.regular, fontSize: 11.5, color: 'rgba(32,30,29,.55)' },
  amount: { fontFamily: font.extrabold, fontSize: 34, letterSpacing: -0.5, color: colors.ink },
  acceptBtn: { backgroundColor: colors.red, paddingVertical: 14, paddingHorizontal: 4 },
  acceptText: { fontFamily: font.extrabold, fontSize: 12, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.white, paddingLeft: 10 },
  chipRow: {
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chipName: { fontFamily: font.semibold, fontSize: 13.5, color: colors.ink },
  chipHint: { fontFamily: font.regular, fontSize: 10.5, color: 'rgba(32,30,29,.45)' },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  afterLine: { fontFamily: font.regular, fontSize: 11.5, lineHeight: 16, color: 'rgba(32,30,29,.55)', flex: 1 },
  laterBtn: { borderWidth: 1, borderColor: 'rgba(32,30,29,.35)', paddingVertical: 11, paddingHorizontal: 12 },
  laterText: { fontFamily: font.extrabold, fontSize: 10.5, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.ink },
});
