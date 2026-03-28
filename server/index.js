import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';

const app = express();
const PORT = Number(process.env.PORT) || 8787;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: FRONTEND_ORIGIN }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'future-you-api' });
});

app.post('/api/plan', async (req, res) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'Missing OPENAI_API_KEY on the backend environment.'
      });
    }

    const { age, income, interests, risk } = req.body ?? {};

    if (
      !Number.isFinite(Number(age)) ||
      !Number.isFinite(Number(income)) ||
      !Array.isArray(interests) ||
      interests.length === 0 ||
      typeof risk !== 'string' ||
      risk.trim().length === 0
    ) {
      return res.status(400).json({
        error: 'Invalid request payload for generating plan.'
      });
    }

    const openai = new OpenAI({ apiKey });

    const prompt = `User Data:
Age: ${age}
Income: INR ${income}
Interests: ${interests.join(', ')}
Risk Appetite: ${risk}

Instructions:
Create a tailored financial plan for this user. Output ONLY valid JSON, with nothing before or after. The JSON MUST use the exact structure:
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
  "life_at_60_with_investing": "string (2 vivid sentences)",
  "life_at_60_without_investing": "string (2 vivid sentences)",
  "key_insight": "string (one punchy sentence)"
}`;

    const msg = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1024,
      system: 'You are a professional wealth advisor targeting Gen Z. Give astute, sharp advice. Return pure JSON.',
      messages: [{ role: 'user', content: prompt }]
    });

    const text = msg.choices?.[0]?.message?.content ?? '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return res.status(502).json({ error: 'AI response did not include valid JSON.' });
    }

    let data;
    try {
      data = JSON.parse(jsonMatch[0]);
    } catch {
      return res.status(502).json({ error: 'AI response JSON could not be parsed.' });
    }

    return res.json({ plan: data });
  } catch (error) {
    console.error('Plan generation failed:', error);
    return res.status(500).json({ error: 'Failed to generate plan from AI model.' });
  }
});

app.listen(PORT, () => {
  console.log(`FutureYou API running on http://localhost:${PORT}`);
});
