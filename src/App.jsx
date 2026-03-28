import { useState } from 'react';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';

function App() {
  const [userProfile, setUserProfile] = useState(null);

  const handleReset = () => {
    setUserProfile(null);
  };

  return (
    <div className="min-h-screen bg-atmosphere text-slate-100 font-sans relative overflow-x-hidden">
      <div className="pointer-events-none absolute -top-20 right-[8%] h-64 w-64 rounded-full bg-brand-accent/10 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute top-[28%] -left-20 h-56 w-56 rounded-full bg-amber-200/10 blur-3xl animate-float-slow" />

      <main className="container mx-auto max-w-6xl p-4 sm:p-6 lg:p-10 relative z-10">
        {!userProfile ? (
          <Onboarding onComplete={setUserProfile} />
        ) : (
          <Dashboard userProfile={userProfile} onReset={handleReset} />
        )}
      </main>
    </div>
  );
}

export default App;
