import React, { useState } from 'react';
import { X, Phone, MessageSquare, Search, User } from 'lucide-react';
import { api } from '../services/api';

export default function DialpadBottomSheet({ isOpen, onClose, actionType, onProceed }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [foundUser, setFoundUser] = useState(null);

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;
    
    setLoading(true);
    setError('');
    setFoundUser(null);
    
    try {
      // Add '+' if missing (assuming international format) or search as is
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      
      const res = await api.request('/chat/sync-contacts', {
        method: 'POST',
        body: JSON.stringify({ phoneNumbers: [formattedPhone, phoneNumber] }) // Try both formats
      });

      if (res.contacts && res.contacts.length > 0) {
        setFoundUser(res.contacts[0]);
      } else {
        setError('No UNICOM user found with this number.');
      }
    } catch (err) {
      setError('Failed to search user.');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = () => {
    if (foundUser) {
      onProceed(foundUser);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div className="bg-[#0D1524] border-t border-slate-800 rounded-t-3xl w-full max-w-md mx-auto relative z-10 animate-slide-up pb-[max(env(safe-area-inset-bottom),1rem)]">
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-slate-700 rounded-full" />
        </div>
        
        <div className="p-5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">
              {actionType === 'chat' ? 'New Chat' : 'Make a Call'}
            </h3>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white bg-slate-800/50 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSearch} className="mb-6">
            <label className="block text-xs font-medium text-slate-400 mb-2">Enter Mobile Number</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+88017..."
                  className="w-full bg-[#131D31] border border-slate-700 rounded-xl pl-4 pr-10 py-3.5 text-white text-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={loading || !phoneNumber.trim()}
                className="px-5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900/50 text-white rounded-xl shadow-lg shadow-blue-600/20 transition flex items-center justify-center"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search className="w-5 h-5" />}
              </button>
            </div>
            {error && <p className="text-red-400 text-xs mt-2 ml-1">{error}</p>}
          </form>

          {foundUser && (
            <div className="bg-[#131D31] border border-slate-700/60 rounded-2xl p-4 flex items-center justify-between animate-scale-in">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-800 rounded-full overflow-hidden border border-slate-700 flex items-center justify-center">
                  {foundUser.avatar ? (
                    <img src={`http://localhost:5000${foundUser.avatar}`} className="w-full h-full object-cover" alt={foundUser.name} />
                  ) : (
                    <User className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div>
                  <h4 className="text-white font-bold text-base">{foundUser.name}</h4>
                  <p className="text-slate-400 text-xs">{foundUser.phone}</p>
                </div>
              </div>
              
              <button
                onClick={handleAction}
                className={`p-3.5 rounded-full text-white shadow-lg transition active:scale-90 ${
                  actionType === 'chat' 
                    ? 'bg-blue-600 shadow-blue-600/30' 
                    : 'bg-emerald-500 shadow-emerald-500/30'
                }`}
              >
                {actionType === 'chat' ? <MessageSquare className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
