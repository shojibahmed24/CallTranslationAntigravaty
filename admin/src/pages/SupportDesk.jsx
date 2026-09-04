import React, { useState, useEffect } from 'react';
import { HelpCircle, MessageSquare, Send, CheckCircle, Clock, User, Phone } from 'lucide-react';
import { adminApi } from '../services/adminApi';

export default function SupportDesk() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getSupportTickets();
      setTickets(res.tickets);
      if (res.tickets.length > 0 && !selectedTicket) {
        setSelectedTicket(res.tickets[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    try {
      const res = await adminApi.replyTicket(selectedTicket.id, replyText.trim(), 'resolved');
      setReplyText('');
      setSelectedTicket(res.ticket);
      fetchTickets();
    } catch (err) {
      alert('Failed to send reply: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <HelpCircle className="w-6 h-6 text-blue-400" />
          Help & Support Ticket Desk
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Respond to user inquiries regarding USDT payments, translation latency, and phone verification.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket List */}
        <div className="bg-[#0F1829] border border-slate-800/80 rounded-2xl p-4 shadow-xl space-y-3 h-[600px] overflow-y-auto">
          <div className="text-xs font-semibold text-slate-400 px-2 uppercase tracking-wider">
            Active User Tickets ({tickets.length})
          </div>

          {tickets.map((t) => (
            <div
              key={t.id}
              onClick={() => setSelectedTicket(t)}
              className={`p-3.5 rounded-xl border transition cursor-pointer ${
                selectedTicket?.id === t.id
                  ? 'bg-blue-950/40 border-blue-600/50 shadow-md'
                  : 'bg-[#131D31] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white text-xs truncate max-w-[160px]">{t.userName}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  t.status === 'resolved' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                }`}>
                  {t.status}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-1 truncate">{t.subject}</p>
              <span className="text-[10px] text-slate-500 mt-2 block">{new Date(t.updatedAt).toLocaleString()}</span>
            </div>
          ))}
        </div>

        {/* Ticket Conversation Detail */}
        <div className="lg:col-span-2 bg-[#0F1829] border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col h-[600px]">
          {selectedTicket ? (
            <>
              {/* Header */}
              <div className="border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-white">{selectedTicket.subject}</h2>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">{selectedTicket.category.toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                  <span>User: <strong className="text-white">{selectedTicket.userName}</strong></span>
                  <span>Phone: <strong className="text-slate-300 font-mono">{selectedTicket.userPhone}</strong></span>
                </div>
              </div>

              {/* Messages Thread */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {selectedTicket.messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl text-xs max-w-[85%] ${
                      m.sender === 'admin'
                        ? 'bg-blue-600/20 border border-blue-600/40 text-blue-100 ml-auto'
                        : 'bg-[#142036] border border-slate-700/60 text-slate-200 mr-auto'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 font-semibold text-[11px] mb-1 opacity-80">
                      <span>{m.senderName}</span>
                      <span>{new Date(m.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="leading-relaxed">{m.text}</p>
                  </div>
                ))}
              </div>

              {/* Reply Box */}
              <form onSubmit={handleSendReply} className="mt-4 pt-3 border-t border-slate-800 flex gap-2">
                <input
                  type="text"
                  placeholder="Type an official admin response..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 bg-[#131D31] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition shadow-lg shadow-blue-600/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  Reply
                </button>
              </form>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 text-xs">
              Select a support ticket to view conversation and reply.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
