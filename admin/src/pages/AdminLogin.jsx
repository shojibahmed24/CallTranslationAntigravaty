import React, { useState } from 'react';
import { Shield, KeyRound, Lock, ArrowRight, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { adminApi } from '../services/adminApi';

export default function AdminLogin({ onLoginSuccess }) {
  const [step, setStep] = useState(1); // 1: Email/Password, 2: 2FA TOTP
  const [email, setEmail] = useState('admin@unicom.global');
  const [password, setPassword] = useState('admin123456');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await adminApi.login(email, password);
      if (res.requires2FA) {
        setTwoFactorToken(res.twoFactorToken);
        if (res.qrCodeUrl) setQrCodeUrl(res.qrCodeUrl);
        setStep(2);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await adminApi.verify2FA(twoFactorToken, twoFactorCode);
      if (res.token) {
        adminApi.setToken(res.token);
        onLoginSuccess(res.admin);
      }
    } catch (err) {
      setError(err.message || 'Invalid 2FA Authenticator code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#060B13] p-4 relative overflow-hidden">
      {/* Glow Backdrops */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#0D1524] border border-slate-800/80 rounded-2xl p-8 shadow-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-400 mb-4 shadow-lg shadow-blue-500/20">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">UNICOM Admin Portal</h1>
          <p className="text-sm text-slate-400 mt-1">Universal Real-Time Communication Engine</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-red-950/40 border border-red-800/60 rounded-xl flex items-center gap-3 text-red-300 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Admin Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-[#131D31] border border-slate-700/60 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  placeholder="admin@unicom.global"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#131D31] border border-slate-700/60 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white font-medium py-3 rounded-xl shadow-lg shadow-blue-600/25 transition duration-150 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Verify Credentials'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center pt-2">
              <span className="text-xs text-slate-500">Secured with End-to-End Encrypted Session</span>
            </div>
          </form>
        ) : (
          <form onSubmit={handle2FASubmit} className="space-y-5">
            <div className="p-3 bg-blue-950/40 border border-blue-800/40 rounded-xl flex items-start gap-3 text-xs text-blue-200">
              <KeyRound className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-400" />
              <div>
                <p className="font-semibold text-blue-100">Two-Factor Authentication (2FA)</p>
                <p className="mt-0.5 text-slate-400">Enter the 6-digit TOTP security code from your Authenticator app.</p>
              </div>
            </div>

            {qrCodeUrl && (
              <div className="flex flex-col items-center p-4 bg-white rounded-xl mx-auto w-fit mb-4">
                <img src={qrCodeUrl} alt="2FA QR Code" className="w-32 h-32" />
                <p className="text-slate-900 text-xs font-semibold mt-2">Scan to setup 2FA</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider text-center">
                6-Digit Security Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                autoFocus
                required
                className="w-full bg-[#131D31] border border-slate-700/60 rounded-xl px-4 py-3.5 text-center text-2xl tracking-[0.5em] font-mono text-white placeholder-slate-600 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition"
              />
            </div>

            <div className="flex justify-between text-xs mt-3 px-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-slate-400 hover:text-white transition"
              >
                &larr; Back to Email
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || twoFactorCode.length < 6}
              className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white font-medium py-3 rounded-xl shadow-lg shadow-teal-500/25 transition duration-150 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {loading ? 'Verifying 2FA...' : 'Complete Secure Login'}
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
