# 🚀 Dumb Idea Exchange (DEX)

> **"The venture capital stock exchange for startup ideas that should have stayed in the shower."**

Dumb Idea Exchange is a satirical, interactive fintech and paper-trading web application where absurd, hilarious, and bizarre startup concepts are traded like publicly listed stocks. 

---

## ✨ Features

- 📈 **Real-Time (Fake) Stock Market**: Track stock prices, market caps, 24h volume, gainers/losers, candlestick/line charts, and live ticker updates for absurd startups.
- ⚔️ **Pitch Battles**: Vote on head-to-head matchups between competing terrible ideas and watch their valuations shift in real-time.
- 🤖 **Startup Generator**: Instant generator for hilarious, buzzword-filled startup pitches with auto-calculated valuation and ticker symbols.
- 💼 **Virtual Portfolio & Paper Trading**: Start with **$100,000** in mock VC funding to buy, sell, and manage shares of high-volatility dumb ideas.
- 🏆 **Dumb Idea League**: Track top investors, view market movers, and check out the Wall of Shame for bankrupt concepts.
- 📝 **Submit Your Dumb Idea (IPO)**: Pitch your own questionable business model and launch an IPO on the exchange.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Client Components)
- **Library**: [React 19](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 📁 Project Structure

```
my-website/
├── src/
│   ├── app/                # Next.js App Router routes
│   │   ├── battle/         # Head-to-head pitch battle page
│   │   ├── ideas/[id]/     # Startup pitch detail & trading page
│   │   ├── league/         # Leaderboards, Wall of Shame & Rankings
│   │   ├── matches/        # Active matches & voting arena
│   │   ├── play/           # Interactive mini-game & generator
│   │   ├── portfolio/      # User portfolio, P&L, and transaction log
│   │   ├── stock/[ticker]/ # Dedicated stock ticker overview
│   │   └── submit/         # Launch an IPO (submit new idea)
│   ├── components/         # Reusable UI components & charts
│   ├── context/            # AppContext state management & market simulation
│   └── data/               # Mock startup datasets & market news
└── public/                 # Static assets
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have **Node.js** (v18.0.0 or higher) and `npm` installed.

### Installation

1. Clone the repository and navigate into the project directory:
   ```bash
   cd my-website
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to start trading!

---

## 📜 Available Scripts

- `npm run dev` – Runs the app in development mode with HMR.
- `npm run build` – Builds the production bundle.
- `npm run start` – Starts the Next.js production server.
- `npm run lint` – Runs ESLint check across the codebase.

