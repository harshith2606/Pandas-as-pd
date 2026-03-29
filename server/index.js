import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = Number(process.env.PORT) || 8787;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function generateGeminiText(prompt) {
  const endpoint = `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 220
      }
    })
  });

  if (!response.ok) {
    const upstreamBody = await response.text().catch(() => '');
    throw new Error(`Gemini HTTP ${response.status}: ${upstreamBody || 'unknown upstream error'}`);
  }

  const payload = await response.json();
  const text = payload?.candidates?.[0]?.content?.parts
    ?.map((part) => part?.text || '')
    .join('')
    .trim();

  if (!text) {
    throw new Error('Gemini returned an empty response.');
  }

  return text;
}

async function generateGeminiJson(prompt) {
  const endpoint = `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  
  console.log('[generateGeminiJson] Endpoint:', endpoint.replace(GEMINI_API_KEY, 'API_KEY_REDACTED'));
  console.log('[generateGeminiJson] Prompt length:', prompt.length);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.35
      }
    })
  });

  console.log('[generateGeminiJson] Response status:', response.status);

  if (!response.ok) {
    const upstreamBody = await response.text().catch(() => '');
    console.error('[generateGeminiJson] Error response:', upstreamBody);
    throw new Error(`Gemini HTTP ${response.status}: ${upstreamBody || 'unknown upstream error'}`);
  }

  const payload = await response.json();
  console.log('[generateGeminiJson] Payload structure:', {
    hasCandidates: !!payload?.candidates,
    candidateCount: payload?.candidates?.length,
    hasContent: !!payload?.candidates?.[0]?.content
  });

  const text = payload?.candidates?.[0]?.content?.parts
    ?.map((part) => part?.text || '')
    .join('')
    .trim();

  if (!text) {
    throw new Error('Gemini returned an empty response.');
  }

  try {
    // First try to parse the response directly as JSON
    return JSON.parse(text);
  } catch {
    // If it's not JSON, try to extract JSON from the text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (jsonError) {
        console.error('Failed to parse extracted JSON:', jsonMatch[0]);
        throw new Error('Could not parse Gemini response as valid JSON.');
      }
    }
    // If text is plain, wrap it in a simple JSON structure
    return { response: text };
  }
}

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser tools (curl/postman) with no origin header.
      if (!origin) {
        callback(null, true);
        return;
      }

      const isConfiguredOrigin = origin === FRONTEND_ORIGIN;
      const isLocalhostDevOrigin = /^http:\/\/localhost:\d+$/.test(origin);

      if (isConfiguredOrigin || isLocalhostDevOrigin) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin not allowed by CORS: ${origin}`));
    }
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'future-you-api' });
});

app.post('/api/generate-plan', async (req, res) => {
  try {
    if (!GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'Missing GEMINI_API_KEY on the backend environment.'
      });
    }

    const portfolioData = req.body?.portfolioData;
    if (!portfolioData || typeof portfolioData !== 'object') {
      return res.status(400).json({
        error: 'Missing portfolioData in request body.'
      });
    }

    const prompt = [
      'Act as a Gen Z financial advisor.',
      `The user has this portfolio allocation: ${JSON.stringify(portfolioData)}.`,
      'Give them a short, 3-sentence action plan using modern Gen Z slang.'
    ].join(' ');

    const plan = await generateGeminiText(prompt);
    return res.json({ plan });
  } catch (error) {
    const upstreamMessage = error?.message || null;

    console.error('[/api/generate-plan] Plan generation failed:', {
      message: upstreamMessage
    });

    return res.status(502).json({
      error: upstreamMessage
        ? `Gemini provider error: ${upstreamMessage}`
        : 'Failed to generate plan from AI model.'
    });
  }
});

app.post('/api/plan', async (req, res) => {
  try {
    console.log('[/api/plan] Request received:', {
      body: req.body,
      modelUsed: GEMINI_MODEL,
      hasApiKey: !!GEMINI_API_KEY
    });

    if (!GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'Missing GEMINI_API_KEY on the backend environment.'
      });
    }

    const { age, income, expenses, interests, risk, allocations, investmentPercentage } = req.body ?? {};

    if (
      !Number.isFinite(Number(age)) ||
      !Number.isFinite(Number(income)) ||
      !Number.isFinite(Number(expenses)) ||
      !Array.isArray(interests) ||
      interests.length === 0 ||
      typeof risk !== 'string' ||
      risk.trim().length === 0 ||
      !Array.isArray(allocations) ||
      allocations.length !== 4 ||
      !Number.isFinite(Number(investmentPercentage))
    ) {
      return res.status(400).json({
        error: 'Invalid request payload for generating plan.'
      });
    }

    const safeAllocations = allocations.map((value) => {
      const numeric = Number(value);
      if (!Number.isFinite(numeric)) return 0;
      return Math.max(0, Math.min(100, Math.round(numeric)));
    });

    const prompt = `System Role:
You are a professional wealth advisor targeting Gen Z in India. Give astute, practical advice and return pure JSON only.

User Data:
Age: ${age}
Income: INR ${income}
Baseline Monthly Expenses: INR ${expenses}
Interests: ${interests.join(', ')}
Risk Appetite: ${risk}
Monthly Investment Percentage: ${Math.round(Number(investmentPercentage))}%
Portfolio Allocations (Safe&Steady, Index, Gold, Equity): ${safeAllocations.join('% , ')}%

Instructions:
Create a tailored financial plan for this user taking into account their unique baseline expenses.
Mandatory personalization rules:
- You MUST explicitly reference at least two of the exact selected interests by name in BOTH life_at_60_with_investing and life_at_60_without_investing.
- You MUST avoid generic placeholders like "hobbies" or "lifestyle" when interests are available.
- In each investment_ideas[i].why_suits_user, mention a concrete link to this user's data (risk appetite, income/expenses capacity, and/or selected interests).
- Provide realistic India-specific options only.
Output ONLY valid JSON, with nothing before or after. The JSON MUST use the exact structure:
{
  "monthly_budget": {
    "needs_percentage": number,
    "wants_percentage": number,
    "savings_percentage": number,
    "investment_percentage": number
  },
  "investment_ideas": [
    {
      "name": "string",
      "expected_annual_return": "string",
      "why_suits_user": "string",
      "min_monthly_amount": "string"
    }
  ],
  "dominant_category": "fd | index | gold | equity",
  "asset_explorer_by_category": {
    "fd": [{ "name": "string", "tickerPlatform": "string", "beginnerExplanation": "string", "riskLevel": "Low | Moderate | High" }],
    "index": [{ "name": "string", "tickerPlatform": "string", "beginnerExplanation": "string", "riskLevel": "Low | Moderate | High" }],
    "gold": [{ "name": "string", "tickerPlatform": "string", "beginnerExplanation": "string", "riskLevel": "Low | Moderate | High" }],
    "equity": [{ "name": "string", "tickerPlatform": "string", "beginnerExplanation": "string", "riskLevel": "Low | Moderate | High" }]
  },
  "life_at_60_with_investing": "string (2 vivid sentences)",
  "life_at_60_without_investing": "string (2 vivid sentences)",
  "key_insight": "string (one punchy sentence)"
}`;

    console.log('[/api/plan] Calling Gemini API with model:', GEMINI_MODEL);
    const data = await generateGeminiJson(prompt);
    console.log('[/api/plan] Gemini response received:', data);

    return res.json({ plan: data });
  } catch (error) {
    const upstreamMessage = error?.message || null;

    console.error('[/api/plan] Plan generation failed:', {
      message: upstreamMessage,
      errorDetails: error
    });

    return res.status(502).json({
      error: upstreamMessage
        ? `Gemini provider error: ${upstreamMessage}`
        : 'Failed to generate plan from AI model.'
    });
  }
});

app.post('/api/expense-insights', async (req, res) => {
  try {
    if (!GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'Missing GEMINI_API_KEY on the backend environment.'
      });
    }

    const { income, baselineExpenses, expenses } = req.body ?? {};

    if (!Array.isArray(expenses) || expenses.length === 0) {
      return res.status(400).json({
        error: 'Please provide at least one expense entry.'
      });
    }

    const sanitizedExpenses = expenses
      .map((item) => ({
        category: typeof item?.category === 'string' ? item.category.trim() : '',
        amount: Number(item?.amount)
      }))
      .filter((item) => item.category && Number.isFinite(item.amount) && item.amount > 0);

    if (sanitizedExpenses.length === 0) {
      return res.status(400).json({
        error: 'Expense entries must include valid category and amount values.'
      });
    }

    const expenseLines = sanitizedExpenses
      .map((item) => `- ${item.category}: INR ${Math.round(item.amount)}`)
      .join('\n');

    const prompt = `System Role:
You are a practical personal finance coach for users in India. Be specific, realistic, and concise. Return pure JSON only.

User Financial Context:
Monthly Income: INR ${Number.isFinite(Number(income)) ? Math.round(Number(income)) : 'unknown'}
Baseline Essential Expenses: INR ${Number.isFinite(Number(baselineExpenses)) ? Math.round(Number(baselineExpenses)) : 'unknown'}

Tracked Expenses:
${expenseLines}

Instructions:
Analyze these expenses and provide practical, realistic savings suggestions for a young investor in India.
Do NOT suggest impossible cuts. Prioritize actions that can be implemented this month.
Output ONLY valid JSON in this exact shape:
{
  "overall_observation": "string",
  "savings_opportunities": [
    {
      "category": "string",
      "advice": "string",
      "estimated_monthly_savings_inr": number
    }
  ],
  "quick_actions": ["string", "string", "string"]
}`;

    const insights = await generateGeminiJson(prompt);

    return res.json({ insights });
  } catch (error) {
    const upstreamMessage = error?.message || null;

    console.error('Expense insights failed:', {
      message: upstreamMessage
    });

    return res.status(502).json({
      error: upstreamMessage
        ? `Gemini provider error: ${upstreamMessage}`
        : 'Failed to generate expense insights from AI model.'
    });
  }
});

app.listen(PORT, () => {
  console.log(`FutureYou API running on http://localhost:${PORT}`);
});
