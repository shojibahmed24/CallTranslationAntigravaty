const fs = require('fs');
const file = 'mobile/src/screens/main/ChatRoomScreen.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Replace wallpaperClass
const oldWallpaperClass = `const wallpaperClass = () => {
    switch(user?.chat_wallpaper) {
      case 'solid_dark': return 'bg-[#111827] text-white';
      case 'solid_light': return 'bg-white text-slate-900';
      case 'doodle': return isDarkMode ? 'bg-[#0B141A] bg-[url("https://www.transparenttextures.com/patterns/cubes.png")] text-white' : 'bg-[#EFEAE2] bg-[url("https://www.transparenttextures.com/patterns/cubes.png")] text-slate-900';
      case 'default':
      default:
        return isDarkMode ? 'bg-[#080E18] text-white' : 'bg-[#EFEAE2] text-slate-900';
    }
  };`;

const newWallpaperClass = `const wallpaperClass = () => {
    switch(user?.chat_wallpaper) {
      case 'solid_dark': return 'bg-[#111827] text-white';
      case 'solid_light': return 'bg-[#F8FAFC] text-slate-900';
      case 'doodle': return isDarkMode ? 'bg-[#0B141A] bg-[url("https://www.transparenttextures.com/patterns/cubes.png")] opacity-90 text-white' : 'bg-[#EFEAE2] bg-[url("https://www.transparenttextures.com/patterns/cubes.png")] opacity-80 text-slate-900';
      case 'default':
      default:
        return isDarkMode ? 'bg-gradient-to-b from-[#0B1220] to-[#0F1829] text-white' : 'bg-gradient-to-b from-[#F8FAFC] to-[#EFEAE2] text-slate-900';
    }
  };`;

content = content.replace(oldWallpaperClass, newWallpaperClass);

// 2. Replace renderMessageText
const renderStart = content.indexOf('const renderMessageText = (msg, isEmojiOnly) => {');
const renderEnd = content.indexOf('};', renderStart + 500) + 2;
const oldRender = content.substring(renderStart, renderEnd);

const newRender = `const renderMessageText = (msg, isEmojiOnly) => {
    if (!msg.text) return null;
    let displayText = msg.text;
    let quote = null;
    
    // robust match for _REPLY_[[id|||senderId|||text]]_REPLY_
    const replyRegex = /^[_]+REPLY[_]+\\[\\[(.*?)\\|\\|\\|(.*?)\\|\\|\\|(.*?)\\]\\][_]+REPLY[_]+\\s*/;
    const match = displayText.match(replyRegex);
    if (match) {
      quote = { id: match[1], senderId: match[2], text: match[3] };
      displayText = displayText.substring(match[0].length);
    }

    return (
      <div className="flex flex-col">
        {quote && (
          <div 
            className={\`relative mb-2 p-2.5 rounded-lg overflow-hidden text-[11px] cursor-pointer shadow-sm \${msg.senderId === user.id ? 'bg-blue-900/30' : isDarkMode ? 'bg-[#1E2C4A]/80' : 'bg-slate-100/90'}\`}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div className={\`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b \${quote.senderId === user.id ? 'from-emerald-400 to-teal-500' : 'from-blue-400 to-indigo-500'}\`} />
            <span className={\`font-black block mb-0.5 ml-1 \${quote.senderId === user.id ? 'text-emerald-400' : 'text-blue-400'}\`}>
              {quote.senderId === user.id ? 'You' : contact.name}
            </span>
            <span className={\`truncate block font-medium ml-1 \${isDarkMode ? 'text-slate-300' : 'text-slate-600'}\`}>{quote.text}</span>
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
              className="inline-block drop-shadow-lg"
            >
              {displayText}
            </motion.span>
          </motion.p>
        ) : (
          <p className="leading-relaxed whitespace-pre-wrap">{displayText}</p>
        )}
      </div>
    );
  };`;

content = content.replace(oldRender, newRender);

fs.writeFileSync('temp.js', content);
console.log('Replaced top parts');
