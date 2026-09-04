import React, { useState, useRef, useEffect } from 'react';
import { Reply } from 'lucide-react';

export default function SwipeableMessage({ children, onReply, isMe }) {
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const maxSwipe = 60; // Max pixels to swipe
  const threshold = 40; // Pixels to trigger reply

  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    currentX.current = e.touches[0].clientX;
    const diff = currentX.current - startX.current;

    // Only allow swipe to the left if 'isMe', right if not 'isMe'
    // Actually standard WhatsApp: Swipe right to reply to ANY message
    if (diff > 0 && diff < maxSwipe + 20) {
      setOffset(diff);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (offset > threshold) {
      onReply(); // Trigger reply
    }
    setOffset(0);
  };

  return (
    <div 
      className="relative w-full flex items-center"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ overflow: 'visible' }}
    >
      {/* Reply Icon Background */}
      <div 
        className="absolute left-0 h-full flex items-center pl-3"
        style={{ 
          opacity: offset / threshold,
          transform: `scale(${Math.min(offset / threshold, 1)})`
        }}
      >
        <div className="w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center">
          <Reply className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Message Content Container */}
      <div 
        className="w-full transition-transform duration-200 ease-out flex flex-col group relative"
        style={{ 
          transform: `translateX(${offset}px)`,
          transitionDuration: isDragging ? '0ms' : '200ms',
          alignItems: isMe ? 'flex-end' : 'flex-start'
        }}
      >
        {children}
      </div>
    </div>
  );
}
