const fs = require('fs');
const file = 'mobile/src/screens/call/IncomingCallModal.jsx';
let content = fs.readFileSync(file, 'utf8');

const returnStart = content.indexOf('return (');

const newReturn = `return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed inset-0 z-50 bg-[#060B13] text-white flex flex-col justify-between p-8 select-none overflow-hidden"
    >
      {/* Background Image & Rich Overlays */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img 
          src={avatarUrl} 
          alt="" 
          className="w-full h-full object-cover opacity-40 scale-110 blur-3xl"
        />
        {/* Ambient Color Pulse synced loosely with ringing */}
        <motion.div 
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-gradient-to-br from-teal-500/15 via-transparent to-emerald-500/15 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/95 mix-blend-multiply" />
      </div>

      <div className="relative z-10 flex flex-col h-full justify-between">
        
        {/* Top Section */}
        <div className="text-center space-y-3 pt-12 flex flex-col items-center">
          {/* Translated / Direct Call Badge */}
          {incomingCall.isTranslated ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xl border border-teal-500/40 shadow-[0_0_15px_rgba(20,184,166,0.2)]">
              <div className="relative">
                <div className="absolute inset-0 bg-teal-400 blur-sm opacity-50" />
                <Sparkles className="w-3.5 h-3.5 text-teal-300 relative z-10" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-100">Translated Call</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-xs font-bold uppercase tracking-wider">
              <span className="text-white">Direct Call</span>
            </div>
          )}
          
          <h1 className="text-4xl font-black tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
            {caller.name}
          </h1>
          
          <motion.p 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-sm text-slate-300 font-medium tracking-wide"
          >
            {incomingCall.isVideo ? 'Incoming Video Call...' : 'Incoming Voice Call...'}
          </motion.p>
        </div>

        {/* Center Section: Avatar & Language */}
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="relative flex items-center justify-center w-48 h-48">
            {/* Triple-ring radar pulse */}
            <div className="absolute inset-2 rounded-full bg-emerald-500/20 blur-sm animate-[ping_2s_ease-in-out_infinite]" />
            <div className="absolute inset-[-10px] rounded-full bg-teal-500/15 blur-md animate-[ping_3s_ease-in-out_infinite_0.5s]" />
            <div className="absolute inset-[-30px] rounded-full bg-emerald-500/5 blur-xl animate-[ping_4s_ease-in-out_infinite_1s]" />
            
            <motion.div 
              animate={{ 
                boxShadow: [
                  '0 0 40px rgba(16,185,129,0.4)', 
                  '0 0 40px rgba(20,184,166,0.6)', 
                  '0 0 40px rgba(16,185,129,0.4)'
                ] 
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="relative rounded-full border-4 border-white/20 z-10"
            >
              <img
                src={avatarUrl}
                alt={caller.name}
                className="w-36 h-36 rounded-full object-cover"
              />
            </motion.div>
          </div>
          
          <div className="flex items-center gap-2 text-xs font-bold text-white bg-black/40 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 shadow-[0_0_15px_rgba(45,212,191,0.15)] drop-shadow-md">
            <motion.div 
              initial={{ rotate: -90, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', damping: 15, delay: 0.3 }}
            >
              <Globe className="w-4 h-4 text-teal-400 drop-shadow-[0_0_8px_rgba(45,212,191,0.8)]" />
            </motion.div>
            Speaks: {caller.language?.toUpperCase() || 'EN'}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col items-center justify-center space-y-8 pb-10 w-full max-w-sm mx-auto">
          
          <motion.button 
            whileTap={{ scale: 0.9, x: [-5, 5, -5, 5, 0] }}
            transition={{ duration: 0.3 }}
            onClick={rejectIncomingCall}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="p-4 rounded-full bg-red-500/10 backdrop-blur-md text-red-500 border border-red-500/20 group-hover:bg-red-500 group-hover:text-white transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)] group-hover:shadow-[0_0_20px_rgba(239,68,68,0.6)]">
              <PhoneOff className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold tracking-widest text-red-400 uppercase group-hover:text-red-300">Decline</span>
          </motion.button>
          
          <div className="relative w-full h-16 rounded-full overflow-hidden p-1 flex items-center shadow-2xl bg-white/10 backdrop-blur-xl border border-white/20">
            {/* Rich gradient track tint */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/5" />
            {/* Vivid shimmer sweep */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-[200%] animate-[shimmer_2s_infinite] -skew-x-12" />
            
            <span className="absolute inset-0 flex items-center justify-center pl-10 text-xs font-black uppercase tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-r from-slate-300 via-white to-slate-300 pointer-events-none drop-shadow-md animate-[pulse_2s_infinite]">
              Slide to Answer {incomingCall.isVideo && 'Video'}
            </span>
            
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 216 }}
              dragElastic={0.05}
              onDragEnd={handleDragEnd}
              animate={controls}
              whileTap={{ scale: 0.95 }}
              className="w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.6)] bg-gradient-to-tr from-emerald-500 via-emerald-400 to-teal-400 relative z-10 cursor-grab active:cursor-grabbing border-2 border-emerald-300/50"
            >
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }} 
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {incomingCall.isVideo ? (
                  <Video className="w-6 h-6 text-white drop-shadow-lg" />
                ) : (
                  <Phone className="w-6 h-6 text-white drop-shadow-lg" />
                )}
              </motion.div>
            </motion.div>
          </div>
          
        </div>
      </div>
    </motion.div>
  );
`;

content = content.substring(0, returnStart) + newReturn + '\n}';

fs.writeFileSync(file, content);
console.log('Replaced return block in IncomingCallModal again');
