import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle, StyleProp } from 'react-native';
import { colors, font } from '../theme';

export function Kicker({
  children,
  color = colors.muted,
  style,
}: {
  children: React.ReactNode;
  color?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Text style={[styles.kicker, { color }, style as any]} numberOfLines={1}>
      {children}
    </Text>
  );
}

export function Divider({ strong, style }: { strong?: boolean; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.divider, strong && styles.dividerStrong, style]} />;
}

export function Section({
  children,
  style,
  bottomRule,
  bg,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  bottomRule?: boolean;
  bg?: string;
}) {
  return <View style={[styles.section, bottomRule && styles.sectionRule, bg ? { backgroundColor: bg } : null, style]}>{children}</View>;
}

type BtnVariant = 'primary' | 'outline' | 'dark' | 'plain';

export function Btn({
  children,
  onPress,
  variant = 'outline',
  style,
  textStyle,
  danger,
  disabled,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: BtnVariant;
  style?: StyleProp<ViewStyle>;
  textStyle?: any;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.btn,
        variant === 'primary' && styles.btnPrimary,
        variant === 'dark' && styles.btnDark,
        variant === 'outline' && styles.btnOutline,
        pressed && variant === 'primary' && { backgroundColor: colors.redPress },
        pressed && variant === 'dark' && { backgroundColor: colors.red },
        pressed && variant === 'outline' && { backgroundColor: colors.rowPress },
        disabled && { opacity: 0.4 },
        style,
      ]}
    >
      <Text
        style={[
          styles.btnText,
          variant === 'primary' && { color: colors.white },
          variant === 'dark' && { color: colors.offWhite },
          variant === 'outline' && { color: danger ? colors.redDark : colors.ink },
          textStyle,
        ]}
        numberOfLines={1}
      >
        {children}
      </Text>
    </Pressable>
  );
}

export function Row({
  left,
  right,
  onPress,
  style,
  hover,
}: {
  left: React.ReactNode;
  right?: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  hover?: boolean;
}) {
  const Wrap: any = onPress ? Pressable : View;
  return (
    <Wrap
      onPress={onPress}
      style={({ pressed }: any) => [
        styles.row,
        style,
        pressed && onPress && { backgroundColor: colors.rowPress },
      ]}
    >
      <View style={{ minWidth: 0, flexShrink: 1 }}>{left}</View>
      {right ? <View style={{ flexShrink: 0 }}>{right}</View> : null}
    </Wrap>
  );
}

export function MoneyText({
  value,
  size = 15,
  color = colors.ink,
  style,
}: {
  value: string;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Text style={[{ fontFamily: font.extrabold, fontSize: size, color }, style as any]} numberOfLines={1}>
      {value}
    </Text>
  );
}

const styles = StyleSheet.create({
  kicker: {
    fontFamily: font.extrabold,
    fontSize: 10.5,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: colors.hairline,
  },
  dividerStrong: {
    height: 2,
    backgroundColor: colors.hairlineStrong,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 18,
  },
  sectionRule: {
    borderBottomWidth: 2,
    borderBottomColor: colors.hairlineStrong,
  },
  btn: {
    paddingVertical: 13,
    paddingHorizontal: 14,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  btnPrimary: {
    backgroundColor: colors.red,
  },
  btnDark: {
    backgroundColor: colors.ink,
  },
  btnOutline: {
    borderWidth: 1,
    borderColor: 'rgba(32,30,29,.35)',
  },
  btnText: {
    fontFamily: font.extrabold,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 12,
  },
});
