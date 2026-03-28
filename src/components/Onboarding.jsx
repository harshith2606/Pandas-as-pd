import { useState, useEffect } from 'react';
import { ArrowRight, BriefcaseBusiness } from 'lucide-react';

const INTERESTS = ['Gaming', 'Music', 'Sports', 'Tech', 'Travel', 'Fashion', 'Food'];
const RISK_LEVELS = ['Conservative (Low)', 'Balanced (Medium)', 'Aggressive (High)'];

export default function Onboarding({ onComplete }) {
  const [formData, setFormData] = useState({
    name: '',
    age: 22,
    income: '',
    interests: [],
    risk: ''
  });

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const toggleInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.income || !formData.risk || formData.interests.length === 0) return;
    
    // Convert risk back to concise format
    const riskLevel = formData.risk.split(' ')[0];
    onComplete({ ...formData, risk: riskLevel });
  };

  return (
    <div className={`max-w-md md:max-w-3xl mx-auto py-10 md:py-16 px-4 transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      <div className="text-center mb-10 md:mb-12 animate-reveal" style={{ animationDelay: '0.1s' }}>
        <span className="signal-chip mb-5">
          <BriefcaseBusiness className="w-3.5 h-3.5 text-brand-light" />
          FutureYou Advisory Desk
        </span>
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-white leading-[1.05] mb-4">
          Build a <span className="font-serif text-amber-100 italic font-medium">credible plan</span> for your next decade.
        </h1>
        <p className="text-neutral-300/90 text-sm md:text-base font-medium tracking-wide max-w-xl mx-auto">
          Answer a few practical questions and get a strategic path that is realistic, structured, and still built around your lifestyle.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 glass-card p-6 md:p-10 rounded-3xl animate-reveal soft-outline" style={{ animationDelay: '0.2s' }}>
        
        {/* Name */}
        <div className="group">
          <label className="block text-xs font-bold text-neutral-400 uppercase tracking-[0.16em] mb-2 transition-colors group-focus-within:text-brand-light">Name</label>
          <input 
            type="text" 
            placeholder="e.g. Alex"
            className="w-full bg-black/30 border border-white/15 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-light focus:ring-2 focus:ring-brand-light/20 transition placeholder-neutral-500"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>

        {/* Age Slider */}
        <div className="group">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-[0.16em] transition-colors group-focus-within:text-brand-light">Current Age</label>
            <span className="text-white font-mono text-lg bg-black/40 px-3 py-1 rounded-md border border-white/10">{formData.age}</span>
          </div>
          <input 
            type="range" 
            min="18" max="30" 
            value={formData.age}
            onChange={e => setFormData({...formData, age: Number(e.target.value)})}
            className="w-full h-1.5 bg-slate-700/70 rounded-lg appearance-none cursor-pointer mt-2"
          />
          <div className="flex justify-between text-[11px] text-neutral-500 mt-2">
            <span>18</span>
            <span>30</span>
          </div>
        </div>

        {/* Income */}
        <div className="group">
          <label className="block text-xs font-bold text-neutral-400 uppercase tracking-[0.16em] mb-2 transition-colors group-focus-within:text-brand-light">Monthly Discretionary Income (INR)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-neutral-500 font-mono">₹</span>
            </div>
            <input 
              type="number" 
              min="0"
              placeholder="10,000"
              className="w-full bg-black/30 border border-white/15 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-brand-light focus:ring-2 focus:ring-brand-light/20 transition placeholder-neutral-500 font-mono"
              value={formData.income}
              onChange={e => setFormData({...formData, income: e.target.value})}
              required
            />
          </div>
        </div>

        {/* Interests */}
        <div>
          <label className="block text-xs font-bold text-neutral-400 uppercase tracking-[0.16em] mb-3">Core Interests <span className="normal-case text-neutral-500 font-normal italic tracking-normal ml-1">(Select all that apply)</span></label>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map(interest => {
              const selected = formData.interests.includes(interest);
              return (
                <button
                  type="button"
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                    selected 
                    ? 'bg-brand-accent/15 border-brand-light text-white shadow-[0_0_0_2px_rgba(20,184,166,0.1)]' 
                    : 'bg-black/25 text-neutral-300 hover:bg-black/45 border-white/10 hover:border-white/25'
                  }`}
                >
                  {interest}
                </button>
              )
            })}
          </div>
        </div>

        {/* Risk */}
        <div>
          <label className="block text-xs font-bold text-neutral-400 uppercase tracking-[0.16em] mb-3">Investment Risk Profile</label>
          <div className="flex flex-col sm:flex-row gap-3">
            {RISK_LEVELS.map(level => {
              const selected = formData.risk === level;
              return (
                <button
                  type="button"
                  key={level}
                  onClick={() => setFormData({...formData, risk: level})}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm text-left sm:text-center transition-all border ${
                    selected 
                    ? 'bg-brand-accent/10 border-brand-light text-brand-light font-semibold shadow-inner' 
                    : 'bg-black/25 border-white/10 text-neutral-300 hover:bg-black/45 hover:border-white/25'
                  }`}
                >
                  {level}
                </button>
              )
            })}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4">
          <button 
            type="submit"
            disabled={!formData.name || !formData.income || !formData.risk || formData.interests.length === 0}
            className="w-full group relative flex items-center justify-center gap-3 bg-gradient-to-r from-teal-500 to-cyan-400 hover:brightness-110 text-slate-950 font-semibold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">Generate My Strategy <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" /></span>
          </button>
          <p className="text-center text-xs text-neutral-400 mt-3">Your data stays in this session and powers personalized projections only.</p>
        </div>

      </form>
    </div>
  );
}
