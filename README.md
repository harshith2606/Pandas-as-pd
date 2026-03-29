# FutureYou

FutureYou is a Gen Z-first personal finance app that helps users understand how today’s spending and investing decisions shape their long-term life outcomes.

## Problem Statement

Retirement Blindness Among Gen Z
Students often struggle to plan for retirement due to its distant and abstract nature, 
leading them to prioritize immediate financial needs and lifestyle goals instead. Limited 
financial literacy and awareness further contribute to this issue, making it difficult for 
Gen Z to understand the importance of early investing and long-term financial planning. As 
a result, retirement planning is often delayed or ignored altogether.

This lack of early action can have serious long-term consequences, including insufficient 
savings and financial insecurity in later life. The gap between awareness and action 
highlights the need for solutions that make retirement planning more engaging, relatable, 
and accessible, helping young individuals build consistent financial habits and ensure a 
more secure future.

## Solution Overview

FutureYou provides an end-to-end flow:

1. User onboarding and profile setup
2. Present vs Future simulation with portfolio allocation controls
3. AI-generated financial plan and trend calls
4. AI-assisted expense analysis with savings opportunities
5. Progression milestones with recommended and custom goals

### Core Features

- authentication and profile persistence via Supabase
- portfolio builder with 4 asset buckets and local persistence
- AI Financial Plan generation through `/api/generate-plan`
- AI Expense Insights generation through `/api/expense-insights`
- dedicated pages for Dashboard, Profile, Expenses, and Progression
- beginner asset explorer with risk labels and research links

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Recharts
- Local Backend: Node.js, Express
- Deployed Backend: Vercel Serverless Functions (`/api/*`)
- Auth + user metadata: Supabase
- AI Provider: Google Gemini API

## Project Structure

- `src/` - frontend application code
- `server/` - local Express API for development
- `api/` - Vercel serverless functions for production deployment

## Setup Instructions

### 1. Prerequisites

- Node.js 18+
- npm
- Supabase project (URL + anon key)
- Gemini API key

### 2. Environment Variables

Create a `.env` file in the project root with:

```env
# AI
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash

# Local backend CORS
FRONTEND_ORIGIN=http://localhost:5173

# Frontend
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Local dev API base (used in DEV mode)
VITE_API_BASE_URL=http://localhost:8787
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Locally

```bash
npm run dev:full
```

Then open `http://localhost:5173`.

### 5. Build

```bash
npm run build
```

## Deployment Notes (Vercel)

- Production frontend calls use same-origin `/api/*` routes.
- Ensure Vercel Environment Variables are set:
  - `GEMINI_API_KEY`
  - `GEMINI_MODEL`
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Redeploy after changing environment variables.

## API Endpoints

### Serverless (Vercel)

- `POST /api/generate-plan`
- `POST /api/expense-insights`

### Local Express (Development)

- `GET /api/health`
- `POST /api/generate-plan`
- `POST /api/plan`
- `POST /api/expense-insights`

## Available Scripts

```bash
npm run dev        # frontend only
npm run server     # local express backend only
npm run dev:full   # frontend + local backend
npm run build      # production build
npm run preview    # preview build
npm run lint       # lint checks
```

### Note
- The build is working properly but you might face API call issues
