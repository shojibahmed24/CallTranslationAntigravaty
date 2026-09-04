const fs = require('fs');
const file = 'mobile/src/screens/auth/PhoneLoginScreen.jsx';
let content = fs.readFileSync(file, 'utf8');

// The file likely imports Globe, Loader2, ArrowRight, CheckCircle2, Phone, Shield, AlertCircle
// We need to make sure we have Phone, Shield, AlertCircle from lucide-react.
const importRegex = /import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]lucide-react['"];/;
const match = content.match(importRegex);
if (match) {
  let imports = match[1].split(',').map(s => s.trim());
  const needed = ['Phone', 'Shield', 'AlertCircle', 'Globe', 'Loader2', 'ArrowRight', 'CheckCircle2'];
  needed.forEach(n => {
    if (!imports.includes(n)) imports.push(n);
  });
  content = content.replace(importRegex, `import { ${imports.join(', ')} } from 'lucide-react';`);
}

const returnRegex = /return\s*\(\s*<div className=\{`relative[\s\S]*?(?=\n\};\n\nexport default PhoneLoginScreen;)/m;

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
        className="relative z-10 pt-12 pb-6 text-center space-y-5"
      >
        <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-tr from-blue-600 to-teal-400 shadow-[0_0_40px_-10px_rgba(59,130,246,0.6)]">
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-3xl pointer-events-none"></div>
          <Globe className="w-12 h-12 text-white drop-shadow-md z-10" />
          
          {/* Double Pulse Rings */}
          <motion.div 
            animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-3xl border-2 border-white/40"
          />
          <motion.div 
            animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
            className="absolute inset-0 rounded-3xl border-2 border-white/20"
          />
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-300 drop-shadow-[0_2px_10px_rgba(59,130,246,0.3)]">{t('appName')}</h1>
          <p className={\`text-sm font-medium mt-2 \${isDarkMode ? 'text-slate-300' : 'text-slate-500'}\`}>{t('tagline')}</p>
        </div>
      </motion.div>

      {/* Login Form Box - Elevated Glass Card */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1, type: "spring", bounce: 0.3 }}
        className={\`relative z-10 p-7 rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),0_0_20px_rgba(59,130,246,0.1)] space-y-7 my-auto backdrop-blur-2xl \${
          isDarkMode ? 'bg-[#1E293B]/60' : 'bg-white/70'
        }\`}
      >
        {/* Pseudo gradient border */}
        <div className="absolute inset-0 rounded-[2rem] border border-transparent pointer-events-none" style={{ background: \`linear-gradient(\${isDarkMode ? '#1E293B' : '#ffffff'}, \${isDarkMode ? '#1E293B' : '#ffffff'}) padding-box, linear-gradient(to bottom right, rgba(255,255,255,0.3), rgba(255,255,255,0.05)) border-box\` }}></div>

        {/* Segmented Control */}
        <div className={\`relative flex p-1 rounded-2xl \${isDarkMode ? 'bg-black/40 shadow-inner' : 'bg-slate-200/50 shadow-inner'}\`}>
          {['login', 'register'].map((tab) => (
            <button 
              key={tab}
              type="button"
              onClick={() => { setMode(tab); setError(''); }}
              className={\`relative flex-1 py-2.5 text-sm font-bold rounded-xl transition-colors z-10 \${mode === tab ? 'text-white' : (isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700')}\`}
            >
              {mode === tab && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-blue-500 to-teal-400 rounded-xl -z-10 shadow-md"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              {tab === 'login' ? 'Login' : 'Sign Up'}
            </button>
          ))}
        </div>

        <div className="text-center relative z-10">
          <h2 className="text-2xl font-black tracking-tight">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
          <p className={\`text-xs font-medium mt-2 px-2 \${isDarkMode ? 'text-slate-400' : 'text-slate-500'}\`}>
            {mode === 'login' 
              ? 'Enter your mobile number to log in securely.' 
              : 'Enter your mobile number to join globally. We\\'ll send a verification code.'}
          </p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="relative z-10 flex items-start gap-3 p-3.5 bg-red-500/10 border-l-4 border-red-500 rounded-r-2xl rounded-l-md text-red-400 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-snug">{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSendOtp} className="space-y-6 relative z-10">
          <div id="recaptcha-container"></div>
          <div className="flex gap-3">
            <div className={\`relative flex items-center rounded-2xl border shadow-inner transition-all focus-within:ring-2 focus-within:ring-teal-400/50 focus-within:border-teal-400/50 \${
                isDarkMode ? 'bg-[#0B1224]/50 border-white/5 shadow-black/50' : 'bg-slate-100 border-slate-200 shadow-slate-300/30'
            }\`}>
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className={\`w-28 pl-4 pr-2 py-4 rounded-2xl text-sm font-bold appearance-none bg-transparent outline-none \${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }\`}
              >
                {countryList.map((c) => (
                  <option key={c.code} value={c.code} className="text-slate-900">
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>
            </div>

            <div className={\`relative flex-1 flex items-center rounded-2xl border shadow-inner transition-all focus-within:ring-2 focus-within:ring-teal-400/50 focus-within:border-teal-400/50 \${
              isDarkMode ? 'bg-[#0B1224]/50 border-white/5 shadow-black/50' : 'bg-slate-100 border-slate-200 shadow-slate-300/30'
            }\`}>
              <Phone className={\`absolute left-4 w-4 h-4 \${isDarkMode ? 'text-slate-500' : 'text-slate-400'}\`} />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\\D/g, ''))}
                placeholder="1811223344"
                required
                className={\`w-full pl-11 pr-4 py-4 bg-transparent rounded-2xl text-base font-bold tracking-widest outline-none \${
                  isDarkMode ? 'text-white placeholder-slate-600' : 'text-slate-900 placeholder-slate-400'
                }\`}
              />
            </div>
          </div>

          <div className={\`flex items-center justify-between p-3.5 rounded-2xl border \${isDarkMode ? 'bg-[#0B1224]/50 border-blue-500/20' : 'bg-blue-50 border-blue-100'}\`}>
            <span className={\`text-sm font-medium \${isDarkMode ? 'text-slate-300' : 'text-slate-600'}\`}>
              <span className="text-blue-500 font-bold">Test Mode</span> (Bypass SMS)
            </span>
            <button 
              type="button"
              onClick={() => setIsTestMode(!isTestMode)}
              className={\`relative inline-flex h-7 w-12 items-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 \${isTestMode ? (isDarkMode ? 'bg-gradient-to-r from-blue-500 to-teal-400' : 'bg-gradient-to-r from-blue-500 to-teal-400') : (isDarkMode ? 'bg-slate-700' : 'bg-slate-300')}\`}
            >
              <span className={\`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm \${isTestMode ? 'translate-x-6' : 'translate-x-1'}\`} />
            </button>
          </div>

          <motion.button
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            type="submit"
            disabled={loading || !phoneNumber.trim()}
            className="relative w-full py-4.5 bg-gradient-to-r from-blue-600 via-blue-500 to-teal-400 text-white font-black rounded-2xl text-sm shadow-[0_10px_25px_-5px_rgba(59,130,246,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 overflow-hidden group"
          >
            {/* Hover Shine Effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none" />
            
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span className="tracking-wide">Send OTP Code</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </motion.button>
        </form>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="relative z-10 pb-4 pt-8 flex justify-center"
      >
        <div className={\`flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-md \${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-200/50 border-slate-300'}\`}>
          <Shield className="w-4 h-4 text-teal-400 drop-shadow-[0_0_5px_rgba(45,212,191,0.5)]" />
          <span className={\`text-xs font-bold \${isDarkMode ? 'text-slate-300' : 'text-slate-600'}\`}>End-to-End Encrypted Identity</span>
        </div>
      </motion.div>
    </div>
  );`;

content = content.replace(returnRegex, newReturn);
fs.writeFileSync(file, content);
console.log('Redesigned PhoneLoginScreen.jsx return block');
