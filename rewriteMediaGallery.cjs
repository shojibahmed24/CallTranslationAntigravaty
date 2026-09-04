const fs = require('fs');
const file = 'mobile/src/components/ChatMediaGallery.jsx';
let content = fs.readFileSync(file, 'utf8');

const returnStart = content.indexOf('return (');
const isDarkModeLine = content.indexOf('isDarkMode');
if(isDarkModeLine === -1) {
  content = content.replace("const { themeClasses", "const { isDarkMode, themeClasses");
}

const newReturn = `return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={\`fixed inset-0 z-[60] flex flex-col \${isDarkMode ? 'bg-[#0B1220]' : 'bg-[#F8FAFC]'}\`}
          >
            {/* Layered Gradient Background */}
            <div className={\`absolute inset-0 pointer-events-none \${
              isDarkMode ? 'bg-gradient-to-b from-transparent via-[#0F1829]/50 to-[#0D1524]' : 'bg-gradient-to-b from-transparent to-blue-50/50'
            }\`} />

            <div className={\`relative z-10 flex items-center gap-4 p-4 border-b \${isDarkMode ? 'border-white/5' : 'border-slate-200'}\`}>
              <button 
                onClick={onClose} 
                className={\`p-2.5 rounded-full transition-all active:scale-95 \${
                  isDarkMode ? 'bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300' : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-600'
                }\`}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className={\`font-black text-lg bg-clip-text text-transparent bg-gradient-to-r drop-shadow-sm \${
                isDarkMode ? 'from-blue-400 to-teal-400' : 'from-blue-600 to-teal-600'
              }\`}>
                Media, links, and docs
              </h2>
            </div>

            <div className="relative z-10 flex-1 overflow-y-auto p-2 scrollbar-hide">
              {mediaItems && mediaItems.length > 0 ? (
                <motion.div 
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
                  }}
                  className="grid grid-cols-3 gap-1.5"
                >
                  {mediaItems.map((item) => {
                    const url = item.file_url?.startsWith('http') ? item.file_url : \`http://192.168.68.105:5000\${item.file_url}\`;
                    const isImage = item.type === 'image';

                    return isImage ? (
                      <motion.div 
                        variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }}
                        key={item.id} 
                        className={\`aspect-square relative cursor-pointer group rounded-md overflow-hidden shadow-sm border \${
                          isDarkMode ? 'bg-slate-800 border-white/5' : 'bg-slate-200 border-slate-300/50'
                        }\`}
                        onClick={() => setViewerImage(url)}
                      >
                        <img 
                          src={url} 
                          alt="Media" 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </motion.div>
                    ) : (
                      <motion.a 
                        variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }}
                        key={item.id}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={\`aspect-square relative cursor-pointer group flex flex-col items-center justify-center rounded-md border backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 shadow-sm \${
                          isDarkMode 
                            ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:shadow-[0_4px_15px_rgba(255,255,255,0.05)]' 
                            : 'bg-white/70 border-slate-200 hover:bg-white hover:shadow-[0_4px_15px_rgba(0,0,0,0.05)]'
                        }\`}
                        title="Download File"
                      >
                        <div className={\`p-3 rounded-full mb-2 transition-colors duration-300 \${
                          isDarkMode ? 'bg-blue-500/20 group-hover:bg-blue-500/30' : 'bg-blue-100 group-hover:bg-blue-200'
                        }\`}>
                          <FileText className={\`w-6 h-6 drop-shadow-sm \${isDarkMode ? 'text-blue-400' : 'text-blue-600'}\`} />
                        </div>
                        <span className={\`text-[10px] font-bold truncate w-11/12 text-center px-1 \${
                          isDarkMode ? 'text-slate-300 group-hover:text-white' : 'text-slate-600 group-hover:text-slate-900'
                        }\`}>
                          {item.text || 'Document'}
                        </span>
                      </motion.a>
                    );
                  })}
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-6 pb-20">
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className={\`w-28 h-28 rounded-full flex items-center justify-center border shadow-[0_0_40px_rgba(45,212,191,0.15)] \${
                      isDarkMode ? 'bg-gradient-to-tr from-blue-500/10 to-teal-400/10 border-teal-500/20' : 'bg-gradient-to-tr from-blue-50 to-teal-50 border-teal-200'
                    }\`}
                  >
                    <ImageIcon className={\`w-10 h-10 \${isDarkMode ? 'text-teal-500/50' : 'text-teal-400'}\`} />
                  </motion.div>
                  <p className={\`text-sm font-black uppercase tracking-widest \${isDarkMode ? 'text-slate-400' : 'text-slate-500'}\`}>No media found</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ImageViewerModal 
        isOpen={!!viewerImage} 
        imageUrl={viewerImage} 
        onClose={() => setViewerImage(null)} 
      />
    </>
  );
`;

content = content.substring(0, returnStart) + newReturn + '\n}';
content = content.replace('if (!isOpen) return null;', '');

fs.writeFileSync(file, content);
console.log('Replaced return block in ChatMediaGallery');
