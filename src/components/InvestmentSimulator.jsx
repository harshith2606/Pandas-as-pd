import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, CartesianGrid } from 'recharts';
import { TrendingUp, CheckCircle, XCircle, Wallet, Calendar } from 'lucide-react';

export default function InvestmentSimulator({ userProfile }) {
  const [savedAmountToday, setSavedAmountToday] = useState(1000);
  const [lifestyleCost, setLifestyleCost] = useState(50000); // Default ₹50,000 monthly
  
  const chartData = useMemo(() => {
    const data = [];
    const investReturn = 0.12; 
    const saveReturn = 0.03;
    
    for (let age = userProfile.age; age <= 60; age++) {
      let yearsElapsed = age - userProfile.age;
      data.push({
        age,
        Invested: Math.round(savedAmountToday * Math.pow(1 + investReturn, yearsElapsed)),
        Saved: Math.round(savedAmountToday * Math.pow(1 + saveReturn, yearsElapsed))
      });
    }
    return data;
  }, [userProfile.age, savedAmountToday]);

  const yearsToRetirement = 60 - userProfile.age;
  const wealthAt60 = Math.round(savedAmountToday * Math.pow(1.12, yearsToRetirement));
  const savingsAt60 = Math.round(savedAmountToday * Math.pow(1.03, yearsToRetirement));

  // Lifestyle calculator
  const basePortfolio = 50000;
  const totalPortfolio = wealthAt60 + basePortfolio;
  const inflatedMonthlyCost = lifestyleCost * Math.pow(1.06, yearsToRetirement);
  
  // To avoid division by zero or Infinity
  const monthsFunded = inflatedMonthlyCost > 0 
    ? Math.floor(totalPortfolio / inflatedMonthlyCost) 
    : 0;

  const formatCurrency = (val) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString()}`;
  };

  return (
    <div className="glass-card rounded-3xl p-6 md:p-8 flex flex-col h-full relative overflow-hidden group">
      
      <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-brand-accent/10 rounded-full blur-[100px] pointer-events-none transition-opacity duration-700 opacity-40 group-hover:opacity-80" />

      <h2 className="text-sm tracking-[0.2em] font-semibold uppercase flex items-center gap-2 mb-8 text-neutral-300">
        <TrendingUp className="text-brand-accent h-4 w-4" /> The Time Machine
      </h2>

      {/* Slider Controls */}
      <div className="mb-10 bg-black/25 rounded-xl p-5 border border-white/10 shadow-inner">
        <div className="flex justify-between items-end mb-4">
          <span className="text-xs uppercase tracking-widest font-bold text-neutral-300/90">Saved Amount Today (INR)</span>
          <div className="text-right">
            <span className="font-mono text-xl text-brand-light mr-2">₹{savedAmountToday.toLocaleString()}</span>
          </div>
        </div>
        <input 
          type="range" 
          min="100" max="10000" step="100"
          value={savedAmountToday}
          onChange={e => setSavedAmountToday(Number(e.target.value))}
          className="w-full h-[4px] bg-neutral-700 rounded-lg appearance-none cursor-pointer transition-all hover:bg-neutral-600 focus:outline-none"
        />
        <div className="flex justify-between text-[10px] text-neutral-400 font-mono mt-3">
          <span>₹100</span>
          <span>₹10,000</span>
        </div>
      </div>

      {/* Wealth Output Side-by-Side */}
      <div className="grid grid-cols-2 gap-4 text-center mb-8 relative z-10 bg-black/35 rounded-2xl p-6 border border-white/5">
        <div>
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-2">Present Value</p>
          <h3 className="text-3xl md:text-5xl font-light text-white tracking-tight drop-shadow-md">
            ₹{savedAmountToday.toLocaleString()}
          </h3>
        </div>
        <div className="border-l border-white/10">
          <p className="text-xs font-semibold text-brand-light uppercase tracking-widest mb-2">Value at Age 60</p>
          <h3 className="text-3xl md:text-5xl font-light text-brand-light tracking-tight drop-shadow-md">
            {formatCurrency(wealthAt60)}
          </h3>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[240px] w-full mb-8 relative z-10">
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
            <YAxis tickFormatter={(v) => `₹${v/1000}k`} stroke="#94A3B8" tick={{fill: '#CBD5E1', fontSize: 11}} tickLine={false} axisLine={false} />
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

      {/* Lifestyle Calculator */}
      <div className="mt-auto pt-6 border-t border-white/10 relative z-10">
        <h3 className="text-[11px] uppercase tracking-widest font-bold text-neutral-300 mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-brand-accent" /> Retirement Lifestyle Forecaster
        </h3>
        
        <div className="mb-5 relative group">
           <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-[0.16em] mb-2 transition-colors group-focus-within:text-brand-light">
             Expected Monthly Lifestyle Cost (in today's rupees)
           </label>
           <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Wallet className="h-4 w-4 text-neutral-500" />
             </div>
             <input 
               type="number" 
               min="1000"
               value={lifestyleCost}
               onChange={e => setLifestyleCost(Number(e.target.value))}
               className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all placeholder-neutral-600 font-mono text-sm"
             />
           </div>
        </div>

        <div className="p-5 rounded-xl bg-brand-accent/5 border border-brand-accent/20 transition-colors hover:bg-brand-accent/10">
          <p className="text-[13px] text-neutral-200 leading-relaxed font-medium">
            If you invest this today, your portfolio could fund <span className="text-xl font-bold text-brand-light mx-1">{monthsFunded}</span> months of your dream lifestyle in the future!
          </p>
          <p className="text-[10px] text-neutral-500 mt-3 font-mono">
            *Includes a baseline portfolio of ₹50,000. Assuming 12% compounding and 6% inflation.
          </p>
        </div>
      </div>

    </div>
  );
}
