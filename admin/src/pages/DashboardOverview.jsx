import React, { useState, useEffect } from 'react';
import { 
  Users, PhoneCall, Clock, CreditCard, HardDrive, 
  Activity, ArrowUpRight, CheckCircle, AlertTriangle, 
  Radio, Sparkles, RefreshCw, Zap
} from 'lucide-react';
import { adminApi } from '../services/adminApi';

export default function DashboardOverview({ onNavigate }) {
  const [overview, setOverview] = useState(null);
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [overRes, telRes] = await Promise.all([
        adminApi.getOverview(),
        adminApi.getTelemetry()
      ]);
      setOverview(overRes.stats);
      setTelemetry(telRes.telemetry);
    } catch (err) {
      console.error('Failed to load overview:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // 10s auto-refresh
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Registered Users',
      value: overview?.totalUsers || 0,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      change: '+14% this week',
      onClick: () => onNavigate('users')
    },
    {
      title: 'Active Translated Calls',
      value: overview?.activeCallsCount || 0,
      icon: Radio,
      color: 'from-emerald-500 to-teal-500',
      change: 'Live simultaneous stream',
      badge: 'LIVE',
      onClick: () => onNavigate('simulator')
    },
    {
      title: 'Minutes Translated',
      value: `${overview?.totalMinutesTranslated || 0} m`,
      icon: Clock,
      color: 'from-cyan-500 to-blue-500',
      change: 'BN ↔ EN, HI ↔ EN, AR ↔ BN',
      onClick: () => onNavigate('analytics')
    },
    {
      title: 'Pending USDT (TRC-20)',
      value: overview?.pendingUsdtPayments || 0,
      icon: CreditCard,
      color: overview?.pendingUsdtPayments > 0 ? 'from-amber-500 to-orange-500' : 'from-slate-700 to-slate-800',
      change: overview?.pendingUsdtPayments > 0 ? 'Action required' : 'All verified',
      highlight: overview?.pendingUsdtPayments > 0,
      onClick: () => onNavigate('payments')
    },
    {
      title: 'Cloud Storage Utilized',
      value: `${overview?.totalStorageGB || 0} GB`,
      icon: HardDrive,
      color: 'from-indigo-500 to-purple-600',
      change: 'Docs, Images & Audio Quotas',
      onClick: () => onNavigate('settings')
    },
    {
      title: 'Interpretation Latency',
      value: `${overview?.avgLatencyMs || 120} ms`,
      icon: Zap,
      color: 'from-teal-500 to-emerald-600',
      change: `${overview?.successRatePercent || 99.8}% Call Success Rate`,
      onClick: () => onNavigate('analytics')
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            Real-time Telemetry & KPIs
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Engine Online
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Universal Simultaneous Interpretation Engine • Global Voice Signaling Gateway
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={refreshing}
            className="px-3.5 py-2 bg-[#131D31] hover:bg-[#1A2740] border border-slate-700/60 rounded-xl text-slate-300 hover:text-white text-xs font-medium transition flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-400' : ''}`} />
            Refresh Telemetry
          </button>
          <button
            onClick={() => onNavigate('simulator')}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white text-xs font-medium rounded-xl shadow-lg shadow-blue-600/20 transition flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Live Call Simulator
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={card.onClick}
              className={`p-5 rounded-2xl bg-[#0F1829] border transition duration-150 cursor-pointer relative overflow-hidden group ${
                card.highlight ? 'border-amber-500/50 shadow-lg shadow-amber-500/10' : 'border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">{card.title}</span>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${card.color} flex items-center justify-center shadow-md group-hover:scale-105 transition`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                <div className="text-2xl font-bold text-white tracking-tight">{card.value}</div>
                {card.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {card.badge}
                  </span>
                )}
              </div>

              <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
                <span>{card.change}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Real-time Call Activity Table */}
      <div className="bg-[#0F1829] border border-slate-800/80 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-teal-400" />
            <h2 className="text-base font-semibold text-white">Recent Real-time Translation Call Logs (Anonymous)</h2>
          </div>
          <span className="text-xs text-slate-400">Zero Audio Saved • Privacy Compliant</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium uppercase tracking-wider">
                <th className="pb-3 px-3">Call ID</th>
                <th className="pb-3 px-3">Language Pair</th>
                <th className="pb-3 px-3">Duration</th>
                <th className="pb-3 px-3">Avg Latency</th>
                <th className="pb-3 px-3">Barge-in / Interrupts</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {telemetry?.recentMetrics?.map((met) => (
                <tr key={met.id} className="hover:bg-slate-800/20 transition">
                  <td className="py-3.5 px-3 font-mono text-slate-300">{met.callId}</td>
                  <td className="py-3.5 px-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-950/60 text-blue-300 border border-blue-800/40 uppercase">
                      {met.pair}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-300">{met.durationSeconds}s</td>
                  <td className="py-3.5 px-3">
                    <span className="font-mono text-emerald-400">{met.avgLatencyMs} ms</span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-300">{met.bargeInEvents || 0} events</td>
                  <td className="py-3.5 px-3">
                    {met.success ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                        <CheckCircle className="w-3.5 h-3.5" /> High Quality
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-400 font-medium">
                        <AlertTriangle className="w-3.5 h-3.5" /> Glitch Reported
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-slate-400">
                    {new Date(met.timestamp).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
