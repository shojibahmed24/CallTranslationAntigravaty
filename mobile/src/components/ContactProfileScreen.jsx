import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Phone, Video, Search, Bell, Lock, Ban, ThumbsDown, ChevronRight, Image as ImageIcon, FileText, Link as LinkIcon, Loader2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import ChatMediaGallery from './ChatMediaGallery';

export default function ContactProfileScreen({ isOpen, onClose, contact, onStartCall, onSearchClick }) {
  const { isDarkMode, getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
  
  const [isBlocked, setIsBlocked] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showMediaGallery, setShowMediaGallery] = useState(false);
  const [mediaItems, setMediaItems] = useState([]);

  useEffect(() => {
    if (isOpen && contact) {
      checkStatus();
      fetchMedia();
    }
  }, [isOpen, contact]);

  const checkStatus = async () => {
    try {
      // Just fetch all blocked for now and check if this contact is in it
      const res = await api.getBlockedUsers();
      if (res.success) {
        setIsBlocked(res.blockedUsers.includes(contact.id));
      }
      // Note: A robust implementation would also fetch mute status. 
      // For MVP we can toggle locally or assume false initially.
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMedia = async () => {
    try {
      const res = await api.getChatMedia(contact.id);
      if (res.success) {
        setMediaItems(res.media || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleBlock = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (isBlocked) {
        await api.unblockUser(contact.id);
        setIsBlocked(false);
      } else {
        await api.blockUser(contact.id);
        setIsBlocked(true);
      }
    } catch (err) {
      alert('Action failed.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMute = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (isMuted) {
        await api.unmuteChat(contact.id);
        setIsMuted(false);
      } else {
        await api.muteChat(contact.id);
        setIsMuted(true);
      }
    } catch (err) {
      alert('Action failed.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !contact) return null;

  return (
    <>
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
            <h2 className={`font-bold text-lg ${themeClasses.text}`}>Contact Info</h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Main Profile Info */}
            <div className={`flex flex-col items-center py-8 border-b ${themeClasses.border} ${themeClasses.card}`}>
              <img 
                src={contact.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop'} 
                alt={contact.name} 
                className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-slate-800/20 mb-4"
              />
              <h2 className={`text-2xl font-bold ${themeClasses.text} mb-1`}>{contact.name}</h2>
              <p className="text-slate-400 font-medium mb-1">{contact.phone}</p>
              <p className="text-sm text-slate-500">~ {contact.status || 'Available'}</p>
              
              <div className="flex items-center gap-6 mt-6">
                <button onClick={() => onStartCall(false)} disabled={isBlocked} className="flex flex-col items-center gap-2 group disabled:opacity-50">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition">
                    <Phone className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-emerald-500">Audio</span>
                </button>
                <button onClick={() => onStartCall(true)} disabled={isBlocked} className="flex flex-col items-center gap-2 group disabled:opacity-50">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition">
                    <Video className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-blue-500">Video</span>
                </button>
                <button onClick={() => { if(onSearchClick) onSearchClick(); onClose(); }} className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 rounded-full bg-slate-500/10 text-slate-400 flex items-center justify-center group-hover:bg-slate-500 group-hover:text-white transition">
                  <Search className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-400">Search</span>
              </button>
              </div>
            </div>

            {/* User Details */}
            <div className="py-2">
              <div className={`p-4 border-b ${themeClasses.border} ${themeClasses.card}`}>
                <p className="text-sm text-slate-400 mb-1">About</p>
                <p className={`text-base font-medium ${themeClasses.text}`}>{contact.status || 'Available'}</p>
              </div>
            </div>

            {/* Media Links Docs */}
            <div className={`mt-2 border-y ${themeClasses.border} ${themeClasses.card}`}>
              <div onClick={() => setShowMediaGallery(true)} className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/10 transition">
                <span className={`text-sm font-semibold ${themeClasses.text}`}>Media, links, and docs</span>
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="text-xs">{mediaItems.length}</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
              <div className="flex gap-2 p-4 pt-0 overflow-x-auto">
                {mediaItems.slice(0, 5).map(item => (
                  item.type === 'image' ? (
                    <img key={item.id} src={item.file_url?.startsWith('http') ? item.file_url : `http://192.168.68.105:5000${item.file_url}`} className="w-20 h-20 bg-slate-800/20 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div key={item.id} className="w-20 h-20 bg-slate-800/20 rounded-xl shrink-0 flex flex-col items-center justify-center p-2 text-blue-400 border border-slate-700">
                      <FileText className="w-8 h-8 mb-1" />
                      <span className="text-[8px] text-slate-300 truncate w-full text-center">{item.text || 'Document'}</span>
                    </div>
                  )
                ))}
                {mediaItems.length === 0 && (
                  <>
                    <div className="w-20 h-20 bg-slate-800/20 rounded-xl flex items-center justify-center text-slate-500 border border-slate-800/30">
                      <ImageIcon className="w-6 h-6 opacity-30" />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Options */}
            <div className={`mt-2 border-y ${themeClasses.border} ${themeClasses.card} divide-y ${themeClasses.border}`}>
              <div onClick={toggleMute} className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/10 transition">
                <div className="flex items-center gap-4">
                  <Bell className="w-5 h-5 text-slate-400" />
                  <span className={`text-sm font-semibold ${themeClasses.text}`}>Mute notifications</span>
                </div>
                <div className={`w-10 h-5 rounded-full flex items-center p-0.5 transition ${isMuted ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'}`}>
                  <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                </div>
              </div>
              <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/10 transition">
                <div className="flex items-center gap-4">
                  <Lock className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className={`text-sm font-semibold ${themeClasses.text}`}>Encryption</p>
                    <p className="text-xs text-slate-400">Messages and calls are end-to-end encrypted.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className={`mt-2 mb-8 border-y ${themeClasses.border} ${themeClasses.card} divide-y ${themeClasses.border}`}>
              <div onClick={toggleBlock} className="p-4 flex items-center gap-4 cursor-pointer hover:bg-red-500/10 transition text-red-500">
                <Ban className="w-5 h-5" />
                <span className="text-sm font-bold">{isBlocked ? 'Unblock' : 'Block'} {contact.name}</span>
                {loading && <Loader2 className="w-4 h-4 animate-spin ml-auto" />}
              </div>
              <div className="p-4 flex items-center gap-4 cursor-pointer hover:bg-red-500/10 transition text-red-500">
                <ThumbsDown className="w-5 h-5" />
                <span className="text-sm font-bold">Report {contact.name}</span>
              </div>
            </div>
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
}
