const fs = require('fs');
const file = 'mobile/src/components/CreateGroupModal.jsx';
let content = fs.readFileSync(file, 'utf8');

const returnStart = content.indexOf('return (');

const newReturn = `return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-md"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.6)_100%)] pointer-events-none" />
        
        <motion.div
          initial={{ y: '100%' }} 
          animate={{ y: 0 }} 
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={\`relative w-full max-w-md h-[85vh] sm:h-[650px] flex flex-col rounded-t-3xl sm:rounded-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] overflow-hidden border-t \${
            isDarkMode ? 'bg-gradient-to-b from-[#0B1220] to-[#0F1829] border-teal-500/20 text-white' : 'bg-gradient-to-b from-[#FFFFFF] to-[#F6F9FF] border-slate-200 text-slate-900'
          }\`}
        >
          {/* Header */}
          <div className={\`flex items-center justify-between p-5 border-b \${isDarkMode ? 'border-white/5' : 'border-slate-200/60'}\`}>
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center shadow-[0_0_15px_rgba(45,212,191,0.4)]">
                <Users className="w-5 h-5 text-white drop-shadow-md" />
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight">New Group</h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={\`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider \${
                    isDarkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-600'
                  }\`}>
                    {selectedIds.length} SELECTED
                  </span>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className={\`p-2.5 rounded-full backdrop-blur-xl border transition-all active:scale-90 \${
                isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300 hover:text-white' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900'
              }\`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Group Name Input */}
          <div className="p-4 shrink-0">
            <div className={\`relative group p-1 rounded-2xl transition-all duration-300 \${
              isDarkMode ? 'bg-white/5 border border-white/10 focus-within:bg-white/10' : 'bg-white border border-slate-200 focus-within:bg-slate-50 shadow-sm'
            }\`}>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-teal-400 rounded-2xl opacity-0 group-focus-within:opacity-40 blur transition duration-300"></div>
              <input
                type="text"
                placeholder="Group Name (e.g. Family, Office Team)"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className={\`relative w-full bg-transparent text-base font-black px-4 py-3 rounded-xl focus:outline-none placeholder-slate-400 \${isDarkMode ? 'text-white' : 'text-slate-900'}\`}
                autoFocus
              />
            </div>
          </div>

          {/* Contacts List */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                {/* Gradient animated spinner */}
                <svg className="w-10 h-10 animate-spin text-teal-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : contacts.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-full text-center space-y-3"
              >
                <div className="w-14 h-14 rounded-full bg-slate-500/10 flex items-center justify-center shadow-inner">
                  <Users className="w-7 h-7 text-slate-400" />
                </div>
                <div className="text-slate-400 text-xs font-semibold">No contacts found to add.</div>
              </motion.div>
            ) : (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
                }}
                className="space-y-2"
              >
                {contacts.map((c) => {
                  const isSelected = selectedIds.includes(c.id);
                  return (
                    <motion.div 
                      variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}
                      whileHover={{ scale: 1.01 }}
                      key={c.id} 
                      onClick={() => toggleContact(c.id)}
                      className={\`flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all duration-300 \${
                        isSelected 
                          ? isDarkMode 
                            ? 'bg-gradient-to-r from-blue-500/15 to-teal-500/5 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                            : 'bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-200 shadow-sm'
                          : isDarkMode 
                            ? 'border border-transparent hover:bg-amber-500/5 hover:border-amber-500/10' 
                            : 'border border-transparent hover:bg-amber-50 hover:border-amber-100'
                      }\`}
                    >
                      <div className="relative flex-shrink-0">
                        <div className={\`p-0.5 rounded-full transition-all duration-300 \${
                          isSelected ? 'bg-gradient-to-tr from-blue-500 to-teal-400' : 'bg-transparent'
                        }\`}>
                          <img src={c.avatar} alt={c.name} className="w-12 h-12 rounded-full object-cover border-2 border-transparent" style={{ borderColor: isDarkMode ? '#0F1829' : '#FFFFFF' }} />
                        </div>
                        <AnimatePresence>
                          {isSelected && (
                            <motion.div 
                              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                              transition={{ type: 'spring', damping: 15 }}
                              className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-tr from-blue-500 to-teal-400 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(45,212,191,0.5)] border-2"
                              style={{ borderColor: isDarkMode ? '#0F1829' : '#FFFFFF' }}
                            >
                              <Check className="w-3 h-3 text-white drop-shadow-sm" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={\`font-black truncate \${isDarkMode ? 'text-white' : 'text-slate-900'}\`}>{c.name}</h4>
                        <p className={\`text-[11px] font-semibold truncate \${isDarkMode ? 'text-slate-400' : 'text-slate-500'}\`}>{c.phone}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>

          {/* Create Button Footer */}
          <div className={\`p-5 shrink-0 border-t \${isDarkMode ? 'bg-gradient-to-b from-[#0F1829] to-[#0B1220] border-white/5' : 'bg-white border-slate-200/60'}\`}>
            <motion.div
              animate={{ scale: (!groupName.trim() || selectedIds.length === 0 || creating) ? 1 : [1, 1.05, 1] }}
              transition={{ duration: 0.3 }}
            >
              <button
                onClick={handleCreate}
                disabled={creating || !groupName.trim() || selectedIds.length === 0}
                className={\`w-full py-4 rounded-xl font-black text-[13px] tracking-widest uppercase transition-all duration-300 flex justify-center items-center gap-2 relative overflow-hidden group \${
                  (!groupName.trim() || selectedIds.length === 0 || creating)
                    ? isDarkMode ? 'bg-white/5 text-slate-500 cursor-not-allowed' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-teal-500 text-white shadow-[0_8px_20px_rgba(45,212,191,0.4)] hover:shadow-[0_10px_25px_rgba(45,212,191,0.6)] active:scale-[0.98]'
                }\`}
              >
                {!(!groupName.trim() || selectedIds.length === 0 || creating) && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover:animate-[shimmer_2s_infinite]" />
                )}
                
                <span className="relative z-10 flex items-center gap-2 drop-shadow-md">
                  {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Users className="w-5 h-5" />}
                  {creating ? 'CREATING...' : 'CREATE GROUP'}
                </span>
              </button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
`;

content = content.substring(0, returnStart) + newReturn + '\n}';

fs.writeFileSync(file, content);
console.log('Replaced return block in CreateGroupModal');
