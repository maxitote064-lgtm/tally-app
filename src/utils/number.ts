/**
 * Parses a user-typed amount into a plain number, without assuming a locale.
 * Treats the LAST "." or "," in the string as the decimal point (if any) and
 * strips any earlier ones as thousands grouping — so "42.50", "42,50",
 * "1.234,56" and "1,234.56" all parse correctly regardless of which decimal
 * separator the on-screen numeric keypad happens to show.
 */
export function toNumber(s: string): number {
  const str = s.trim();
  if (!str) return 0;
  const lastSep = Math.max(str.lastIndexOf(','), str.lastIndexOf('.'));
  let cleaned: string;
  if (lastSep === -1) {
    cleaned = str;
  } else {
    const intPart = str.slice(0, lastSep).replace(/[.,]/g, '');
    const fracPart = str.slice(lastSep + 1).replace(/[^0-9]/g, '');
    cleaned = `${intPart}.${fracPart}`;
  }
  cleaned = cleaned.replace(/[^0-9.-]/g, '');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}
