# Cognitive OS

**AI-powered cognitive operating system for software engineers.**

Tracks mental workload, context switching, and focus patterns — then uses multi-agent AI to protect your deep work.

---

## What It Does

| Capability | Description |
|---|---|
| **Cognitive Load Score** | Live 0-100 metric fusing task complexity, context switches, review burden, fatigue, and staleness |
| **GitHub Integration** | One-click OAuth syncs repos, issues, PRs, commits — calculates complexity scores automatically |
| **AI Context Briefings** | GPT-4.1 generates structured memory-reload briefings when you return to a task |
| **Multi-Agent Intelligence** | Focus Agent, Planning Agent, and Interrupt Guard work together to protect flow state |
| **Focus Timer** | Built-in Pomodoro/free-form timer with interruption detection and deep work tracking |
| **Cognitive Analytics** | 30-day trends, daily breakdowns, context switch cost analysis, heatmaps |
| **Smart Task Sequencing** | AI reorders your task queue based on complexity, energy state, and time of day |

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

The score is calculated from 6 weighted factors, normalized to 0-100:

```
Score = Σ (factor × weight) / Σ weights × 100

Factors:
  taskLoad       (w=0.25) — open issues × complexity + open PRs × complexity
  switchPenalty   (w=0.20) — context switches today × 23min recovery cost
  reviewLoad     (w=0.15) — pending PR reviews × (additions + deletions)
  urgencyStress  (w=0.15) — high-priority issues / total issues ratio
  fatigueIndex   (w=0.15) — hours since first focus session today
  staleness      (w=0.10) — issues untouched >7 days / total issues
```

Levels: **Flow** (0-40) | **Moderate** (40-70) | **Overloaded** (70-100)

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
│   │   ├── agents/         # Focus, Planning, Interrupt Guard agents
│   │   ├── azure-openai.ts # Azure OpenAI client
│   │   └── briefing-generator.ts
│   ├── auth.ts             # NextAuth config
│   ├── cognitive-engine.ts # Scoring algorithm
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

1. **Landing Page** → Show the marketing site with scroll animations, parallax effects, and feature breakdown
2. **Sign In** → Click "Get Started" → GitHub OAuth → Redirects to dashboard
3. **Dashboard** → Cognitive Load Gauge (real-time score), task list, context switch timeline, agent recommendations
4. **Tasks** → Search, filter, sort by complexity — all synced from GitHub
5. **Focus Timer** → Start a Pomodoro session, show interruption tracking
6. **Briefings** → Select a task → Generate AI briefing → Show structured context reload
7. **Analytics** → 30-day cognitive trends, focus minutes, context switch patterns
8. **Settings** → Show GitHub integration status, cognitive load weight configuration

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
