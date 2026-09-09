import React, { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, font } from '../theme';
import { PushedHeader } from '../components/Headers';
import { Btn, Kicker } from '../components/ui';
import { useStore, useT } from '../store/useStore';
import { Key } from '../i18n/translations';
import { OFInstitutionKind } from '../data/openFinance';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Institutions'>;

const KIND_KEYS: Record<OFInstitutionKind, Key> = {
  bank: 'of_kindBank',
  payments: 'of_kindPayments',
  issuer: 'of_kindIssuer',
  broker: 'of_kindBroker',
};

export function InstitutionsScreen({ navigation }: Props) {
  const institutions = useStore((s) => s.institutions);
  const t = useT();
  const [q, setQ] = useState('');
  const list = institutions.filter((i) => i.name.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <PushedHeader kicker={t('of_openFinance')} title={t('of_institutions')} onClose={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <View style={styles.section}>
          <Text style={styles.trustLine}>
            {t('of_trustRegulated')} · {t('of_trustReadOnly')}
          </Text>
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder={t('of_searchInstitution')}
            placeholderTextColor="rgba(32,30,29,.4)"
            style={styles.input}
          />
        </View>

        {list.map((inst) => (
          <Pressable
            key={inst.id}
            onPress={() => navigation.navigate('Consent', { institutionId: inst.id })}
            style={styles.row}
          >
            <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
              <Text style={styles.name}>{inst.name}</Text>
              <Text style={styles.kind}>{t(KIND_KEYS[inst.kind])}</Text>
              <Text style={styles.brings}>{t('of_brings', { a: inst.accountsCount, c: inst.cardsCount })}</Text>
            </View>
            {inst.connected ? (
              <View style={styles.connectedTag}>
                <Text style={styles.connectedTagText}>{t('of_connected')}</Text>
              </View>
            ) : (
              <Text style={styles.arrow}>→</Text>
            )}
          </Pressable>
        ))}

        <View style={{ padding: 20, gap: 12 }}>
          <Kicker>{t('of_trustApi')}</Kicker>
          <Text style={styles.footnote}>
            {t('of_trustNoMoney')} {t('of_manualFallback')}.
          </Text>
          <Btn variant="outline" onPress={() => navigation.navigate('Connections')}>
            {t('of_connections')}
          </Btn>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { padding: 20, gap: 12, borderBottomWidth: 2, borderBottomColor: colors.hairlineStrong },
  trustLine: { fontFamily: font.regular, fontSize: 11.5, color: 'rgba(32,30,29,.5)' },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(32,30,29,.35)',
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontFamily: font.semibold,
    fontSize: 14,
    color: colors.ink,
  },
  row: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(32,30,29,.18)',
    paddingVertical: 13,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  name: { fontFamily: font.extrabold, fontSize: 15, color: colors.ink },
  kind: { fontFamily: font.extrabold, fontSize: 10, letterSpacing: 0.6, textTransform: 'uppercase', color: 'rgba(32,30,29,.6)' },
  brings: { fontFamily: font.regular, fontSize: 11, color: 'rgba(32,30,29,.5)' },
  connectedTag: { backgroundColor: colors.ink, paddingVertical: 5, paddingHorizontal: 8 },
  connectedTagText: { fontFamily: font.extrabold, fontSize: 10, letterSpacing: 0.5, textTransform: 'uppercase', color: colors.offWhite },
  arrow: { fontFamily: font.extrabold, fontSize: 16, color: 'rgba(32,30,29,.35)' },
  footnote: { fontFamily: font.regular, fontSize: 11.5, lineHeight: 17, color: 'rgba(32,30,29,.55)' },
});
