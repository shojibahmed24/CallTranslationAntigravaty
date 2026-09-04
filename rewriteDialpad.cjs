const fs = require('fs');
const file = 'mobile/src/components/DialpadBottomSheet.jsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('framer-motion')) {
  content = content.replace("import React, { useState } from 'react';", "import React, { useState } from 'react';\nimport { motion, AnimatePresence } from 'framer-motion';");
}
if (!content.includes('AlertTriangle')) {
  content = content.replace("User } from 'lucide-react'", "User, AlertTriangle } from 'lucide-react'");
}

const funcStart = content.indexOf('export default function DialpadBottomSheet');
const returnStart = content.indexOf('return (', funcStart);

const newReturn = `return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Sheet */}
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="bg-gradient-to-b from-[#0B1220] to-[#0D1524] border-t border-teal-500/20 rounded-t-[32px] w-full max-w-md mx-auto relative z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] pb-[max(env(safe-area-inset-bottom),1rem)]"
          >
            <div className="flex justify-center pt-4 pb-2">
              <div className="w-12 h-1.5 bg-gradient-to-r from-slate-600 to-slate-400 rounded-full" />
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-center mb-7">
                <h3 className={\`text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r drop-shadow-sm \${
                  actionType === 'chat' ? 'from-blue-400 to-teal-400' : 'from-teal-400 to-emerald-400'
                }\`}>
                  {actionType === 'chat' ? 'New Chat' : 'Make a Call'}
                </h3>
                <button 
                  onClick={onClose} 
                  className="p-2.5 bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-all active:scale-95"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSearch} className="mb-7">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">
                  Enter Mobile Number
                </label>
                <div className="flex gap-3">
                  <div className="relative flex-1 group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-emerald-400 rounded-2xl opacity-0 group-focus-within:opacity-40 blur transition duration-300"></div>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+88017..."
                      className="relative w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl pl-5 pr-10 py-4 text-white text-lg font-bold focus:outline-none placeholder-slate-500 transition-colors shadow-sm"
                      autoFocus
                    />
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={loading || !phoneNumber.trim()}
                    className="px-6 bg-gradient-to-r from-blue-600 to-teal-500 disabled:from-blue-900/50 disabled:to-teal-900/50 text-white font-bold rounded-2xl shadow-[0_4px_15px_rgba(20,184,166,0.3)] transition-all flex items-center justify-center disabled:opacity-70 disabled:shadow-none"
                  >
                    {loading ? (
                      <svg className="w-6 h-6 animate-spin text-teal-300" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <Search className="w-6 h-6 drop-shadow-sm" />
                    )}
                  </motion.button>
                </div>
                <AnimatePresence>
                  {error && (
                    <motion.p 
                      initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="text-red-400 text-[11px] font-bold tracking-wide mt-3 ml-2 flex items-center gap-1.5"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>
              </form>

              <AnimatePresence>
                {foundUser && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 250 }}
                    className={\`bg-white/5 border rounded-3xl p-5 flex items-center justify-between shadow-xl backdrop-blur-md \${
                      actionType === 'chat' ? 'border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)]' : 'border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                    }\`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={\`w-14 h-14 bg-black/40 rounded-full overflow-hidden border-2 flex items-center justify-center \${
                        actionType === 'chat' ? 'border-blue-400' : 'border-emerald-400'
                      }\`}>
                        {foundUser.avatar ? (
                          <img src={\`http://localhost:5000\${foundUser.avatar}\`} className="w-full h-full object-cover" alt={foundUser.name} />
                        ) : (
                          <User className="w-6 h-6 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-white font-black text-lg drop-shadow-sm">{foundUser.name}</h4>
                        <p className="text-slate-400 text-xs font-semibold mt-0.5">{foundUser.phone}</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleAction}
                      className={\`p-4 rounded-full text-white shadow-lg transition-all active:scale-90 group \${
                        actionType === 'chat' 
                          ? 'bg-gradient-to-r from-blue-600 to-blue-500 shadow-[0_4px_15px_rgba(59,130,246,0.4)] hover:shadow-[0_4px_25px_rgba(59,130,246,0.6)]' 
                          : 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_4px_15px_rgba(16,185,129,0.4)] hover:shadow-[0_4px_25px_rgba(16,185,129,0.6)]'
                      }\`}
                    >
                      {/* Idle pulsing glow */}
                      <div className={\`absolute inset-0 rounded-full animate-ping opacity-20 \${actionType === 'chat' ? 'bg-blue-400' : 'bg-emerald-400'}\`} style={{ animationDuration: '3s' }} />
                      
                      <div className="relative z-10">
                        {actionType === 'chat' ? <MessageSquare className="w-6 h-6 drop-shadow-sm" /> : <Phone className="w-6 h-6 drop-shadow-sm" />}
                      </div>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
`;

content = content.substring(0, returnStart) + newReturn + '\n}';

// Also remove `if (!isOpen) return null;` since we use AnimatePresence wrapping the whole thing now.
content = content.replace('if (!isOpen) return null;', '');

fs.writeFileSync(file, content);
console.log('Replaced return block in DialpadBottomSheet');
