const fs = require('fs');
const file = 'mobile/src/screens/main/SettingsScreen.jsx';
let content = fs.readFileSync(file, 'utf8');

// Add framer-motion import
if (!content.includes('framer-motion')) {
  content = content.replace("import React", "import { motion, AnimatePresence } from 'framer-motion';\nimport React");
}

const funcStart = content.indexOf('export default function SettingsScreen');
const returnStart = content.indexOf('return (', funcStart);

const newReturn = `return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
      }}
      className={\`flex-1 p-4 space-y-4 overflow-y-auto \${isDarkMode ? 'bg-gradient-to-b from-[#0B1220] via-[#0F1829] to-[#0D1524] text-white' : 'bg-gradient-to-b from-[#FFFFFF] to-[#F6F9FF] text-slate-900'}\`}
    >
      {/* Profile Card */}
      <motion.div 
        variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}
        className={\`relative flex items-center gap-4 p-5 rounded-3xl border shadow-sm backdrop-blur-xl \${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/70 border-slate-200/50'}\`}
      >
        <div className="relative">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-blue-500 to-teal-400 opacity-40 blur-md"></div>
          <div className="relative p-[2px] rounded-full bg-gradient-to-tr from-blue-500 to-teal-400 shadow-sm">
            <img
              src={user?.avatar || 'https://via.placeholder.com/150'}
              alt="Profile"
              className={\`w-16 h-16 rounded-full object-cover border-2 \${isDarkMode ? 'border-[#0D1524]' : 'border-white'}\`}
            />
          </div>
        </div>
        <div className="flex-1">
          <h2 className="text-base font-black tracking-tight">{user?.name || 'User'}</h2>
          <p className="text-xs text-slate-400 font-medium tracking-wide mb-1.5 font-mono">{user?.phone}</p>
          <div className="inline-flex items-center bg-teal-500/10 text-teal-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-[0_0_8px_rgba(20,184,166,0.2)]">
            Spoken: {user?.language || 'EN'}
          </div>
        </div>
        <motion.button 
          whileHover={{ rotate: 15, scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setEditProfileOpen(true)}
          className={\`p-3 rounded-full flex items-center justify-center shadow-sm border transition-all \${isDarkMode ? 'bg-white/10 border-white/10 text-white hover:bg-white/20' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}\`}
        >
          <Edit2 className="w-4 h-4" />
        </motion.button>
      </motion.div>

      {/* Subscription Banner */}
      <motion.div 
        variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}
        className="relative overflow-hidden p-5 rounded-3xl text-white shadow-lg shadow-blue-900/20"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 to-teal-600"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_3s_infinite]"></div>
        
        <div className="relative z-10 flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-full bg-white/20 backdrop-blur-md shadow-inner">
              <PhoneCall className="w-4 h-4 text-white drop-shadow-sm" />
            </div>
            <span className="font-bold text-sm tracking-wide capitalize drop-shadow-sm">{planName} Plan</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-teal-400 to-cyan-300 text-slate-900 px-3 py-1 rounded-full shadow-[0_0_10px_rgba(45,212,191,0.5)] animate-pulse">
            Recharge / Upgrade
          </span>
        </div>

        <div className="relative z-10 space-y-2 text-[11px] text-blue-50 font-medium">
          <div className="flex justify-between">
            <span>Call Translation Minutes</span>
            <span className="font-bold text-white drop-shadow-sm">{minsUsed}m / {minsLimit}m</span>
          </div>
          <div className="relative w-full h-2 bg-black/20 rounded-full overflow-hidden shadow-inner">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-teal-300 to-cyan-300 rounded-full shadow-[0_0_8px_rgba(103,232,249,0.8)]"
              style={{ width: \`\${Math.min(100, Math.max(5, (minsUsed / minsLimit) * 100))}%\` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
            </div>
          </div>
          <div className="flex justify-between items-center text-[10px] text-blue-100/80 pt-1">
            <span>Resets monthly</span>
            <div className="bg-cyan-400/20 text-cyan-100 px-2 py-0.5 rounded-full border border-cyan-400/30 backdrop-blur-sm shadow-sm">
              <span className="font-bold">100 mins</span> for just 250 BDT
            </div>
          </div>
        </div>
      </motion.div>

      {/* Settings Options List */}
      <motion.div 
        variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}
        className={\`rounded-3xl border overflow-hidden shadow-sm backdrop-blur-md flex flex-col \${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/70 border-slate-200/50'}\`}
      >
        <div className={\`flex flex-col \${isDarkMode ? 'divide-y divide-white/5' : 'divide-y divide-slate-100'}\`}>
          
          {/* Spoken Language */}
          <motion.div whileTap={{ scale: 0.99 }} onClick={() => setLanguageModalOpen(true)} className={\`group p-4 flex items-center justify-between cursor-pointer transition-colors \${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50/80'}\`}>
            <div className="flex items-center gap-3.5">
              <div className="p-2 rounded-full bg-teal-500/15 shadow-inner">
                <Globe className="w-4 h-4 text-teal-400" />
              </div>
              <span className="text-xs font-bold">{t('language')}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-teal-500 font-black uppercase tracking-wider">{user?.language || 'EN'}</span>
              <ChevronRight className="w-4 h-4 text-slate-400 transition-transform group-hover:translate-x-1" />
            </div>
          </motion.div>

          {/* Interface Language */}
          <motion.div whileTap={{ scale: 0.99 }} onClick={() => setAppLanguage(appLanguage === 'bn' ? 'en' : 'bn')} className={\`group p-4 flex items-center justify-between cursor-pointer transition-colors \${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50/80'}\`}>
            <div className="flex items-center gap-3.5">
              <div className="p-2 rounded-full bg-blue-500/15 shadow-inner">
                <Globe className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-xs font-bold">{t('interfaceLang')}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-black text-blue-500 tracking-wide">{appLanguage === 'bn' ? 'বাংলা' : 'English'}</span>
              <ChevronRight className="w-4 h-4 text-slate-400 transition-transform group-hover:translate-x-1" />
            </div>
          </motion.div>

          {/* Appearance Themes */}
          <motion.div whileTap={{ scale: 0.99 }} onClick={() => setThemeModalOpen(true)} className={\`group p-4 flex items-center justify-between cursor-pointer transition-colors \${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50/80'}\`}>
            <div className="flex items-center gap-3.5">
              <div className={\`p-2 rounded-full shadow-inner \${isDarkMode ? 'bg-cyan-500/15' : 'bg-amber-500/15'}\`}>
                {isDarkMode ? <Moon className="w-4 h-4 text-cyan-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
              </div>
              <span className="text-xs font-bold">{t('theme')}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className={\`font-bold capitalize \${isDarkMode ? 'text-slate-300' : 'text-slate-500'}\`}>{theme}</span>
              <ChevronRight className="w-4 h-4 text-slate-400 transition-transform group-hover:translate-x-1" />
            </div>
          </motion.div>

          {/* Chat Wallpaper */}
          <motion.div whileTap={{ scale: 0.99 }} onClick={() => setWallpaperModalOpen(true)} className={\`group p-4 flex items-center justify-between cursor-pointer transition-colors \${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50/80'}\`}>
            <div className="flex items-center gap-3.5">
              <div className="p-2 rounded-full bg-pink-500/15 shadow-inner">
                <ImageIcon className="w-4 h-4 text-pink-400" />
              </div>
              <span className="text-xs font-bold">Chat Wallpaper</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className={\`font-bold capitalize \${isDarkMode ? 'text-slate-300' : 'text-slate-500'}\`}>{user?.chat_wallpaper || 'Default'}</span>
              <ChevronRight className="w-4 h-4 text-slate-400 transition-transform group-hover:translate-x-1" />
            </div>
          </motion.div>

        </div>
      </motion.div>

      {/* Account Actions */}
      <motion.div 
        variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}
        className={\`rounded-3xl border overflow-hidden shadow-sm backdrop-blur-md flex flex-col \${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/70 border-slate-200/50'}\`}
      >
        <div className={\`flex flex-col \${isDarkMode ? 'divide-y divide-white/5' : 'divide-y divide-slate-100'}\`}>
          <motion.div whileTap={{ scale: 0.99 }} onClick={logout} className={\`p-4 flex items-center gap-3.5 cursor-pointer transition-colors \${isDarkMode ? 'text-slate-300 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80'}\`}>
            <div className="p-2 rounded-full bg-slate-500/15 shadow-inner">
              <LogOut className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold">Log Out</span>
          </motion.div>
          <motion.div whileTap={{ scale: 0.99 }} onClick={handleDeleteAccountConfirm} className={\`group p-4 flex items-center gap-3.5 cursor-pointer transition-colors \${isDarkMode ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10' : 'text-red-500 hover:text-red-600 hover:bg-red-50'}\`}>
            <div className="relative p-2 rounded-full bg-red-500/15 shadow-inner group-hover:shadow-[0_0_12px_rgba(239,68,68,0.3)] transition-shadow">
              <Trash2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold">Delete Account</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Modals */}
      <EditProfileModal isOpen={editProfileOpen} onClose={() => setEditProfileOpen(false)} />

      {/* Language Switch Modal */}
      <AnimatePresence>
        {languageModalOpen && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={\`border rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl \${isDarkMode ? 'bg-[#0D1524]/90 border-teal-500/30' : 'bg-white/90 border-teal-500/20'}\`}
            >
              <h3 className={\`text-sm font-black flex items-center gap-3 \${isDarkMode ? 'text-white' : 'text-slate-900'}\`}>
                <div className="p-1.5 rounded-full bg-teal-500/20 shadow-[0_0_10px_rgba(20,184,166,0.3)]">
                  <Globe className="w-4 h-4 text-teal-500" />
                </div>
                Change Spoken Language
              </h3>
              <div className="space-y-2.5">
                {spokenLanguages.map((l) => {
                  const isSelected = user?.language === l.code;
                  return (
                    <motion.div 
                      key={l.code}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleLanguageChange(l.code)} 
                      className={\`p-3.5 rounded-2xl border cursor-pointer text-xs font-bold flex items-center justify-between transition-all \${
                        isSelected 
                          ? 'bg-gradient-to-r from-teal-500/20 to-teal-400/5 border-teal-500/50 text-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.15)]' 
                          : isDarkMode ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }\`}
                    >
                      <span>{l.name}</span>
                      {isSelected && (
                        <motion.div 
                          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
                          className="w-5 h-5 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5 text-white" />
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
              <button onClick={() => setLanguageModalOpen(false)} className={\`w-full py-3 mt-2 rounded-xl text-xs font-bold transition-colors \${isDarkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'}\`}>Cancel</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Theme Modal */}
      <AnimatePresence>
        {themeModalOpen && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={\`border rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl \${isDarkMode ? 'bg-[#0D1524]/90 border-blue-500/30' : 'bg-white/90 border-blue-500/20'}\`}
            >
              <h3 className={\`text-sm font-black flex items-center gap-3 \${isDarkMode ? 'text-white' : 'text-slate-900'}\`}>
                <div className="p-1.5 rounded-full bg-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                  {isDarkMode ? <Moon className="w-4 h-4 text-blue-500" /> : <Sun className="w-4 h-4 text-blue-500" />}
                </div>
                Select Appearance Theme
              </h3>
              <div className="space-y-2.5">
                {themes.map((tItem) => {
                  const isSelected = theme === tItem.code;
                  return (
                    <motion.div 
                      key={tItem.code} 
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleThemeChange(tItem.code)} 
                      className={\`p-3.5 rounded-2xl border cursor-pointer text-xs font-bold flex items-center justify-between transition-all \${
                        isSelected 
                          ? 'bg-gradient-to-r from-blue-500/20 to-blue-400/5 border-blue-500/50 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)]' 
                          : isDarkMode ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }\`}
                    >
                      <span>{tItem.name}</span>
                      {isSelected && (
                        <motion.div 
                          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
                          className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-400 flex items-center justify-center shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5 text-white" />
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
              <button onClick={() => setThemeModalOpen(false)} className={\`w-full py-3 mt-2 rounded-xl text-xs font-bold transition-colors \${isDarkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'}\`}>Cancel</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Wallpaper Modal */}
      <AnimatePresence>
        {wallpaperModalOpen && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={\`border rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl \${isDarkMode ? 'bg-[#0D1524]/90 border-pink-500/30' : 'bg-white/90 border-pink-500/20'}\`}
            >
              <h3 className={\`text-sm font-black flex items-center gap-3 \${isDarkMode ? 'text-white' : 'text-slate-900'}\`}>
                <div className="p-1.5 rounded-full bg-pink-500/20 shadow-[0_0_10px_rgba(236,72,153,0.3)]">
                  <ImageIcon className="w-4 h-4 text-pink-500" />
                </div>
                Select Chat Wallpaper
              </h3>
              <div className="space-y-2.5">
                {wallpapers.map((w) => {
                  const isSelected = user?.chat_wallpaper === w.code;
                  return (
                    <motion.div 
                      key={w.code} 
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleWallpaperChange(w.code)} 
                      className={\`p-3.5 rounded-2xl border cursor-pointer text-xs font-bold flex items-center justify-between transition-all \${
                        isSelected 
                          ? 'bg-gradient-to-r from-pink-500/20 to-pink-400/5 border-pink-500/50 text-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.15)]' 
                          : isDarkMode ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }\`}
                    >
                      <span>{w.name}</span>
                      {isSelected && (
                        <motion.div 
                          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
                          className="w-5 h-5 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5 text-white" />
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
              <button onClick={() => setWallpaperModalOpen(false)} className={\`w-full py-3 mt-2 rounded-xl text-xs font-bold transition-colors \${isDarkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'}\`}>Cancel</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );`;

content = content.substring(0, returnStart) + newReturn + '\n}';

fs.writeFileSync(file, content);
console.log('Replaced return block in SettingsScreen');
