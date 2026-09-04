import React, { useState, useEffect } from 'react';
import { Search, Pin, FileText, Image, MessageSquarePlus, Archive, Trash2, Users, X, Check, CheckCheck } from 'lucide-react';
import { api } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { decryptMessage } from '../../utils/cryptoUtils';
import { cacheConversations, getCachedConversations } from '../../services/db';
import { motion, AnimatePresence } from 'framer-motion';
import CreateGroupModal from '../../components/CreateGroupModal';

const ChatRow = ({ item, isDarkMode, getLanguageTag, onSelectChat, onArchive, onDelete }) => {
  const { contact, lastMessage, unreadCount, isPinned } = item;
  const lang = getLanguageTag(contact.language);

  const handleArchive = (e) => {
    e.stopPropagation();
    onArchive(contact.id);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if(window.confirm('Are you sure you want to delete this chat?')) {
      onDelete(contact.id);
    }
  };

  return (
    <motion.li
      variants={{
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0 }
      }}
      className="relative overflow-hidden group"
    >
      {/* Background Actions (Swipe reveal) */}
      <div className="absolute inset-y-0 right-0 flex items-center justify-end z-0">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={handleArchive} 
          className="h-full px-5 flex flex-col gap-1 items-center justify-center bg-gradient-to-br from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 transition shadow-inner"
        >
          <Archive className="w-5 h-5 drop-shadow-sm" />
          <span className="text-[10px] font-bold drop-shadow-sm">Archive</span>
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={handleDelete} 
          className="h-full px-5 flex flex-col gap-1 items-center justify-center bg-gradient-to-br from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-400 transition shadow-inner"
        >
          <Trash2 className="w-5 h-5 drop-shadow-sm" />
          <span className="text-[10px] font-bold drop-shadow-sm">Delete</span>
        </motion.button>
      </div>

      {/* Swipeable Foreground */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -140, right: 0 }}
        dragElastic={0.1}
        onClick={() => onSelectChat(contact)}
        whileHover={{ y: -1 }}
        className={`relative z-10 flex items-center gap-4 px-5 py-4 cursor-pointer transition-colors duration-200 ${
          isDarkMode 
            ? 'bg-transparent hover:bg-white/[0.03] active:bg-white/[0.05]' 
            : 'bg-transparent hover:bg-slate-900/[0.02] active:bg-slate-900/[0.04]'
        }`}
      >
        {/* Subtle bottom border gradient fade */}
        <div className={`absolute bottom-0 left-5 right-5 h-[1px] bg-gradient-to-r \${isDarkMode ? 'from-slate-800/80 via-slate-800/40 to-transparent' : 'from-slate-200/80 via-slate-200/40 to-transparent'} pointer-events-none`} />

        {/* Avatar with Online indicator */}
        <div className="relative flex-shrink-0">
          <div className="p-[2px] rounded-full bg-gradient-to-tr from-blue-500 to-teal-400 shadow-[0_4px_15px_-5px_rgba(59,130,246,0.4)]">
            <img
              src={contact.avatar}
              alt={contact.name}
              className={`w-[46px] h-[46px] rounded-full object-cover border-[1.5px] \${isDarkMode ? 'border-[#0B1220]' : 'border-[#FFFFFF]'}`}
            />
          </div>
          {contact.onlineStatus === 'online' && (
            <div className="absolute -bottom-0.5 -right-0.5">
              <span className={`relative flex w-3.5 h-3.5 border-[2px] \${isDarkMode ? 'border-[#0B1220]' : 'border-[#FFFFFF]'} rounded-full`}>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-full w-full bg-emerald-500"></span>
              </span>
            </div>
          )}
        </div>

        {/* Info & Last message */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <h3 className={`font-black text-sm truncate \${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{contact.name}</h3>
              
              <motion.span 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase shadow-sm \${lang.color}`}
              >
                {lang.label}
              </motion.span>
            </div>

            <span className={`text-[10px] font-semibold whitespace-nowrap \${isDarkMode ? 'text-slate-400/80' : 'text-slate-500/80'}`}>
              {lastMessage ? new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
            </span>
          </div>

          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-1.5 text-xs truncate pr-2">
              {lastMessage?.mediaType === 'file' ? (
                <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md font-bold text-[10px] \${isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                  <FileText className="w-3 h-3" /> {lastMessage.text || 'Document'}
                </span>
              ) : lastMessage?.mediaType === 'image' ? (
                <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md font-bold text-[10px] \${isDarkMode ? 'bg-teal-500/10 text-teal-400' : 'bg-teal-50 text-teal-600'}`}>
                  <Image className="w-3 h-3" /> Photo
                </span>
              ) : (
                <span className={`truncate text-[11px] font-medium \${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{lastMessage?.text || 'Tap to start conversation'}</span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {isPinned && <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500/30 rotate-45" />}

              <AnimatePresence>
                {unreadCount > 0 && (
                  <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: [0, 1.2, 1] }} 
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="relative"
                  >
                    <span className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-30" />
                    <span className="relative flex items-center justify-center px-1.5 py-0.5 rounded-full bg-gradient-to-tr from-blue-600 to-teal-400 text-white font-bold text-[10px] min-w-[20px] shadow-[0_0_10px_rgba(45,212,191,0.5)] z-10">
                      {unreadCount}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.li>
  );
};

export default function ChatsListScreen({ onSelectChat, onNewChat }) {
  const { isDarkMode, t } = useTheme();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [deletedChats, setDeletedChats] = useState([]);
  const [archivedChats, setArchivedChats] = useState([]);

  useEffect(() => {
    const del = JSON.parse(localStorage.getItem('unicom_deleted_chats') || '[]');
    const arc = JSON.parse(localStorage.getItem('unicom_archived_chats') || '[]');
    setDeletedChats(del);
    setArchivedChats(arc);
  }, []);

  const handleArchiveChat = (id) => {
    const newArc = [...archivedChats, id];
    setArchivedChats(newArc);
    localStorage.setItem('unicom_archived_chats', JSON.stringify(newArc));
  };

  const handleDeleteChat = (id) => {
    const newDel = [...deletedChats, id];
    setDeletedChats(newDel);
    localStorage.setItem('unicom_deleted_chats', JSON.stringify(newDel));
  };

  const fetchConversations = async () => {
    try {
      const cached = await getCachedConversations();
      if (cached && cached.length > 0) setConversations(cached);

      const res = await api.getConversations();
      let fetched = res.conversations || [];
      
      if (user) {
        fetched = await Promise.all(fetched.map(async (c) => {
          if (c.lastMessage && c.lastMessage.text && !c.contact.isGroup) {
            let dec = await decryptMessage(c.lastMessage.text, user.id, c.contact.id);
            // strip reply metadata for preview
            c.lastMessage.text = dec.replace(/^_REPLY_\[\[.*?\]\]_REPLY_\s*/, '');
          }
          return c;
        }));
      }

      setConversations(fetched);
      await cacheConversations(fetched);
    } catch (err) {
      console.error(err);
    } finally {
      // Smoothly hide skeleton
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  const filtered = conversations.filter((c) => {
    if (deletedChats.includes(c.contact.id) || archivedChats.includes(c.contact.id)) return false;
    const q = search.toLowerCase();
    return (
      c.contact.name.toLowerCase().includes(q) ||
      c.contact.phone.includes(q) ||
      (c.lastMessage?.text || '').toLowerCase().includes(q)
    );
  });

  const getLanguageTag = (lang) => {
    switch (lang) {
      case 'bn': return { label: 'BENGALI', color: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.2)]' };
      case 'en': return { label: 'EN', color: 'bg-blue-500/10 text-blue-500 border border-blue-500/30 shadow-[0_0_8px_rgba(59,130,246,0.2)]' };
      case 'hi': return { label: 'HINDI', color: 'bg-amber-500/10 text-amber-500 border border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.2)]' };
      case 'ar': return { label: 'ARABIC', color: 'bg-purple-500/10 text-purple-500 border border-purple-500/30 shadow-[0_0_8px_rgba(168,85,247,0.2)]' };
      default: return { label: lang?.toUpperCase() || 'EN', color: 'bg-slate-700/50 text-slate-300 border-slate-600' };
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className={`flex flex-col h-full relative overflow-hidden \${isDarkMode ? 'bg-gradient-to-b from-[#0B1220] via-[#0F1829] to-[#0D1524]' : 'bg-gradient-to-b from-[#FFFFFF] to-[#F5F8FF]'}`}>
      
      {/* Search Bar */}
      <div className="px-5 py-4 z-10">
        <div className={`group flex items-center gap-2.5 px-4 py-3 rounded-[2rem] border shadow-sm transition-all duration-300 focus-within:ring-2 focus-within:ring-teal-400/40 focus-within:border-teal-400/50 focus-within:shadow-[0_4px_20px_-5px_rgba(45,212,191,0.2)] \${
          isDarkMode ? 'bg-white/[0.03] border-white/10' : 'bg-white/80 border-slate-200'
        }`}>
          <Search className={`w-4 h-4 transition-colors duration-300 \${search ? 'text-blue-500' : 'text-slate-400 group-focus-within:text-teal-400'}`} />
          <input
            type="text"
            placeholder={t('search') || 'Search conversations...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full bg-transparent text-sm font-semibold focus:outline-none \${isDarkMode ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'}`}
          />
          <AnimatePresence>
            {search && (
              <motion.button
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSearch('')}
                className={`p-1 rounded-full \${isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-100 hover:bg-slate-200'} transition-colors`}
              >
                <X className="w-3 h-3" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto pb-24 overflow-x-hidden">
        {loading ? (
          // Premium Shimmer Skeleton UI
          <div className="flex flex-col">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={`flex items-center gap-4 px-5 py-4 border-b relative overflow-hidden \${isDarkMode ? 'border-slate-800/40' : 'border-slate-200/50'}`}>
                {/* Shimmer sweep */}
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 pointer-events-none" />
                
                <div className={`w-[46px] h-[46px] rounded-full \${isDarkMode ? 'bg-white/5' : 'bg-slate-200/50'}`}></div>
                <div className="flex-1 space-y-3">
                  <div className={`h-3 rounded-full w-1/3 \${isDarkMode ? 'bg-white/5' : 'bg-slate-200/50'}`}></div>
                  <div className={`h-2.5 rounded-full w-2/3 \${isDarkMode ? 'bg-white/5' : 'bg-slate-200/50'}`}></div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 text-center flex flex-col items-center justify-center h-full"
          >
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-24 h-24 mb-6"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/30 to-teal-400/30 rounded-full blur-xl animate-pulse" />
              <div className="relative w-full h-full rounded-full bg-gradient-to-tr from-blue-600 to-teal-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <MessageSquarePlus className="w-10 h-10 text-white drop-shadow-md" />
              </div>
            </motion.div>
            <h3 className={`text-xl font-black mb-1 \${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>No conversations yet</h3>
            <p className={`text-sm font-medium \${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Tap the button below to start a chat!</p>
          </motion.div>
        ) : (
          <motion.ul
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col"
          >
            {filtered.map((item) => (
              <ChatRow 
                key={item.contact.id} 
                item={item} 
                isDarkMode={isDarkMode} 
                getLanguageTag={getLanguageTag}
                onSelectChat={onSelectChat} onArchive={handleArchiveChat} onDelete={handleDeleteChat} 
              />
            ))}
          </motion.ul>
        )}
      </div>

      {/* Floating Action Buttons */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-3.5 z-20">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsGroupModalOpen(true)}
          className={`w-12 h-12 rounded-full backdrop-blur-md flex items-center justify-center border shadow-lg ml-auto transition-colors \${
            isDarkMode 
              ? 'bg-white/10 border-white/20 text-white hover:bg-white/20 shadow-black/50' 
              : 'bg-white/80 border-slate-200 text-slate-700 hover:bg-white shadow-slate-300/50'
          }`}
        >
          <Users className="w-5 h-5" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9, rotate: -15 }}
          onClick={onNewChat}
          className="relative w-14 h-14 rounded-[1.25rem] bg-gradient-to-tr from-blue-600 via-blue-500 to-teal-400 text-white shadow-[0_15px_30px_-5px_rgba(59,130,246,0.6)] flex items-center justify-center overflow-visible group"
        >
          {/* Subtle breathing glow */}
          <div className="absolute inset-0 rounded-[1.25rem] bg-teal-400/50 blur-lg -z-10 animate-[pulse_3s_infinite]" />
          
          <MessageSquarePlus className="w-6 h-6 transition-transform group-hover:rotate-12" />
        </motion.button>
      </div>

      <CreateGroupModal 
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        onGroupCreated={fetchConversations}
      />
    </div>
  );
}
