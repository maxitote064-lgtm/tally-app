import { Category, Transaction } from '../data/mock';

export type Mode = 'me' | 'us';

export function cfg(mode: Mode) {
  return mode === 'us'
    ? { income: 21500, bills: 8172.3, label: 'Household', who: 'Household income' }
    : { income: 12800, bills: 4156.15, label: 'Personal', who: 'Your monthly income' };
}

export function visibleTx(tx: Transaction[], mode: Mode, demoEmpty: boolean): Transaction[] {
  const list = mode === 'us' ? tx : tx.filter((t) => t.owner === 'me');
  return demoEmpty ? list.filter((t) => t.day !== 0) : list;
}

export function todayTx(tx: Transaction[], mode: Mode, demoEmpty: boolean): Transaction[] {
  return visibleTx(tx, mode, demoEmpty).filter((t) => t.day === 0);
}

export function spentToday(tx: Transaction[], mode: Mode, demoEmpty: boolean): number {
  return todayTx(tx, mode, demoEmpty).reduce((a, t) => a + t.amount, 0);
}

export function monthBase(mode: Mode): number {
  return mode === 'us' ? 6400 : 3200;
}

export function monthSpent(tx: Transaction[], mode: Mode, demoEmpty: boolean): number {
  return monthBase(mode) + visibleTx(tx, mode, demoEmpty).reduce((a, t) => a + t.amount, 0);
}

export function spentBeforeToday(tx: Transaction[], mode: Mode, demoEmpty: boolean): number {
  return monthSpent(tx, mode, demoEmpty) - spentToday(tx, mode, demoEmpty);
}

export function remainder(tx: Transaction[], mode: Mode, demoEmpty: boolean): number {
  const c = cfg(mode);
  return Math.max(120, c.income - c.bills - spentBeforeToday(tx, mode, demoEmpty));
}

export function allowance(tx: Transaction[], mode: Mode, demoEmpty: boolean): number {
  return Math.max(20, Math.round(remainder(tx, mode, demoEmpty) / 6));
}

export function catMeta(t: Transaction): { label: string; color: 'need' | 'set' } {
  if (!t.cat) return { label: 'Needs a category', color: 'need' };
  if (t.splitWith) return { label: `${t.cat} + ${t.splitWith}`, color: 'set' };
  return { label: t.cat, color: 'set' };
}

export const FILTERS = ['All', 'Unfiled', 'Eating out', 'Groceries', 'Joint'] as const;
export type Filter = (typeof FILTERS)[number];

export function filterTx(tx: Transaction[], mode: Mode, demoEmpty: boolean, filter: Filter): Transaction[] {
  return visibleTx(tx, mode, demoEmpty).filter((t) => {
    if (filter === 'All') return true;
    if (filter === 'Unfiled') return !t.cat;
    if (filter === 'Joint') return !!t.joint;
    return t.cat === (filter as Category);
  });
}
