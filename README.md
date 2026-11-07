# Canopy

Canopy is a premium banking and investing workspace concept for seeing everyday cash clearly and exploring long-term money with confidence. This prototype combines a calm, tropical-inspired visual identity with a useful daily cash overview. All account activity and money movement are simulated locally; the app does not connect to a bank or move real money.

## Requirements

- Node.js 20 or newer
- npm

## Build

```sh
npm install
npm run build
```

## Run locally

```sh
npm run dev
```

Open the local URL printed by the Canopy development server. To serve the production build locally:

```sh
npm run preview
```

## Verify manually

There is no unit test suite. After starting the app, check the following flows:

1. Resize to desktop and mobile widths; verify the dashboard remains readable and the mobile menu opens and closes.
2. Use Hide/Show to mask balances and transaction amounts.
3. Change the cash-flow range and confirm the chart updates.
4. Search recent activity, switch Money in/Money out filters, and clear a no-results state.
5. Send money with a valid recipient and amount; review, edit, and confirm. Confirm invalid, zero, and over-balance amounts cannot proceed and that the new transfer appears in activity with the balance reduced.
6. Open Get paid and copy the displayed demo account details.
7. Open Invest; confirm the five position values sum to the displayed portfolio total and the allocation ring covers 100%.
8. Change the portfolio chart range, search and sort holdings, star/unstar holdings, remove watchlist items, and open both holding and watchlist detail snapshots.

## Product plan

See [PLAN.md](./PLAN.md) for the product vision, architecture, phased roadmap, and implementation status.
