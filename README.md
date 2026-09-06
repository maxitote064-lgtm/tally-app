# Tally

A React Native (Expo) implementation of the "Tally" mobile finance app design
(Claude Design prototype `Tally.dc.html`, direction "1a Ledger").

This build covers the original core scope: onboarding, the Today / Activity /
Insights tabs, transaction detail, budget & allowance, debt-payoff goals,
notifications, and settings. The later Open Finance Brasil flow (institution
picker, consent, bank handoff, Contas tab, PT/EN toggle) from the design
bundle is out of scope for this pass.

## Run it

```bash
npm install
npm run start   # then press i / a / w, or scan the QR code with Expo Go
npm run web     # or go straight to the web preview
```

## Structure

- `src/theme.ts` — colors, typography, money formatting
- `src/data/mock.ts` — seed data (transactions, categories, onboarding copy, bills, etc.)
- `src/store/` — Zustand store + derived-value selectors (mirrors the prototype's budget/allowance math)
- `src/navigation/` — bottom tabs (custom-styled) + root stack
- `src/components/` — shared UI atoms, the swipeable transaction card, the split-ratio drag bar, the post-payment sheet
- `src/screens/` — one file per screen

## Notable interactions

- Uncategorized cards on **Today**: swipe right to accept the guessed category, left to open the category picker, up to open a two-way split with a draggable ratio handle.
- **Me / Us** header toggle swaps every number between personal and household figures.
- **Simulate a tap** (Today, empty state or footer) fires the post-payment confirmation sheet.
- **Settings → Replay onboarding** re-runs the 5-step setup flow.
