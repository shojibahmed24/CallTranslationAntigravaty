const fs = require('fs');
const file = 'mobile/src/screens/auth/ProfileSetupScreen.jsx';
let content = fs.readFileSync(file, 'utf8');

// Ensure necessary imports are present
const importRegex = /import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]lucide-react['"];/;
const match = content.match(importRegex);
if (match) {
  let imports = match[1].split(',').map(s => s.trim());
  const needed = ['Camera', 'Languages', 'Check', 'ArrowRight', 'User', 'Loader2', 'Upload'];
  needed.forEach(n => {
    if (!imports.includes(n)) imports.push(n);
  });
  content = content.replace(importRegex, `import { ${imports.join(', ')} } from 'lucide-react';`);
}

// Add motion import if not present
if (!content.includes("import { motion } from 'framer-motion';")) {
  content = content.replace("import React,", "import React,\nimport { motion } from 'framer-motion';\nimport React,"); // oops wait, just replace import React with both
  content = content.replace("import React, { useState, useRef } from 'react';", "import React, { useState, useRef } from 'react';\nimport { motion } from 'framer-motion';");
}


const returnRegex = /return\s*\(\s*<div className=\{`min-h-\[100dvh\][\s\S]*?(?=\n\};\n\nexport default ProfileSetupScreen;)/m;

const newReturn = `return (
    <div className={\`relative min-h-[100dvh] flex flex-col justify-between p-6 max-w-md mx-auto overflow-hidden \${
      isDarkMode ? 'bg-gradient-to-br from-[#0B1224] via-[#111C3A] to-[#0A1020] text-white' : 'bg-gradient-to-br from-[#F8FAFC] via-[#E2E8F0] to-[#F1F5F9] text-slate-900'
    }\`}>
      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{ scale: [1, 1.25, 1], rotate: [0, 90, 0] }} 
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[15%] -left-[15%] w-[70vw] h-[70vw] bg-[#4F46E5]/30 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.4, 1], rotate: [0, -90, 0] }} 
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[15%] -right-[15%] w-[80vw] h-[80vw] bg-[#10B981]/25 rounded-full blur-[120px]"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 pt-6 space-y-3"
      >
        <h1 className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400 drop-shadow-[0_2px_10px_rgba(59,130,246,0.3)]">
          Set Up Your UNICOM Profile
        </h1>
        <p className={\`text-sm font-medium leading-relaxed \${isDarkMode ? 'text-slate-400' : 'text-slate-500'}\`}>
          Choose your native language for automatic voice call interpretation.
        </p>
      </motion.div>

      <form onSubmit={handleSaveProfile} className="relative z-10 space-y-7 my-auto pb-6">
        
        {/* Avatar Picker */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-col items-center gap-5 mt-6"
        >
          <div className="relative cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
            <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-blue-600 to-teal-400 opacity-80 blur-md shadow-2xl shadow-blue-500/40 pointer-events-none transition-all group-hover:scale-105" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-600 to-teal-400 p-[3px]">
              <img
                src={selectedAvatar}
                alt="Avatar"
                className={\`w-28 h-28 rounded-full object-cover border-4 \${isDarkMode ? 'border-[#0A1020]' : 'border-[#F8FAFC]'} shadow-xl transition-all duration-300 \${uploadingAvatar ? 'opacity-50' : 'group-hover:brightness-50'}\`}
              />
            </div>
            
            {/* Hover Camera Icon */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-full border border-white/30 shadow-lg">
                <Camera className="w-6 h-6 text-white drop-shadow-md" />
              </div>
            </div>
            
            {/* Uploading State */}
            {uploadingAvatar && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-full backdrop-blur-sm z-10">
                <Loader2 className="w-7 h-7 text-white animate-spin mb-1" />
                <span className="text-[9px] uppercase tracking-wider font-bold text-white bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-md">Uploading</span>
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

          <div className={\`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors \${isDarkMode ? 'bg-white/5 text-slate-300 hover:bg-white/10' : 'bg-slate-200/50 text-slate-600 hover:bg-slate-200'}\`}>
            <Upload className="w-3.5 h-3.5" />
            Tap image to upload from gallery
          </div>

          <div className="flex gap-3 mt-1">
            {avatars.map((av, idx) => (
              <div key={idx} className="relative">
                <img
                  src={av}
                  alt="Option"
                  onClick={() => setSelectedAvatar(av)}
                  className={\`w-10 h-10 rounded-full object-cover cursor-pointer transition-all duration-300 \${
                    selectedAvatar === av 
                      ? 'scale-110 ring-2 ring-teal-400 ring-offset-2 ring-offset-transparent shadow-[0_0_15px_rgba(45,212,191,0.5)] brightness-110' 
                      : 'border-2 border-transparent opacity-60 hover:opacity-100 hover:-translate-y-0.5 hover:brightness-110'
                  }\`}
                />
                {selectedAvatar === av && (
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', bounce: 0.5 }}
                    className="absolute -bottom-1 -right-1 bg-gradient-to-br from-blue-500 to-teal-400 rounded-full p-0.5 shadow-sm border border-[#0B1224]"
                  >
                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Name Input */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-2">
            <User className="w-3.5 h-3.5" />
            Your Full Name (Required)
          </label>
          <div className={\`relative flex items-center rounded-2xl border shadow-inner transition-all duration-200 focus-within:ring-2 focus-within:ring-teal-400/50 focus-within:border-teal-400/50 \${
            isDarkMode ? 'bg-white/5 border-white/10 shadow-black/50 backdrop-blur-sm' : 'bg-white/60 border-slate-200 shadow-slate-300/30 backdrop-blur-sm'
          }\`}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahim Ahmed"
              required
              className={\`w-full px-4 py-3.5 bg-transparent rounded-2xl text-sm font-bold outline-none transition-colors \${
                isDarkMode ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'
              }\`}
            />
          </div>
        </motion.div>

        {/* Spoken Language Picker */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-3">
            <div className="p-1 rounded-full bg-teal-500/10 shadow-[0_0_10px_rgba(45,212,191,0.2)]">
              <Languages className="w-3.5 h-3.5 text-teal-400" />
            </div>
            Your Spoken Language (Required)
          </label>

          <div className="space-y-2.5">
            {languagesList.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <motion.div
                  key={lang.code}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setLanguage(lang.code)}
                  className={\`relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between overflow-hidden \${
                    isSelected
                      ? (isDarkMode ? 'bg-gradient-to-r from-blue-600/20 to-teal-500/10 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)] text-white' : 'bg-gradient-to-r from-blue-500/10 to-teal-400/10 border-blue-400 shadow-[0_4px_15px_rgba(59,130,246,0.1)] text-slate-900')
                      : (isDarkMode ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20' : 'bg-white/60 border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300')
                  }\`}
                >
                  <div className="relative z-10">
                    <p className="font-bold text-sm">{lang.name}</p>
                    <p className={\`text-[11px] mt-0.5 \${isSelected ? (isDarkMode ? 'text-blue-200/80' : 'text-blue-600/80') : 'text-slate-400'}\`}>{lang.subtitle}</p>
                  </div>
                  
                  {isSelected && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', bounce: 0.5 }}
                      className="relative z-10 w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center shadow-md border border-white/20"
                    >
                      <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                    </motion.div>
                  )}
                  
                  {/* Subtle active glow background */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-teal-400/5 pointer-events-none" />
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Bio / About */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
            About / Status
          </label>
          <div className={\`relative flex items-center rounded-2xl border shadow-inner transition-all duration-200 focus-within:ring-2 focus-within:ring-teal-400/30 focus-within:border-teal-400/30 \${
            isDarkMode ? 'bg-white/[0.03] border-white/5 shadow-black/30 backdrop-blur-sm' : 'bg-white/40 border-slate-200 shadow-slate-300/10 backdrop-blur-sm'
          }\`}>
            <input
              type="text"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              className={\`w-full px-4 py-3 bg-transparent rounded-2xl text-xs font-semibold outline-none transition-colors \${
                isDarkMode ? 'text-white placeholder-slate-600' : 'text-slate-900 placeholder-slate-400'
              }\`}
            />
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          type="submit"
          disabled={loading || !name.trim()}
          className={\`relative w-full py-4 mt-2 bg-gradient-to-r from-blue-600 via-blue-500 to-teal-400 text-white font-black rounded-2xl text-sm shadow-[0_10px_25px_-5px_rgba(59,130,246,0.5)] transition-all flex items-center justify-center gap-2 overflow-hidden group \${
            (loading || !name.trim()) ? 'opacity-40 shadow-none hover:scale-100 cursor-not-allowed' : ''
          }\`}
        >
          {!(loading || !name.trim()) && (
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none" />
          )}
          
          <span className="tracking-wide">{loading ? 'Setting up...' : 'Start Communicating'}</span>
          {!loading && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
        </motion.button>
      </form>
    </div>
  );`;

content = content.replace(returnRegex, newReturn);
fs.writeFileSync(file, content);
console.log('Redesigned ProfileSetupScreen.jsx');
