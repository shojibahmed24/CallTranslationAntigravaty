const fs = require('fs');
const file = 'mobile/src/screens/auth/OtpVerifyScreen.jsx';
let content = fs.readFileSync(file, 'utf8');

const importRegex = /import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]lucide-react['"];/;
const match = content.match(importRegex);
if (match) {
  let imports = match[1].split(',').map(s => s.trim());
  const needed = ['KeyRound', 'ArrowLeft', 'CheckCircle2', 'Loader2', 'RefreshCw', 'AlertCircle', 'TerminalSquare'];
  needed.forEach(n => {
    if (!imports.includes(n)) imports.push(n);
  });
  content = content.replace(importRegex, `import { ${imports.join(', ')} } from 'lucide-react';`);
}

const returnRegex = /return\s*\(\s*<div className=\{`relative[\s\S]*?(?=\n\};\n\nexport default OtpVerifyScreen;)/m;

const newReturn = `return (
    <div className={\`relative min-h-[100dvh] flex flex-col justify-between p-6 max-w-md mx-auto overflow-hidden \${
      isDarkMode ? 'bg-gradient-to-br from-[#0B1224] via-[#111C3A] to-[#0A1020] text-white' : 'bg-gradient-to-br from-[#F8FAFC] via-[#E2E8F0] to-[#F1F5F9] text-slate-900'
    }\`}>
      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{ scale: [1, 1.25, 1], rotate: [0, -90, 0] }} 
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[15%] -right-[15%] w-[70vw] h-[70vw] bg-[#10B981]/25 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.4, 1], rotate: [0, 90, 0] }} 
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[15%] -left-[15%] w-[80vw] h-[80vw] bg-[#4F46E5]/30 rounded-full blur-[120px]"
        />
      </div>

      {/* Top Header */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="relative z-10 pt-4"
      >
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className={\`p-3 rounded-full border backdrop-blur-md shadow-sm transition-colors w-max \${isDarkMode ? 'bg-white/10 border-white/10 hover:bg-white/20' : 'bg-white/60 border-slate-200 hover:bg-white'}\`}
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
      </motion.div>

      {/* Main Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
        className="relative z-10 flex-1 flex flex-col justify-center pb-12"
      >
        <div className="flex flex-col items-center text-center space-y-6 mb-8">
          <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-tr from-blue-600 to-teal-400 shadow-[0_0_40px_-10px_rgba(59,130,246,0.6)]">
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-3xl pointer-events-none"></div>
            <KeyRound className="w-10 h-10 text-white drop-shadow-md z-10" />
            
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
            <h2 className="text-3xl font-black tracking-tight drop-shadow-sm mb-3">Verify Number</h2>
            <p className={\`text-sm font-medium \${isDarkMode ? 'text-slate-300' : 'text-slate-500'}\`}>
              Code sent to <span className={\`inline-flex items-center px-2.5 py-0.5 rounded-full ml-1 text-sm font-bold tracking-wider \${isDarkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-600'}\`}>{phone}</span>
            </p>
          </div>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-start gap-3 p-3.5 mb-6 bg-red-500/10 border-l-4 border-red-500 rounded-r-2xl rounded-l-md text-red-400 text-xs font-medium shadow-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-snug">{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleVerify} className="space-y-8">
          <div className="flex justify-between gap-1.5 sm:gap-2">
            {otp.map((digit, index) => (
              <div key={index} className="relative">
                <motion.input
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  animate={digit ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.2 }}
                  className={\`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-2xl border shadow-inner transition-all outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/50 \${
                    isDarkMode 
                      ? 'bg-[#0B1224]/50 border-white/5 text-white shadow-black/50' 
                      : 'bg-white border-slate-200 text-slate-900 shadow-slate-300/30'
                  } \${digit ? (isDarkMode ? 'border-blue-500/50 bg-blue-500/10' : 'border-blue-400 bg-blue-50') : ''}\`}
                />
                {/* Bottom active bar */}
                <div className={\`absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-1 rounded-t-md transition-all duration-300 \${digit ? 'bg-gradient-to-r from-blue-500 to-teal-400 opacity-100' : 'opacity-0'}\`} />
              </div>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            type="submit"
            disabled={loading || otp.join('').length < 6}
            className="relative w-full py-4 bg-gradient-to-r from-blue-600 via-blue-500 to-teal-400 text-white font-black rounded-2xl text-sm shadow-[0_10px_25px_-5px_rgba(59,130,246,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 overflow-hidden group"
          >
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none" />
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                <span className="tracking-wide">Verify & Continue</span>
                <CheckCircle2 className="w-5 h-5 transition-transform group-hover:scale-110" />
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-8 flex flex-col items-center gap-4">
          <button 
            onClick={handleResend}
            disabled={countdown > 0}
            className={\`relative overflow-hidden inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all \${
              countdown > 0 
                ? (isDarkMode ? 'bg-white/5 text-slate-400 border border-white/5' : 'bg-slate-100 text-slate-500 border border-slate-200')
                : 'bg-gradient-to-r from-blue-500/10 to-teal-500/10 text-blue-500 border border-blue-500/30 hover:bg-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
            }\`}
          >
            {countdown > 0 && (
              <div 
                className="absolute left-0 bottom-0 h-0.5 bg-blue-500/30 transition-all duration-1000 ease-linear" 
                style={{ width: \`\${(countdown / 30) * 100}%\` }} 
              />
            )}
            <RefreshCw className={\`w-3.5 h-3.5 \${countdown > 0 ? '' : 'animate-pulse'}\`} />
            {countdown > 0 ? \`Resend Code in \${countdown}s\` : 'Resend Code Now'}
          </button>

          {(!globalThis.window?.capacitor) && (
            <button
              onClick={handleFillDevDemo}
              className={\`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed text-[10px] font-semibold transition-colors \${
                isDarkMode ? 'border-slate-600 text-slate-500 hover:text-slate-300 hover:border-slate-400' : 'border-slate-300 text-slate-400 hover:text-slate-600 hover:border-slate-400'
              }\`}
            >
              <TerminalSquare className="w-3 h-3" />
              DEV: Fill Demo OTP
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );`;

content = content.replace(returnRegex, newReturn);
fs.writeFileSync(file, content);
console.log('Redesigned OtpVerifyScreen.jsx return block');
