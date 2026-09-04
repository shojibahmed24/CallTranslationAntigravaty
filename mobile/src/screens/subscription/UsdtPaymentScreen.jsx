import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Check, ShieldCheck, AlertTriangle, Send, Camera } from 'lucide-react';
import { api } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

export default function UsdtPaymentScreen({ selectedPlan, onBack, onSuccess }) {
  const { isDarkMode } = useTheme();

  const [paymentDetails, setPaymentDetails] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('bkash'); // bkash, nagad, rocket, usdt
  const [txHash, setTxHash] = useState('');
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState('');

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await api.getPlansAndWallet();
        setPaymentDetails(res.manualPaymentDetails);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWallet();
  }, []);

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitTx = async (e) => {
    e.preventDefault();
    if (!txHash.trim()) return;

    setSubmitting(true);
    try {
      let screenshotUrl = null;

      if (screenshotFile) {
        const formData = new FormData();
        formData.append('file', screenshotFile);
        const resUpload = await fetch('http://localhost:5000/api/storage/upload?type=payment', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });
        const uploadData = await resUpload.json();
        if (!uploadData.success) throw new Error(uploadData.message);
        screenshotUrl = uploadData.file.url;
      }

      await api.submitManualPayment({
        planId: selectedPlan.id,
        txHash: txHash.trim(),
        paymentMethod: paymentMethod,
        screenshotUrl: screenshotUrl || ''
      });

      setSubmittedMessage(`Your ${paymentMethod.toUpperCase()} transaction was submitted with the screenshot. Our Admin team will verify it and activate your plan shortly!`);
      setTimeout(() => {
        onSuccess();
      }, 4000);
    } catch (err) {
      alert('Failed to submit Payment: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const planPriceUSD = selectedPlan?.priceUSD || 9.99;
  const planPriceBDT = selectedPlan?.priceBDT || (planPriceUSD * 120);

  const getActiveAddress = () => {
    if (!paymentDetails) return '';
    if (paymentMethod === 'usdt') return paymentDetails.usdt.walletAddress;
    return paymentDetails[paymentMethod];
  };

  return (
    <div className={`min-h-[100dvh] flex flex-col px-4 pt-[max(env(safe-area-inset-top),1rem)] pb-[max(env(safe-area-inset-bottom),1rem)] max-w-md mx-auto justify-between overflow-y-auto ${
      isDarkMode ? 'bg-[#080E18] text-white' : 'bg-[#F8FAFC] text-slate-900'
    }`}>
      {/* Header */}
      <div className="flex items-center gap-3 py-2 shrink-0">
        <button onClick={onBack} className="p-2 rounded-xl text-slate-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base font-bold">Manual Payment</h1>
          <p className="text-[11px] text-teal-400 font-semibold">{selectedPlan?.name} ?" {paymentMethod === 'usdt' ? `$${planPriceUSD}` : `?${planPriceBDT}`}</p>
        </div>
      </div>

      {submittedMessage ? (
        <div className="p-6 rounded-3xl bg-[#0F1829] border border-teal-500/50 text-center space-y-4 my-auto shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-teal-500/20 text-teal-400 mx-auto flex items-center justify-center">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-white">Payment Under Review</h2>
          <p className="text-xs text-slate-300 leading-relaxed">{submittedMessage}</p>
        </div>
      ) : (
        <div className="space-y-4 my-auto py-4">
          
          {/* Payment Method Selector */}
          <div className="grid grid-cols-4 gap-2">
            {['bkash', 'nagad', 'rocket', 'usdt'].map(method => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method)}
                className={`py-2 rounded-xl text-[10px] font-bold uppercase border transition ${
                  paymentMethod === method 
                    ? 'bg-teal-500 text-white border-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.4)]' 
                    : 'bg-[#142036] text-slate-400 border-slate-700'
                }`}
              >
                {method}
              </button>
            ))}
          </div>

          {/* Warning Banner */}
          <div className="p-3.5 bg-amber-950/40 border border-amber-800/60 rounded-2xl flex items-start gap-2.5 text-xs text-amber-300">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block text-amber-200 uppercase">{paymentMethod} Payment</strong>
              Send exactly <strong>{paymentMethod === 'usdt' ? `$${planPriceUSD} USDT (TRC-20)` : `?${planPriceBDT} BDT`}</strong>. 
              {paymentMethod !== 'usdt' && ' Please upload the success screenshot.'}
            </div>
          </div>

          {/* Wallet / Number Box */}
          <div className={`p-4 rounded-3xl border flex flex-col items-center gap-3 shadow-xl ${
            isDarkMode ? 'bg-[#0F1829] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            {paymentMethod === 'usdt' && (
              <img
                src={paymentDetails?.usdt?.qrCodeUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=usdt'}
                alt="TRC-20 QR Code"
                className="w-32 h-32 rounded-2xl p-2 bg-white shadow-md"
              />
            )}

            <div className="w-full space-y-1.5 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                {paymentMethod === 'usdt' ? 'USDT (TRC-20) Wallet' : `${paymentMethod} Number (Send Money)`}
              </span>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#142036] border border-slate-700">
                <code className="text-xs font-mono text-teal-300 flex-1 truncate">
                  {getActiveAddress() || 'Loading...'}
                </code>
                <button
                  onClick={() => handleCopy(getActiveAddress())}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmitTx} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Transaction ID (TxHash/TrxID)
              </label>
              <input
                type="text"
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                placeholder="Paste TrxID e.g. 9JA7B..."
                required
                className={`w-full px-4 py-3 rounded-2xl text-xs font-mono border transition focus:outline-none focus:border-teal-400 ${
                  isDarkMode ? 'bg-[#142036] border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            {/* Screenshot Upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Upload Payment Screenshot (Optional but recommended)
              </label>
              <label className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-slate-700 rounded-2xl cursor-pointer hover:bg-slate-800 transition">
                <Camera className="w-5 h-5 text-teal-400" />
                <span className="text-xs text-slate-400">
                  {screenshotFile ? screenshotFile.name : 'Tap to select screenshot image'}
                </span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => setScreenshotFile(e.target.files[0])}
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting || !txHash.trim()}
              className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-bold rounded-2xl text-xs shadow-lg shadow-teal-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {submitting ? 'Uploading & Submitting...' : 'Submit Payment'}
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
