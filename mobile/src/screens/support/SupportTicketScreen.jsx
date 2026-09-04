import React, { useState, useEffect } from 'react';
import { ArrowLeft, HelpCircle, Send, MessageSquare, Plus, CheckCircle, Clock } from 'lucide-react';
import { api } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

export default function SupportTicketScreen({ onBack }) {
  const { isDarkMode } = useTheme();

  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [category, setCategory] = useState('payment');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await api.getUserTickets();
      setTickets(res.tickets || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    try {
      const res = await api.createTicket(category, subject.trim(), message.trim());
      setShowNewModal(false);
      setSubject('');
      setMessage('');
      fetchTickets();
      setSelectedTicket(res.ticket);
    } catch (err) {
      alert('Failed to submit ticket: ' + err.message);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    try {
      const res = await api.replyTicket(selectedTicket.id, replyText.trim());
      setReplyText('');
      setSelectedTicket(res.ticket);
      fetchTickets();
    } catch (err) {
      alert('Failed to send reply: ' + err.message);
    }
  };

  return (
    <div className={`min-h-[100dvh] flex flex-col px-4 pt-[max(env(safe-area-inset-top),1rem)] pb-[max(env(safe-area-inset-bottom),1rem)] max-w-md mx-auto justify-between ${
      isDarkMode ? 'bg-[#080E18] text-white' : 'bg-[#F8FAFC] text-slate-900'
    }`}>
      {/* Top Header */}
      <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-xl text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-bold">Help & Support Desk</h1>
            <p className="text-[11px] text-slate-400">Direct Admin assistance</p>
          </div>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-md shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" /> New Ticket
        </button>
      </div>

      {/* Content */}
      {selectedTicket ? (
        <div className="flex-1 flex flex-col justify-between my-3 overflow-hidden">
          <div className="border-b border-slate-800 pb-2 mb-2 flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold truncate max-w-[200px]">{selectedTicket.subject}</h2>
              <span className="text-[10px] text-teal-400 uppercase font-semibold">{selectedTicket.category}</span>
            </div>
            <button
              onClick={() => setSelectedTicket(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Back to Tickets
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {selectedTicket.messages.map((m, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-2xl text-xs max-w-[85%] ${
                  m.sender === 'admin'
                    ? 'bg-blue-600/20 border border-blue-600/40 text-blue-100 mr-auto'
                    : 'bg-[#142036] border border-slate-700/60 text-slate-200 ml-auto'
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-[10px] font-bold mb-1 opacity-75">
                  <span>{m.senderName}</span>
                  <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="leading-relaxed">{m.text}</p>
              </div>
            ))}
          </div>

          {/* Reply form */}
          <form onSubmit={handleSendReply} className="mt-3 flex gap-2 pt-2 border-t border-slate-800">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Reply to support team..."
              className="flex-1 bg-[#131D31] border border-slate-700 rounded-2xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl shadow transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 space-y-3 my-4 overflow-y-auto">
          {tickets.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No support tickets submitted yet. Tap "New Ticket" to request help with USDT verification or translation latency.
            </div>
          ) : (
            tickets.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTicket(t)}
                className={`p-4 rounded-2xl border transition cursor-pointer ${
                  isDarkMode ? 'bg-[#0F1829] border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate max-w-[220px]">{t.subject}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                    t.status === 'resolved' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-300'
                  }`}>
                    {t.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                  <span className="capitalize">{t.category}</span>
                  <span>{new Date(t.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* New Ticket Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F1829] border border-slate-700 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-teal-400" />
              Create Support Ticket
            </h3>

            <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Issue Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#142036] border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="payment">USDT (TRC-20) / Card Payment</option>
                  <option value="translation">Voice Translation Quality / Latency</option>
                  <option value="otp">SMS OTP / Phone Login</option>
                  <option value="storage">Cloud Storage & Quota</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. USDT TxHash submitted for Pro upgrade"
                  required
                  className="w-full bg-[#142036] border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue or provide transaction details..."
                  rows={3}
                  required
                  className="w-full bg-[#142036] border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-3 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-md"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
