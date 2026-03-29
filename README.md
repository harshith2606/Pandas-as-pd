# FutureYou

FutureYou is a Gen Z-focused personal finance simulator that makes long-term planning feel interactive, visual, and actionable.

It includes:

- profile-based onboarding and plan editing
- present-vs-future lifestyle simulation
- interactive portfolio allocation builder (with persistence)
- standalone progression metrics page with recommended/custom goals
- standalone expense tracker with AI-based savings insights
- simulated market recommendation cards with quick research links

## Tech Stack

- Frontend: React + Vite + Tailwind CSS + Recharts
- Backend: Node.js + Express
- Auth/User data: Supabase
- AI provider (backend endpoints): Gemini API

## Current App Structure

Top-level pages:

- Login
- Onboarding
- Dashboard
- Plan Settings
- Profile
- Expenses
- Progression

## Key Features

### 1. Portfolio + Projection Engine

- investment allocation slider and future projection chart
- portfolio bucket sliders with total cap control
- saved bucket allocations via localStorage

### 2. AI Plan View

- simulated market insight generator based on current allocation mix
- beginner-friendly recommendation explorer by category
- one-click Google research redirect for each recommendation card

### 3. Progression Metrics

- dedicated page for milestone tracking
- recommended goals (income-driven)
- custom goals toggle and editable targets

### 4. Expense Tracker

- dedicated page for categorized expense logging
- expense persistence via localStorage (`genz_expenses`)
- AI expense analysis endpoint for savings opportunities

## Environment Variables

Create/update `.env` at project root.

```env
# Backend
FRONTEND_ORIGIN=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash

# Frontend (Supabase)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Note:

- `.env` is gitignored by default.
- if `GEMINI_API_KEY` is missing, backend AI endpoints will return an error.

## Run Locally

1. Install packages:

```bash
npm install
```

2. Run frontend + backend together:

```bash
npm run dev:full
```

3. Open Vite URL (typically `http://localhost:5173`).

## Available Scripts

```bash
npm run dev        # frontend only
npm run server     # backend only
npm run dev:full   # frontend + backend concurrently
npm run build      # production build
npm run preview    # preview production build
npm run lint       # lint checks
```

## API Endpoints (Backend)

- `GET /api/health`
- `POST /api/plan`
- `POST /api/expense-insights`

## Hackathon Context

Repository: Pandas-as-pd

Submission for Vashist Hackathon 3.0.
