import React, { useState, useEffect } from 'react';
import { Search, Pin, FileText, Image, MessageSquarePlus, Archive, Trash2, Users } from 'lucide-react';
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
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      className="relative overflow-hidden"
    >
      {/* Background Actions (Swipe reveal) */}
      <div className="absolute inset-y-0 right-0 flex items-center justify-end z-0">
        <button onClick={handleArchive} className="h-full px-5 flex flex-col gap-1 items-center justify-center bg-blue-900/30 text-blue-400 hover:bg-blue-800/40 transition">
          <Archive className="w-4 h-4" />
          <span className="text-[9px] font-semibold">Archive</span>
        </button>
        <button onClick={handleDelete} className="h-full px-5 flex flex-col gap-1 items-center justify-center bg-red-900/30 text-red-400 hover:bg-red-800/40 transition">
          <Trash2 className="w-4 h-4" />
          <span className="text-[9px] font-semibold">Delete</span>
        </button>
      </div>

      {/* Swipeable Foreground */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -140, right: 0 }}
        dragElastic={0.1}
        onClick={() => onSelectChat(contact)}
        className={`relative z-10 flex items-center gap-3.5 px-4 py-3.5 cursor-pointer border-b border-slate-800/40 ${
          isDarkMode ? 'bg-[#0F1829] hover:bg-slate-800' : 'bg-white hover:bg-slate-50 border-slate-100'
        }`}
      >
        {/* Avatar with Online indicator */}
        <div className="relative flex-shrink-0">
          <img
            src={contact.avatar}
            alt={contact.name}
            className="w-12 h-12 rounded-full object-cover shadow-sm"
          />
          {contact.onlineStatus === 'online' && (
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0F1829]" />
          )}
        </div>

        {/* Info & Last message */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              <h3 className="font-bold text-xs truncate">{contact.name}</h3>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border uppercase ${lang.color}`}>
                {lang.label}
              </span>
            </div>

            <span className="text-[10px] text-slate-400 whitespace-nowrap">
              {lastMessage ? new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
            </span>
          </div>

          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-1 text-xs text-slate-400 truncate pr-2">
              {lastMessage?.mediaType === 'file' ? (
                <span className="flex items-center gap-1 text-blue-400 text-[11px]">
                  <FileText className="w-3 h-3" /> {lastMessage.text || 'Document'}
                </span>
              ) : lastMessage?.mediaType === 'image' ? (
                <span className="flex items-center gap-1 text-teal-400 text-[11px]">
                  <Image className="w-3 h-3" /> Photo
                </span>
              ) : (
                <span className="truncate text-[11px]">{lastMessage?.text || 'Tap to start conversation'}</span>
              )}
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              {isPinned && <Pin className="w-3 h-3 text-blue-400 fill-blue-400 rotate-45" />}
              <AnimatePresence>
                {unreadCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    exit={{ scale: 0 }}
                    className="px-1.5 py-0.5 rounded-full bg-gradient-to-tr from-blue-600 to-teal-400 text-white font-bold text-[10px] min-w-[18px] text-center"
                  >
                    {unreadCount}
                  </motion.span>
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
      case 'bn': return { label: 'BENGALI', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 'en': return { label: 'EN', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
      case 'hi': return { label: 'HINDI', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
      case 'ar': return { label: 'ARABIC', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
      default: return { label: lang?.toUpperCase() || 'EN', color: 'bg-slate-700 text-slate-300 border-slate-600' };
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
    <div className={`flex flex-col h-full relative ${isDarkMode ? 'bg-[#0F1829]' : 'bg-white'}`}>
      {/* Search Bar */}
      <div className="px-4 py-3">
        <div className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border transition shadow-sm ${
          isDarkMode ? 'bg-[#142036] border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t('search') || 'Search conversations...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-xs font-medium focus:outline-none placeholder-slate-400"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto pb-24 overflow-x-hidden">
        {loading ? (
          // Shimmer Skeleton UI
          <div className="flex flex-col">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={`flex items-center gap-4 px-4 py-3.5 border-b ${isDarkMode ? 'border-slate-800/40' : 'border-slate-100'}`}>
                <div className={`w-12 h-12 rounded-full animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
                <div className="flex-1 space-y-2.5">
                  <div className={`h-2.5 rounded animate-pulse w-1/3 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
                  <div className={`h-2 rounded animate-pulse w-2/3 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
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
            <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
              <MessageSquarePlus className="w-8 h-8 text-blue-400" />
            </div>
            <p className="text-slate-400 text-sm font-medium">No conversations found.</p>
            <p className="text-slate-500 text-xs mt-1">Tap the button below to start a chat!</p>
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
      <div className="absolute bottom-6 right-6 flex flex-col gap-3 z-20">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsGroupModalOpen(true)}
          className="w-12 h-12 rounded-full bg-slate-800 text-white shadow-xl shadow-slate-900/30 flex items-center justify-center border border-slate-700 ml-auto"
        >
          <Users className="w-5 h-5" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          onClick={onNewChat}
          className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-400 text-white shadow-xl shadow-blue-600/30 flex items-center justify-center"
        >
          <MessageSquarePlus className="w-6 h-6" />
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
