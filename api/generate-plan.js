const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const portfolioData = getPortfolioData(req);

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

    const prompt = `System Role:
You are an elite Gen Z financial advisor for India. Keep advice practical, specific, and easy to execute.

User Portfolio Allocation:
- Safe & Steady: ${safeAndSteady}%
- Wealth Building (Index): ${wealthBuilding}%
- Diversifier (Gold): ${diversifier}%
- Experimenting (Equity): ${experimenting}%

Instructions:
- Generate a DETAILED but concise action plan.
- Return ONLY valid JSON.
- Use this exact shape:
{
  "plan": "string (5-7 sentences; specific and actionable)",
  "keyInsight": "string (1-2 sentences)",
  "futureProjection": "string (2-3 sentences)",
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
          temperature: 0.4,
          //responseMimeType: 'application/json',
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
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { plan: text };
    }

    const plan = typeof parsed?.plan === 'string' ? parsed.plan : text;

    return res.status(200).json({
      plan,
      keyInsight: parsed?.keyInsight || plan,
      futureProjection: parsed?.futureProjection || plan,
      trendSignals: Array.isArray(parsed?.trendSignals) ? parsed.trendSignals : [],
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