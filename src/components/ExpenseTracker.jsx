import { useEffect, useMemo, useState } from 'react';
import { ReceiptIndianRupee, Plus, Trash2, Sparkles, Loader2, Lightbulb } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
const LEGACY_EXPENSES_STORAGE_KEY = 'genz_expenses';

const getExpensesStorageKey = (userId) => {
  if (!userId) return LEGACY_EXPENSES_STORAGE_KEY;
  return `genz_expenses:${userId}`;
};

export default function ExpenseTracker({ userProfile, userId }) {
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [insightError, setInsightError] = useState('');
  const [insightData, setInsightData] = useState(null);

  const storageKey = getExpensesStorageKey(userId);

  useEffect(() => {
    try {
      const scopedRaw = localStorage.getItem(storageKey);
      if (scopedRaw) {
        const scopedParsed = JSON.parse(scopedRaw);
        setExpenses(Array.isArray(scopedParsed) ? scopedParsed : []);
        return;
      }

      // One-time migration path from old global key.
      const legacyRaw = localStorage.getItem(LEGACY_EXPENSES_STORAGE_KEY);
      if (!legacyRaw) {
        setExpenses([]);
        return;
      }

      const legacyParsed = JSON.parse(legacyRaw);
      if (!Array.isArray(legacyParsed)) {
        setExpenses([]);
        return;
      }

      setExpenses(legacyParsed);
      localStorage.setItem(storageKey, JSON.stringify(legacyParsed));
    } catch {
      setExpenses([]);
    }
  }, [storageKey]);

  const totalTracked = useMemo(
    () => expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [expenses]
  );

  const addExpense = () => {
    if (!category.trim() || !amount || Number(amount) <= 0) return;

    setExpenses((prev) => {
      const updatedExpenses = [
        ...prev,
        {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        category: category.trim(),
        amount: Number(amount)
        }
      ];

      localStorage.setItem(storageKey, JSON.stringify(updatedExpenses));
      return updatedExpenses;
    });

    setCategory('');
    setAmount('');
    setInsightData(null);
    setInsightError('');
  };

  const removeExpense = (id) => {
    setExpenses((prev) => {
      const updatedExpenses = prev.filter((item) => item.id !== id);
      localStorage.setItem(storageKey, JSON.stringify(updatedExpenses));
      return updatedExpenses;
    });
    setInsightData(null);
    setInsightError('');
  };

  const fetchInsights = async () => {
    if (expenses.length === 0 || loadingInsights) return;

    setLoadingInsights(true);
    setInsightError('');

    try {
      const response = await fetch(`${API_BASE}/api/expense-insights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          income: Number(userProfile?.income || 0),
          baselineExpenses: Number(userProfile?.expenses || 0),
          expenses
        })
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || 'Failed to generate expense insights.');
      }

      setInsightData(payload.insights || null);
    } catch (err) {
      console.error(err);
      setInsightError(err.message || 'Failed to analyze expenses.');
    } finally {
      setLoadingInsights(false);
    }
  };

  return (
    <div className="glass-card rounded-3xl p-6 md:p-8 space-y-6">
      <div>
        <h2 className="text-sm tracking-[0.2em] font-semibold uppercase flex items-center gap-2 text-neutral-300">
          <ReceiptIndianRupee className="text-brand-light h-4 w-4" /> Expense Tracker
        </h2>
        <p className="text-xs text-neutral-400 mt-2 max-w-2xl leading-relaxed">
          Add your real monthly expense entries by category, then run AI analysis to identify where you can save.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr_auto] gap-3">
        <input
          type="text"
          placeholder="Expense category (e.g. Food Delivery)"
          className="w-full bg-black/30 border border-white/15 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-light focus:ring-2 focus:ring-brand-light/20 transition placeholder-neutral-500"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-500 font-mono">₹</span>
          <input
            type="number"
            min="0"
            placeholder="Amount"
            className="w-full bg-black/30 border border-white/15 rounded-xl pl-9 pr-4 py-3 text-white focus:outline-none focus:border-brand-light focus:ring-2 focus:ring-brand-light/20 transition placeholder-neutral-500 font-mono"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <button
          type="button"
          onClick={addExpense}
          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-light hover:bg-teal-400 text-slate-900 font-semibold transition"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs uppercase tracking-[0.14em] font-semibold text-neutral-400">Tracked Expenses</p>
          <p className="text-sm font-mono text-neutral-200">Total: ₹{Math.round(totalTracked).toLocaleString('en-IN')}</p>
        </div>

        {expenses.length === 0 ? (
          <p className="text-sm text-neutral-500">No expenses added yet.</p>
        ) : (
          <div className="space-y-2">
            {expenses.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-3 py-2.5">
                <div>
                  <p className="text-sm text-neutral-200">{item.category}</p>
                  <p className="text-[11px] text-neutral-500">Monthly spend</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-mono text-neutral-200">₹{Math.round(item.amount).toLocaleString('en-IN')}</p>
                  <button
                    type="button"
                    onClick={() => removeExpense(item.id)}
                    className="text-rose-300 hover:text-rose-200 transition"
                    title="Remove expense"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <button
          type="button"
          onClick={fetchInsights}
          disabled={expenses.length === 0 || loadingInsights}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-300 text-slate-950 text-xs uppercase tracking-[0.12em] font-bold hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingInsights ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loadingInsights ? 'Analyzing...' : 'AI Insight For Expenses'}
        </button>
        <p className="text-xs text-neutral-500">AI suggests practical cuts without forcing unrealistic budgets.</p>
      </div>

      {insightError ? (
        <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 px-4 py-3 text-sm text-rose-200">{insightError}</div>
      ) : null}

      {insightData ? (
        <div className="rounded-2xl border border-brand-light/20 bg-brand-accent/5 p-5 space-y-4">
          <h3 className="text-xs uppercase tracking-[0.14em] font-semibold text-brand-light flex items-center gap-2">
            <Lightbulb className="w-4 h-4" /> AI Expense Insights
          </h3>

          <p className="text-sm text-neutral-200 leading-relaxed">{insightData.overall_observation}</p>

          {Array.isArray(insightData.savings_opportunities) && insightData.savings_opportunities.length > 0 ? (
            <div className="space-y-2">
              {insightData.savings_opportunities.map((item, idx) => (
                <div key={`${item.category}-${idx}`} className="rounded-xl border border-white/10 bg-black/25 px-3 py-2.5">
                  <p className="text-sm text-white font-medium">{item.category}</p>
                  <p className="text-xs text-neutral-300 mt-1">{item.advice}</p>
                  <p className="text-[11px] text-brand-light font-mono mt-1.5">
                    Potential monthly savings: ₹{Math.round(Number(item.estimated_monthly_savings_inr || 0)).toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
          ) : null}

          {Array.isArray(insightData.quick_actions) && insightData.quick_actions.length > 0 ? (
            <ul className="space-y-1 text-xs text-neutral-300">
              {insightData.quick_actions.map((action, idx) => (
                <li key={`${action}-${idx}`}>• {action}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
