import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, font } from '../theme';
import { PushedHeader } from '../components/Headers';
import { Kicker } from '../components/ui';
import { useStore, useLang, useMoney, useT } from '../store/useStore';
import { NUDGE_DEFS, NUDGE_LOG } from '../data/mock';
import { weekdayShort } from '../i18n/calendar';
import { Key } from '../i18n/translations';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

const LOG_WD = [0, 6, 5];
const LOG_TIME = ['20:14', '18:02', '17:41'];
const LOG_KEYS: { kicker: Key; body: Key }[] = [
  { kicker: 'notif_log_overToday_kicker', body: 'notif_log_overToday_body' },
  { kicker: 'notif_log_unfiled_kicker', body: 'notif_log_unfiled_body' },
  { kicker: 'notif_log_partner_kicker', body: 'notif_log_partner_body' },
];
const LOG_AMOUNTS = [42, 0, 261];

export function NotificationsScreen({ navigation }: Props) {
  const nudges = useStore((s) => s.nudges);
  const toggleNudge = useStore((s) => s.toggleNudge);
  const t = useT();
  const lang = useLang();
  const money = useMoney();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <PushedHeader kicker={t('notif_kicker')} title={t('notif_title')} onClose={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ paddingBottom: 26 }}>
        <View style={styles.section}>
          <Kicker>{t('notif_whatGetsPush')}</Kicker>
          <View style={{ marginTop: 4 }}>
            {NUDGE_DEFS.map((n) => {
              const on = nudges[n.key];
              return (
                <Pressable key={n.key} onPress={() => toggleNudge(n.key)} style={styles.row}>
                  <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
                    <Text style={styles.name}>{t(`notif_${n.key}_name` as Key)}</Text>
                    <Text style={styles.desc}>{t(`notif_${n.key}_desc` as Key)}</Text>
                  </View>
                  <View style={[styles.track, { backgroundColor: on ? colors.red : colors.track, justifyContent: on ? 'flex-end' : 'flex-start' }]}>
                    <View style={[styles.knob, { backgroundColor: on ? colors.white : 'rgba(32,30,29,.55)' }]} />
                  </View>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.footnote}>{t('notif_silentFootnote')}</Text>
        </View>

        <View style={[styles.section, { borderBottomWidth: 0 }]}>
          <Kicker>{t('notif_recent')}</Kicker>
          <View style={{ gap: 11, marginTop: 11 }}>
            {NUDGE_LOG.map((l, i) => (
              <View key={l.kicker + l.when} style={[styles.logCard, { backgroundColor: l.warn ? '#fff2ef' : 'transparent' }]}>
                <View style={styles.logHead}>
                  <Text style={[styles.logKicker, { color: l.warn ? colors.redDark : colors.ink }]}>{t(LOG_KEYS[i].kicker)}</Text>
                  <Text style={styles.logWhen}>
                    {weekdayShort(lang, LOG_WD[i])} {LOG_TIME[i]}
                  </Text>
                </View>
                <Text style={styles.logBody}>{t(LOG_KEYS[i].body, { amount: money(LOG_AMOUNTS[i] ?? 0) })}</Text>
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
