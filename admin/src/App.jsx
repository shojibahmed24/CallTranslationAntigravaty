import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, CreditCard, Activity, 
  HelpCircle, Settings, Sparkles, LogOut, Shield,
  Menu, X
} from 'lucide-react';
import AdminLogin from './pages/AdminLogin';
import DashboardOverview from './pages/DashboardOverview';
import UsersManagement from './pages/UsersManagement';
import CryptoPayments from './pages/CryptoPayments';
import TechnicalAnalytics from './pages/TechnicalAnalytics';
import SupportDesk from './pages/SupportDesk';
import PaymentSettings from './pages/PaymentSettings';
import DevCallSimulator from './pages/DevCallSimulator';
import { adminApi } from './services/adminApi';

export default function App() {
  const [admin, setAdmin] = useState(null);
  const [currentTab, setCurrentTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = adminApi.getToken();
    if (token) {
      setAdmin({ email: 'admin@unicom.global', role: 'Super Administrator' });
    }
  }, []);

  const handleLogout = () => {
    adminApi.clearToken();
    setAdmin(null);
  };

  if (!admin) {
    return <AdminLogin onLoginSuccess={(adm) => setAdmin(adm)} />;
  }

  const navItems = [
    { id: 'overview', label: 'Overview & Telemetry', icon: LayoutDashboard },
    { id: 'users', label: 'Users & Quotas', icon: Users },
    { id: 'payments', label: 'USDT (TRC-20) Approvals', icon: CreditCard },
    { id: 'analytics', label: 'Interpretation Health', icon: Activity },
    { id: 'support', label: 'Support Desk', icon: HelpCircle },
    { id: 'settings', label: 'Wallet & Pricing', icon: Settings },
    { id: 'simulator', label: 'Live Call Simulator', icon: Sparkles, highlight: true }
  ];

  return (
    <div className="min-h-[100dvh] bg-[#080E18] text-slate-100 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0D1524] border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-teal-400 flex items-center justify-center font-bold text-white text-sm">
            U
          </div>
          <span className="font-bold text-white">UNICOM Admin</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-400 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 z-20 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 h-[100dvh] w-64 bg-[#0B1322] border-r border-slate-800/80 flex flex-col flex-shrink-0 z-30 transition-transform duration-300 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        {/* Brand */}
        <div className="p-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-teal-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white tracking-tight">UNICOM Admin</h2>
              <span className="text-[11px] text-teal-400 font-medium">2FA Verified Portal</span>
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                    : item.highlight
                    ? 'text-cyan-300 bg-cyan-950/40 border border-cyan-800/50 hover:bg-cyan-900/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-slate-800/80 bg-[#0A101C]">
          <div className="flex items-center justify-between">
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">{admin.email}</p>
              <p className="text-[10px] text-slate-500">{admin.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition"
              title="Logout from Admin Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {currentTab === 'overview' && <DashboardOverview onNavigate={(tab) => setCurrentTab(tab)} />}
        {currentTab === 'users' && <UsersManagement />}
        {currentTab === 'payments' && <CryptoPayments />}
        {currentTab === 'analytics' && <TechnicalAnalytics />}
        {currentTab === 'support' && <SupportDesk />}
        {currentTab === 'settings' && <PaymentSettings />}
        {currentTab === 'simulator' && <DevCallSimulator />}
      </main>
    </div>
  );
}
