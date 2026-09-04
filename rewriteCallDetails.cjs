const fs = require('fs');
const file = 'mobile/src/components/CallDetailsModal.jsx';
let content = fs.readFileSync(file, 'utf8');

// make sure framer-motion is imported
if (!content.includes('framer-motion')) {
  content = content.replace("import React from 'react';", "import React from 'react';\nimport { motion, AnimatePresence } from 'framer-motion';");
}

if (!content.includes('ArrowRight')) {
  content = content.replace("ArrowLeft,", "ArrowLeft, ArrowRight,");
}

const funcStart = content.indexOf('export default function CallDetailsModal');
const returnStart = content.indexOf('return (', funcStart);

const newReturn = `return (
    <AnimatePresence>
      {isOpen && contact && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={\`fixed inset-0 z-50 flex flex-col \${isDarkMode ? 'bg-[#0B1220]' : 'bg-[#F8FAFC]'}\`}
        >
          {/* Layered Gradient Background */}
          <div className={\`absolute inset-0 pointer-events-none \${
            isDarkMode ? 'bg-gradient-to-b from-transparent via-[#0F1829]/50 to-[#0D1524]' : 'bg-gradient-to-b from-transparent to-blue-50/50'
          }\`} />

          {/* Header */}
          <div className={\`relative z-10 flex items-center gap-4 p-4 border-b \${isDarkMode ? 'border-white/5' : 'border-slate-200'}\`}>
            <button 
              onClick={onClose} 
              className={\`p-2.5 rounded-full transition-all active:scale-95 \${
                isDarkMode ? 'bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300' : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-600'
              }\`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className={\`font-black text-lg bg-clip-text text-transparent bg-gradient-to-r drop-shadow-sm \${
              isDarkMode ? 'from-blue-400 to-teal-400' : 'from-blue-600 to-teal-600'
            }\`}>
              Call Info
            </h2>
          </div>

          <div className="relative z-10 flex-1 overflow-y-auto scrollbar-hide">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
              }}
              className="flex flex-col min-h-full pb-8"
            >
              {/* Profile Basic Info */}
              <motion.div 
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                className={\`p-8 border-b \${isDarkMode ? 'border-white/5' : 'border-slate-200'} flex flex-col items-center justify-center text-center relative\`}
              >
                <div className="relative w-28 h-28 mb-5">
                  <div className={\`absolute -inset-1.5 rounded-full opacity-80 \${
                    isMissed 
                      ? 'bg-gradient-to-tr from-red-500 to-rose-400 shadow-[0_0_30px_rgba(239,68,68,0.4)]' 
                      : callRecord.isOutgoing 
                        ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-[0_0_30px_rgba(16,185,129,0.4)]'
                        : 'bg-gradient-to-tr from-blue-500 to-indigo-400 shadow-[0_0_30px_rgba(59,130,246,0.4)]'
                  }\`} />
                  <img 
                    src={contact.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop'} 
                    alt={contact.name} 
                    className={\`w-full h-full rounded-full object-cover relative z-10 border-4 \${isDarkMode ? 'border-[#0B1220]' : 'border-[#F8FAFC]'}\`}
                  />
                </div>
                
                <h2 className={\`text-3xl font-black mb-1 \${isDarkMode ? 'text-white drop-shadow-sm' : 'text-slate-900'}\`}>{contact.name}</h2>
                <p className={\`text-[13px] font-bold tracking-wide mb-8 \${isDarkMode ? 'text-slate-300' : 'text-slate-600'}\`}>{contact.phone}</p>
                
                <div className="flex items-center justify-center gap-8 w-full max-w-sm mx-auto">
                  <button onClick={() => onMessage && onMessage()} className="flex flex-col items-center gap-2.5 group">
                    <div className="w-14 h-14 rounded-full bg-blue-500/15 text-blue-500 flex items-center justify-center transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-blue-600 group-hover:to-blue-500 group-hover:text-white group-hover:shadow-[0_4px_15px_rgba(59,130,246,0.4)] active:scale-90">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold tracking-wider text-slate-500 group-hover:text-blue-500 transition-colors uppercase">Message</span>
                  </button>
                  <button onClick={() => onStartCall && onStartCall(false)} className="flex flex-col items-center gap-2.5 group">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-emerald-500 group-hover:to-emerald-400 group-hover:text-white group-hover:shadow-[0_4px_15px_rgba(16,185,129,0.4)] active:scale-90">
                      <Phone className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold tracking-wider text-slate-500 group-hover:text-emerald-500 transition-colors uppercase">Audio</span>
                  </button>
                  <button onClick={() => onStartCall && onStartCall(true)} className="flex flex-col items-center gap-2.5 group">
                    <div className="w-14 h-14 rounded-full bg-indigo-500/15 text-indigo-500 flex items-center justify-center transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-indigo-600 group-hover:to-indigo-500 group-hover:text-white group-hover:shadow-[0_4px_15px_rgba(99,102,241,0.4)] active:scale-90">
                      <Video className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold tracking-wider text-slate-500 group-hover:text-indigo-500 transition-colors uppercase">Video</span>
                  </button>
                </div>
              </motion.div>

              <div className="px-5 py-8">
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                  <h3 className={\`text-[10px] font-black uppercase tracking-widest mb-4 ml-1 \${isDarkMode ? 'text-slate-400' : 'text-slate-500'}\`}>Call Details</h3>
                  
                  <div className={\`rounded-3xl border backdrop-blur-md shadow-sm p-6 space-y-6 \${
                    isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/70 border-slate-200'
                  }\`}>
                    
                    <div className="flex items-start gap-5">
                      <div className={\`p-3.5 rounded-full text-white shadow-md \${
                        isMissed 
                          ? 'bg-gradient-to-tr from-red-500 to-rose-400 shadow-[0_4px_15px_rgba(239,68,68,0.3)]' 
                          : callRecord.isOutgoing 
                            ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-[0_4px_15px_rgba(16,185,129,0.3)]'
                            : 'bg-gradient-to-tr from-blue-500 to-indigo-400 shadow-[0_4px_15px_rgba(59,130,246,0.3)]'
                      }\`}>
                        {isMissed ? <PhoneMissed className="w-6 h-6" /> : callRecord.isOutgoing ? <PhoneOutgoing className="w-6 h-6" /> : <PhoneIncoming className="w-6 h-6" />}
                      </div>
                      <div>
                        <h4 className={\`font-black text-lg \${isDarkMode ? 'text-white' : 'text-slate-900'}\`}>
                          {isMissed ? 'Missed Call' : callRecord.isOutgoing ? 'Outgoing Call' : 'Incoming Call'}
                        </h4>
                        <div className="space-y-1.5 mt-2">
                          <p className={\`text-[13px] font-semibold flex items-center gap-2 \${isDarkMode ? 'text-slate-400' : 'text-slate-500'}\`}>
                            <Calendar className="w-4 h-4 opacity-70" />
                            {new Date(callRecord.createdAt).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                          <p className={\`text-[13px] font-semibold flex items-center gap-2 \${isDarkMode ? 'text-slate-400' : 'text-slate-500'}\`}>
                            <Clock className="w-4 h-4 opacity-70" />
                            {new Date(callRecord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {!isMissed && (
                      <div className={\`pt-5 border-t \${isDarkMode ? 'border-white/5' : 'border-slate-200'}\`}>
                        <div className="flex justify-between items-center mb-4">
                          <span className={\`text-[13px] font-black uppercase tracking-wider \${isDarkMode ? 'text-slate-400' : 'text-slate-500'}\`}>Duration</span>
                          <span className={\`text-lg font-black bg-clip-text text-transparent bg-gradient-to-r \${isDarkMode ? 'from-slate-200 to-white' : 'from-slate-700 to-slate-900'}\`}>
                            {formatDurationText(callRecord.durationSeconds)}
                          </span>
                        </div>
                        {callRecord.isTranslated && (
                          <div className="flex justify-between items-center">
                            <span className={\`text-[13px] font-black uppercase tracking-wider \${isDarkMode ? 'text-slate-400' : 'text-slate-500'}\`}>Translation</span>
                            <span className="px-3 py-1 rounded-full text-[11px] font-black tracking-widest uppercase bg-teal-500/15 text-teal-500 border border-teal-500/20 shadow-[0_0_10px_rgba(20,184,166,0.1)]">
                              {callRecord.translationMinutesCharged || 0} MIN CHARGED
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {callRecord.isTranslated && (
                      <div className={\`pt-5 border-t \${isDarkMode ? 'border-white/5' : 'border-slate-200'}\`}>
                        <div className="flex items-center justify-between">
                          <span className={\`text-[13px] font-black uppercase tracking-wider \${isDarkMode ? 'text-slate-400' : 'text-slate-500'}\`}>Route</span>
                          <div className="flex items-center gap-2.5">
                            <span className={\`px-3 py-1.5 rounded-xl text-xs font-black tracking-widest shadow-sm \${
                              isDarkMode ? 'bg-gradient-to-br from-indigo-500/20 to-blue-500/10 text-blue-300 border border-blue-500/30' : 'bg-gradient-to-br from-indigo-50 to-blue-50 text-blue-600 border border-blue-200'
                            }\`}>
                              {callRecord.callerLang?.toUpperCase() || 'EN'}
                            </span>
                            <ArrowRight className={\`w-4 h-4 \${isDarkMode ? 'text-slate-500' : 'text-slate-400'}\`} />
                            <span className={\`px-3 py-1.5 rounded-xl text-xs font-black tracking-widest shadow-sm \${
                              isDarkMode ? 'bg-gradient-to-br from-indigo-500/20 to-blue-500/10 text-blue-300 border border-blue-500/30' : 'bg-gradient-to-br from-indigo-50 to-blue-50 text-blue-600 border border-blue-200'
                            }\`}>
                              {callRecord.receiverLang?.toUpperCase() || 'ES'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>

                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                  <div className={\`mt-8 flex flex-col rounded-3xl border overflow-hidden backdrop-blur-md transition-shadow \${
                    isDarkMode ? 'bg-gradient-to-b from-red-500/5 to-red-500/10 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.05)] divide-y divide-red-500/10' : 'bg-red-50 border-red-200 divide-y divide-red-100'
                  }\`}>
                    <button onClick={() => {
                      if(window.confirm('Delete call history with this user?')) {
                        if (onDeleteLog) onDeleteLog(callRecord);
                        onClose();
                      }
                    }} className="w-full flex items-center gap-4 p-5 hover:bg-red-500/10 hover:shadow-[inset_0_0_20px_rgba(239,68,68,0.05)] transition-all group">
                      <div className="p-2 rounded-full bg-red-500/15 group-hover:bg-red-500/20 transition-colors">
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </div>
                      <span className="text-[13px] font-black tracking-wider uppercase text-red-500">Delete Call Log</span>
                    </button>
                    <button onClick={() => {
                      if(window.confirm('Block this contact?')) {
                        onClose();
                      }
                    }} className="w-full flex items-center gap-4 p-5 hover:bg-red-500/10 hover:shadow-[inset_0_0_20px_rgba(239,68,68,0.05)] transition-all group">
                      <div className="p-2 rounded-full bg-red-500/15 group-hover:bg-red-500/20 transition-colors">
                        <Ban className="w-5 h-5 text-red-500" />
                      </div>
                      <span className="text-[13px] font-black tracking-wider uppercase text-red-500">Block Contact</span>
                    </button>
                  </div>
                </motion.div>

                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                  <div className={\`mt-6 flex items-center justify-center gap-3 text-[11px] tracking-wide font-bold backdrop-blur-sm p-4 rounded-2xl border \${
                    isDarkMode ? 'bg-white/5 text-slate-400 border-white/10' : 'bg-slate-50 text-slate-500 border-slate-200'
                  }\`}>
                    <Lock className="w-4 h-4 text-teal-400 drop-shadow-[0_0_5px_rgba(45,212,191,0.5)]" />
                    CALLS ARE END-TO-END ENCRYPTED
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
`;

content = content.substring(0, returnStart) + newReturn + '\n}';
content = content.replace('if (!isOpen || !contact) return null;', '');

fs.writeFileSync(file, content);
console.log('Replaced return block in CallDetailsModal');
