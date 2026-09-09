export type Category = 'Groceries' | 'Eating out' | 'Transport' | 'Coffee' | 'Household' | 'Bills';

export const CATEGORIES: Category[] = ['Groceries', 'Eating out', 'Transport', 'Coffee', 'Household', 'Bills'];

export interface Transaction {
  id: number;
  merchant: string;
  time: string;
  day: number; // 0 = today, 1 = yesterday, 2 = day before
  method: string;
  amount: number;
  cat: Category | null;
  guess?: Category;
  confidence?: string;
  owner: 'me' | 'bia';
  joint?: boolean;
  splitWith?: Category | null;
}

export const SEED_TX: Transaction[] = [
  { id: 1, merchant: 'Café Suplicy', time: '08:12', day: 0, method: 'Wallet · card ·· 4417', amount: 14.5, cat: 'Coffee', owner: 'me' },
  { id: 2, merchant: 'Metrô SP', time: '08:38', day: 0, method: 'Wallet · card ·· 4417', amount: 5.2, cat: 'Transport', owner: 'me' },
  { id: 3, merchant: 'Assaí Atacadista', time: '12:05', day: 0, method: 'Wallet · card ·· 4417', amount: 172.9, cat: null, guess: 'Groceries', confidence: '92% match', owner: 'me', joint: true },
  { id: 4, merchant: 'Temakeria Makis', time: '13:15', day: 0, method: 'Wallet · card ·· 0392', amount: 96.4, cat: 'Eating out', owner: 'me' },
  { id: 5, merchant: 'Drogasil', time: '18:02', day: 0, method: 'Wallet · card ·· 4417', amount: 43.8, cat: null, guess: 'Household', confidence: '74% match', owner: 'me' },
  { id: 6, merchant: 'Supermercado Zona Sul', time: '17:40', day: 0, method: 'Wallet · card ·· 7719', amount: 248.6, cat: 'Groceries', owner: 'bia', joint: true },
  { id: 7, merchant: 'Padaria Bella Paulista', time: '09:02', day: 1, method: 'Wallet · card ·· 4417', amount: 31.2, cat: 'Coffee', owner: 'me' },
  { id: 8, merchant: '99 · viagem', time: '22:41', day: 1, method: 'Wallet · card ·· 4417', amount: 27.9, cat: 'Transport', owner: 'me' },
  { id: 9, merchant: 'Enel SP', time: '06:00', day: 1, method: 'Autopay · card ·· 4417', amount: 412.3, cat: 'Bills', owner: 'me', joint: true },
  { id: 10, merchant: 'Coffee Lab', time: '11:20', day: 1, method: 'Wallet · card ·· 7719', amount: 68.5, cat: 'Eating out', owner: 'bia' },
  { id: 11, merchant: 'Assaí Atacadista', time: '18:55', day: 2, method: 'Wallet · card ·· 4417', amount: 196.4, cat: 'Groceries', owner: 'me', joint: true },
  { id: 12, merchant: 'Metrô SP', time: '08:31', day: 2, method: 'Wallet · card ·· 4417', amount: 5.2, cat: 'Transport', owner: 'me' },
  { id: 13, merchant: 'Restaurante Maní', time: '20:10', day: 2, method: 'Wallet · card ·· 0392', amount: 386, cat: 'Eating out', owner: 'me', joint: true },
];

export interface IncomingCharge {
  merchant: string;
  location: string;
  amount: number;
  guess: Category;
}

export const INCOMING: IncomingCharge[] = [
  { merchant: 'Café Suplicy', location: 'Rua Augusta · terminal 04', amount: 16.5, guess: 'Coffee' },
  { merchant: 'Assaí Atacadista', location: 'Av. Rebouças · terminal 11', amount: 189.4, guess: 'Groceries' },
  { merchant: 'Metrô SP', location: 'catraca Paulista', amount: 5.2, guess: 'Transport' },
  { merchant: 'Temakeria Makis', location: 'Pinheiros · terminal 02', amount: 112.8, guess: 'Eating out' },
];

export const RECURRING = [
  { name: 'Spotify Família', note: 'monthly · 6th · unchanged 14 months', amount: 34.9 },
  { name: 'Smart Fit', note: 'monthly · 1st · up R$ 10 in June', amount: 129.9 },
  { name: 'iCloud 2TB', note: 'monthly · 22nd', amount: 49.9 },
];

export interface Bill {
  id: string;
  name: string;
  personalAmount: number;
  householdAmount: number;
  due: string;
  urgent?: boolean;
}

export const DEFAULT_BILLS: Bill[] = [
  { id: 'b1', name: 'Aluguel', personalAmount: 2700, householdAmount: 5400, due: 'paid · 1 Aug' },
  { id: 'b2', name: 'Condomínio', personalAmount: 740, householdAmount: 1480, due: 'paid · 5 Aug' },
  { id: 'b3', name: 'Enel SP', personalAmount: 206.15, householdAmount: 412.3, due: 'hit yesterday · counted on the day', urgent: true },
  { id: 'b4', name: 'Celular + internet', personalAmount: 130, householdAmount: 260, due: 'due 28 Aug' },
  { id: 'b5', name: 'Seguro', personalAmount: 380, householdAmount: 620, due: 'due 1 Sep' },
];

export interface Cap {
  id: string;
  name: string;
  used: number;
  cap: number;
}

export const DEFAULT_CAPS: Cap[] = [
  { id: 'c1', name: 'Eating out', used: 1980, cap: 2200 },
  { id: 'c2', name: 'Groceries', used: 1840, cap: 2500 },
  { id: 'c3', name: 'Coffee', used: 420, cap: 540 },
  { id: 'c4', name: 'Transport', used: 560, cap: 950 },
];

export const SWEEPS = [
  { day: 'Tue 25 Aug', note: 'came in under by', amount: 68.4, positive: true },
  { day: 'Mon 24 Aug', note: 'over — nothing swept', amount: 0, positive: false },
  { day: 'Sun 23 Aug', note: 'came in under by', amount: 112.3, positive: true },
  { day: 'Sat 22 Aug', note: 'came in under by', amount: 38.9, positive: true },
];

export const NUDGE_DEFS = [
  { key: 'over', name: 'Went over today', desc: 'One push at the moment the day tips past its allowance.', def: true },
  { key: 'pile', name: 'Unfiled charges piling up', desc: 'Sent once three or more charges are waiting on a category.', def: true },
  { key: 'partner', name: 'Bia filed a joint charge', desc: 'So the joint number never moves without you knowing why.', def: true },
  { key: 'halfway', name: 'Halfway through today', desc: 'Off — most people find the midday ping nagging.', def: false },
  { key: 'recap', name: 'Weekly recap, Sunday evening', desc: 'Off.', def: false },
  { key: 'recurring', name: 'New recurring charge detected', desc: 'Off — surfaces in Insights instead.', def: false },
] as const;

export const NUDGE_LOG = [
  { kicker: 'Over today', when: 'Sun 20:14', body: 'R$ 42,00 past Sunday’s allowance. Tomorrow absorbs it — nothing to do.', warn: true },
  { kicker: '3 unfiled', when: 'Sat 18:02', body: 'Three charges are waiting on a category. Filing takes about ten seconds.', warn: false },
  { kicker: 'Bia · joint', when: 'Fri 17:41', body: 'Bia filed R$ 261,00 at Zona Sul as a joint grocery charge.', warn: false },
];

export const CARDS = [
  { name: 'Card ·· 4417', meta: 'primary · tap-to-pay', state: 'Linked', highlight: false },
  { name: 'Card ·· 0392', meta: 'secondary', state: 'Linked', highlight: false },
  { name: 'Card ·· 8802', meta: 'payoff target · charges ignored', state: 'Goal only', highlight: true },
];
