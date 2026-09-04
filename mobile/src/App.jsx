import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Phone, Users, Settings, 
  Globe, Sparkles, Shield, RefreshCw 
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { CallProvider, useCall } from './context/CallContext';

import PhoneLoginScreen from './screens/auth/PhoneLoginScreen';
import OtpVerifyScreen from './screens/auth/OtpVerifyScreen';
import ProfileSetupScreen from './screens/auth/ProfileSetupScreen';

import ChatsListScreen from './screens/main/ChatsListScreen';
import ChatRoomScreen from './screens/main/ChatRoomScreen';
import CallsListScreen from './screens/main/CallsListScreen';
import ContactsScreen from './screens/main/ContactsScreen';
import SettingsScreen from './screens/main/SettingsScreen';

import LiveCallScreen from './screens/call/LiveCallScreen';
import IncomingCallModal from './screens/call/IncomingCallModal';
import StoragePlanScreen from './screens/subscription/StoragePlanScreen';
import UsdtPaymentScreen from './screens/subscription/UsdtPaymentScreen';
import SupportTicketScreen from './screens/support/SupportTicketScreen';
import DialpadBottomSheet from './components/DialpadBottomSheet';
import { requestNotificationPermission, subscribeToPushNotifications } from './services/pushService';

function MainApp() {
  const { user, loading, sessionError } = useAuth();
  const { isDarkMode, t } = useTheme();
  const { activeCall, incomingCall, startVoiceCall } = useCall();

  useEffect(() => {
    if (user) {
      const initPush = async () => {
        const granted = await requestNotificationPermission();
        if (granted) {
          await subscribeToPushNotifications();
        }
      };
      setTimeout(initPush, 3000);
    }
  }, [user]);

  const [authStep, setAuthStep] = useState('phone');
  const [pendingPhone, setPendingPhone] = useState('');
  const [firebaseConfirmation, setFirebaseConfirmation] = useState(null);
  
  const [currentTab, setCurrentTab] = useState('chats');
  const [activeChatContact, setActiveChatContact] = useState(null);
  const [subPage, setSubPage] = useState(null);
  const [selectedPlanForUsdt, setSelectedPlanForUsdt] = useState(null);
  
  const [dialpadState, setDialpadState] = useState({ isOpen: false, type: 'chat' });

  if (loading) {
    return (
      <div className="min-h-[100dvh] h-[100dvh] bg-[#080E18] flex items-center justify-center text-slate-400">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    if (authStep === 'otp') {
      return (
        <OtpVerifyScreen
          phone={pendingPhone}
          firebaseConfirmation={firebaseConfirmation}
          onBack={() => setAuthStep('phone')}
          onVerified={(isNew) => {
            if (isNew) setAuthStep('profile');
            else setAuthStep('phone');
          }}
        />
      );
    }
    if (authStep === 'profile') {
      return <ProfileSetupScreen onComplete={() => setAuthStep('phone')} />;
    }
    return (
      <PhoneLoginScreen
        onCodeSent={(phone, confirmationResult) => {
          setFirebaseConfirmation(confirmationResult);
          setPendingPhone(phone);
          setAuthStep('otp');
        }}
      />
    );
  }

  // Active Chat Sub-screen
  if (activeChatContact) {
    return (
      <>
        <ChatRoomScreen
          contact={activeChatContact}
          onBack={() => setActiveChatContact(null)}
        />
        {incomingCall && <IncomingCallModal />}
        {activeCall && <LiveCallScreen />}
      </>
    );
  }

  // Storage & Subscription Sub-screens
  if (subPage === 'storage_plan') {
    return (
      <>
        <StoragePlanScreen
          onBack={() => setSubPage(null)}
          onSelectLocalPay={(plan) => {
            setSelectedPlanForUsdt(plan);
            setSubPage('usdt_payment');
          }}
        />
        {incomingCall && <IncomingCallModal />}
        {activeCall && <LiveCallScreen />}
      </>
    );
  }

  if (subPage === 'usdt_payment') {
    return (
      <>
        <UsdtPaymentScreen
          selectedPlan={selectedPlanForUsdt}
          onBack={() => setSubPage('storage_plan')}
          onSuccess={() => setSubPage(null)}
        />
        {incomingCall && <IncomingCallModal />}
        {activeCall && <LiveCallScreen />}
      </>
    );
  }

  // Support Tickets Sub-screen
  if (subPage === 'support_tickets') {
    return (
      <>
        <SupportTicketScreen onBack={() => setSubPage(null)} />
        {incomingCall && <IncomingCallModal />}
        {activeCall && <LiveCallScreen />}
      </>
    );
  }

  return (
    <div className={`min-h-[100dvh] h-[100dvh] flex flex-col justify-between max-w-md mx-auto relative ${
      isDarkMode ? 'bg-[#080E18] text-white' : 'bg-[#F8FAFC] text-slate-900'
    }`}>
      {/* Session alert if logged into another device */}
      {sessionError && (
        <div className="p-3 bg-red-950 text-red-300 text-xs text-center border-b border-red-800">
          {sessionError}
        </div>
      )}

      {/* Top Header */}
      <header className={`px-4 pb-3 pt-[max(env(safe-area-inset-top),0.75rem)] border-b flex items-center justify-between z-10 shrink-0 ${
        isDarkMode ? 'bg-[#0D1524] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-teal-400 flex items-center justify-center font-black text-white text-xs shadow-md shadow-blue-500/20">
            U
          </div>
          <div>
            <h1 className="font-black text-sm tracking-tight">{t('appName')}</h1>
            <span className="text-[10px] text-teal-400 font-semibold block -mt-0.5">
              Live Simultaneous Interpretation
            </span>
          </div>
        </div>

        {/* User Status / Language Badge */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 uppercase">
            {user?.language?.toUpperCase()}
          </span>
          <img
            src={user?.avatar}
            alt={user?.name}
            onClick={() => setCurrentTab('settings')}
            className="w-8 h-8 rounded-full object-cover border border-blue-500 cursor-pointer shadow-sm"
          />
        </div>
      </header>

      {/* Main Tab Content View */}
      <main className="flex-1 overflow-hidden relative">
        <div key={currentTab} className="h-full w-full animate-fade-in">
          {currentTab === 'chats' && (
            <ChatsListScreen
              onSelectChat={(contact) => setActiveChatContact(contact)}
              onNewChat={() => setDialpadState({ isOpen: true, type: 'chat' })}
            />
          )}
          {currentTab === 'calls' && (
            <CallsListScreen 
              onNewCall={() => setDialpadState({ isOpen: true, type: 'call' })} 
              onMessage={(contact) => {
                setActiveChatContact(contact);
              }}
            />
          )}
          {currentTab === 'contacts' && (
            <ContactsScreen 
              onSelectChat={(contact) => setActiveChatContact(contact)} 
              onNewContact={() => setDialpadState({ isOpen: true, type: 'chat' })} 
            />
          )}
          {currentTab === 'settings' && (
            <SettingsScreen onNavigate={(page) => setSubPage(page)} />
          )}
        </div>
      </main>

      {/* Bottom WhatsApp-Style Navigation Bar */}
      <nav className={`px-4 pt-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] border-t flex items-center justify-around z-10 shrink-0 ${
        isDarkMode ? 'bg-[#0D1524] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        {[
          { id: 'chats', label: t('chats'), icon: MessageSquare },
          { id: 'calls', label: t('calls'), icon: Phone },
          { id: 'contacts', label: t('contacts'), icon: Users },
          { id: 'settings', label: t('settings'), icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition active:scale-95 ${
                isActive
                  ? 'text-blue-500 font-bold'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <div className={`p-1 rounded-xl ${isActive ? 'bg-blue-600/10' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px]">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Global Call Overlays & Modals */}
      <DialpadBottomSheet 
        isOpen={dialpadState.isOpen}
        actionType={dialpadState.type}
        onClose={() => setDialpadState({ ...dialpadState, isOpen: false })}
        onProceed={(user) => {
          if (dialpadState.type === 'chat') {
            setActiveChatContact(user);
          } else if (dialpadState.type === 'call') {
            startVoiceCall(user);
          }
        }}
      />
      {incomingCall && <IncomingCallModal />}
      {activeCall && <LiveCallScreen />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CallProvider>
          <MainApp />
        </CallProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
