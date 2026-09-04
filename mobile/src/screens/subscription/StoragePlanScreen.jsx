import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, Award, HardDrive, Clock, CreditCard, Sparkles, Shield } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function StoragePlanScreen({ onBack, onSelectLocalPay }) {
  const { user, refreshUser } = useAuth();
  const { isDarkMode, t } = useTheme();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await api.getPlansAndWallet();
        setPlans(res.plans);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleStripeCard = async (planId) => {
    if (user?.plan === planId) return;
    try {
      setSubscribing(true);
      await api.createStripeCheckout(planId);
      alert(`Subscription to ${planId.toUpperCase()} plan activated successfully!`);
      await refreshUser();
    } catch (err) {
      alert('Card checkout failed: ' + err.message);
    } finally {
      setSubscribing(false);
    }
  };

  const currentPlanId = user?.plan || 'free';

  return (
    <div className={`min-h-[100dvh] flex flex-col px-4 pt-[max(env(safe-area-inset-top),1rem)] pb-[max(env(safe-area-inset-bottom),1rem)] max-w-md mx-auto ${
      isDarkMode ? 'bg-[#080E18] text-white' : 'bg-[#F8FAFC] text-slate-900'
    }`}>
      {/* Top Header */}
      <div className="flex items-center gap-3 py-2">
        <button
          onClick={onBack}
          className="p-2 rounded-xl text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base font-bold">Call Translation Minute Plans</h1>
          <p className="text-[11px] text-slate-400">Recharge to get more realtime translation minutes</p>
        </div>
      </div>

      {/* Plan Cards List */}
      <div className="space-y-4 my-4 flex-1 overflow-y-auto">
        {plans.map((p) => {
          const isCurrent = currentPlanId === p.id;
          const isPro = p.id === 'pro';
          const isUnlimited = p.id === 'unlimited';

          return (
            <div
              key={p.id}
              className={`p-5 rounded-3xl border transition relative overflow-hidden ${
                isPro
                  ? 'bg-gradient-to-tr from-blue-950/60 to-slate-900 border-blue-500/60 shadow-xl'
                  : isUnlimited
                  ? 'bg-gradient-to-tr from-purple-950/60 to-slate-900 border-purple-500/60 shadow-xl'
                  : isDarkMode
                  ? 'bg-[#0F1829] border-slate-800'
                  : 'bg-white border-slate-200'
              }`}
            >
              {isPro && (
                <span className="absolute top-4 right-4 text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-500 text-white tracking-wider shadow">
                  RECOMMENDED FOR FREELANCERS
                </span>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-white">{p.name}</h3>
                  <p className="text-xl font-black text-teal-400 mt-0.5">
                    {p.priceUSD === 0 ? 'Free' : `$${p.priceUSD}/month`}
                  </p>
                </div>
              </div>

              <div className="my-4 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-200 font-semibold">
                  <Clock className="w-4 h-4 text-teal-400" />
                  <span>{p.translatedMinutesMonthly ? `${p.translatedMinutesMonthly} Mins/Month` : `${p.translatedMinutesDaily} Mins/Day`} Voice Interpretation</span>
                </div>
                {p.features?.map((f, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-slate-400 text-[11px]">
                    <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              {isCurrent ? (
                <div className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-400 text-center font-bold text-xs border border-slate-700">
                  Current Active Plan
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => handleStripeCard(p.id)}
                    disabled={subscribing}
                    className="py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center gap-1.5"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Card (Stripe)
                  </button>

                  <button
                    onClick={() => onSelectLocalPay(p)}
                    className="py-2.5 px-3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Pay Local (bKash/Nagad)
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
