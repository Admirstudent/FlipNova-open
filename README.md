# FlipNova — Full-Stack Micro-SaaS

An eBay market intelligence platform built with a React/TypeScript frontend, Express/MongoDB backend, and a Python FastAPI statistical processor — wired with Stripe subscriptions and Clerk authentication.

## Architecture

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Vite + React   │────▶│  Express + Node   │────▶│  FastAPI/Numpy   │
│   TypeScript     │     │  Mongoose + Atlas │     │  Pricing Engine  │
│   shadcn/ui      │     │  Port 4500        │     │  Port 8000       │
│   Vercel         │     │  Heroku           │     │  Heroku          │
└──────────────────┘     └──────────────────┘     └──────────────────┘
```

## Tech Stack

**Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS 4, shadcn/ui, Recharts, Clerk, React Router 7  
**Backend**: Express 5, Mongoose 9, MongoDB Atlas, Stripe, Helmet, express-rate-limit  
**Processor**: FastAPI, NumPy, Uvicorn (IQR outlier filtering, confidence scoring)  
**Deployment**: Vercel (frontend), Heroku (backend + processor), GitHub Actions (CI)

## Features

- **User Authentication** — Clerk with Sign-in/Sign-up modals, user profiles, protected routes
- **Subscription Billing** — Stripe Checkout, webhook-based lifecycle management, cancel-at-period-end, idempotency guards
- **eBay Browse API Integration** — OAuth application token caching, sandbox/production environment switching
- **Statistical Market Analysis** — IQR-based outlier suppression, median/P25/P75 computation, confidence scoring
- **Market Intelligence Signals** — Competition level, price volatility, market saturation derived from active listing data
- **Dark Mode** — Full light/dark theme via CSS custom properties and Tailwind
- **Rate Limiting & Security** — Helmet, CORS, rate limiting (300 req/15min), webhook signature verification (Svix/Stripe)
- **Registration Capacity System** — MongoDB atomic counters prevent oversubscription of free/paid tiers

## Project Structure

```saas/
├── src/                         # Frontend (React + TypeScript)
│   ├── components/              # Reusable UI components (shadcn/ui based)
│   │   ├── ui/                  # Button, Badge, Card, Input primitives
│   │   ├── SnapshotModal.tsx    # Full-detail market snapshot modal
│   │   └── RecentSearches.tsx   # Search history with bookmarking
│   ├── pages/                   # Route-level pages
│   │   ├── LandingPage.tsx      # Public landing with Clerk auth
│   │   ├── MarketSnapshotPage.tsx  # Input panel + live results
│   │   ├── UserDashboard.tsx    # Stats cards, histogram, search history
│   │   └── PricingPage.tsx      # Free/Pro plan comparison + Stripe checkout
│   ├── services/                # API layer (axios)
│   ├── types/                   # TypeScript interfaces
│   └── lib/                     # Utilities (transformSnapshot, cn helper)
├── servers/                     # Backend (Express, CommonJS)
│   ├── config/                  # Env-based configuration (MongoDB, eBay, Stripe, Clerk)
│   ├── controllers/             # Route handlers (analyze, payment, dashboard, webhooks)
│   ├── models/                  # Mongoose schemas (UserProfile, AnalysisRecord, Usage)
│   ├── services/                # Business logic (eBay OAuth, registration counters)
│   ├── middleware/              # Helmet, CORS, rate limiting, JSON parsing
│   ├── routes/                  # Express route definitions
│   └── processor/               # Python FastAPI microservice
│       └── processor-server.py  # NumPy statistics engine (218 lines)
└── .env.example                 # Environment variable template
```

## Key Engineering Decisions

**Stripe Webhook Idempotency**: The Stripe checkout webhook checks Clerk metadata before upgrading — prevents double-processing on webhook retries.

**Clerk ↔ Stripe Sync**: Subscription status is mirrored to Clerk `publicMetadata` so the frontend reads auth state without an extra API call.

**MongoDB Atomic Counters**: `findOneAndUpdate` with `$lt` conditions prevents race conditions in the registration capacity system (250 free users, 50 paid).

**Graceful API Degradation**: eBay service wraps all external calls with error handling — the platform degrades to empty results instead of crashing.

**Processor Decoupling**: The statistics engine runs as a separate FastAPI service — can scale independently, be swapped for a different implementation, or run locally in development.

## Getting Started

```bash
# 1. Install frontend + backend deps
npm install

# 2. Install Python processor deps
cd servers/processor && pip install -r requirements.txt && cd ../..

# 3. Configure environment
cp .env.example .env
# Fill in MONGO_URI, EBAY_CLIENT_ID, EBAY_CLIENT_SECRET, STRIPE keys, CLERK keys

# 4. Start processor (terminal 1)
python servers/processor/processor-server.py

# 5. Start backend (terminal 2)
node servers/server.cjs

# 6. Start frontend (terminal 3)
npm run dev
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | Yes | MongoDB Atlas connection string |
| `EBAY_CLIENT_ID` | Yes | eBay Developer App ID (sandbox or production) |
| `EBAY_CLIENT_SECRET` | Yes | eBay Developer Cert ID |
| `EBAY_ENVIRONMENT` | No | `sandbox` (default) or `production` |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signing secret |
| `STRIPE_PRO_PRICE_ID` | Yes | Stripe price ID for Pro subscription |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key |
| `CLERK_WEBHOOK_SECRET` | Yes | Clerk Svix webhook signing secret |
| `VITE_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key (frontend) |
| `CLIENT_URL` | Yes | Frontend URL for Stripe redirect |
| `PROCESSOR_URL` | No | FastAPI processor URL (default: `http://localhost:8000`) |
| `PORT` | No | Express port (default: 4000) |

## License

MIT