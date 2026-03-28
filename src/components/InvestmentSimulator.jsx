import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, CartesianGrid } from 'recharts';
import { TrendingUp, CheckCircle, XCircle } from 'lucide-react';

export default function InvestmentSimulator({ userProfile }) {
  const [investPercent, setInvestPercent] = useState(20);
  const monthlyContribution = (userProfile.income * investPercent) / 100;
  
  const chartData = useMemo(() => {
    const data = [];
    let investedWealth = 0;
    let savedWealth = 0;
    
    // Adjusted realistic returns for formal Gen Z plan (e.g., S&P 500 index)
    const investReturn = 0.10; 
    const saveReturn = 0.03;
    
    for (let age = userProfile.age; age <= 60; age++) {
      data.push({
        age,
        Invested: Math.round(investedWealth),
        Saved: Math.round(savedWealth)
      });
      investedWealth = (investedWealth + (monthlyContribution * 12)) * (1 + investReturn);
      savedWealth = (savedWealth + (monthlyContribution * 12)) * (1 + saveReturn);
    }
    return data;
  }, [userProfile.age, monthlyContribution]);

  const wealthAt60 = chartData[chartData.length - 1]?.Invested || 0;
  const savingsAt60 = chartData[chartData.length - 1]?.Saved || 0;

  const formatCurrency = (val) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString()}`;
  };

  return (
    <div className="glass-card rounded-3xl p-6 md:p-8 flex flex-col h-full relative overflow-hidden group">
      
      <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-brand-accent/10 rounded-full blur-[100px] pointer-events-none transition-opacity duration-700 opacity-40 group-hover:opacity-80" />

      <h2 className="text-sm tracking-[0.2em] font-semibold uppercase flex items-center gap-2 mb-8 text-neutral-300">
        <TrendingUp className="text-brand-accent h-4 w-4" /> Wealth Projection Model
      </h2>

      <div className="mb-10 bg-black/25 rounded-xl p-5 border border-white/10 shadow-inner">
        <div className="flex justify-between items-end mb-4">
          <span className="text-xs uppercase tracking-widest font-bold text-neutral-300/90">Monthly Contribution</span>
          <div className="text-right">
            <span className="font-mono text-xl text-white mr-2">INR {monthlyContribution.toLocaleString()}</span>
            <span className="text-brand-light font-semibold bg-brand-accent/15 py-1 px-2 rounded text-sm">{investPercent}%</span>
          </div>
        </div>
        <input 
          type="range" 
          min="0" max="50" step="1"
          value={investPercent}
          onChange={e => setInvestPercent(Number(e.target.value))}
          className="w-full h-[4px] bg-neutral-700 rounded-lg appearance-none cursor-pointer transition-all hover:bg-neutral-600 focus:outline-none"
        />
        <div className="flex justify-between text-[10px] text-neutral-400 font-mono mt-3">
          <span>MIN</span>
          <span>50%</span>
        </div>
      </div>

      <div className="text-center mb-8 relative z-10">
        <p className="text-xs font-semibold text-neutral-300 uppercase tracking-widest mb-3">Projected Net Worth at Age 60</p>
        <h3 className="text-5xl md:text-7xl font-light text-white mb-4 tracking-tight drop-shadow-md">
          {formatCurrency(wealthAt60)}
        </h3>
        <span className="inline-flex items-center gap-2 bg-black/35 border border-white/10 px-3 py-1.5 rounded-full text-xs font-mono text-neutral-200">
          <div className="w-2 h-2 rounded-full bg-neutral-600 shrink-0" />
          <span>vs {formatCurrency(savingsAt60)} via standard bank savings</span>
        </span>
      </div>

      <div className="h-[280px] w-full mt-auto mb-8 relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 20, right: 0, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.26}/>
                <stop offset="95%" stopColor="#14B8A6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="age" stroke="#94A3B8" tick={{fill: '#CBD5E1', fontSize: 11}} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={(v) => `₹${v/100000}L`} stroke="#94A3B8" tick={{fill: '#CBD5E1', fontSize: 11}} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px', color: '#fff', fontSize: '13px', boxShadow: '0 8px 24px rgba(2,6,23,0.55)' }}
              itemStyle={{ color: '#fff', fontWeight: 600 }}
              labelStyle={{ color: '#cbd5e1', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}
              formatter={(value, name) => [formatCurrency(value), name === 'Invested' ? 'Market Portfolio' : 'Cash Deposit']}
              labelFormatter={(label) => `Age ${label}`}
            />
            <Area type="monotone" dataKey="Invested" stroke="#2DD4BF" strokeWidth={2.2} fillOpacity={1} fill="url(#colorInvested)" />
            <Line type="monotone" dataKey="Saved" stroke="#94A3B8" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
        <div className="p-5 rounded-xl bg-black/30 border border-white/10">
          <p className="text-[10px] text-neutral-300 font-bold uppercase tracking-[0.1em] mb-4 flex items-center gap-2">
            <XCircle className="w-3 h-3" /> Baseline Scenario
          </p>
          <ul className="text-sm text-neutral-200/85 space-y-3 font-medium">
            <li className="flex items-start gap-2"><div className="w-1 h-1 rounded-full bg-neutral-600 mt-2 shrink-0"/> Susceptible to inflation erosion</li>
            <li className="flex items-start gap-2"><div className="w-1 h-1 rounded-full bg-neutral-600 mt-2 shrink-0"/> Standard retirement timeline</li>
            <li className="flex items-start gap-2"><div className="w-1 h-1 rounded-full bg-neutral-600 mt-2 shrink-0"/> High reliance on active income</li>
          </ul>
        </div>
        <div className="p-5 rounded-xl bg-brand-accent/10 border border-brand-accent/35 transition-colors hover:bg-brand-accent/15">
          <p className="text-[10px] text-brand-light font-bold uppercase tracking-[0.1em] mb-4 flex items-center gap-2">
            <CheckCircle className="w-3 h-3" /> Accelerated Scenario
          </p>
          <ul className="text-sm text-neutral-100 space-y-3 font-medium">
            <li className="flex items-start gap-2"><div className="w-1 h-1 rounded-full bg-brand-accent mt-2 shrink-0"/> Outpaces inflation impact</li>
            <li className="flex items-start gap-2"><div className="w-1 h-1 rounded-full bg-brand-accent mt-2 shrink-0"/> Early financial independence</li>
            <li className="flex items-start gap-2"><div className="w-1 h-1 rounded-full bg-brand-accent mt-2 shrink-0"/> Passive income compounding</li>
          </ul>
        </div>
      </div>

    </div>
  );
}
