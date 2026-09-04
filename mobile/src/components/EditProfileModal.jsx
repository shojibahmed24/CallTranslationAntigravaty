import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Loader2, Save, User as UserIcon } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function EditProfileModal({ isOpen, onClose }) {
  const { user, updateUserProfile } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [about, setAbout] = useState(user?.status || '');
  const [avatarPreview, setAvatarPreview] = useState(user?.profile_picture || '');
  const [avatarFile, setAvatarFile] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      let finalAvatarUrl = user?.profile_picture;

      // 1. Upload new image if selected
      if (avatarFile) {
        const uploadData = await api.uploadFile(avatarFile, 'profile');
        if (uploadData.success && uploadData.file?.url) {
          finalAvatarUrl = uploadData.file.url;
        } else {
          throw new Error('Image upload failed');
        }
      }

      // 2. Update profile data
      await updateUserProfile({
        name: name.trim(),
        about: about.trim(),
        avatar: finalAvatarUrl
      });
      
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="bg-[#0F1829] border border-slate-800 rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-800/50">
            <h2 className="text-lg font-bold text-white">Edit Profile</h2>
            <button onClick={onClose} disabled={loading} className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center">
              <div 
                className="relative w-28 h-28 rounded-full cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <img 
                  src={avatarPreview || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop'} 
                  alt="Avatar" 
                  className="w-full h-full rounded-full object-cover border-4 border-slate-800 shadow-xl transition group-hover:brightness-75"
                />
                <div className="absolute inset-0 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                  <Camera className="w-8 h-8 text-white" />
                </div>
                <div className="absolute bottom-0 right-0 p-2 bg-blue-500 rounded-full border-2 border-[#0F1829] shadow-lg">
                  <Camera className="w-4 h-4 text-white" />
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleImageSelect}
              />
              <p className="text-xs text-slate-400 mt-3 font-medium">Tap to change picture</p>
            </div>

            {/* Inputs */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Your Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-[#1A263E] text-white pl-11 pr-4 py-3.5 rounded-xl border border-slate-700/50 focus:border-blue-500 focus:outline-none font-medium"
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">About / Status</label>
                <input
                  type="text"
                  value={about}
                  onChange={e => setAbout(e.target.value)}
                  className="w-full bg-[#1A263E] text-white px-4 py-3.5 rounded-xl border border-slate-700/50 focus:border-blue-500 focus:outline-none text-sm"
                  placeholder="Available"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-800/50 bg-[#0A101C]">
            <button
              onClick={handleSave}
              disabled={loading || !name.trim()}
              className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:opacity-50 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
