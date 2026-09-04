const fs = require('fs');
const file = 'mobile/src/screens/main/ChatRoomScreen.jsx';
let content = fs.readFileSync('temp.js', 'utf8');

const returnStart = content.indexOf('return (\n    <div className={`flex flex-col h-[100dvh] w-full max-w-md mx-auto relative animate-fade-in ${wallpaperClass()}`}>');
if (returnStart === -1) {
  console.log("Could not find returnStart");
  process.exit(1);
}

const newReturn = `return (
    <div className={\`flex flex-col h-[100dvh] w-full max-w-md mx-auto relative animate-fade-in \${wallpaperClass()}\`}>
      {/* Top Header / Action Bar / Search Bar */}
      {isSearching ? (
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={\`px-4 pb-3 pt-[max(env(safe-area-inset-top),0.75rem)] flex items-center gap-3 z-20 shadow-md shrink-0 backdrop-blur-md \${isDarkMode ? 'bg-[#0D1524]/90 border-b border-slate-800' : 'bg-white/90 border-b border-slate-200'}\`}
        >
          <button onClick={() => { setIsSearching(false); setSearchQuery(''); }} className="p-2 -ml-2 text-slate-400 hover:text-blue-400 rounded-full hover:bg-white/5 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className={\`flex-1 flex items-center gap-2 px-4 py-2 rounded-full border shadow-inner transition-colors \${isDarkMode ? 'bg-black/20 border-white/10 focus-within:border-blue-500' : 'bg-slate-100 border-slate-200 focus-within:border-blue-500'}\`}>
            <Search className="w-4 h-4 text-slate-400" />
            <input 
              type="text"
              autoFocus
              placeholder="Search in chat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm w-full"
            />
          </div>
        </motion.div>
      ) : selectedMessage ? (
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={\`px-4 pb-3 pt-[max(env(safe-area-inset-top),0.75rem)] flex items-center justify-between z-20 shadow-md shrink-0 backdrop-blur-md \${isDarkMode ? 'bg-[#0D1524]/90 border-b border-slate-800' : 'bg-white/90 border-b border-slate-300'}\`}
        >
          <div className="flex items-center gap-4">
            <button onClick={() => setSelectedMessage(null)} className="p-2 -ml-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white font-bold text-xs shadow-sm">1</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <button onClick={() => { setReplyTo(selectedMessage); setSelectedMessage(null); }} className="p-2 hover:text-white hover:bg-white/5 rounded-full transition-colors">
              <CornerUpLeft className="w-5 h-5" />
            </button>
            <button className="p-2 hover:text-white hover:bg-white/5 rounded-full transition-colors">
              <Star className="w-5 h-5" />
            </button>
            <button onClick={() => { handleDeleteMessage(selectedMessage.id); setSelectedMessage(null); }} className="p-2 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors">
              <Trash2 className="w-5 h-5" />
            </button>
            <button className="p-2 hover:text-white hover:bg-white/5 rounded-full transition-colors">
              <Copy className="w-5 h-5" />
            </button>
            <button className="p-2 hover:text-white hover:bg-white/5 rounded-full transition-colors">
              <Forward className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      ) : (
        <div className={\`px-3 pb-2 pt-[max(env(safe-area-inset-top),0.75rem)] flex items-center justify-between z-20 shadow-md shrink-0 backdrop-blur-md \${
          isDarkMode ? 'bg-[#0D1524]/85 border-b border-slate-800/50' : 'bg-white/85 border-b border-slate-200'
        }\`}>
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setShowProfile(true)}>
            <button onClick={(e) => { e.stopPropagation(); onBack(); }} className="p-2 -ml-1 text-slate-400 hover:text-blue-500 rounded-full transition">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="relative">
              <div className="p-[2px] rounded-full bg-gradient-to-tr from-blue-500 to-teal-400 shadow-sm">
                <img src={contact.avatar} alt={contact.name} className={\`w-10 h-10 rounded-full object-cover border-[1.5px] \${isDarkMode ? 'border-[#0D1524]' : 'border-white'}\`} />
              </div>
              {contact.onlineStatus === 'online' && (
                <div className="absolute bottom-0 right-0">
                  <span className={\`relative flex w-3.5 h-3.5 border-[2px] \${isDarkMode ? 'border-[#0D1524]' : 'border-white'} rounded-full\`}>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-full w-full bg-emerald-500"></span>
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <h2 className="font-bold text-base">{contact.name}</h2>
              {isTyping ? (
                <span className="text-xs text-teal-400 font-medium flex items-center gap-1">
                  typing
                  <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, times: [0, 0.5, 1] }}>.</motion.span>
                  <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, times: [0, 0.5, 1], delay: 0.2 }}>.</motion.span>
                  <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, times: [0, 0.5, 1], delay: 0.4 }}>.</motion.span>
                </span>
              ) : isPeerOnline ? (
                <span className="text-xs text-emerald-500 font-medium">Online</span>
              ) : (
                <span className="text-xs text-slate-400">Offline</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => startVoiceCall(contact)} 
              className={\`p-2.5 rounded-full shadow-sm \${isDarkMode ? 'bg-teal-500/10 text-teal-400 hover:bg-teal-500/20' : 'bg-teal-50 text-teal-600 hover:bg-teal-100'}\`}
            >
              <Phone className="w-4 h-4 fill-current" />
            </motion.button>
            <button className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Message List */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 relative z-0"
      >
        {loading && (
          <div className="flex justify-center p-4">
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          </div>
        )}
        
        {messages.map((m) => {
          const isMe = m.senderId === user.id;
          if (searchQuery && m.text && !m.text.toLowerCase().includes(searchQuery.toLowerCase())) return null;

          const isEmojiOnly = checkEmojiOnly(m.text);
          const isSelected = selectedMessage?.id === m.id;
          const showAvatar = !isMe && contact.isGroup; // Only group chats show avatars for incoming

          return (
            <SwipeableMessage
              key={m.id}
              isMe={isMe}
              isSelected={isSelected}
              onReply={() => setReplyTo(m)}
              onLongPress={() => setSelectedMessage(m)}
              onClick={() => {
                if (selectedMessage) {
                  setSelectedMessage(selectedMessage.id === m.id ? null : m);
                }
              }}
            >
              {isSelected && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent z-0 pointer-events-none -mx-4" style={{ width: '100vw', left: '50%', transform: 'translateX(-50%)' }} />
              )}
              {showAvatar && (
                <img src={m.senderAvatar || 'https://via.placeholder.com/40'} alt="Avatar" className="w-8 h-8 rounded-full mr-2 self-end mb-1 shadow-sm" />
              )}
              
              <div 
                className={\`relative max-w-[80%] group \${isEmojiOnly ? '' : 'px-3.5 py-2.5 shadow-sm'} \${
                  isEmojiOnly ? '' :
                  isMe 
                    ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-2xl rounded-br-none shadow-blue-600/20' 
                    : isDarkMode 
                      ? 'bg-[#16223B] border border-white/5 text-slate-100 rounded-2xl rounded-bl-none shadow-black/20' 
                      : 'bg-white text-slate-900 rounded-2xl rounded-bl-none shadow-md border border-slate-100'
                }\`}
              >
                {/* Image Attachment */}
                {m.mediaType === 'image' && m.fileUrl && (
                  <div className="relative mb-1.5 cursor-pointer group/img" onClick={() => setViewerImage(m.fileUrl.startsWith('http') ? m.fileUrl : \`http://192.168.68.105:5000\${m.fileUrl}\`)}>
                    <img 
                      src={m.fileUrl.startsWith('http') ? m.fileUrl : \`http://192.168.68.105:5000\${m.fileUrl}\`} 
                      alt="Attachment" 
                      className="rounded-xl w-full max-w-[240px] object-cover border border-white/10 shadow-sm"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition flex items-center justify-center rounded-xl">
                      <div className="px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white text-[10px] font-bold shadow-lg">Tap to view</div>
                    </div>
                  </div>
                )}

                {/* File Attachment */}
                {m.mediaType === 'file' && m.fileUrl && (
                  <div className={\`flex items-center gap-3 p-2.5 rounded-xl mb-1.5 hover:-translate-y-0.5 transition-transform cursor-pointer \${isMe ? 'bg-blue-700/50 border border-blue-500/50' : isDarkMode ? 'bg-slate-800/60 border border-slate-700' : 'bg-slate-50 border border-slate-200'}\`}>
                    <div className="p-2 rounded-full bg-teal-500/20 shadow-inner">
                      <FileText className="w-5 h-5 text-teal-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{m.fileName || 'Document'}</p>
                      <p className="text-[10px] opacity-70 mt-0.5">{formatFileSize(m.fileSize)} • {m.fileUrl.split('.').pop().toUpperCase()}</p>
                    </div>
                    <a href={m.fileUrl.startsWith('http') ? m.fileUrl : \`http://192.168.68.105:5000\${m.fileUrl}\`} target="_blank" rel="noreferrer" className="p-1.5 hover:bg-white/10 rounded-full transition">
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                )}

                {/* Audio Attachment */}
                {m.mediaType === 'audio' && m.fileUrl && (
                  <div className={\`flex flex-col gap-1 mb-1.5 rounded-full p-1 \${isMe ? 'bg-blue-700/30' : isDarkMode ? 'bg-slate-800/50' : 'bg-slate-100'}\`}>
                    <audio controls src={m.fileUrl?.startsWith('http') ? m.fileUrl : \`http://192.168.68.105:5000\${m.fileUrl}\`} className="h-8 max-w-[200px]" />
                  </div>
                )}

                {m.mediaType === 'text' && (
                  renderMessageText(m, isEmojiOnly)
                )}

                {/* Footer Time & Status */}
                <div className={\`flex items-center justify-end gap-1 text-[9px] mt-1 font-medium \${isEmojiOnly ? 'bg-black/10 text-slate-500 dark:bg-white/10 dark:text-slate-300 rounded-full px-2.5 py-1 inline-flex shadow-sm ml-auto backdrop-blur-sm' : \`opacity-90 \${isMe ? 'text-blue-100' : 'text-slate-400'}\`}\`}>
                  <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {isMe && (
                    <span>
                      {m.status === 'read' ? (
                        <CheckCheck className="w-3.5 h-3.5 text-cyan-300 drop-shadow-sm" />
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
                  <div className="absolute -bottom-2 -right-1 bg-white/10 backdrop-blur-md border border-white/20 px-1.5 py-0.5 rounded-full text-[10px] shadow-sm flex items-center gap-0.5 z-10">
                    {m.reactions.map((r, i) => (
                      <span key={i} className="drop-shadow-sm">{r.emoji}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Message Context Toolbar */}
              <div className="opacity-0 group-hover:opacity-100 transition flex items-center gap-1 mt-1 text-[10px] text-slate-400 px-2">
                <button
                  onClick={() => setShowEmojiPickerFor(showEmojiPickerFor === m.id ? null : m.id)}
                  className="p-1.5 rounded-full hover:bg-slate-800/50 hover:text-white transition-colors"
                  title="React"
                >
                  <Smile className="w-3.5 h-3.5" />
                </button>
                {isMe && (
                  <button
                    onClick={() => handleDeleteMessage(m.id)}
                    className="p-1.5 rounded-full hover:bg-red-500/20 hover:text-red-400 transition-colors"
                    title="Delete message"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Emoji Picker Popup */}
              <AnimatePresence>
                {showEmojiPickerFor === m.id && (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0, y: 10 }}
                    className="absolute flex gap-1.5 p-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full shadow-2xl z-20 mt-1 right-0"
                  >
                    {emojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleReact(m.id, emoji)}
                        className="hover:scale-125 hover:-translate-y-1 transition-all text-sm w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/20"
                      >
                        {emoji}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </SwipeableMessage>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className={\`pt-2 px-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] shrink-0 flex flex-col relative z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] backdrop-blur-md \${
        isDarkMode ? 'bg-[#0D1524]/90 border-t border-white/5' : 'bg-white/90 border-t border-slate-200'
      }\`}>
        {/* Emoji Keyboard Popup */}
        <AnimatePresence>
          {showEmojiKeyboard && (
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="absolute bottom-full left-0 mb-2 z-50 w-full shadow-2xl"
            >
              <EmojiPicker
                theme={isDarkMode ? 'dark' : 'light'}
                onEmojiClick={(emojiData) => setInputText(prev => prev + emojiData.emoji)}
                width="100%"
                height={350}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reply Preview */}
        <AnimatePresence>
          {replyTo && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className={\`relative flex items-center justify-between p-2 mb-2 rounded-xl overflow-hidden shadow-sm backdrop-blur-sm \${isDarkMode ? 'bg-white/5' : 'bg-slate-100/80'}\`}>
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-teal-400" />
                <div className="flex-1 min-w-0 pr-2 pl-2">
                  <span className="text-[10px] font-black text-blue-500 uppercase tracking-wide">Replying to {replyTo.senderId === user.id ? 'yourself' : contact.name}</span>
                  <p className={\`text-[11px] font-medium truncate \${isDarkMode ? 'text-slate-300' : 'text-slate-600'}\`}>{replyTo.text || replyTo.fileName || 'Media message'}</p>
                </div>
                <button type="button" onClick={() => setReplyTo(null)} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSendMessage} className="flex items-center gap-1.5">
          {/* Emoji Toggle Button */}
          <button
            type="button"
            onClick={() => setShowEmojiKeyboard(!showEmojiKeyboard)}
            className="p-2.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800/50 transition-colors"
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
            className="p-2.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800/50 transition-colors disabled:opacity-50"
            title="Attach Document or Photo (up to 25MB)"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Text Input */}
          <div className={\`flex-1 relative flex items-center rounded-2xl border shadow-inner transition-colors duration-300 focus-within:ring-2 focus-within:ring-teal-400/40 focus-within:border-teal-400/50 \${
            isDarkMode ? 'bg-black/20 border-white/10' : 'bg-slate-100 border-slate-200'
          }\`}>
            <input
              type="text"
              value={inputText}
              onClick={() => setShowEmojiKeyboard(false)}
              onChange={handleInputChange}
              placeholder={uploading ? 'Uploading document...' : 'Type a message...'}
              disabled={uploading}
              className={\`w-full px-4 py-3 bg-transparent text-sm outline-none transition-colors \${
                isDarkMode ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'
              }\`}
            />
          </div>

          {/* Send / Mic Button */}
          {inputText.trim() ? (
            <motion.button
              whileTap={{ scale: 0.9 }}
              type="submit"
              disabled={uploading}
              className="p-3 bg-gradient-to-tr from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white rounded-full shadow-[0_4px_15px_-5px_rgba(59,130,246,0.6)] transition-all disabled:opacity-40"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.9 }}
              type="button"
              onPointerDown={startRecording}
              onPointerUp={stopRecording}
              onPointerLeave={stopRecording}
              disabled={uploading}
              className={\`relative p-3 rounded-full transition-all disabled:opacity-40 flex items-center justify-center \${
                isRecording 
                  ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
                  : 'bg-gradient-to-tr from-teal-500 to-emerald-400 text-white shadow-[0_4px_15px_-5px_rgba(16,185,129,0.5)]'
              }\`}
            >
              {isRecording && (
                <div className="absolute inset-0 rounded-full border-2 border-red-400 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
              )}
              {isRecording ? <Square className="w-4 h-4 relative z-10" /> : <Mic className="w-4 h-4 relative z-10" />}
            </motion.button>
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
`;

content = content.substring(0, returnStart) + newReturn;

fs.writeFileSync(file, content);
console.log('Replaced return block');
