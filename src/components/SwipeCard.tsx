import React, { useRef, useState } from 'react';
import { Animated, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font } from '../theme';
import { CATEGORIES, Transaction } from '../data/mock';
import { useCategoryLabel, useMoney, useStore, useT } from '../store/useStore';
import { SplitRatioBar } from './SplitRatioBar';

export function SwipeCard({ t }: { t: Transaction }) {
  const pickerTxId = useStore((s) => s.pickerTxId);
  const split = useStore((s) => s.split);
  const assign = useStore((s) => s.assign);
  const openPicker = useStore((s) => s.openPicker);
  const openSplit = useStore((s) => s.openSplit);
  const setSplitRatio = useStore((s) => s.setSplitRatio);
  const setSplitCat = useStore((s) => s.setSplitCat);
  const cancelSplit = useStore((s) => s.cancelSplit);
  const commitSplit = useStore((s) => s.commitSplit);
  const money = useMoney();
  const tr = useT();
  const catLabel = useCategoryLabel();

  const pickerOpen = pickerTxId === t.id;
  const splitOpen = split?.txId === t.id;

  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const [liveDx, setLiveDx] = useState(0);

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dx) > 6 || Math.abs(g.dy) > 6,
      onPanResponderMove: (_e, g) => {
        pan.setValue({ x: g.dx, y: Math.min(0, g.dy) });
        setLiveDx(g.dx);
      },
      onPanResponderRelease: (_e, g) => {
        Animated.timing(pan, { toValue: { x: 0, y: 0 }, duration: 240, useNativeDriver: true }).start();
        setLiveDx(0);
        if (g.dy < -70 && Math.abs(g.dx) < 70) {
          openSplit(t.id, t.guess ?? 'Groceries', 'Household');
        } else if (g.dx > 90) {
          assign(t.id, t.guess ?? 'Groceries');
        } else if (g.dx < -90) {
          openPicker(t.id);
        }
      },
      onPanResponderTerminate: () => {
        Animated.timing(pan, { toValue: { x: 0, y: 0 }, duration: 240, useNativeDriver: true }).start();
        setLiveDx(0);
      },
    })
  ).current;

  return (
    <View style={styles.outer}>
      <View style={styles.bgLabels} pointerEvents="none">
        <Text style={[styles.bgLabel, { color: liveDx > 60 ? colors.white : 'rgba(243,242,242,.32)' }]}>
          {tr('swipe_accept', { category: t.guess ? catLabel(t.guess) : '' })}
        </Text>
        <Text style={[styles.bgLabel, { color: liveDx < -60 ? colors.white : 'rgba(243,242,242,.32)' }]}>
          {tr('swipe_pick')}
        </Text>
      </View>

      <Animated.View
        {...responder.panHandlers}
        style={[styles.card, { transform: pan.getTranslateTransform() }]}
      >
        <View style={styles.headRow}>
          <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
            <Text style={styles.merchant} numberOfLines={1}>
              {t.merchant}
            </Text>
            <Text style={styles.meta}>
              {t.time} · {t.method}
            </Text>
          </View>
          <Text style={styles.amount}>{money(t.amount)}</Text>
        </View>

        <View style={styles.guessRow}>
          <View style={styles.dot} />
          <Text style={styles.guessText}>{tr('swipe_bestGuess', { category: t.guess ? catLabel(t.guess) : '' })}</Text>
          <View style={{ flex: 1 }} />
          <Text style={styles.confidence}>{t.confidence}</Text>
        </View>

        {pickerOpen && (
          <View style={styles.chipsRow}>
            {CATEGORIES.map((c) => (
              <Pressable key={c} style={styles.chip} onPress={() => assign(t.id, c)}>
                <Text style={styles.chipText}>{catLabel(c)}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {splitOpen && split && (
          <View style={styles.splitPanel}>
            <View style={styles.splitHeadRow}>
              <Text style={styles.kickerDark}>{tr('swipe_splitBetweenTwo')}</Text>
              <Text style={styles.hint}>{tr('swipe_dragHandle')}</Text>
            </View>
            <View style={styles.splitLabelsRow}>
              <View style={styles.splitLabel}>
                <View style={[styles.dot, { backgroundColor: colors.ink }]} />
                <Text style={styles.splitLabelText}>
                  {catLabel(split.a)} · {money((t.amount * split.ratio) / 100)}
                </Text>
              </View>
              <View style={styles.splitLabel}>
                <Text style={styles.splitLabelText}>
                  {money((t.amount * (100 - split.ratio)) / 100)} · {catLabel(split.b)}
                </Text>
                <View style={[styles.dot, { backgroundColor: colors.red }]} />
              </View>
            </View>
            <SplitRatioBar ratio={split.ratio} onChange={setSplitRatio} />
            <View style={styles.chipsRow}>
              {CATEGORIES.map((c) => {
                const isA = split.a === c;
                const isB = split.b === c;
                return (
                  <Pressable
                    key={c}
                    onPress={() => setSplitCat(split.picking, c)}
                    style={[
                      styles.splitChip,
                      { borderColor: isA || isB ? colors.ink : 'rgba(32,30,29,.3)', backgroundColor: isA ? colors.ink : isB ? colors.red : colors.white },
                    ]}
                  >
                    <Text style={[styles.splitChipText, { color: isA || isB ? colors.white : colors.ink }]}>{catLabel(c)}</Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.splitBtnRow}>
              <Pressable style={styles.saveBtn} onPress={commitSplit}>
                <Text style={styles.saveBtnText}>{tr('detail_saveSplit')}</Text>
              </Pressable>
              <Pressable style={styles.cancelBtn} onPress={cancelSplit}>
                <Text style={styles.cancelBtnText}>{tr('cancel')}</Text>
              </Pressable>
            </View>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: colors.ink,
  },
  bgLabels: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 13,
  },
  bgLabel: {
    fontFamily: font.extrabold,
    fontSize: 10.5,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: colors.bg,
    borderWidth: 2,
    borderColor: colors.ink,
    padding: 13,
    gap: 11,
    // @ts-ignore -- web-only, prevents drag gestures from triggering text selection
    userSelect: 'none',
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  merchant: {
    fontFamily: font.extrabold,
    fontSize: 16,
    letterSpacing: -0.2,
    color: colors.ink,
  },
  meta: {
    fontFamily: font.regular,
    fontSize: 11,
    color: 'rgba(32,30,29,.55)',
  },
  amount: {
    fontFamily: font.extrabold,
    fontSize: 21,
    color: colors.ink,
  },
  guessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    paddingTop: 9,
  },
  dot: {
    width: 7,
    height: 7,
    backgroundColor: colors.red,
  },
  guessText: {
    fontFamily: font.semibold,
    fontSize: 12,
    color: 'rgba(32,30,29,.75)',
  },
  confidence: {
    fontFamily: font.regular,
    fontSize: 10.5,
    color: 'rgba(32,30,29,.45)',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    paddingTop: 9,
  },
  chip: {
    borderWidth: 1,
    borderColor: 'rgba(32,30,29,.35)',
    backgroundColor: colors.white,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  chipText: {
    fontFamily: font.semibold,
    fontSize: 12,
    color: colors.ink,
  },
  splitPanel: {
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    paddingTop: 11,
    gap: 10,
  },
  splitHeadRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  kickerDark: {
    fontFamily: font.extrabold,
    fontSize: 10.5,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.ink,
  },
  hint: {
    fontFamily: font.regular,
    fontSize: 10.5,
    color: 'rgba(32,30,29,.5)',
  },
  splitLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  splitLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  splitLabelText: {
    fontFamily: font.semibold,
    fontSize: 12,
    color: colors.ink,
  },
  splitChip: {
    borderWidth: 1,
    paddingVertical: 7,
    paddingHorizontal: 9,
  },
  splitChipText: {
    fontFamily: font.semibold,
    fontSize: 11.5,
  },
  splitBtnRow: {
    flexDirection: 'row',
    gap: 7,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: colors.ink,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveBtnText: {
    fontFamily: font.extrabold,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.offWhite,
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: 'rgba(32,30,29,.35)',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  cancelBtnText: {
    fontFamily: font.extrabold,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.ink,
  },
});
