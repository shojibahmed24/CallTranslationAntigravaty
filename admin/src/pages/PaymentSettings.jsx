import React, { useState, useEffect } from 'react';
import { Settings, Shield, Save, Key, History, CheckCircle, AlertTriangle } from 'lucide-react';
import { adminApi } from '../services/adminApi';

export default function PaymentSettings() {
  const [settings, setSettings] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const [setRes, audRes] = await Promise.all([
        adminApi.getSettings(),
        adminApi.getAuditLogs()
      ]);
      setSettings(setRes.settings);
      setAuditLogs(audRes.auditLogs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!password) {
      alert('Please enter your Admin Confirmation Password to authorize financial & wallet updates.');
      return;
    }

    try {
      setSaving(true);
      setMessage('');
      const res = await adminApi.updateSettings(settings, password);
      setMessage('Payment and system configuration updated successfully.');
      setPassword('');
      fetchSettings();
    } catch (err) {
      alert('Failed to update settings: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <div className="text-center text-slate-400 p-12 text-sm">Loading payment parameters...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-teal-400" />
          Payment Gateway & Blockchain Wallet Settings
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Configure USDT (TRC-20) recipient address, subscription pricing tiers, and fair-use translation quotas.
        </p>
      </div>

      {message && (
        <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl flex items-center gap-2 text-emerald-300 text-xs">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* USDT Section */}
        <div className="bg-[#0F1829] border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-teal-400 text-sm font-bold">
            <Shield className="w-4 h-4" />
            USDT (TRC-20) Tron Blockchain Receiving Configuration
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                USDT (TRC-20) Receiving Wallet Address
              </label>
              <input
                type="text"
                value={settings.usdtWalletAddress}
                onChange={(e) => setSettings({ ...settings, usdtWalletAddress: e.target.value })}
                className="w-full bg-[#131D31] border border-slate-700 font-mono text-cyan-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-teal-400"
                required
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Displayed to international clients on the USDT payment screen.</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Network Descriptor
              </label>
              <input
                type="text"
                value={settings.usdtNetwork}
                onChange={(e) => setSettings({ ...settings, usdtNetwork: e.target.value })}
                className="w-full bg-[#131D31] border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-teal-400"
              />
            </div>
          </div>
        </div>

        {/* Local Payment Automation */}
        <div className="bg-[#0F1829] border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-blue-400 text-sm font-bold">
            <Shield className="w-4 h-4" />
            Bangladesh Local Payment Gateway (bKash / Nagad / SSLCommerz)
          </div>

          <div className="grid grid-cols-1 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Local Payment Processing Mode</label>
              <select
                value={settings.localPaymentMode || 'manual'}
                onChange={(e) => setSettings({ ...settings, localPaymentMode: e.target.value })}
                className="w-full bg-[#131D31] border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-400"
              >
                <option value="manual">Manual Mode (Users upload screenshot & TrxID, Admin approves)</option>
                <option value="automated">Automated Gateway Mode (SSLCommerz/bKash API)</option>
              </select>
              <span className="text-[11px] text-slate-500 mt-1 block">
                If 'Automated Gateway Mode' is selected, the platform will use real API integrations. Make sure your API keys (like SSLCommerz Store ID) are set in the backend `.env` file.
              </span>
            </div>
            
            {settings.localPaymentMode === 'manual' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mt-2">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    bKash / Nagad Number (For Manual mode)
                  </label>
                  <input
                    type="text"
                    value={settings.localBkashNumber || '01700000000'}
                    onChange={(e) => setSettings({ ...settings, localBkashNumber: e.target.value })}
                    className="w-full bg-[#131D31] border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pricing and Quota Tier Grid */}
        <div className="bg-[#0F1829] border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="text-white text-sm font-bold">Subscription Plan Pricing & Quota Limits</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Free */}
            <div className="p-4 bg-[#131D31] border border-slate-700/60 rounded-xl space-y-3">
              <span className="font-bold text-white uppercase tracking-wider text-[11px] block">Free Starter</span>
              <div>
                <label className="block text-slate-400 mb-1">Cloud Storage (GB)</label>
                <input
                  type="number"
                  value={settings.freeStorageGB}
                  onChange={(e) => setSettings({ ...settings, freeStorageGB: Number(e.target.value) })}
                  className="w-full bg-[#1A2740] border border-slate-600 rounded-lg px-3 py-1.5 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Daily Translation Mins</label>
                <input
                  type="number"
                  value={settings.freeCallMinutesDaily}
                  onChange={(e) => setSettings({ ...settings, freeCallMinutesDaily: Number(e.target.value) })}
                  className="w-full bg-[#1A2740] border border-slate-600 rounded-lg px-3 py-1.5 text-white"
                />
              </div>
            </div>

            {/* Pro */}
            <div className="p-4 bg-[#131D31] border border-blue-600/40 rounded-xl space-y-3">
              <span className="font-bold text-blue-300 uppercase tracking-wider text-[11px] block">Pro Freelancer</span>
              <div>
                <label className="block text-slate-400 mb-1">Monthly Price ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.proPlanPriceUSD}
                  onChange={(e) => setSettings({ ...settings, proPlanPriceUSD: Number(e.target.value) })}
                  className="w-full bg-[#1A2740] border border-blue-600/60 rounded-lg px-3 py-1.5 text-white font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Cloud Storage (GB)</label>
                <input
                  type="number"
                  value={settings.proStorageGB}
                  onChange={(e) => setSettings({ ...settings, proStorageGB: Number(e.target.value) })}
                  className="w-full bg-[#1A2740] border border-slate-600 rounded-lg px-3 py-1.5 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Monthly Translation Mins</label>
                <input
                  type="number"
                  value={settings.proCallMinutesMonthly}
                  onChange={(e) => setSettings({ ...settings, proCallMinutesMonthly: Number(e.target.value) })}
                  className="w-full bg-[#1A2740] border border-slate-600 rounded-lg px-3 py-1.5 text-white"
                />
              </div>
            </div>

            {/* Unlimited */}
            <div className="p-4 bg-[#131D31] border border-purple-600/40 rounded-xl space-y-3">
              <span className="font-bold text-purple-300 uppercase tracking-wider text-[11px] block">Unlimited / Business</span>
              <div>
                <label className="block text-slate-400 mb-1">Monthly Price ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.unlimitedPlanPriceUSD}
                  onChange={(e) => setSettings({ ...settings, unlimitedPlanPriceUSD: Number(e.target.value) })}
                  className="w-full bg-[#1A2740] border border-purple-600/60 rounded-lg px-3 py-1.5 text-white font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Cloud Storage (GB)</label>
                <input
                  type="number"
                  value={settings.unlimitedStorageGB}
                  onChange={(e) => setSettings({ ...settings, unlimitedStorageGB: Number(e.target.value) })}
                  className="w-full bg-[#1A2740] border border-slate-600 rounded-lg px-3 py-1.5 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Monthly Translation Mins</label>
                <input
                  type="number"
                  value={settings.unlimitedCallMinutesMonthly}
                  onChange={(e) => setSettings({ ...settings, unlimitedCallMinutesMonthly: Number(e.target.value) })}
                  className="w-full bg-[#1A2740] border border-slate-600 rounded-lg px-3 py-1.5 text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Authorization Footer */}
        <div className="bg-[#0F1829] border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Key className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <input
              type="password"
              placeholder="Enter Admin Password (admin123456) to confirm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[#131D31] border border-slate-700 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 w-full sm:w-80 focus:outline-none focus:border-amber-400"
              required
            />
          </div>

          <button
            type="submit"
            disabled={saving || !password}
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Applying...' : 'Save & Update Live System'}
          </button>
        </div>
      </form>

      {/* Audit Logs */}
      <div className="bg-[#0F1829] border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <History className="w-4 h-4 text-blue-400" />
          Financial & Setting Modification Audit Logs
        </div>
        <div className="space-y-2 text-xs">
          {auditLogs.map((log) => (
            <div key={log.id} className="p-3 bg-[#131D31] border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-semibold text-white">{log.action}</span>
                <p className="text-slate-400 mt-0.5">{log.details}</p>
              </div>
              <div className="text-right text-slate-500 text-[10px]">
                <p>{new Date(log.timestamp).toLocaleString()}</p>
                <p className="font-mono">{log.adminEmail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
