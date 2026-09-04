const fs = require('fs');
const file = 'mobile/src/screens/subscription/StoragePlanScreen.jsx';
let content = fs.readFileSync(file, 'utf8');

// Ensure framer-motion is imported
if (!content.includes('framer-motion')) {
  content = content.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport { motion } from 'framer-motion';");
}

const funcStart = content.indexOf('export default function StoragePlanScreen');
const returnStart = content.indexOf('return (', funcStart);

const newReturn = `return (
    <div className={\`min-h-[100dvh] flex flex-col px-4 pt-[max(env(safe-area-inset-top),1rem)] pb-[max(env(safe-area-inset-bottom),1rem)] max-w-md mx-auto \${
      isDarkMode ? 'bg-gradient-to-b from-[#0B1220] via-[#0F1829] to-[#0D1524] text-white' : 'bg-gradient-to-b from-[#FFFFFF] to-[#F6F9FF] text-slate-900'
    }\`}>
      {/* Top Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3.5 py-4 sticky top-0 z-10 backdrop-blur-md"
      >
        <button
          onClick={onBack}
          className={\`p-2.5 rounded-full backdrop-blur-xl border transition-all active:scale-90 \${
            isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300 hover:text-white' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900'
          }\`}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className={\`text-lg font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r \${
            isDarkMode ? 'from-blue-400 to-teal-400' : 'from-blue-600 to-teal-600'
          }\`}>
            Call Translation Minute Plans
          </h1>
          <p className={\`text-xs font-medium mt-0.5 \${isDarkMode ? 'text-slate-400' : 'text-slate-500'}\`}>
            Recharge to get more realtime translation minutes
          </p>
        </div>
      </motion.div>

      {/* Plan Cards List */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
        }}
        className="space-y-5 my-4 flex-1 overflow-y-auto pb-8"
      >
        {plans.map((p) => {
          const isCurrent = currentPlanId === p.id;
          const isPro = p.id === 'pro';
          const isUnlimited = p.id === 'unlimited';

          let cardClasses = '';
          let accentColor = '';
          
          if (isPro) {
            cardClasses = 'bg-gradient-to-br from-blue-900 via-blue-950 to-indigo-950 border-blue-500/50 shadow-[0_10px_30px_-10px_rgba(59,130,246,0.4)] text-white';
            accentColor = 'blue';
          } else if (isUnlimited) {
            cardClasses = 'bg-gradient-to-br from-purple-900 via-purple-950 to-violet-950 border-purple-500/50 shadow-[0_10px_30px_-10px_rgba(168,85,247,0.4)] text-white';
            accentColor = 'purple';
          } else {
            cardClasses = isDarkMode 
              ? 'bg-white/5 backdrop-blur-md border-white/10 shadow-lg text-white' 
              : 'bg-white/70 backdrop-blur-md border-slate-200 shadow-md text-slate-900';
            accentColor = 'slate';
          }

          return (
            <motion.div
              key={p.id}
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              whileHover={{ y: -2, scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={\`relative p-6 rounded-[32px] border transition-all duration-300 overflow-hidden \${cardClasses}\`}
            >
              {/* Premium Shimmer Sweeps */}
              {isPro && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent -translate-x-[200%] animate-[shimmer_4s_infinite_ease-in-out]" />
              )}
              {isUnlimited && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/10 to-transparent -translate-x-[200%] animate-[shimmer_4s_infinite_ease-in-out]" />
              )}

              {/* Recommended Badge */}
              {isPro && (
                <div className="absolute top-4 right-4 group">
                  <span className="relative overflow-hidden inline-block text-[9px] font-black uppercase px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 text-white tracking-widest shadow-[0_0_12px_rgba(59,130,246,0.5)]">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[150%] animate-[shimmer_3s_infinite]" />
                    <span className="relative z-10">RECOMMENDED</span>
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between relative z-10">
                <div>
                  <h3 className={\`text-lg font-black \${isPro || isUnlimited ? 'text-white' : isDarkMode ? 'text-white' : 'text-slate-900'}\`}>
                    {p.name}
                  </h3>
                  <p className="text-3xl font-black text-teal-400 mt-1 drop-shadow-[0_0_8px_rgba(45,212,191,0.4)]">
                    {p.priceUSD === 0 ? 'Free' : \`\$\${p.priceUSD}\`}
                    {p.priceUSD !== 0 && <span className="text-sm font-bold text-slate-400 drop-shadow-none">/mo</span>}
                  </p>
                </div>
              </div>

              <div className="my-6 space-y-3.5 relative z-10">
                <div className={\`flex items-center gap-3 \${isPro || isUnlimited ? 'text-white' : isDarkMode ? 'text-slate-200' : 'text-slate-700'} font-bold\`}>
                  <div className="p-1.5 rounded-full bg-teal-500/20 shadow-inner">
                    <Clock className="w-4 h-4 text-teal-400" />
                  </div>
                  <span className="tracking-wide">
                    {p.translatedMinutesMonthly ? \`\${p.translatedMinutesMonthly} Mins/Month\` : \`\${p.translatedMinutesDaily} Mins/Day\`} <span className="opacity-80">Voice Interpretation</span>
                  </span>
                </div>
                {p.features?.map((f, idx) => (
                  <div key={idx} className={\`flex items-start gap-3 \${isPro || isUnlimited ? 'text-blue-100/80' : isDarkMode ? 'text-slate-400' : 'text-slate-600'} text-[12px] leading-relaxed font-medium\`}>
                    <div className="p-1 mt-0.5 rounded-full bg-emerald-500/20 shadow-inner flex-shrink-0">
                      <Check className="w-3 h-3 text-emerald-400" />
                    </div>
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="relative z-10 pt-2">
                {isCurrent ? (
                  <div className={\`w-full py-3.5 flex items-center justify-center gap-2 rounded-2xl font-black text-xs tracking-wide border shadow-sm transition-all \${
                    accentColor === 'blue' ? 'bg-blue-500/20 border-blue-500/40 text-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.2)]' :
                    accentColor === 'purple' ? 'bg-purple-500/20 border-purple-500/40 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.2)]' :
                    isDarkMode ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-500'
                  }\`}>
                    <div className={\`p-1 rounded-full \${
                      accentColor === 'blue' ? 'bg-blue-500/30' : accentColor === 'purple' ? 'bg-purple-500/30' : 'bg-slate-400/20'
                    }\`}>
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    CURRENT ACTIVE PLAN
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleStripeCard(p.id)}
                      disabled={subscribing}
                      className="relative overflow-hidden py-3 px-3 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold rounded-2xl text-[11px] uppercase tracking-widest shadow-[0_4px_15px_rgba(59,130,246,0.4)] transition-all group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover:animate-[shimmer_2s_infinite]" />
                      <div className="flex items-center justify-center gap-1.5 relative z-10">
                        <CreditCard className="w-4 h-4 drop-shadow-sm" />
                        Card
                      </div>
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onSelectLocalPay(p)}
                      className="relative overflow-hidden py-3 px-3 bg-gradient-to-br from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-bold rounded-2xl text-[11px] uppercase tracking-widest shadow-[0_4px_15px_rgba(16,185,129,0.4)] transition-all group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover:animate-[shimmer_2s_infinite]" />
                      <div className="flex items-center justify-center gap-1.5 relative z-10">
                        <Sparkles className="w-4 h-4 drop-shadow-sm" />
                        bKash / Nagad
                      </div>
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
`;

content = content.substring(0, returnStart) + newReturn + '\n}';

fs.writeFileSync(file, content);
console.log('Replaced return block in StoragePlanScreen');
