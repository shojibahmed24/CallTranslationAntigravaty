import React, { useState, useRef } from 'react';
import { User, Languages, Check, ArrowRight, Camera } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';

export default function ProfileSetupScreen({ onComplete }) {
  const { user, updateUserProfile } = useAuth();
  const { isDarkMode } = useTheme();

  const [name, setName] = useState(user?.name || '');
  const [language, setLanguage] = useState(user?.language || 'bn');
  const [about, setAbout] = useState(user?.about || 'Using UNICOM for global real-time communication');
  const [selectedAvatar, setSelectedAvatar] = useState(
    user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop'
  );
  const [loading, setLoading] = useState(false);

  const avatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop'
  ];

  const languagesList = [
    { code: 'bn', name: 'বাংলা (Bengali)', subtitle: 'Primary spoken language in BD & WB' },
    { code: 'en', name: 'English (US/UK)', subtitle: 'Global international language' },
    { code: 'hi', name: 'हिन्दी (Hindi)', subtitle: 'Primary spoken language in India' },
    { code: 'ar', name: 'العربية (Arabic)', subtitle: 'Middle East & Gulf region' }
  ];

  const fileInputRef = useRef(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Avatar size must be less than 5MB');
      return;
    }

    try {
      setUploadingAvatar(true);
      const res = await api.uploadFile(file, 'profile');
      setSelectedAvatar(res.file.url);
    } catch (err) {
      alert('Avatar upload failed: ' + err.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await updateUserProfile({
        name: name.trim(),
        language,
        about: about.trim(),
        avatar: selectedAvatar
      });
      onComplete();
    } catch (err) {
      alert('Failed to save profile: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-[100dvh] flex flex-col justify-between p-6 max-w-md mx-auto ${
      isDarkMode ? 'bg-[#080E18] text-white' : 'bg-[#F8FAFC] text-slate-900'
    }`}>
      <div className="pt-6 space-y-2">
        <h1 className="text-xl font-bold">Set Up Your UNICOM Profile</h1>
        <p className="text-xs text-slate-400">
          Choose your native language for automatic voice call interpretation.
        </p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-5 my-auto">
        {/* Avatar Picker */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
            <img
              src={selectedAvatar}
              alt="Avatar"
              className={`w-24 h-24 rounded-full object-cover border-4 border-blue-500 shadow-xl transition-all ${uploadingAvatar ? 'opacity-50' : 'group-hover:brightness-75'}`}
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-8 h-8 text-white drop-shadow-md" />
            </div>
            {uploadingAvatar && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-bold text-white bg-black/60 px-2 py-1 rounded-full">Uploading...</span>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleAvatarUpload} 
              className="hidden" 
              accept="image/*" 
            />
          </div>

          <div className="text-xs text-slate-400 font-semibold mt-1">Tap image to upload from gallery</div>

          <div className="flex gap-2 mt-2">
            {avatars.map((av, idx) => (
              <img
                key={idx}
                src={av}
                alt="Option"
                onClick={() => setSelectedAvatar(av)}
                className={`w-9 h-9 rounded-full object-cover cursor-pointer border-2 transition ${
                  selectedAvatar === av ? 'border-teal-400 scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Name Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Your Full Name (Required)</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Rahim Ahmed"
            required
            className={`w-full px-4 py-3 rounded-2xl text-sm font-semibold border transition focus:outline-none focus:border-blue-500 ${
              isDarkMode ? 'bg-[#142036] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
            }`}
          />
        </div>

        {/* Spoken Language Picker */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
            <Languages className="w-4 h-4 text-teal-400" />
            Your Spoken Language (Required for Call Interpretation)
          </label>

          <div className="space-y-2">
            {languagesList.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <div
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                      : isDarkMode
                      ? 'bg-[#131D31] border-slate-800 text-slate-300 hover:border-slate-700'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <p className="font-bold text-xs">{lang.name}</p>
                    <p className="text-[10px] text-slate-400">{lang.subtitle}</p>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-teal-400" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bio / About */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">About / Status</label>
          <input
            type="text"
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            className={`w-full px-4 py-2.5 rounded-2xl text-xs border transition focus:outline-none focus:border-blue-500 ${
              isDarkMode ? 'bg-[#142036] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
            }`}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white font-bold rounded-2xl text-xs shadow-lg shadow-blue-600/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? 'Setting up...' : 'Start Communicating'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
