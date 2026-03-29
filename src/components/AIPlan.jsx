import { useState, useEffect } from 'react';
import { Loader2, BrainCircuit, Target, Lightbulb, ChevronRight, Sparkles, Rocket, ExternalLink } from 'lucide-react';

const API_BASE = import.meta.env.DEV ? (import.meta.env.VITE_API_BASE_URL || '') : '';

const BUCKETS = [
  { id: 'fd', title: 'Safe & Steady (Digital FDs)', rate: 7 },
  { id: 'index', title: 'Wealth Building (Index Funds)', rate: 12 },
  { id: 'gold', title: 'Diversifier (Digital Gold)', rate: 9 },
  { id: 'equity', title: 'Experimenting (Direct Equity)', rate: 15 }
];

const PORTFOLIO_STORAGE_KEY = 'futureyou.portfolio.allocations.v1';

const CATEGORY_ORDER = ['fd', 'index', 'gold', 'equity'];

const CATEGORY_LABELS = {
  fd: 'Safe & Steady',
  index: 'Wealth Building',
  gold: 'Diversifier',
  equity: 'Experimenting'
};

const defaultMarketRecommendations = {
  fd: [
    {
      name: 'High-Yield Digital FDs',
      tickerPlatform: 'Platform: Stable Money',
      beginnerExplanation: 'Zero stress, guaranteed returns. Perfect for emergency funds and peace-of-mind mode.',
      riskLevel: 'Low'
    },
    {
      name: 'Post Office Time Deposits',
      tickerPlatform: 'Platform: India Post',
      beginnerExplanation: 'Old-school but solid. Predictable returns, no drama, pure stability energy.',
      riskLevel: 'Low'
    }
  ],
  index: [
    {
      name: 'Nifty 50 ETF',
      tickerPlatform: 'Ticker: NIFTYBEES',
      beginnerExplanation: "Buying a tiny slice of India\'s top 50 companies. The ultimate set-it-and-forget-it wealth hack.",
      riskLevel: 'Moderate'
    },
    {
      name: 'Sensex Index Funds',
      tickerPlatform: 'Category: Index Mutual Fund',
      beginnerExplanation: 'Broader large-cap exposure with low effort. Just stay consistent and let compounding cook.',
      riskLevel: 'Moderate'
    }
  ],
  gold: [
    {
      name: 'Sovereign Gold Bonds (SGBs)',
      tickerPlatform: 'Issuer: RBI / Govt. of India',
      beginnerExplanation: 'Gold, but without locker fees. Plus, the government pays you extra interest. Big W hedge.',
      riskLevel: 'Low/Moderate'
    },
    {
      name: 'Digital Gold SIPs',
      tickerPlatform: 'Platform: Trusted Digital Gold Apps',
      beginnerExplanation: 'Small monthly gold stacking with no jewellery making charges. Flex and hedge together.',
      riskLevel: 'Low/Moderate'
    }
  ],
  equity: [
    {
      name: 'Tata Motors',
      tickerPlatform: 'Ticker: TATAMOTORS',
      beginnerExplanation: 'High risk, high reward zone. Do your homework before buying the dip, no blind FOMO.',
      riskLevel: 'High'
    },
    {
      name: 'Reliance Industries',
      tickerPlatform: 'Ticker: RELIANCE',
      beginnerExplanation: 'Blue-chip heavyweight with multiple growth engines, but still equity risk is real.',
      riskLevel: 'High'
    },
    {
      name: 'Tech Smallcases',
      tickerPlatform: 'Platform: Smallcase',
      beginnerExplanation: 'Thematic growth basket play. High-volatility ride, so position sizing matters a lot.',
      riskLevel: 'High'
    }
  ]
};

const formatCompactINR = (value) => {
  const val = Number(value) || 0;
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
  return `₹${Math.round(val).toLocaleString('en-IN')}`;
};

const sanitizeAllocations = (allocations) => {
  if (!Array.isArray(allocations) || allocations.length !== 4) return [25, 25, 25, 25];
  return allocations.map((value) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return 0;
    return Math.max(0, Math.min(100, Math.round(numeric)));
  });
};

export default function AIPlan({ userProfile, shouldGenerate = false, allocations = [25, 25, 25, 25], investmentPercentage = 20 }) {
  const [loading, setLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState(null);
  const [plan, setPlan] = useState(null);
  const [requestVersion, setRequestVersion] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('fd');

  const safeAllocations = sanitizeAllocations(allocations);
  const monthlyInvestment = (Number(userProfile?.income || 0) * Number(investmentPercentage || 0)) / 100;

  const getSavedAllocations = () => {
    try {
      const raw = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
      if (!raw) return safeAllocations;
      return sanitizeAllocations(JSON.parse(raw));
    } catch {
      return safeAllocations;
    }
  };

  const savedAllocations = getSavedAllocations();
  const selectedIndex = CATEGORY_ORDER.indexOf(selectedCategory);
  const selectedPercentage = selectedIndex >= 0 ? savedAllocations[selectedIndex] : 0;
  const selectedAmount = Math.round((selectedPercentage / 100) * monthlyInvestment);

  useEffect(() => {
    if (!shouldGenerate) {
      setLoading(false);
      setIsRegenerating(false);
      return undefined;
    }

    const controller = new AbortController();

    async function fetchPlan() {
      const refreshingExistingPlan = Boolean(plan);
      if (refreshingExistingPlan) {
        setIsRegenerating(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        await new Promise((resolve) => setTimeout(resolve, refreshingExistingPlan ? 700 : 1100));
        if (controller.signal.aborted) return;

        // Always pull the latest saved portfolio split before generating the plan.
        const latestAllocations = getSavedAllocations();
        const dominantIndex = latestAllocations.indexOf(Math.max(...latestAllocations));
        const dominantCategory = CATEGORY_ORDER[dominantIndex] || 'index';

        const response = await fetch(`${API_BASE}/api/generate-plan`, {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            portfolioData: {
              safeAndSteady: latestAllocations[0] || 0,
              wealthBuilding: latestAllocations[1] || 0,
              diversifier: latestAllocations[2] || 0,
              experimenting: latestAllocations[3] || 0
            },
            profileData: {
              age: Number(userProfile?.age || 22),
              income: Number(userProfile?.income || 0),
              baselineExpenses: Number(userProfile?.expenses || 0),
              risk: userProfile?.risk || 'moderate',
              interests: Array.isArray(userProfile?.interests) ? userProfile.interests : [],
              investmentPercentage: Number(investmentPercentage || 20),
              requestNonce: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
            }
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `API error: ${response.status}`);
        }

        const responseData = await response.json();
        const planText = typeof responseData?.plan === 'string'
          ? responseData.plan.trim()
          : '';

        if (!planText) {
          throw new Error('AI response did not include a valid plan.');
        }

        const trendSignalsFromPlanText = planText
          .split(/[.!?]\s+/)
          .map((line) => line.trim())
          .filter(Boolean)
          .slice(0, 3);

        const trendSignals = Array.isArray(responseData?.trendSignals) && responseData.trendSignals.length > 0
          ? responseData.trendSignals
          : trendSignalsFromPlanText;

        const parsedBudget = responseData?.budgetBreakdown && typeof responseData.budgetBreakdown === 'object'
          ? responseData.budgetBreakdown
          : null;

        // Inject the AI text into existing UI blocks while preserving current layout.
        const transformedPlan = {
          keyInsight: typeof responseData?.keyInsight === 'string' ? responseData.keyInsight : planText,
          dominantTitle: 'Personalized Investment Strategy',
          trendSignals: trendSignals.length > 0 ? trendSignals : ['Plan generated. Re-run for a fresh strategy angle.'],
          dominantCategory: CATEGORY_ORDER.includes(responseData?.dominantCategory)
            ? responseData.dominantCategory
            : dominantCategory,
          projectedText: typeof responseData?.futureProjection === 'string' ? responseData.futureProjection : planText,
          budgetBreakdown: {
            needs: Number.isFinite(Number(parsedBudget?.needs)) ? Number(parsedBudget.needs) : 50,
            wants: Number.isFinite(Number(parsedBudget?.wants)) ? Number(parsedBudget.wants) : 30,
            invest: Number.isFinite(Number(parsedBudget?.invest))
              ? Number(parsedBudget.invest)
              : Math.round(Number(investmentPercentage || 20))
          },
          categoryRecommendations: responseData?.assetExplorerByCategory || null,
          rawPlan: responseData
        };

        setPlan(transformedPlan);
        setSelectedCategory(transformedPlan.dominantCategory);
      } catch (err) {
        if (err.name === 'AbortError') {
          return;
        }

        console.error('Plan fetch error:', err);
        if (!plan) {
          setPlan(null);
        }
        setError(err.message || 'Failed to generate AI plan.');
      } finally {
        setLoading(false);
        setIsRegenerating(false);
      }
    }

    fetchPlan();

    return () => controller.abort();
  }, [userProfile, requestVersion, shouldGenerate, allocations, investmentPercentage]);

  const triggerRegenerate = () => {
    if (loading || isRegenerating) {
      return;
    }
    setRequestVersion((version) => version + 1);
  };

  if (!shouldGenerate) {
    return (
      <div className="glass-card rounded-3xl p-10 flex flex-col items-center justify-center min-h-[340px] text-center border border-white/10">
        <BrainCircuit className="h-8 w-8 text-neutral-400 mb-4" />
        <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-500 font-semibold mb-2">AI Advisory</p>
        <h3 className="text-xl font-light text-neutral-100 mb-3">Plan generation is on standby.</h3>
        <p className="text-sm text-neutral-400 max-w-xl">
          Generate the plan from the Present & Future page whenever you want to run a fresh recommendation.
        </p>
      </div>
    );
  }

  if (loading && !plan) {
    return (
      <div className="glass-card rounded-3xl p-10 flex flex-col items-center justify-center min-h-[400px] text-center border-white/10">
        <Loader2 className="h-8 w-8 text-neutral-400 animate-spin mb-6" />
        <h3 className="text-xl font-light text-neutral-200 tracking-wide animate-pulse">
          Cooking Your Market Gameplan
        </h3>
        <p className="text-neutral-400 mt-3 text-sm font-mono uppercase tracking-[0.1em]">Running simulated market vibes + allocation checks...</p>
      </div>
    );
  }

  if (error && !plan) {
    return (
      <div className="bg-black/60 rounded-3xl border border-red-500/20 p-8 flex flex-col items-center justify-center min-h-[400px]">
        <Target className="h-8 w-8 text-red-400 mb-4" />
        <p className="text-red-400/80 mb-2 font-mono uppercase text-xs tracking-widest">System Error</p>
        <p className="text-sm text-neutral-400 text-center">{error}</p>
        <button
          type="button"
          onClick={triggerRegenerate}
          className="mt-6 px-5 py-2 rounded-lg border border-red-400/40 text-red-300 text-xs font-mono uppercase tracking-widest hover:bg-red-500/10 transition"
        >
          Retry Plan Generation
        </button>
        <div className="mt-4 p-4 bg-red-950/20 border border-red-500/10 rounded-lg text-[10px] font-mono text-red-400 w-full text-center">
          AI REQUEST FAILED
        </div>
      </div>
    );
  }

  if (!plan) return null;

  const budget = plan.budgetBreakdown || {};
  const trendSignals = plan.trendSignals || [];
  const recommendationsByCategory = plan.categoryRecommendations || defaultMarketRecommendations;
  const categoryRecommendations = recommendationsByCategory[selectedCategory] || [];

  const handleResearch = (assetName) => {
    const query = `${assetName} investment India`;
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
  };

  return (
    <div className="glass-card rounded-3xl overflow-hidden relative group">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-brand-accent/60 via-amber-200/50 to-transparent"></div>

      <div className="p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-xs uppercase tracking-[0.2em] font-semibold flex items-center gap-2 text-neutral-300">
            <BrainCircuit className="text-brand-light h-4 w-4" /> Advisory Engine
          </h2>

          <button
            type="button"
            onClick={triggerRegenerate}
            disabled={loading || isRegenerating}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg border border-white/20 text-[10px] uppercase tracking-[0.12em] font-semibold text-neutral-200 hover:border-brand-light/50 hover:text-brand-light transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isRegenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            {isRegenerating ? 'Rechecking Trends...' : 'Regenerate Plan'}
          </button>
        </div>

        {error ? (
          <div className="mb-6 rounded-xl border border-red-500/25 bg-red-950/25 px-4 py-3 text-xs text-red-200">
            Last regenerate failed: {error}
          </div>
        ) : null}

        <div className="bg-black/35 border-l-2 border-brand-light p-5 mb-6 rounded-r-xl">
          <div className="flex gap-3 items-start">
            <Lightbulb className="text-brand-accent h-4 w-4 shrink-0 mt-1" />
            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-neutral-400 font-semibold mb-2">Insight Drop</p>
              <p className="text-neutral-100 text-sm md:text-base font-light tracking-wide leading-relaxed">
                {plan.keyInsight}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-xl border border-white/10 bg-black/25 px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.14em] text-neutral-500 mb-1">Needs Lane</p>
            <p className="text-xl text-neutral-100 font-mono">{budget.needs || 50}%</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/25 px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.14em] text-neutral-500 mb-1">Wants Lane</p>
            <p className="text-xl text-neutral-100 font-mono">{budget.wants || 30}%</p>
          </div>
          <div className="rounded-xl border border-brand-accent/25 bg-brand-accent/10 px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.14em] text-brand-light/80 mb-1">Invest Lane</p>
            <p className="text-xl text-brand-light font-mono">{budget.invest || 20}%</p>
          </div>
        </div>

        <div className="mb-6 rounded-xl border border-cyan-300/20 bg-cyan-400/5 p-5">
          <div className="flex items-start gap-3">
            <Rocket className="w-5 h-5 text-cyan-300 mt-0.5" />
            <div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-cyan-200/80 font-semibold mb-2">Future Life At Age 60</p>
              <p className="text-sm md:text-base leading-relaxed text-neutral-100">
                {plan.projectedText}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-5 rounded-xl border border-white/10 bg-black/25 p-4">
          <h3 className="text-[10px] uppercase font-bold text-neutral-400 tracking-[0.15em] mb-3 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-light" /> Current Trend Calls
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {trendSignals.map((trend, idx) => (
              <div key={`${trend}-${idx}`} className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-neutral-200 leading-relaxed">
                <span className="mr-1">📌</span>{trend}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-[10px] uppercase font-bold text-neutral-400 tracking-[0.15em] mb-4 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-light" /> Beginner Asset Explorer
          </h3>

          <div className="flex flex-wrap gap-2 mb-4">
            {CATEGORY_ORDER.map((categoryId) => (
              <button
                key={categoryId}
                type="button"
                onClick={() => setSelectedCategory(categoryId)}
                className={`px-3 py-2 rounded-lg text-[10px] uppercase tracking-[0.12em] font-semibold border transition ${
                  selectedCategory === categoryId
                    ? 'bg-brand-accent/15 border-brand-light/40 text-brand-light'
                    : 'bg-black/25 border-white/10 text-neutral-300 hover:bg-black/45 hover:border-white/25'
                }`}
              >
                {CATEGORY_LABELS[categoryId]}
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 mb-4 text-sm leading-relaxed text-neutral-200">
            You have <span className="font-semibold text-brand-light">₹{selectedAmount.toLocaleString('en-IN')}</span> allocated for <span className="font-semibold">{CATEGORY_LABELS[selectedCategory]}</span>.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categoryRecommendations.map((item, idx) => (
              <div
                key={`${item.name}-${idx}`}
                className="p-4 md:p-5 bg-black/25 rounded-xl border border-white/10 hover:border-brand-accent/40 transition-all duration-200 hover:bg-black/40 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(8,14,28,0.45)]"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-sm text-neutral-100 font-semibold leading-relaxed">{item.name}</p>
                    <p className="text-[11px] text-neutral-400 mt-1">{item.tickerPlatform}</p>
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.12em] font-semibold px-2 py-1 rounded border border-white/15 bg-black/35 text-neutral-300">
                    {item.riskLevel} Risk
                  </span>
                </div>

                <p className="text-xs md:text-sm text-neutral-300 leading-relaxed mb-4">
                  {item.beginnerExplanation}
                </p>

                <button
                  type="button"
                  onClick={() => handleResearch(item.name)}
                  className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.13em] font-bold text-brand-light hover:text-cyan-300 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Research this
                </button>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-lg border border-amber-200/15 bg-amber-100/[0.04] px-3.5 py-3 text-[11px] text-amber-100/80 leading-relaxed">
            Not financial advice. Just a hackathon demo built to help you learn! Always do your own research (DYOR).
          </div>
        </div>
      </div>
    </div>
  );
}
