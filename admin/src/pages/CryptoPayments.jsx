import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, XCircle, ExternalLink, Copy, Check, Clock, AlertCircle } from 'lucide-react';
import { adminApi } from '../services/adminApi';

export default function CryptoPayments() {
  const [payments, setPayments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getPayments(statusFilter);
      setPayments(res.payments);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [statusFilter]);

  const handleApprove = async (payment) => {
    if (!window.confirm(`Approve USDT (TRC-20) payment of $${payment.amountUSDT} for ${payment.userName}? This will automatically upgrade their subscription to ${payment.planName}.`)) {
      return;
    }

    try {
      await adminApi.reviewPayment(payment.id, 'approve');
      alert('Payment approved and subscription activated successfully!');
      fetchPayments();
    } catch (err) {
      alert('Approval failed: ' + err.message);
    }
  };

  const handleRejectSubmit = async () => {
    if (!selectedPayment) return;
    try {
      await adminApi.reviewPayment(selectedPayment.id, 'reject', rejectionReason || 'TxHash invalid or payment not received on TRC-20 network');
      setRejectModalOpen(false);
      fetchPayments();
    } catch (err) {
      alert('Rejection failed: ' + err.message);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-teal-400" />
            Manual Payment Approvals (Bkash, Nagad, USDT)
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manual verification queue for all non-Stripe payments (MFS and Crypto).
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center bg-[#10192B] p-1 rounded-xl border border-slate-700/60 text-xs">
          {['', 'pending', 'approved', 'rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg capitalize font-medium transition ${
                statusFilter === st ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Payments List */}
      <div className="space-y-4">
        {payments.length === 0 ? (
          <div className="bg-[#0F1829] border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-sm">
            No payment transactions match the selected filter.
          </div>
        ) : (
          payments.map((p) => {
            const isPending = p.status === 'pending';
            return (
              <div
                key={p.id}
                className={`bg-[#0F1829] border rounded-2xl p-5 shadow-xl transition flex flex-col gap-4 ${
                  isPending ? 'border-amber-500/40 bg-amber-950/5' : 'border-slate-800/80'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-white text-base">{p.user_name || p.userName || 'User'}</span>
                      <span className="text-xs font-mono text-slate-400">{p.user_phone || p.userPhone}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        p.status === 'approved' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        p.status === 'pending' ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse' :
                        'bg-red-950 text-red-400 border border-red-800'
                      }`}>
                        {p.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-slate-400">
                      <div>Plan: <strong className="text-white">{p.plan_name || p.planName}</strong></div>
                      <div>Amount: <strong className="text-teal-400">${p.amount_usd || p.amountUSD}</strong></div>
                      <div>Method: <strong className="text-slate-300 uppercase">{p.network}</strong></div>
                      <div>Submitted: {new Date(p.submitted_at || p.submittedAt).toLocaleString()}</div>
                    </div>

                    {/* TxHash display */}
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-xs text-slate-400 font-medium">TxHash:</span>
                      <code className="text-xs font-mono text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40 max-w-md truncate">
                        {p.tx_hash || p.txHash}
                      </code>
                      <button
                        onClick={() => copyToClipboard(p.tx_hash || p.txHash, p.id)}
                        className="p-1 text-slate-400 hover:text-white transition"
                        title="Copy TxHash"
                      >
                        {copiedId === p.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      {p.network?.toLowerCase() === 'usdt' && (
                        <a
                          href={`https://tronscan.org/#/transaction/${p.tx_hash || p.txHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 underline ml-1"
                        >
                          TronScan <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {isPending ? (
                    <div className="flex items-center gap-3 self-end lg:self-center shrink-0">
                      <button
                        onClick={() => {
                          setSelectedPayment(p);
                          setRejectModalOpen(true);
                        }}
                        className="px-4 py-2 bg-red-950/40 hover:bg-red-900/40 text-red-300 border border-red-800/60 rounded-xl text-xs font-medium transition flex items-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(p)}
                        className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white rounded-xl text-xs font-medium shadow-lg shadow-teal-500/20 transition flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve & Upgrade
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 self-end lg:self-center">
                      Reviewed by {p.reviewed_by || p.reviewedBy || 'System'} at {p.reviewed_at ? new Date(p.reviewed_at).toLocaleString() : ''}
                    </div>
                  )}
                </div>

                {/* Screenshot Display */}
                {p.wallet_address && p.wallet_address.startsWith('http') && (
                  <div className="mt-2 border-t border-slate-700/60 pt-4">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">Attached Payment Screenshot</p>
                    <a href={p.wallet_address} target="_blank" rel="noreferrer">
                      <img 
                        src={p.wallet_address} 
                        alt="Payment Proof" 
                        className="h-32 w-auto object-contain rounded-lg border border-slate-700 hover:border-teal-400 transition cursor-zoom-in"
                      />
                    </a>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && selectedPayment && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F1829] border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              Reject Payment
            </h3>

            <div className="text-xs space-y-3">
              <p className="text-slate-300">
                Are you sure you want to reject TxHash for <strong>{selectedPayment.user_name || selectedPayment.userName}</strong>?
              </p>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Reason for Rejection</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Transaction hash not found, or screenshot is blurry."
                  rows={3}
                  className="w-full bg-[#142036] border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-medium rounded-xl text-xs shadow-lg shadow-red-600/20"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
