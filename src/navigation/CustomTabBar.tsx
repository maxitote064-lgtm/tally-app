import React from 'react';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font } from '../theme';

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(10, insets.bottom) }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = (options.title ?? route.name) as string;
        const focused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={[styles.tab, focused && styles.tabActive]}
          >
            <Text style={[styles.label, { color: focused ? colors.ink : 'rgba(32,30,29,.45)' }]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    borderTopWidth: 2,
    borderTopColor: colors.hairlineStrong,
    backgroundColor: colors.bg,
  },
  tab: {
    flex: 1,
    alignItems: 'flex-start',
    paddingTop: 13,
    paddingBottom: 11,
    paddingLeft: 14,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.red,
  },
  label: {
    fontFamily: font.extrabold,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
