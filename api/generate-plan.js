const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

const buildGeminiApiUrl = (apiKey) => {
  const encodedModel = encodeURIComponent(GEMINI_MODEL);
  return `https://generativelanguage.googleapis.com/v1/models/${encodedModel}:generateContent?key=${apiKey}`;
};

function getPortfolioData(req) {
  if (!req?.body) return null;

  if (typeof req.body === 'string') {
    try {
      const parsed = JSON.parse(req.body);
      return parsed?.portfolioData ?? null;
    } catch {
      return null;
    }
  }

  return req.body?.portfolioData ?? null;
}

function getProfileData(req) {
  if (!req?.body) return {};

  if (typeof req.body === 'string') {
    try {
      const parsed = JSON.parse(req.body);
      return parsed?.profileData ?? {};
    } catch {
      return {};
    }
  }

  return req.body?.profileData ?? {};
}

function cleanAiText(value) {
  if (typeof value !== 'string') return '';

  return value
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .replace(/^json\s*/i, '')
    .trim();
}

function limitSentences(value, maxSentences) {
  const text = cleanAiText(value);
  if (!text) return '';

  const pieces = text
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (pieces.length <= maxSentences) return text;
  return pieces.slice(0, maxSentences).join(' ').trim();
}

function normalizeTrendSignals(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => cleanAiText(String(item)))
    .filter(Boolean)
    .slice(0, 3);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const portfolioData = getPortfolioData(req);
    const profileData = getProfileData(req);

    if (!portfolioData) {
      return res.status(400).json({ error: 'Missing portfolioData in request body.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Server misconfiguration: GEMINI_API_KEY is not set.' });
    }

    const safeAndSteady = Math.max(0, Math.min(100, Number(portfolioData?.safeAndSteady || 0)));
    const wealthBuilding = Math.max(0, Math.min(100, Number(portfolioData?.wealthBuilding || 0)));
    const diversifier = Math.max(0, Math.min(100, Number(portfolioData?.diversifier || 0)));
    const experimenting = Math.max(0, Math.min(100, Number(portfolioData?.experimenting || 0)));

    const age = Number(profileData?.age || 22);
    const income = Number(profileData?.income || 0);
    const baselineExpenses = Number(profileData?.baselineExpenses || 0);
    const risk = typeof profileData?.risk === 'string' ? profileData.risk : 'moderate';
    const interests = Array.isArray(profileData?.interests) ? profileData.interests : [];
    const investmentPercentage = Number(profileData?.investmentPercentage || 20);
    const requestNonce = typeof profileData?.requestNonce === 'string' ? profileData.requestNonce : String(Date.now());

    const prompt = `System Role:
You are an elite Gen Z financial advisor for India. Keep advice practical, specific, and easy to execute.

  User Context:
  - Age: ${Number.isFinite(age) ? age : 22}
  - Monthly Income: INR ${Number.isFinite(income) ? Math.round(income) : 0}
  - Baseline Expenses: INR ${Number.isFinite(baselineExpenses) ? Math.round(baselineExpenses) : 0}
  - Risk Appetite: ${risk}
  - Interests: ${interests.length > 0 ? interests.join(', ') : 'none provided'}
  - Monthly Investment Percentage: ${Number.isFinite(investmentPercentage) ? Math.round(investmentPercentage) : 20}%
  - Request Nonce: ${requestNonce}

User Portfolio Allocation:
- Safe & Steady: ${safeAndSteady}%
- Wealth Building (Index): ${wealthBuilding}%
- Diversifier (Gold): ${diversifier}%
- Experimenting (Equity): ${experimenting}%

Instructions:
- Keep the output concise and practical for UI display.
- Return ONLY valid JSON.
  - Never wrap output in markdown or code fences.
  - Plan text must be plain readable sentences, not nested JSON text.
- plan must be 3-4 sentences only.
- keyInsight must be one short sentence.
- futureProjection must be 2 short sentences.
- trendSignals must have exactly 3 short bullet-style strings.
- Use this exact shape:
{
  "plan": "string (3-4 sentences; specific and actionable)",
  "keyInsight": "string (one short sentence)",
  "futureProjection": "string (2 short sentences)",
  "trendSignals": ["string", "string", "string"],
  "budgetBreakdown": {
    "needs": number,
    "wants": number,
    "invest": number
  },
  "dominantCategory": "fd | index | gold | equity",
  "assetExplorerByCategory": {
    "fd": [{ "name": "string", "tickerPlatform": "string", "beginnerExplanation": "string", "riskLevel": "Low | Moderate | High" }],
    "index": [{ "name": "string", "tickerPlatform": "string", "beginnerExplanation": "string", "riskLevel": "Low | Moderate | High" }],
    "gold": [{ "name": "string", "tickerPlatform": "string", "beginnerExplanation": "string", "riskLevel": "Low | Moderate | High" }],
    "equity": [{ "name": "string", "tickerPlatform": "string", "beginnerExplanation": "string", "riskLevel": "Low | Moderate | High" }]
  }
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
          temperature: 0.75,
          maxOutputTokens: 900
        }
      })
    });

    if (!response.ok) {
      const providerError = await response.text().catch(() => 'Unknown provider error');
      throw new Error(`Gemini API request failed: ${response.status} ${providerError}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts
      ?.map((part) => part?.text || '')
      .join('')
      .trim();

    if (!text) {
      throw new Error('Gemini API returned an empty plan.');
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      try {
        parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { plan: text };
      } catch {
        parsed = { plan: text };
      }
    }

    const plan = limitSentences(typeof parsed?.plan === 'string' ? parsed.plan : text, 4);
    const keyInsight = limitSentences(parsed?.keyInsight || plan, 1) || plan;
    const futureProjection = limitSentences(parsed?.futureProjection || plan, 2) || plan;
    const trendSignals = normalizeTrendSignals(parsed?.trendSignals);

    return res.status(200).json({
      plan,
      keyInsight,
      futureProjection,
      trendSignals,
      budgetBreakdown: parsed?.budgetBreakdown || null,
      dominantCategory: parsed?.dominantCategory || null,
      assetExplorerByCategory: parsed?.assetExplorerByCategory || null
    });
  } catch (error) {
    console.error('generate-plan error:', error);
    
    // This sends the actual error string back to your frontend
    return res.status(500).json({ 
      error: error.message || 'Failed to generate plan.' 
    });
  }
}