import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font } from '../theme';
import { Mode } from '../store/selectors';

export function RootHeader({
  kicker,
  title,
  mode,
  onSetMode,
  onSettings,
}: {
  kicker: string;
  title: string;
  mode: Mode;
  onSetMode: (m: Mode) => void;
  onSettings: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 10 }]}>
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <Text style={styles.kicker} numberOfLines={1}>
          {kicker}
        </Text>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>
      <View style={styles.controls}>
        <View style={styles.segment}>
          <Pressable
            onPress={() => onSetMode('me')}
            style={[styles.segmentBtn, mode === 'me' && styles.segmentBtnOn]}
          >
            <Text style={[styles.segmentText, mode === 'me' && styles.segmentTextOn]}>Me</Text>
          </Pressable>
          <Pressable
            onPress={() => onSetMode('us')}
            style={[styles.segmentBtn, styles.segmentBtnBorder, mode === 'us' && styles.segmentBtnOn]}
          >
            <Text style={[styles.segmentText, mode === 'us' && styles.segmentTextOn]}>Us</Text>
          </Pressable>
        </View>
        <Pressable onPress={onSettings} style={styles.gear}>
          <View style={styles.gearBar} />
          <View style={styles.gearBar} />
          <View style={styles.gearBar} />
        </Pressable>
      </View>
    </View>
  );
}

export function PushedHeader({
  kicker,
  title,
  onClose,
  closeLabel = 'Close',
}: {
  kicker: string;
  title: string;
  onClose: () => void;
  closeLabel?: string;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, styles.pushedWrap, { paddingTop: insets.top + 10 }]}>
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <Text style={styles.kickerMuted} numberOfLines={1}>
          {kicker}
        </Text>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>
      <Pressable onPress={onClose} style={styles.closeBtn}>
        <Text style={styles.closeText}>{closeLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: colors.hairlineStrong,
    backgroundColor: colors.bg,
  },
  pushedWrap: {
    borderBottomColor: colors.ink,
  },
  kicker: {
    fontFamily: font.extrabold,
    fontSize: 10.5,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.red,
  },
  kickerMuted: {
    fontFamily: font.extrabold,
    fontSize: 10.5,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.mutedFainter,
  },
  title: {
    fontFamily: font.extrabold,
    fontSize: 17,
    letterSpacing: -0.2,
    color: colors.ink,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 7,
    flexShrink: 0,
  },
  segment: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.ink,
  },
  segmentBtn: {
    paddingVertical: 7,
    paddingHorizontal: 9,
    justifyContent: 'center',
  },
  segmentBtnBorder: {
    borderLeftWidth: 1,
    borderLeftColor: colors.ink,
  },
  segmentBtnOn: {
    backgroundColor: colors.ink,
  },
  segmentText: {
    fontFamily: font.extrabold,
    fontSize: 10.5,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.ink,
  },
  segmentTextOn: {
    color: colors.offWhite,
  },
  gear: {
    width: 32,
    borderWidth: 1,
    borderColor: 'rgba(32,30,29,.35)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  gearBar: {
    width: 14,
    height: 2,
    backgroundColor: 'rgba(32,30,29,.7)',
  },
  closeBtn: {
    borderWidth: 1,
    borderColor: 'rgba(32,30,29,.35)',
    paddingVertical: 8,
    paddingHorizontal: 11,
  },
  closeText: {
    fontFamily: font.extrabold,
    fontSize: 10.5,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.ink,
  },
});
