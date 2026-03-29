import { useMemo } from 'react';
import { Medal, CheckCircle, Target, ShieldCheck, Zap, Layers, Globe, Star, Activity, Hexagon, Flame, Bitcoin, Dumbbell, Video, Tv, Camera, Sparkles, Recycle, Rocket, Palette, Music2, Leaf, Brain, Podcast, Footprints, ChefHat, Wrench } from 'lucide-react';

export default function Gamification({ userProfile, investmentPercentage = 20, blendedRate = 12 }) {

  const interestMap = {
    // Original 7
    'Gaming':            { icon: <Activity className="w-3 h-3" />,    idea: 'Interactive Entertainment Index' },
    'Music':             { icon: <Layers className="w-3 h-3" />,      idea: 'Digital Media Portfolios' },
    'Sports':            { icon: <Target className="w-3 h-3" />,      idea: 'Athletic Apparel & Leisure ETFs' },
    'Tech':              { icon: <Zap className="w-3 h-3" />,         idea: 'Semiconductor & AI Funds' },
    'Travel':            { icon: <Globe className="w-3 h-3" />,       idea: 'Global Hospitality REITs' },
    'Fashion':           { icon: <Star className="w-3 h-3" />,        idea: 'Luxury Goods Conglomerates' },
    'Food':              { icon: <Hexagon className="w-3 h-3" />,     idea: 'Agri-Tech & FMCG Indices' },
    // New Gen Z interests
    'Anime':             { icon: <Flame className="w-3 h-3" />,       idea: 'Japanese Media & Entertainment ETFs' },
    'Crypto':            { icon: <Bitcoin className="w-3 h-3" />,     idea: 'Blockchain & DeFi Funds' },
    'Fitness':           { icon: <Dumbbell className="w-3 h-3" />,    idea: 'Health & Wellness REITs' },
    'Content Creation':  { icon: <Video className="w-3 h-3" />,       idea: 'Creator Economy Platforms' },
    'Streaming':         { icon: <Tv className="w-3 h-3" />,          idea: 'OTT & Streaming Media Index' },
    'Photography':       { icon: <Camera className="w-3 h-3" />,      idea: 'Imaging & Optics Tech' },
    'Skincare':          { icon: <Sparkles className="w-3 h-3" />,    idea: 'Beauty & Personal Care ETFs' },
    'Thrifting':         { icon: <Recycle className="w-3 h-3" />,     idea: 'Circular Economy Funds' },
    'Startups':          { icon: <Rocket className="w-3 h-3" />,      idea: 'Venture Capital Trusts' },
    'Art & Design':      { icon: <Palette className="w-3 h-3" />,     idea: 'Digital Art & NFT Index' },
    'K-Pop':             { icon: <Music2 className="w-3 h-3" />,      idea: 'Asian Entertainment Holdings' },
    'Sustainability':    { icon: <Leaf className="w-3 h-3" />,        idea: 'ESG & Green Energy Funds' },
    'Mental Health':     { icon: <Brain className="w-3 h-3" />,       idea: 'Digital Health & Wellbeing' },
    'Podcasts':          { icon: <Podcast className="w-3 h-3" />,     idea: 'Audio & Media Tech' },
    'Sneakers':          { icon: <Footprints className="w-3 h-3" />,  idea: 'Luxury Streetwear Portfolios' },
    'Cooking':           { icon: <ChefHat className="w-3 h-3" />,     idea: 'Food-Tech & D2C Brands' },
    'DIY / Crafts':      { icon: <Wrench className="w-3 h-3" />,      idea: 'Maker Economy & E-commerce' },
  };

  // Dynamic wealth projection (same formula as LifestyleBalance)
  const income = Number(userProfile.income) || 0;
  const userExpenses = Number(userProfile.expenses) || 0;
  const monthlyInvestment = (income * investmentPercentage) / 100;
  const r = (blendedRate / 100) / 12; // dynamic annual -> monthly

  const projectedWealth = useMemo(() => {
    const calc = (years) => {
      const n = years * 12;
      if (n <= 0 || r <= 0 || monthlyInvestment <= 0) return 0;
      return monthlyInvestment * ((Math.pow(1 + r, n) - 1) / r);
    };
    return {
      year1: calc(1),
      year3: calc(3),
      year5: calc(5),
      year10: calc(10),
      atAge60: calc(60 - (userProfile.age || 22)),
    };
  }, [monthlyInvestment, userProfile.age, r]);

  // Dynamic milestones that unlock as projected wealth grows
  const milestones = [
    {
      title: 'Capital Initiation: ₹10K Base',
      unlocked: projectedWealth.year1 >= 10000,
      detail: `Year 1 → ₹${Math.round(projectedWealth.year1).toLocaleString('en-IN')}`,
    },
    {
      title: '₹1L Liquidity Benchmark',
      unlocked: projectedWealth.year3 >= 100000,
      detail: `Year 3 → ₹${Math.round(projectedWealth.year3).toLocaleString('en-IN')}`,
    },
    {
      title: '₹5L Growth Milestone',
      unlocked: projectedWealth.year5 >= 500000,
      detail: `Year 5 → ₹${Math.round(projectedWealth.year5).toLocaleString('en-IN')}`,
    },
    {
      title: '₹10L Wealth Builder',
      unlocked: projectedWealth.year10 >= 1000000,
      detail: `Year 10 → ₹${Math.round(projectedWealth.year10).toLocaleString('en-IN')}`,
    },
    {
      title: '₹50L FI Target Achieved',
      unlocked: projectedWealth.atAge60 >= 5000000,
      detail: `Age 60 → ₹${Math.round(projectedWealth.atAge60).toLocaleString('en-IN')}`,
    },
  ];

  const clearedCount = milestones.filter(m => m.unlocked).length;

  return (
    <div className="glass-card rounded-3xl p-6 md:p-8 relative overflow-hidden group h-full">
      
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)', backgroundSize: '22px 22px' }} />

      {/* Thematic Exposure */}
      <div className="mb-10 relative z-10">
        <h3 className="text-[10px] uppercase font-bold text-neutral-300 tracking-[0.2em] mb-4 flex items-center gap-2">
          <ShieldCheck className="text-neutral-400 h-4 w-4" /> Thematic Exposure
        </h3>
        
        <div className="flex flex-wrap gap-2.5">
          {userProfile.interests.map(interest => {
            const match = interestMap[interest];
            if (!match) return null;
            return (
              <div key={interest} className="flex items-center gap-2.5 bg-black/30 border border-white/10 px-3.5 py-2 rounded-lg text-xs font-medium text-neutral-200 hover:border-brand-accent/30 hover:bg-black/45 transition-colors">
                <span className="text-brand-light/80">{match.icon}</span>
                <span className="font-mono tracking-tight">{match.idea}</span>
              </div>
            );
          })}
          {userProfile.interests.length === 0 && (
            <p className="text-xs text-neutral-500 italic">Select interests during onboarding to see thematic exposure.</p>
          )}
        </div>
      </div>

      {/* Progression Metrics */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] uppercase font-bold text-neutral-300 tracking-[0.2em] flex items-center gap-2">
            <Medal className="text-neutral-400 h-4 w-4" /> Progression Metrics
          </h3>
          <span className="text-[10px] font-mono text-brand-light bg-brand-accent/10 px-2 py-1 rounded border border-brand-accent/20">
            {clearedCount}/{milestones.length} CLEARED
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-neutral-800 rounded-full mb-5 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-brand-light to-cyan-300 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(clearedCount / milestones.length) * 100}%` }}
          />
        </div>

        <div className="space-y-3">
          {milestones.map((ms, idx) => (
            <div key={idx} className={`flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all duration-300 ${
              ms.unlocked 
                ? 'bg-brand-success/5 border-brand-success/25' 
                : 'bg-black/25 border-white/10 opacity-70'
            }`}>
              <div className={`p-2 rounded-md shrink-0 ${ms.unlocked ? 'bg-brand-success/10 text-brand-success' : 'bg-neutral-900 text-neutral-600'}`}>
                {ms.unlocked ? <CheckCircle className="w-4 h-4" /> : <Target className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center gap-2">
                  <p className={`text-xs uppercase tracking-widest font-semibold truncate ${ms.unlocked ? 'text-brand-success/90' : 'text-neutral-300/80'}`}>{ms.title}</p>
                  <p className={`text-[10px] font-mono px-2 py-1 rounded border shrink-0 ${
                    ms.unlocked 
                      ? 'text-brand-success bg-brand-success/10 border-brand-success/20' 
                      : 'text-neutral-300 bg-black/35 border-white/10'
                  }`}>{ms.unlocked ? 'CLEARED' : 'PENDING'}</p>
                </div>
                <p className="text-[10px] text-neutral-500 font-mono mt-1">{ms.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
