// Design tokens ported from the Claude Design prototype (Tally.dc.html, direction "1a Ledger").
export const colors = {
  bg: '#f3f2f2',
  ink: '#201e1d',
  red: '#ec3013',
  redPress: '#dd2b0f',
  redDark: '#ae1800',
  hairline: 'rgba(32,30,29,.2)',
  hairlineStrong: 'rgba(32,30,29,.4)',
  hairlineFaint: 'rgba(32,30,29,.14)',
  muted: 'rgba(32,30,29,.55)',
  mutedFaint: 'rgba(32,30,29,.45)',
  mutedFainter: 'rgba(32,30,29,.4)',
  track: '#d7d3d3',
  rowPress: '#eae9e9',
  chipRedBg: '#fff2ef',
  white: '#ffffff',
  offWhite: '#f3f2f2',
};

export const font = {
  regular: 'Archivo_400Regular',
  semibold: 'Archivo_600SemiBold',
  extrabold: 'Archivo_800ExtraBold',
};

export const type = {
  kicker: {
    fontFamily: font.extrabold,
    fontSize: 10.5,
    letterSpacing: 1.05,
    textTransform: 'uppercase' as const,
  },
  label: {
    fontFamily: font.semibold,
    fontSize: 13,
  },
  body: {
    fontFamily: font.regular,
    fontSize: 13,
    lineHeight: 19,
  },
  amount: {
    fontFamily: font.extrabold,
    fontVariant: ['tabular-nums'] as const,
  },
};

export const CAT_COLORS: Record<string, string> = {
  Groceries: colors.ink,
  'Eating out': colors.red,
  Transport: 'rgba(32,30,29,.72)',
  Coffee: 'rgba(32,30,29,.55)',
  Household: 'rgba(32,30,29,.4)',
  Bills: 'rgba(32,30,29,.25)',
};

export function money(n: number, dp: number = 2): string {
  const v = n.toLocaleString('pt-BR', { minimumFractionDigits: dp, maximumFractionDigits: dp });
  return `R$ ${v}`;
}
