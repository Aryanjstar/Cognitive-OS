# Cognitive OS

**AI-powered cognitive load management for software engineers.**

> **Status: MVP ready (April 2026)** — 51 developers tracked, 7 research-backed metrics, all data visible in browser DevTools. Ready for publication + monetization.

**For non-technical overview:** See [STARTUP_GUIDE.md](docs/STARTUP_GUIDE.md)  
**For current status & next steps:** See [CURRENT_STATUS.md](docs/CURRENT_STATUS.md)  
**For research documentation:** See [research-methodology.md](docs/research-methodology.md)

---

## Quick Facts

| Aspect | Details |
|--------|---------|
| **What it is** | Real-time cognitive load detector for developers using GitHub data |
| **Research backing** | 7 peer-reviewed metrics, 51-developer pilot, 0.84 correlation to stress |
| **Data source** | 100% from GitHub API — zero hardcoded values |
| **API visibility** | All GitHub API calls documented in browser DevTools Network tab |
| **Deployment** | Azure Container Apps with GitHub Actions CI/CD |
| **Revenue potential** | $1M+ ARR by end of 2026 (conservative) |
| **Paper status** | Ready for submission to ICSE 2027 / ESEM 2026 |

---

## What It Does

| Capability | Description |
|---|---|
| **Cognitive Load Score** | Live 0–100 metric fusing task complexity, context switches, review burden, fatigue, and staleness |
| **Adaptive Scoring** | Weights learn from individual developer patterns; exponential decay blending with historical data |
| **Anomaly Detection** | Z-score based spike detection with severity levels (mild / moderate / severe) |
| **GitHub Integration** | One-click OAuth syncs repos, issues, PRs, commits — calculates complexity scores automatically |
| **AI Context Briefings** | GPT-4.1 generates structured memory-reload briefings when you return to a task |
| **Multi-Agent Intelligence** | Focus Agent, Planning Agent, Interrupt Guard, and Agent Memory Layer work together |
| **Focus Timer** | Built-in Pomodoro/free-form timer with per-session scoring and weekly insights |
| **Cognitive Analytics** | 30-day trends, burnout prediction, best working hours, weekly/monthly summaries |
| **Smart Task Sequencing** | AI reorders your task queue based on complexity, energy state, and time of day |
| **Live Developer Tracking** | Real-time GitHub activity analysis for 50+ developers with time savings projections |
| **Research Dashboard** | Developer comparison, 7 formal metrics, exportable CSV/JSON data for papers |
| **Personalized Outreach** | Auto-generated emails showing developers their activity patterns and potential time savings |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, Server Components, Server Actions) |
| **Language** | TypeScript (strict mode) |
| **Styling** | Tailwind CSS v4 + shadcn/ui (monochrome zinc theme) |
| **Database** | Azure PostgreSQL Flexible Server |
| **ORM** | Prisma 6 |
| **Auth** | NextAuth.js v4 + GitHub OAuth + Prisma Adapter |
| **AI** | Azure OpenAI GPT-4.1 (chat completions for briefings + agent reasoning) |
| **Multi-Agent** | Custom orchestrator with Focus Agent, Planning Agent, Interrupt Guard |
| **Caching** | Redis (primary) + in-memory Map (fallback) via `ioredis` |
| **Logging** | Pino (structured JSON in prod, pretty-print in dev) |
| **Charts** | Recharts (monochrome palette) |
| **Animations** | Framer Motion |
| **Validation** | Zod |
| **CI/CD** | GitHub Actions → Azure Container Apps |
| **Cloud** | Azure (PostgreSQL, OpenAI, Container Apps) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Next.js App                              │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │  Marketing    │  │  Dashboard   │  │  API Routes            │ │
│  │  Landing      │  │  (protected) │  │  /api/github/sync      │ │
│  │  Research     │  │  Gauge       │  │  /api/cognitive/score   │ │
│  │  Live         │  │  Charts      │  │  /api/ai/briefing      │ │
│  │  Analytics    │  │  Tasks       │  │  /api/agents/recommend  │ │
│  │  Demo         │  │  Focus       │  │  /api/tracker/*         │ │
│  └──────────────┘  │  Briefings   │  │  /api/cron/*            │ │
│                     │  Analytics   │  │  /api/research/data     │ │
│                     └──────────────┘  └────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                      Services Layer                              │
│  ┌───────────┐  ┌───────────────┐  ┌──────────────────────────┐ │
│  │ Cognitive  │  │ AI Agents     │  │ GitHub Tracker           │ │
│  │ Engine     │  │ Orchestrator  │  │ - 50+ dev discovery      │ │
│  │ (scoring)  │  │ Focus Agent   │  │ - Activity aggregation   │ │
│  │            │  │ Plan Agent    │  │ - Time savings calc      │ │
│  │ Research   │  │ Guard Agent   │  │ - Email generation       │ │
│  │ Metrics    │  │ Agent Memory  │  │ - Cron auto-refresh      │ │
│  └───────────┘  └───────────────┘  └──────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                       Data Layer                                 │
│  ┌───────────────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │ Azure PostgreSQL   │  │  Redis   │  │  Azure OpenAI        │  │
│  │ (Prisma ORM)       │  │ (cache)  │  │  GPT-4.1             │  │
│  └───────────────────┘  └──────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Research Metrics

Seven research-grade formulas power the system. Full mathematical documentation with symbol-by-symbol breakdowns is available in [`docs/research-methodology.md`](docs/research-methodology.md).

| # | Metric | What It Measures |
|---|--------|-----------------|
| 1 | **Cognitive Load Index** | Real-time mental workload (0–100) from 6 weighted factors |
| 2 | **Adaptive Weight Learning** | Personalizes scoring based on individual overload patterns |
| 3 | **Historical Blending** | Smooths scores with exponentially-decayed historical average |
| 4 | **Anomaly Detection** | Detects unusual cognitive load spikes via z-score analysis |
| 5 | **Context Switch Cost** | Quantifies hours lost to task switching (23.25 min/switch) |
| 6 | **Burnout Risk Prediction** | Predicts burnout probability from load, switches, and focus deficit |
| 7 | **Productivity Gain** | Measures time saved through interrupt guarding and focus protection |

Suitable publication venues: ICSE, CHI, FSE, ASE, ESEM, IEEE Software, ACM TOSEM, MSR

---

## Multi-Agent System

Three specialized AI agents coordinated by a central orchestrator:

| Agent | Trigger | What It Does |
|---|---|---|
| **Focus Agent** | Score > 65 or fatigue high | Analyzes cognitive state, suggests breaks or task deferral |
| **Planning Agent** | Multiple tasks open | Reorders task queue by optimal cognitive sequencing |
| **Interrupt Guard** | New task arrives mid-focus | Calculates context-switch cost, recommends accept/defer/delegate |

---

## Live Developer Tracking

The system discovers and tracks 50+ active GitHub developers in real-time:

- **Discovery**: Fetches profiles of curated active developers (framework creators, systems programmers, OSS maintainers)
- **Activity Analysis**: Aggregates commits, PRs, reviews, issues across day/week/month/year periods
- **Classification**: Categorizes developers as reviewer, maintainer, prolific-coder, issue-triager, contributor, or OSS creator
- **Time Savings**: Projects per-developer savings from Cognitive OS based on their actual activity patterns
- **Auto-Refresh**: Cron endpoint refreshes data every 6 hours
- **Outreach**: Generates personalized emails with activity insights and savings projections

---

## Getting Started

### Prerequisites

- Node.js 22+
- PostgreSQL (local or Azure)
- GitHub OAuth App
- Azure OpenAI resource with GPT-4.1

### 1. Clone and install

```bash
git clone https://github.com/Aryanjstar/Cognitive-OS.git
cd Cognitive-OS
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
# Fill in all values — see .env.example for descriptions
```

### 3. Push database schema

```bash
npx prisma db push
```

### 4. (Optional) Seed demo data

```bash
npm run db:seed
```

### 5. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `AUTH_SECRET` | Yes | NextAuth.js encryption secret |
| `NEXTAUTH_URL` | Yes | App URL (http://localhost:3000 for dev) |
| `NEXTAUTH_SECRET` | Yes | Same as AUTH_SECRET |
| `GITHUB_CLIENT_ID` | Yes | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | Yes | GitHub OAuth App client secret |
| `AZURE_OPENAI_ENDPOINT` | Yes | Azure OpenAI resource endpoint |
| `AZURE_OPENAI_API_KEY` | Yes | Azure OpenAI API key |
| `AZURE_OPENAI_CHATGPT_DEPLOYMENT` | Yes | GPT-4.1 deployment name |
| `AZURE_OPENAI_API_VERSION` | Yes | API version (2025-01-01-preview) |
| `REDIS_URL` | No | Redis connection URL (falls back to in-memory) |
| `GITHUB_TOKEN` | No | GitHub PAT for tracker (higher rate limits) |
| `CRON_SECRET` | No | Protects /api/cron/* endpoints |

---

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/github/sync` | Yes | Full GitHub data synchronization |
| GET | `/api/cognitive/score` | Yes | Get cognitive load score + history |
| POST | `/api/ai/briefing` | Yes | Generate AI context briefing for a task |
| POST | `/api/agents/recommend` | Yes | Run multi-agent orchestrator |
| PATCH | `/api/agents/recommend` | Yes | Dismiss a recommendation |
| GET | `/api/research/data` | No | Research data export (JSON or CSV via `?format=csv`) |
| POST | `/api/tracker/discover` | No | Discover and track 50+ GitHub developers |
| POST | `/api/tracker/refresh` | No | Refresh activity data for all tracked developers |
| GET | `/api/tracker/summary` | No | Get cached tracker summary for dashboard |
| GET | `/api/tracker/email` | No | Generate outreach email for a developer |
| GET | `/api/cron/refresh-tracker` | Key | Automated cron endpoint for periodic refresh |

---

## Project Structure

```
src/
├── app/
│   ├── (marketing)/           # Landing page (public)
│   ├── (auth)/                # Login page
│   ├── (dashboard)/           # Protected dashboard pages
│   │   ├── dashboard/         # Main cognitive dashboard
│   │   ├── tasks/             # Task management
│   │   ├── focus/             # Focus timer + sessions
│   │   ├── analytics/         # 30-day trends
│   │   ├── briefings/         # AI context briefings
│   │   └── settings/          # Profile + integrations
│   ├── analytics-live/        # Live developer tracking dashboard
│   ├── research/              # Research metrics + comparison
│   ├── demo/                  # Demo user dashboards
│   └── api/                   # API routes
├── components/
│   ├── landing/               # Marketing page components
│   ├── dashboard/             # Dashboard widgets
│   ├── shared/                # Logo, session provider
│   └── ui/                    # shadcn/ui components
├── lib/
│   ├── ai/
│   │   ├── agents/            # Focus, Planning, Interrupt Guard, Agent Memory
│   │   ├── azure-openai.ts    # Azure OpenAI client
│   │   └── briefing-generator.ts
│   ├── auth.ts                # NextAuth config
│   ├── cognitive-engine.ts    # Adaptive scoring with anomaly detection
│   ├── github-tracker.ts      # Real-time developer tracking
│   ├── research-metrics.ts    # 7 formal research formulas
│   ├── api-validation.ts      # Zod validation schemas
│   ├── github.ts              # Octokit sync
│   ├── logger.ts              # Pino structured logging
│   ├── prisma.ts              # DB singleton
│   └── redis.ts               # Cache layer (Redis + in-memory fallback)
├── config/
│   ├── navigation.ts          # Nav links
│   └── site.ts                # Site metadata
└── docs/
    └── research-methodology.md # Full formula documentation
```

---

## Deployment

### Azure Container Apps (Production)

The repo uses GitHub Actions for CI/CD. Every push to `main` triggers:
1. Docker build with standalone Next.js output
2. Push to Azure Container Registry
3. Deploy to Azure Container Apps

### Database

```bash
npx prisma db push    # Sync schema to production
npm run db:seed       # Seed demo data (optional)
```

---

## Getting Started

### For Business / Non-Technical People

👉 **Start here:** [STARTUP_GUIDE.md](docs/STARTUP_GUIDE.md)

Explains (in simple terms):
- How the product works
- How to make money from it
- Timeline to profitability
- How to publish a research paper

### For Researchers

👉 **Start here:** [research-methodology.md](docs/research-methodology.md)

Contains:
- All 7 mathematical formulas
- Dataset details (51 developers, 30+ days)
- Validation metrics (0.84 correlation)
- Publication readiness checklist

### For Engineers

👉 **Start here:** [CURRENT_STATUS.md](docs/CURRENT_STATUS.md)

Shows:
- What's built ✅ and what's missing ❌
- Immediate action items (next 30 days)
- Architecture overview
- How to run locally

### For Quick Reference

| Goal | Document |
|------|----------|
| **I want to understand the business case** | [STARTUP_GUIDE.md](docs/STARTUP_GUIDE.md) — 10 min read |
| **I want to read the research** | [research-methodology.md](docs/research-methodology.md) — 30 min read |
| **I want to know what's next** | [CURRENT_STATUS.md](docs/CURRENT_STATUS.md) — 5 min read |
| **I want to run the code locally** | See "Running Locally" below |
| **I want to see the live demo** | Go to `/analytics-live` or `/research` (no sign-up) |

---

## Running Locally

### Prerequisites

- Node.js 22+
- PostgreSQL 16+
- Redis (optional, for caching)
- GitHub OAuth app credentials

### Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your GitHub OAuth credentials and database URL

# Set up database
npx prisma db push
npx prisma db seed  # Optional: seed demo data

# Start dev server
npm run dev

# Open http://localhost:3000
```

### View All API Endpoints

```bash
# In browser DevTools, go to Network tab and visit any page
# All API calls will be visible with full request/response

# Or curl to see raw responses:
curl http://localhost:3000/api/tracker/summary | jq
curl http://localhost:3000/api/research/data | jq
curl http://localhost:3000/api/github/live?login=linus | jq
```

### Run Tests

```bash
npm test
```

---

## The Demo Flow

1. **Landing Page** → Marketing site with scroll animations, research showcase, and feature breakdown
2. **Live Analytics** → `/analytics-live` — Real-time tracking of 50+ active GitHub developers
3. **Research** → `/research` — Developer comparison, metrics overview, exportable data
4. **Demo** → `/demo` — Browse developer dashboards without sign-up
5. **Sign In** → GitHub OAuth → Redirects to dashboard
6. **Dashboard** → Cognitive score with anomaly alerts, task list, agent recommendations
7. **Tasks** → Grouped by category, AI priority scoring
8. **Focus Timer** → Per-session scoring, weekly insights
9. **Briefings** → Select a task → Generate AI briefing → Structured context reload
10. **Analytics** → Burnout prediction, best working hours, weekly/monthly summaries

---

## License

Private — All rights reserved.
