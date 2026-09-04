const fs = require('fs');
const file = 'mobile/src/screens/call/IncomingCallModal.jsx';
let content = fs.readFileSync(file, 'utf8');

const funcStart = content.indexOf('export default function IncomingCallModal');
const returnStart = content.indexOf('return (', funcStart);

const newReturn = `return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#060B13] text-white flex flex-col justify-between p-8 select-none overflow-hidden"
    >
      {/* Background Image & Rich Overlays */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img 
          src={avatarUrl} 
          alt="" 
          className="w-full h-full object-cover opacity-40 scale-110 blur-3xl"
        />
        {/* Ambient Color Pulse */}
        <motion.div 
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-emerald-500/10 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/95 mix-blend-multiply" />
      </div>

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="text-center space-y-4 pt-12 flex flex-col items-center">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
            {incomingCall.isVideo ? (
              <Video className="w-4 h-4 text-teal-300 animate-bounce" />
            ) : (
              <Phone className="w-4 h-4 text-teal-300 animate-bounce" />
            )}
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-100">
              {incomingCall.isVideo ? 'Incoming Video Call' : 'Incoming Audio Call'}
            </span>
          </div>
          
          <h1 className="text-4xl font-black tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
            {caller.name}
          </h1>
          
          {incomingCall.isTranslated && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/30 text-[10px] font-bold uppercase tracking-wider text-teal-200">
              <Sparkles className="w-3.5 h-3.5" />
              Translated Call
            </div>
          )}
        </div>

        {/* Center Section: Avatar */}
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="relative flex items-center justify-center w-48 h-48">
            {/* Triple-ring radar pulse */}
            <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-emerald-500/30 to-teal-400/30 blur-sm animate-[ping_2s_ease-in-out_infinite]" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-teal-500/20 to-blue-500/20 blur-md animate-[ping_3s_ease-in-out_infinite_0.5s]" />
            <div className="absolute -inset-4 rounded-full bg-gradient-to-bl from-emerald-500/10 to-teal-500/10 blur-xl animate-[ping_4s_ease-in-out_infinite_1s]" />
            
            <div className="relative p-[2px] rounded-full bg-gradient-to-tr from-blue-500 to-teal-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <img
                src={avatarUrl}
                alt={caller.name}
                className="w-36 h-36 rounded-full object-cover border-4 border-[#060B13] relative z-10"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs font-bold text-white bg-white/10 backdrop-blur-xl px-4 py-2 rounded-full border border-white/20 shadow-lg drop-shadow-md">
            <Globe className="w-4 h-4 text-teal-300 drop-shadow-[0_0_5px_rgba(45,212,191,0.8)]" />
            Speaks: {caller.language?.toUpperCase() || 'EN'}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col items-center justify-center space-y-8 pb-10 w-full max-w-sm mx-auto">
          
          <div className="relative w-full h-16 rounded-full overflow-hidden p-1 flex items-center shadow-[0_10px_30px_rgba(0,0,0,0.5)] bg-white/10 backdrop-blur-2xl border border-white/20">
            {/* Pulsing gradient edge on the track */}
            <motion.div 
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-transparent"
            />
            {/* Continuous shimmer sweep */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-[200%] animate-[shimmer_2.5s_infinite] -skew-x-12" />
            
            <span className="absolute inset-0 flex items-center justify-center pl-10 text-[11px] font-black uppercase tracking-[0.2em] text-slate-200 pointer-events-none drop-shadow-md">
              Slide to Answer
            </span>
            
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 216 }}
              dragElastic={0.05}
              onDragEnd={handleDragEnd}
              animate={controls}
              whileTap={{ scale: 0.95 }}
              className="w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.5)] bg-gradient-to-r from-emerald-500 to-teal-400 relative z-10 cursor-grab active:cursor-grabbing border-2 border-emerald-300/30"
            >
              {incomingCall.isVideo ? (
                <Video className="w-6 h-6 text-white drop-shadow-md animate-[pulse_1.5s_ease-in-out_infinite]" />
              ) : (
                <Phone className="w-6 h-6 text-white drop-shadow-md animate-[pulse_1.5s_ease-in-out_infinite]" />
              )}
            </motion.div>
          </div>
          
          <button 
            onClick={rejectIncomingCall}
            className="flex flex-col items-center gap-2 group mt-4"
          >
            <div className="p-4 rounded-full bg-white/5 backdrop-blur-md border border-red-500/30 text-red-400 group-hover:bg-red-500/20 group-hover:border-red-500/50 group-hover:text-red-300 transition-all group-hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]">
              <PhoneOff className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold tracking-widest text-red-400/80 group-hover:text-red-400 uppercase transition-colors">Decline</span>
          </button>
          
        </div>
      </div>
    </motion.div>
  );
`;

content = content.substring(0, returnStart) + newReturn + '\n}';

fs.writeFileSync(file, content);
console.log('Replaced return block in IncomingCallModal');
