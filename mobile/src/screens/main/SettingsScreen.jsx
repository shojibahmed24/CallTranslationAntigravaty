import React, { useState, useEffect } from 'react';
import { 
  User, HardDrive, Shield, Globe, Moon, Sun, 
  HelpCircle, LogOut, ChevronRight, Check, Award, 
  Trash2, PhoneCall, Sparkles, ExternalLink, Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';
import EditProfileModal from '../../components/EditProfileModal';
import { Edit2 } from 'lucide-react';

export default function SettingsScreen({ onNavigate }) {
  const { user, updateUserProfile, logout, deleteAccount } = useAuth();
  const { theme, setTheme, isDarkMode, appLanguage, setAppLanguage, t, getThemeClasses } = useTheme();

  const [languageModalOpen, setLanguageModalOpen] = useState(false);
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const [wallpaperModalOpen, setWallpaperModalOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  const spokenLanguages = [
    { code: 'bn', name: 'বাংলা (Bengali)' },
    { code: 'en', name: 'English (International)' },
    { code: 'hi', name: 'हिन्दी (Hindi)' },
    { code: 'ar', name: 'العربية (Arabic)' }
  ];

  const themes = [
    { code: 'light', name: 'Light Mode' },
    { code: 'dark', name: 'Dark Mode' },
    { code: 'midnight', name: 'Midnight (Default)' },
    { code: 'oceanic', name: 'Oceanic Blue' },
    { code: 'teal', name: 'Teal Forest' }
  ];

  const wallpapers = [
    { code: 'default', name: 'WhatsApp Default' },
    { code: 'solid_dark', name: 'Solid Dark' },
    { code: 'solid_light', name: 'Solid Light' },
    { code: 'doodle', name: 'Doodle Pattern' }
  ];

  const handleLanguageChange = async (langCode) => {
    try {
      await updateUserProfile({ language: langCode });
      setLanguageModalOpen(false);
    } catch (err) {
      alert('Failed to update spoken language');
    }
  };

  const handleThemeChange = async (themeCode) => {
    try {
      setTheme(themeCode); // Update UI immediately
      await updateUserProfile({ theme: themeCode });
      setThemeModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleWallpaperChange = async (wallpaperCode) => {
    try {
      await updateUserProfile({ chat_wallpaper: wallpaperCode });
      setWallpaperModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAccountConfirm = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      deleteAccount();
    }
  };

  const planName = user?.plan === 'pro' ? 'Pro Plan' : user?.plan === 'elite' ? 'Elite Plan' : 'Basic Plan';
  const minsUsed = user?.translatedMinutesUsedToday || 0;
  const minsLimit = user?.plan === 'elite' ? 1000 : user?.plan === 'pro' ? 300 : 100;

  return (
    <div className={`flex-1 p-4 space-y-4 overflow-y-auto ${isDarkMode ? 'bg-[#0F1829] text-white' : 'bg-slate-50 text-slate-900'}`}>
        {/* Profile Card */}
        <div className={`flex items-center gap-4 p-4 rounded-2xl border shadow-sm ${isDarkMode ? 'bg-[#142036] border-slate-800' : 'bg-white border-slate-200'}`}>
          <img
            src={user?.profile_picture || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user?.phone}
            alt={user?.name}
            className="w-14 h-14 rounded-full object-cover border-2 border-blue-500 shadow"
          />
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-sm truncate">{user?.name}</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{user?.phone}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 uppercase">
                Spoken: {user?.language?.toUpperCase() || 'EN'}
              </span>
            </div>
          </div>
          <button onClick={() => setEditProfileOpen(true)} className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition shadow-sm border border-slate-700">
            <Edit2 className="w-5 h-5" />
          </button>
        </div>

      {/* Subscription Banner (Minutes based) */}
      <div
        onClick={() => onNavigate('storage_plan')}
        className="p-4 rounded-2xl bg-gradient-to-tr from-blue-900/40 to-teal-900/40 border border-blue-600/40 shadow-lg cursor-pointer transition active:scale-95"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <PhoneCall className="w-4 h-4 text-teal-400" />
            {planName}
          </span>
          <span className="text-[10px] text-teal-300 font-semibold bg-teal-950/80 px-2 py-0.5 rounded-full border border-teal-700/50">
            Recharge / Upgrade
          </span>
        </div>

        <div className="space-y-1.5 text-[11px] text-slate-300">
          <div className="flex justify-between">
            <span>Call Translation Minutes</span>
            <span className="font-semibold text-white">{minsUsed}m / {minsLimit}m</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-teal-400 rounded-full"
              style={{ width: `${Math.min(100, Math.max(5, (minsUsed / minsLimit) * 100))}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
            <span>Resets monthly</span>
            <span className="text-cyan-300 font-semibold">100 mins for just 250 BDT</span>
          </div>
        </div>
      </div>

      {/* Settings Options List */}
      <div className={`rounded-2xl border divide-y overflow-hidden shadow-sm ${isDarkMode ? 'bg-[#142036] border-slate-800 divide-slate-800/60' : 'bg-white border-slate-200 divide-slate-100'}`}>
        {/* Spoken Language */}
        <div onClick={() => setLanguageModalOpen(true)} className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-800/20 transition">
          <div className="flex items-center gap-3">
            <Globe className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-semibold">{t('language')}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="text-teal-400 font-bold uppercase">{user?.language || 'EN'}</span>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </div>
        </div>

        {/* Interface Language */}
        <div onClick={() => setAppLanguage(appLanguage === 'bn' ? 'en' : 'bn')} className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-800/20 transition">
          <div className="flex items-center gap-3">
            <Globe className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-semibold">{t('interfaceLang')}</span>
          </div>
          <span className="text-xs font-bold text-blue-400">
            {appLanguage === 'bn' ? 'বাংলা' : 'English'}
          </span>
        </div>

        {/* Appearance Themes */}
        <div onClick={() => setThemeModalOpen(true)} className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-800/20 transition">
          <div className="flex items-center gap-3">
            {isDarkMode ? <Moon className="w-4 h-4 text-cyan-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
            <span className="text-xs font-semibold">{t('theme')}</span>
          </div>
          <span className="text-xs text-slate-400 capitalize">{theme}</span>
        </div>

        {/* Chat Wallpaper */}
        <div onClick={() => setWallpaperModalOpen(true)} className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-800/20 transition">
          <div className="flex items-center gap-3">
            <ImageIcon className="w-4 h-4 text-pink-400" />
            <span className="text-xs font-semibold">Chat Wallpaper</span>
          </div>
          <span className="text-xs text-slate-400 capitalize">{user?.chat_wallpaper || 'Default'}</span>
        </div>
      </div>

      {/* Account Actions */}
      <div className={`rounded-2xl border divide-y overflow-hidden shadow-sm ${isDarkMode ? 'bg-[#142036] border-slate-800 divide-slate-800/60' : 'bg-white border-slate-200 divide-slate-100'}`}>
        <div onClick={logout} className="p-3.5 flex items-center gap-3 cursor-pointer text-slate-400 hover:text-white transition">
          <LogOut className="w-4 h-4" />
          <span className="text-xs font-semibold">Log Out</span>
        </div>
        <div onClick={handleDeleteAccountConfirm} className="p-3.5 flex items-center gap-3 cursor-pointer text-red-400 hover:text-red-300 transition">
          <Trash2 className="w-4 h-4" />
          <span className="text-xs font-semibold">Delete Account</span>
        </div>
      </div>

      {/* Modals */}
      <EditProfileModal isOpen={editProfileOpen} onClose={() => setEditProfileOpen(false)} />

      {/* Language Switch Modal */}
      {languageModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F1829] border border-slate-700 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-teal-400" /> Change Spoken Language
            </h3>
            <div className="space-y-2">
              {spokenLanguages.map((l) => (
                <div key={l.code} onClick={() => handleLanguageChange(l.code)} className={`p-3 rounded-xl border cursor-pointer text-xs font-semibold flex items-center justify-between transition ${user?.language === l.code ? 'bg-teal-500/20 border-teal-500 text-teal-300' : 'bg-[#131D31] border-slate-800 text-slate-300 hover:border-slate-700'}`}>
                  <span>{l.name}</span>
                  {user?.language === l.code && <Check className="w-4 h-4 text-teal-400" />}
                </div>
              ))}
            </div>
            <button onClick={() => setLanguageModalOpen(false)} className="w-full py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs">Cancel</button>
          </div>
        </div>
      )}

      {/* Theme Modal */}
      {themeModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F1829] border border-slate-700 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white">Select Appearance Theme</h3>
            <div className="space-y-2">
              {themes.map((tItem) => (
                <div key={tItem.code} onClick={() => handleThemeChange(tItem.code)} className={`p-3 rounded-xl border cursor-pointer text-xs font-semibold flex items-center justify-between transition ${theme === tItem.code ? 'bg-blue-500/20 border-blue-500 text-blue-300' : 'bg-[#131D31] border-slate-800 text-slate-300 hover:border-slate-700'}`}>
                  <span>{tItem.name}</span>
                  {theme === tItem.code && <Check className="w-4 h-4 text-blue-400" />}
                </div>
              ))}
            </div>
            <button onClick={() => setThemeModalOpen(false)} className="w-full py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs">Cancel</button>
          </div>
        </div>
      )}

      {/* Wallpaper Modal */}
      {wallpaperModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F1829] border border-slate-700 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white">Select Chat Wallpaper</h3>
            <div className="space-y-2">
              {wallpapers.map((w) => (
                <div key={w.code} onClick={() => handleWallpaperChange(w.code)} className={`p-3 rounded-xl border cursor-pointer text-xs font-semibold flex items-center justify-between transition ${user?.chat_wallpaper === w.code ? 'bg-pink-500/20 border-pink-500 text-pink-300' : 'bg-[#131D31] border-slate-800 text-slate-300 hover:border-slate-700'}`}>
                  <span>{w.name}</span>
                  {user?.chat_wallpaper === w.code && <Check className="w-4 h-4 text-pink-400" />}
                </div>
              ))}
            </div>
            <button onClick={() => setWallpaperModalOpen(false)} className="w-full py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
