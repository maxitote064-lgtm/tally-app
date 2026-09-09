import { Category } from './mock';
import { Key } from '../i18n/translations';

export type OFInstitutionKind = 'bank' | 'payments' | 'issuer' | 'broker';
export type OFAccountKind = 'checking' | 'savings' | 'payment' | 'investment';
export type ScopeId = 'cadastro' | 'saldos' | 'transacoes' | 'faturas' | 'cartaoTx' | 'credito' | 'investimentos';

export const SCOPE_IDS: ScopeId[] = ['cadastro', 'saldos', 'transacoes', 'faturas', 'cartaoTx', 'credito', 'investimentos'];
export const DEFAULT_SCOPES: ScopeId[] = ['cadastro', 'saldos', 'transacoes', 'faturas', 'cartaoTx'];
export const LOCKED_SCOPES: ScopeId[] = ['cadastro'];

export const SCOPE_META: Record<ScopeId, { name: Key; desc: Key }> = {
  cadastro: { name: 'of_scope_cadastro', desc: 'of_scope_cadastro_desc' },
  saldos: { name: 'of_scope_saldos', desc: 'of_scope_saldos_desc' },
  transacoes: { name: 'of_scope_transacoes', desc: 'of_scope_transacoes_desc' },
  faturas: { name: 'of_scope_faturas', desc: 'of_scope_faturas_desc' },
  cartaoTx: { name: 'of_scope_cartaoTx', desc: 'of_scope_cartaoTx_desc' },
  credito: { name: 'of_scope_credito', desc: 'of_scope_credito_desc' },
  investimentos: { name: 'of_scope_investimentos', desc: 'of_scope_investimentos_desc' },
};

export interface OFInstitution {
  id: string;
  name: string;
  kind: OFInstitutionKind;
  accountsCount: number;
  cardsCount: number;
  connected: boolean;
  syncedMinutesAgo: number;
  consentUntil: string; // ISO date, '' when not connected
  scopes: ScopeId[];
}

export const DEFAULT_INSTITUTIONS: OFInstitution[] = [
  { id: 'meridiano', name: 'Banco Meridiano', kind: 'bank', accountsCount: 2, cardsCount: 2, connected: true, syncedMinutesAgo: 4, consentUntil: '2027-04-18', scopes: DEFAULT_SCOPES },
  { id: 'atlantico', name: 'Banco Atlântico Sul', kind: 'bank', accountsCount: 1, cardsCount: 1, connected: true, syncedMinutesAgo: 19, consentUntil: '2027-02-02', scopes: ['cadastro', 'saldos', 'transacoes'] },
  { id: 'nuven', name: 'Nuven', kind: 'payments', accountsCount: 1, cardsCount: 1, connected: false, syncedMinutesAgo: 0, consentUntil: '', scopes: [] },
  { id: 'colibri', name: 'Colibri Pagamentos', kind: 'payments', accountsCount: 1, cardsCount: 0, connected: false, syncedMinutesAgo: 0, consentUntil: '', scopes: [] },
  { id: 'vitoria', name: 'Cartões Vitória', kind: 'issuer', accountsCount: 0, cardsCount: 2, connected: false, syncedMinutesAgo: 0, consentUntil: '', scopes: [] },
  { id: 'farol', name: 'Corretora Farol', kind: 'broker', accountsCount: 1, cardsCount: 0, connected: false, syncedMinutesAgo: 0, consentUntil: '', scopes: [] },
];

export interface OFAccount {
  id: string;
  institutionId: string;
  kind: OFAccountKind;
  digits: string;
  balance: number;
}

export const OF_ACCOUNTS: OFAccount[] = [
  { id: 'a1', institutionId: 'meridiano', kind: 'checking', digits: '2044', balance: 8412.35 },
  { id: 'a2', institutionId: 'meridiano', kind: 'savings', digits: '2045', balance: 5200 },
  { id: 'a3', institutionId: 'atlantico', kind: 'checking', digits: '7710', balance: 9000 },
  { id: 'a4', institutionId: 'nuven', kind: 'payment', digits: '3391', balance: 1340.2 },
  { id: 'a5', institutionId: 'colibri', kind: 'payment', digits: '5518', balance: 612.4 },
  { id: 'a6', institutionId: 'farol', kind: 'investment', digits: '9002', balance: 41320.77 },
];

export interface OFCard {
  id: string;
  institutionId: string;
  name: string;
  digits: string;
  openBill: number;
  dueDate: string; // ISO
}

export const OF_CARDS: OFCard[] = [
  { id: 'c1', institutionId: 'meridiano', name: 'Meridiano Visa Infinite', digits: '8802', openBill: 2847.9, dueDate: '2026-09-12' },
  { id: 'c2', institutionId: 'meridiano', name: 'Meridiano Black', digits: '4417', openBill: 1180.45, dueDate: '2026-09-15' },
  { id: 'c3', institutionId: 'atlantico', name: 'Atlântico Mais', digits: '6631', openBill: 742.1, dueDate: '2026-09-20' },
  { id: 'c4', institutionId: 'vitoria', name: 'Vitória Gold', digits: '1290', openBill: 388.6, dueDate: '2026-09-22' },
  { id: 'c5', institutionId: 'vitoria', name: 'Vitória Zero', digits: '7745', openBill: 96.4, dueDate: '2026-09-22' },
  { id: 'c6', institutionId: 'nuven', name: 'Nuven Débito+', digits: '2210', openBill: 0, dueDate: '2026-09-25' },
];

export interface ImportTemplateItem {
  merchant: string;
  amount: number;
  day: number; // 0 = today .. 2 = day before, matching the app's fixed 3-day demo window
  guess: Category | null;
  method: string;
  recon?: { approx: number; bank: number };
}

// Charges that "arrive" the moment each not-yet-connected institution is authorized.
// At least one lands on day 0 so it shows up in Today's swipeable "needs a category" band.
export const IMPORT_TEMPLATES: Record<string, ImportTemplateItem[]> = {
  nuven: [{ merchant: '99', amount: 27.3, day: 0, guess: 'Transport', method: 'conta ·· 3391 · Pix' }],
  colibri: [{ merchant: 'Mercado Pago Maquininha', amount: 340, day: 0, guess: null, method: 'conta ·· 5518 · Pix' }],
  vitoria: [
    { merchant: 'Casas Bahia', amount: 274.5, day: 0, guess: 'Household', method: 'crédito ·· 1290 · parcela 5/12' },
    { merchant: 'Livraria Cultura', amount: 132, day: 1, guess: 'Household', method: 'crédito ·· 1290' },
    { merchant: 'Posto Shell', amount: 178.9, day: 0, guess: 'Transport', method: 'crédito ·· 7745', recon: { approx: 150, bank: 178.9 } },
    { merchant: 'Hortifruti', amount: 96.4, day: 1, guess: 'Groceries', method: 'crédito ·· 7745' },
  ],
  farol: [],
};

export interface Installment {
  id: string;
  merchant: string;
  label: string;
  paid: number;
  total: number;
  perMonth: number;
}

export const INSTALLMENTS: Installment[] = [
  { id: 'p1', merchant: 'Notebook', label: 'Fast Shop', paid: 3, total: 10, perMonth: 389.9 },
  { id: 'p2', merchant: 'Geladeira', label: 'Casas Bahia', paid: 5, total: 12, perMonth: 274.5 },
  { id: 'p3', merchant: 'Passagens', label: 'Latam', paid: 2, total: 6, perMonth: 512 },
  { id: 'p4', merchant: 'Óculos', label: 'Óticas Carol', paid: 8, total: 10, perMonth: 129.9 },
  { id: 'p5', merchant: 'Colchão', label: 'Tok&Stok', paid: 1, total: 4, perMonth: 340 },
];
