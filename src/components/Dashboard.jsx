import InvestmentSimulator from './InvestmentSimulator';
import AIPlan from './AIPlan';
import Gamification from './Gamification';
import { Activity, ShieldCheck, Home, ArrowLeft } from 'lucide-react';

export default function Dashboard({ userProfile, onReset }) {
  return (
    <div className="space-y-8 animate-fade-in pb-16 pt-3 md:pt-5">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="h-5 w-5 text-brand-success" />
            <span className="text-amber-100/90 font-semibold tracking-[0.2em] text-xs uppercase">FutureYou Capital</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-light text-neutral-200 leading-tight">
            Welcome, <span className="font-semibold text-white">{userProfile.name}</span>.
          </h1>
          <p className="text-neutral-300/80 mt-3 text-sm tracking-wide max-w-xl">
            Your personalized strategy is calibrated to a {userProfile.risk.toLowerCase()} risk profile with focus on disciplined long-term compounding.
          </p>
        </div>
        
        <div className="flex gap-4 md:gap-4">
          <div className="flex bg-black/30 backdrop-blur-sm rounded-2xl p-4 items-center gap-5 border border-white/10 shadow-[0_14px_30px_rgba(4,8,16,0.3)]">
            <div className="p-3 bg-brand-accent/10 rounded-lg border border-brand-light/30">
              <Activity className="h-5 w-5 text-brand-light" />
            </div>
            <div>
              <p className="text-[10px] text-neutral-300/70 font-bold uppercase tracking-[0.15em] mb-1">Monthly Cashflow</p>
              <p className="text-2xl font-mono text-white tracking-tight">INR {Number(userProfile.income).toLocaleString()}</p>
            </div>
          </div>
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-5 py-3 bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-brand-light/40 text-neutral-300 hover:text-brand-light transition-all duration-300 shadow-[0_14px_30px_rgba(4,8,16,0.3)] font-medium"
            title="Go back to home/onboarding"
          >
            <Home className="h-4 w-4" />
            <span className="hidden md:inline text-sm">Home</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-7 h-full flex flex-col">
          <InvestmentSimulator userProfile={userProfile} />
        </div>

        <div className="xl:col-span-5 space-y-8 flex flex-col">
          <AIPlan userProfile={userProfile} />
          <Gamification userProfile={userProfile} />
        </div>
      </div>
    </div>
  );
}
