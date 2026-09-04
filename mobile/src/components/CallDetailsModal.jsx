import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Phone, Video, PhoneMissed, PhoneIncoming, PhoneOutgoing, Calendar, Clock, Lock, MessageSquare, Trash2, Ban } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function CallDetailsModal({ isOpen, onClose, callRecord, contact, onStartCall, onMessage, onDeleteLog }) {
  const { isDarkMode, getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();

  if (!isOpen || !callRecord || !contact) return null;

  const isMissed = callRecord.status === 'rejected' || callRecord.durationSeconds === 0;

  const formatDurationText = (sec) => {
    if (!sec) return '0 seconds';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    if (m > 0 && s > 0) return `${m} minutes ${s} seconds`;
    if (m > 0) return `${m} minutes`;
    return `${s} seconds`;
  };

  const getCallIcon = () => {
    if (isMissed) return <PhoneMissed className="w-5 h-5 text-red-500" />;
    if (callRecord.isOutgoing) return <PhoneOutgoing className="w-5 h-5 text-emerald-500" />;
    return <PhoneIncoming className="w-5 h-5 text-blue-500" />;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`fixed inset-0 z-50 flex flex-col ${themeClasses.bg}`}
      >
        {/* Header */}
        <div className={`flex items-center gap-4 p-4 border-b ${themeClasses.border}`}>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-800/20 transition">
            <ArrowLeft className={`w-5 h-5 ${themeClasses.text}`} />
          </button>
          <h2 className={`font-bold text-lg ${themeClasses.text}`}>Call Info</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Profile Basic Info */}
          <div className={`p-6 border-b ${themeClasses.border} flex flex-col items-center justify-center text-center relative`}>
            <img 
              src={contact.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop'} 
              alt={contact.name} 
              className="w-24 h-24 rounded-full object-cover shadow-md border-2 border-slate-700/30 mb-4"
            />
            <h2 className={`text-2xl font-bold ${themeClasses.text} mb-1`}>{contact.name}</h2>
            <p className="text-slate-400 font-medium mb-6">{contact.phone}</p>
            
            <div className="flex items-center justify-center gap-6 w-full max-w-xs mx-auto">
              <button onClick={() => onMessage && onMessage()} className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition shadow-sm">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-500 group-hover:text-blue-500 transition">Message</span>
              </button>
              <button onClick={() => onStartCall && onStartCall(false)} className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition shadow-sm">
                  <Phone className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-500 group-hover:text-emerald-500 transition">Audio</span>
              </button>
              <button onClick={() => onStartCall && onStartCall(true)} className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition shadow-sm">
                  <Video className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-500 group-hover:text-indigo-500 transition">Video</span>
              </button>
            </div>
          </div>

          <div className="p-6">
            <h3 className={`text-sm font-bold uppercase tracking-wider text-slate-500 mb-4`}>Call Details</h3>
            
            <div className={`rounded-2xl border ${themeClasses.border} ${themeClasses.card} p-5 space-y-5`}>
              
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-full bg-slate-800/10 border border-slate-700/20">
                  {getCallIcon()}
                </div>
                <div>
                  <h4 className={`font-bold ${themeClasses.text}`}>
                    {isMissed ? 'Missed Call' : callRecord.isOutgoing ? 'Outgoing Call' : 'Incoming Call'}
                  </h4>
                  <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(callRecord.createdAt).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(callRecord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {!isMissed && (
                <div className={`pt-4 border-t ${themeClasses.border}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Duration</span>
                    <span className={`font-bold ${themeClasses.text}`}>{formatDurationText(callRecord.durationSeconds)}</span>
                  </div>
                  {callRecord.isTranslated && (
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-slate-500 font-medium">Translation Charged</span>
                      <span className={`font-bold text-teal-500`}>{callRecord.translationMinutesCharged || 0} min</span>
                    </div>
                  )}
                </div>
              )}

              {callRecord.isTranslated && (
                <div className={`pt-4 border-t ${themeClasses.border}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Language Route</span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-md bg-slate-800/10 font-bold text-xs ${themeClasses.text}`}>{callRecord.callerLang?.toUpperCase() || 'EN'}</span>
                      <span className="text-slate-400 text-xs">to</span>
                      <span className={`px-2 py-1 rounded-md bg-slate-800/10 font-bold text-xs ${themeClasses.text}`}>{callRecord.receiverLang?.toUpperCase() || 'ES'}</span>
                    </div>
                  </div>
                </div>
              )}

            </div>

            <div className="mt-8 flex flex-col rounded-2xl border border-red-500/20 bg-red-500/5 overflow-hidden">
                <button onClick={() => {
                  if(window.confirm('Delete call history with this user?')) {
                    if (onDeleteLog) onDeleteLog(callRecord);
                    onClose();
                  }
                }} className="w-full flex items-center gap-3 p-4 hover:bg-red-500/10 transition border-b border-red-500/10">
                <Trash2 className="w-5 h-5 text-red-500" />
                <span className="text-sm font-bold text-red-500">Delete Call Log</span>
              </button>
              <button onClick={() => {
                if(window.confirm('Block this contact?')) {
                  onClose();
                }
              }} className="w-full flex items-center gap-3 p-4 hover:bg-red-500/10 transition">
                <Ban className="w-5 h-5 text-red-500" />
                <span className="text-sm font-bold text-red-500">Block Contact</span>
              </button>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500 font-medium bg-slate-500/5 p-3 rounded-xl border border-slate-500/10 mb-8">
              <Lock className="w-4 h-4" />
              Calls are end-to-end encrypted
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
