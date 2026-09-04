import React, { useState, useEffect } from 'react';
import { Phone, PhoneMissed, PhoneOutgoing, PhoneIncoming, Sparkles, Video, Info } from 'lucide-react';
import CallDetailsModal from '../../components/CallDetailsModal';
import { api } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { useCall } from '../../context/CallContext';
import { motion, AnimatePresence } from 'framer-motion';

const ShimmerCallItem = () => (
  <div className="flex items-center justify-between px-4 py-3.5 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-11 h-11 rounded-full bg-slate-800/50"></div>
      <div className="space-y-2">
        <div className="h-3.5 bg-slate-800/50 rounded w-24"></div>
        <div className="h-2.5 bg-slate-800/50 rounded w-16"></div>
      </div>
    </div>
    <div className="w-9 h-9 rounded-full bg-slate-800/50"></div>
  </div>
);

export default function CallsListScreen({ onNewCall, onMessage }) {
  const { isDarkMode, t } = useTheme();
  const { startVoiceCall, startVideoCall } = useCall(); 

  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCall, setSelectedCall] = useState(null);
  const [infoModalOpen, setInfoModalOpen] = useState(false);

  const fetchCalls = async () => {
    try {
      const res = await api.getCallHistory();
      setCalls(res.calls || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls();
  }, []);

  const formatDuration = (sec) => {
    if (!sec) return '0s';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className={`relative h-full w-full ${isDarkMode ? 'bg-[#080E18]' : 'bg-slate-50'}`}>
      <div className="flex flex-col h-full overflow-y-auto pb-24">
        
        {/* Sticky Header */}
        <div className={`sticky top-0 z-10 px-4 py-3 backdrop-blur-xl border-b ${isDarkMode ? 'bg-[#080E18]/80 border-slate-800/50' : 'bg-slate-50/80 border-slate-200'}`}>
          <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Call Logs & Interpretation</h2>
        </div>

        {loading ? (
          <div className="divide-y divide-slate-800/40">
            {[...Array(6)].map((_, i) => <ShimmerCallItem key={i} />)}
          </div>
        ) : calls.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center p-12 text-center h-64">
            <div className="w-16 h-16 rounded-full bg-slate-800/30 flex items-center justify-center mb-4">
              <Phone className="w-6 h-6 text-slate-500" />
            </div>
            <p className="text-slate-400 text-xs font-medium">No past calls.</p>
            <p className="text-slate-500 text-[10px] mt-1">Tap a contact to start an interpreted voice or video call!</p>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="divide-y divide-slate-800/40"
          >
            {calls.map((c) => {
              const isMissed = c.status === 'rejected' || c.durationSeconds === 0;
              return (
                <motion.div
                  key={c.id}
                  variants={itemVariants}
                  className="flex items-center justify-between px-4 py-3.5 hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0 cursor-pointer" onClick={() => { setSelectedCall(c); setInfoModalOpen(true); }}>
                      <img
                        src={c.peer?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop'}
                        alt={c.peer?.name || 'Contact'}
                        className="w-12 h-12 rounded-full object-cover shadow-sm border border-slate-800"
                      />
                      <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-[#080E18]">
                        {isMissed ? (
                          <PhoneMissed className="w-3.5 h-3.5 text-red-500" />
                        ) : c.isOutgoing ? (
                          <PhoneOutgoing className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <PhoneIncoming className="w-3.5 h-3.5 text-blue-400" />
                        )}
                      </div>
                    </div>

                    <div className="cursor-pointer" onClick={() => { setSelectedCall(c); setInfoModalOpen(true); }}>
                      <h3 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {c.peer?.name || 'Unknown Contact'}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                        <span>{new Date(c.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        {!isMissed && (
                          <>
                            <span className="text-slate-600">•</span>
                            <span>{formatDuration(c.durationSeconds)}</span>
                          </>
                        )}
                      </div>

                      {/* Translation Mode Badge */}
                      <div className="mt-1.5">
                        {c.isTranslated ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-teal-950/60 text-teal-300 border border-teal-800/40 uppercase">
                            <Sparkles className="w-2.5 h-2.5" />
                            {c.callerLang?.toUpperCase() || 'EN'} → {c.receiverLang?.toUpperCase() || 'ES'} ({c.translationMinutesCharged || 0}m)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-800/60 text-slate-400 border border-slate-700/40 uppercase">
                            Direct Call
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Call Action Buttons */}
                  {c.peer && (
                    <div className="flex items-center gap-1.5">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => { setSelectedCall(c); setInfoModalOpen(true); }}
                        className="p-2.5 rounded-full bg-slate-800/20 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                        title="Call Info"
                      >
                        <Info className="w-4 h-4" />
                      </motion.button>
                      
                      {/* Video Call */}
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => startVideoCall ? startVideoCall(c.peer) : startVoiceCall(c.peer, { video: true })}
                        className="p-2.5 rounded-full bg-slate-800/50 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors"
                        title="Video Call"
                      >
                        <Video className="w-4 h-4" />
                      </motion.button>
                      
                      {/* Voice Call */}
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => startVoiceCall(c.peer)}
                        className="p-2.5 rounded-full bg-slate-800/50 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors"
                        title="Voice Call"
                      >
                        <Phone className="w-4 h-4" />
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
      
      {/* Floating Action Button for New Call (Dialpad) */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onNewCall}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white shadow-xl shadow-emerald-500/20 flex items-center justify-center z-20"
      >
        <Phone className="w-6 h-6" />
      </motion.button>

      <CallDetailsModal 
        isOpen={infoModalOpen} 
        onClose={() => setInfoModalOpen(false)} 
        callRecord={selectedCall} 
        contact={selectedCall?.peer}
        onMessage={() => {
          setInfoModalOpen(false);
          if (onMessage) onMessage(selectedCall?.peer);
        }}
        onStartCall={(isVideo) => {
          setInfoModalOpen(false);
          if (isVideo) {
            startVideoCall ? startVideoCall(selectedCall?.peer) : startVoiceCall(selectedCall?.peer, { video: true });
          } else {
            startVoiceCall(selectedCall?.peer);
          }
        }}
        onDeleteLog={async (record) => {
          try {
            await api.deleteCallLog(record.id);
            setCalls(prev => prev.filter(c => c.id !== record.id));
          } catch (err) {
            console.error('Failed to delete log', err);
          }
        }}
      />
    </div>
  );
}
