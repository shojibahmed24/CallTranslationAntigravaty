import React, { useEffect, useState } from 'react';
import { PhoneOff, Sparkles, Globe, Phone, Video } from 'lucide-react';
import { useCall } from '../../context/CallContext';
import { startRingingTone, stopTone } from '../../utils/audioUtils';
import { motion, useAnimation } from 'framer-motion';

export default function IncomingCallModal() {
  const { incomingCall, acceptIncomingCall, rejectIncomingCall } = useCall();
  const controls = useAnimation();
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    if (incomingCall) {
      startRingingTone();
    }
    return () => stopTone();
  }, [incomingCall]);

  if (!incomingCall) return null;

  const caller = incomingCall.caller;
  const avatarUrl = caller.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop';

  const handleDragEnd = (event, info) => {
    if (info.offset.x > 150) {
      setAnswered(true);
      acceptIncomingCall();
    } else {
      controls.start({ x: 0 });
    }
  };

  return () => stopTone();
  }, [incomingCall]);

  if (!incomingCall) return null;

  const caller = incomingCall.caller;
  const avatarUrl = caller?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop';

  const handleDragEnd = (event, info) => {
    if (info.offset.x > 150) {
      setAnswered(true);
      acceptIncomingCall();
    } else {
      controls.start({ x: 0 });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#060B13] text-white flex flex-col justify-between p-8 select-none overflow-hidden"
    >
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img 
          src={avatarUrl} 
          alt="" 
          className="w-full h-full object-cover opacity-40 scale-110 blur-3xl"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />
      </div>

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="text-center space-y-3 pt-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-xs font-bold uppercase tracking-wider animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            <span className="text-white">{incomingCall.isTranslated ? 'Translated Call' : 'Direct Call'}</span>
          </span>
          <h1 className="text-4xl font-black tracking-tight">{caller.name}</h1>
          <p className="text-sm text-slate-300 font-medium">{incomingCall.isVideo ? 'Incoming Video Call...' : 'Incoming Voice Call...'}</p>
        </div>

        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="relative flex items-center justify-center w-40 h-40">
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-[ping_2s_ease-in-out_infinite]" />
            <div className="absolute inset-[-20px] rounded-full bg-teal-500/10 animate-[ping_2.5s_ease-in-out_infinite]" />
            <img
              src={avatarUrl}
              alt={caller.name}
              className="w-36 h-36 rounded-full object-cover border-4 border-white/20 shadow-[0_0_40px_rgba(16,185,129,0.3)] relative z-10"
            />
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-white bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg">
            <Globe className="w-4 h-4 text-teal-400" />
            Speaks: {caller.language?.toUpperCase() || 'EN'}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center space-y-8 pb-10">
          <button 
            onClick={rejectIncomingCall}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="p-4 rounded-full bg-red-500/20 text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
              <PhoneOff className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold tracking-widest text-red-400 uppercase">Decline</span>
          </button>

          <div className="relative w-full max-w-[280px] h-16 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 p-1 flex items-center overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_infinite] -skew-x-12" />
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold uppercase tracking-widest text-slate-300 pointer-events-none">
              Slide to Answer {incomingCall.isVideo && 'Video'}
            </span>
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 216 }}
              dragElastic={0.05}
              onDragEnd={handleDragEnd}
              animate={controls}
              whileTap={{ scale: 0.95 }}
              className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full flex items-center justify-center shadow-lg relative z-10 cursor-grab active:cursor-grabbing"
            >
              {incomingCall.isVideo ? <Video className="w-6 h-6 text-white" /> : <Phone className="w-6 h-6 text-white" />}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
