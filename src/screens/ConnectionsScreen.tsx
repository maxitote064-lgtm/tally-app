import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, font } from '../theme';
import { PushedHeader } from '../components/Headers';
import { Btn, Kicker } from '../components/ui';
import { useLang, useMoney, useStore, useT } from '../store/useStore';
import { OF_ACCOUNTS, OF_CARDS, OFAccountKind } from '../data/openFinance';
import { monthShort } from '../i18n/calendar';
import { Key } from '../i18n/translations';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Connections'>;

const ACCT_KIND_KEYS: Record<OFAccountKind, Key> = {
  checking: 'of_acctChecking',
  savings: 'of_acctSavings',
  payment: 'of_acctPayment',
  investment: 'of_acctInvestment',
};

function fmtISO(iso: string, lang: ReturnType<typeof useLang>): string {
  if (!iso) return '';
  const d = new Date(iso + 'T12:00:00');
  return `${d.getDate()} ${monthShort(lang, d.getMonth())} ${d.getFullYear()}`;
}

export function ConnectionsScreen({ navigation }: Props) {
  const institutions = useStore((s) => s.institutions);
  const importReport = useStore((s) => s.importReport);
  const clearImportReport = useStore((s) => s.clearImportReport);
  const syncInstitution = useStore((s) => s.syncInstitution);
  const revokeInstitution = useStore((s) => s.revokeInstitution);
  const t = useT();
  const lang = useLang();
  const money = useMoney();

  const connected = institutions.filter((i) => i.connected);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <PushedHeader kicker={t('of_openFinance')} title={t('of_connections')} onClose={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        {importReport && (
          <View style={styles.importBanner}>
            <Kicker color="rgba(243,242,242,.7)">{t('of_openFinance')}</Kicker>
            <Text style={styles.importText}>
              {t('of_firstLoad', { n: importReport.imported })} — {t('of_waitingCategory', { n: importReport.pending })}
            </Text>
            <Pressable
              style={styles.importCta}
              onPress={() => {
                clearImportReport();
                navigation.navigate('Tabs');
              }}
            >
              <Text style={styles.importCtaText}>{t('of_categorize')}</Text>
            </Pressable>
          </View>
        )}

        {connected.length === 0 ? (
          <View style={{ padding: 20, paddingTop: 30, gap: 12 }}>
            <Text style={styles.emptyTitle}>{t('of_noConnections')}</Text>
            <Text style={styles.emptyNote}>{t('of_noConnectionsNote')}</Text>
            <Btn variant="primary" style={{ alignItems: 'center', marginTop: 8 }} onPress={() => navigation.navigate('Institutions')}>
              {t('of_connect')}
            </Btn>
          </View>
        ) : (
          connected.map((inst) => {
            const accs = OF_ACCOUNTS.filter((a) => a.institutionId === inst.id);
            const crds = OF_CARDS.filter((c) => c.institutionId === inst.id);
            return (
              <View key={inst.id}>
                <View style={styles.instHead}>
                  <Kicker>{inst.name}</Kicker>
                  <Text style={styles.syncedText}>{inst.syncedMinutesAgo === 0 ? t('of_syncedNow') : t('of_syncedAgo', { n: inst.syncedMinutesAgo })}</Text>
                </View>
                {accs.length > 0 && (
                  <View style={styles.subKickerRow}>
                    <Text style={styles.subKicker}>{t('of_accountsLabel')}</Text>
                  </View>
                )}
                {accs.map((a) => (
                  <View key={a.id} style={styles.row}>
                    <Text style={styles.rowLeft}>
                      {t(ACCT_KIND_KEYS[a.kind])} ·· {a.digits}
                    </Text>
                    <Text style={styles.rowRight}>{money(a.balance)}</Text>
                  </View>
                ))}
                {crds.length > 0 && (
                  <View style={styles.subKickerRow}>
                    <Text style={styles.subKicker}>{t('of_cardsLabel')}</Text>
                  </View>
                )}
                {crds.map((c) => (
                  <View key={c.id} style={styles.row}>
                    <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                      <Text style={styles.rowLeft}>
                        {c.name} ·· {c.digits}
                      </Text>
                      <Text style={styles.rowSub}>
                        {t('of_dueDate')} {fmtISO(c.dueDate, lang)}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 2 }}>
                      <Text style={styles.rowRight}>{money(c.openBill)}</Text>
                      <Text style={styles.rowSub}>{t('of_openBill')}</Text>
                    </View>
                  </View>
                ))}
                <Text style={styles.expiresText}>
                  {t('of_consentExpires')} {fmtISO(inst.consentUntil, lang)}
                </Text>
                <View style={styles.btnRow}>
                  <Btn variant="outline" style={{ flex: 1, alignItems: 'center' }} onPress={() => syncInstitution(inst.id)}>
                    {t('of_sync')}
                  </Btn>
                  <Btn variant="outline" style={{ flex: 1, alignItems: 'center' }} onPress={() => revokeInstitution(inst.id)}>
                    {t('of_revoke')}
                  </Btn>
                </View>
                <View style={styles.divider} />
              </View>
            );
          })
        )}

        <View style={{ padding: 20, gap: 12 }}>
          <Btn variant="dark" style={{ alignItems: 'center' }} onPress={() => navigation.navigate('Institutions')}>
            {t('of_addInstitution')}
          </Btn>
          <Text style={styles.footnote}>{t('of_trustNoMoney')}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  importBanner: { backgroundColor: colors.ink, padding: 20, gap: 8 },
  importText: { fontFamily: font.extrabold, fontSize: 15, lineHeight: 20, color: colors.offWhite },
  importCta: { marginTop: 4, backgroundColor: colors.offWhite, paddingVertical: 10, paddingHorizontal: 14, alignSelf: 'flex-start' },
  importCtaText: { fontFamily: font.extrabold, fontSize: 10.5, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.ink },
  emptyTitle: { fontFamily: font.extrabold, fontSize: 18, color: colors.ink },
  emptyNote: { fontFamily: font.regular, fontSize: 13, lineHeight: 19, color: 'rgba(32,30,29,.6)' },
  instHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 10, borderBottomWidth: 2, borderBottomColor: colors.hairlineStrong },
  syncedText: { fontFamily: font.regular, fontSize: 10.5, color: 'rgba(32,30,29,.45)' },
  subKickerRow: { paddingHorizontal: 20, paddingTop: 10 },
  subKicker: { fontFamily: font.extrabold, fontSize: 10, letterSpacing: 0.6, textTransform: 'uppercase', color: 'rgba(32,30,29,.4)' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingHorizontal: 20, paddingVertical: 11, borderTopWidth: 1, borderTopColor: 'rgba(32,30,29,.18)' },
  rowLeft: { fontFamily: font.semibold, fontSize: 13.5, color: colors.ink },
  rowSub: { fontFamily: font.regular, fontSize: 10.5, color: 'rgba(32,30,29,.5)' },
  rowRight: { fontFamily: font.extrabold, fontSize: 13.5, color: colors.ink },
  expiresText: { fontFamily: font.regular, fontSize: 11.5, color: 'rgba(32,30,29,.55)', paddingHorizontal: 20, paddingVertical: 10, borderTopWidth: 1, borderTopColor: 'rgba(32,30,29,.18)' },
  btnRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingVertical: 12, borderTopWidth: 1, borderTopColor: 'rgba(32,30,29,.18)' },
  divider: { height: 2, backgroundColor: colors.hairlineStrong },
  footnote: { fontFamily: font.regular, fontSize: 11.5, lineHeight: 17, color: 'rgba(32,30,29,.5)' },
});
