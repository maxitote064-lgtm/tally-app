import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, font } from '../theme';
import { Kicker } from '../components/ui';
import { useStore, useT } from '../store/useStore';
import { DEFAULT_SCOPES, LOCKED_SCOPES, SCOPE_META } from '../data/openFinance';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Authorization'>;

export function AuthorizationScreen({ route, navigation }: Props) {
  const { institutionId } = route.params;
  const institutions = useStore((s) => s.institutions);
  const consentDraft = useStore((s) => s.consentDraft);
  const setConsentDraft = useStore((s) => s.setConsentDraft);
  const connectInstitution = useStore((s) => s.connectInstitution);
  const t = useT();

  const inst = institutions.find((i) => i.id === institutionId);
  if (!inst) return null;

  const scopes = consentDraft && consentDraft.institutionId === institutionId ? consentDraft.scopes : [...LOCKED_SCOPES, ...DEFAULT_SCOPES.filter((s) => !LOCKED_SCOPES.includes(s))];

  return (
    <View style={{ flex: 1, backgroundColor: colors.ink }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.header}>
          <View style={styles.headRow}>
            <Kicker color="rgba(243,242,242,.7)">{t('of_bankTakeover')}</Kicker>
            <Kicker color="rgba(243,242,242,.7)">{t('of_step2')}</Kicker>
          </View>
          <View style={styles.progressRow}>
            <View style={[styles.progressSeg, { backgroundColor: colors.offWhite }]} />
            <View style={[styles.progressSeg, { backgroundColor: 'rgba(243,242,242,.3)' }]} />
          </View>
          <Text style={styles.title}>{inst.name}</Text>
          <Text style={styles.note}>{t('of_bankTakeoverNote')}</Text>
        </View>

        <View style={styles.scopesHead}>
          <Kicker color="rgba(243,242,242,.6)">{t('of_scopesRequested')}</Kicker>
        </View>
        <View style={styles.hairline} />
        {scopes.map((id) => (
          <View key={id} style={styles.scopeRow}>
            <Text style={styles.scopeName}>{t(SCOPE_META[id].name)}</Text>
          </View>
        ))}
        <View style={styles.hairline} />

        <View style={styles.footer}>
          <Pressable
            style={styles.authorizeBtn}
            onPress={() => {
              connectInstitution(inst.id, scopes);
              setConsentDraft(null);
              navigation.reset({ index: 1, routes: [{ name: 'Tabs' }, { name: 'Connections' }] });
            }}
          >
            <Text style={styles.authorizeBtnText}>{t('of_authorize')}</Text>
          </Pressable>
          <Pressable
            style={styles.declineBtn}
            onPress={() => {
              setConsentDraft(null);
              navigation.navigate('Institutions');
            }}
          >
            <Text style={styles.declineBtnText}>{t('of_dontAuthorize')}</Text>
          </Pressable>
          <Text style={styles.trustLine}>{t('of_trustRegulated')}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 26, paddingBottom: 16 },
  headRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  progressRow: { flexDirection: 'row', gap: 4, marginTop: 12 },
  progressSeg: { flex: 1, height: 4 },
  title: { fontFamily: font.extrabold, fontSize: 30, letterSpacing: -0.4, lineHeight: 32, color: colors.offWhite, marginTop: 22 },
  note: { fontFamily: font.regular, fontSize: 14, lineHeight: 20, color: 'rgba(243,242,242,.8)', marginTop: 12, maxWidth: 320 },
  scopesHead: { paddingHorizontal: 20, paddingBottom: 8 },
  hairline: { height: 1, backgroundColor: 'rgba(243,242,242,.3)' },
  scopeRow: { paddingHorizontal: 20, paddingVertical: 13, borderTopWidth: 1, borderTopColor: 'rgba(243,242,242,.15)' },
  scopeName: { fontFamily: font.semibold, fontSize: 14, color: colors.offWhite },
  footer: { marginTop: 'auto', paddingHorizontal: 20, paddingTop: 24, paddingBottom: 32, gap: 8 },
  authorizeBtn: { backgroundColor: colors.offWhite, paddingVertical: 15, alignItems: 'center' },
  authorizeBtnText: { fontFamily: font.extrabold, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.ink },
  declineBtn: { borderWidth: 2, borderColor: colors.offWhite, paddingVertical: 15, alignItems: 'center' },
  declineBtnText: { fontFamily: font.extrabold, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.offWhite },
  trustLine: { fontFamily: font.extrabold, fontSize: 10, letterSpacing: 0.6, textTransform: 'uppercase', color: 'rgba(243,242,242,.5)', textAlign: 'center', marginTop: 8 },
});
