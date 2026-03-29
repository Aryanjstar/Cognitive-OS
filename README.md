# Cognitive OS

**AI-powered cognitive operating system for software engineers.**

Tracks mental workload, context switching, and focus patterns — then uses multi-agent AI to protect your deep work. Includes a research-grade metrics framework with data from 33 real GitHub developers.

---

## What It Does

| Capability | Description |
|---|---|
| **Cognitive Load Score** | Live 0-100 metric fusing task complexity, context switches, review burden, fatigue, and staleness |
| **Adaptive Scoring** | Weights learn from individual developer patterns; exponential decay blending with historical data |
| **Anomaly Detection** | Z-score based spike detection with severity levels (mild/moderate/severe) |
| **GitHub Integration** | One-click OAuth syncs repos, issues, PRs, commits — calculates complexity scores automatically |
| **AI Context Briefings** | GPT-4.1 generates structured memory-reload briefings when you return to a task |
| **Multi-Agent Intelligence** | Focus Agent, Planning Agent, Interrupt Guard, and Agent Memory Layer work together |
| **Focus Timer** | Built-in Pomodoro/free-form timer with per-session scoring and weekly insights |
| **Cognitive Analytics** | 30-day trends, burnout prediction, best working hours, weekly/monthly summaries |
| **Smart Task Sequencing** | AI reorders your task queue based on complexity, energy state, and time of day |
| **Research Dashboard** | 33 developer comparison, 7 formal metrics, exportable CSV/JSON data for papers |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, Server Components, Server Actions) |
| **Language** | TypeScript (strict mode) |
| **Styling** | Tailwind CSS v4 + shadcn/ui (monochrome B&W theme) |
| **Database** | Azure PostgreSQL Flexible Server (Burstable B1ms, Central India) |
| **ORM** | Prisma 6 |
| **Auth** | NextAuth.js v4 + GitHub OAuth + Prisma Adapter |
| **AI** | Azure OpenAI GPT-4.1 (chat completions for briefings + agent reasoning) |
| **Multi-Agent** | Custom orchestrator with Focus Agent, Planning Agent, Interrupt Guard |
| **Caching** | Redis (primary) + in-memory Map (fallback) via `ioredis` |
| **Logging** | Pino (structured JSON in prod, pretty-print in dev) |
| **Charts** | Recharts (monochrome palette) |
| **Animations** | Framer Motion (parallax scroll, reveal, hover transitions) |
| **Validation** | Zod |
| **Hosting** | Netlify (frontend + serverless functions) |
| **Cloud** | Azure (database, OpenAI, planned: Redis Cache, Container Apps) |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Next.js App                           │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────┐ │
│  │  Landing     │  │  Dashboard  │  │  API Routes          │ │
│  │  (marketing) │  │  (protected)│  │  /api/github/sync    │ │
│  │              │  │             │  │  /api/cognitive/score │ │
│  │  Hero        │  │  Gauge      │  │  /api/ai/briefing    │ │
│  │  Features    │  │  Charts     │  │  /api/agents/recommend│ │
│  │  Pricing     │  │  Tasks      │  │  /api/auth/[...]     │ │
│  └─────────────┘  │  Focus      │  └──────────────────────┘ │
│                    │  Briefings  │                            │
│                    │  Analytics  │                            │
│                    └─────────────┘                            │
├──────────────────────────────────────────────────────────────┤
│                    Services Layer                             │
│  ┌──────────┐  ┌──────────────┐  ┌─────────────────────────┐│
│  │ Cognitive │  │ AI Agents    │  │ GitHub Sync (Octokit)   ││
│  │ Engine    │  │ Orchestrator │  │ - Repos, Issues, PRs    ││
│  │ (scoring) │  │ Focus Agent  │  │ - Complexity scoring    ││
│  │           │  │ Plan Agent   │  │                         ││
│  │           │  │ Guard Agent  │  │                         ││
│  └──────────┘  └──────────────┘  └─────────────────────────┘│
├──────────────────────────────────────────────────────────────┤
│                    Data Layer                                 │
│  ┌──────────────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │ Azure PostgreSQL  │  │  Redis   │  │  Azure OpenAI     │  │
│  │ (Prisma ORM)      │  │ (cache)  │  │  GPT-4.1          │  │
│  └──────────────────┘  └──────────┘  └───────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## Cognitive Load Formula

The Cognitive Load Index (CLI) is calculated from 6 weighted factors with adaptive learning:

```
CLI(t) = α·TaskLoad + β·SwitchPenalty + γ·ReviewLoad + δ·UrgencyStress + ε·FatigueIndex + ζ·Staleness

Base weights: α=0.25, β=0.20, γ=0.15, δ=0.15, ε=0.15, ζ=0.10
Adaptive:     w_adaptive(k) = w_base(k) × (1 + 0.25 × I(k == dominant_factor))
Blending:     CLI_blended = 0.7 × CLI_raw + 0.3 × CLI_historical (half-life = 3 days)
Anomaly:      z = (CLI(t) - μ_recent) / σ_recent → mild(>1.2), moderate(>1.8), severe(>2.5)
```

Levels: **Flow** (0-30) | **Moderate** (30-60) | **Overloaded** (60-100)

### Research Metrics (7 Formulas)

1. **Cognitive Load Index (CLI)** — Weighted 6-factor composite score
2. **Adaptive Weight Learning** — Personalized weights from overload pattern analysis
3. **Historical Blending** — Exponential decay weighting (T_half = 3 days)
4. **Anomaly Detection** — Z-score based cognitive load spike detection
5. **Context Switch Cost** — 23.25min refocus time per switch (Mark et al., 2008)
6. **Burnout Risk Prediction** — 3-factor composite: load + switches + focus deficit
7. **Productivity Gain** — Time saved from interrupt guarding + focus protection

---

## Multi-Agent System

Three specialized AI agents coordinated by a central orchestrator:

| Agent | Trigger | What It Does |
|---|---|---|
| **Focus Agent** | Score > 65 or fatigue high | Analyzes cognitive state, suggests breaks or task deferral |
| **Planning Agent** | Multiple tasks open | Reorders task queue by optimal cognitive sequencing |
| **Interrupt Guard** | New task arrives mid-focus | Calculates context-switch cost, recommends accept/defer/delegate |

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
| `DATABASE_URL` | Yes | PostgreSQL connection string (Azure or local) |
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

---

## Project Structure

```
src/
├── app/
│   ├── (marketing)/        # Landing page (public)
│   ├── (auth)/             # Login page
│   ├── (dashboard)/        # Protected dashboard pages
│   │   ├── dashboard/      # Main cognitive dashboard
│   │   ├── tasks/          # Task management
│   │   ├── focus/          # Focus timer + sessions
│   │   ├── analytics/      # 30-day trends
│   │   ├── briefings/      # AI context briefings
│   │   └── settings/       # Profile + integrations
│   └── api/                # API routes
├── components/
│   ├── landing/            # Marketing page components
│   ├── dashboard/          # Dashboard widgets
│   ├── shared/             # Logo, session provider
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── ai/
│   │   ├── agents/         # Focus, Planning, Interrupt Guard, Agent Memory
│   │   ├── azure-openai.ts # Azure OpenAI client
│   │   └── briefing-generator.ts
│   ├── auth.ts             # NextAuth config
│   ├── cognitive-engine.ts # Adaptive scoring with anomaly detection
│   ├── research-metrics.ts # 7 formal research formulas
│   ├── api-validation.ts   # Zod validation schemas
│   ├── github.ts           # Octokit sync
│   ├── logger.ts           # Pino structured logging
│   ├── prisma.ts           # DB singleton
│   └── redis.ts            # Cache layer
└── types/                  # TypeScript interfaces
```

---

## Azure Infrastructure

| Resource | Service | SKU | Region |
|---|---|---|---|
| `cognitive-os-db` | PostgreSQL Flexible Server | Standard_B1ms (Burstable) | Central India |
| `devtinder` | Azure OpenAI | GPT-4.1 deployment | — |
| `cognitive-os-rg` | Resource Group | — | Central India |

---

## Deployment (Netlify)

The repo is connected to Netlify for continuous deployment. Every push to `main` triggers a build.

**Build settings:**
- Build command: `npm run build`
- Publish directory: `.next`
- Plugin: `@netlify/plugin-nextjs`

**Required env vars on Netlify:** All variables from `.env.example` must be set in Netlify's environment settings.

---

## Demo Flow (for presentations)

1. **Landing Page** → Marketing site with scroll animations, research showcase, and feature breakdown
2. **Research** → `/research` — 33 developer comparison, 7 formulas, exportable data
3. **Demo** → `/demo` — Browse 33 real developer dashboards without sign-up
4. **Sign In** → Click "Get Started" → GitHub OAuth → Redirects to dashboard
5. **Dashboard** → Hero cognitive score with anomaly alerts, task list, agent recommendations
6. **Tasks** → Grouped by category, AI priority scoring, visual categorization
7. **Focus Timer** → Per-session scoring, weekly insights, session analysis
8. **Briefings** → Select a task → Generate AI briefing → Show structured context reload
9. **Analytics** → Burnout prediction, best working hours, weekly/monthly summaries
10. **Settings** → Show GitHub integration status, cognitive load weight configuration

## Research Paper

The `/research` page serves as a living companion to the paper:

- **7 formal formulas** (CLI, adaptive weights, historical blending, anomaly detection, context switch cost, burnout risk, productivity gain)
- **33 real GitHub developers** with verified public data
- **Exportable datasets** (JSON/CSV) at `/api/research/data`
- **Citation references** to DORA, SPACE, DevEx, NASA-TLX, Sweller CLT, Mark et al.

Suitable venues: ICSE, CHI, FSE, ASE, ESEM, IEEE Software, ACM TOSEM

---

## Team Collaboration

- **Branch strategy**: Feature branches off `main`, PR for review
- **Commit format**: `<type>: <description>` (feat, fix, refactor, style, docs, test, chore)
- **No Co-authored-by** lines in commits
- **Environment**: Each developer copies `.env.example` → `.env.local`
- **Database**: Shared Azure PostgreSQL (connection string in `.env.local`)

---

## License

Private — All rights reserved.
