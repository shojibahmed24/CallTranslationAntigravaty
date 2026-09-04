import React, { useState, useEffect } from 'react';
import { Users, Search, Shield, Ban, CheckCircle, Award, HardDrive, Phone, Clock } from 'lucide-react';
import { adminApi } from '../services/adminApi';

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newPlan, setNewPlan] = useState('pro');
  const [bonusMinutes, setBonusMinutes] = useState(60);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getUsers(search);
      setUsers(res.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const handleUpdateQuota = async () => {
    if (!selectedUser) return;
    try {
      await adminApi.updateUserQuota(selectedUser.id, {
        plan: newPlan,
        bonusMinutes: Number(bonusMinutes)
      });
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      alert('Failed to update quota: ' + err.message);
    }
  };

  const handleToggleBan = async (user) => {
    try {
      await adminApi.updateUserQuota(user.id, {
        isBanned: !user.isBanned
      });
      fetchUsers();
    } catch (err) {
      alert('Failed to update ban status');
    }
  };

  const getLanguageLabel = (code) => {
    switch (code) {
      case 'bn': return { label: 'বাংলা (BN)', bg: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40' };
      case 'en': return { label: 'English (EN)', bg: 'bg-blue-950/60 text-blue-300 border-blue-800/40' };
      case 'hi': return { label: 'हिन्दी (HI)', bg: 'bg-amber-950/60 text-amber-300 border-amber-800/40' };
      case 'ar': return { label: 'العربية (AR)', bg: 'bg-purple-950/60 text-purple-300 border-purple-800/40' };
      default: return { label: code.toUpperCase(), bg: 'bg-slate-800 text-slate-300' };
    }
  };

  const getPlanBadge = (plan) => {
    switch (plan) {
      case 'pro':
        return 'bg-gradient-to-r from-blue-600 to-teal-500 text-white font-semibold shadow-sm';
      case 'unlimited':
        return 'bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold shadow-sm';
      default:
        return 'bg-slate-800 text-slate-300 border border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-blue-400" />
            User Accounts & Subscription Quotas
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage global clients, freelancers, spoken languages, and cloud quotas.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, phone, or language..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#10192B] border border-slate-700/70 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#0F1829] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-[#131E33] text-slate-400 font-medium uppercase tracking-wider">
                <th className="py-3.5 px-4">User / Phone</th>
                <th className="py-3.5 px-4">Spoken Language</th>
                <th className="py-3.5 px-4">Active Plan</th>
                <th className="py-3.5 px-4">Storage Used</th>
                <th className="py-3.5 px-4">Daily/Monthly Call Mins</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => {
                const lang = getLanguageLabel(u.language);
                return (
                  <tr key={u.id} className="hover:bg-slate-800/20 transition">
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-semibold text-white text-sm">{u.name}</p>
                        <p className="font-mono text-slate-400 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-500" />
                          {u.phone}
                        </p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${lang.bg}`}>
                        {lang.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] uppercase ${getPlanBadge(u.plan)}`}>
                        {u.plan}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-200 font-medium">{u.storageUsedMB} MB</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                        <span>Today: <strong>{u.translatedMinutesUsedToday}m</strong> | Mo: <strong>{u.translatedMinutesUsedMonth}m</strong></span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        u.onlineStatus === 'online' ? 'bg-emerald-950/60 text-emerald-400' : 'bg-slate-800 text-slate-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.onlineStatus === 'online' ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                        {u.onlineStatus.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setNewPlan(u.plan);
                            setModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-blue-200 border border-blue-600/40 rounded-lg text-xs font-medium transition"
                        >
                          Modify Plan
                        </button>
                        <button
                          onClick={() => handleToggleBan(u)}
                          className={`p-1.5 rounded-lg border text-xs font-medium transition ${
                            u.isBanned 
                              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800' 
                              : 'bg-red-950/40 text-red-400 border-red-800/60 hover:bg-red-950/60'
                          }`}
                          title={u.isBanned ? 'Unban user' : 'Ban user'}
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modify Plan Modal */}
      {modalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F1829] border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-teal-400" />
              Modify Quota: {selectedUser.name}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Select Subscription Plan</label>
                <select
                  value={newPlan}
                  onChange={(e) => setNewPlan(e.target.value)}
                  className="w-full bg-[#142036] border border-slate-700 rounded-xl px-3 py-2.5 text-white"
                >
                  <option value="free">Free Starter (5 GB Storage, 5 Mins/Day)</option>
                  <option value="pro">Pro Freelancer (50 GB Storage, 300 Mins/Month)</option>
                  <option value="unlimited">Unlimited / Business (100 GB Storage, 500 Mins/Month)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Grant Bonus Translation Minutes</label>
                <input
                  type="number"
                  value={bonusMinutes}
                  onChange={(e) => setBonusMinutes(e.target.value)}
                  className="w-full bg-[#142036] border border-slate-700 rounded-xl px-3 py-2.5 text-white"
                  placeholder="Minutes to grant"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateQuota}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl text-xs shadow-lg shadow-blue-600/20"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
