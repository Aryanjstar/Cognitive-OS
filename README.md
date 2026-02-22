# Cognitive OS

**Infrastructure for Developer Cognition**

An AI-powered operating system that models your mental workload, reduces context-switch overhead, and protects your deep work. Unlike traditional productivity tools that track tasks and time, Cognitive OS tracks cognitive load, context switching, and focus patterns.

## Features

- **Cognitive Load Score** — A live 0-100 metric fusing task complexity, context switches, review burden, and fatigue
- **GitHub Integration** — Automatic sync of repositories, issues, PRs, and commits with complexity scoring
- **AI Context Briefings** — GPT-4.1 powered summaries when you return to a task after time away
- **Focus Timer** — Built-in focus sessions with interruption detection and Pomodoro support
- **Multi-Agent Intelligence** — Focus Agent, Planning Agent, and Interrupt Guard work together to optimize your workflow
- **Cognitive Analytics** — 30-day trends, heatmaps, and pattern recognition across your work

## Tech Stack

- **Framework**: Next.js 15 (App Router, Server Components)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js v4 with GitHub OAuth
- **AI**: Azure OpenAI GPT-4.1
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- GitHub OAuth App (create at https://github.com/settings/developers)
- Azure OpenAI API access

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.local` and fill in your credentials:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cognitive_os"
AUTH_SECRET="your-secret-key-at-least-32-chars"
GITHUB_CLIENT_ID="your-github-oauth-client-id"
GITHUB_CLIENT_SECRET="your-github-oauth-client-secret"
AZURE_OPENAI_ENDPOINT="your-azure-endpoint"
AZURE_OPENAI_API_KEY="your-api-key"
AZURE_OPENAI_CHATGPT_DEPLOYMENT="gpt-4.1"
AZURE_OPENAI_CHATGPT_MODEL="gpt-4.1"
AZURE_OPENAI_API_VERSION="2025-01-01-preview"
```

### 3. Set up database

```bash
# Create the database
createdb cognitive_os

# Push schema to database
npm run db:push

# Generate Prisma client
npm run db:generate

# (Optional) Seed with demo data
npm run db:seed
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
  app/
    (marketing)/     — Landing page, pricing
    (auth)/          — Login page
    (dashboard)/     — Dashboard, tasks, focus, analytics, briefings, settings
    api/             — REST endpoints for auth, GitHub sync, cognitive scoring, AI
  components/
    landing/         — Marketing page components
    dashboard/       — Dashboard widgets and panels
    ui/              — shadcn/ui components
    shared/          — Logo, session provider
  lib/
    auth.ts          — NextAuth configuration
    prisma.ts        — Prisma client singleton
    github.ts        — GitHub sync with Octokit
    cognitive-engine.ts — Cognitive load scoring algorithm
    ai/
      azure-openai.ts      — Azure OpenAI client
      briefing-generator.ts — Context briefing generation
      agents/
        focus-agent.ts      — Monitors overload & fatigue
        planning-agent.ts   — Optimizes task sequencing
        interrupt-guard.ts  — Calculates interruption cost
        orchestrator.ts     — Multi-agent coordinator
```

## Cognitive Load Formula

```
Score = normalize(0-100, {
  taskLoad:     Σ(complexity × priority × base_weight),
  switchPenalty: switches_today × 5,
  reviewLoad:    open_PRs × complexity × 3,
  urgencyStress: overdue_tasks × 8,
  fatigueIndex:  hours_since_break × 2,
  staleness:     avg_task_age_days × 1
})
```

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/auth/*` | GET/POST | NextAuth.js authentication |
| `/api/github/sync` | POST | Sync GitHub repos, issues, PRs, commits |
| `/api/cognitive/score` | GET | Get/refresh cognitive load score |
| `/api/ai/briefing` | POST | Generate AI context briefing |
| `/api/agents/recommend` | POST/PATCH | Run agent orchestrator / dismiss recommendations |

## License

Private — All rights reserved.
