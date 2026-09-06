import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Bill, Cap, Category, DEFAULT_BILLS, DEFAULT_CAPS, IncomingCharge, INCOMING, SEED_TX, Transaction } from '../data/mock';
import { billsTotalFor, cfg, BudgetCfg, Mode } from './selectors';
import { CURRENCIES, CurrencyOption, formatMoney } from '../theme';

interface SplitState {
  txId: number;
  a: Category;
  b: Category;
  ratio: number; // 0-100, share of `a`
  picking: 'a' | 'b';
}

interface SheetState {
  open: boolean;
  pending: IncomingCharge | null;
}

export interface NewTransactionInput {
  merchant: string;
  amount: number;
  cat: Category | null;
  day: number;
  owner: 'me' | 'bia';
  time?: string;
  method?: string;
}

interface StoreState {
  mode: Mode;
  tx: Transaction[];
  nextId: number;
  demoEmpty: boolean;
  filter: string;
  hasGoal: boolean;
  nudges: Record<string, boolean>;
  sheet: SheetState;
  incomingIndex: number;
  pickerTxId: number | null;
  split: SplitState | null;
  onboardingDone: boolean;
  income: { me: number; us: number };
  bills: Bill[];
  caps: Cap[];
  nextBillId: number;
  nextCapId: number;
  currencyCode: string;

  setMode: (mode: Mode) => void;
  setCurrency: (code: string) => void;
  setIncome: (mode: Mode, value: number) => void;
  addBill: (bill: Omit<Bill, 'id'>) => void;
  updateBill: (id: string, patch: Partial<Omit<Bill, 'id'>>) => void;
  removeBill: (id: string) => void;
  addCap: (cap: Omit<Cap, 'id'>) => void;
  updateCap: (id: string, patch: Partial<Omit<Cap, 'id'>>) => void;
  removeCap: (id: string) => void;
  assign: (id: number, cat: Category, splitWith?: Category | null) => void;
  addTransaction: (input: NewTransactionInput) => void;
  updateTransaction: (id: number, patch: Partial<Omit<Transaction, 'id'>>) => void;
  removeTransaction: (id: number) => void;
  openPicker: (id: number | null) => void;
  openSplit: (id: number, a: Category, b: Category) => void;
  setSplitRatio: (ratio: number) => void;
  setSplitCat: (which: 'a' | 'b', cat: Category) => void;
  cancelSplit: () => void;
  commitSplit: () => void;
  toggleJoint: (id: number) => void;
  simulate: () => void;
  filePending: (cat: Category) => void;
  dismissSheet: () => void;
  toggleDemoEmpty: () => void;
  setFilter: (f: string) => void;
  addGoal: () => void;
  removeGoal: () => void;
  toggleNudge: (key: string) => void;
  finishOnboarding: () => void;
  replayOnboarding: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      mode: 'me',
      tx: SEED_TX,
      nextId: 20,
      demoEmpty: false,
      filter: 'All',
      hasGoal: true,
      nudges: { over: true, pile: true, partner: true, halfway: false, recap: false, recurring: false },
      sheet: { open: false, pending: null },
      incomingIndex: 0,
      pickerTxId: null,
      split: null,
      onboardingDone: false,
      income: { me: 12800, us: 21500 },
      bills: DEFAULT_BILLS,
      caps: DEFAULT_CAPS,
      nextBillId: DEFAULT_BILLS.length + 1,
      nextCapId: DEFAULT_CAPS.length + 1,
      currencyCode: 'BRL',

      setMode: (mode) => set({ mode }),
      setCurrency: (code) => set({ currencyCode: code }),
      setIncome: (mode, value) => set((s) => ({ income: { ...s.income, [mode]: Math.max(0, value) } })),

      addBill: (bill) =>
        set((s) => ({ bills: s.bills.concat([{ ...bill, id: `b${s.nextBillId}` }]), nextBillId: s.nextBillId + 1 })),
      updateBill: (id, patch) => set((s) => ({ bills: s.bills.map((b) => (b.id === id ? { ...b, ...patch } : b)) })),
      removeBill: (id) => set((s) => ({ bills: s.bills.filter((b) => b.id !== id) })),

      addCap: (cap) => set((s) => ({ caps: s.caps.concat([{ ...cap, id: `c${s.nextCapId}` }]), nextCapId: s.nextCapId + 1 })),
      updateCap: (id, patch) => set((s) => ({ caps: s.caps.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
      removeCap: (id) => set((s) => ({ caps: s.caps.filter((c) => c.id !== id) })),

      assign: (id, cat, splitWith) =>
        set((s) => ({
          tx: s.tx.map((t) => (t.id === id ? { ...t, cat, splitWith: splitWith ?? null } : t)),
          pickerTxId: s.pickerTxId === id ? null : s.pickerTxId,
          split: s.split && s.split.txId === id ? null : s.split,
        })),

      addTransaction: (input) =>
        set((s) => ({
          tx: s.tx.concat([
            {
              id: s.nextId,
              merchant: input.merchant,
              time: input.time ?? 'now',
              day: input.day,
              method: input.method ?? 'Manual entry',
              amount: input.amount,
              cat: input.cat,
              owner: input.owner,
            },
          ]),
          nextId: s.nextId + 1,
        })),

      updateTransaction: (id, patch) => set((s) => ({ tx: s.tx.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      removeTransaction: (id) => set((s) => ({ tx: s.tx.filter((t) => t.id !== id) })),

      openPicker: (id) => set({ pickerTxId: id }),

      openSplit: (id, a, b) => set({ split: { txId: id, a, b, ratio: 60, picking: 'a' }, pickerTxId: null }),

      setSplitRatio: (ratio) =>
        set((s) => (s.split ? { split: { ...s.split, ratio: Math.max(8, Math.min(92, ratio)) } } : {})),

      setSplitCat: (which, cat) =>
        set((s) => {
          if (!s.split) return {};
          if (which === 'a') return { split: { ...s.split, a: cat, picking: 'b' } };
          return { split: { ...s.split, b: cat, picking: 'a' } };
        }),

      cancelSplit: () => set({ split: null }),

      commitSplit: () => {
        const s = get();
        if (!s.split) return;
        get().assign(s.split.txId, s.split.a, s.split.b);
      },

      toggleJoint: (id) =>
        set((s) => ({ tx: s.tx.map((t) => (t.id === id ? { ...t, joint: !t.joint } : t)) })),

      simulate: () => {
        const i = get().incomingIndex % INCOMING.length;
        set({ sheet: { open: true, pending: INCOMING[i] }, incomingIndex: get().incomingIndex + 1 });
      },

      filePending: (cat) => {
        const s = get();
        const p = s.sheet.pending;
        if (!p) {
          set({ sheet: { open: false, pending: null } });
          return;
        }
        set({
          tx: s.tx.concat([
            { id: s.nextId, merchant: p.merchant, time: 'now', day: 0, method: 'Wallet · card ·· 4417', amount: p.amount, cat, owner: 'me' },
          ]),
          nextId: s.nextId + 1,
          sheet: { open: false, pending: null },
          demoEmpty: false,
        });
      },

      dismissSheet: () => set({ sheet: { open: false, pending: null } }),

      toggleDemoEmpty: () => set((s) => ({ demoEmpty: !s.demoEmpty })),

      setFilter: (f) => set({ filter: f }),

      addGoal: () => set({ hasGoal: true }),
      removeGoal: () => set({ hasGoal: false }),

      toggleNudge: (key) => set((s) => ({ nudges: { ...s.nudges, [key]: !s.nudges[key] } })),

      finishOnboarding: () => set({ onboardingDone: true }),
      replayOnboarding: () => set({ onboardingDone: false }),
    }),
    {
      name: 'tally-store',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      // Don't persist transient UI state (open modals/sheets) — resuming mid-interaction is confusing.
      partialize: (s) => {
        const { sheet, pickerTxId, split, incomingIndex, ...rest } = s;
        return rest;
      },
    }
  )
);

export function useBudgetCfg(): BudgetCfg {
  const mode = useStore((s) => s.mode);
  const income = useStore((s) => s.income[s.mode]);
  const bills = useStore((s) => s.bills);
  return cfg(mode, income, billsTotalFor(bills, mode));
}

export function useCurrency(): CurrencyOption {
  const code = useStore((s) => s.currencyCode);
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}

export function useMoney(): (n: number, dp?: number) => string {
  const currency = useCurrency();
  return (n: number, dp: number = 2) => formatMoney(n, currency, dp);
}
