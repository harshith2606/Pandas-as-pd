const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

const buildGeminiApiUrl = (apiKey) => {
  const encodedModel = encodeURIComponent(GEMINI_MODEL);
  return `https://generativelanguage.googleapis.com/v1/models/${encodedModel}:generateContent?key=${apiKey}`;
};

function parseRequestBody(req) {
  if (!req?.body) return {};

  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }

  return req.body;
}

function cleanText(value) {
  if (typeof value !== 'string') return '';
  return value.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
}

function limitSentences(value, maxSentences) {
  const text = cleanText(value);
  if (!text) return '';

  const pieces = text
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (pieces.length <= maxSentences) return text;
  return pieces.slice(0, maxSentences).join(' ').trim();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Missing GEMINI_API_KEY in environment.' });
    }

    const { income, baselineExpenses, expenses } = parseRequestBody(req);

    if (!Array.isArray(expenses) || expenses.length === 0) {
      return res.status(400).json({ error: 'Please provide at least one expense entry.' });
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
Keep it concise for app UI readability.
Output ONLY valid JSON in this exact shape:
{
  "overall_observation": "string (max 2 sentences)",
  "savings_opportunities": [
    {
      "category": "string",
      "advice": "string (max 2 sentences)",
      "estimated_monthly_savings_inr": number
    }
  ],
  "quick_actions": ["string", "string", "string"]
}`;

    const response = await fetch(buildGeminiApiUrl(apiKey), {
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

    if (!response.ok) {
      const providerError = await response.text().catch(() => 'Unknown provider error');
      throw new Error(`Gemini API request failed: ${response.status} ${providerError}`);
    }

    const payload = await response.json();
    const text = payload?.candidates?.[0]?.content?.parts
      ?.map((part) => part?.text || '')
      .join('')
      .trim();

    if (!text) {
      throw new Error('Gemini API returned empty insights.');
    }

    let parsedInsights;
    try {
      parsedInsights = JSON.parse(text);
    } catch {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      parsedInsights = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    }

    if (!parsedInsights || typeof parsedInsights !== 'object') {
      throw new Error('Could not parse Gemini response as JSON insights.');
    }

    const normalizedOpportunities = Array.isArray(parsedInsights?.savings_opportunities)
      ? parsedInsights.savings_opportunities
          .map((item) => ({
            category: cleanText(item?.category) || 'General',
            advice: limitSentences(item?.advice, 2),
            estimated_monthly_savings_inr: Math.max(0, Math.round(Number(item?.estimated_monthly_savings_inr || 0)))
          }))
          .filter((item) => item.advice)
          .slice(0, 3)
      : [];

    const normalizedQuickActions = Array.isArray(parsedInsights?.quick_actions)
      ? parsedInsights.quick_actions
          .map((item) => cleanText(String(item)))
          .filter(Boolean)
          .slice(0, 3)
      : [];

    return res.status(200).json({
      insights: {
        overall_observation: limitSentences(parsedInsights?.overall_observation, 2),
        savings_opportunities: normalizedOpportunities,
        quick_actions: normalizedQuickActions
      }
    });
  } catch (error) {
    console.error('expense-insights error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate expense insights.' });
  }
}
