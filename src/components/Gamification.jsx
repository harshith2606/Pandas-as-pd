import { Medal, CheckCircle, Target, ShieldCheck, Zap, Layers, Globe, Star, Activity, Hexagon } from 'lucide-react';

export default function Gamification({ userProfile }) {

  const interestMap = {
    'Gaming': { icon: <Activity className="w-3 h-3" />, idea: 'Interactive Entertainment Index' },
    'Music': { icon: <Layers className="w-3 h-3" />, idea: 'Digital Media Portfolios' },
    'Sports': { icon: <Target className="w-3 h-3" />, idea: 'Athletic Apparel & Leisure ETFs' },
    'Tech': { icon: <Zap className="w-3 h-3" />, idea: 'Semiconductor & AI Funds' },
    'Travel': { icon: <Globe className="w-3 h-3" />, idea: 'Global Hospitality REITs' },
    'Fashion': { icon: <Star className="w-3 h-3" />, idea: 'Luxury Goods Conglomerates' },
    'Food': { icon: <Hexagon className="w-3 h-3" />, idea: 'Agri-Tech & FMCG Indices' },
  };

  const milestones = [
    { title: "Capital Initiation: ₹10k Base", unlocked: true },
    { title: "₹1L Liquidity Benchmark", unlocked: false },
    { title: "50% FI Target Achieved", unlocked: false },
  ];

  return (
    <div className="glass-card rounded-3xl p-6 md:p-8 relative overflow-hidden group">
      
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)', backgroundSize: '22px 22px' }} />

      <div className="mb-10 relative z-10">
        <h3 className="text-[10px] uppercase font-bold text-neutral-300 tracking-[0.2em] mb-4 flex items-center gap-2">
          <ShieldCheck className="text-neutral-400 h-4 w-4" /> Thematic Exposure
        </h3>
        
        <div className="flex flex-wrap gap-3">
          {userProfile.interests.map(interest => {
            const match = interestMap[interest];
            if (!match) return null;
            return (
              <div key={interest} className="flex items-center gap-3 bg-black/30 border border-white/10 px-4 py-2.5 rounded-lg text-xs font-medium text-neutral-200 hover:border-brand-accent/30 hover:bg-black/45 transition-colors">
                <span className="text-brand-light/80">{match.icon}</span>
                <span className="font-mono tracking-tight">{match.idea}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative z-10">
        <h3 className="text-[10px] uppercase font-bold text-neutral-300 tracking-[0.2em] mb-4 flex items-center gap-2">
          <Medal className="text-neutral-400 h-4 w-4" /> Progression Metrics
        </h3>

        <div className="space-y-3">
          {milestones.map((ms, idx) => (
            <div key={idx} className={`flex items-center gap-4 px-5 py-4 rounded-xl border transition-all ${
              ms.unlocked 
                ? 'bg-brand-success/5 border-brand-success/25' 
                : 'bg-black/25 border-white/10 opacity-80'
            }`}>
              <div className={`p-2 rounded-md ${ms.unlocked ? 'bg-brand-success/10 text-brand-success' : 'bg-neutral-900 text-neutral-600'}`}>
                {ms.unlocked ? <CheckCircle className="w-4 h-4" /> : <Target className="w-4 h-4" />}
              </div>
              <div className="flex-1 flex justify-between items-center">
                <p className={`text-xs uppercase tracking-widest font-semibold ${ms.unlocked ? 'text-brand-success/90' : 'text-neutral-300/80'}`}>{ms.title}</p>
                <p className="text-[10px] font-mono text-neutral-300 px-2 py-1 bg-black/35 rounded border border-white/10">{ms.unlocked ? 'CLEARED' : 'PENDING'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
