import React, { useState } from 'react';
import { Phone, ArrowRight, Shield, Globe, UserCheck, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../../services/firebase';

export default function PhoneLoginScreen({ onCodeSent, onDemoSelect }) {
  const { loginWithPhone } = useAuth();
  const { isDarkMode, t } = useTheme();

  const [countryCode, setCountryCode] = useState('+880');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [loading, setLoading] = useState(false);
  const [isTestMode, setIsTestMode] = useState(true);
  const [error, setError] = useState('');

  const countryList = [
    { name: 'Bangladesh', code: '+880', flag: '🇧🇩' },
    { name: 'United States', code: '+1', flag: '🇺🇸' },
    { name: 'India', code: '+91', flag: '🇮🇳' },
    { name: 'United Arab Emirates', code: '+971', flag: '🇦🇪' },
    { name: 'United Kingdom', code: '+44', flag: '🇬🇧' },
    { name: 'Saudi Arabia', code: '+966', flag: '🇸🇦' }
  ];

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible'
      });
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    const fullPhone = `${countryCode}${phoneNumber.trim()}`;
    setLoading(true);

    try {
      if (isTestMode) {
        // Bypass Firebase and use custom backend logic
        await loginWithPhone(fullPhone, mode);
        onCodeSent(fullPhone, null); // null confirmation result means use backend verification
      } else {
        // Use Firebase Phone Auth
        setupRecaptcha();
        const appVerifier = window.recaptchaVerifier;
        const confirmationResult = await signInWithPhoneNumber(auth, fullPhone, appVerifier);
        onCodeSent(fullPhone, confirmationResult);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to send SMS OTP code.');
      setLoading(false);
    }
  };

  return (
    <div className={`relative min-h-[100dvh] flex flex-col justify-between p-6 max-w-md mx-auto overflow-hidden ${
      isDarkMode ? 'bg-[#080E18] text-white' : 'bg-[#F8FAFC] text-slate-900'
    }`}>
      {/* Animated Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }} 
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[20%] w-[70vw] h-[70vw] bg-blue-600/20 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.5, 1], rotate: [0, -90, 0] }} 
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -right-[20%] w-[80vw] h-[80vw] bg-teal-500/20 rounded-full blur-[120px]"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 pt-10 text-center space-y-4"
      >
        <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 to-teal-400 shadow-2xl shadow-blue-600/30">
          <Globe className="w-10 h-10 text-white" />
          <motion.div 
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-3xl border-2 border-white/30"
          />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">{t('appName')}</h1>
          <p className="text-sm text-slate-400 font-medium mt-1">{t('tagline')}</p>
        </div>
      </motion.div>

      {/* Login Form Box - Glassmorphism */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className={`relative z-10 p-6 rounded-3xl border shadow-2xl space-y-6 my-auto backdrop-blur-xl ${
          isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/40'
        }`}
      >
        <div className="flex p-1 bg-black/10 rounded-xl">
          <button 
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${mode === 'login' ? (isDarkMode ? 'bg-white/20 text-white shadow' : 'bg-white text-slate-900 shadow') : 'text-slate-400 hover:text-slate-300'}`}
          >
            Login
          </button>
          <button 
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${mode === 'register' ? (isDarkMode ? 'bg-white/20 text-white shadow' : 'bg-white text-slate-900 shadow') : 'text-slate-400 hover:text-slate-300'}`}
          >
            Sign Up
          </button>
        </div>

        <div className="text-center">
          <h2 className="text-xl font-bold">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="text-xs text-slate-400 mt-1.5 px-2">
            {mode === 'login' 
              ? 'Enter your mobile number to log in securely.' 
              : 'Enter your mobile number to join globally. We\'ll send a verification code.'}
          </p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs text-center font-medium">
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSendOtp} className="space-y-5">
          <div id="recaptcha-container"></div>
          <div className="flex gap-2.5">
            <div className={`relative flex items-center rounded-2xl border transition-all focus-within:ring-2 focus-within:ring-blue-500/50 ${
                isDarkMode ? 'bg-black/20 border-white/10' : 'bg-white border-slate-200'
            }`}>
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className={`w-28 pl-3 pr-2 py-3.5 rounded-2xl text-sm font-semibold appearance-none bg-transparent outline-none ${
                  isDarkMode ? 'text-white' : 'text-slate-800'
                }`}
              >
                {countryList.map((c) => (
                  <option key={c.code} value={c.code} className="text-slate-900">
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>
            </div>

            <div className={`relative flex-1 flex items-center rounded-2xl border transition-all focus-within:ring-2 focus-within:ring-blue-500/50 ${
              isDarkMode ? 'bg-black/20 border-white/10' : 'bg-white border-slate-200'
            }`}>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="1811223344"
                required
                className={`w-full px-4 py-3.5 bg-transparent rounded-2xl text-base font-semibold tracking-wide outline-none ${
                  isDarkMode ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>
          </div>

          <div className={`flex items-center justify-between p-3 rounded-xl border ${isDarkMode ? 'bg-black/20 border-white/10' : 'bg-white border-slate-200'}`}>
            <span className="text-sm font-medium">
              <span className="text-blue-500 font-bold">Test Mode</span> (Bypass SMS)
            </span>
            <button 
              type="button"
              onClick={() => setIsTestMode(!isTestMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isTestMode ? 'bg-blue-600' : 'bg-slate-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isTestMode ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || !phoneNumber.trim()}
            className="relative w-full py-4 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white font-bold rounded-2xl text-sm shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 overflow-hidden group"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span className="relative z-10">Send OTP Code</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </motion.button>
          <div className="text-center mt-4 text-[10px] opacity-50">
            This site is protected by reCAPTCHA and the Google <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="underline">Privacy Policy</a> and <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer" className="underline">Terms of Service</a> apply.
          </div>
        </form>

      </motion.div>

      {/* Footer Security Badge */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative z-10 py-6 text-center"
      >
        <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 font-medium bg-black/10 px-3 py-1.5 rounded-full border border-white/5">
          <Shield className="w-3.5 h-3.5 text-teal-500" />
          End-to-End Encrypted Identity
        </span>
      </motion.div>
    </div>
  );
}
