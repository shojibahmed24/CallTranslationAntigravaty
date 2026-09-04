const fs = require('fs');

const content = \import React, { useState, useEffect, useRef } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { 
  ArrowLeft, Phone, MoreVertical, Send, Paperclip, 
  Image as ImageIcon, FileText, Check, CheckCheck, 
  Smile, Trash2, Download, AlertCircle, X
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useCall } from '../../context/CallContext';
import { cacheMessages, getCachedMessages } from '../../services/db';

const SwipeableMessage = ({ children, isMe, onReply }) => {
  return (
    <div className={\\\lex \ group\\\}>
      {children}
    </div>
  );
};

export default function ChatRoomScreen({ contact, onBack }) {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const { startVoiceCall, socket } = useCall();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showEmojiKeyboard, setShowEmojiKeyboard] = useState(false);
  const [showEmojiPickerFor, setShowEmojiPickerFor] = useState(null);
  const [replyTo, setReplyTo] = useState(null);

  const [isTyping, setIsTyping] = useState(false);
  const [isPeerOnline, setIsPeerOnline] = useState(contact.onlineStatus === 'online');

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const cached = await getCachedMessages(contact.id);
      if (cached && cached.length > 0) setMessages(cached);
      
      const res = await api.getMessages(contact.id);
      setMessages(res.messages || []);
      await cacheMessages(contact.id, res.messages || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [contact.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!socket) return;
    const handleTyping = (data) => {
      if (data.senderId === contact.id) setIsTyping(data.isTyping);
    };
    const handlePresence = (data) => {
      if (data.userId === contact.id) setIsPeerOnline(data.status === 'online');
    };
    socket.on('typing:status', handleTyping);
    socket.on('user:presence_changed', handlePresence);
    return () => {
      socket.off('typing:status', handleTyping);
      socket.off('user:presence_changed', handlePresence);
    };
  }, [socket, contact.id]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (socket) {
      socket.emit('typing:start', { senderId: user.id, receiverId: contact.id });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing:stop', { senderId: user.id, receiverId: contact.id });
      }, 1500);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    if (socket && typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      socket.emit('typing:stop', { senderId: user.id, receiverId: contact.id });
    }
    try {
      const res = await api.sendMessage(contact.id, inputText, 'text', null, null, replyTo?.id);
      const newMsgs = [...messages, res.message];
      setMessages(newMsgs);
      cacheMessages(contact.id, newMsgs);
      setInputText('');
      setReplyTo(null);
      setShowEmojiKeyboard(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploading(true);
      const { fileUrl } = await api.uploadFile(file);
      const isImage = file.type.startsWith('image/');
      const res = await api.sendMessage(contact.id, '', isImage ? 'image' : 'document', fileUrl, file.name, replyTo?.id);
      const newMsgs = [...messages, res.message];
      setMessages(newMsgs);
      cacheMessages(contact.id, newMsgs);
      setReplyTo(null);
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
    if (bytes < 1024 * 1024) return \\\\ KB\\\;
    return \\\\ MB\\\;
  };

  return (
    <div className={\\\lex flex-col h-[100dvh] w-full max-w-md mx-auto relative animate-fade-in \\\\}>
      <div className={\\\px-4 pb-3 pt-[max(env(safe-area-inset-top),0.75rem)] border-b flex items-center justify-between z-10 shadow-sm shrink-0 \\\\}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1 -ml-1 text-slate-400 hover:text-white rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="relative">
            <img src={contact.avatar} alt={contact.name} className="w-10 h-10 rounded-full object-cover shadow-sm" />
            {isPeerOnline && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0D1524]" />}
          </div>
          <div className="flex flex-col">
            <h2 className="font-bold text-sm tracking-tight">{contact.name}</h2>
            <div className="text-[10px] min-h-[14px]">
              {isTyping ? <span className="text-teal-400 font-medium animate-pulse">typing...</span> : isPeerOnline ? <span className="text-emerald-400 font-medium">Online</span> : <span className="text-slate-400">Offline</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => startVoiceCall(contact)} className="p-2 text-teal-400 hover:text-teal-300 bg-teal-500/10 rounded-full transition"><Phone className="w-4 h-4" /></button>
          <button className="p-2 text-slate-400 hover:text-white transition"><MoreVertical className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m) => {
          const isMe = m.senderId === user.id;
          return (
            <SwipeableMessage key={m.id} isMe={isMe} onReply={() => setReplyTo(m)}>
              <div className={\\\p-3 rounded-2xl max-w-[85%] sm:max-w-[70%] text-xs shadow-sm relative \\\\}>
                {m.mediaType === 'image' && <div className="mb-2 rounded-xl overflow-hidden"><img src={\\\http://localhost:5000\\\\} alt="Uploaded media" className="max-h-60 w-full object-cover rounded-xl" /></div>}
                {m.mediaType === 'document' && (
                  <a href={\\\http://localhost:5000\\\\} target="_blank" rel="noreferrer" className={\\\lex items-center gap-3 p-2.5 rounded-xl border mb-1.5 transition \\\\}>
                    <FileText className="w-6 h-6 text-teal-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[11px] truncate">{m.fileName || m.text}</p>
                      <p className="text-[10px] opacity-80">{formatFileSize(m.fileSize)}</p>
                    </div>
                    <Download className="w-4 h-4 opacity-80" />
                  </a>
                )}
                {m.mediaType === 'text' && <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>}
                <div className={\\\lex items-center justify-end gap-1 text-[9px] mt-1 opacity-80 \\\\}>
                  <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {isMe && <span>{m.status === 'read' ? <CheckCheck className="w-3.5 h-3.5 text-cyan-300" /> : m.status === 'delivered' ? <CheckCheck className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}</span>}
                </div>
              </div>
            </SwipeableMessage>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className={\\\pt-2 px-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] border-t shrink-0 flex flex-col relative \\\\}>
        {showEmojiKeyboard && (
          <div className="absolute bottom-full left-0 mb-2 z-50">
            <EmojiPicker theme={isDarkMode ? 'dark' : 'light'} onEmojiClick={(emojiData) => setInputText(prev => prev + emojiData.emoji)} width="100%" height={350} />
          </div>
        )}
        <form onSubmit={handleSendMessage} className="flex items-center gap-1">
          <button type="button" onClick={() => setShowEmojiKeyboard(!showEmojiKeyboard)} className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"><Smile className="w-5 h-5" /></button>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,image/*" />
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"><Paperclip className="w-5 h-5" /></button>
          <input type="text" value={inputText} onClick={() => setShowEmojiKeyboard(false)} onChange={handleInputChange} placeholder={uploading ? 'Uploading...' : 'Type a message...'} disabled={uploading} className={\\\lex-1 px-4 py-2.5 rounded-2xl text-xs border focus:outline-none focus:border-blue-500 transition \\\\} />
          <button type="submit" disabled={!inputText.trim() || uploading} className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl shadow-md shadow-blue-600/20 active:scale-95 transition disabled:opacity-40"><Send className="w-4 h-4" /></button>
        </form>
      </div>
    </div>
  );
}
\;

fs.writeFileSync('mobile/src/screens/main/ChatRoomScreen.jsx', content);
