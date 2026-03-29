import { useMemo } from 'react';
import { AreaChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Activity, ShieldAlert, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';

export default function LifestyleBalance({ userProfile, investmentPercentage, onInvestmentChange, blendedRate = 12 }) {

  // Core Budgeting Logic
  const income = Number(userProfile.income) || 0;
  const userExpenses = Number(userProfile.expenses) || 0;
  const baselineNeeds = income > 0 ? Math.min(Math.round((userExpenses / income) * 100), 100) : 50;
  const maxDiscretionary = 100 - baselineNeeds;

  const investment = investmentPercentage;
  let discretionary = 0;
  let needs = baselineNeeds;

  if (investment <= maxDiscretionary) {
    discretionary = maxDiscretionary - investment;
  } else {
    // Investment eats into needs
    needs = 100 - investment;
  }

  const monthlyInvestment = (income * investment) / 100;
  const monthlyDiscretionary = (income * discretionary) / 100;

  // Status Badge Logic
  let statusBadge = { title: '', desc: '', icon: null, color: '' };
  if (investment <= 10) {
    statusBadge = {
      title: 'Under-investing',
      desc: 'High present cash flow, high future risk',
      icon: <AlertTriangle className="w-4 h-4" />,
      color: 'text-amber-400 bg-amber-400/10 border-amber-400/20'
    };
  } else if (investment <= 25) {
    statusBadge = {
      title: 'Optimal Balance',
      desc: 'Sustainable lifestyle, steady wealth growth',
      icon: <CheckCircle2 className="w-4 h-4" />,
      color: 'text-brand-success bg-brand-success/10 border-brand-success/20'
    };
  } else if (investment <= 40) {
    statusBadge = {
      title: 'Aggressive Saving',
      desc: 'Restricted discretionary spending',
      icon: <TrendingUp className="w-4 h-4" />,
      color: 'text-blue-400 bg-blue-400/10 border-blue-400/20'
    };
  } else {
    statusBadge = {
      title: 'High Risk',
      desc: 'Impacting essential expenses',
      icon: <ShieldAlert className="w-4 h-4" />,
      color: 'text-rose-400 bg-rose-400/10 border-rose-400/20'
    };
  }

  // Future Wealth Projection Logic (Monthly Compound Formula)
  const chartData = useMemo(() => {
    const data = [];
    const r = (blendedRate / 100) / 12; // Monthly interest rate from blended portfolio
    const P = monthlyInvestment;
    
    for (let age = userProfile.age; age <= 60; age++) {
      let n = (age - userProfile.age) * 12; // Number of months
      let fv = 0;
      if (n > 0 && r > 0) {
        fv = P * ((Math.pow(1 + r, n) - 1) / r);
      }
      data.push({
        age,
        Wealth: Math.round(fv)
      });
    }
    return data;
  }, [userProfile.age, monthlyInvestment, blendedRate]);

  const wealthAt60 = chartData[chartData.length - 1]?.Wealth || 0;

  const formatLargeNumber = (val) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} Lakhs`;
    return `₹${val.toLocaleString()}`;
  };

  return (
    <div className="glass-card rounded-3xl p-6 md:p-8 flex flex-col relative overflow-hidden group">
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-brand-accent/5 rounded-full blur-[120px] pointer-events-none transition-opacity duration-700 opacity-40 group-hover:opacity-100" />

      <h2 className="text-sm tracking-[0.2em] font-semibold uppercase flex items-center gap-2 mb-8 text-neutral-300">
        <Activity className="text-brand-light h-4 w-4" /> Present vs. Future Lifestyle Balance
      </h2>

      {/* Main Interactive Slider */}
      <div className="mb-10 bg-black/25 rounded-xl p-6 border border-white/10 shadow-inner relative z-10">
        <div className="flex justify-between items-end mb-4">
          <span className="text-xs uppercase tracking-widest font-bold text-neutral-300">Investment Allocation</span>
          <div className="text-right">
            <span className="text-brand-light font-semibold bg-brand-accent/15 py-1 px-3 rounded text-lg border border-brand-accent/30">{investmentPercentage}%</span>
          </div>
        </div>
        <input 
          type="range" 
          min="0" max="70" step="1"
          value={investmentPercentage}
          onChange={e => onInvestmentChange(Number(e.target.value))}
          className="w-full h-[4px] bg-neutral-700 rounded-lg appearance-none cursor-pointer transition-all hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-brand-light/30"
        />
        <div className="flex justify-between text-[10px] text-neutral-500 font-mono mt-3 uppercase tracking-widest">
          <span>0% (All Cashflow)</span>
          <span>70% (Max Wealth)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        
        {/* CARD A: Current Lifestyle Impact */}
        <div className="bg-black/30 rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
          <div>
            <h3 className="text-[11px] uppercase font-bold text-neutral-400 tracking-[0.15em] mb-4">Current Lifestyle Impact</h3>
            
            <div className={`inline-flex flex-col mb-6 px-4 py-3 rounded-xl border ${statusBadge.color}`}>
              <div className="flex items-center gap-2 mb-1">
                {statusBadge.icon}
                <span className="text-sm font-bold uppercase tracking-wider">{statusBadge.title}</span>
              </div>
              <span className="text-xs opacity-80">{statusBadge.desc}</span>
            </div>

            <div className="mb-2">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
                <span className={needs < baselineNeeds ? "text-rose-400" : "text-slate-400"}>Needs ({needs}%)</span>
                <span className="text-emerald-400/80">Wants ({discretionary}%)</span>
                <span className="text-purple-400">Invest ({investment}%)</span>
              </div>
              {/* Stacked Progress Bar */}
              <div className="flex h-3 w-full rounded-full overflow-hidden bg-neutral-800">
                <div 
                  className={`${needs < baselineNeeds ? 'bg-rose-500' : 'bg-slate-500'} transition-all duration-300 ease-out`} 
                  style={{ width: `${needs}%` }} 
                />
                <div 
                  className="bg-emerald-400/80 transition-all duration-300 ease-out" 
                  style={{ width: `${discretionary}%` }} 
                />
                <div 
                  className="bg-purple-500/90 transition-all duration-300 ease-out" 
                  style={{ width: `${investment}%` }} 
                />
              </div>
              {needs < baselineNeeds && (
                <p className="text-[10px] text-rose-400 mt-2 font-mono uppercase">Warning: Investment rate is consuming essential needs budget.</p>
              )}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-1">Monthly Discretionary Income</p>
            <p className="text-3xl font-light text-white tracking-tight shrink-0">
              ₹{monthlyDiscretionary.toLocaleString()}
            </p>
          </div>
        </div>

        {/* CARD B: Future Wealth Projection */}
        <div className="bg-black/30 rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
          <div className="mb-6">
            <h3 className="text-[11px] uppercase font-bold text-neutral-400 tracking-[0.15em] mb-4">Future Wealth Projection (Age 60)</h3>
            <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1 flex items-center justify-between">
              <span>Estimated Wealth at Age 60</span>
              <span className="text-[9px] text-brand-light bg-brand-light/10 border border-brand-light/20 px-1.5 py-0.5 rounded ml-2">
                @ {Number(blendedRate).toFixed(2)}% p.a.
              </span>
            </p>
            <p className="text-3xl lg:text-4xl font-light text-brand-light tracking-tight drop-shadow-md">
              {formatLargeNumber(wealthAt60)}
            </p>
          </div>

          <div className="h-[180px] w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWealth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis dataKey="age" stroke="#525252" tick={{fill: '#737373', fontSize: 10}} tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(v) => `₹${(v/100000).toFixed(0)}L`} stroke="#525252" tick={{fill: '#737373', fontSize: 10}} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f0f0f', borderColor: '#262626', borderRadius: '8px', color: '#fff', fontSize: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                  itemStyle={{ color: '#fff', fontWeight: 600 }}
                  labelStyle={{ color: '#a3a3a3', marginBottom: '4px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}
                  formatter={(value) => [formatLargeNumber(value), 'Projected Wealth']}
                  labelFormatter={(label) => `Age ${label}`}
                />
                <Area type="monotone" dataKey="Wealth" stroke="#818CF8" strokeWidth={2} fillOpacity={1} fill="url(#colorWealth)" style={{ transition: 'all 300ms ease' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
