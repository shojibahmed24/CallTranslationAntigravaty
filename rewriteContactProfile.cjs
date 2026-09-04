const fs = require('fs');
const file = 'mobile/src/components/ContactProfileScreen.jsx';
let content = fs.readFileSync(file, 'utf8');

const funcStart = content.indexOf('export default function ContactProfileScreen');
const returnStart = content.indexOf('return (', funcStart);

const newReturn = `return (
    <>
      <AnimatePresence>
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
              Contact Info
            </h2>
          </div>

          <div className="relative z-10 flex-1 overflow-y-auto pb-8 scrollbar-hide">
            {/* Main Profile Info */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className={\`flex flex-col items-center py-10 border-b \${isDarkMode ? 'border-white/5' : 'border-slate-200'}\`}
            >
              <div className="relative w-36 h-36 mb-5">
                {/* Glowing Gradient Ring */}
                <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-blue-500 to-teal-400 opacity-80 shadow-[0_0_30px_rgba(45,212,191,0.4)]" />
                <img 
                  src={contact.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop'} 
                  alt={contact.name} 
                  className={\`w-full h-full rounded-full object-cover relative z-10 border-4 \${isDarkMode ? 'border-[#0B1220]' : 'border-[#F8FAFC]'}\`}
                />
              </div>
              <h2 className={\`text-3xl font-black mb-1 \${isDarkMode ? 'text-white drop-shadow-sm' : 'text-slate-900'}\`}>
                {contact.name}
              </h2>
              <p className={\`text-[13px] font-bold tracking-wide mb-1 \${isDarkMode ? 'text-slate-300' : 'text-slate-600'}\`}>
                {contact.phone}
              </p>
              <p className={\`text-[11px] font-semibold tracking-wider uppercase \${isDarkMode ? 'text-teal-400/80' : 'text-teal-600'}\`}>
                ~ {contact.status || 'Available'}
              </p>
              
              <div className="flex items-center gap-8 mt-8">
                <button onClick={() => onStartCall(false)} disabled={isBlocked} className="flex flex-col items-center gap-2 group disabled:opacity-50">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-emerald-500 group-hover:to-emerald-400 group-hover:text-white group-hover:shadow-[0_4px_15px_rgba(16,185,129,0.4)] active:scale-90">
                    <Phone className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold tracking-wider text-emerald-500">Audio</span>
                </button>
                <button onClick={() => onStartCall(true)} disabled={isBlocked} className="flex flex-col items-center gap-2 group disabled:opacity-50">
                  <div className="w-14 h-14 rounded-full bg-blue-500/15 text-blue-500 flex items-center justify-center transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-blue-600 group-hover:to-blue-500 group-hover:text-white group-hover:shadow-[0_4px_15px_rgba(59,130,246,0.4)] active:scale-90">
                    <Video className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold tracking-wider text-blue-500">Video</span>
                </button>
                <button onClick={() => { if(onSearchClick) onSearchClick(); onClose(); }} className="flex flex-col items-center gap-2 group">
                  <div className="w-14 h-14 rounded-full bg-slate-500/15 text-slate-400 flex items-center justify-center transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-slate-500 group-hover:to-slate-400 group-hover:text-white group-hover:shadow-[0_4px_15px_rgba(100,116,139,0.4)] active:scale-90">
                    <Search className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold tracking-wider text-slate-400">Search</span>
                </button>
              </div>
            </motion.div>

            {/* About Details */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <div className={\`mx-4 my-5 p-5 rounded-3xl backdrop-blur-md shadow-sm border \${
                isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/70 border-slate-200'
              }\`}>
                <p className={\`text-[10px] font-black tracking-widest uppercase mb-1.5 \${isDarkMode ? 'text-teal-400' : 'text-teal-600'}\`}>About</p>
                <p className={\`text-base font-semibold \${isDarkMode ? 'text-white' : 'text-slate-900'}\`}>{contact.status || 'Available'}</p>
              </div>
            </motion.div>

            {/* Media Links Docs */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className={\`mx-4 mb-5 rounded-3xl backdrop-blur-md shadow-sm border overflow-hidden \${
                isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/70 border-slate-200'
              }\`}>
                <div onClick={() => setShowMediaGallery(true)} className={\`p-5 flex items-center justify-between cursor-pointer transition group \${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50'}\`}>
                  <span className={\`text-[13px] font-black uppercase tracking-wider \${isDarkMode ? 'text-slate-300' : 'text-slate-700'}\`}>Media, links, and docs</span>
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-xs font-bold bg-slate-500/20 px-2 py-0.5 rounded-full text-slate-300">{mediaItems.length}</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform group-hover:text-blue-400" />
                  </div>
                </div>
                <div className="flex gap-3 p-5 pt-0 overflow-x-auto scrollbar-hide">
                  {mediaItems.slice(0, 5).map(item => (
                    item.type === 'image' ? (
                      <div key={item.id} className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 group cursor-pointer border border-white/10 shadow-sm">
                        <img src={item.file_url?.startsWith('http') ? item.file_url : \`http://192.168.68.105:5000\${item.file_url}\`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 group-hover:brightness-110" />
                      </div>
                    ) : (
                      <div key={item.id} className={\`w-24 h-24 rounded-2xl shrink-0 flex flex-col items-center justify-center p-3 border shadow-sm cursor-pointer transition-all hover:-translate-y-1 \${
                        isDarkMode ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-600'
                      }\`}>
                        <div className={\`p-2 rounded-full mb-2 \${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'}\`}>
                          <FileText className="w-5 h-5" />
                        </div>
                        <span className="text-[9px] font-bold truncate w-full text-center tracking-wide">{item.text || 'Document'}</span>
                      </div>
                    )
                  ))}
                  {mediaItems.length === 0 && (
                    <div className={\`w-24 h-24 rounded-2xl flex items-center justify-center border border-dashed \${
                      isDarkMode ? 'bg-white/5 border-white/20' : 'bg-slate-50 border-slate-300'
                    }\`}>
                      <div className={\`p-3 rounded-full \${isDarkMode ? 'bg-white/5' : 'bg-slate-200'}\`}>
                        <ImageIcon className={\`w-6 h-6 \${isDarkMode ? 'text-slate-500' : 'text-slate-400'}\`} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Options */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <div className={\`mx-4 mb-5 rounded-3xl backdrop-blur-md shadow-sm border overflow-hidden divide-y \${
                isDarkMode ? 'bg-white/5 border-white/10 divide-white/5' : 'bg-white/70 border-slate-200 divide-slate-100'
              }\`}>
                <div onClick={toggleMute} className={\`p-5 flex items-center justify-between cursor-pointer transition \${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50'}\`}>
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-slate-500/20">
                      <Bell className={\`w-5 h-5 \${isDarkMode ? 'text-slate-300' : 'text-slate-600'}\`} />
                    </div>
                    <span className={\`text-[13px] font-black uppercase tracking-wider \${isDarkMode ? 'text-white' : 'text-slate-900'}\`}>Mute notifications</span>
                  </div>
                  <div className={\`w-11 h-6 rounded-full flex items-center p-0.5 transition-colors duration-300 \${isMuted ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : isDarkMode ? 'bg-slate-700' : 'bg-slate-300'}\`}>
                    <motion.div 
                      layout
                      initial={false}
                      animate={{ x: isMuted ? 20 : 0 }}
                      className="w-5 h-5 bg-white rounded-full shadow-md" 
                    />
                  </div>
                </div>
                <div className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-teal-500/20 shadow-inner">
                      <Lock className="w-5 h-5 text-teal-400" />
                    </div>
                    <div>
                      <p className={\`text-[13px] font-black uppercase tracking-wider mb-0.5 \${isDarkMode ? 'text-white' : 'text-slate-900'}\`}>Encryption</p>
                      <p className={\`text-[11px] font-medium \${isDarkMode ? 'text-slate-400' : 'text-slate-500'}\`}>Messages and calls are end-to-end encrypted.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Danger Zone */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <div className={\`mx-4 mb-8 rounded-3xl backdrop-blur-md shadow-sm border overflow-hidden divide-y \${
                isDarkMode ? 'bg-white/5 border-red-500/10 divide-white/5' : 'bg-white/70 border-red-200 divide-slate-100'
              }\`}>
                <div onClick={toggleBlock} className="p-5 flex items-center gap-4 cursor-pointer hover:bg-red-500/10 transition-colors duration-300 group text-red-500">
                  <div className="p-2 rounded-full bg-red-500/15 group-hover:bg-red-500/20 group-hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all">
                    <Ban className="w-5 h-5 group-hover:text-red-400" />
                  </div>
                  <span className="text-[13px] font-black uppercase tracking-wider group-hover:text-red-400">{isBlocked ? 'Unblock' : 'Block'} {contact.name}</span>
                  {loading && <Loader2 className="w-4 h-4 animate-spin ml-auto" />}
                </div>
                <div className="p-5 flex items-center gap-4 cursor-pointer hover:bg-red-500/10 transition-colors duration-300 group text-red-500">
                  <div className="p-2 rounded-full bg-red-500/15 group-hover:bg-red-500/20 group-hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all">
                    <ThumbsDown className="w-5 h-5 group-hover:text-red-400" />
                  </div>
                  <span className="text-[13px] font-black uppercase tracking-wider group-hover:text-red-400">Report {contact.name}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Media Gallery Overlay */}
      <ChatMediaGallery 
        isOpen={showMediaGallery} 
        onClose={() => setShowMediaGallery(false)} 
        mediaItems={mediaItems} 
      />
    </>
  );
`;

content = content.substring(0, returnStart) + newReturn + '\n}';

fs.writeFileSync(file, content);
console.log('Replaced return block in ContactProfileScreen');
