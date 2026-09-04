import React, { useState, useEffect, useRef } from 'react';
import { KeyRound, ArrowLeft, CheckCircle2, Loader2, RefreshCw, AlertCircle, TerminalSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';

export default function OtpVerifyScreen({ phone, firebaseConfirmation, onVerified, onBack }) {
  const { verifyOtp, loginWithFirebase } = useAuth();
  const { isDarkMode } = useTheme();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(30);
  const inputRefs = useRef([]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).replace(/\D/g, '');
    if (pastedData) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      const focusIndex = Math.min(pastedData.length, 5);
      if (inputRefs.current[focusIndex]) {
        inputRefs.current[focusIndex].focus();
      }
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length < 6) return;

    setError('');
    setLoading(true);

    try {
      if (firebaseConfirmation) {
        const result = await firebaseConfirmation.confirm(otpCode);
        const idToken = await result.user.getIdToken();
        const res = await loginWithFirebase(idToken);
        if (res.isNewUser) {
          onVerified(true);
        } else {
          onVerified(false);
        }
      } else {
        const res = await verifyOtp(phone, otpCode);
        if (res.isNewUser) {
          onVerified(true);
        } else {
          onVerified(false);
        }
      }
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP code.');
      setLoading(false);
    }
  };

  const handleResend = () => {
    setCountdown(30);
  };

  const handleFillDevDemo = () => {
    setOtp(['1', '2', '3', '4', '5', '6']);
  };

  return (
    <div className={`relative min-h-[100dvh] flex flex-col justify-between p-6 max-w-md mx-auto overflow-hidden ${
      isDarkMode ? 'bg-[#080E18] text-white' : 'bg-[#F8FAFC] text-slate-900'
    }`}>
      {/* Animated Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, -90, 0] }} 
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -right-[20%] w-[70vw] h-[70vw] bg-teal-500/20 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.5, 1], rotate: [0, 90, 0] }} 
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -left-[20%] w-[80vw] h-[80vw] bg-blue-600/20 rounded-full blur-[120px]"
        />
      </div>

      {/* Top Header */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="relative z-10 pt-4"
      >
        <button 
          onClick={onBack}
          className={`p-3 rounded-2xl transition-colors w-max ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200'}`}
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </motion.div>

      {/* Main Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative z-10 flex-1 flex flex-col justify-center"
      >
        <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-teal-400 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
          <KeyRound className="w-8 h-8 text-white" />
        </div>

        <h2 className="text-3xl font-bold mb-2">Verify Number</h2>
        <p className={`mb-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Code sent to <span className="font-semibold">{phone}</span>
        </p>

        {error && (
          <div className="p-4 mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-8">
          <div className="flex justify-between gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className={`w-12 h-14 text-center text-xl font-bold rounded-2xl border transition-all focus:ring-2 focus:ring-blue-500/50 outline-none ${
                  isDarkMode 
                    ? 'bg-black/20 border-white/10 text-white focus:bg-white/5' 
                    : 'bg-white border-slate-200 text-slate-900 focus:bg-blue-50'
                }`}
              />
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || otp.join('').length < 6}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white font-bold rounded-2xl text-sm shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 group"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                Verify & Continue
                <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={handleResend}
            disabled={countdown > 0}
            className={`text-sm font-medium flex items-center justify-center gap-2 mx-auto ${
              countdown > 0 
                ? (isDarkMode ? 'text-slate-500' : 'text-slate-400')
                : 'text-blue-500 hover:text-blue-400'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${countdown > 0 ? '' : 'animate-pulse'}`} />
            {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend Code'}
          </button>
        </div>

        {/* Development Helper */}
        <button 
          onClick={handleFillDevDemo}
          className="mt-8 text-xs text-slate-500 underline opacity-50 hover:opacity-100"
        >
          Use Dev Demo Code (123456)
        </button>
      </motion.div>
    </div>
  );
}
