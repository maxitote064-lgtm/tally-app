import { create } from 'zustand';
import { Category, IncomingCharge, INCOMING, SEED_TX, Transaction } from '../data/mock';
import { Mode } from './selectors';

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

  setMode: (mode: Mode) => void;
  assign: (id: number, cat: Category, splitWith?: Category | null) => void;
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

export const useStore = create<StoreState>((set, get) => ({
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

  setMode: (mode) => set({ mode }),

  assign: (id, cat, splitWith) =>
    set((s) => ({
      tx: s.tx.map((t) => (t.id === id ? { ...t, cat, splitWith: splitWith ?? null } : t)),
      pickerTxId: s.pickerTxId === id ? null : s.pickerTxId,
      split: s.split && s.split.txId === id ? null : s.split,
    })),

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
}));
