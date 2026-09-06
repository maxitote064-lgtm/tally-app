import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, font } from '../theme';
import { PushedHeader } from '../components/Headers';
import { Kicker } from '../components/ui';
import { useStore } from '../store/useStore';
import { NUDGE_DEFS, NUDGE_LOG } from '../data/mock';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

export function NotificationsScreen({ navigation }: Props) {
  const nudges = useStore((s) => s.nudges);
  const toggleNudge = useStore((s) => s.toggleNudge);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <PushedHeader kicker="Nudges" title="Notifications" onClose={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ paddingBottom: 26 }}>
        <View style={styles.section}>
          <Kicker>What gets a push</Kicker>
          <View style={{ marginTop: 4 }}>
            {NUDGE_DEFS.map((n) => {
              const on = nudges[n.key];
              return (
                <Pressable key={n.key} onPress={() => toggleNudge(n.key)} style={styles.row}>
                  <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
                    <Text style={styles.name}>{n.name}</Text>
                    <Text style={styles.desc}>{n.desc}</Text>
                  </View>
                  <View style={[styles.track, { backgroundColor: on ? colors.red : colors.track, justifyContent: on ? 'flex-end' : 'flex-start' }]}>
                    <View style={[styles.knob, { backgroundColor: on ? colors.white : 'rgba(32,30,29,.55)' }]} />
                  </View>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.footnote}>Everything else stays silent — the charge simply appears in Today, unfiled.</Text>
        </View>

        <View style={[styles.section, { borderBottomWidth: 0 }]}>
          <Kicker>Recent</Kicker>
          <View style={{ gap: 11, marginTop: 11 }}>
            {NUDGE_LOG.map((l) => (
              <View key={l.kicker + l.when} style={[styles.logCard, { backgroundColor: l.warn ? '#fff2ef' : 'transparent' }]}>
                <View style={styles.logHead}>
                  <Text style={[styles.logKicker, { color: l.warn ? colors.redDark : colors.ink }]}>{l.kicker}</Text>
                  <Text style={styles.logWhen}>{l.when}</Text>
                </View>
                <Text style={styles.logBody}>{l.body}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { padding: 20, borderBottomWidth: 2, borderBottomColor: colors.hairlineStrong },
  row: { borderTopWidth: 1, borderTopColor: 'rgba(32,30,29,.18)', paddingVertical: 13, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  name: { fontFamily: font.semibold, fontSize: 13.5, color: colors.ink },
  desc: { fontFamily: font.regular, fontSize: 11.5, lineHeight: 16, color: 'rgba(32,30,29,.5)' },
  track: { width: 38, height: 22, padding: 2, flexDirection: 'row', alignItems: 'center' },
  knob: { width: 18, height: 18 },
  footnote: { fontFamily: font.regular, fontSize: 11.5, lineHeight: 17, color: 'rgba(32,30,29,.5)', marginTop: 8 },
  logCard: { borderWidth: 2, borderColor: colors.ink, padding: 12, gap: 6 },
  logHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 },
  logKicker: { fontFamily: font.extrabold, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase' },
  logWhen: { fontFamily: font.regular, fontSize: 10.5, color: 'rgba(32,30,29,.45)' },
  logBody: { fontFamily: font.semibold, fontSize: 13.5, lineHeight: 19, color: colors.ink },
});
