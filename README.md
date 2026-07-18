# adjacent

**Your Monad DeFi copilot** — connect or paste any wallet, discover its DeFi positions across the Monad ecosystem, understand the risk in plain English, act on it in-app, and see what's happening across the ecosystem.

Built for the first **BuildAnything "Spark"** hackathon: something practical that solves a real problem — _DeFi is confusing_. adjacent turns a wallet into a clear, explained picture and lets you act without leaving the app.

---

## Table of contents

- [What it does](#what-it-does)
- [How it works](#how-it-works)
- [Supported protocols](#supported-protocols)
- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Running the app](#running-the-app)
- [API reference](#api-reference)
- [Roadmap](#roadmap)

---

## What it does

- **Position discovery** — paste any Monad address (or connect a wallet) and adjacent finds its positions across every supported protocol in one view. No "which protocols do you use?" — it just checks.
- **Real USD valuation** — each position is priced on-chain via the Pyth pull oracle.
- **Real, position-specific risk** — not textbook numbers: the impermanent-loss curve is computed from _your_ concentrated-liquidity range, and risk levels (🟢 safe / 🟡 watch / 🔴 danger) reflect range status and proximity to the band edge.
- **Plain-English explanations** — an "Explain this" on every position streams a grounded summary. The numbers are always computed in code; the LLM only phrases them (Groq free tier, with a deterministic template fallback that always works).
- **Act in-app (write)** — stake **MON → shMON** directly from a connected wallet, with a live preview of shMON received and a gas-aware amount.
- **Campaigns** — a curated feed of competitions, incentives, and quests running on Monad protocols.

## How it works

```
             wallet address (typed or connected)
                          │
                          ▼
              Position Discovery (parallel)
        ┌─────────────────┴─────────────────┐
        ▼                                    ▼
   shMONAD client                     Uniswap v3 client
  (ERC-4626 vault)                 (NFT positions + range)
        └─────────────────┬─────────────────┘
                          ▼
              Unified `Position` model
        ┌────────────┬────────────┬───────────┐
        ▼            ▼            ▼            ▼
   Pyth pricing   Risk + IL    Explain      Portfolio UI
   (USD values)   engine       (Groq +
                               template)
```

- **Discovery** is just calling the known protocol clients in parallel (`Promise.allSettled`) — one protocol failing never fails the whole portfolio; it's surfaced under `errors`.
- **Pricing**: token → USD via Pyth `getPriceUnsafe`. shMON → MON uses the vault's own `convertToAssets`, then MON → USD via Pyth.
- **Risk/IL**: concentrated-liquidity IL is computed analytically from the position's range + current price, and attached to each LP position.
- **Explain**: `POST /explain` checks a Mongo cache → Groq → deterministic template. Numbers are never invented.
- **Stake**: shMON is a native-MON ERC-4626 vault, so staking is a payable `deposit(assets, receiver)` with `value = assets` (no approval).

## Supported protocols

| Protocol               | What                                             | Status                             |
| ---------------------- | ------------------------------------------------ | ---------------------------------- |
| **shMONAD** (FastLane) | Liquid staking (shMON, ERC-4626 over native MON) | ✅ Read + **stake** write          |
| **Uniswap v3**         | Concentrated-liquidity LP positions              | ✅ Read (amounts, fees, range, IL) |
| **Pyth**               | Price oracle                                     | ✅ USD pricing                     |

## Architecture

A **pnpm-workspace monorepo** with three packages:

- **`web/`** — Next.js frontend (portfolio, campaigns, wallet, stake).
- **`api/`** — NestJS backend: centralizes on-chain reads (viem + Multicall3), pricing, the explain layer, campaigns, and MongoDB.
- **`shared/`** — framework-agnostic TypeScript: the unified `Position`/`Campaign` models, verified Monad addresses + ABIs, and pure math (impermanent loss, ERC-4626, Pyth scaling). Consumed by both `web` and `api`.

## Tech stack

**Frontend** — Next.js 16 (App Router, Turbopack, React 19), TypeScript, Tailwind CSS v4, shadcn/ui (base-vega + Base UI), TanStack Query, **Reown AppKit + wagmi v2 + viem** (external wallets only), custom SVG sparklines.

**Backend** — NestJS 11, MongoDB via Mongoose, **viem** (server-side reads, Multicall3 batching), **@uniswap/v3-sdk**, **Pyth** pull oracle, **groq-sdk**, Swagger/OpenAPI, class-validator, Throttler.

**Shared** — pure TypeScript, zero runtime deps.

## Project structure

```
adjacent/
├─ web/                      Next.js frontend
│  └─ src/
│     ├─ app/
│     │  ├─ page.tsx              portfolio (home)
│     │  ├─ campaigns/            campaigns list
│     │  │  └─ admin/             role-guarded campaign creator
│     │  ├─ layout.tsx            root layout (fonts, providers, header)
│     │  └─ globals.css           theme tokens (dark, pickems-inspired)
│     ├─ components/              cards, badges, IL curve, stake panel, connect…
│     ├─ config/                  wagmi adapter (Monad chain)
│     ├─ context/                 AppKit provider
│     └─ lib/                     api client, formatting, contracts
├─ api/                      NestJS backend
│  └─ src/
│     ├─ chain/                   viem public client (Monad + Multicall3)
│     ├─ pricing/                 Pyth pricing service
│     ├─ protocols/               ProtocolClient interface + shMONAD + Uniswap v3
│     ├─ positions/               GET /positions/:address
│     ├─ explain/                 POST /explain (Groq + template + Mongo cache)
│     ├─ campaigns/               GET/POST /campaigns (+ admin guard)
│     └─ common/                  pipes, guards
└─ shared/                   @adjacent/shared (types, addresses, ABIs, math)
```

## Getting started

### Prerequisites

- **Node 20+** and **pnpm** (`npm i -g pnpm`)
- **Foundry** (`cast`/`forge`) — optional, handy for on-chain checks
- A **MongoDB** database — local (Docker) or a free MongoDB Atlas cluster
- Free keys: a **Reown project ID** (dashboard.reown.com) and a **Groq API key** (console.groq.com)

### Install

```bash
git clone <repo> adjacent && cd adjacent
pnpm install
pnpm approve-builds
pnpm build:shared
```

## Environment variables

**`api/.env`**

| Variable        | Required | Description                                                         |
| --------------- | -------- | ------------------------------------------------------------------- |
| `MONGODB_URI`   | ✅       | MongoDB connection string                                           |
| `MONAD_RPC_URL` | ✅       | Monad **mainnet** RPC (e.g. `https://rpc.monad.xyz`)                |
| `GROQ_API_KEY`  | –        | Enables LLM explanations; without it, the template fallback is used |
| `GROQ_MODEL`    | –        | Defaults to `llama-3.3-70b-versatile`                               |
| `PORT`          | –        | API port (default `5040`)                                           |

**`web/.env.local`**

| Variable                    | Required | Description                                                    |
| --------------------------- | -------- | -------------------------------------------------------------- |
| `NEXT_PUBLIC_PROJECT_ID`    | ✅       | Reown/WalletConnect project ID (wallet modal)                  |
| `NEXT_PUBLIC_API_URL`       | ✅       | API base URL (e.g. `http://localhost:5040`)                    |
| `NEXT_PUBLIC_MONAD_RPC_URL` | –        | Overrides the client RPC (defaults to `https://rpc.monad.xyz`) |

## Running the app

```bash
# terminal 1 — API (http://localhost:5040, Swagger at /docs)
cd api && ./node_modules/.bin/nest start        # or: pnpm dev:api

# terminal 2 — web (http://localhost:3000)
cd web && ./node_modules/.bin/next dev           # or: pnpm dev:web
```

Then open **http://localhost:3000**, paste a wallet (or use a demo below), and explore. To stake, **Connect** a wallet holding mainnet MON — your address auto-loads and a "Stake MON → shMON" panel appears.

## API reference

Interactive docs at **`http://localhost:5040/docs`** (OpenAPI JSON at `/docs-json`).

| Method | Endpoint              | Auth          | Description                                                                      |
| ------ | --------------------- | ------------- | -------------------------------------------------------------------------------- |
| `GET`  | `/positions/:address` | –             | Discover & value all positions for an address → `Portfolio`                      |
| `POST` | `/explain`            | –             | Body: a `Position`. Returns `{ text, source }` (`groq` \| `template` \| `cache`) |
| `GET`  | `/campaigns`          | –             | List campaigns; `?status=live\|upcoming\|ended`, `?protocol=kuru`                |
| `POST` | `/campaigns`          | `x-admin-key` | Create a campaign (admin only)                                                   |

Example:

```bash
# discover a whale's positions
curl http://localhost:5040/positions/0xcbF323be43eF0f3A92eCBC0980f427cBa45f0866
```

## Roadmap

- Uniswap **v4** support (via an NFT-ownership API / Envio indexer)
- **Kuru** positions
- A **"what changed?"** timeline (historical snapshots via an indexer)
- Campaign **personalization** (highlight campaigns for protocols you already use) and real on-chain entry
- Transaction previews / simulation before signing

---

_adjacent — see every position, understand every risk._
