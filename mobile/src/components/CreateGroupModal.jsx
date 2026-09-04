import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Search, Check, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function CreateGroupModal({ isOpen, onClose, onGroupCreated }) {
  const { isDarkMode } = useTheme();
  const [groupName, setGroupName] = useState('');
  const [contacts, setContacts] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchContacts();
      setGroupName('');
      setSelectedIds([]);
    }
  }, [isOpen]);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await api.getConversations();
      const userContacts = res.conversations
        .filter(c => !c.contact?.isGroup && c.contact)
        .map(c => c.contact);
      
      const uniqueContacts = Array.from(new Map(userContacts.map(c => [c.id, c])).values());
      setContacts(uniqueContacts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleContact = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleCreate = async () => {
    if (!groupName.trim() || selectedIds.length === 0) return;
    setCreating(true);
    try {
      const res = await api.request('/chat/group', {
        method: 'POST',
        body: JSON.stringify({ name: groupName, participants: selectedIds })
      });
      if (res.success) {
        onGroupCreated();
        onClose();
      }
    } catch (err) {
      console.error('Failed to create group:', err);
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={`w-full max-w-md h-[85vh] sm:h-[600px] flex flex-col rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden ${isDarkMode ? 'bg-[#0F1829] text-white' : 'bg-white text-slate-900'}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold">New Group</h2>
                <p className="text-xs text-slate-400">{selectedIds.length} selected</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 bg-slate-800/50 rounded-full text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Group Name Input */}
          <div className="p-5 border-b border-slate-700/50 bg-slate-800/20">
            <input
              type="text"
              placeholder="Group Name (e.g. Family, Office Team)"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full bg-transparent text-lg font-bold placeholder-slate-500 focus:outline-none"
              autoFocus
            />
          </div>

          {/* Contacts List */}
          <div className="flex-1 overflow-y-auto p-2">
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-10 text-slate-500">No contacts found to add.</div>
            ) : (
              contacts.map(c => (
                <div 
                  key={c.id} 
                  onClick={() => toggleContact(c.id)}
                  className={`flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition ${selectedIds.includes(c.id) ? 'bg-blue-500/10' : 'hover:bg-slate-800/40'}`}
                >
                  <div className="relative">
                    <img src={c.avatar} alt={c.name} className="w-12 h-12 rounded-full object-cover" />
                    {selectedIds.includes(c.id) && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-[#0F1829]">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold">{c.name}</h4>
                    <p className="text-xs text-slate-400">{c.phone}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Create Button */}
          <div className="p-5 bg-[#080E18] border-t border-slate-700/50">
            <button
              onClick={handleCreate}
              disabled={creating || !groupName.trim() || selectedIds.length === 0}
              className="w-full py-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 transition flex justify-center items-center gap-2 shadow-lg shadow-blue-500/20"
            >
              {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Users className="w-5 h-5" />}
              {creating ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
