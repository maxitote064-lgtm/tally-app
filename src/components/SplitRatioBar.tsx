import React, { useRef, useState } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';
import { colors } from '../theme';

export function SplitRatioBar({ ratio, onChange }: { ratio: number; onChange: (pct: number) => void }) {
  const viewRef = useRef<View>(null);
  const layout = useRef({ x: 0, width: 1 });
  const [, force] = useState(0);

  function measure() {
    viewRef.current?.measure((_fx, _fy, width, _h, pageX) => {
      layout.current = { x: pageX, width: width || 1 };
      force((n) => n + 1);
    });
  }

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const pct = ((e.nativeEvent.pageX - layout.current.x) / layout.current.width) * 100;
        onChange(Math.round(pct));
      },
      onPanResponderMove: (e) => {
        const pct = ((e.nativeEvent.pageX - layout.current.x) / layout.current.width) * 100;
        onChange(Math.round(pct));
      },
    })
  ).current;

  return (
    <View
      ref={viewRef}
      onLayout={measure}
      {...responder.panHandlers}
      style={styles.track}
    >
      <View style={[styles.fill, { width: `${ratio}%` }]} />
      <View style={[styles.handle, { left: `${ratio}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 26,
    backgroundColor: colors.red,
    overflow: 'visible',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.ink,
  },
  handle: {
    position: 'absolute',
    top: -3,
    bottom: -3,
    width: 4,
    marginLeft: -2,
    backgroundColor: colors.bg,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.ink,
  },
});
