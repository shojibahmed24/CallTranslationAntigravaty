const fs = require('fs');
const file = 'mobile/src/components/EditProfileModal.jsx';
let content = fs.readFileSync(file, 'utf8');

const returnStart = content.indexOf('return (');

const newReturn = `return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-gradient-to-b from-[#0B1220] to-[#0F1829] border border-teal-500/20 rounded-[32px] max-w-sm w-full overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <h2 className="text-lg font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400 drop-shadow-sm">
              Edit Profile
            </h2>
            <button 
              onClick={onClose} 
              disabled={loading} 
              className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-all active:scale-95 disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
            }}
            className="p-6 space-y-7"
          >
            {/* Avatar Upload */}
            <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} className="flex flex-col items-center">
              <div 
                className="relative w-32 h-32 rounded-full cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                {/* Glowing Gradient Ring */}
                <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-blue-500 to-teal-400 opacity-80 shadow-[0_0_25px_rgba(45,212,191,0.3)] group-hover:shadow-[0_0_35px_rgba(45,212,191,0.5)] transition-shadow duration-300" />
                
                <img 
                  src={avatarPreview || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop'} 
                  alt="Avatar" 
                  className="w-full h-full rounded-full object-cover border-4 border-[#0B1220] relative z-10 transition duration-300 group-hover:brightness-75"
                />
                
                {/* Camera Overlay */}
                <div className="absolute inset-0 z-20 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="p-3 rounded-full bg-white/20 backdrop-blur-md shadow-lg">
                    <Camera className="w-8 h-8 text-white drop-shadow-md" />
                  </div>
                </div>
                
                {/* Small Corner Badge */}
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 15, delay: 0.3 }}
                  className="absolute bottom-0 right-0 p-2 bg-gradient-to-tr from-blue-500 to-teal-400 rounded-full border-[3px] border-[#0B1220] shadow-[0_0_15px_rgba(45,212,191,0.5)] z-30"
                >
                  <Camera className="w-4 h-4 text-white drop-shadow-sm" />
                </motion.div>
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleImageSelect}
              />
              
              <div className="mt-4 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
                <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest drop-shadow-sm">Tap to change picture</p>
              </div>
            </motion.div>

            {/* Inputs */}
            <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Your Name</label>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-teal-400 rounded-2xl opacity-0 group-focus-within:opacity-40 blur transition duration-300"></div>
                  <div className="relative flex items-center bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 transition-colors">
                    <UserIcon className="absolute left-4 w-5 h-5 text-slate-500 group-focus-within:text-teal-400 transition-colors duration-300" />
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full bg-transparent text-white pl-12 pr-4 py-4 focus:outline-none font-bold placeholder-slate-500"
                      placeholder="Enter your name"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">About / Status</label>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-teal-400 rounded-2xl opacity-0 group-focus-within:opacity-40 blur transition duration-300"></div>
                  <input
                    type="text"
                    value={about}
                    onChange={e => setAbout(e.target.value)}
                    className="relative w-full bg-white/5 backdrop-blur-sm text-white px-4 py-4 rounded-2xl border border-white/10 focus:outline-none font-medium text-sm placeholder-slate-500 transition-colors"
                    placeholder="Available"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Footer */}
          <div className="p-5 border-t border-white/5 bg-gradient-to-b from-[#0F1829] to-[#0B1220]">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              disabled={loading || !name.trim()}
              className="relative overflow-hidden w-full py-4 rounded-2xl font-black tracking-widest text-[13px] uppercase text-white bg-gradient-to-r from-blue-600 to-teal-500 shadow-[0_8px_25px_-5px_rgba(20,184,166,0.4)] hover:shadow-[0_10px_30px_-5px_rgba(20,184,166,0.6)] disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center gap-2 group"
            >
              {!loading && !!name.trim() && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover:animate-[shimmer_2s_infinite]" />
              )}
              <span className="relative z-10 flex items-center gap-2 drop-shadow-md">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {loading ? 'SAVING...' : 'SAVE PROFILE'}
              </span>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
`;

content = content.substring(0, returnStart) + newReturn + '\n}';

fs.writeFileSync(file, content);
console.log('Replaced return block in EditProfileModal');
