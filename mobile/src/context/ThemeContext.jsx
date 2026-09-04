import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    appName: 'UNICOM',
    tagline: 'Speak Freely. Connect Globally.',
    chats: 'Chats',
    calls: 'Calls',
    contacts: 'Contacts',
    settings: 'Settings',
    search: 'Search...',
    online: 'Online',
    offline: 'Offline',
    typing: 'typing...',
    send: 'Send',
    startCall: 'Voice Call',
    realTimeInterpretation: 'Real-time Interpretation',
    sameLanguageCall: 'Direct Call (No Translation Charge)',
    endCall: 'End Call',
    mute: 'Mute',
    speaker: 'Speaker',
    interrupt: 'Barge-In / Interrupt',
    storageUsed: 'Storage Used',
    callMinutesUsed: 'Translated Call Minutes',
    upgradePlan: 'Upgrade Plan',
    usdtPayment: 'USDT (TRC-20) Payment',
    stripePayment: 'International Card (Stripe)',
    helpSupport: 'Help & Support',
    privacy: 'Privacy & Safety',
    profile: 'Profile',
    language: 'Spoken Language',
    interfaceLang: 'Interface Language',
    theme: 'Appearance',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    reportIssue: 'Report Translation Issue',
    submit: 'Submit',
    cancel: 'Cancel',
    freePlan: 'Free Starter',
    proPlan: 'Pro Freelancer',
    unlimitedPlan: 'Unlimited / Business',
    devDemoMode: 'Developer Demo Mode'
  },
  bn: {
    appName: 'UNICOM',
    tagline: 'সীমাহীন যোগাযোগ। রিয়েল-টাইম অনুবাদ।',
    chats: 'চ্যাট',
    calls: 'কল',
    contacts: 'কনট্যাক্ট',
    settings: 'সেটিংস',
    search: 'অনুসন্ধান করুন...',
    online: 'অনলাইন',
    offline: 'অফলাইন',
    typing: 'লিখছেন...',
    send: 'পাঠান',
    startCall: 'ভয়েস কল',
    realTimeInterpretation: 'রিয়েল-টাইম অনুবাদ চলছে',
    sameLanguageCall: 'সরাসরি কল (কোনো চার্জ নেই)',
    endCall: 'কল শেষ করুন',
    mute: 'মিউট',
    speaker: 'স্পিকার',
    interrupt: 'মাঝপথে কথা বলুন (Barge-In)',
    storageUsed: 'ক্লাউড স্টোরেজ ব্যবহার',
    callMinutesUsed: 'অনুবাদ কল মিনিট',
    upgradePlan: 'প্ল্যান আপগ্রেড করুন',
    usdtPayment: 'USDT (TRC-20) পেমেন্ট',
    stripePayment: 'আন্তর্জাতিক কার্ড (Stripe)',
    helpSupport: 'সাহায্য ও সাপোর্ট',
    privacy: 'প্রাইভেসি ও নিরাপত্তা',
    profile: 'প্রোফাইল',
    language: 'কথ্য ভাষা',
    interfaceLang: 'অ্যাপের ভাষা',
    theme: 'থিম / রূপ',
    lightMode: 'লাইট মোড',
    darkMode: 'ডার্ক মোড',
    reportIssue: 'অনুবাদ সমস্যা রিপোর্ট করুন',
    submit: 'জমা দিন',
    cancel: 'বাতিল',
    freePlan: 'ফ্রি স্টার্টার',
    proPlan: 'প্রো ফ্রিল্যান্সার',
    unlimitedPlan: 'আনলিমিটেড / বিজনেস',
    devDemoMode: 'ডেভেলপার ডেমো মোড'
  }
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('midnight');
  const [appLanguage, setAppLanguage] = useState('en');

  const t = (key) => {
    return translations[appLanguage]?.[key] || translations['en']?.[key] || key;
  };

  const isDarkMode = theme !== 'light';

  const getThemeClasses = () => {
    switch (theme) {
      case 'light':
        return { bg: 'bg-white', text: 'text-slate-900', border: 'border-slate-200', card: 'bg-slate-50', primary: 'bg-blue-600' };
      case 'dark':
        return { bg: 'bg-[#111827]', text: 'text-white', border: 'border-gray-800', card: 'bg-[#1F2937]', primary: 'bg-blue-600' };
      case 'oceanic':
        return { bg: 'bg-[#0B1727]', text: 'text-white', border: 'border-[#1A2A40]', card: 'bg-[#102036]', primary: 'bg-cyan-600' };
      case 'teal':
        return { bg: 'bg-[#061C1D]', text: 'text-white', border: 'border-[#0F3536]', card: 'bg-[#0A2627]', primary: 'bg-teal-500' };
      case 'midnight':
      default:
        return { bg: 'bg-[#0D1524]', text: 'text-white', border: 'border-slate-800', card: 'bg-[#142036]', primary: 'bg-blue-600' };
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDarkMode, appLanguage, setAppLanguage, t, getThemeClasses }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
