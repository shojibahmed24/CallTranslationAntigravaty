const fs = require('fs');
const file = 'mobile/src/screens/support/SupportTicketScreen.jsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('framer-motion')) {
  content = content.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport { motion, AnimatePresence } from 'framer-motion';");
}

const funcStart = content.indexOf('export default function SupportTicketScreen');
const returnStart = content.indexOf('return (', funcStart);

const newReturn = `return (
    <div className={\`min-h-[100dvh] flex flex-col px-4 pt-[max(env(safe-area-inset-top),1rem)] pb-[max(env(safe-area-inset-bottom),1rem)] max-w-md mx-auto \${
      isDarkMode ? 'bg-gradient-to-b from-[#0B1220] via-[#0F1829] to-[#0D1524] text-white' : 'bg-gradient-to-b from-[#FFFFFF] to-[#F6F9FF] text-slate-900'
    }\`}>
      {/* Top Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={\`flex items-center justify-between py-3 shrink-0 sticky top-0 z-20 backdrop-blur-md border-b \${isDarkMode ? 'border-white/5' : 'border-slate-200/50'}\`}
      >
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack} 
            className={\`p-2.5 rounded-full backdrop-blur-xl border transition-all active:scale-90 \${
              isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300 hover:text-white' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900'
            }\`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className={\`text-base font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r \${
              isDarkMode ? 'from-blue-400 to-teal-400' : 'from-blue-600 to-teal-600'
            }\`}>
              Help & Support Desk
            </h1>
            <p className={\`text-[11px] font-medium \${isDarkMode ? 'text-slate-400' : 'text-slate-500'}\`}>Direct Admin assistance</p>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowNewModal(true)}
          className="relative overflow-hidden p-2.5 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-full text-xs font-bold flex items-center gap-1 shadow-[0_4px_15px_rgba(59,130,246,0.3)] transition-all group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover:animate-[shimmer_2s_infinite]" />
          <Plus className="w-4 h-4 drop-shadow-sm relative z-10" /> 
          <span className="hidden sm:inline relative z-10">New Ticket</span>
        </motion.button>
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {selectedTicket ? (
          <motion.div 
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="flex-1 flex flex-col justify-between my-3 overflow-hidden"
          >
            <div className={\`border-b pb-3 mb-3 flex items-center justify-between \${isDarkMode ? 'border-white/5' : 'border-slate-200'}\`}>
              <div>
                <h2 className="text-sm font-black truncate max-w-[200px] drop-shadow-sm">{selectedTicket.subject}</h2>
                <span className="text-[10px] text-teal-400 uppercase font-bold tracking-wider">{selectedTicket.category}</span>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className={\`text-[11px] font-bold px-3 py-1.5 rounded-full transition-colors \${
                  isDarkMode ? 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900'
                }\`}
              >
                Back to Tickets
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 pb-4 scrollbar-hide">
              {selectedTicket.messages.map((m, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={idx}
                  className={\`p-4 rounded-[20px] text-xs max-w-[85%] shadow-sm backdrop-blur-sm \${
                    m.sender === 'admin'
                      ? 'bg-gradient-to-r from-blue-600/20 to-blue-500/10 border border-blue-500/30 text-blue-50 mr-auto shadow-[0_4px_15px_rgba(59,130,246,0.1)]'
                      : isDarkMode 
                        ? 'bg-white/5 border border-white/10 text-slate-200 ml-auto'
                        : 'bg-white border border-slate-200 text-slate-800 ml-auto'
                  }\`}
                >
                  <div className="flex items-center justify-between gap-3 text-[10px] font-black tracking-wider mb-2 opacity-80">
                    <span>{m.senderName}</span>
                    <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="leading-relaxed font-medium">{m.text}</p>
                </motion.div>
              ))}
            </div>

            {/* Reply form */}
            <form onSubmit={handleSendReply} className={\`mt-2 flex gap-2 pt-3 border-t \${isDarkMode ? 'border-white/5' : 'border-slate-200'}\`}>
              <div className="relative flex-1 group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-teal-400 rounded-full opacity-0 group-focus-within:opacity-40 blur transition duration-300"></div>
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Reply to support team..."
                  className={\`relative w-full rounded-full px-5 py-3 text-xs font-medium backdrop-blur-xl transition-colors focus:outline-none shadow-sm \${
                    isDarkMode ? 'bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:border-teal-500/50' : 'bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-teal-500'
                  }\`}
                />
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                type="submit"
                disabled={!replyText.trim()}
                className="p-3.5 rounded-full bg-gradient-to-br from-blue-600 to-teal-500 text-white shadow-[0_4px_15px_rgba(59,130,246,0.3)] transition-all disabled:opacity-50 flex-shrink-0"
              >
                <Send className="w-4 h-4 drop-shadow-sm ml-0.5" />
              </motion.button>
            </form>
          </motion.div>
        ) : (
          <motion.div 
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="flex-1 space-y-3.5 my-4 overflow-y-auto pb-6"
          >
            {tickets.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center p-8 mt-10 text-center space-y-4"
              >
                <motion.div 
                  animate={{ y: [0, -10, 0] }} 
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-16 h-16 rounded-full bg-teal-500/10 flex items-center justify-center shadow-[0_0_20px_rgba(20,184,166,0.1)]"
                >
                  <MessageSquare className="w-8 h-8 text-teal-400 drop-shadow-sm" />
                </motion.div>
                <p className={\`text-xs font-medium max-w-[250px] leading-relaxed \${isDarkMode ? 'text-slate-400' : 'text-slate-500'}\`}>
                  No support tickets submitted yet. Tap "New Ticket" to request help with USDT verification or translation latency.
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                }}
                className="space-y-3.5"
              >
                {tickets.map((t) => (
                  <motion.div
                    variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}
                    whileHover={{ y: -2 }}
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className={\`p-4 rounded-3xl border transition-all cursor-pointer shadow-sm backdrop-blur-md \${
                      isDarkMode ? 'bg-white/5 border-white/10 hover:border-teal-500/30 hover:bg-white/10' : 'bg-white/70 border-slate-200 hover:border-teal-400/50 hover:bg-white'
                    }\`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={\`text-[13px] font-black truncate max-w-[200px] \${isDarkMode ? 'text-white' : 'text-slate-900'}\`}>{t.subject}</span>
                      <span className={\`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm \${
                        t.status === 'resolved' 
                          ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-400/10 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-gradient-to-r from-amber-500/20 to-amber-400/10 text-amber-500 border border-amber-500/30'
                      }\`}>
                        {t.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold tracking-wide text-slate-400">
                      <span className="capitalize">{t.category}</span>
                      <span>{new Date(t.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Ticket Modal */}
      <AnimatePresence>
        {showNewModal && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={\`border rounded-[32px] max-w-sm w-full p-7 space-y-5 shadow-2xl \${isDarkMode ? 'bg-[#0D1524]/90 border-blue-500/30' : 'bg-white/90 border-blue-500/20'}\`}
            >
              <h3 className={\`text-sm font-black flex items-center gap-3 \${isDarkMode ? 'text-white' : 'text-slate-900'}\`}>
                <div className="p-1.5 rounded-full bg-teal-500/20 shadow-[0_0_15px_rgba(20,184,166,0.2)]">
                  <HelpCircle className="w-4 h-4 text-teal-400" />
                </div>
                Create Support Ticket
              </h3>

              <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
                <div>
                  <label className={\`block font-bold tracking-wider mb-1.5 text-[10px] uppercase \${isDarkMode ? 'text-slate-400' : 'text-slate-500'}\`}>Issue Category</label>
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-teal-400 rounded-xl opacity-0 group-focus-within:opacity-30 blur transition duration-300"></div>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className={\`relative w-full appearance-none border rounded-xl px-4 py-3 font-semibold transition-colors focus:outline-none focus:border-teal-500/50 shadow-sm \${
                        isDarkMode ? 'bg-black/20 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }\`}
                    >
                      <option value="payment">USDT (TRC-20) / Card Payment</option>
                      <option value="translation">Voice Translation Quality / Latency</option>
                      <option value="otp">SMS OTP / Phone Login</option>
                      <option value="storage">Cloud Storage & Quota</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className={\`w-4 h-4 \${isDarkMode ? 'text-slate-400' : 'text-slate-500'}\`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className={\`block font-bold tracking-wider mb-1.5 text-[10px] uppercase \${isDarkMode ? 'text-slate-400' : 'text-slate-500'}\`}>Subject</label>
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-teal-400 rounded-xl opacity-0 group-focus-within:opacity-30 blur transition duration-300"></div>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. USDT TxHash submitted for Pro upgrade"
                      required
                      className={\`relative w-full border rounded-xl px-4 py-3 font-medium transition-colors focus:outline-none focus:border-teal-500/50 shadow-sm \${
                        isDarkMode ? 'bg-black/20 border-white/10 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      }\`}
                    />
                  </div>
                </div>

                <div>
                  <label className={\`block font-bold tracking-wider mb-1.5 text-[10px] uppercase \${isDarkMode ? 'text-slate-400' : 'text-slate-500'}\`}>Message</label>
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-teal-400 rounded-xl opacity-0 group-focus-within:opacity-30 blur transition duration-300"></div>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Describe your issue or provide transaction details..."
                      rows={4}
                      required
                      className={\`relative w-full border rounded-xl px-4 py-3 font-medium transition-colors focus:outline-none focus:border-teal-500/50 shadow-sm resize-none \${
                        isDarkMode ? 'bg-black/20 border-white/10 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      }\`}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowNewModal(false)}
                    className={\`px-5 py-2.5 rounded-xl text-xs font-bold transition-all \${
                      isDarkMode ? 'bg-white/10 hover:bg-white/20 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }\`}
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-teal-500 text-white font-bold rounded-xl text-xs shadow-[0_4px_15px_rgba(59,130,246,0.4)] transition-shadow hover:shadow-[0_4px_20px_rgba(59,130,246,0.6)]"
                  >
                    Submit Ticket
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
`;

content = content.substring(0, returnStart) + newReturn + '\n}';

fs.writeFileSync(file, content);
console.log('Replaced return block in SupportTicketScreen');
