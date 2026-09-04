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
    <div className={`flex flex-col h-full overflow-y-auto relative ${isDarkMode ? 'bg-[#0F1829] text-white' : 'bg-white text-slate-900'}`}>
      {/* Top Bar with Sync & Add Contact */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 sticky top-0 z-20 bg-inherit backdrop-blur-md bg-opacity-90">
        <h2 className="text-xl font-bold tracking-tight">Contacts</h2>
        <div className="flex gap-2">
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={onNewContact}
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-full transition hover:bg-blue-500/20 shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add
          </motion.button>
          
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={handleSyncContacts}
            disabled={syncing}
            className="flex items-center gap-1.5 text-xs font-semibold text-teal-400 bg-teal-500/10 px-3 py-1.5 rounded-full transition hover:bg-teal-500/20 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync'}
          </motion.button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-2 mb-2 sticky top-12 z-20 bg-inherit pb-4">
        <div className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border transition shadow-sm ${
          isDarkMode ? 'bg-[#142036] border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm font-medium focus:outline-none placeholder-slate-400"
          />
        </div>
      </div>

      {loading ? (
        // Shimmer Loaders
        <div className="flex flex-col px-4 space-y-6">
          {[1,2,3].map(group => (
            <div key={group} className="space-y-3">
              <div className={`w-6 h-6 rounded animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
              {[1,2].map(item => (
                <div key={item} className="flex items-center gap-4 py-2">
                  <div className={`w-11 h-11 rounded-full animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
                  <div className="flex-1 space-y-2">
                    <div className={`w-1/3 h-3 rounded animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
                    <div className={`w-1/4 h-2 rounded animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
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
              <div className="px-4 py-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unicom Users</span>
              </div>
              
              {groupedRegistered.map((group) => (
                <div key={group.letter} className="relative">
                  {/* Sticky Alphabet Header */}
                  <div className={`sticky top-[104px] z-10 px-6 py-1 text-sm font-bold shadow-sm backdrop-blur-md ${
                    isDarkMode ? 'bg-[#0F1829]/90 text-teal-400 border-y border-slate-800/40' : 'bg-slate-50/90 text-teal-600 border-y border-slate-100'
                  }`}>
                    {group.letter}
                  </div>
                  
                  {group.data.map((c) => (
                    <motion.div
                      variants={itemVariants}
                      key={c.id}
                      className={`flex items-center justify-between px-4 py-3 transition ${
                        isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={c.avatar}
                          alt={c.name}
                          className="w-11 h-11 rounded-full object-cover shadow-sm border border-slate-700/50"
                        />
                        <div>
                          <h3 className="font-bold text-[14px]">{c.name}</h3>
                          <p className="text-[11px] text-slate-400 mt-0.5 font-medium">{c.phone}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pr-2">
                        <motion.button
                          whileTap={{ scale: 0.8, rotate: -10 }}
                          onClick={() => onSelectChat(c)}
                          className={`p-2.5 rounded-full flex items-center justify-center transition shadow-sm ${
                            isDarkMode ? 'bg-slate-800/60 hover:bg-slate-700 text-slate-300' : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-600'
                          }`}
                        >
                          <MessageSquare className="w-4 h-4" />
                        </motion.button>
                        
                        <motion.button
                          whileTap={{ scale: 0.8, rotate: 10 }}
                          onClick={() => startVoiceCall(c)}
                          className="p-2.5 rounded-full flex items-center justify-center bg-teal-500/20 text-teal-500 hover:bg-teal-500 hover:text-white transition shadow-sm"
                        >
                          <Phone className="w-4 h-4 fill-current" />
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
              <div className="px-4 py-2 border-t border-slate-800/40">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Invite to Unicom</span>
              </div>
              
              {groupedUnregistered.map((group) => (
                <div key={group.letter} className="relative">
                  {/* Sticky Alphabet Header */}
                  <div className={`sticky top-[104px] z-10 px-6 py-1 text-sm font-bold shadow-sm backdrop-blur-md ${
                    isDarkMode ? 'bg-[#0F1829]/90 text-blue-400 border-y border-slate-800/40' : 'bg-slate-50/90 text-blue-600 border-y border-slate-100'
                  }`}>
                    {group.letter}
                  </div>
                  
                  {group.data.map((c, idx) => (
                    <motion.div
                      variants={itemVariants}
                      key={idx}
                      className={`flex items-center justify-between px-4 py-3 transition ${
                        isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center border shadow-sm ${
                          isDarkMode ? 'bg-slate-800 border-slate-700/50' : 'bg-slate-100 border-slate-200'
                        }`}>
                          <UserPlus className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                          <h3 className="font-bold text-[14px]">{c.name}</h3>
                          <p className="text-[11px] text-slate-400 mt-0.5 font-medium">{c.phone}</p>
                        </div>
                      </div>

                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleInvite(c.phone)}
                        className="px-5 py-2 mr-2 rounded-full bg-blue-600 text-white text-[11px] font-bold tracking-widest hover:bg-blue-500 transition shadow-lg shadow-blue-600/30 active:shadow-sm"
                      >
                        INVITE
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
