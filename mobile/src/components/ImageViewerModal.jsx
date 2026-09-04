import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, ZoomIn, ZoomOut } from 'lucide-react';

export default function ImageViewerModal({ isOpen, imageUrl, onClose }) {
  const [scale, setScale] = useState(1);

  if (!isOpen || !imageUrl) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'downloaded_image.jpg';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent absolute top-0 w-full z-10">
          <button 
            onClick={() => { setScale(1); onClose(); }} 
            className="p-2 text-white hover:bg-white/20 rounded-full transition"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex gap-4">
            <button 
              onClick={() => setScale(s => s === 1 ? 2 : 1)} 
              className="p-2 text-white hover:bg-white/20 rounded-full transition"
              title="Zoom In/Out"
            >
              {scale === 1 ? <ZoomIn className="w-6 h-6" /> : <ZoomOut className="w-6 h-6" />}
            </button>
            <button 
              onClick={handleDownload} 
              className="p-2 text-white hover:bg-white/20 rounded-full transition"
              title="Download Image"
            >
              <Download className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Image Container */}
        <div 
          className="flex-1 flex items-center justify-center overflow-auto p-4 mt-16" 
          onClick={() => setScale(1)}
        >
          <motion.img 
            animate={{ scale }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            src={imageUrl} 
            className="max-w-full max-h-full object-contain cursor-zoom-in"
            onClick={(e) => {
              e.stopPropagation();
              setScale(s => s === 1 ? 2 : 1);
            }}
            alt="Fullscreen Viewer"
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
