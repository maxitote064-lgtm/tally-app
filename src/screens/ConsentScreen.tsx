import React, { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, font } from '../theme';
import { PushedHeader } from '../components/Headers';
import { Btn, Kicker } from '../components/ui';
import { useLang, useStore, useT } from '../store/useStore';
import { DEFAULT_SCOPES, LOCKED_SCOPES, SCOPE_IDS, SCOPE_META, ScopeId } from '../data/openFinance';
import { monthShort } from '../i18n/calendar';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Consent'>;

export function ConsentScreen({ route, navigation }: Props) {
  const { institutionId } = route.params;
  const institutions = useStore((s) => s.institutions);
  const setConsentDraft = useStore((s) => s.setConsentDraft);
  const t = useT();
  const lang = useLang();
  const [scopes, setScopes] = useState<ScopeId[]>(DEFAULT_SCOPES);
  const [details, setDetails] = useState(false);

  const inst = institutions.find((i) => i.id === institutionId);
  if (!inst) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <PushedHeader kicker={t('of_openFinance')} title={t('of_consent')} onClose={() => navigation.goBack()} />
      </View>
    );
  }

  const toggle = (id: ScopeId) => {
    if (LOCKED_SCOPES.includes(id)) return;
    setScopes((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : cur.concat(id)));
  };

  const validUntil = new Date();
  validUntil.setFullYear(validUntil.getFullYear() + 1);
  const validLabel = `${validUntil.getDate()} ${monthShort(lang, validUntil.getMonth())} ${validUntil.getFullYear()}`;

  const shown = details ? SCOPE_IDS : SCOPE_IDS.filter((id) => DEFAULT_SCOPES.includes(id));

  const terms: [string, string][] = [
    [t('of_whoReceives'), t('of_whoReceivesValue')],
    [t('of_whoSends'), inst.name],
    [t('of_purpose'), t('of_purposeText')],
    [t('of_validUntil'), `${validLabel} · ${t('of_months12')}`],
    [t('of_moneyMoves'), t('of_no')],
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <PushedHeader kicker={t('of_consent')} title={inst.name} onClose={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <View style={styles.section}>
          <View style={styles.stepRow}>
            <Kicker>{t('of_step1')}</Kicker>
          </View>
          <View style={styles.progressRow}>
            <View style={[styles.progressSeg, { backgroundColor: colors.ink }]} />
            <View style={[styles.progressSeg, { backgroundColor: colors.track }]} />
          </View>
          <Text style={styles.workText}>{t('of_connectionWorkText')}</Text>
        </View>

        <View style={styles.sectionHead}>
          <Kicker>{t('of_dataScope')}</Kicker>
          <Text style={styles.sectionHeadRight}>{t('of_selectedCount', { n: scopes.length, t: SCOPE_IDS.length })}</Text>
        </View>
        {!details && <Text style={styles.recommendedNote}>{t('of_recommended')}</Text>}
        {shown.map((id) => {
          const meta = SCOPE_META[id];
          const locked = LOCKED_SCOPES.includes(id);
          const on = locked || scopes.includes(id);
          return (
            <View key={id} style={styles.scopeRow}>
              <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
                <Text style={styles.scopeName}>
                  {t(meta.name)}
                  {locked ? <Text style={styles.requiredTag}> · {t('of_required')}</Text> : null}
                </Text>
                <Text style={styles.scopeDesc}>{t(meta.desc)}</Text>
              </View>
              <Pressable onPress={() => toggle(id)} style={[styles.track, { backgroundColor: on ? colors.red : colors.track, justifyContent: on ? 'flex-end' : 'flex-start' }]}>
                <View style={[styles.knob, { backgroundColor: on ? colors.white : 'rgba(32,30,29,.55)' }]} />
              </Pressable>
            </View>
          );
        })}
        <Pressable style={styles.detailsBtn} onPress={() => setDetails((d) => !d)}>
          <Text style={styles.detailsBtnText}>{details ? t('of_hideDetails') : t('of_showDetails')}</Text>
        </Pressable>

        <View style={styles.sectionHead}>
          <Kicker>{t('of_terms')}</Kicker>
        </View>
        {terms.map(([k, v]) => (
          <View key={k} style={styles.termRow}>
            <Text style={styles.termKey}>{k}</Text>
            <Text style={styles.termVal}>{v}</Text>
          </View>
        ))}

        <Text style={styles.revokeNote}>{t('of_revokeAnytime')}</Text>

        <View style={{ paddingHorizontal: 20 }}>
          <Btn
            variant="primary"
            style={{ alignItems: 'center' }}
            onPress={() => {
              setConsentDraft({ institutionId: inst.id, scopes: [...LOCKED_SCOPES, ...scopes.filter((s) => !LOCKED_SCOPES.includes(s))] });
              navigation.navigate('Authorization', { institutionId: inst.id });
            }}
          >
            {t('of_continueToBank')}
          </Btn>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { padding: 20, gap: 10, borderBottomWidth: 2, borderBottomColor: colors.hairlineStrong },
  stepRow: { flexDirection: 'row', justifyContent: 'flex-end' },
  progressRow: { flexDirection: 'row', gap: 4 },
  progressSeg: { flex: 1, height: 4 },
  workText: { fontFamily: font.regular, fontSize: 13, lineHeight: 19, color: 'rgba(32,30,29,.7)' },
  sectionHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 8, borderBottomWidth: 2, borderBottomColor: colors.hairlineStrong },
  sectionHeadRight: { fontFamily: font.extrabold, fontSize: 10.5, letterSpacing: 0.6, textTransform: 'uppercase', color: 'rgba(32,30,29,.5)' },
  recommendedNote: { fontFamily: font.semibold, fontSize: 13, color: colors.ink, paddingHorizontal: 20, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(32,30,29,.18)' },
  scopeRow: { borderBottomWidth: 1, borderBottomColor: 'rgba(32,30,29,.18)', paddingVertical: 13, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 12 },
  scopeName: { fontFamily: font.semibold, fontSize: 14, color: colors.ink },
  requiredTag: { fontFamily: font.extrabold, fontSize: 10, letterSpacing: 0.5, textTransform: 'uppercase', color: 'rgba(32,30,29,.45)' },
  scopeDesc: { fontFamily: font.regular, fontSize: 11.5, lineHeight: 16, color: 'rgba(32,30,29,.55)' },
  track: { width: 38, height: 22, padding: 2, flexDirection: 'row', alignItems: 'center' },
  knob: { width: 18, height: 18 },
  detailsBtn: { paddingHorizontal: 20, paddingVertical: 12 },
  detailsBtnText: { fontFamily: font.extrabold, fontSize: 10.5, letterSpacing: 0.6, textTransform: 'uppercase', color: 'rgba(32,30,29,.55)', textDecorationLine: 'underline' },
  termRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, paddingHorizontal: 20, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(32,30,29,.18)' },
  termKey: { fontFamily: font.regular, fontSize: 12.5, color: 'rgba(32,30,29,.55)', flexShrink: 1 },
  termVal: { fontFamily: font.semibold, fontSize: 12.5, color: colors.ink, textAlign: 'right', flexShrink: 1 },
  revokeNote: { fontFamily: font.regular, fontSize: 11.5, lineHeight: 17, color: 'rgba(32,30,29,.55)', padding: 20 },
});
