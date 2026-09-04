const fs = require('fs');
const file = 'mobile/src/components/ImageViewerModal.jsx';
let content = fs.readFileSync(file, 'utf8');

const returnStart = content.indexOf('return (');

const newReturn = `return (
    <AnimatePresence>
      {isOpen && imageUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between p-5 bg-gradient-to-b from-black/80 via-black/40 to-transparent backdrop-blur-sm absolute top-0 w-full z-10">
            <button 
              onClick={() => { setScale(1); onClose(); }} 
              className="p-2.5 text-white bg-white/5 border border-white/10 hover:bg-white/20 rounded-full transition-all active:scale-90"
            >
              <X className="w-5 h-5 drop-shadow-sm" />
            </button>
            
            <div className="flex gap-4">
              <button 
                onClick={() => setScale(s => s === 1 ? 2 : 1)} 
                className="p-2.5 text-white bg-white/5 border border-white/10 hover:bg-white/20 rounded-full transition-all active:scale-90"
                title="Zoom In/Out"
              >
                {scale === 1 ? <ZoomIn className="w-5 h-5 drop-shadow-sm" /> : <ZoomOut className="w-5 h-5 drop-shadow-sm" />}
              </button>
              <button 
                onClick={handleDownload} 
                className="p-2.5 text-white bg-white/5 border border-white/10 hover:bg-white/20 rounded-full transition-all active:scale-90"
                title="Download Image"
              >
                <Download className="w-5 h-5 drop-shadow-sm" />
              </button>
            </div>
          </div>

          {/* Image Container */}
          <div 
            className="flex-1 flex items-center justify-center overflow-auto p-4 pt-20" 
            onClick={() => setScale(1)}
          >
            <motion.img 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              src={imageUrl} 
              className="max-w-full max-h-full object-contain cursor-zoom-in drop-shadow-[0_0_40px_rgba(255,255,255,0.08)]"
              style={{ cursor: scale === 1 ? 'zoom-in' : 'zoom-out' }}
              onClick={(e) => {
                e.stopPropagation();
                setScale(s => s === 1 ? 2 : 1);
              }}
              alt="Fullscreen Viewer"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
`;

content = content.substring(0, returnStart) + newReturn + '\n}';
content = content.replace('if (!isOpen || !imageUrl) return null;', '');

fs.writeFileSync(file, content);
console.log('Replaced return block in ImageViewerModal');
