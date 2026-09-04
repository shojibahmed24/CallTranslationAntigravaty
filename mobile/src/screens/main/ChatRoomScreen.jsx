import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import EmojiPicker from 'emoji-picker-react';
import { 
  ArrowLeft, Phone, Video, MoreVertical, Send, Paperclip, 
  Image as ImageIcon, FileText, Check, CheckCheck, 
  Smile, Trash2, Download, AlertCircle, X, Mic, Square, Loader2, Camera,
  CornerUpLeft, Copy, Pin, Star, Forward
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useCall } from '../../context/CallContext';
import { cacheMessages, getCachedMessages } from '../../services/db';
import { encryptMessage, decryptMessage } from '../../utils/cryptoUtils';
import imageCompression from 'browser-image-compression';
import ContactProfileScreen from '../../components/ContactProfileScreen';
import ImageViewerModal from '../../components/ImageViewerModal';

const SwipeableMessage = ({ children, isMe, onReply, onLongPress, isSelected, onClick }) => {
  const [isPressing, setIsPressing] = useState(false);
  const timerRef = useRef(null);

  const startPress = () => {
    setIsPressing(true);
    timerRef.current = setTimeout(() => {
      onLongPress();
      setIsPressing(false);
    }, 500);
  };

  const cancelPress = () => {
    setIsPressing(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  return (
    <div 
      className={`flex ${isMe ? 'justify-end' : 'justify-start'} relative cursor-pointer`}
      onTouchStart={startPress}
      onTouchEnd={cancelPress}
      onTouchMove={cancelPress}
      onMouseDown={startPress}
      onMouseUp={cancelPress}
      onMouseLeave={cancelPress}
      onContextMenu={(e) => { e.preventDefault(); onLongPress(); }}
      onClick={() => {
        if (isPressing && onClick) {
           cancelPress();
           onClick();
        } else if (onClick) onClick();
      }}
    >
      {isSelected && (
        <div className="absolute inset-0 bg-blue-500/20 z-0 pointer-events-none -mx-4" style={{ width: '100vw', left: '50%', transform: 'translateX(-50%)' }} />
      )}
      <div className={`relative z-10 w-full flex ${isMe ? 'justify-end' : 'justify-start'}`}>
        {children}
      </div>
    </div>
  );
};

export default function ChatRoomScreen({ contact, onBack }) {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const { startVoiceCall, socket } = useCall();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [replyTo, setReplyTo] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewerImage, setViewerImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showEmojiKeyboard, setShowEmojiKeyboard] = useState(false);
  const [showEmojiPickerFor, setShowEmojiPickerFor] = useState(null);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Voice Notes
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // New states for real-time whatsapp features
  const [isTyping, setIsTyping] = useState(false);
  const [isPeerOnline, setIsPeerOnline] = useState(contact.onlineStatus === 'online');

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const decryptMessageList = async (msgList) => {
    return await Promise.all(msgList.map(async (m) => {
      if (m.text) {
        m.text = await decryptMessage(m.text, user.id, contact.id);
      }
      return m;
    }));
  };

  const fetchMessages = async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1 && !append) {
        const cached = await getCachedMessages(contact.id);
        if (cached && cached.length > 0) setMessages(cached);
      }
      
      const res = await api.getMessages(contact.id, pageNum);
      const fetched = res.messages || [];
      const decrypted = await decryptMessageList(fetched);
      
      if (fetched.length < 50) setHasMore(false);
      
      if (append) {
        // Prepend because older messages are returned in ascending order
        setMessages(prev => {
          const newArr = [...decrypted, ...prev];
          return newArr.filter((v,i,a)=>a.findIndex(t=>(t.id===v.id))===i);
        });
      } else {
        setMessages(decrypted);
        await cacheMessages(contact.id, decrypted);
      }
    } catch (err) {
      console.error('Fetch msgs error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = () => {
    if (containerRef.current.scrollTop === 0 && hasMore && !loading) {
      setPage(p => p + 1);
    }
  };

  useEffect(() => {
    if (page > 1) {
      fetchMessages(page, true);
    }
  }, [page]);
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Polling backup
    return () => clearInterval(interval);
  }, [contact.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Real-time Socket Listeners for Messages, Status, Typing and Online status
  useEffect(() => {
    if (!socket) return;

    const handleTyping = (data) => {
      if (data.senderId === contact.id) setIsTyping(data.isTyping);
    };

    const handlePresence = (data) => {
      if (data.userId === contact.id) setIsPeerOnline(data.status === 'online');
    };

    const handleMessageReceived = async (msg) => {
      // If we receive a message from the person we are chatting with
      if (msg.senderId === contact.id) {
        if (msg.text) {
          msg.text = await decryptMessage(msg.text, user.id, contact.id);
        }
        setMessages(prev => {
          if (prev.find(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        
        // Acknowledge read immediately since we are in the chat room
        socket.emit('message:read', { messageIds: [msg.id], senderId: msg.senderId });
        api.request('/chat/read', { method: 'POST', body: JSON.stringify({ chatId: msg.chatId }) }).catch(e => {});
      }
    };

    const handleStatusUpdate = ({ messageId, status }) => {
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, status } : m));
    };

    const handleReadReceipt = ({ messageIds }) => {
      setMessages(prev => prev.map(m => messageIds.includes(m.id) ? { ...m, status: 'read' } : m));
    };

    socket.on('typing:status', handleTyping);
    socket.on('user:presence_changed', handlePresence);
    socket.on('message:received', handleMessageReceived);
    socket.on('message:status_update', handleStatusUpdate);
    socket.on('message:read_receipt', handleReadReceipt);

    // On mount, if we have unread messages from them, mark as read
    api.request('/chat/read', { method: 'POST', body: JSON.stringify({ chatId: contact.chatId }) }).catch(e => {});

    return () => {
      socket.off('typing:status', handleTyping);
      socket.off('user:presence_changed', handlePresence);
      socket.off('message:received', handleMessageReceived);
      socket.off('message:status_update', handleStatusUpdate);
      socket.off('message:read_receipt', handleReadReceipt);
    };
  }, [socket, contact.id, user.id]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    
    // Emit typing start
    if (socket) {
      socket.emit('typing:start', { senderId: user.id, receiverId: contact.id });
      
      // Clear previous timeout
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      
      // Emit typing stop after 1.5s of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing:stop', { senderId: user.id, receiverId: contact.id });
      }, 1500);
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !isRecording) return;

    if (socket && typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      socket.emit('typing:stop', { senderId: user.id, receiverId: contact.id });
    }

    try {
      let sendText = inputText;
      if (replyTo) {
         const qt = (replyTo.text || replyTo.fileName || 'Media').replace(/_REPLY_\[\[.*?\]\]_REPLY_ /g, '').substring(0, 80).replace(/\n/g, ' ');
         sendText = `_REPLY_[[${replyTo.id}|||${replyTo.senderId}|||${qt}]]_REPLY_ ${inputText}`;
      }

      // E2EE Encrypt
      const encryptedText = await encryptMessage(sendText, user.id, contact.id);

      const res = await api.sendMessage({
        receiverId: contact.isGroup ? undefined : contact.id,
        chatId: contact.isGroup ? contact.id : undefined,
        text: encryptedText, 
        mediaType: 'text', 
        replyToId: replyTo?.id
      });
      
      // Keep plaintext locally for instant UI update
      const localMessage = { ...res.message, text: sendText };
      
      const newMsgs = [...messages, localMessage];
      setMessages(newMsgs);
      cacheMessages(contact.id, newMsgs); // Update cache
      setInputText('');
      setReplyTo(null);
      setShowEmojiKeyboard(false);

      if (socket) {
        socket.emit('message:send', res.message); // Emit the encrypted message structure
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([audioBlob], 'voicenote.webm', { type: 'audio/webm' });
        
        try {
          setUploading(true);
          const { fileUrl } = await api.uploadFile(file);
          const res = await api.sendMessage({
            receiverId: contact.isGroup ? undefined : contact.id, 
            chatId: contact.isGroup ? contact.id : undefined,
            text: '', 
            mediaType: 'audio', 
            fileUrl, 
            fileName: 'Voice Note'
          });
          const newMsgs = [...messages, res.message];
          setMessages(newMsgs);
          cacheMessages(contact.id, newMsgs);
        } catch (err) {
          alert('Failed to send voice note');
        } finally {
          setUploading(false);
          setIsRecording(false);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      alert('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      alert('File size exceeds 25MB limit.');
      return;
    }

    try {
      setUploading(true);

      let finalFile = file;
      if (file.type.startsWith('image/')) {
        try {
          const options = { maxSizeMB: 1, maxWidthOrHeight: 1280, useWebWorker: true };
          finalFile = await imageCompression(file, options);
        } catch (err) {
          console.error('Compression error:', err);
        }
      }

      const uploadRes = await api.uploadFile(finalFile);
      const fileUrl = uploadRes.file.url;
      const isImage = file.type.startsWith('image/');
      
      const res = await api.sendMessage({
        receiverId: contact.isGroup ? undefined : contact.id,
        chatId: contact.isGroup ? contact.id : undefined,
        text: file.name,
        mediaType: isImage ? 'image' : 'file',
        fileUrl,
        replyToId: replyTo?.id
      });
      
      const newMsgs = [...messages, res.message];
      setMessages(newMsgs);
      cacheMessages(contact.id, newMsgs); // Update cache
      setReplyTo(null);

      if (socket) {
        socket.emit('message:send', res.message);
      }
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleReact = async (messageId, emoji) => {
    try {
      const res = await api.reactToMessage(messageId, emoji);
      const newMsgs = messages.map((m) => (m.id === messageId ? res.message : m));
      setMessages(newMsgs);
      cacheMessages(contact.id, newMsgs);
      setShowEmojiPickerFor(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await api.deleteMessage(messageId);
      const newMsgs = messages.filter((m) => m.id !== messageId);
      setMessages(newMsgs);
      cacheMessages(contact.id, newMsgs);
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const emojis = ['??', '??', '??', '??', '??', '??', '??'];

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Determine Wallpaper Classes
  const wallpaperClass = () => {
    switch(user?.chat_wallpaper) {
      case 'solid_dark': return 'bg-[#111827] text-white';
      case 'solid_light': return 'bg-white text-slate-900';
      case 'doodle': return isDarkMode ? 'bg-[#0B141A] bg-[url("https://www.transparenttextures.com/patterns/cubes.png")] text-white' : 'bg-[#EFEAE2] bg-[url("https://www.transparenttextures.com/patterns/cubes.png")] text-slate-900';
      case 'default':
      default:
        return isDarkMode ? 'bg-[#080E18] text-white' : 'bg-[#EFEAE2] text-slate-900';
    }
  };
  const checkEmojiOnly = (msg) => {
    if (msg.mediaType !== 'text' || !msg.text) return false;
    let cleanText = msg.text.replace(/^_REPLY_\[\[.*?\]\]_REPLY_\s*/, '').trim();
    const noSpace = cleanText.replace(/\s/g, '');
    if (noSpace.length === 0 || Array.from(noSpace).length > 3) return false;
    const emojiRegex = /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Extended_Pictographic})+$/gu;
    return emojiRegex.test(noSpace);
  };

  const renderMessageText = (msg, isEmojiOnly) => {
    if (!msg.text) return null;
    let displayText = msg.text;
    let quote = null;
    
    // robust match for _REPLY_[[id|||senderId|||text]]_REPLY_
    const replyRegex = /^_REPLY_\[\[(.*?)\|\|\|(.*?)\|\|\|(.*?)\]\]_REPLY_\s*/;
    const match = displayText.match(replyRegex);
    if (match) {
      quote = { id: match[1], senderId: match[2], text: match[3] };
      displayText = displayText.substring(match[0].length);
    }

    return (
      <div className="flex flex-col">
        {quote && (
          <div 
            className={`mb-1.5 p-2 rounded-lg border-l-4 border-blue-400 bg-black/10 text-[11px] cursor-pointer`}
            onClick={(e) => {
              e.stopPropagation();
              // In MVP: just highlight, real app would scroll to message
            }}
          >
            <span className={`font-bold block mb-0.5 ${quote.senderId === user.id ? 'text-emerald-400' : 'text-blue-400'}`}>
              {quote.senderId === user.id ? 'You' : contact.name}
            </span>
            <span className="opacity-80 truncate block">{quote.text}</span>
          </div>
        )}
        {isEmojiOnly ? (
          <motion.p 
            initial={{ scale: 0 }}
            animate={{ scale: [1.2, 0.9, 1] }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className="leading-relaxed whitespace-pre-wrap text-6xl text-center py-2"
          >
            <motion.span
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-block"
            >
              {displayText}
            </motion.span>
          </motion.p>
        ) : (
          <p className="leading-relaxed whitespace-pre-wrap">{displayText}</p>
        )}
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-[100dvh] w-full max-w-md mx-auto relative animate-fade-in ${wallpaperClass()}`}>
      {/* Top Header / Action Bar / Search Bar */}
      {isSearching ? (
        <div className={`px-4 pb-3 pt-[max(env(safe-area-inset-top),0.75rem)] border-b flex items-center gap-3 z-10 shadow-sm shrink-0 ${isDarkMode ? 'bg-[#0D1524] border-slate-800' : 'bg-white border-slate-200'}`}>
          <button onClick={() => { setIsSearching(false); setSearchQuery(''); }} className="p-1 -ml-1 text-slate-400 hover:text-white rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <input 
            type="text"
            autoFocus
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm h-10 w-full rounded-xl px-4"
          />
        </div>
      ) : selectedMessage ? (
        <div className={`px-4 pb-3 pt-[max(env(safe-area-inset-top),0.75rem)] border-b flex items-center justify-between z-10 shadow-sm shrink-0 ${isDarkMode ? 'bg-[#0D1524] border-slate-800' : 'bg-slate-100 border-slate-300'}`}>
          <div className="flex items-center gap-4">
            <button onClick={() => setSelectedMessage(null)} className="p-1 -ml-1 text-slate-400 hover:text-white rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="font-bold text-lg">1</span>
          </div>
          <div className="flex items-center gap-5 text-slate-400">
            <button onClick={() => { setReplyTo(selectedMessage); setSelectedMessage(null); }} className="hover:text-white transition">
              <CornerUpLeft className="w-5 h-5" />
            </button>
            <button className="hover:text-white transition">
              <Star className="w-5 h-5" />
            </button>
            <button className="hover:text-white transition" onClick={() => {
              if (selectedMessage.senderId === user.id) {
                if(window.confirm('Delete this message?')) {
                  // For MVP, just remove from UI array (in real app, api.deleteMessage(id))
                  setMessages(messages.filter(m => m.id !== selectedMessage.id));
                  cacheMessages(contact.id, messages.filter(m => m.id !== selectedMessage.id));
                  setSelectedMessage(null);
                }
              } else {
                alert('You can only delete your own messages in this demo.');
              }
            }}>
              <Trash2 className="w-5 h-5" />
            </button>
            <button className="hover:text-white transition" onClick={() => {
              navigator.clipboard.writeText(selectedMessage.text);
              setSelectedMessage(null);
            }}>
              <Copy className="w-5 h-5" />
            </button>
            <button className="hover:text-white transition">
              <Forward className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className={`px-4 pb-3 pt-[max(env(safe-area-inset-top),0.75rem)] border-b flex items-center justify-between z-10 shadow-sm shrink-0 ${isDarkMode ? 'bg-[#0D1524] border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1 -ml-1 text-slate-400 hover:text-white rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="relative cursor-pointer" onClick={() => setShowProfile(true)}>
            <img
              src={contact.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop'}
              alt={contact.name}
              className="w-10 h-10 rounded-full object-cover shadow-sm"
            />
            {isPeerOnline && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0D1524]" />
            )}
          </div>

          <div className="flex flex-col cursor-pointer" onClick={() => setShowProfile(true)}>
            <h2 className="font-bold text-sm tracking-tight">{contact.name}</h2>
            <div className="text-[10px] min-h-[14px]">
              {isTyping ? (
                <span className="text-teal-400 font-medium animate-pulse">typing...</span>
              ) : isPeerOnline ? (
                <span className="text-emerald-400 font-medium">Online</span>
              ) : (
                <span className="text-slate-400">Offline</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => startVoiceCall(contact)}
            className="p-2 text-teal-400 hover:text-teal-300 bg-teal-500/10 rounded-full transition"
          >
            <Phone className="w-4 h-4" />
          </button>
          <button className="p-2 text-slate-400 hover:text-white transition">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>
      )}

      {/* Messages Area */}
      <div ref={containerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.filter(m => !isSearching || !searchQuery || (m.text && m.text.toLowerCase().includes(searchQuery.toLowerCase()))).map((m) => {
          const isMe = m.senderId === user.id;
          const isEmojiOnly = checkEmojiOnly(m);
          return (
            <SwipeableMessage 
              key={m.id} 
              isMe={isMe} 
              onReply={() => setReplyTo(m)}
              isSelected={selectedMessage?.id === m.id}
              onLongPress={() => setSelectedMessage(m)}
              onClick={() => {
                if (selectedMessage) {
                  if (selectedMessage.id === m.id) setSelectedMessage(null);
                  else setSelectedMessage(m);
                }
              }}
            >
              <div
                className={`p-3 rounded-2xl max-w-[85%] sm:max-w-[70%] text-xs relative ${
                    isEmojiOnly 
                    ? 'bg-transparent shadow-none' 
                    : isMe 
                      ? 'bg-blue-600 text-white rounded-br-none shadow-sm' 
                      : isDarkMode 
                        ? 'bg-[#131E33] text-slate-100 rounded-bl-none border border-slate-800 shadow-sm' 
                        : 'bg-white text-slate-900 rounded-bl-none border border-slate-200 shadow-sm'
                  }`}
              >
                {/* Media rendering */}
                {m.mediaType === 'image' && (
                  <div 
                    className="mb-2 rounded-xl overflow-hidden relative group cursor-pointer"
                    onClick={() => setViewerImage(m.fileUrl?.startsWith('http') ? m.fileUrl : `http://192.168.68.105:5000${m.fileUrl}`)}
                  >
                    <img
                      src={m.fileUrl?.startsWith('http') ? m.fileUrl : `http://192.168.68.105:5000${m.fileUrl}`}
                      alt="Uploaded media"
                      className="max-h-60 w-full object-cover rounded-xl"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <span className="text-xs font-semibold px-3 py-1.5 bg-black/50 rounded-full backdrop-blur-sm">Tap to view</span>
                    </div>
                  </div>
                )}

                {m.mediaType === 'file' && (
                  <a
                    href={m.fileUrl?.startsWith('http') ? m.fileUrl : `http://192.168.68.105:5000${m.fileUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className={`flex items-center gap-3 p-2.5 rounded-xl border mb-1.5 transition ${isMe ? 'bg-blue-700/60 border-blue-500/40 text-white' : 'bg-slate-800/40 border-slate-700 text-slate-200'}`}
                  >
                    <FileText className="w-6 h-6 text-teal-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[11px] truncate">{m.fileName || m.text}</p>
                      <p className="text-[10px] opacity-80">{formatFileSize(m.fileSize)} • Tap to download</p>
                    </div>
                    <Download className="w-4 h-4 opacity-80" />
                  </a>
                )}

                {m.mediaType === 'audio' && (
                  <div className="flex flex-col gap-1 mb-1.5">
                    <audio controls src={m.fileUrl?.startsWith('http') ? m.fileUrl : `http://192.168.68.105:5000${m.fileUrl}`} className="h-8 max-w-[200px]" />
                  </div>
                )}

                {m.mediaType === 'text' && (
                  renderMessageText(m, isEmojiOnly)
                )}

                {/* Footer Time & Status */}
                <div className={`flex items-center justify-end gap-1 text-[9px] mt-1 ${isEmojiOnly ? 'bg-black/10 text-slate-500 dark:bg-white/10 dark:text-slate-300 rounded-full px-2 py-0.5 inline-flex shadow-sm ml-auto' : `opacity-80 ${isMe ? 'text-blue-100' : 'text-slate-400'}`}`}>
                  <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {isMe && (
                    <span>
                      {m.status === 'read' ? (
                        <CheckCheck className="w-3.5 h-3.5 text-cyan-300" />
                      ) : m.status === 'delivered' ? (
                        <CheckCheck className="w-3.5 h-3.5" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                    </span>
                  )}
                </div>

                {/* Reactions badge */}
                {m.reactions && m.reactions.length > 0 && (
                  <div className="absolute -bottom-2 right-2 bg-[#0F1829] border border-slate-700 px-1.5 py-0.2 rounded-full text-[10px] shadow">
                    {m.reactions.map((r, i) => (
                      <span key={i}>{r.emoji}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Message Context Toolbar */}
              <div className="opacity-0 group-hover:opacity-100 transition flex items-center gap-1 mt-1 text-[10px] text-slate-400">
                <button
                  onClick={() => setShowEmojiPickerFor(showEmojiPickerFor === m.id ? null : m.id)}
                  className="p-1 hover:text-white"
                  title="React"
                >
                  <Smile className="w-3.5 h-3.5" />
                </button>
                {isMe && (
                  <button
                    onClick={() => handleDeleteMessage(m.id)}
                    className="p-1 hover:text-red-400"
                    title="Delete message"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Emoji Picker Popup */}
              {showEmojiPickerFor === m.id && (
                <div className="flex gap-1.5 p-2 bg-[#0F1829] border border-slate-700 rounded-full shadow-2xl z-20 mt-1">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleReact(m.id, emoji)}
                      className="hover:scale-125 transition text-sm"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </SwipeableMessage>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className={`pt-2 px-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] border-t shrink-0 flex flex-col relative ${
        isDarkMode ? 'bg-[#0D1524] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        {/* Emoji Keyboard Popup */}
        {showEmojiKeyboard && (
          <div className="absolute bottom-full left-0 mb-2 z-50">
            <EmojiPicker
              theme={isDarkMode ? 'dark' : 'light'}
              onEmojiClick={(emojiData) => setInputText(prev => prev + emojiData.emoji)}
              width="100%"
              height={350}
            />
          </div>
        )}

        {/* Reply Preview */}
        {replyTo && (
          <div className={`flex items-center justify-between p-2 mb-2 rounded-xl border-l-4 border-blue-500 ${isDarkMode ? 'bg-[#142036]' : 'bg-slate-100'}`}>
            <div className="flex-1 min-w-0 pr-2">
              <span className="text-[10px] font-bold text-blue-500">Replying to {replyTo.senderId === user.id ? 'yourself' : contact.name}</span>
              <p className="text-[11px] text-slate-400 truncate">{replyTo.text || replyTo.fileName || 'Media message'}</p>
            </div>
            <button type="button" onClick={() => setReplyTo(null)} className="p-1 text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex items-center gap-1">
          {/* Emoji Toggle Button */}
          <button
            type="button"
            onClick={() => setShowEmojiKeyboard(!showEmojiKeyboard)}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
            title="Add Emoji"
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* File attachment button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,image/*"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
            title="Attach Document or Photo (up to 25MB)"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onClick={() => setShowEmojiKeyboard(false)}
            onChange={handleInputChange}
            placeholder={uploading ? 'Uploading 25MB document to cloud...' : 'Type a message...'}
            disabled={uploading}
            className={`flex-1 px-4 py-2.5 rounded-2xl text-xs border focus:outline-none focus:border-blue-500 transition ${
              isDarkMode ? 'bg-[#142036] border-slate-700 text-white placeholder-slate-500' : 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-400'
            }`}
          />

          {/* Send / Mic Button */}
          {inputText.trim() ? (
            <button
              type="submit"
              disabled={uploading}
              className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-md shadow-blue-600/20 active:scale-95 transition disabled:opacity-40"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          ) : (
            <button
              type="button"
              onPointerDown={startRecording}
              onPointerUp={stopRecording}
              onPointerLeave={stopRecording}
              disabled={uploading}
              className={`p-2.5 rounded-full shadow-md active:scale-95 transition disabled:opacity-40 ${
                isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-teal-500 hover:bg-teal-400 text-white shadow-teal-500/20'
              }`}
            >
              {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}
        </form>
      </div>
      <ContactProfileScreen 
        isOpen={showProfile} 
        onClose={() => setShowProfile(false)} 
        contact={contact} 
        onStartCall={(isVideo) => { setShowProfile(false); isVideo ? startVideoCall(contact) : startVoiceCall(contact); }} 
        onSearchClick={() => setIsSearching(true)}
      />
      
      <ImageViewerModal 
        isOpen={!!viewerImage} 
        imageUrl={viewerImage} 
        onClose={() => setViewerImage(null)} 
      />
    </div>
  );
}
