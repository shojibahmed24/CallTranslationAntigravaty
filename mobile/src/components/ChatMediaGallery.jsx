import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Image as ImageIcon, FileText } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import ImageViewerModal from './ImageViewerModal';

export default function ChatMediaGallery({ isOpen, onClose, mediaItems }) {
  const { themeClasses = { bg: 'bg-[#0D1524]', text: 'text-white', border: 'border-slate-800' } } = useTheme() || {};
  const [viewerImage, setViewerImage] = useState(null);

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={`fixed inset-0 z-[60] flex flex-col ${themeClasses.bg}`}
        >
          <div className={`flex items-center gap-4 p-4 border-b ${themeClasses.border}`}>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-800/20 transition">
              <ArrowLeft className={`w-5 h-5 ${themeClasses.text}`} />
            </button>
            <h2 className={`font-bold text-lg ${themeClasses.text}`}>Media, links, and docs</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-1">
            {mediaItems && mediaItems.length > 0 ? (
              <div className="grid grid-cols-3 gap-1">
                {mediaItems.map((item) => {
                  const url = item.file_url?.startsWith('http') ? item.file_url : `http://192.168.68.105:5000${item.file_url}`;
                  const isImage = item.type === 'image';

                  return isImage ? (
                    <div 
                      key={item.id} 
                      className="aspect-square bg-slate-800 relative cursor-pointer group"
                      onClick={() => setViewerImage(url)}
                    >
                      <img 
                        src={url} 
                        alt="Media" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <a 
                      key={item.id}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="aspect-square bg-slate-800/40 relative cursor-pointer group flex flex-col items-center justify-center border border-slate-700/50 hover:bg-slate-800/60 transition"
                      title="Download File"
                    >
                      <FileText className="w-8 h-8 text-blue-400 mb-2" />
                      <span className="text-[10px] text-slate-300 truncate w-11/12 text-center px-1">
                        {item.text || 'Document'}
                      </span>
                    </a>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
                <div className="w-24 h-24 rounded-full bg-slate-800/20 flex items-center justify-center">
                  <ImageIcon className="w-10 h-10 opacity-30" />
                </div>
                <p className="font-medium">No media found</p>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <ImageViewerModal 
        isOpen={!!viewerImage} 
        imageUrl={viewerImage} 
        onClose={() => setViewerImage(null)} 
      />
    </>
  );
}
