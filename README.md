## Retirement Blindness Among Gen Z

Students often struggle to plan for retirement due to its distant and abstract nature, leading them to prioritize immediate financial needs and lifestyle goals instead. Limited financial literacy and awareness further contribute to this issue, making it difficult for Gen Z to understand the importance of early investing and long-term financial planning. As a result, retirement planning is often delayed or ignored altogether.

This lack of early action can have serious long-term consequences, including insufficient savings and financial insecurity in later life. The gap between awareness and action highlights the need for solutions that make retirement planning more engaging, relatable, and accessible, helping young individuals build consistent financial habits and ensure a more secure future.

# FutureYou: Gen Z Retirement Simulator

A modern, highly visual retirement planning simulator built with React, Tailwind CSS, and Recharts, featuring AI-tailored financial advice powered by Claude 3.5 Sonnet.

## Setup

1. Configure your environment variables in `.env`:

```env
ANTHROPIC_API_KEY=your_claude_api_key_here
FRONTEND_ORIGIN=http://localhost:5173
VITE_API_BASE_URL=
```

2. Install dependencies:

```bash
npm install
```

3. Run frontend and backend together:

```bash
npm run dev:full
```

4. Open the app URL shown by Vite (usually `http://localhost:5173`).

## Deployment to Vercel

### Option 1 (Via GitHub Integration)

1. Create a new repository on your GitHub account.
2. Push this local directory to the remote repository.

```bash
git remote add origin https://github.com/your-username/future-you.git
git branch -M main
git push -u origin main
```

3. Go to [Vercel](https://vercel.com/new), import the GitHub repository, and make sure to enter `ANTHROPIC_API_KEY` under Environment Variables in the project settings before clicking "Deploy".

### Option 2 (Via Vercel CLI)

1. If you have the Vercel CLI installed:

```bash
npx vercel --prod
```

2. When prompted, link the project to your Vercel team, and then add your Environment Variable via the CLI or Vercel dashboard.

# Pandas-as-pd

Submission for Vashist Hackathon 3.0
