const fs = require('fs');
const file = 'mobile/src/screens/subscription/UsdtPaymentScreen.jsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('framer-motion')) {
  content = content.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport { motion, AnimatePresence } from 'framer-motion';");
}
if (!content.includes('Image as ImageIcon')) {
  content = content.replace("Camera } from 'lucide-react'", "Camera, Image as ImageIcon } from 'lucide-react'");
}

const funcStart = content.indexOf('export default function UsdtPaymentScreen');
const returnStart = content.indexOf('return (', funcStart);

const newReturn = `return (
    <div className={\`min-h-[100dvh] flex flex-col px-4 pt-[max(env(safe-area-inset-top),1rem)] pb-[max(env(safe-area-inset-bottom),1rem)] max-w-md mx-auto justify-between overflow-y-auto \${
      isDarkMode ? 'bg-gradient-to-b from-[#0B1220] via-[#0F1829] to-[#0D1524] text-white' : 'bg-gradient-to-b from-[#FFFFFF] to-[#E0F2FE] text-slate-900'
    }\`}>
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3.5 py-4 shrink-0 sticky top-0 z-10 backdrop-blur-md"
      >
        <button 
          onClick={onBack} 
          className={\`p-2.5 rounded-full backdrop-blur-xl border transition-all active:scale-90 \${
            isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300 hover:text-white' : 'bg-white/50 border-slate-200 hover:bg-white text-slate-600 hover:text-slate-900'
          }\`}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-black tracking-tight">Manual Payment</h1>
          <p className="text-xs font-semibold mt-0.5 text-slate-400">
            {selectedPlan?.name} — <span className="text-teal-400 font-bold drop-shadow-[0_0_5px_rgba(45,212,191,0.5)] tracking-wide">{paymentMethod === 'usdt' ? \`\$\${planPriceUSD}\` : \`৳\${planPriceBDT}\`}</span>
          </p>
        </div>
      </motion.div>

      {submittedMessage ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={\`p-8 rounded-[32px] border text-center space-y-5 my-auto shadow-2xl backdrop-blur-md \${
            isDarkMode ? 'bg-[#0F1829]/80 border-teal-500/30 shadow-[0_0_40px_rgba(20,184,166,0.15)]' : 'bg-white/90 border-teal-500/20 shadow-[0_10px_40px_rgba(20,184,166,0.15)]'
          }\`}
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="relative w-20 h-20 mx-auto flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-teal-500/20 blur-xl rounded-full" />
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: 1, delay: 0.5 }}
              className="relative w-full h-full rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 shadow-lg flex items-center justify-center text-white border-4 border-[#0F1829]"
            >
              <ShieldCheck className="w-10 h-10 drop-shadow-md" />
            </motion.div>
          </motion.div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-black text-teal-400">Payment Under Review</h2>
            <p className={\`text-sm leading-relaxed \${isDarkMode ? 'text-slate-300' : 'text-slate-600'}\`}>
              {submittedMessage}
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
          className="space-y-6 my-auto py-4"
        >
          
          {/* Payment Method Selector */}
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="grid grid-cols-4 gap-2 relative p-1 rounded-2xl bg-black/10 backdrop-blur-md">
            {['bkash', 'nagad', 'rocket', 'usdt'].map(method => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method)}
                className={\`relative py-2.5 rounded-xl text-[10.5px] font-bold uppercase tracking-wider transition-colors z-10 \${
                  paymentMethod === method 
                    ? 'text-white' 
                    : isDarkMode ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'
                }\`}
              >
                {paymentMethod === method && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-tr from-teal-500 to-emerald-400 rounded-xl shadow-[0_0_15px_rgba(20,184,166,0.4)] -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {method}
              </button>
            ))}
          </motion.div>

          {/* Warning Banner */}
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
            <div className="p-4 bg-gradient-to-r from-amber-500/15 to-amber-900/10 border-l-4 border-amber-500 rounded-r-2xl rounded-l-md flex items-start gap-3 text-xs text-amber-200/90 shadow-[0_4px_20px_rgba(245,158,11,0.05)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full" />
              <div className="p-1.5 rounded-full bg-amber-500/20 shadow-inner flex-shrink-0 mt-0.5 relative z-10">
                <AlertTriangle className="w-4 h-4 text-amber-400 drop-shadow-sm" />
              </div>
              <div className="relative z-10 leading-relaxed">
                <strong className="block text-amber-400 uppercase tracking-widest text-[10px] mb-0.5">{paymentMethod} Payment</strong>
                Send exactly <strong className="text-amber-300 font-black">{paymentMethod === 'usdt' ? \`\$\${planPriceUSD} USDT (TRC-20)\` : \`৳\${planPriceBDT} BDT\`}</strong>. 
                {paymentMethod !== 'usdt' && ' Please upload the success screenshot.'}
              </div>
            </div>
          </motion.div>

          {/* Wallet / Number Box */}
          <motion.div 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className={\`p-6 rounded-3xl border flex flex-col items-center gap-4 shadow-xl backdrop-blur-md transition-colors \${
              isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/70 border-slate-200/50'
            }\`}
          >
            <AnimatePresence mode="popLayout">
              {paymentMethod === 'usdt' && (
                <motion.div
                  key="qr"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative p-3 rounded-2xl bg-white shadow-[0_0_20px_rgba(255,255,255,0.1)] border border-white/20"
                >
                  <img
                    src={paymentDetails?.usdt?.qrCodeUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=usdt'}
                    alt="TRC-20 QR Code"
                    className="w-32 h-32 object-contain"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="w-full space-y-2 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                {paymentMethod === 'usdt' ? 'USDT (TRC-20) Wallet' : \`\${paymentMethod} Number (Send Money)\`}
              </span>
              <div className={\`flex items-center gap-2 p-2 rounded-2xl border shadow-inner transition-colors \${
                isDarkMode ? 'bg-black/20 border-white/10' : 'bg-slate-100 border-slate-200'
              }\`}>
                <code className="text-[13px] font-mono text-teal-400 font-bold flex-1 truncate px-2 select-all drop-shadow-sm">
                  {getActiveAddress() || 'Loading...'}
                </code>
                <button
                  onClick={() => handleCopy(getActiveAddress())}
                  className={\`relative p-2.5 rounded-xl transition-all active:scale-95 \${
                    copied 
                      ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                      : isDarkMode ? 'bg-white/10 text-slate-300 hover:text-white hover:bg-white/20' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }\`}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={copied ? 'check' : 'copy'}
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 45 }}
                      transition={{ duration: 0.2 }}
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </motion.div>
                  </AnimatePresence>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.form variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} onSubmit={handleSubmitTx} className="space-y-5">
            <div>
              <label className={\`block text-[11px] font-bold tracking-wider mb-2 \${isDarkMode ? 'text-slate-300' : 'text-slate-600'}\`}>
                TRANSACTION ID (TxHash/TrxID)
              </label>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl opacity-0 group-focus-within:opacity-30 blur transition duration-300"></div>
                <input
                  type="text"
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  placeholder="Paste TrxID e.g. 9JA7B..."
                  required
                  className={\`relative w-full px-4 py-3.5 rounded-2xl text-xs font-mono border backdrop-blur-md transition-colors focus:outline-none focus:border-teal-400 shadow-sm \${
                    isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder-slate-500' : 'bg-white/70 border-slate-200 text-slate-900 placeholder-slate-400'
                  }\`}
                />
              </div>
            </div>

            {/* Screenshot Upload Drop-Zone */}
            <div>
              <label className={\`block text-[11px] font-bold tracking-wider mb-2 \${isDarkMode ? 'text-slate-300' : 'text-slate-600'}\`}>
                PAYMENT SCREENSHOT
              </label>
              <label className={\`relative flex items-center justify-center w-full px-4 py-6 border-2 border-dashed rounded-3xl cursor-pointer transition-all group overflow-hidden \${
                isDarkMode ? 'bg-white/5 border-teal-500/30 hover:bg-white/10 hover:border-teal-400/50' : 'bg-white/60 border-teal-500/30 hover:bg-teal-50/50 hover:border-teal-400/50'
              }\`}>
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex flex-col items-center gap-3 relative z-10">
                  {screenshotFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-inner">
                        <Check className="w-6 h-6" />
                      </div>
                      <span className={\`text-xs font-bold \${isDarkMode ? 'text-teal-400' : 'text-teal-600'} flex items-center gap-1.5\`}>
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[200px]">{screenshotFile.name}</span>
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-teal-500/10 text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                        <Camera className="w-5 h-5 drop-shadow-sm" />
                      </div>
                      <div className="text-center">
                        <span className={\`text-xs font-bold block \${isDarkMode ? 'text-slate-300' : 'text-slate-700'}\`}>
                          Tap to select screenshot
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">JPEG, PNG, WEBP allowed</span>
                      </div>
                    </>
                  )}
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => setScreenshotFile(e.target.files[0])}
                />
              </label>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={submitting || !txHash.trim()}
              className="relative overflow-hidden w-full py-4 mt-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-black tracking-widest rounded-2xl text-xs uppercase shadow-[0_10px_25px_-5px_rgba(20,184,166,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale group"
            >
              {!submitting && !(!txHash.trim()) && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover:animate-[shimmer_2s_infinite]" />
              )}
              <span className="relative z-10 flex items-center gap-2 drop-shadow-md">
                {submitting ? 'Submitting...' : 'Submit Payment'}
                <Send className={\`w-4 h-4 \${submitting ? 'animate-pulse' : ''}\`} />
              </span>
            </motion.button>
          </motion.form>
        </motion.div>
      )}
    </div>
  );
`;

content = content.substring(0, returnStart) + newReturn + '\n}';

fs.writeFileSync(file, content);
console.log('Replaced return block in UsdtPaymentScreen');
