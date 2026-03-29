import { useEffect, useState, useCallback } from 'react';
import { supabase } from './lib/supabase';
import Login from './components/Login';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import TopNav from './components/TopNav';
import ProfileSettings from './components/ProfileSettings';
import PlanSettings from './components/PlanSettings';
import ExpenseTracker from './components/ExpenseTracker';
import ProgressionMetricsPage from './components/ProgressionMetricsPage';

function App() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  const calculateAge = (dob) => {
    if (!dob) return 22; // fallback
    const birthDate = new Date(dob);
    const today = new Date();
    let computedAge = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      computedAge--;
    }
    return computedAge;
  };

  const hydrateSession = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setIsLoggedIn(true);
      setCurrentUserId(session.user.id || null);
      const metadata = session.user.user_metadata;
      if (metadata?.profile_data) {
        const reconstitutedProfile = { 
          ...metadata.profile_data, 
          name: metadata.full_name || 'Investor',
          age: calculateAge(metadata.dob)
        };
        setUserProfile(reconstitutedProfile);
        return { hasProfile: true, profile: reconstitutedProfile };
      }
    }
    setCurrentUserId(null);
    return { hasProfile: false, profile: null };
  }, []);

  useEffect(() => {
    const init = async () => {
      const { hasProfile, profile } = await hydrateSession();
      if (hasProfile) {
        setCurrentScreen('dashboard');
        window.history.replaceState({ screen: 'dashboard', userProfile: profile }, '', '/dashboard');
      } else if (isLoggedIn) {
        setCurrentScreen('onboarding');
        window.history.replaceState({ screen: 'onboarding', isLoggedIn: true }, '', '/setup');
      }
    };
    init();

    const handlePopState = (event) => {
      const state = event.state;
      if (state?.screen) {
        setCurrentScreen(state.screen);
        if (state.screen === 'dashboard' || state.screen === 'profile' || state.screen === 'plan-settings' || state.screen === 'expenses' || state.screen === 'progression') {
          setIsLoggedIn(true);
          setUserProfile(state.userProfile || null);
        } else if (state.screen === 'onboarding') {
          setIsLoggedIn(true);
          setUserProfile(null);
        } else {
          setIsLoggedIn(false);
          setUserProfile(null);
          setCurrentUserId(null);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    if (!window.history.state) {
      window.history.replaceState({ screen: 'login' }, '', '/');
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, [hydrateSession, isLoggedIn]);

  const handleLogin = async () => {
    setIsLoggedIn(true);
    const { hasProfile, profile } = await hydrateSession();
    if (hasProfile) {
      setCurrentScreen('dashboard');
      window.history.pushState({ screen: 'dashboard', userProfile: profile }, '', '/dashboard');
    } else {
      setCurrentScreen('onboarding');
      window.history.pushState({ screen: 'onboarding', isLoggedIn: true }, '', '/setup');
    }
  };

  const handleComplete = async (profile) => {
    const { data: { session } } = await supabase.auth.getSession();
    const metadata = session?.user?.user_metadata || {};
    const fullName = metadata.full_name || 'Investor';
    const dynamicAge = calculateAge(metadata.dob);

    const completeProfile = { ...profile, name: fullName, age: dynamicAge };
    setUserProfile(completeProfile);
    setCurrentScreen('dashboard');
    window.history.pushState({ screen: 'dashboard', userProfile: completeProfile }, '', '/dashboard');

    await supabase.auth.updateUser({
      data: { profile_data: profile }
    });
  };

  const handleEditAnswers = () => {
    setCurrentScreen('plan-settings');
    window.history.pushState({ screen: 'plan-settings', userProfile, isLoggedIn: true }, '', '/plan-settings');
  };

  const handlePlanSave = async (updatedPlanData) => {
    const { data: { session } } = await supabase.auth.getSession();
    const metadata = session?.user?.user_metadata || {};
    const fullName = metadata.full_name || userProfile?.name || 'Investor';
    const dynamicAge = calculateAge(metadata.dob);

    const completeProfile = { ...updatedPlanData, name: fullName, age: dynamicAge };
    setUserProfile(completeProfile);
    setCurrentScreen('dashboard');
    window.history.pushState({ screen: 'dashboard', userProfile: completeProfile }, '', '/dashboard');

    await supabase.auth.updateUser({
      data: { profile_data: updatedPlanData }
    });
  };

  const handlePlanCancel = () => {
    setCurrentScreen('dashboard');
    window.history.pushState({ screen: 'dashboard', userProfile, isLoggedIn: true }, '', '/dashboard');
  };

  const navigateTo = (screen) => {
    setCurrentScreen(screen);
    window.history.pushState({ screen, userProfile, isLoggedIn: true }, '', `/${screen}`);
  };

  const handleSignOut = () => {
    setIsLoggedIn(false);
    setUserProfile(null);
    setCurrentUserId(null);
    setCurrentScreen('login');
    window.history.pushState({ screen: 'login' }, '', '/');
  };

  const handleProfileSave = async () => {
    await hydrateSession();
    // After saving, keep them on the profile page but state is refreshed safely
  };

  return (
    <div className="min-h-screen bg-atmosphere text-slate-100 font-sans relative overflow-x-hidden">
      <div className="pointer-events-none absolute -top-20 right-[8%] h-64 w-64 rounded-full bg-brand-accent/10 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute top-[28%] -left-20 h-56 w-56 rounded-full bg-amber-200/10 blur-3xl animate-float-slow" />

      <main className="container mx-auto max-w-6xl p-4 sm:p-6 lg:p-10 relative z-10 flex flex-col min-h-[90vh]">
        
        {isLoggedIn && currentScreen !== 'login' && currentScreen !== 'onboarding' && (
          <TopNav 
            currentScreen={currentScreen} 
            onNavigate={navigateTo} 
            onSignOut={handleSignOut}
          />
        )}

        <div className="flex-1">
          {currentScreen === 'login' && <Login onLogin={handleLogin} />}
          {currentScreen === 'onboarding' && <Onboarding onComplete={handleComplete} />}
          {currentScreen === 'dashboard' && (
            <Dashboard
              userProfile={userProfile}
              onEditAnswers={handleEditAnswers}
            />
          )}
          {currentScreen === 'profile' && <ProfileSettings userProfile={userProfile} onProfileUpdate={handleProfileSave} />}
          {currentScreen === 'plan-settings' && (
            <PlanSettings
              initialData={userProfile}
              onSave={handlePlanSave}
              onCancel={handlePlanCancel}
            />
          )}
          {currentScreen === 'expenses' && <ExpenseTracker userProfile={userProfile} userId={currentUserId} />}
          {currentScreen === 'progression' && <ProgressionMetricsPage userProfile={userProfile} />}
        </div>
        
      </main>
    </div>
  );
}

export default App;
