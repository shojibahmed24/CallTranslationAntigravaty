import React, { useState, useEffect } from 'react';
import { Search, Phone, MessageSquare, UserPlus, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { useCall } from '../../context/CallContext';
import { getCachedConversations, cacheConversations } from '../../services/db';
import { motion, AnimatePresence } from 'framer-motion';

export default function ContactsScreen({ onSelectChat, onNewContact }) {
  const { isDarkMode } = useTheme();
  const { startVoiceCall } = useCall();

  const [registeredContacts, setRegisteredContacts] = useState([]);
  const [unregisteredContacts, setUnregisteredContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchContacts = async () => {
    try {
      const cached = await getCachedConversations();
      if (cached && cached.length > 0) {
        setRegisteredContacts(cached.map(c => c.contact));
      }

      const res = await api.getConversations();
      const userList = res.conversations.map(c => c.contact);
      setRegisteredContacts(userList);
      await cacheConversations(res.conversations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleSyncContacts = async () => {
    let phoneNumbers = [];
    let localContactMap = {};

    if (!('contacts' in navigator && 'ContactsManager' in window)) {
      alert('Native Contact Sync requires HTTPS or an installed Android App (APK).\n\nSince you are testing on HTTP/PC, showing DEMO contacts instead to demonstrate the UI!');
      
      // Inject Demo Contacts
      const demoContacts = [
        { name: 'John Doe', tel: ['+8801711111111'] },
        { name: 'Alice Smith', tel: ['+8801822222222'] },
        { name: 'Bob Unicom', tel: ['+8801811223344'] },
        { name: 'Jane Unregistered', tel: ['+8801933333333'] }
      ];

      demoContacts.forEach(c => {
        const cleanNum = c.tel[0].replace(/[\s-]/g, '');
        phoneNumbers.push(cleanNum);
        localContactMap[cleanNum] = c.name;
      });
    } else {
      try {
        const props = ['name', 'tel'];
        const opts = { multiple: true };
        const rawContacts = await navigator.contacts.select(props, opts);
        
        rawContacts.forEach(c => {
          if (c.tel && c.tel.length > 0) {
            const rawNum = c.tel[0];
            const cleanNum = rawNum.replace(/[\s-]/g, '');
            phoneNumbers.push(cleanNum);
            localContactMap[cleanNum] = c.name[0] || 'Unknown';
          }
        });
      } catch (err) {
        console.error('Picker error:', err);
        return;
      }
    }

    if (phoneNumbers.length === 0) {
      alert('No valid phone numbers found.');
      return;
    }

    try {
      setSyncing(true);
      const res = await api.request('/chat/sync-contacts', {
        method: 'POST',
        body: JSON.stringify({ phoneNumbers })
      });

      const matchedUsers = res.contacts || [];
      const matchedPhones = matchedUsers.map(u => u.phone);

      const unregistered = phoneNumbers
        .filter(num => !matchedPhones.includes(num))
        .map(num => ({ phone: num, name: localContactMap[num] }));

      const existingIds = new Set(registeredContacts.map(u => u.id));
      const newMatches = matchedUsers.filter(u => !existingIds.has(u.id));

      setRegisteredContacts([...registeredContacts, ...newMatches]);
      setUnregisteredContacts(unregistered);

    } catch (err) {
      console.error('Contact sync error:', err);
    } finally {
      setSyncing(false);
    }
  };

  const handleInvite = (phone) => {
    const message = encodeURIComponent("Hey! I'm using UNICOM for real-time translated voice calls. Download it here: https://unicom.app");
    window.open(`sms:${phone}?body=${message}`, '_blank');
  };

  const filteredRegistered = registeredContacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );
  
  const filteredUnregistered = unregisteredContacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );

  const groupAlphabetically = (contacts) => {
    const groups = contacts.reduce((acc, contact) => {
      const letter = (contact.name?.[0] || '#').toUpperCase();
      if (!acc[letter]) acc[letter] = [];
      acc[letter].push(contact);
      return acc;
    }, {});
    return Object.keys(groups).sort().map(letter => ({
      letter,
      data: groups[letter].sort((a, b) => a.name.localeCompare(b.name))
    }));
  };

  const groupedRegistered = groupAlphabetically(filteredRegistered);
  const groupedUnregistered = groupAlphabetically(filteredUnregistered);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className={`flex flex-col h-full overflow-y-auto relative ${isDarkMode ? 'bg-gradient-to-b from-[#0B1220] via-[#0F1829] to-[#0D1524] text-white' : 'bg-gradient-to-b from-[#FFFFFF] to-[#F6F9FF] text-slate-900'}`}>
      
      {/* Top Bar with Sync & Add Contact */}
      <div className={`flex items-center justify-between px-4 pt-4 pb-2 sticky top-0 z-30 backdrop-blur-xl shadow-sm border-b ${isDarkMode ? 'bg-[#0D1524]/85 border-slate-800/50' : 'bg-white/85 border-slate-200/50'}`}>
        <h2 className={`text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r ${isDarkMode ? 'from-blue-400 to-teal-400' : 'from-blue-600 to-teal-600'}`}>Contacts</h2>
        <div className="flex gap-2">
          <motion.button 
            whileTap={{ scale: 0.9, y: 1 }}
            onClick={onNewContact}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all shadow-sm hover:shadow hover:-translate-y-0.5 ${
              isDarkMode 
                ? 'text-blue-400 bg-blue-500/15 hover:bg-blue-400/20 border border-blue-500/10 hover:border-blue-400/30 hover:shadow-blue-500/20' 
                : 'text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-300'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add
          </motion.button>
          
          <motion.button 
            whileTap={{ scale: 0.9, y: 1 }}
            onClick={handleSyncContacts}
            disabled={syncing}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all shadow-sm hover:shadow hover:-translate-y-0.5 ${
              isDarkMode 
                ? 'text-teal-400 bg-teal-500/15 hover:bg-teal-400/20 border border-teal-500/10 hover:border-teal-400/30 hover:shadow-teal-500/20' 
                : 'text-teal-600 bg-teal-50 hover:bg-teal-100 border border-teal-200 hover:border-teal-300'
            }`}
          >
            <div className={syncing ? 'relative flex items-center justify-center' : ''}>
              {syncing && <span className="absolute inset-0 rounded-full bg-teal-400/30 blur animate-pulse"></span>}
              <RefreshCw className={`w-3.5 h-3.5 relative z-10 ${syncing ? 'animate-spin' : ''}`} />
            </div>
            {syncing ? 'Syncing...' : 'Sync'}
          </motion.button>
        </div>
      </div>

      {/* Search Bar */}
      <div className={`px-4 py-3 sticky top-[60px] z-20 backdrop-blur-xl pb-4 ${isDarkMode ? 'bg-[#0D1524]/85' : 'bg-white/85'}`}>
        <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border shadow-inner transition-colors duration-300 focus-within:ring-2 focus-within:ring-teal-400/40 focus-within:border-teal-400/50 ${
          isDarkMode ? 'bg-black/20 border-white/10' : 'bg-slate-100 border-slate-200'
        }`}>
          <Search className="w-4 h-4 text-slate-400 transition-colors group-focus-within:text-teal-400" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full bg-transparent text-sm outline-none transition-colors ${
              isDarkMode ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'
            }`}
          />
        </div>
      </div>

      {loading ? (
        // Shimmer Loaders
        <div className="flex flex-col px-4 space-y-6">
          {[1,2,3].map(group => (
            <div key={group} className="space-y-3">
              <div className="w-6 h-6 rounded-md bg-gradient-to-r from-transparent via-white/10 to-transparent bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]"></div>
              {[1,2].map(item => (
                <div key={item} className="flex items-center gap-4 py-2">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]"></div>
                  <div className="flex-1 space-y-2">
                    <div className="w-1/3 h-3 rounded-md bg-gradient-to-r from-transparent via-white/10 to-transparent bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]"></div>
                    <div className="w-1/4 h-2 rounded-md bg-gradient-to-r from-transparent via-white/10 to-transparent bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]"></div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 pb-20 relative">
          
          {/* Registered Contacts Section */}
          {groupedRegistered.length > 0 && (
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <div className="px-5 py-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.6)]"></div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Unicom Users</span>
              </div>
              
              {groupedRegistered.map((group) => (
                <div key={group.letter} className="relative">
                  {/* Sticky Alphabet Header */}
                  <div className={`sticky top-[135px] z-10 px-5 py-1.5 flex items-center`}>
                    <div className={`px-3 py-0.5 rounded-full text-xs font-black shadow-sm ${
                      isDarkMode ? 'bg-teal-500/20 text-teal-400 border border-teal-500/10' : 'bg-teal-50 text-teal-600 border border-teal-100'
                    }`}>
                      {group.letter}
                    </div>
                  </div>
                  
                  {group.data.map((c) => (
                    <motion.div
                      variants={itemVariants}
                      key={c.id}
                      whileHover={{ y: -1 }}
                      className={`group flex items-center justify-between px-4 py-3 mx-2 my-1 rounded-2xl transition-all duration-300 ${
                        isDarkMode ? 'hover:bg-gradient-to-r hover:from-white/5 hover:to-transparent' : 'hover:bg-gradient-to-r hover:from-slate-50 hover:to-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="absolute -inset-0.5 rounded-full bg-gradient-to-tr from-blue-500 to-teal-400 opacity-50 blur-[2px]"></div>
                          <div className="relative p-[2px] rounded-full bg-gradient-to-tr from-blue-500 to-teal-400 shadow-sm">
                            <img
                              src={c.avatar}
                              alt={c.name}
                              className={`w-11 h-11 rounded-full object-cover border-[2px] ${isDarkMode ? 'border-[#0D1524]' : 'border-white'}`}
                            />
                          </div>
                        </div>
                        <div>
                          <h3 className="font-bold text-[15px]">{c.name}</h3>
                          <p className="text-xs text-slate-400 mt-0.5 font-medium tracking-wide font-mono">{c.phone}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pr-1 opacity-90 group-hover:opacity-100 transition-opacity">
                        <motion.button
                          whileTap={{ scale: 0.9, rotate: -10 }}
                          onClick={() => onSelectChat(c)}
                          className={`p-2.5 rounded-full flex items-center justify-center transition-all shadow-sm border ${
                            isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-300 hover:text-white' : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-600 hover:text-slate-800'
                          }`}
                        >
                          <MessageSquare className="w-4 h-4" />
                        </motion.button>
                        
                        <motion.button
                          whileTap={{ scale: 0.9, rotate: 10 }}
                          onClick={() => startVoiceCall(c)}
                          className={`p-2.5 rounded-full flex items-center justify-center transition-all shadow-md hover:shadow-lg text-white ${
                            isDarkMode ? 'bg-gradient-to-br from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 shadow-teal-500/20 hover:shadow-teal-400/30' : 'bg-gradient-to-br from-teal-500 to-emerald-400 shadow-teal-500/30'
                          }`}
                        >
                          <Phone className="w-4 h-4 fill-current drop-shadow-sm" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ))}
            </motion.div>
          )}

          {/* Unregistered Contacts Section */}
          {groupedUnregistered.length > 0 && (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mt-4">
              <div className="px-5 py-3 flex items-center gap-2 border-t border-slate-800/20">
                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Invite to Unicom</span>
              </div>
              
              {groupedUnregistered.map((group) => (
                <div key={group.letter} className="relative">
                  {/* Sticky Alphabet Header */}
                  <div className={`sticky top-[135px] z-10 px-5 py-1.5 flex items-center`}>
                    <div className={`px-3 py-0.5 rounded-full text-xs font-black shadow-sm ${
                      isDarkMode ? 'bg-blue-500/20 text-blue-400 border border-blue-500/10' : 'bg-blue-50 text-blue-600 border border-blue-100'
                    }`}>
                      {group.letter}
                    </div>
                  </div>
                  
                  {group.data.map((c, idx) => (
                    <motion.div
                      variants={itemVariants}
                      key={idx}
                      whileHover={{ y: -1 }}
                      className={`group flex items-center justify-between px-4 py-3 mx-2 my-1 rounded-2xl transition-all duration-300 ${
                        isDarkMode ? 'hover:bg-gradient-to-r hover:from-white/5 hover:to-transparent' : 'hover:bg-gradient-to-r hover:from-slate-50 hover:to-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-[1.5px] border-dashed shadow-sm ${
                          isDarkMode ? 'bg-slate-800/50 border-slate-600' : 'bg-slate-50 border-slate-300'
                        }`}>
                          <UserPlus className={`w-5 h-5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                        </div>
                        <div>
                          <h3 className="font-bold text-[15px]">{c.name}</h3>
                          <p className="text-xs text-slate-400 mt-0.5 font-medium tracking-wide font-mono">{c.phone}</p>
                        </div>
                      </div>

                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => handleInvite(c.phone)}
                        className="relative overflow-hidden px-5 py-2 mr-1 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white text-[11px] font-bold tracking-widest transition-all shadow-[0_4px_15px_-3px_rgba(37,99,235,0.4)] hover:shadow-[0_6px_20px_-3px_rgba(37,99,235,0.6)] group/btn"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover/btn:animate-[shimmer_1.5s_infinite]"></div>
                        <span className="relative z-10">INVITE</span>
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              ))}
            </motion.div>
          )}
          
        </div>
      )}
    </div>
  );
}